package com.keystone.platform.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record SiteRequest(
        @NotNull Long customerId,
        @NotBlank @Size(max = 150) String name,
        @NotBlank @Size(max = 255) String location,
        @Size(max = 2000) String notes
) {
}

