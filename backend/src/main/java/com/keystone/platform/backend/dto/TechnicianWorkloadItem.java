package com.keystone.platform.backend.dto;

public record TechnicianWorkloadItem(
        Long technicianId,
        String technicianName,
        long assignedJobs,
        long completedJobs,
        long activeJobs
) {
}
