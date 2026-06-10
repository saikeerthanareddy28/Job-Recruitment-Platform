package com.jobportal.service;

import com.jobportal.dto.UserDto;
import com.jobportal.entity.User;
import com.jobportal.exception.ResourceNotFoundException;
import com.jobportal.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    @Transactional(readOnly = true)
    public UserDto.UserSummary getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return mapToSummary(user);
    }

    @Transactional
    public UserDto.UserSummary updateProfile(Long userId, UserDto.UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());
        user.setPhoneNumber(request.phoneNumber());
        user = userRepository.save(user);
        return mapToSummary(user);
    }

    @Transactional
    public UserDto.UserSummary uploadProfilePicture(Long userId, MultipartFile file) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        if (user.getProfilePicture() != null) {
            fileStorageService.deleteFile(user.getProfilePicture());
        }

        String picturePath = fileStorageService.storeProfilePicture(file);
        user.setProfilePicture(picturePath);
        user = userRepository.save(user);
        return mapToSummary(user);
    }

    @Transactional(readOnly = true)
    public PageResponse<UserDto.UserSummary> getAllUsers(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<User> userPage = userRepository.findAll(pageable);

        List<UserDto.UserSummary> summaries = userPage.getContent().stream()
            .map(this::mapToSummary)
            .collect(Collectors.toList());

        return new PageResponse<>(summaries, userPage.getNumber(), userPage.getSize(),
            userPage.getTotalElements(), userPage.getTotalPages(), userPage.isLast(), userPage.isFirst());
    }

    @Transactional
    public void deactivateUser(Long adminId, Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        user.setIsActive(false);
        userRepository.save(user);
        log.info("User {} deactivated by admin {}", userId, adminId);
    }

    @Transactional
    public void activateUser(Long adminId, Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        user.setIsActive(true);
        userRepository.save(user);
        log.info("User {} activated by admin {}", userId, adminId);
    }

    private UserDto.UserSummary mapToSummary(User user) {
        return new UserDto.UserSummary(
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
    }
}
