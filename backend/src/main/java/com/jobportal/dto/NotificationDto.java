package com.jobportal.dto;

import com.jobportal.entity.Notification;
import lombok.*;

import java.time.LocalDateTime;

public final class NotificationDto {

    private NotificationDto() {}

    public record NotificationResponse(
        Long id,
        Notification.NotificationType type,
        String title,
        String message,
        Long referenceId,
        String referenceType,
        Boolean isRead,
        String actionUrl,
        LocalDateTime createdAt
    ) {}

    public record UnreadCountResponse(
        long count
    ) {}
}
