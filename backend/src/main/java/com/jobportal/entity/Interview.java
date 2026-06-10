package com.jobportal.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "interviews", indexes = {
    @Index(name = "idx_interview_application", columnList = "application_id"),
    @Index(name = "idx_interview_scheduled_at", columnList = "scheduled_at")
})
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Interview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false, unique = true)
    private Application application;

    @Column(name = "scheduled_at", nullable = false)
    private LocalDateTime scheduledAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "interview_type", nullable = false, length = 30)
    private InterviewType interviewType;

    @Column(name = "meeting_link", length = 300)
    private String meetingLink;

    @Column(name = "location", length = 200)
    private String location;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private InterviewStatus status = InterviewStatus.SCHEDULED;

    @Column(name = "feedback", columnDefinition = "TEXT")
    private String feedback;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum InterviewType {
        PHONE, VIDEO, IN_PERSON, TECHNICAL, HR
    }

    public enum InterviewStatus {
        SCHEDULED, COMPLETED, CANCELLED, RESCHEDULED
    }
}
