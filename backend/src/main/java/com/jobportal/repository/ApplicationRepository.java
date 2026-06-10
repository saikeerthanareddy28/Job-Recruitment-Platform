package com.jobportal.repository;

import com.jobportal.entity.Application;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {

    Page<Application> findByCandidateProfileId(Long candidateProfileId, Pageable pageable);

    Page<Application> findByJobId(Long jobId, Pageable pageable);

    Optional<Application> findByCandidateProfileIdAndJobId(Long candidateProfileId, Long jobId);

    boolean existsByCandidateProfileIdAndJobId(Long candidateProfileId, Long jobId);

    @Query("SELECT COUNT(a) FROM Application a WHERE a.job.postedBy.id = :recruiterId")
    long countByRecruiterId(@Param("recruiterId") Long recruiterId);

    Page<Application> findByJobIdAndStatus(Long jobId, Application.ApplicationStatus status, Pageable pageable);

    long countByCandidateProfileId(Long candidateProfileId);
}
