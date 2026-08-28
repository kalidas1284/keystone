package com.keystone.platform.backend.dto;

import jakarta.validation.constraints.NotNull;

public record LinkPortalUserRequest(
        @NotNull Long userId
) {
}
