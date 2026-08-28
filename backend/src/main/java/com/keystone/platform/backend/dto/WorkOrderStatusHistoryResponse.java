package com.keystone.platform.backend.dto;

import com.keystone.platform.backend.entity.WorkOrderStatusHistory;

import java.time.Instant;

public record WorkOrderStatusHistoryResponse(
        Long id,
        String fromStatus,
        String toStatus,
        String changedByName,
        Instant changedAt,
        String note
) {
    public static WorkOrderStatusHistoryResponse from(WorkOrderStatusHistory h) {
        return new WorkOrderStatusHistoryResponse(
                h.getId(),
                h.getFromStatus() != null ? h.getFromStatus().name() : null,
                h.getToStatus() != null ? h.getToStatus().name() : null,
                h.getChangedBy() != null ? h.getChangedBy().getFullName() : null,
                h.getChangedAt(),
                h.getNote()
        );
    }
}

