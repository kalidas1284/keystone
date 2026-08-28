package com.keystone.platform.backend.dto;

import jakarta.validation.constraints.NotNull;

public record AssignTechnicianRequest(
        @NotNull Long technicianId
) {
}
