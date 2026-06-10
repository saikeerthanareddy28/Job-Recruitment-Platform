package com.jobportal.repository;

import com.jobportal.entity.Resume;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResumeRepository extends JpaRepository<Resume, Long> {

    List<Resume> findByCandidateProfileId(Long candidateProfileId);

    Optional<Resume> findByCandidateProfileIdAndIsPrimary(Long candidateProfileId, boolean isPrimary);

    @Modifying
    @Query("UPDATE Resume r SET r.isPrimary = false WHERE r.candidateProfile.id = :profileId")
    void clearPrimaryForProfile(@Param("profileId") Long profileId);
}
