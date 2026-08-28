package com.keystone.platform.backend.dto;

import java.math.BigDecimal;

public record InventoryReport(
        long totalItems,
        long lowStock,
        long outOfStock,
        BigDecimal stockValue
) {
}
