package com.keystone.platform.backend.dto;

public record WorkOrderSummaryReport(
        long total,
        long newCount,
        long assigned,
        long scheduled,
        long inProgress,
        long completed,
        long cancelled,
        long onHold
) {
}
