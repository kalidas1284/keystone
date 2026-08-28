package com.keystone.platform.backend.dto;

public record CustomerSummaryItem(
        Long customerId,
        String customerName,
        long totalWorkOrders,
        long completedWorkOrders,
        long openWorkOrders
) {
}
