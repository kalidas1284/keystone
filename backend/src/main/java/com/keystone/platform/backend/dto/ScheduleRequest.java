package com.keystone.platform.backend.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;

public record ScheduleRequest(
        @NotNull Long workOrderId,
        @NotNull Long technicianId,
        @NotNull LocalDate scheduledDate,
        @NotNull LocalTime startTime,
        @NotNull LocalTime endTime,
        String notes
) {
}
