package com.jobportal.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public final class CandidateDto {

    private CandidateDto() {}

    public record CandidateProfileResponse(
        Long id,
        Long userId,
        String firstName,
        String lastName,
        String email,
        String phoneNumber,
        String profilePicture,
        String headline,
        String summary,
        String currentLocation,
        String preferredLocation,
        BigDecimal expectedSalary,
        String salaryCurrency,
        Integer experienceYears,
        Integer noticePeriodDays,
        String linkedinUrl,
        String githubUrl,
        String portfolioUrl,
        String skills,
        List<ResumeDto> resumes,
        LocalDateTime createdAt
    ) {}

    public record UpdateCandidateProfileRequest(
        @Size(max = 200) String headline,
        @Size(max = 2000) String summary,
        @Size(max = 100) String currentLocation,
        @Size(max = 100) String preferredLocation,
        BigDecimal expectedSalary,
        Integer experienceYears,
        Integer noticePeriodDays,
        @Size(max = 300) String linkedinUrl,
        @Size(max = 300) String githubUrl,
        @Size(max = 300) String portfolioUrl,
        String skills
    ) {}

    public record UpdateLocationRequest(
        @NotBlank @Size(max = 100) String preferredLocation
    ) {}

    public record UpdateSalaryRequest(
        @NotNull BigDecimal expectedSalary,
        String salaryCurrency
    ) {}

    public record ResumeDto(
        Long id,
        String fileName,
        String originalName,
        Long fileSize,
        Boolean isPrimary,
        LocalDateTime createdAt
    ) {}
}
