package com.keystone.platform.backend.util;

import com.keystone.platform.backend.entity.SlaStatus;
import com.keystone.platform.backend.entity.WorkOrder;
import com.keystone.platform.backend.entity.WorkOrderPriority;
import com.keystone.platform.backend.entity.WorkOrderStatus;

import java.time.Duration;
import java.time.Instant;

public final class SlaUtils {

    private SlaUtils() {
    }

    public static Instant calculateDueAt(WorkOrderPriority priority, Instant from) {
        Instant base = from != null ? from : Instant.now();
        long hours = switch (priority) {
            case URGENT -> 4;
            case HIGH -> 24;
            case MEDIUM -> 72;
            case LOW -> 168;
        };
        return base.plus(Duration.ofHours(hours));
    }

    public static SlaStatus resolveStatus(WorkOrder workOrder) {
        Instant dueAt = workOrder.getSlaDueAt();
        if (dueAt == null) {
            return SlaStatus.ON_TRACK;
        }

        if (workOrder.getStatus() == WorkOrderStatus.COMPLETED || workOrder.getStatus() == WorkOrderStatus.CLOSED) {
            Instant completedAt = workOrder.getCompletedAt() != null ? workOrder.getCompletedAt() : Instant.now();
            return completedAt.isAfter(dueAt) ? SlaStatus.BREACHED : SlaStatus.MET;
        }

        if (workOrder.getStatus() == WorkOrderStatus.CANCELLED) {
            return SlaStatus.MET;
        }

        Instant now = Instant.now();
        if (now.isAfter(dueAt)) {
            return SlaStatus.BREACHED;
        }

        long remainingMinutes = Duration.between(now, dueAt).toMinutes();
        long totalMinutes = Duration.between(workOrder.getCreatedAt(), dueAt).toMinutes();
        if (totalMinutes <= 0) {
            return SlaStatus.ON_TRACK;
        }

        // At risk when less than 25% of SLA window remains
        if (remainingMinutes <= totalMinutes * 0.25) {
            return SlaStatus.AT_RISK;
        }

        return SlaStatus.ON_TRACK;
    }
}
