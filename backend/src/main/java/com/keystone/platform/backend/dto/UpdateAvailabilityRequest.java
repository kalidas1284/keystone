package com.keystone.platform.backend.dto;

import com.keystone.platform.backend.entity.AvailabilityStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateAvailabilityRequest(
        @NotNull AvailabilityStatus availabilityStatus
) {
}
