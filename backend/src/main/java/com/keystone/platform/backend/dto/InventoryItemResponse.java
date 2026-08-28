package com.keystone.platform.backend.dto;

import com.keystone.platform.backend.entity.InventoryItem;

import java.math.BigDecimal;
import java.time.Instant;

public record InventoryItemResponse(
        Long id,
        String itemCode,
        String name,
        String description,
        String category,
        Integer quantity,
        Integer minimumStock,
        BigDecimal unitPrice,
        String supplier,
        boolean active,
        String stockStatus,
        Instant createdAt,
        Instant updatedAt
) {
    public static InventoryItemResponse from(InventoryItem item) {
        String stockStatus;
        if (item.getQuantity() == 0) {
            stockStatus = "OUT_OF_STOCK";
        } else if (item.getQuantity() <= item.getMinimumStock()) {
            stockStatus = "LOW_STOCK";
        } else {
            stockStatus = "IN_STOCK";
        }

        return new InventoryItemResponse(
                item.getId(),
                item.getItemCode(),
                item.getName(),
                item.getDescription(),
                item.getCategory(),
                item.getQuantity(),
                item.getMinimumStock(),
                item.getUnitPrice(),
                item.getSupplier(),
                item.isActive(),
                stockStatus,
                item.getCreatedAt(),
                item.getUpdatedAt()
        );
    }
}
