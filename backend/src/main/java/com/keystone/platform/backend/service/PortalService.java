package com.keystone.platform.backend.service;

import com.keystone.platform.backend.dto.InvoiceResponse;
import com.keystone.platform.backend.dto.PortalRequestCreate;
import com.keystone.platform.backend.dto.PortalWorkOrderResponse;
import com.keystone.platform.backend.dto.SiteResponse;
import com.keystone.platform.backend.entity.InvoiceStatus;
import com.keystone.platform.backend.entity.Customer;
import com.keystone.platform.backend.entity.Role;
import com.keystone.platform.backend.entity.User;
import com.keystone.platform.backend.entity.WorkOrder;
import com.keystone.platform.backend.entity.WorkOrderStatus;
import com.keystone.platform.backend.exception.ForbiddenException;
import com.keystone.platform.backend.exception.ResourceNotFoundException;
import com.keystone.platform.backend.exception.ValidationException;
import com.keystone.platform.backend.repository.CustomerRepository;
import com.keystone.platform.backend.repository.InvoiceRepository;
import com.keystone.platform.backend.repository.SiteRepository;
import com.keystone.platform.backend.repository.UserRepository;
import com.keystone.platform.backend.repository.WorkOrderRepository;
import com.keystone.platform.backend.util.SecurityUtils;
import com.keystone.platform.backend.util.SlaUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.Year;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PortalService {

    private final CustomerRepository customerRepository;
    private final WorkOrderRepository workOrderRepository;
    private final SiteRepository siteRepository;
    private final UserRepository userRepository;
    private final InvoiceRepository invoiceRepository;
    private final SecurityUtils securityUtils;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public List<PortalWorkOrderResponse> myRequests() {
        Customer customer = currentCustomer();
        return workOrderRepository.findByCustomerIdOrderByCreatedAtDesc(customer.getId()).stream()
                .map(PortalWorkOrderResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public PortalWorkOrderResponse getRequest(Long id) {
        WorkOrder workOrder = workOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Request not found"));
        ensureOwns(workOrder);
        return PortalWorkOrderResponse.from(workOrder);
    }

    @Transactional(readOnly = true)
    public List<SiteResponse> mySites() {
        Customer customer = currentCustomer();
        return siteRepository.findByCustomerIdOrderByCreatedAtDesc(customer.getId()).stream()
                .map(SiteResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<InvoiceResponse> myInvoices() {
        Customer customer = currentCustomer();
        return invoiceRepository.findByCustomerIdOrderByCreatedAtDesc(customer.getId()).stream()
                .filter(inv -> inv.getStatus() != InvoiceStatus.DRAFT && inv.getStatus() != InvoiceStatus.VOID)
                .map(InvoiceResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public InvoiceResponse getInvoice(Long id) {
        Customer customer = currentCustomer();
        return invoiceRepository.findById(id)
                .filter(inv -> inv.getCustomer().getId().equals(customer.getId()))
                .filter(inv -> inv.getStatus() != InvoiceStatus.DRAFT && inv.getStatus() != InvoiceStatus.VOID)
                .map(InvoiceResponse::from)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));
    }

    @Transactional
    public PortalWorkOrderResponse createRequest(PortalRequestCreate request) {
        Customer customer = currentCustomer();
        if (!customer.isActive()) {
            throw new ValidationException("Customer account is inactive");
        }

        Instant now = Instant.now();
        var site = siteRepository.findByIdAndCustomerId(request.siteId(), customer.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Site not found for customer"));
        WorkOrder workOrder = WorkOrder.builder()
                .workOrderNumber(generateWorkOrderNumber())
                .customer(customer)
                .site(site)
                .title(request.title().trim())
                .description(request.description())
                .priority(request.priority())
                .status(WorkOrderStatus.NEW)
                .location(request.location() != null && !request.location().isBlank() ? request.location().trim() : site.getLocation())
                .notes(request.notes())
                .estimatedDuration(60)
                .slaDueAt(SlaUtils.calculateDueAt(request.priority(), now))
                .build();

        WorkOrder saved = workOrderRepository.save(workOrder);

        List<User> recipients = new ArrayList<>();
        recipients.addAll(userRepository.findByRoleAndActiveTrue(Role.DISPATCHER));
        if (recipients.isEmpty()) {
            recipients.addAll(userRepository.findByRoleAndActiveTrue(Role.ADMIN));
        }
        recipients.forEach(user -> notificationService.notifyUser(
                user,
                "New customer service request",
                saved.getWorkOrderNumber() + " — " + saved.getTitle(),
                "PORTAL_REQUEST",
                "/work-orders/" + saved.getId()
        ));

        return PortalWorkOrderResponse.from(saved);
    }

    private Customer currentCustomer() {
        User user = securityUtils.currentUser();
        if (user.getRole() != Role.CUSTOMER) {
            throw new ForbiddenException("Customer portal access only");
        }
        return customerRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found for this account"));
    }

    private void ensureOwns(WorkOrder workOrder) {
        Customer customer = currentCustomer();
        if (!workOrder.getCustomer().getId().equals(customer.getId())) {
            throw new ForbiddenException("You can only access your own service requests");
        }
    }

    private String generateWorkOrderNumber() {
        int year = Year.now().getValue();
        long next = workOrderRepository.count() + 1;
        return String.format("WO-%d-%05d", year, next);
    }
}
