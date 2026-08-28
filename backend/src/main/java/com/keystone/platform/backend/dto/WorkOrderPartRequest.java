package com.keystone.platform.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record WorkOrderPartRequest(
        @NotNull Long inventoryItemId,
        @NotNull @Min(1) Integer quantity,
        @Size(max = 2000) String notes
) {
}
