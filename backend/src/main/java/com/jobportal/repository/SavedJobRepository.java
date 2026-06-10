package com.jobportal.repository;

import com.jobportal.entity.SavedJob;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SavedJobRepository extends JpaRepository<SavedJob, Long> {
    Page<SavedJob> findByCandidateProfileId(Long candidateProfileId, Pageable pageable);
    Optional<SavedJob> findByCandidateProfileIdAndJobId(Long candidateProfileId, Long jobId);
    boolean existsByCandidateProfileIdAndJobId(Long candidateProfileId, Long jobId);
    void deleteByCandidateProfileIdAndJobId(Long candidateProfileId, Long jobId);
}
