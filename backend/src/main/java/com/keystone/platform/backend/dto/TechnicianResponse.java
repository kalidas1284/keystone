package com.keystone.platform.backend.dto;

import com.keystone.platform.backend.entity.AvailabilityStatus;
import com.keystone.platform.backend.entity.Technician;

import java.time.Instant;

public record TechnicianResponse(
        Long id,
        Long userId,
        String fullName,
        String email,
        String employeeCode,
        String phone,
        String specialization,
        AvailabilityStatus availabilityStatus,
        String currentLocation,
        boolean active,
        Instant createdAt,
        Instant updatedAt
) {
    public static TechnicianResponse from(Technician technician) {
        return new TechnicianResponse(
                technician.getId(),
                technician.getUser().getId(),
                technician.getUser().getFullName(),
                technician.getUser().getEmail(),
                technician.getEmployeeCode(),
                technician.getPhone(),
                technician.getSpecialization(),
                technician.getAvailabilityStatus(),
                technician.getCurrentLocation(),
                technician.isActive(),
                technician.getCreatedAt(),
                technician.getUpdatedAt()
        );
    }
}
