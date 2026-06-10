package com.jobportal.controller;

import com.jobportal.dto.*;
import com.jobportal.service.PageResponse;
import com.jobportal.entity.User;
import com.jobportal.repository.UserRepository;
import com.jobportal.service.ApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;
    private final UserRepository userRepository;

    @PostMapping("/candidate/applications")
    public ResponseEntity<ApiResponse<ApplicationDto.ApplicationSummary>> applyToJob(
        @AuthenticationPrincipal UserDetails userDetails,
        @Valid @RequestBody ApplicationDto.ApplyRequest request
    ) {
        User user = getUser(userDetails);
        ApplicationDto.ApplicationSummary summary = applicationService.applyToJob(user.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Applied successfully", summary));
    }

    @PatchMapping("/candidate/applications/{applicationId}/withdraw")
    public ResponseEntity<ApiResponse<Void>> withdrawApplication(
        @AuthenticationPrincipal UserDetails userDetails,
        @PathVariable Long applicationId
    ) {
        User user = getUser(userDetails);
        applicationService.withdrawApplication(user.getId(), applicationId);
        return ResponseEntity.ok(ApiResponse.success("Application withdrawn", null));
    }

    @GetMapping("/candidate/applications")
    public ResponseEntity<ApiResponse<PageResponse<ApplicationDto.ApplicationSummary>>> getMyApplications(
        @AuthenticationPrincipal UserDetails userDetails,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        User user = getUser(userDetails);
        return ResponseEntity.ok(ApiResponse.success(
            applicationService.getCandidateApplications(user.getId(), page, size)));
    }

    @PostMapping("/candidate/saved-jobs/{jobId}")
    public ResponseEntity<ApiResponse<Void>> saveJob(
        @AuthenticationPrincipal UserDetails userDetails,
        @PathVariable Long jobId
    ) {
        User user = getUser(userDetails);
        applicationService.saveJob(user.getId(), jobId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Job saved", null));
    }

    @DeleteMapping("/candidate/saved-jobs/{jobId}")
    public ResponseEntity<ApiResponse<Void>> unsaveJob(
        @AuthenticationPrincipal UserDetails userDetails,
        @PathVariable Long jobId
    ) {
        User user = getUser(userDetails);
        applicationService.unsaveJob(user.getId(), jobId);
        return ResponseEntity.ok(ApiResponse.success("Job removed from saved", null));
    }

    @GetMapping("/candidate/saved-jobs")
    public ResponseEntity<ApiResponse<PageResponse<JobDto.JobSummary>>> getSavedJobs(
        @AuthenticationPrincipal UserDetails userDetails,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        User user = getUser(userDetails);
        return ResponseEntity.ok(ApiResponse.success(
            applicationService.getSavedJobs(user.getId(), page, size)));
    }

    @GetMapping("/recruiter/jobs/{jobId}/applications")
    public ResponseEntity<ApiResponse<PageResponse<ApplicationDto.ApplicationDetail>>> getJobApplications(
        @AuthenticationPrincipal UserDetails userDetails,
        @PathVariable Long jobId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        User user = getUser(userDetails);
        return ResponseEntity.ok(ApiResponse.success(
            applicationService.getJobApplications(user.getId(), jobId, page, size)));
    }

    @PatchMapping("/recruiter/applications/{applicationId}/status")
    public ResponseEntity<ApiResponse<ApplicationDto.ApplicationDetail>> updateApplicationStatus(
        @AuthenticationPrincipal UserDetails userDetails,
        @PathVariable Long applicationId,
        @Valid @RequestBody ApplicationDto.UpdateStatusRequest request
    ) {
        User user = getUser(userDetails);
        return ResponseEntity.ok(ApiResponse.success("Status updated",
            applicationService.updateApplicationStatus(user.getId(), applicationId, request)));
    }

    private User getUser(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
    }
}
