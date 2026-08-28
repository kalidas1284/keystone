package com.keystone.platform.backend.dto;

import com.keystone.platform.backend.entity.WorkOrderTimeLog;

import java.math.BigDecimal;
import java.time.Instant;

public record TimeLogResponse(
        Long id,
        Long workOrderId,
        Long loggedById,
        String loggedByName,
        BigDecimal minutes,
        String notes,
        Instant createdAt
) {
    public static TimeLogResponse from(WorkOrderTimeLog log) {
        return new TimeLogResponse(
                log.getId(),
                log.getWorkOrder().getId(),
                log.getLoggedBy().getId(),
                log.getLoggedBy().getFullName(),
                log.getMinutes(),
                log.getNotes(),
                log.getCreatedAt()
        );
    }
}
