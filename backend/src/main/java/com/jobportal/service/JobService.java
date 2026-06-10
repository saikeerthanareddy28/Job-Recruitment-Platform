package com.jobportal.service;

import com.jobportal.dto.*;
import com.jobportal.entity.*;
import com.jobportal.exception.*;
import com.jobportal.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class JobService {

    private final JobRepository jobRepository;
    private final CompanyRepository companyRepository;
    private final JobCategoryRepository categoryRepository;
    private final RecruiterRepository recruiterRepository;
    private final SavedJobRepository savedJobRepository;
    private final ApplicationRepository applicationRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public PageResponse<JobDto.JobSummary> searchJobs(JobDto.JobSearchRequest request, Long currentUserId) {
        Pageable pageable = PageRequest.of(
            request.page(), request.size(),
            Sort.by(Sort.Direction.DESC, "createdAt")
        );

        Page<Job> jobPage = jobRepository.searchJobs(
            request.keyword(),
            request.location(),
            request.categoryId(),
            request.employmentType(),
            request.experienceLevel(),
            request.minSalary(),
            pageable
        );

        Long candidateProfileId = null;
        if (currentUserId != null) {
            candidateProfileId = candidateProfileRepository.findByUserId(currentUserId)
                .map(CandidateProfile::getId).orElse(null);
        }

        final Long finalCandidateProfileId = candidateProfileId;
        List<JobDto.JobSummary> summaries = jobPage.getContent().stream()
            .map(job -> mapToJobSummary(job, finalCandidateProfileId))
            .collect(Collectors.toList());

        return new PageResponse<>(
            summaries,
            jobPage.getNumber(),
            jobPage.getSize(),
            jobPage.getTotalElements(),
            jobPage.getTotalPages(),
            jobPage.isLast(),
            jobPage.isFirst()
        );
    }

    @Transactional
    public JobDto.JobDetail getJobById(Long jobId, Long currentUserId) {
        Job job = jobRepository.findById(jobId)
            .orElseThrow(() -> new ResourceNotFoundException("Job", jobId));

        jobRepository.incrementViews(jobId);

        Long candidateProfileId = null;
        boolean hasApplied = false;
        boolean isSaved = false;

        if (currentUserId != null) {
            candidateProfileId = candidateProfileRepository.findByUserId(currentUserId)
                .map(CandidateProfile::getId).orElse(null);
            if (candidateProfileId != null) {
                hasApplied = applicationRepository.existsByCandidateProfileIdAndJobId(candidateProfileId, jobId);
                isSaved = savedJobRepository.existsByCandidateProfileIdAndJobId(candidateProfileId, jobId);
            }
        }

        return mapToJobDetail(job, isSaved, hasApplied);
    }

    @Transactional
    public JobDto.JobDetail createJob(Long userId, JobDto.CreateJobRequest request) {
        Recruiter recruiter = recruiterRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Recruiter profile not found"));

        Company company = companyRepository.findById(request.companyId())
            .orElseThrow(() -> new ResourceNotFoundException("Company", request.companyId()));

        JobCategory category = null;
        if (request.categoryId() != null) {
            category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", request.categoryId()));
        }

        Job job = Job.builder()
            .title(request.title())
            .description(request.description())
            .requirements(request.requirements())
            .responsibilities(request.responsibilities())
            .skillsRequired(request.skillsRequired())
            .company(company)
            .category(category)
            .postedBy(recruiter)
            .location(request.location())
            .isRemote(request.isRemote() != null ? request.isRemote() : false)
            .employmentType(request.employmentType())
            .experienceLevel(request.experienceLevel())
            .minSalary(request.minSalary())
            .maxSalary(request.maxSalary())
            .applicationDeadline(request.applicationDeadline())
            .status(Job.JobStatus.ACTIVE)
            .build();

        job = jobRepository.save(job);
        log.info("Job created: {} by recruiter {}", job.getTitle(), userId);
        return mapToJobDetail(job, false, false);
    }

    @Transactional
    public JobDto.JobDetail updateJob(Long userId, Long jobId, JobDto.UpdateJobRequest request) {
        Job job = jobRepository.findById(jobId)
            .orElseThrow(() -> new ResourceNotFoundException("Job", jobId));

        Recruiter recruiter = recruiterRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Recruiter profile not found"));

        if (!job.getPostedBy().getId().equals(recruiter.getId())) {
            throw new UnauthorizedException("You are not authorized to update this job");
        }

        if (request.categoryId() != null) {
            JobCategory category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", request.categoryId()));
            job.setCategory(category);
        }

        job.setTitle(request.title());
        job.setDescription(request.description());
        job.setRequirements(request.requirements());
        job.setResponsibilities(request.responsibilities());
        job.setSkillsRequired(request.skillsRequired());
        job.setLocation(request.location());
        job.setIsRemote(request.isRemote() != null ? request.isRemote() : false);
        job.setEmploymentType(request.employmentType());
        job.setExperienceLevel(request.experienceLevel());
        job.setMinSalary(request.minSalary());
        job.setMaxSalary(request.maxSalary());
        job.setApplicationDeadline(request.applicationDeadline());
        if (request.status() != null) {
            job.setStatus(request.status());
        }

        job = jobRepository.save(job);
        log.info("Job updated: {} by recruiter {}", jobId, userId);
        return mapToJobDetail(job, false, false);
    }

    @Transactional
    public void deleteJob(Long userId, Long jobId) {
        Job job = jobRepository.findById(jobId)
            .orElseThrow(() -> new ResourceNotFoundException("Job", jobId));

        Recruiter recruiter = recruiterRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Recruiter profile not found"));

        if (!job.getPostedBy().getId().equals(recruiter.getId())) {
            throw new UnauthorizedException("You are not authorized to delete this job");
        }

        job.setStatus(Job.JobStatus.CLOSED);
        jobRepository.save(job);
        log.info("Job closed: {} by recruiter {}", jobId, userId);
    }

    @Transactional(readOnly = true)
    public PageResponse<JobDto.JobSummary> getJobsByRecruiter(Long userId, int page, int size) {
        Recruiter recruiter = recruiterRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Recruiter profile not found"));

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Job> jobPage = jobRepository.findByPostedById(recruiter.getId(), pageable);

        List<JobDto.JobSummary> summaries = jobPage.getContent().stream()
            .map(job -> mapToJobSummary(job, null))
            .collect(Collectors.toList());

        return new PageResponse<>(summaries, jobPage.getNumber(), jobPage.getSize(),
            jobPage.getTotalElements(), jobPage.getTotalPages(), jobPage.isLast(), jobPage.isFirst());
    }

    @Transactional(readOnly = true)
    public List<JobCategoryDto> getAllCategories() {
        return categoryRepository.findByIsActiveTrue().stream()
            .map(c -> new JobCategoryDto(c.getId(), c.getName(), c.getSlug(), c.getDescription(), c.getIcon()))
            .collect(Collectors.toList());
    }

    public record JobCategoryDto(Long id, String name, String slug, String description, String icon) {}

    private JobDto.JobSummary mapToJobSummary(Job job, Long candidateProfileId) {
        boolean isSaved = candidateProfileId != null &&
            savedJobRepository.existsByCandidateProfileIdAndJobId(candidateProfileId, job.getId());

        return new JobDto.JobSummary(
            job.getId(),
            job.getTitle(),
            job.getCompany().getName(),
            job.getCompany().getLogoUrl(),
            job.getLocation(),
            job.getIsRemote(),
            job.getEmploymentType(),
            job.getExperienceLevel(),
            job.getMinSalary(),
            job.getMaxSalary(),
            job.getSalaryCurrency(),
            job.getStatus(),
            job.getCategory() != null ? job.getCategory().getId() : null,
            job.getCategory() != null ? job.getCategory().getName() : null,
            job.getApplicationsCount(),
            job.getCreatedAt(),
            isSaved
        );
    }

    private JobDto.JobDetail mapToJobDetail(Job job, boolean isSaved, boolean hasApplied) {
        return new JobDto.JobDetail(
            job.getId(),
            job.getTitle(),
            job.getDescription(),
            job.getRequirements(),
            job.getResponsibilities(),
            job.getSkillsRequired(),
            job.getCompany().getId(),
            job.getCompany().getName(),
            job.getCompany().getLogoUrl(),
            job.getCompany().getWebsiteUrl(),
            job.getCompany().getDescription(),
            job.getLocation(),
            job.getIsRemote(),
            job.getEmploymentType(),
            job.getExperienceLevel(),
            job.getMinSalary(),
            job.getMaxSalary(),
            job.getSalaryCurrency(),
            job.getApplicationDeadline(),
            job.getStatus(),
            job.getCategory() != null ? job.getCategory().getId() : null,
            job.getCategory() != null ? job.getCategory().getName() : null,
            job.getViewsCount(),
            job.getApplicationsCount(),
            job.getCreatedAt(),
            isSaved,
            hasApplied
        );
    }
}
