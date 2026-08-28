package com.keystone.platform.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CustomerRequest(
        @NotBlank @Size(max = 150) String name,
        @NotBlank @Email @Size(max = 180) String email,
        @Size(max = 30) String phone,
        @Size(max = 150) String companyName,
        @Size(max = 255) String address,
        @Size(max = 100) String city,
        @Size(max = 100) String state,
        @Size(max = 20) String postalCode,
        @Size(max = 2000) String notes
) {
}
