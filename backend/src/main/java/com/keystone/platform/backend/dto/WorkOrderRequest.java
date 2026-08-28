package com.keystone.platform.backend.dto;

import com.keystone.platform.backend.entity.WorkOrderPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record WorkOrderRequest(
        @NotNull Long customerId,
        @NotNull Long siteId,
        @NotBlank @Size(max = 200) String title,
        @Size(max = 4000) String description,
        @NotNull WorkOrderPriority priority,
        LocalDate scheduledDate,
        Integer estimatedDuration,
        @Size(max = 255) String location,
        @Size(max = 4000) String notes
) {
}
