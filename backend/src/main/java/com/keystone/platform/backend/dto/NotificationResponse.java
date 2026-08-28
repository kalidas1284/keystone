package com.keystone.platform.backend.dto;

import com.keystone.platform.backend.entity.Notification;

import java.time.Instant;

public record NotificationResponse(
        Long id,
        String title,
        String message,
        String type,
        String link,
        boolean read,
        Instant createdAt
) {
    public static NotificationResponse from(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getType(),
                notification.getLink(),
                notification.isReadFlag(),
                notification.getCreatedAt()
        );
    }
}
