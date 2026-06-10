package com.jobportal.service;

import com.jobportal.dto.*;
import com.jobportal.entity.*;
import com.jobportal.exception.ResourceNotFoundException;
import com.jobportal.exception.UnauthorizedException;
import com.jobportal.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;

    @Async
    @Transactional
    public void createNotification(
        User user,
        Notification.NotificationType type,
        String title,
        String message,
        Long referenceId,
        String referenceType,
        String actionUrl
    ) {
        try {
            Notification notification = Notification.builder()
                .user(user)
                .type(type)
                .title(title)
                .message(message)
                .referenceId(referenceId)
                .referenceType(referenceType)
                .actionUrl(actionUrl)
                .isRead(false)
                .build();
            notificationRepository.save(notification);
        } catch (Exception ex) {
            log.error("Failed to create notification for user {}: {}", user.getId(), ex.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public PageResponse<NotificationDto.NotificationResponse> getNotifications(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Notification> notificationPage = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);

        List<NotificationDto.NotificationResponse> responses = notificationPage.getContent().stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());

        return new PageResponse<>(responses, notificationPage.getNumber(), notificationPage.getSize(),
            notificationPage.getTotalElements(), notificationPage.getTotalPages(),
            notificationPage.isLast(), notificationPage.isFirst());
    }

    @Transactional(readOnly = true)
    public NotificationDto.UnreadCountResponse getUnreadCount(Long userId) {
        long count = notificationRepository.countByUserIdAndIsRead(userId, false);
        return new NotificationDto.UnreadCountResponse(count);
    }

    @Transactional
    public void markAsRead(Long userId, Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new ResourceNotFoundException("Notification", notificationId));

        if (!notification.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You are not authorized to update this notification");
        }

        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsReadForUser(userId);
    }

    private NotificationDto.NotificationResponse mapToResponse(Notification notification) {
        return new NotificationDto.NotificationResponse(
            notification.getId(),
            notification.getType(),
            notification.getTitle(),
            notification.getMessage(),
            notification.getReferenceId(),
            notification.getReferenceType(),
            notification.getIsRead(),
            notification.getActionUrl(),
            notification.getCreatedAt()
        );
    }
}
