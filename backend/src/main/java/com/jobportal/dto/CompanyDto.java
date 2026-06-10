package com.jobportal.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;

public final class CompanyDto {

    private CompanyDto() {}

    public record CompanySummary(
        Long id,
        String name,
        String logoUrl,
        String industry,
        String companySize,
        String headquartersLocation,
        Boolean isVerified,
        long jobCount
    ) {}

    public record CreateCompanyRequest(
        @NotBlank @Size(max = 200) String name,
        @Size(max = 300) String websiteUrl,
        String description,
        @Size(max = 100) String industry,
        @Size(max = 50) String companySize,
        @Size(max = 200) String headquartersLocation,
        Integer foundedYear,
        @Size(max = 300) String linkedinUrl
    ) {}

    public record UpdateCompanyRequest(
        @NotBlank @Size(max = 200) String name,
        @Size(max = 300) String websiteUrl,
        String description,
        @Size(max = 100) String industry,
        @Size(max = 50) String companySize,
        @Size(max = 200) String headquartersLocation,
        Integer foundedYear,
        @Size(max = 300) String linkedinUrl
    ) {}
}
