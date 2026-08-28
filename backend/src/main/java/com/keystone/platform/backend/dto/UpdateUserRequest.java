package com.keystone.platform.backend.dto;

import com.keystone.platform.backend.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateUserRequest(
        @NotBlank @Size(max = 120) String fullName,
        @NotBlank @Email @Size(max = 180) String email,
        @Size(max = 30) String phoneNumber,
        @NotNull Role role,
        @NotNull Boolean active
) {
}
