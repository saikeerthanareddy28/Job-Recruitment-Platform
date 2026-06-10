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
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final JobRepository jobRepository;
    private final ResumeRepository resumeRepository;
    private final RecruiterRepository recruiterRepository;
    private final SavedJobRepository savedJobRepository;
    private final NotificationService notificationService;

    @Transactional
    public ApplicationDto.ApplicationSummary applyToJob(Long userId, ApplicationDto.ApplyRequest request) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Candidate profile not found"));

        Job job = jobRepository.findById(request.jobId())
            .orElseThrow(() -> new ResourceNotFoundException("Job", request.jobId()));

        if (job.getStatus() != Job.JobStatus.ACTIVE) {
            throw new BadRequestException("This job is no longer accepting applications");
        }

        if (applicationRepository.existsByCandidateProfileIdAndJobId(profile.getId(), request.jobId())) {
            throw new ConflictException("You have already applied to this job");
        }

        Resume resume = null;
        if (request.resumeId() != null) {
            resume = resumeRepository.findById(request.resumeId())
                .filter(r -> r.getCandidateProfile().getId().equals(profile.getId()))
                .orElseThrow(() -> new BadRequestException("Invalid resume selected"));
        } else {
            resume = resumeRepository.findByCandidateProfileIdAndIsPrimary(profile.getId(), true).orElse(null);
        }

        Application application = Application.builder()
            .candidateProfile(profile)
            .job(job)
            .resume(resume)
            .coverLetter(request.coverLetter())
            .status(Application.ApplicationStatus.APPLIED)
            .build();

        application = applicationRepository.save(application);
        jobRepository.incrementApplicationsCount(request.jobId());

        User recruiterUser = job.getPostedBy().getUser();
        notificationService.createNotification(
            recruiterUser,
            Notification.NotificationType.APPLICATION_UPDATE,
            "New Application Received",
            profile.getUser().getFirstName() + " " + profile.getUser().getLastName() +
                " applied for " + job.getTitle(),
            application.getId(),
            "APPLICATION",
            "/recruiter/applications/" + application.getId()
        );

        log.info("User {} applied to job {}", userId, request.jobId());
        return mapToApplicationSummary(application);
    }

    @Transactional
    public void withdrawApplication(Long userId, Long applicationId) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Candidate profile not found"));

        Application application = applicationRepository.findById(applicationId)
            .orElseThrow(() -> new ResourceNotFoundException("Application", applicationId));

        if (!application.getCandidateProfile().getId().equals(profile.getId())) {
            throw new UnauthorizedException("You are not authorized to withdraw this application");
        }

        if (application.getStatus() == Application.ApplicationStatus.WITHDRAWN) {
            throw new BadRequestException("Application is already withdrawn");
        }

        application.setStatus(Application.ApplicationStatus.WITHDRAWN);
        applicationRepository.save(application);
        log.info("Application {} withdrawn by user {}", applicationId, userId);
    }

    @Transactional(readOnly = true)
    public PageResponse<ApplicationDto.ApplicationSummary> getCandidateApplications(Long userId, int page, int size) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Candidate profile not found"));

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "appliedAt"));
        Page<Application> appPage = applicationRepository.findByCandidateProfileId(profile.getId(), pageable);

        List<ApplicationDto.ApplicationSummary> summaries = appPage.getContent().stream()
            .map(this::mapToApplicationSummary)
            .collect(Collectors.toList());

        return new PageResponse<>(summaries, appPage.getNumber(), appPage.getSize(),
            appPage.getTotalElements(), appPage.getTotalPages(), appPage.isLast(), appPage.isFirst());
    }

    @Transactional(readOnly = true)
    public PageResponse<ApplicationDto.ApplicationDetail> getJobApplications(Long userId, Long jobId, int page, int size) {
        Recruiter recruiter = recruiterRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Recruiter profile not found"));

        Job job = jobRepository.findById(jobId)
            .orElseThrow(() -> new ResourceNotFoundException("Job", jobId));

        if (!job.getPostedBy().getId().equals(recruiter.getId())) {
            throw new UnauthorizedException("You are not authorized to view applications for this job");
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "appliedAt"));
        Page<Application> appPage = applicationRepository.findByJobId(jobId, pageable);

        List<ApplicationDto.ApplicationDetail> details = appPage.getContent().stream()
            .map(this::mapToApplicationDetail)
            .collect(Collectors.toList());

        return new PageResponse<>(details, appPage.getNumber(), appPage.getSize(),
            appPage.getTotalElements(), appPage.getTotalPages(), appPage.isLast(), appPage.isFirst());
    }

    @Transactional
    public ApplicationDto.ApplicationDetail updateApplicationStatus(Long userId, Long applicationId, ApplicationDto.UpdateStatusRequest request) {
        Recruiter recruiter = recruiterRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Recruiter profile not found"));

        Application application = applicationRepository.findById(applicationId)
            .orElseThrow(() -> new ResourceNotFoundException("Application", applicationId));

        if (!application.getJob().getPostedBy().getId().equals(recruiter.getId())) {
            throw new UnauthorizedException("You are not authorized to update this application");
        }

        Application.ApplicationStatus previousStatus = application.getStatus();
        application.setStatus(request.status());
        if (request.recruiterNotes() != null) {
            application.setRecruiterNotes(request.recruiterNotes());
        }
        application.setReviewedAt(java.time.LocalDateTime.now());
        application = applicationRepository.save(application);

        User candidateUser = application.getCandidateProfile().getUser();
        String statusMessage = buildStatusMessage(request.status(), application.getJob().getTitle());
        notificationService.createNotification(
            candidateUser,
            Notification.NotificationType.APPLICATION_UPDATE,
            "Application Status Updated",
            statusMessage,
            application.getId(),
            "APPLICATION",
            "/my-applications/" + application.getId()
        );

        log.info("Application {} status updated to {} by recruiter {}", applicationId, request.status(), userId);
        return mapToApplicationDetail(application);
    }

    @Transactional
    public void saveJob(Long userId, Long jobId) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Candidate profile not found"));

        Job job = jobRepository.findById(jobId)
            .orElseThrow(() -> new ResourceNotFoundException("Job", jobId));

        if (savedJobRepository.existsByCandidateProfileIdAndJobId(profile.getId(), jobId)) {
            throw new ConflictException("Job is already saved");
        }

        SavedJob savedJob = SavedJob.builder()
            .candidateProfile(profile)
            .job(job)
            .build();
        savedJobRepository.save(savedJob);
    }

    @Transactional
    public void unsaveJob(Long userId, Long jobId) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Candidate profile not found"));

        if (!savedJobRepository.existsByCandidateProfileIdAndJobId(profile.getId(), jobId)) {
            throw new ResourceNotFoundException("Saved job not found");
        }

        savedJobRepository.deleteByCandidateProfileIdAndJobId(profile.getId(), jobId);
    }

    @Transactional(readOnly = true)
    public PageResponse<JobDto.JobSummary> getSavedJobs(Long userId, int page, int size) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Candidate profile not found"));

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "savedAt"));
        Page<SavedJob> savedJobPage = savedJobRepository.findByCandidateProfileId(profile.getId(), pageable);

        List<JobDto.JobSummary> summaries = savedJobPage.getContent().stream()
            .map(sj -> mapSavedJobToSummary(sj, profile.getId()))
            .collect(Collectors.toList());

        return new PageResponse<>(summaries, savedJobPage.getNumber(), savedJobPage.getSize(),
            savedJobPage.getTotalElements(), savedJobPage.getTotalPages(), savedJobPage.isLast(), savedJobPage.isFirst());
    }

    private String buildStatusMessage(Application.ApplicationStatus status, String jobTitle) {
        return switch (status) {
            case UNDER_REVIEW -> "Your application for " + jobTitle + " is now under review.";
            case SHORTLISTED -> "Congratulations! You have been shortlisted for " + jobTitle + ".";
            case INTERVIEW_SCHEDULED -> "An interview has been scheduled for your application to " + jobTitle + ".";
            case OFFERED -> "Congratulations! You have received an offer for " + jobTitle + "!";
            case REJECTED -> "Thank you for applying to " + jobTitle + ". Unfortunately, we have decided to move forward with other candidates.";
            default -> "Your application status for " + jobTitle + " has been updated to " + status.name().replace('_', ' ').toLowerCase() + ".";
        };
    }

    private ApplicationDto.ApplicationSummary mapToApplicationSummary(Application application) {
        return new ApplicationDto.ApplicationSummary(
            application.getId(),
            application.getJob().getId(),
            application.getJob().getTitle(),
            application.getJob().getCompany().getName(),
            application.getJob().getCompany().getLogoUrl(),
            application.getJob().getLocation(),
            application.getStatus(),
            application.getAppliedAt(),
            application.getUpdatedAt()
        );
    }

    private ApplicationDto.ApplicationDetail mapToApplicationDetail(Application application) {
        User user = application.getCandidateProfile().getUser();
        CandidateProfile profile = application.getCandidateProfile();
        return new ApplicationDto.ApplicationDetail(
            application.getId(),
            application.getJob().getId(),
            application.getJob().getTitle(),
            application.getJob().getCompany().getName(),
            profile.getId(),
            user.getFirstName() + " " + user.getLastName(),
            user.getEmail(),
            user.getPhoneNumber(),
            application.getResume() != null ? application.getResume().getId() : null,
            application.getResume() != null ? application.getResume().getOriginalName() : null,
            application.getCoverLetter(),
            application.getStatus(),
            application.getRecruiterNotes(),
            application.getAppliedAt(),
            application.getReviewedAt()
        );
    }

    private JobDto.JobSummary mapSavedJobToSummary(SavedJob savedJob, Long candidateProfileId) {
        Job job = savedJob.getJob();
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
            true
        );
    }
}
