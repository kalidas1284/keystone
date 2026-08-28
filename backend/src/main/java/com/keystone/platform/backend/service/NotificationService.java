package com.keystone.platform.backend.service;

import com.keystone.platform.backend.dto.NotificationResponse;
import com.keystone.platform.backend.entity.Notification;
import com.keystone.platform.backend.entity.User;
import com.keystone.platform.backend.exception.ResourceNotFoundException;
import com.keystone.platform.backend.repository.NotificationRepository;
import com.keystone.platform.backend.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SecurityUtils securityUtils;

    @Transactional
    public void notifyUser(User user, String title, String message, String type, String link) {
        notificationRepository.save(Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type)
                .link(link)
                .readFlag(false)
                .build());
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> myNotifications() {
        User user = securityUtils.currentUser();
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(NotificationResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public long unreadCount() {
        return notificationRepository.countByUserIdAndReadFlagFalse(securityUtils.currentUser().getId());
    }

    @Transactional
    public NotificationResponse markRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        if (!notification.getUser().getId().equals(securityUtils.currentUser().getId())) {
            throw new ResourceNotFoundException("Notification not found");
        }
        notification.setReadFlag(true);
        return NotificationResponse.from(notificationRepository.save(notification));
    }

    @Transactional
    public void markAllRead() {
        User user = securityUtils.currentUser();
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        notifications.forEach(n -> n.setReadFlag(true));
        notificationRepository.saveAll(notifications);
    }
}
