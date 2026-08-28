package com.keystone.platform.backend.dto;

import com.keystone.platform.backend.entity.Schedule;
import com.keystone.platform.backend.entity.ScheduleStatus;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

public record ScheduleResponse(
        Long id,
        Long workOrderId,
        String workOrderNumber,
        String workOrderTitle,
        Long technicianId,
        String technicianName,
        LocalDate scheduledDate,
        LocalTime startTime,
        LocalTime endTime,
        ScheduleStatus status,
        String notes,
        Instant createdAt,
        Instant updatedAt
) {
    public static ScheduleResponse from(Schedule schedule) {
        return new ScheduleResponse(
                schedule.getId(),
                schedule.getWorkOrder().getId(),
                schedule.getWorkOrder().getWorkOrderNumber(),
                schedule.getWorkOrder().getTitle(),
                schedule.getTechnician().getId(),
                schedule.getTechnician().getUser().getFullName(),
                schedule.getScheduledDate(),
                schedule.getStartTime(),
                schedule.getEndTime(),
                schedule.getStatus(),
                schedule.getNotes(),
                schedule.getCreatedAt(),
                schedule.getUpdatedAt()
        );
    }
}
