package com.jobportal.controller;

import com.jobportal.dto.*;
import com.jobportal.entity.User;
import com.jobportal.repository.UserRepository;
import com.jobportal.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDto.UserSummary>> getCurrentUser(
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(ApiResponse.success(
            userService.getCurrentUser(userDetails.getUsername())));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserDto.UserSummary>> updateProfile(
        @AuthenticationPrincipal UserDetails userDetails,
        @Valid @RequestBody UserDto.UpdateProfileRequest request
    ) {
        User user = getUser(userDetails);
        return ResponseEntity.ok(ApiResponse.success("Profile updated",
            userService.updateProfile(user.getId(), request)));
    }

    @PostMapping("/me/profile-picture")
    public ResponseEntity<ApiResponse<UserDto.UserSummary>> uploadProfilePicture(
        @AuthenticationPrincipal UserDetails userDetails,
        @RequestParam("file") MultipartFile file
    ) {
        User user = getUser(userDetails);
        return ResponseEntity.ok(ApiResponse.success("Profile picture updated",
            userService.uploadProfilePicture(user.getId(), file)));
    }

    private User getUser(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
    }
}
