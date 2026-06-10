package com.jobportal.service;

import com.jobportal.dto.CompanyDto;
import com.jobportal.entity.Company;
import com.jobportal.entity.Recruiter;
import com.jobportal.exception.*;
import com.jobportal.repository.CompanyRepository;
import com.jobportal.repository.RecruiterRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CompanyService {

    private final CompanyRepository companyRepository;
    private final RecruiterRepository recruiterRepository;
    private final FileStorageService fileStorageService;

    @Transactional(readOnly = true)
    public List<CompanyDto.CompanySummary> getAllCompanies() {
        return companyRepository.findAll().stream()
            .map(this::mapToSummary)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CompanyDto.CompanySummary getCompanyById(Long companyId) {
        Company company = companyRepository.findById(companyId)
            .orElseThrow(() -> new ResourceNotFoundException("Company", companyId));
        return mapToSummary(company);
    }

    @Transactional
    public CompanyDto.CompanySummary createCompany(Long userId, CompanyDto.CreateCompanyRequest request) {
        if (companyRepository.existsByName(request.name())) {
            throw new ConflictException("A company with this name already exists");
        }

        Company company = Company.builder()
            .name(request.name())
            .websiteUrl(request.websiteUrl())
            .description(request.description())
            .industry(request.industry())
            .companySize(request.companySize())
            .headquartersLocation(request.headquartersLocation())
            .foundedYear(request.foundedYear())
            .linkedinUrl(request.linkedinUrl())
            .isVerified(false)
            .build();

        company = companyRepository.save(company);

        Recruiter recruiter = recruiterRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Recruiter profile not found"));
        recruiter.setCompany(company);
        recruiterRepository.save(recruiter);

        log.info("Company created: {} by user {}", company.getName(), userId);
        return mapToSummary(company);
    }

    @Transactional
    public CompanyDto.CompanySummary updateCompany(Long userId, Long companyId, CompanyDto.UpdateCompanyRequest request) {
        Company company = companyRepository.findById(companyId)
            .orElseThrow(() -> new ResourceNotFoundException("Company", companyId));

        Recruiter recruiter = recruiterRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Recruiter profile not found"));

        if (recruiter.getCompany() == null || !recruiter.getCompany().getId().equals(companyId)) {
            throw new UnauthorizedException("You are not authorized to update this company");
        }

        company.setName(request.name());
        company.setWebsiteUrl(request.websiteUrl());
        company.setDescription(request.description());
        company.setIndustry(request.industry());
        company.setCompanySize(request.companySize());
        company.setHeadquartersLocation(request.headquartersLocation());
        company.setFoundedYear(request.foundedYear());
        company.setLinkedinUrl(request.linkedinUrl());

        company = companyRepository.save(company);
        return mapToSummary(company);
    }

    @Transactional
    public CompanyDto.CompanySummary uploadLogo(Long userId, Long companyId, MultipartFile file) {
        Company company = companyRepository.findById(companyId)
            .orElseThrow(() -> new ResourceNotFoundException("Company", companyId));

        Recruiter recruiter = recruiterRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Recruiter profile not found"));

        if (recruiter.getCompany() == null || !recruiter.getCompany().getId().equals(companyId)) {
            throw new UnauthorizedException("You are not authorized to update this company");
        }

        if (company.getLogoUrl() != null) {
            fileStorageService.deleteFile(company.getLogoUrl());
        }

        String logoPath = fileStorageService.storeCompanyLogo(file);
        company.setLogoUrl(logoPath);
        company = companyRepository.save(company);
        return mapToSummary(company);
    }

    private CompanyDto.CompanySummary mapToSummary(Company company) {
        return new CompanyDto.CompanySummary(
            company.getId(),
            company.getName(),
            company.getLogoUrl(),
            company.getIndustry(),
            company.getCompanySize(),
            company.getHeadquartersLocation(),
            company.getIsVerified(),
            company.getJobs().size()
        );
    }
}
