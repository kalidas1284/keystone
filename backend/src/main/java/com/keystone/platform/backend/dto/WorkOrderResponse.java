package com.keystone.platform.backend.dto;

import com.keystone.platform.backend.entity.SlaStatus;
import com.keystone.platform.backend.entity.WorkOrder;
import com.keystone.platform.backend.entity.WorkOrderPriority;
import com.keystone.platform.backend.entity.WorkOrderStatus;
import com.keystone.platform.backend.util.SlaUtils;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record WorkOrderResponse(
        Long id,
        String workOrderNumber,
        Long customerId,
        String customerName,
        Long siteId,
        String title,
        String description,
        WorkOrderPriority priority,
        WorkOrderStatus status,
        Long technicianId,
        String technicianName,
        LocalDate scheduledDate,
        Integer estimatedDuration,
        String location,
        String notes,
        Instant slaDueAt,
        SlaStatus slaStatus,
        Instant createdAt,
        Instant updatedAt,
        Instant completedAt,
        BigDecimal totalPartsAmount,
        BigDecimal totalLaborMinutes,
        List<WorkOrderStatusHistoryResponse> statusHistory
) {
    public static WorkOrderResponse from(WorkOrder workOrder) {
        var site = workOrder.getSite();

        BigDecimal totalLaborMinutes = BigDecimal.ZERO;
        if (workOrder.getTimeLogs() != null) {
            totalLaborMinutes = workOrder.getTimeLogs().stream()
                    .map(log -> log.getMinutes() != null ? log.getMinutes() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
        }

        BigDecimal totalPartsAmount = BigDecimal.ZERO;
        if (workOrder.getParts() != null) {
            totalPartsAmount = workOrder.getParts().stream()
                    .map(part -> {
                        var unitPrice = part.getInventoryItem() != null ? part.getInventoryItem().getUnitPrice() : null;
                        var qty = part.getQuantity();
                        if (unitPrice == null || qty == null) return BigDecimal.ZERO;
                        return unitPrice.multiply(BigDecimal.valueOf(qty));
                    })
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
        }

        return new WorkOrderResponse(
                workOrder.getId(),
                workOrder.getWorkOrderNumber(),
                workOrder.getCustomer().getId(),
                workOrder.getCustomer().getName(),
                site != null ? site.getId() : null,
                workOrder.getTitle(),
                workOrder.getDescription(),
                workOrder.getPriority(),
                workOrder.getStatus(),
                workOrder.getTechnician() != null ? workOrder.getTechnician().getId() : null,
                workOrder.getTechnician() != null ? workOrder.getTechnician().getUser().getFullName() : null,
                workOrder.getScheduledDate(),
                workOrder.getEstimatedDuration(),
                workOrder.getLocation(),
                workOrder.getNotes(),
                workOrder.getSlaDueAt(),
                SlaUtils.resolveStatus(workOrder),
                workOrder.getCreatedAt(),
                workOrder.getUpdatedAt(),
                workOrder.getCompletedAt(),
                totalPartsAmount,
                totalLaborMinutes,
                workOrder.getStatusHistory() == null
                        ? List.of()
                        : workOrder.getStatusHistory().stream()
                            .map(WorkOrderStatusHistoryResponse::from)
                            .toList()
        );
    }
}
