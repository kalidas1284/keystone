package com.keystone.platform.backend.dto;

import com.keystone.platform.backend.entity.Customer;

import java.time.Instant;

public record CustomerResponse(
        Long id,
        String name,
        String email,
        String phone,
        String companyName,
        String address,
        String city,
        String state,
        String postalCode,
        String notes,
        boolean active,
        Long portalUserId,
        String portalUserEmail,
        Instant createdAt,
        Instant updatedAt
) {
    public static CustomerResponse from(Customer customer) {
        return new CustomerResponse(
                customer.getId(),
                customer.getName(),
                customer.getEmail(),
                customer.getPhone(),
                customer.getCompanyName(),
                customer.getAddress(),
                customer.getCity(),
                customer.getState(),
                customer.getPostalCode(),
                customer.getNotes(),
                customer.isActive(),
                customer.getUser() != null ? customer.getUser().getId() : null,
                customer.getUser() != null ? customer.getUser().getEmail() : null,
                customer.getCreatedAt(),
                customer.getUpdatedAt()
        );
    }
}
