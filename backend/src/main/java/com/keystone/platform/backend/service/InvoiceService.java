package com.keystone.platform.backend.service;

import com.keystone.platform.backend.dto.InvoiceResponse;
import com.keystone.platform.backend.dto.UpdateInvoiceStatusRequest;
import com.keystone.platform.backend.entity.Invoice;
import com.keystone.platform.backend.entity.InvoiceLine;
import com.keystone.platform.backend.entity.InvoiceLineType;
import com.keystone.platform.backend.entity.InvoiceStatus;
import com.keystone.platform.backend.entity.WorkOrder;
import com.keystone.platform.backend.entity.WorkOrderPart;
import com.keystone.platform.backend.entity.WorkOrderStatus;
import com.keystone.platform.backend.entity.WorkOrderTimeLog;
import com.keystone.platform.backend.exception.DuplicateResourceException;
import com.keystone.platform.backend.exception.ResourceNotFoundException;
import com.keystone.platform.backend.exception.ValidationException;
import com.keystone.platform.backend.repository.InvoiceRepository;
import com.keystone.platform.backend.repository.WorkOrderPartRepository;
import com.keystone.platform.backend.repository.WorkOrderTimeLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Year;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final WorkOrderService workOrderService;
    private final WorkOrderTimeLogRepository timeLogRepository;
    private final WorkOrderPartRepository partRepository;
    private final NotificationService notificationService;

    @Value("${app.invoice.labor-rate:85.00}")
    private BigDecimal laborRate;

    @Transactional(readOnly = true)
    public List<InvoiceResponse> list() {
        return invoiceRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(InvoiceResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public InvoiceResponse findById(Long id) {
        return InvoiceResponse.from(getInvoice(id));
    }

    @Transactional(readOnly = true)
    public InvoiceResponse findByWorkOrder(Long workOrderId) {
        return invoiceRepository.findByWorkOrderId(workOrderId)
                .map(InvoiceResponse::from)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found for work order"));
    }

    @Transactional
    public InvoiceResponse generateFromWorkOrder(Long workOrderId) {
        WorkOrder workOrder = workOrderService.getWorkOrder(workOrderId);
        if (workOrder.getStatus() != WorkOrderStatus.COMPLETED) {
            throw new ValidationException("Invoices can only be generated for COMPLETED work orders");
        }
        if (invoiceRepository.existsByWorkOrderId(workOrderId)) {
            throw new DuplicateResourceException("Invoice already exists for this work order");
        }

        List<WorkOrderTimeLog> logs = timeLogRepository.findByWorkOrderIdOrderByCreatedAtDesc(workOrderId);
        List<WorkOrderPart> parts = partRepository.findByWorkOrderIdOrderByCreatedAtDesc(workOrderId);

        // Spec tracks minutes; invoices (if enabled) bill by hours, so convert here.
        BigDecimal totalMinutes = logs.stream()
                .map(WorkOrderTimeLog::getMinutes)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalHours = totalMinutes.divide(BigDecimal.valueOf(60), 4, RoundingMode.HALF_UP);
        BigDecimal rate = laborRate != null ? laborRate : new BigDecimal("85.00");

        Invoice invoice = Invoice.builder()
                .invoiceNumber(generateInvoiceNumber())
                .workOrder(workOrder)
                .customer(workOrder.getCustomer())
                .status(InvoiceStatus.DRAFT)
                .notes("Generated from " + workOrder.getWorkOrderNumber())
                .lines(new ArrayList<>())
                .build();

        BigDecimal laborAmount = BigDecimal.ZERO;
        if (totalHours.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal lineTotal = totalHours.multiply(rate).setScale(2, RoundingMode.HALF_UP);
            InvoiceLine laborLine = InvoiceLine.builder()
                    .invoice(invoice)
                    .lineType(InvoiceLineType.LABOR)
                    .description("Labor (" + totalHours + " hrs @ $" + rate + "/hr)")
                    .quantity(totalHours)
                    .unitPrice(rate)
                    .lineTotal(lineTotal)
                    .build();
            invoice.getLines().add(laborLine);
            laborAmount = lineTotal;
        }

        BigDecimal partsAmount = BigDecimal.ZERO;
        for (WorkOrderPart part : parts) {
            BigDecimal unit = part.getInventoryItem().getUnitPrice() != null
                    ? part.getInventoryItem().getUnitPrice()
                    : BigDecimal.ZERO;
            BigDecimal qty = BigDecimal.valueOf(part.getQuantity());
            BigDecimal lineTotal = unit.multiply(qty).setScale(2, RoundingMode.HALF_UP);
            InvoiceLine partLine = InvoiceLine.builder()
                    .invoice(invoice)
                    .lineType(InvoiceLineType.PART)
                    .description(part.getInventoryItem().getItemCode() + " — " + part.getInventoryItem().getName())
                    .quantity(qty)
                    .unitPrice(unit)
                    .lineTotal(lineTotal)
                    .build();
            invoice.getLines().add(partLine);
            partsAmount = partsAmount.add(lineTotal);
        }

        if (invoice.getLines().isEmpty()) {
            InvoiceLine fallback = InvoiceLine.builder()
                    .invoice(invoice)
                    .lineType(InvoiceLineType.OTHER)
                    .description("Service charge — " + workOrder.getTitle())
                    .quantity(BigDecimal.ONE)
                    .unitPrice(rate)
                    .lineTotal(rate)
                    .build();
            invoice.getLines().add(fallback);
            laborAmount = rate;
        }

        invoice.setLaborAmount(laborAmount);
        invoice.setPartsAmount(partsAmount);
        invoice.setTotalAmount(laborAmount.add(partsAmount));

        return InvoiceResponse.from(invoiceRepository.save(invoice));
    }

    @Transactional
    public InvoiceResponse updateStatus(Long id, UpdateInvoiceStatusRequest request) {
        Invoice invoice = getInvoice(id);
        InvoiceStatus previous = invoice.getStatus();
        InvoiceStatus next = request.status();
        validateStatusChange(previous, next);
        invoice.setStatus(next);
        Invoice saved = invoiceRepository.save(invoice);
        if (previous != InvoiceStatus.SENT && next == InvoiceStatus.SENT) {
            notifyCustomerInvoiceSent(saved);
        }
        return InvoiceResponse.from(saved);
    }

    private void notifyCustomerInvoiceSent(Invoice invoice) {
        if (invoice.getCustomer() == null || invoice.getCustomer().getUser() == null) {
            return;
        }
        notificationService.notifyUser(
                invoice.getCustomer().getUser(),
                "Invoice ready",
                invoice.getInvoiceNumber() + " for " + invoice.getWorkOrder().getWorkOrderNumber()
                        + " — $" + invoice.getTotalAmount(),
                "INVOICE",
                "/portal/invoices/" + invoice.getId()
        );
    }

    private void validateStatusChange(InvoiceStatus from, InvoiceStatus to) {
        if (from == to) {
            return;
        }
        if (from == InvoiceStatus.VOID) {
            throw new ValidationException("Void invoices cannot change status");
        }
        if (from == InvoiceStatus.PAID && to != InvoiceStatus.VOID) {
            throw new ValidationException("Paid invoices can only be voided");
        }
        if (from == InvoiceStatus.DRAFT && !EnumSet.of(InvoiceStatus.SENT, InvoiceStatus.VOID).contains(to)) {
            throw new ValidationException("Draft invoices can move to SENT or VOID");
        }
        if (from == InvoiceStatus.SENT && !EnumSet.of(InvoiceStatus.PAID, InvoiceStatus.VOID, InvoiceStatus.DRAFT).contains(to)) {
            throw new ValidationException("Sent invoices can move to PAID, DRAFT, or VOID");
        }
    }

    private Invoice getInvoice(Long id) {
        return invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with id: " + id));
    }

    private String generateInvoiceNumber() {
        int year = Year.now().getValue();
        long next = invoiceRepository.count() + 1;
        return String.format("INV-%d-%05d", year, next);
    }
}
