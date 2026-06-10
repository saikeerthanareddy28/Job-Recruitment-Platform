package com.jobportal.repository;

import com.jobportal.entity.Job;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<Job, Long>, JpaSpecificationExecutor<Job> {

    Page<Job> findByStatus(Job.JobStatus status, Pageable pageable);

    Page<Job> findByCompanyIdAndStatus(Long companyId, Job.JobStatus status, Pageable pageable);

    Page<Job> findByPostedByIdAndStatus(Long recruiterId, Job.JobStatus status, Pageable pageable);

    List<Job> findByPostedById(Long recruiterId);
    Page<Job> findByPostedById(Long recruiterId, Pageable pageable);

    @Query("""
        SELECT j FROM Job j
        WHERE j.status = 'ACTIVE'
        AND (:keyword IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
             OR LOWER(j.description) LIKE LOWER(CONCAT('%', :keyword, '%'))
             OR LOWER(j.skillsRequired) LIKE LOWER(CONCAT('%', :keyword, '%')))
        AND (:location IS NULL OR LOWER(j.location) LIKE LOWER(CONCAT('%', :location, '%')))
        AND (:categoryId IS NULL OR j.category.id = :categoryId)
        AND (:employmentType IS NULL OR j.employmentType = :employmentType)
        AND (:experienceLevel IS NULL OR j.experienceLevel = :experienceLevel)
        AND (:minSalary IS NULL OR j.maxSalary >= :minSalary)
        ORDER BY j.createdAt DESC
        """)
    Page<Job> searchJobs(
        @Param("keyword") String keyword,
        @Param("location") String location,
        @Param("categoryId") Long categoryId,
        @Param("employmentType") Job.EmploymentType employmentType,
        @Param("experienceLevel") Job.ExperienceLevel experienceLevel,
        @Param("minSalary") java.math.BigDecimal minSalary,
        Pageable pageable
    );

    @Modifying
    @Query("UPDATE Job j SET j.viewsCount = j.viewsCount + 1 WHERE j.id = :id")
    void incrementViews(@Param("id") Long id);

    @Modifying
    @Query("UPDATE Job j SET j.applicationsCount = j.applicationsCount + 1 WHERE j.id = :id")
    void incrementApplicationsCount(@Param("id") Long id);

    @Query("SELECT COUNT(j) FROM Job j WHERE j.status = 'ACTIVE'")
    long countActiveJobs();
}
