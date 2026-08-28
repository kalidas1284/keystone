package com.keystone.platform.backend.dto;

import com.keystone.platform.backend.entity.Invoice;
import com.keystone.platform.backend.entity.InvoiceLine;
import com.keystone.platform.backend.entity.InvoiceLineType;
import com.keystone.platform.backend.entity.InvoiceStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record InvoiceResponse(
        Long id,
        String invoiceNumber,
        Long workOrderId,
        String workOrderNumber,
        Long customerId,
        String customerName,
        InvoiceStatus status,
        BigDecimal laborAmount,
        BigDecimal partsAmount,
        BigDecimal totalAmount,
        String notes,
        List<InvoiceLineResponse> lines,
        Instant createdAt,
        Instant updatedAt
) {
    public record InvoiceLineResponse(
            Long id,
            InvoiceLineType lineType,
            String description,
            BigDecimal quantity,
            BigDecimal unitPrice,
            BigDecimal lineTotal
    ) {
        public static InvoiceLineResponse from(InvoiceLine line) {
            return new InvoiceLineResponse(
                    line.getId(),
                    line.getLineType(),
                    line.getDescription(),
                    line.getQuantity(),
                    line.getUnitPrice(),
                    line.getLineTotal()
            );
        }
    }

    public static InvoiceResponse from(Invoice invoice) {
        return new InvoiceResponse(
                invoice.getId(),
                invoice.getInvoiceNumber(),
                invoice.getWorkOrder().getId(),
                invoice.getWorkOrder().getWorkOrderNumber(),
                invoice.getCustomer().getId(),
                invoice.getCustomer().getName(),
                invoice.getStatus(),
                invoice.getLaborAmount(),
                invoice.getPartsAmount(),
                invoice.getTotalAmount(),
                invoice.getNotes(),
                invoice.getLines().stream().map(InvoiceLineResponse::from).toList(),
                invoice.getCreatedAt(),
                invoice.getUpdatedAt()
        );
    }
}
