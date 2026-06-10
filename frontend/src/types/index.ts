// =================== Auth ===================
export interface User {
  id: number
  email: string
  username: string
  firstName: string
  lastName: string
  profilePicture?: string
  role: 'CANDIDATE' | 'RECRUITER' | 'ADMIN'
  isActive: boolean
  createdAt: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  user: User
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  username: string
  password: string
  firstName: string
  lastName: string
  phoneNumber?: string
  role: 'CANDIDATE' | 'RECRUITER'
}

// =================== Candidate ===================
export interface Resume {
  id: number
  fileName: string
  originalName: string
  fileSize: number
  isPrimary: boolean
  createdAt: string
}

export interface CandidateProfile {
  id: number
  userId: number
  firstName: string
  lastName: string
  email: string
  phoneNumber?: string
  profilePicture?: string
  headline?: string
  summary?: string
  currentLocation?: string
  preferredLocation?: string
  expectedSalary?: number
  salaryCurrency: string
  experienceYears?: number
  noticePeriodDays?: number
  linkedinUrl?: string
  githubUrl?: string
  portfolioUrl?: string
  skills?: string
  resumes: Resume[]
  createdAt: string
}

// =================== Jobs ===================
export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'FREELANCE'
export type ExperienceLevel = 'ENTRY_LEVEL' | 'MID_LEVEL' | 'SENIOR_LEVEL' | 'LEAD' | 'MANAGER' | 'EXECUTIVE'
export type JobStatus = 'ACTIVE' | 'CLOSED' | 'DRAFT' | 'EXPIRED'

export interface JobSummary {
  id: number
  title: string
  companyName: string
  companyLogo?: string
  location?: string
  isRemote: boolean
  employmentType?: EmploymentType
  experienceLevel?: ExperienceLevel
  minSalary?: number
  maxSalary?: number
  salaryCurrency: string
  status: JobStatus
  categoryId?: number
  categoryName?: string
  applicationsCount: number
  createdAt: string
  isSaved: boolean
}

export interface JobDetail extends JobSummary {
  description: string
  requirements?: string
  responsibilities?: string
  skillsRequired?: string
  companyId: number
  companyWebsite?: string
  companyDescription?: string
  applicationDeadline?: string
  viewsCount: number
  hasApplied: boolean
}

export interface JobCategory {
  id: number
  name: string
  slug: string
  description?: string
  icon?: string
}

// =================== Applications ===================
export type ApplicationStatus =
  | 'APPLIED'
  | 'UNDER_REVIEW'
  | 'SHORTLISTED'
  | 'INTERVIEW_SCHEDULED'
  | 'OFFERED'
  | 'REJECTED'
  | 'WITHDRAWN'

export interface ApplicationSummary {
  id: number
  jobId: number
  jobTitle: string
  companyName: string
  companyLogo?: string
  jobLocation?: string
  status: ApplicationStatus
  appliedAt: string
  updatedAt: string
}

export interface ApplicationDetail {
  id: number
  jobId: number
  jobTitle: string
  companyName: string
  candidateProfileId: number
  candidateName: string
  candidateEmail: string
  candidatePhone?: string
  resumeId?: number
  resumeFileName?: string
  coverLetter?: string
  status: ApplicationStatus
  recruiterNotes?: string
  appliedAt: string
  reviewedAt?: string
}

// =================== Company ===================
export interface Company {
  id: number
  name: string
  logoUrl?: string
  industry?: string
  companySize?: string
  headquartersLocation?: string
  isVerified: boolean
  jobCount: number
}

// =================== Notifications ===================
export type NotificationType =
  | 'JOB_ALERT'
  | 'APPLICATION_UPDATE'
  | 'INTERVIEW_SCHEDULED'
  | 'NEW_MESSAGE'
  | 'PROFILE_VIEW'
  | 'SYSTEM'

export interface Notification {
  id: number
  type: NotificationType
  title: string
  message: string
  referenceId?: number
  referenceType?: string
  isRead: boolean
  actionUrl?: string
  createdAt: string
}

// =================== API ===================
export interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
  timestamp: string
}

export interface PageResponse<T> {
  content: T[]
  pageNumber: number
  pageSize: number
  totalElements: number
  totalPages: number
  last: boolean
  first: boolean
}
