-- ============================================================
-- JobPortal Database Schema
-- MySQL 8+
-- ============================================================

CREATE DATABASE IF NOT EXISTS jobportal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE jobportal;

-- ============================================================
-- Users
-- ============================================================
CREATE TABLE users (
    id                          BIGINT          NOT NULL AUTO_INCREMENT,
    email                       VARCHAR(100)    NOT NULL,
    username                    VARCHAR(50)     NOT NULL,
    password                    VARCHAR(255)    NOT NULL,
    first_name                  VARCHAR(50)     NOT NULL,
    last_name                   VARCHAR(50)     NOT NULL,
    phone_number                VARCHAR(20),
    profile_picture             VARCHAR(500),
    role                        ENUM('CANDIDATE','RECRUITER','ADMIN') NOT NULL,
    is_active                   TINYINT(1)      NOT NULL DEFAULT 1,
    is_email_verified           TINYINT(1)      NOT NULL DEFAULT 0,
    email_verification_token    VARCHAR(255),
    password_reset_token        VARCHAR(255),
    password_reset_token_expiry DATETIME,
    created_at                  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at                  DATETIME        ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_users_email    (email),
    UNIQUE KEY uk_users_username (username),
    INDEX idx_users_role         (role),
    INDEX idx_users_is_active    (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Refresh Tokens
-- ============================================================
CREATE TABLE refresh_tokens (
    id          BIGINT          NOT NULL AUTO_INCREMENT,
    user_id     BIGINT          NOT NULL,
    token       VARCHAR(512)    NOT NULL,
    expires_at  DATETIME        NOT NULL,
    is_revoked  TINYINT(1)      NOT NULL DEFAULT 0,
    created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_refresh_token  (token),
    INDEX idx_refresh_user       (user_id),
    INDEX idx_refresh_expires_at (expires_at),
    CONSTRAINT fk_refresh_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Job Categories
-- ============================================================
CREATE TABLE job_categories (
    id          BIGINT          NOT NULL AUTO_INCREMENT,
    name        VARCHAR(100)    NOT NULL,
    slug        VARCHAR(100)    NOT NULL,
    description TEXT,
    icon        VARCHAR(100),
    is_active   TINYINT(1)      NOT NULL DEFAULT 1,
    PRIMARY KEY (id),
    UNIQUE KEY uk_category_name (name),
    UNIQUE KEY uk_category_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Companies
-- ============================================================
CREATE TABLE companies (
    id                      BIGINT          NOT NULL AUTO_INCREMENT,
    name                    VARCHAR(200)    NOT NULL,
    logo_url                VARCHAR(500),
    website_url             VARCHAR(300),
    description             TEXT,
    industry                VARCHAR(100),
    company_size            VARCHAR(50),
    headquarters_location   VARCHAR(200),
    founded_year            INT,
    linkedin_url            VARCHAR(300),
    is_verified             TINYINT(1)      NOT NULL DEFAULT 0,
    created_at              DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              DATETIME        ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_company_name     (name),
    INDEX idx_company_industry (industry)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Recruiters
-- ============================================================
CREATE TABLE recruiters (
    id          BIGINT          NOT NULL AUTO_INCREMENT,
    user_id     BIGINT          NOT NULL,
    company_id  BIGINT,
    job_title   VARCHAR(100),
    department  VARCHAR(100),
    is_verified TINYINT(1)      NOT NULL DEFAULT 0,
    created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME        ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_recruiter_user (user_id),
    INDEX idx_recruiter_company  (company_id),
    CONSTRAINT fk_recruiter_user    FOREIGN KEY (user_id)    REFERENCES users(id)     ON DELETE CASCADE,
    CONSTRAINT fk_recruiter_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Candidate Profiles
-- ============================================================
CREATE TABLE candidate_profiles (
    id                  BIGINT          NOT NULL AUTO_INCREMENT,
    user_id             BIGINT          NOT NULL,
    headline            VARCHAR(200),
    summary             TEXT,
    current_location    VARCHAR(100),
    preferred_location  VARCHAR(100),
    expected_salary     DECIMAL(12,2),
    salary_currency     VARCHAR(10)     NOT NULL DEFAULT 'INR',
    experience_years    INT,
    notice_period_days  INT,
    linkedin_url        VARCHAR(300),
    github_url          VARCHAR(300),
    portfolio_url       VARCHAR(300),
    skills              TEXT,
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME        ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_candidate_user (user_id),
    CONSTRAINT fk_candidate_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Resumes
-- ============================================================
CREATE TABLE resumes (
    id                   BIGINT          NOT NULL AUTO_INCREMENT,
    candidate_profile_id BIGINT          NOT NULL,
    file_name            VARCHAR(255)    NOT NULL,
    original_name        VARCHAR(255)    NOT NULL,
    file_path            VARCHAR(500)    NOT NULL,
    file_size            BIGINT,
    content_type         VARCHAR(50),
    is_primary           TINYINT(1)      NOT NULL DEFAULT 0,
    created_at           DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at           DATETIME        ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_resume_candidate (candidate_profile_id),
    INDEX idx_resume_primary   (candidate_profile_id, is_primary),
    CONSTRAINT fk_resume_candidate FOREIGN KEY (candidate_profile_id) REFERENCES candidate_profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Jobs
-- ============================================================
CREATE TABLE jobs (
    id                    BIGINT          NOT NULL AUTO_INCREMENT,
    title                 VARCHAR(200)    NOT NULL,
    description           TEXT            NOT NULL,
    requirements          TEXT,
    responsibilities      TEXT,
    skills_required       TEXT,
    company_id            BIGINT          NOT NULL,
    category_id           BIGINT,
    posted_by             BIGINT          NOT NULL,
    location              VARCHAR(200),
    is_remote             TINYINT(1)      NOT NULL DEFAULT 0,
    employment_type       ENUM('FULL_TIME','PART_TIME','CONTRACT','INTERNSHIP','FREELANCE'),
    experience_level      ENUM('ENTRY_LEVEL','MID_LEVEL','SENIOR_LEVEL','LEAD','MANAGER','EXECUTIVE'),
    min_salary            DECIMAL(12,2),
    max_salary            DECIMAL(12,2),
    salary_currency       VARCHAR(10)     NOT NULL DEFAULT 'INR',
    application_deadline  DATE,
    status                ENUM('ACTIVE','CLOSED','DRAFT','EXPIRED') NOT NULL DEFAULT 'ACTIVE',
    views_count           INT             NOT NULL DEFAULT 0,
    applications_count    INT             NOT NULL DEFAULT 0,
    created_at            DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at            DATETIME        ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_job_company      (company_id),
    INDEX idx_job_category     (category_id),
    INDEX idx_job_posted_by    (posted_by),
    INDEX idx_job_status       (status),
    INDEX idx_job_location     (location),
    INDEX idx_job_created_at   (created_at),
    INDEX idx_job_emp_type     (employment_type),
    FULLTEXT INDEX ft_job_search (title, skills_required),
    CONSTRAINT fk_job_company   FOREIGN KEY (company_id)  REFERENCES companies(id)      ON DELETE CASCADE,
    CONSTRAINT fk_job_category  FOREIGN KEY (category_id) REFERENCES job_categories(id) ON DELETE SET NULL,
    CONSTRAINT fk_job_recruiter FOREIGN KEY (posted_by)   REFERENCES recruiters(id)     ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Applications
-- ============================================================
CREATE TABLE applications (
    id                   BIGINT  NOT NULL AUTO_INCREMENT,
    candidate_profile_id BIGINT  NOT NULL,
    job_id               BIGINT  NOT NULL,
    resume_id            BIGINT,
    cover_letter         TEXT,
    status               ENUM('APPLIED','UNDER_REVIEW','SHORTLISTED','INTERVIEW_SCHEDULED','OFFERED','REJECTED','WITHDRAWN') NOT NULL DEFAULT 'APPLIED',
    recruiter_notes      TEXT,
    applied_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reviewed_at          DATETIME,
    created_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at           DATETIME ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_application_candidate_job (candidate_profile_id, job_id),
    INDEX idx_app_candidate (candidate_profile_id),
    INDEX idx_app_job       (job_id),
    INDEX idx_app_status    (status),
    INDEX idx_app_applied   (applied_at),
    CONSTRAINT fk_app_candidate FOREIGN KEY (candidate_profile_id) REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    CONSTRAINT fk_app_job       FOREIGN KEY (job_id)               REFERENCES jobs(id)               ON DELETE CASCADE,
    CONSTRAINT fk_app_resume    FOREIGN KEY (resume_id)            REFERENCES resumes(id)            ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Saved Jobs
-- ============================================================
CREATE TABLE saved_jobs (
    id                   BIGINT  NOT NULL AUTO_INCREMENT,
    candidate_profile_id BIGINT  NOT NULL,
    job_id               BIGINT  NOT NULL,
    saved_at             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_saved_job (candidate_profile_id, job_id),
    INDEX idx_saved_candidate (candidate_profile_id),
    INDEX idx_saved_job_id    (job_id),
    CONSTRAINT fk_saved_candidate FOREIGN KEY (candidate_profile_id) REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    CONSTRAINT fk_saved_job       FOREIGN KEY (job_id)               REFERENCES jobs(id)               ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Interviews
-- ============================================================
CREATE TABLE interviews (
    id             BIGINT       NOT NULL AUTO_INCREMENT,
    application_id BIGINT       NOT NULL,
    scheduled_at   DATETIME     NOT NULL,
    interview_type ENUM('PHONE','VIDEO','IN_PERSON','TECHNICAL','HR') NOT NULL,
    meeting_link   VARCHAR(300),
    location       VARCHAR(200),
    notes          TEXT,
    status         ENUM('SCHEDULED','COMPLETED','CANCELLED','RESCHEDULED') NOT NULL DEFAULT 'SCHEDULED',
    feedback       TEXT,
    created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME     ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_interview_application (application_id),
    INDEX idx_interview_scheduled (scheduled_at),
    CONSTRAINT fk_interview_application FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Notifications
-- ============================================================
CREATE TABLE notifications (
    id             BIGINT       NOT NULL AUTO_INCREMENT,
    user_id        BIGINT       NOT NULL,
    type           ENUM('JOB_ALERT','APPLICATION_UPDATE','INTERVIEW_SCHEDULED','NEW_MESSAGE','PROFILE_VIEW','SYSTEM') NOT NULL,
    title          VARCHAR(200) NOT NULL,
    message        TEXT         NOT NULL,
    reference_id   BIGINT,
    reference_type VARCHAR(50),
    is_read        TINYINT(1)   NOT NULL DEFAULT 0,
    action_url     VARCHAR(300),
    created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_notif_user    (user_id),
    INDEX idx_notif_is_read (is_read),
    INDEX idx_notif_created (created_at),
    CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Audit Logs
-- ============================================================
CREATE TABLE audit_logs (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    user_id     BIGINT,
    action      VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id   BIGINT,
    details     TEXT,
    ip_address  VARCHAR(45),
    user_agent  VARCHAR(500),
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_audit_user       (user_id),
    INDEX idx_audit_action     (action),
    INDEX idx_audit_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Seed Data
-- ============================================================

-- Admin user (password: Admin@123456)
INSERT INTO users (email, username, password, first_name, last_name, role, is_active, is_email_verified)
VALUES ('admin@jobportal.com', 'admin', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewrUHcKYqzQwkV3u', 'System', 'Admin', 'ADMIN', 1, 1);

-- Job Categories
INSERT INTO job_categories (name, slug, description, icon, is_active) VALUES
('Information Technology', 'information-technology', 'Software, hardware, and IT services', 'computer', 1),
('Finance & Accounting', 'finance-accounting', 'Banking, finance, and accounting roles', 'account_balance', 1),
('Marketing', 'marketing', 'Digital marketing, brand management, and advertising', 'campaign', 1),
('Human Resources', 'human-resources', 'HR, talent acquisition, and people operations', 'people', 1),
('Sales', 'sales', 'Sales, business development, and account management', 'trending_up', 1),
('Design', 'design', 'UI/UX, graphic design, and product design', 'design_services', 1),
('Data Science & Analytics', 'data-science', 'Data science, ML, and business analytics', 'analytics', 1),
('Operations', 'operations', 'Operations management and supply chain', 'settings', 1),
('Customer Support', 'customer-support', 'Customer service and technical support', 'support_agent', 1),
('Engineering', 'engineering', 'Civil, mechanical, and electrical engineering', 'engineering', 1);
