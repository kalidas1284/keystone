package com.keystone.platform.backend.dto;

import com.keystone.platform.backend.entity.Role;

public record LoginResponse(
        String token,
        String tokenType,
        Long userId,
        String fullName,
        String email,
        Role role
) {
}
