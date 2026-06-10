package com.jobportal.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "companies", indexes = {
    @Index(name = "idx_companies_name", columnList = "name")
})
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(name = "logo_url")
    private String logoUrl;

    @Column(name = "website_url", length = 300)
    private String websiteUrl;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "industry", length = 100)
    private String industry;

    @Column(name = "company_size", length = 50)
    private String companySize;

    @Column(name = "headquarters_location", length = 200)
    private String headquartersLocation;

    @Column(name = "founded_year")
    private Integer foundedYear;

    @Column(name = "linkedin_url", length = 300)
    private String linkedinUrl;

    @Column(name = "is_verified", nullable = false)
    @Builder.Default
    private Boolean isVerified = false;

    @OneToMany(mappedBy = "company", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Recruiter> recruiters = new ArrayList<>();

    @OneToMany(mappedBy = "company", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Job> jobs = new ArrayList<>();

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
