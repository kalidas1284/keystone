package com.keystone.platform.backend.dto;

public record SiteSummaryItem(
        Long siteId,
        String siteName,
        String customerName,
        String location,
        long totalWorkOrders,
        long openWorkOrders
) {
}
