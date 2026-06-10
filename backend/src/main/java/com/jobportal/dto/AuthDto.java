package com.jobportal.dto;

import com.jobportal.entity.User;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;

public final class AuthDto {

    private AuthDto() {}

    public record RegisterRequest(
        @NotBlank @Email @Size(max = 100) String email,
        @NotBlank @Size(min = 3, max = 50) String username,
        @NotBlank @Size(min = 8, max = 100) String password,
        @NotBlank @Size(max = 50) String firstName,
        @NotBlank @Size(max = 50) String lastName,
        @Size(max = 20) String phoneNumber,
        @NotNull User.UserRole role
    ) {}

    public record LoginRequest(
        @NotBlank @Email String email,
        @NotBlank String password
    ) {}

    public record AuthResponse(
        String accessToken,
        String refreshToken,
        String tokenType,
        Long expiresIn,
        UserDto.UserSummary user
    ) {}

    public record RefreshTokenRequest(
        @NotBlank String refreshToken
    ) {}

    public record ForgotPasswordRequest(
        @NotBlank @Email String email
    ) {}

    public record ResetPasswordRequest(
        @NotBlank String token,
        @NotBlank @Size(min = 8, max = 100) String newPassword
    ) {}

    public record ChangePasswordRequest(
        @NotBlank String currentPassword,
        @NotBlank @Size(min = 8, max = 100) String newPassword
    ) {}
}
