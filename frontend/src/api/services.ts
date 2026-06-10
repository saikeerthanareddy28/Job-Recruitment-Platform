import apiClient from './client'
import type {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  CandidateProfile,
  JobSummary,
  JobDetail,
  JobCategory,
  ApplicationSummary,
  ApplicationDetail,
  Company,
  Notification,
  PageResponse,
  User,
} from '../types'

// =================== Auth ===================
export const authApi = {
  login: (data: LoginRequest) =>
    apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data),

  register: (data: RegisterRequest) =>
    apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data),

  logout: () => apiClient.post<ApiResponse<void>>('/auth/logout'),

  forgotPassword: (email: string) =>
    apiClient.post<ApiResponse<void>>('/auth/forgot-password', { email }),

  resetPassword: (token: string, newPassword: string) =>
    apiClient.post<ApiResponse<void>>('/auth/reset-password', { token, newPassword }),

  changePassword: (currentPassword: string, newPassword: string) =>
    apiClient.post<ApiResponse<void>>('/auth/change-password', { currentPassword, newPassword }),

  refreshToken: (refreshToken: string) =>
    apiClient.post<ApiResponse<AuthResponse>>('/auth/refresh-token', { refreshToken }),
}

// =================== User ===================
export const userApi = {
  getMe: () => apiClient.get<ApiResponse<User>>('/users/me'),

  updateProfile: (data: { firstName: string; lastName: string; phoneNumber?: string }) =>
    apiClient.put<ApiResponse<User>>('/users/me', data),

  uploadProfilePicture: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return apiClient.post<ApiResponse<User>>('/users/me/profile-picture', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

// =================== Candidate ===================
export const candidateApi = {
  getProfile: () =>
    apiClient.get<ApiResponse<CandidateProfile>>('/candidate/profile'),

  updateProfile: (data: Partial<CandidateProfile>) =>
    apiClient.put<ApiResponse<CandidateProfile>>('/candidate/profile', data),

  updateLocation: (preferredLocation: string) =>
    apiClient.patch<ApiResponse<CandidateProfile>>('/candidate/profile/location', { preferredLocation }),

  updateSalary: (expectedSalary: number, salaryCurrency?: string) =>
    apiClient.patch<ApiResponse<CandidateProfile>>('/candidate/profile/salary', {
      expectedSalary,
      salaryCurrency: salaryCurrency ?? 'INR',
    }),

  getResumes: () =>
    apiClient.get<ApiResponse<CandidateProfile['resumes']>>('/candidate/resumes'),

  uploadResume: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return apiClient.post<ApiResponse<CandidateProfile['resumes'][0]>>('/candidate/resumes', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  replaceResume: (resumeId: number, file: File) => {
    const form = new FormData()
    form.append('file', file)
    return apiClient.put<ApiResponse<CandidateProfile['resumes'][0]>>(
      `/candidate/resumes/${resumeId}`,
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
  },

  deleteResume: (resumeId: number) =>
    apiClient.delete<ApiResponse<void>>(`/candidate/resumes/${resumeId}`),

  setPrimaryResume: (resumeId: number) =>
    apiClient.patch<ApiResponse<void>>(`/candidate/resumes/${resumeId}/set-primary`),

  downloadResume: (resumeId: number) =>
    apiClient.get(`/candidate/resumes/${resumeId}/download`, { responseType: 'blob' }),
}

// =================== Jobs ===================
export const jobsApi = {
  search: (params: {
    keyword?: string
    location?: string
    categoryId?: number
    employmentType?: string
    experienceLevel?: string
    minSalary?: number
    page?: number
    size?: number
  }) => apiClient.get<ApiResponse<PageResponse<JobSummary>>>('/jobs', { params }),

  getById: (jobId: number) =>
    apiClient.get<ApiResponse<JobDetail>>(`/jobs/${jobId}`),

  getCategories: () =>
    apiClient.get<ApiResponse<JobCategory[]>>('/categories'),

  createJob: (data: object) =>
    apiClient.post<ApiResponse<JobDetail>>('/recruiter/jobs', data),

  updateJob: (jobId: number, data: object) =>
    apiClient.put<ApiResponse<JobDetail>>(`/recruiter/jobs/${jobId}`, data),

  deleteJob: (jobId: number) =>
    apiClient.delete<ApiResponse<void>>(`/recruiter/jobs/${jobId}`),

  getMyJobs: (page = 0, size = 10) =>
    apiClient.get<ApiResponse<PageResponse<JobSummary>>>('/recruiter/jobs', { params: { page, size } }),
}

// =================== Applications ===================
export const applicationsApi = {
  apply: (jobId: number, resumeId?: number, coverLetter?: string) =>
    apiClient.post<ApiResponse<ApplicationSummary>>('/candidate/applications', {
      jobId,
      resumeId,
      coverLetter,
    }),

  withdraw: (applicationId: number) =>
    apiClient.patch<ApiResponse<void>>(`/candidate/applications/${applicationId}/withdraw`),

  getMyApplications: (page = 0, size = 10) =>
    apiClient.get<ApiResponse<PageResponse<ApplicationSummary>>>('/candidate/applications', {
      params: { page, size },
    }),

  saveJob: (jobId: number) =>
    apiClient.post<ApiResponse<void>>(`/candidate/saved-jobs/${jobId}`),

  unsaveJob: (jobId: number) =>
    apiClient.delete<ApiResponse<void>>(`/candidate/saved-jobs/${jobId}`),

  getSavedJobs: (page = 0, size = 10) =>
    apiClient.get<ApiResponse<PageResponse<JobSummary>>>('/candidate/saved-jobs', {
      params: { page, size },
    }),

  getJobApplications: (jobId: number, page = 0, size = 10) =>
    apiClient.get<ApiResponse<PageResponse<ApplicationDetail>>>(
      `/recruiter/jobs/${jobId}/applications`,
      { params: { page, size } }
    ),

  updateStatus: (applicationId: number, status: string, recruiterNotes?: string) =>
    apiClient.patch<ApiResponse<ApplicationDetail>>(
      `/recruiter/applications/${applicationId}/status`,
      { status, recruiterNotes }
    ),
}

// =================== Companies ===================
export const companiesApi = {
  getAll: () => apiClient.get<ApiResponse<Company[]>>('/companies'),

  getById: (id: number) => apiClient.get<ApiResponse<Company>>(`/companies/${id}`),

  create: (data: object) =>
    apiClient.post<ApiResponse<Company>>('/recruiter/companies', data),

  update: (id: number, data: object) =>
    apiClient.put<ApiResponse<Company>>(`/recruiter/companies/${id}`, data),

  uploadLogo: (id: number, file: File) => {
    const form = new FormData()
    form.append('file', file)
    return apiClient.post<ApiResponse<Company>>(`/recruiter/companies/${id}/logo`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

// =================== Notifications ===================
export const notificationsApi = {
  getAll: (page = 0, size = 20) =>
    apiClient.get<ApiResponse<PageResponse<Notification>>>('/notifications', {
      params: { page, size },
    }),

  getUnreadCount: () =>
    apiClient.get<ApiResponse<{ count: number }>>('/notifications/unread-count'),

  markAsRead: (id: number) =>
    apiClient.patch<ApiResponse<void>>(`/notifications/${id}/read`),

  markAllAsRead: () =>
    apiClient.patch<ApiResponse<void>>('/notifications/read-all'),
}

// =================== Admin ===================
export const adminApi = {
  getUsers: (page = 0, size = 20) =>
    apiClient.get<ApiResponse<PageResponse<User>>>('/admin/users', { params: { page, size } }),

  deactivateUser: (userId: number) =>
    apiClient.patch<ApiResponse<void>>(`/admin/users/${userId}/deactivate`),

  activateUser: (userId: number) =>
    apiClient.patch<ApiResponse<void>>(`/admin/users/${userId}/activate`),
}
