package com.keystone.platform.backend.dto;

import com.keystone.platform.backend.entity.Site;

import java.time.Instant;

public record SiteResponse(
        Long id,
        Long customerId,
        String customerName,
        String name,
        String location,
        String notes,
        Instant createdAt,
        Instant updatedAt
) {
    public static SiteResponse from(Site site) {
        return new SiteResponse(
                site.getId(),
                site.getCustomer().getId(),
                site.getCustomer().getName(),
                site.getName(),
                site.getLocation(),
                site.getNotes(),
                site.getCreatedAt(),
                site.getUpdatedAt()
        );
    }
}

