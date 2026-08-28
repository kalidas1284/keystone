package com.keystone.platform.backend.dto;

import com.keystone.platform.backend.entity.WorkOrderPart;

import java.time.Instant;

public record WorkOrderPartResponse(
        Long id,
        Long workOrderId,
        Long inventoryItemId,
        String itemCode,
        String itemName,
        Integer quantity,
        String notes,
        Instant createdAt
) {
    public static WorkOrderPartResponse from(WorkOrderPart part) {
        return new WorkOrderPartResponse(
                part.getId(),
                part.getWorkOrder().getId(),
                part.getInventoryItem().getId(),
                part.getInventoryItem().getItemCode(),
                part.getInventoryItem().getName(),
                part.getQuantity(),
                part.getNotes(),
                part.getCreatedAt()
        );
    }
}
