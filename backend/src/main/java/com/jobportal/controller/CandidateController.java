package com.jobportal.controller;

import com.jobportal.dto.*;
import com.jobportal.entity.User;
import com.jobportal.repository.UserRepository;
import com.jobportal.service.CandidateService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.util.List;

@RestController
@RequestMapping("/candidate")
@RequiredArgsConstructor
public class CandidateController {

    private final CandidateService candidateService;
    private final UserRepository userRepository;

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<CandidateDto.CandidateProfileResponse>> getProfile(
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = getUser(userDetails);
        return ResponseEntity.ok(ApiResponse.success(candidateService.getProfile(user.getId())));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<CandidateDto.CandidateProfileResponse>> updateProfile(
        @AuthenticationPrincipal UserDetails userDetails,
        @Valid @RequestBody CandidateDto.UpdateCandidateProfileRequest request
    ) {
        User user = getUser(userDetails);
        return ResponseEntity.ok(ApiResponse.success("Profile updated", candidateService.updateProfile(user.getId(), request)));
    }

    @PatchMapping("/profile/location")
    public ResponseEntity<ApiResponse<CandidateDto.CandidateProfileResponse>> updateLocation(
        @AuthenticationPrincipal UserDetails userDetails,
        @Valid @RequestBody CandidateDto.UpdateLocationRequest request
    ) {
        User user = getUser(userDetails);
        return ResponseEntity.ok(ApiResponse.success("Location updated", candidateService.updatePreferredLocation(user.getId(), request)));
    }

    @PatchMapping("/profile/salary")
    public ResponseEntity<ApiResponse<CandidateDto.CandidateProfileResponse>> updateSalary(
        @AuthenticationPrincipal UserDetails userDetails,
        @Valid @RequestBody CandidateDto.UpdateSalaryRequest request
    ) {
        User user = getUser(userDetails);
        return ResponseEntity.ok(ApiResponse.success("Expected salary updated", candidateService.updateExpectedSalary(user.getId(), request)));
    }

    @GetMapping("/resumes")
    public ResponseEntity<ApiResponse<List<CandidateDto.ResumeDto>>> getResumes(
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = getUser(userDetails);
        return ResponseEntity.ok(ApiResponse.success(candidateService.getResumes(user.getId())));
    }

    @PostMapping("/resumes")
    public ResponseEntity<ApiResponse<CandidateDto.ResumeDto>> uploadResume(
        @AuthenticationPrincipal UserDetails userDetails,
        @RequestParam("file") MultipartFile file
    ) {
        User user = getUser(userDetails);
        CandidateDto.ResumeDto resume = candidateService.uploadResume(user.getId(), file);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Resume uploaded", resume));
    }

    @PutMapping("/resumes/{resumeId}")
    public ResponseEntity<ApiResponse<CandidateDto.ResumeDto>> replaceResume(
        @AuthenticationPrincipal UserDetails userDetails,
        @PathVariable Long resumeId,
        @RequestParam("file") MultipartFile file
    ) {
        User user = getUser(userDetails);
        return ResponseEntity.ok(ApiResponse.success("Resume replaced", candidateService.replaceResume(user.getId(), resumeId, file)));
    }

    @DeleteMapping("/resumes/{resumeId}")
    public ResponseEntity<ApiResponse<Void>> deleteResume(
        @AuthenticationPrincipal UserDetails userDetails,
        @PathVariable Long resumeId
    ) {
        User user = getUser(userDetails);
        candidateService.deleteResume(user.getId(), resumeId);
        return ResponseEntity.ok(ApiResponse.success("Resume deleted", null));
    }

    @PatchMapping("/resumes/{resumeId}/set-primary")
    public ResponseEntity<ApiResponse<Void>> setPrimaryResume(
        @AuthenticationPrincipal UserDetails userDetails,
        @PathVariable Long resumeId
    ) {
        User user = getUser(userDetails);
        candidateService.setPrimaryResume(user.getId(), resumeId);
        return ResponseEntity.ok(ApiResponse.success("Primary resume updated", null));
    }

    @GetMapping("/resumes/{resumeId}/download")
    public ResponseEntity<Resource> downloadResume(
        @AuthenticationPrincipal UserDetails userDetails,
        @PathVariable Long resumeId
    ) {
        User user = getUser(userDetails);
        CandidateDto.ResumeDto resumeDto = candidateService.getResumes(user.getId())
            .stream()
            .filter(r -> r.id().equals(resumeId))
            .findFirst()
            .orElseThrow(() -> new com.jobportal.exception.ResourceNotFoundException("Resume", resumeId));

        try {
            Path filePath = candidateService.getResumeFilePath(resumeId);
            Resource resource = new UrlResource(filePath.toUri());
            if (!resource.exists()) {
                throw new com.jobportal.exception.ResourceNotFoundException("Resume file not found");
            }
            return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                    "attachment; filename=\"" + resumeDto.originalName() + "\"")
                .body(resource);
        } catch (com.jobportal.exception.ResourceNotFoundException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new com.jobportal.exception.ResourceNotFoundException("Resume file not found");
        }
    }

    private User getUser(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
    }
}
