package com.keystone.platform.backend.dto;

import com.keystone.platform.backend.entity.SlaStatus;
import com.keystone.platform.backend.entity.WorkOrder;
import com.keystone.platform.backend.entity.WorkOrderPriority;
import com.keystone.platform.backend.entity.WorkOrderStatus;
import com.keystone.platform.backend.util.SlaUtils;

import java.time.Instant;
import java.util.List;

/**
 * Customer-safe work order view — excludes internal cost totals, notes, and IDs.
 */
public record PortalWorkOrderResponse(
        Long id,
        String workOrderNumber,
        String title,
        String description,
        WorkOrderPriority priority,
        WorkOrderStatus status,
        String location,
        Instant slaDueAt,
        SlaStatus slaStatus,
        Instant createdAt,
        Instant updatedAt,
        Instant completedAt,
        String technicianName,
        List<WorkOrderStatusHistoryResponse> statusHistory
) {
    public static PortalWorkOrderResponse from(WorkOrder workOrder) {
        return new PortalWorkOrderResponse(
                workOrder.getId(),
                workOrder.getWorkOrderNumber(),
                workOrder.getTitle(),
                workOrder.getDescription(),
                workOrder.getPriority(),
                workOrder.getStatus(),
                workOrder.getLocation(),
                workOrder.getSlaDueAt(),
                SlaUtils.resolveStatus(workOrder),
                workOrder.getCreatedAt(),
                workOrder.getUpdatedAt(),
                workOrder.getCompletedAt(),
                workOrder.getTechnician() != null ? workOrder.getTechnician().getUser().getFullName() : null,
                workOrder.getStatusHistory() == null
                        ? List.of()
                        : workOrder.getStatusHistory().stream()
                            .map(WorkOrderStatusHistoryResponse::from)
                            .toList()
        );
    }
}
