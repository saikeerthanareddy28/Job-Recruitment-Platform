package com.jobportal.dto;

import com.jobportal.entity.User;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;

public final class UserDto {

    private UserDto() {}

    public record UserSummary(
        Long id,
        String email,
        String username,
        String firstName,
        String lastName,
        String profilePicture,
        User.UserRole role,
        Boolean isActive,
        LocalDateTime createdAt
    ) {}

    public record UpdateProfileRequest(
        @NotBlank @Size(max = 50) String firstName,
        @NotBlank @Size(max = 50) String lastName,
        @Size(max = 20) String phoneNumber
    ) {}
}
