package com.jobportal.repository;

import com.jobportal.entity.JobCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JobCategoryRepository extends JpaRepository<JobCategory, Long> {
    List<JobCategory> findByIsActiveTrue();
    Optional<JobCategory> findBySlug(String slug);
    boolean existsByName(String name);
}
