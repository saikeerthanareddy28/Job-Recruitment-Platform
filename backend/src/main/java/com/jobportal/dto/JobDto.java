package com.jobportal.dto;

import com.jobportal.entity.Job;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public final class JobDto {

    private JobDto() {}

    public record JobSummary(
        Long id,
        String title,
        String companyName,
        String companyLogo,
        String location,
        Boolean isRemote,
        Job.EmploymentType employmentType,
        Job.ExperienceLevel experienceLevel,
        BigDecimal minSalary,
        BigDecimal maxSalary,
        String salaryCurrency,
        Job.JobStatus status,
        Long categoryId,
        String categoryName,
        Integer applicationsCount,
        LocalDateTime createdAt,
        boolean isSaved
    ) {}

    public record JobDetail(
        Long id,
        String title,
        String description,
        String requirements,
        String responsibilities,
        String skillsRequired,
        Long companyId,
        String companyName,
        String companyLogo,
        String companyWebsite,
        String companyDescription,
        String location,
        Boolean isRemote,
        Job.EmploymentType employmentType,
        Job.ExperienceLevel experienceLevel,
        BigDecimal minSalary,
        BigDecimal maxSalary,
        String salaryCurrency,
        LocalDate applicationDeadline,
        Job.JobStatus status,
        Long categoryId,
        String categoryName,
        Integer viewsCount,
        Integer applicationsCount,
        LocalDateTime createdAt,
        boolean isSaved,
        boolean hasApplied
    ) {}

    public record CreateJobRequest(
        @NotBlank @Size(max = 200) String title,
        @NotBlank String description,
        String requirements,
        String responsibilities,
        String skillsRequired,
        @NotNull Long companyId,
        Long categoryId,
        @Size(max = 200) String location,
        Boolean isRemote,
        Job.EmploymentType employmentType,
        Job.ExperienceLevel experienceLevel,
        BigDecimal minSalary,
        BigDecimal maxSalary,
        LocalDate applicationDeadline
    ) {}

    public record UpdateJobRequest(
        @NotBlank @Size(max = 200) String title,
        @NotBlank String description,
        String requirements,
        String responsibilities,
        String skillsRequired,
        Long categoryId,
        @Size(max = 200) String location,
        Boolean isRemote,
        Job.EmploymentType employmentType,
        Job.ExperienceLevel experienceLevel,
        BigDecimal minSalary,
        BigDecimal maxSalary,
        LocalDate applicationDeadline,
        Job.JobStatus status
    ) {}

    public record JobSearchRequest(
        String keyword,
        String location,
        Long categoryId,
        Job.EmploymentType employmentType,
        Job.ExperienceLevel experienceLevel,
        BigDecimal minSalary,
        int page,
        int size,
        String sortBy
    ) {}
}
