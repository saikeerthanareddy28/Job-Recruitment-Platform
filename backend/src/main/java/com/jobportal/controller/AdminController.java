package com.jobportal.controller;

import com.jobportal.dto.*;
import com.jobportal.service.PageResponse;
import com.jobportal.entity.User;
import com.jobportal.repository.UserRepository;
import com.jobportal.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final UserService userService;
    private final UserRepository userRepository;

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<PageResponse<UserDto.UserSummary>>> getAllUsers(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(ApiResponse.success(userService.getAllUsers(page, size)));
    }

    @PatchMapping("/users/{userId}/deactivate")
    public ResponseEntity<ApiResponse<Void>> deactivateUser(
        @AuthenticationPrincipal UserDetails userDetails,
        @PathVariable Long userId
    ) {
        User admin = getUser(userDetails);
        userService.deactivateUser(admin.getId(), userId);
        return ResponseEntity.ok(ApiResponse.success("User deactivated", null));
    }

    @PatchMapping("/users/{userId}/activate")
    public ResponseEntity<ApiResponse<Void>> activateUser(
        @AuthenticationPrincipal UserDetails userDetails,
        @PathVariable Long userId
    ) {
        User admin = getUser(userDetails);
        userService.activateUser(admin.getId(), userId);
        return ResponseEntity.ok(ApiResponse.success("User activated", null));
    }

    private User getUser(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
    }
}
