package com.jobportal.dto;

import com.jobportal.entity.Application;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;

public final class ApplicationDto {

    private ApplicationDto() {}

    public record ApplicationSummary(
        Long id,
        Long jobId,
        String jobTitle,
        String companyName,
        String companyLogo,
        String jobLocation,
        Application.ApplicationStatus status,
        LocalDateTime appliedAt,
        LocalDateTime updatedAt
    ) {}

    public record ApplicationDetail(
        Long id,
        Long jobId,
        String jobTitle,
        String companyName,
        Long candidateProfileId,
        String candidateName,
        String candidateEmail,
        String candidatePhone,
        Long resumeId,
        String resumeFileName,
        String coverLetter,
        Application.ApplicationStatus status,
        String recruiterNotes,
        LocalDateTime appliedAt,
        LocalDateTime reviewedAt
    ) {}

    public record ApplyRequest(
        @NotNull Long jobId,
        Long resumeId,
        @Size(max = 2000) String coverLetter
    ) {}

    public record UpdateStatusRequest(
        @NotNull Application.ApplicationStatus status,
        String recruiterNotes
    ) {}
}
