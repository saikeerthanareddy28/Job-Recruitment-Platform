package com.jobportal.controller;

import com.jobportal.dto.*;
import com.jobportal.service.PageResponse;
import com.jobportal.entity.User;
import com.jobportal.repository.UserRepository;
import com.jobportal.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<NotificationDto.NotificationResponse>>> getNotifications(
        @AuthenticationPrincipal UserDetails userDetails,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        User user = getUser(userDetails);
        return ResponseEntity.ok(ApiResponse.success(
            notificationService.getNotifications(user.getId(), page, size)));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<NotificationDto.UnreadCountResponse>> getUnreadCount(
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = getUser(userDetails);
        return ResponseEntity.ok(ApiResponse.success(notificationService.getUnreadCount(user.getId())));
    }

    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
        @AuthenticationPrincipal UserDetails userDetails,
        @PathVariable Long notificationId
    ) {
        User user = getUser(userDetails);
        notificationService.markAsRead(user.getId(), notificationId);
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read", null));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = getUser(userDetails);
        notificationService.markAllAsRead(user.getId());
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read", null));
    }

    private User getUser(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
    }
}
