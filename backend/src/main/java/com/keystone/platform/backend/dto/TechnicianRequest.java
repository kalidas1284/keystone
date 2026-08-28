package com.keystone.platform.backend.dto;

import com.keystone.platform.backend.entity.AvailabilityStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record TechnicianRequest(
        @NotNull Long userId,
        @NotBlank @Size(max = 50) String employeeCode,
        @Size(max = 30) String phone,
        @Size(max = 120) String specialization,
        AvailabilityStatus availabilityStatus,
        @Size(max = 255) String currentLocation
) {
}
