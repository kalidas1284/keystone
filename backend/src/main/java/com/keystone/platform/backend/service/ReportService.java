package com.keystone.platform.backend.service;

import com.keystone.platform.backend.dto.CustomerSummaryItem;
import com.keystone.platform.backend.dto.DashboardResponse;
import com.keystone.platform.backend.dto.InventoryItemResponse;
import com.keystone.platform.backend.dto.InventoryReport;
import com.keystone.platform.backend.dto.TechnicianWorkloadItem;
import com.keystone.platform.backend.dto.WorkOrderResponse;
import com.keystone.platform.backend.dto.WorkOrderSummaryReport;
import com.keystone.platform.backend.entity.Customer;
import com.keystone.platform.backend.entity.InventoryItem;
import com.keystone.platform.backend.entity.SlaStatus;
import com.keystone.platform.backend.entity.Technician;
import com.keystone.platform.backend.entity.WorkOrder;
import com.keystone.platform.backend.entity.WorkOrderPriority;
import com.keystone.platform.backend.entity.WorkOrderStatus;
import com.keystone.platform.backend.repository.CustomerRepository;
import com.keystone.platform.backend.repository.InventoryItemRepository;
import com.keystone.platform.backend.repository.TechnicianRepository;
import com.keystone.platform.backend.repository.WorkOrderRepository;
import com.keystone.platform.backend.util.SlaUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final CustomerRepository customerRepository;
    private final TechnicianRepository technicianRepository;
    private final WorkOrderRepository workOrderRepository;
    private final InventoryItemRepository inventoryItemRepository;

    // "Open work" excludes terminal states only.
    private static final List<WorkOrderStatus> TERMINAL = List.of(WorkOrderStatus.CLOSED, WorkOrderStatus.CANCELLED);
    private static final List<WorkOrderStatus> ACTIVE = List.of(
            WorkOrderStatus.ASSIGNED,
            WorkOrderStatus.SCHEDULED,
            WorkOrderStatus.IN_PROGRESS,
            WorkOrderStatus.ON_HOLD
    );

    @Transactional(readOnly = true)
    public DashboardResponse dashboard() {
        Map<String, Long> byStatus = new LinkedHashMap<>();
        for (WorkOrderStatus status : WorkOrderStatus.values()) {
            byStatus.put(status.name(), workOrderRepository.countByStatus(status));
        }

        List<TechnicianWorkloadItem> workload = technicianRepository.findAll().stream()
                .filter(Technician::isActive)
                .map(this::toWorkload)
                .toList();

        List<WorkOrderResponse> recent = workOrderRepository.findTop10ByOrderByCreatedAtDesc().stream()
                .map(WorkOrderResponse::from)
                .toList();

        List<InventoryItemResponse> lowStock = inventoryItemRepository.findLowStock().stream()
                .map(InventoryItemResponse::from)
                .toList();

        long slaBreached = 0;
        long slaAtRisk = 0;
        long slaOnTrack = 0;
        long slaMet = 0;
        for (WorkOrder workOrder : workOrderRepository.findAll()) {
            SlaStatus status = SlaUtils.resolveStatus(workOrder);
            switch (status) {
                case BREACHED -> slaBreached++;
                case AT_RISK -> slaAtRisk++;
                case ON_TRACK -> slaOnTrack++;
                case MET -> slaMet++;
            }
        }

        return new DashboardResponse(
                customerRepository.countByActiveTrue(),
                technicianRepository.countByActiveTrue(),
                workOrderRepository.countOpen(TERMINAL),
                workOrderRepository.countByStatus(WorkOrderStatus.COMPLETED),
                workOrderRepository.countByPriorityAndStatusNotIn(WorkOrderPriority.URGENT, TERMINAL),
                inventoryItemRepository.countLowStock() + inventoryItemRepository.countOutOfStock(),
                slaBreached,
                slaAtRisk,
                slaOnTrack,
                slaMet,
                recent,
                byStatus,
                workload,
                lowStock
        );
    }

    @Transactional(readOnly = true)
    public WorkOrderSummaryReport workOrderSummary() {
        return new WorkOrderSummaryReport(
                workOrderRepository.count(),
                workOrderRepository.countByStatus(WorkOrderStatus.NEW),
                workOrderRepository.countByStatus(WorkOrderStatus.ASSIGNED),
                workOrderRepository.countByStatus(WorkOrderStatus.SCHEDULED),
                workOrderRepository.countByStatus(WorkOrderStatus.IN_PROGRESS),
                workOrderRepository.countByStatus(WorkOrderStatus.COMPLETED),
                workOrderRepository.countByStatus(WorkOrderStatus.CANCELLED),
                workOrderRepository.countByStatus(WorkOrderStatus.ON_HOLD)
        );
    }

    @Transactional(readOnly = true)
    public List<TechnicianWorkloadItem> technicianWorkload() {
        return technicianRepository.findAll().stream().map(this::toWorkload).toList();
    }

    @Transactional(readOnly = true)
    public List<CustomerSummaryItem> customerSummary() {
        return customerRepository.findAll().stream().map(customer -> {
            long total = workOrderRepository.countByCustomerId(customer.getId());
            long completed = Arrays.asList(WorkOrderStatus.COMPLETED, WorkOrderStatus.CLOSED).stream()
                    .mapToLong(s -> workOrderRepository.countByCustomerIdAndStatus(customer.getId(), s))
                    .sum();
            long open = Arrays.stream(WorkOrderStatus.values())
                    .filter(s -> s != WorkOrderStatus.CLOSED && s != WorkOrderStatus.CANCELLED)
                    .mapToLong(s -> workOrderRepository.countByCustomerIdAndStatus(customer.getId(), s))
                    .sum();
            return new CustomerSummaryItem(customer.getId(), customer.getName(), total, completed, open);
        }).toList();
    }

    @Transactional(readOnly = true)
    public InventoryReport inventoryReport() {
        List<InventoryItem> activeItems = inventoryItemRepository.findAll().stream()
                .filter(InventoryItem::isActive)
                .toList();

        BigDecimal stockValue = activeItems.stream()
                .map(item -> item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new InventoryReport(
                inventoryItemRepository.countByActiveTrue(),
                inventoryItemRepository.countLowStock(),
                inventoryItemRepository.countOutOfStock(),
                stockValue
        );
    }

    private TechnicianWorkloadItem toWorkload(Technician technician) {
        long assigned = workOrderRepository.countByTechnicianId(technician.getId());
        long completed = Arrays.asList(WorkOrderStatus.COMPLETED, WorkOrderStatus.CLOSED).stream()
                .mapToLong(s -> workOrderRepository.countByTechnicianIdAndStatus(technician.getId(), s))
                .sum();
        long active = workOrderRepository.countByTechnicianIdAndStatusIn(technician.getId(), ACTIVE);
        return new TechnicianWorkloadItem(
                technician.getId(),
                technician.getUser().getFullName(),
                assigned,
                completed,
                active
        );
    }
}
