package com.jobportal.service;

import com.jobportal.dto.*;
import com.jobportal.entity.*;
import com.jobportal.exception.*;
import com.jobportal.repository.*;
import com.jobportal.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.*;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final RecruiterRepository recruiterRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;

    @Value("${app.jwt.expiration}")
    private Long jwtExpiration;

    @Value("${app.jwt.refresh-expiration}")
    private Long refreshTokenExpiration;

    @Transactional
    public AuthDto.AuthResponse register(AuthDto.RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new ConflictException("An account with this email already exists");
        }
        if (userRepository.existsByUsername(request.username())) {
            throw new ConflictException("This username is already taken");
        }

        User user = User.builder()
            .email(request.email())
            .username(request.username())
            .password(passwordEncoder.encode(request.password()))
            .firstName(request.firstName())
            .lastName(request.lastName())
            .phoneNumber(request.phoneNumber())
            .role(request.role())
            .isActive(true)
            .isEmailVerified(true)
            .build();

        user = userRepository.save(user);

        if (request.role() == User.UserRole.CANDIDATE) {
            CandidateProfile profile = CandidateProfile.builder()
                .user(user)
                .build();
            candidateProfileRepository.save(profile);
        } else if (request.role() == User.UserRole.RECRUITER) {
            Recruiter recruiter = Recruiter.builder()
                .user(user)
                .build();
            recruiterRepository.save(recruiter);
        }

        log.info("New user registered: {} ({})", user.getEmail(), user.getRole());
        return generateAuthResponse(user);
    }

    @Transactional
    public AuthDto.AuthResponse login(AuthDto.LoginRequest request) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        User user = userRepository.findByEmail(request.email())
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        if (!user.getIsActive()) {
            throw new UnauthorizedException("Your account has been deactivated");
        }

        return generateAuthResponse(user);
    }

    @Transactional
    public AuthDto.AuthResponse refreshToken(AuthDto.RefreshTokenRequest request) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(request.refreshToken())
            .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));

        if (refreshToken.getIsRevoked() || refreshToken.getExpiresAt().isBefore(Instant.now())) {
            throw new UnauthorizedException("Refresh token has expired. Please login again.");
        }

        refreshToken.setIsRevoked(true);
        refreshTokenRepository.save(refreshToken);

        return generateAuthResponse(refreshToken.getUser());
    }

    @Transactional
    public void logout(Long userId) {
        refreshTokenRepository.revokeAllForUser(userId);
        log.info("User {} logged out", userId);
    }

    @Transactional
    public void changePassword(Long userId, AuthDto.ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
        refreshTokenRepository.revokeAllForUser(userId);
        log.info("Password changed for user {}", userId);
    }

    @Transactional
    public void forgotPassword(AuthDto.ForgotPasswordRequest request) {
        userRepository.findByEmail(request.email()).ifPresent(user -> {
            String token = UUID.randomUUID().toString();
            user.setPasswordResetToken(token);
            user.setPasswordResetTokenExpiry(LocalDateTime.now().plusHours(24));
            userRepository.save(user);
            log.info("Password reset token generated for user: {}", user.getEmail());
        });
    }

    @Transactional
    public void resetPassword(AuthDto.ResetPasswordRequest request) {
        User user = userRepository.findByPasswordResetToken(request.token())
            .orElseThrow(() -> new BadRequestException("Invalid or expired password reset token"));

        if (user.getPasswordResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Password reset token has expired");
        }

        user.setPassword(passwordEncoder.encode(request.newPassword()));
        user.setPasswordResetToken(null);
        user.setPasswordResetTokenExpiry(null);
        userRepository.save(user);
        refreshTokenRepository.revokeAllForUser(user.getId());
        log.info("Password reset successfully for user: {}", user.getEmail());
    }

    private AuthDto.AuthResponse generateAuthResponse(User user) {
        String accessToken = jwtTokenProvider.generateToken(
            user.getEmail(),
            Map.of("role", user.getRole().name(), "userId", user.getId())
        );

        String refreshTokenValue = UUID.randomUUID().toString();
        RefreshToken refreshToken = RefreshToken.builder()
            .user(user)
            .token(refreshTokenValue)
            .expiresAt(Instant.now().plusMillis(refreshTokenExpiration))
            .build();
        refreshTokenRepository.save(refreshToken);

        UserDto.UserSummary userSummary = new UserDto.UserSummary(
            user.getId(),
            user.getEmail(),
            user.getUsername(),
            user.getFirstName(),
            user.getLastName(),
            user.getProfilePicture(),
            user.getRole(),
            user.getIsActive(),
            user.getCreatedAt()
        );

        return new AuthDto.AuthResponse(
            accessToken,
            refreshTokenValue,
            "Bearer",
            jwtExpiration,
            userSummary
        );
    }
}
