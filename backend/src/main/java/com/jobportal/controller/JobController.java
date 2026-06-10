package com.jobportal.controller;

import com.jobportal.dto.*;
import com.jobportal.service.PageResponse;
import com.jobportal.entity.Job;
import com.jobportal.entity.User;
import com.jobportal.repository.UserRepository;
import com.jobportal.service.JobService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;
    private final UserRepository userRepository;

    @GetMapping("/jobs")
    public ResponseEntity<ApiResponse<PageResponse<JobDto.JobSummary>>> searchJobs(
        @RequestParam(required = false) String keyword,
        @RequestParam(required = false) String location,
        @RequestParam(required = false) Long categoryId,
        @RequestParam(required = false) Job.EmploymentType employmentType,
        @RequestParam(required = false) Job.ExperienceLevel experienceLevel,
        @RequestParam(required = false) BigDecimal minSalary,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "12") int size,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long userId = userDetails != null ? getUser(userDetails).getId() : null;
        JobDto.JobSearchRequest request = new JobDto.JobSearchRequest(
            keyword, location, categoryId, employmentType, experienceLevel, minSalary, page, size, "createdAt"
        );
        return ResponseEntity.ok(ApiResponse.success(jobService.searchJobs(request, userId)));
    }

    @GetMapping("/jobs/{jobId}")
    public ResponseEntity<ApiResponse<JobDto.JobDetail>> getJobById(
        @PathVariable Long jobId,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long userId = userDetails != null ? getUser(userDetails).getId() : null;
        return ResponseEntity.ok(ApiResponse.success(jobService.getJobById(jobId, userId)));
    }

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<JobService.JobCategoryDto>>> getCategories() {
        return ResponseEntity.ok(ApiResponse.success(jobService.getAllCategories()));
    }

    @PostMapping("/recruiter/jobs")
    public ResponseEntity<ApiResponse<JobDto.JobDetail>> createJob(
        @AuthenticationPrincipal UserDetails userDetails,
        @Valid @RequestBody JobDto.CreateJobRequest request
    ) {
        User user = getUser(userDetails);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Job posted successfully", jobService.createJob(user.getId(), request)));
    }

    @PutMapping("/recruiter/jobs/{jobId}")
    public ResponseEntity<ApiResponse<JobDto.JobDetail>> updateJob(
        @AuthenticationPrincipal UserDetails userDetails,
        @PathVariable Long jobId,
        @Valid @RequestBody JobDto.UpdateJobRequest request
    ) {
        User user = getUser(userDetails);
        return ResponseEntity.ok(ApiResponse.success("Job updated", jobService.updateJob(user.getId(), jobId, request)));
    }

    @DeleteMapping("/recruiter/jobs/{jobId}")
    public ResponseEntity<ApiResponse<Void>> deleteJob(
        @AuthenticationPrincipal UserDetails userDetails,
        @PathVariable Long jobId
    ) {
        User user = getUser(userDetails);
        jobService.deleteJob(user.getId(), jobId);
        return ResponseEntity.ok(ApiResponse.success("Job closed successfully", null));
    }

    @GetMapping("/recruiter/jobs")
    public ResponseEntity<ApiResponse<PageResponse<JobDto.JobSummary>>> getMyJobs(
        @AuthenticationPrincipal UserDetails userDetails,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        User user = getUser(userDetails);
        return ResponseEntity.ok(ApiResponse.success(jobService.getJobsByRecruiter(user.getId(), page, size)));
    }

    private User getUser(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
    }
}
