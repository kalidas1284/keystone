package com.keystone.platform.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record StockAdjustmentRequest(
        @NotNull @Min(1) Integer quantity,
        @Size(max = 120) String reference,
        @Size(max = 2000) String notes
) {
}
