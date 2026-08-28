package com.keystone.platform.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import com.keystone.platform.backend.entity.WorkOrderPriority;

public record PortalRequestCreate(
        @NotBlank @Size(max = 200) String title,
        @Size(max = 4000) String description,
        @NotNull WorkOrderPriority priority,
        @NotNull Long siteId,
        @Size(max = 255) String location,
        @Size(max = 4000) String notes
) {
}
