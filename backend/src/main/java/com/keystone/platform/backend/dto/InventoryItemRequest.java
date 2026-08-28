package com.keystone.platform.backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record InventoryItemRequest(
        @NotBlank @Size(max = 50) String itemCode,
        @NotBlank @Size(max = 150) String name,
        @Size(max = 2000) String description,
        @Size(max = 100) String category,
        @NotNull @Min(0) Integer quantity,
        @NotNull @Min(0) Integer minimumStock,
        @NotNull @DecimalMin("0.0") BigDecimal unitPrice,
        @Size(max = 150) String supplier
) {
}
