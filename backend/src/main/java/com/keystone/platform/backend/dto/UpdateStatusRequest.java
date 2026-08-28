package com.keystone.platform.backend.dto;

import com.keystone.platform.backend.entity.WorkOrderStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateStatusRequest(
        @NotNull WorkOrderStatus status,
        @Size(max = 4000) String notes
) {
}
