package com.jobportal.service;

import com.jobportal.dto.CandidateDto;
import com.jobportal.entity.*;
import com.jobportal.exception.*;
import com.jobportal.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CandidateService {

    private final CandidateProfileRepository candidateProfileRepository;
    private final UserRepository userRepository;
    private final ResumeRepository resumeRepository;
    private final FileStorageService fileStorageService;

    @Transactional(readOnly = true)
    public CandidateDto.CandidateProfileResponse getProfile(Long userId) {
        CandidateProfile profile = getProfileByUserId(userId);
        return mapToProfileResponse(profile);
    }

    @Transactional
    public CandidateDto.CandidateProfileResponse updateProfile(Long userId, CandidateDto.UpdateCandidateProfileRequest request) {
        CandidateProfile profile = getProfileByUserId(userId);
        profile.setHeadline(request.headline());
        profile.setSummary(request.summary());
        profile.setCurrentLocation(request.currentLocation());
        profile.setPreferredLocation(request.preferredLocation());
        profile.setExpectedSalary(request.expectedSalary());
        profile.setExperienceYears(request.experienceYears());
        profile.setNoticePeriodDays(request.noticePeriodDays());
        profile.setLinkedinUrl(request.linkedinUrl());
        profile.setGithubUrl(request.githubUrl());
        profile.setPortfolioUrl(request.portfolioUrl());
        profile.setSkills(request.skills());
        profile = candidateProfileRepository.save(profile);
        return mapToProfileResponse(profile);
    }

    @Transactional
    public CandidateDto.CandidateProfileResponse updatePreferredLocation(Long userId, CandidateDto.UpdateLocationRequest request) {
        CandidateProfile profile = getProfileByUserId(userId);
        profile.setPreferredLocation(request.preferredLocation());
        profile = candidateProfileRepository.save(profile);
        return mapToProfileResponse(profile);
    }

    @Transactional
    public CandidateDto.CandidateProfileResponse updateExpectedSalary(Long userId, CandidateDto.UpdateSalaryRequest request) {
        CandidateProfile profile = getProfileByUserId(userId);
        profile.setExpectedSalary(request.expectedSalary());
        if (request.salaryCurrency() != null) profile.setSalaryCurrency(request.salaryCurrency());
        profile = candidateProfileRepository.save(profile);
        return mapToProfileResponse(profile);
    }

    @Transactional
    public CandidateDto.ResumeDto uploadResume(Long userId, MultipartFile file) {
        CandidateProfile profile = getProfileByUserId(userId);
        String filePath = fileStorageService.storeResume(file);
        boolean hasPrimary = resumeRepository.findByCandidateProfileId(profile.getId()).stream().anyMatch(Resume::getIsPrimary);
        Resume resume = Resume.builder()
            .candidateProfile(profile)
            .fileName(filePath.substring(filePath.lastIndexOf('/') + 1))
            .originalName(file.getOriginalFilename())
            .filePath(filePath).fileSize(file.getSize()).contentType(file.getContentType())
            .isPrimary(!hasPrimary).build();
        resume = resumeRepository.save(resume);
        return mapToResumeDto(resume);
    }

    @Transactional
    public CandidateDto.ResumeDto replaceResume(Long userId, Long resumeId, MultipartFile file) {
        CandidateProfile profile = getProfileByUserId(userId);
        Resume resume = resumeRepository.findById(resumeId)
            .orElseThrow(() -> new ResourceNotFoundException("Resume", resumeId));
        if (!resume.getCandidateProfile().getId().equals(profile.getId()))
            throw new UnauthorizedException("You do not own this resume");
        fileStorageService.deleteFile(resume.getFilePath());
        String filePath = fileStorageService.storeResume(file);
        resume.setFileName(filePath.substring(filePath.lastIndexOf('/') + 1));
        resume.setOriginalName(file.getOriginalFilename());
        resume.setFilePath(filePath); resume.setFileSize(file.getSize()); resume.setContentType(file.getContentType());
        return mapToResumeDto(resumeRepository.save(resume));
    }

    @Transactional
    public void deleteResume(Long userId, Long resumeId) {
        CandidateProfile profile = getProfileByUserId(userId);
        Resume resume = resumeRepository.findById(resumeId)
            .orElseThrow(() -> new ResourceNotFoundException("Resume", resumeId));
        if (!resume.getCandidateProfile().getId().equals(profile.getId()))
            throw new UnauthorizedException("You do not own this resume");
        fileStorageService.deleteFile(resume.getFilePath());
        resumeRepository.delete(resume);
        if (resume.getIsPrimary()) {
            resumeRepository.findByCandidateProfileId(profile.getId()).stream().findFirst()
                .ifPresent(r -> { r.setIsPrimary(true); resumeRepository.save(r); });
        }
    }

    @Transactional
    public void setPrimaryResume(Long userId, Long resumeId) {
        CandidateProfile profile = getProfileByUserId(userId);
        Resume resume = resumeRepository.findById(resumeId)
            .orElseThrow(() -> new ResourceNotFoundException("Resume", resumeId));
        if (!resume.getCandidateProfile().getId().equals(profile.getId()))
            throw new UnauthorizedException("You do not own this resume");
        resumeRepository.clearPrimaryForProfile(profile.getId());
        resume.setIsPrimary(true);
        resumeRepository.save(resume);
    }

    @Transactional(readOnly = true)
    public List<CandidateDto.ResumeDto> getResumes(Long userId) {
        CandidateProfile profile = getProfileByUserId(userId);
        return resumeRepository.findByCandidateProfileId(profile.getId())
            .stream().map(this::mapToResumeDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Path getResumeFilePath(Long resumeId) {
        Resume resume = resumeRepository.findById(resumeId)
            .orElseThrow(() -> new ResourceNotFoundException("Resume", resumeId));
        return fileStorageService.resolveFilePath(resume.getFilePath());
    }

    public CandidateProfile getProfileByUserId(Long userId) {
        return candidateProfileRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Candidate profile not found for user " + userId));
    }

    private CandidateDto.CandidateProfileResponse mapToProfileResponse(CandidateProfile profile) {
        User user = profile.getUser();
        List<CandidateDto.ResumeDto> resumeDtos = resumeRepository
            .findByCandidateProfileId(profile.getId()).stream().map(this::mapToResumeDto).collect(Collectors.toList());
        return new CandidateDto.CandidateProfileResponse(
            profile.getId(), user.getId(), user.getFirstName(), user.getLastName(),
            user.getEmail(), user.getPhoneNumber(), user.getProfilePicture(),
            profile.getHeadline(), profile.getSummary(), profile.getCurrentLocation(),
            profile.getPreferredLocation(), profile.getExpectedSalary(), profile.getSalaryCurrency(),
            profile.getExperienceYears(), profile.getNoticePeriodDays(), profile.getLinkedinUrl(),
            profile.getGithubUrl(), profile.getPortfolioUrl(), profile.getSkills(),
            resumeDtos, profile.getCreatedAt());
    }

    private CandidateDto.ResumeDto mapToResumeDto(Resume resume) {
        return new CandidateDto.ResumeDto(resume.getId(), resume.getFileName(), resume.getOriginalName(),
            resume.getFileSize(), resume.getIsPrimary(), resume.getCreatedAt());
    }
}
