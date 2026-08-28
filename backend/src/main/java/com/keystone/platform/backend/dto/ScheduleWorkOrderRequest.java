package com.keystone.platform.backend.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;

public record ScheduleWorkOrderRequest(
        @NotNull LocalDate scheduledDate,
        LocalTime startTime,
        LocalTime endTime,
        String notes
) {
}
