package com.keystone.platform.backend.dto;

import com.keystone.platform.backend.entity.AvailabilityStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateTechnicianAccountRequest(
        @NotBlank @Size(max = 120) String fullName,
        @NotBlank @Email @Size(max = 180) String email,
        @NotBlank @Size(min = 8, max = 100) String password,
        @NotBlank @Size(max = 50) String employeeCode,
        @Size(max = 30) String phone,
        @Size(max = 120) String specialization,
        AvailabilityStatus availabilityStatus,
        @Size(max = 255) String currentLocation
) {
}
