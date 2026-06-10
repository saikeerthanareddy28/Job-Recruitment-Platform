package com.jobportal.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "jobs", indexes = {
    @Index(name = "idx_jobs_company", columnList = "company_id"),
    @Index(name = "idx_jobs_category", columnList = "category_id"),
    @Index(name = "idx_jobs_status", columnList = "status"),
    @Index(name = "idx_jobs_location", columnList = "location"),
    @Index(name = "idx_jobs_created_at", columnList = "created_at")
})
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(columnDefinition = "TEXT")
    private String requirements;

    @Column(columnDefinition = "TEXT")
    private String responsibilities;

    @Column(name = "skills_required", columnDefinition = "TEXT")
    private String skillsRequired;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private JobCategory category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "posted_by", nullable = false)
    private Recruiter postedBy;

    @Column(name = "location", length = 200)
    private String location;

    @Column(name = "is_remote", nullable = false)
    @Builder.Default
    private Boolean isRemote = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "employment_type", length = 30)
    private EmploymentType employmentType;

    @Enumerated(EnumType.STRING)
    @Column(name = "experience_level", length = 30)
    private ExperienceLevel experienceLevel;

    @Column(name = "min_salary", precision = 12, scale = 2)
    private BigDecimal minSalary;

    @Column(name = "max_salary", precision = 12, scale = 2)
    private BigDecimal maxSalary;

    @Column(name = "salary_currency", length = 10)
    @Builder.Default
    private String salaryCurrency = "INR";

    @Column(name = "application_deadline")
    private LocalDate applicationDeadline;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private JobStatus status = JobStatus.ACTIVE;

    @Column(name = "views_count", nullable = false)
    @Builder.Default
    private Integer viewsCount = 0;

    @Column(name = "applications_count", nullable = false)
    @Builder.Default
    private Integer applicationsCount = 0;

    @OneToMany(mappedBy = "job", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Application> applications = new ArrayList<>();

    @OneToMany(mappedBy = "job", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<SavedJob> savedByUsers = new ArrayList<>();

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum EmploymentType {
        FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP, FREELANCE
    }

    public enum ExperienceLevel {
        ENTRY_LEVEL, MID_LEVEL, SENIOR_LEVEL, LEAD, MANAGER, EXECUTIVE
    }

    public enum JobStatus {
        ACTIVE, CLOSED, DRAFT, EXPIRED
    }
}
