package com.keystone.platform.backend.dto;

import java.util.List;
import java.util.Map;

public record DashboardResponse(
        long totalCustomers,
        long totalTechnicians,
        long openWorkOrders,
        long completedWorkOrders,
        long urgentWorkOrders,
        long lowStockItems,
        long slaBreached,
        long slaAtRisk,
        long slaOnTrack,
        long slaMet,
        List<WorkOrderResponse> recentWorkOrders,
        Map<String, Long> workOrdersByStatus,
        List<TechnicianWorkloadItem> technicianWorkload,
        List<InventoryItemResponse> lowStockList
) {
}
