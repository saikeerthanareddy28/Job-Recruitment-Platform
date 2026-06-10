import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material'
import { useAuth } from './store/AuthContext'
import MainLayout from './components/layout/MainLayout'
import ProtectedRoute from './components/common/ProtectedRoute'

// Auth Pages
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'

// Candidate Pages
import HomePage from './pages/candidate/HomePage'
import FindJobsPage from './pages/candidate/FindJobsPage'
import JobDetailPage from './pages/candidate/JobDetailPage'
import MyApplicationsPage from './pages/candidate/MyApplicationsPage'
import SavedJobsPage from './pages/candidate/SavedJobsPage'
import ProfilePage from './pages/candidate/ProfilePage'

// Recruiter Pages
import RecruiterDashboardPage from './pages/recruiter/RecruiterDashboardPage'
import PostJobPage from './pages/recruiter/PostJobPage'
import ManageJobsPage from './pages/recruiter/ManageJobsPage'
import JobApplicantsPage from './pages/recruiter/JobApplicantsPage'
import CompanyProfilePage from './pages/recruiter/CompanyProfilePage'

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminUsersPage from './pages/admin/AdminUsersPage'

const theme = createTheme({
  palette: {
    primary: { main: '#2563eb', light: '#3b82f6', dark: '#1d4ed8' },
    secondary: { main: '#7c3aed' },
    background: { default: '#f8fafc', paper: '#ffffff' },
    text: { primary: '#1e293b', secondary: '#64748b' },
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    h1: { fontWeight: 800 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 8, fontWeight: 600, padding: '8px 20px' },
        contained: { boxShadow: 'none', '&:hover': { boxShadow: '0 4px 12px rgba(37,99,235,0.3)' } },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)' },
      },
    },
    MuiChip: {
      styleOverrides: { root: { borderRadius: 6, fontWeight: 500 } },
    },
  },
})

function RoleRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'RECRUITER') return <Navigate to="/recruiter/dashboard" replace />
  if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />
  return <Navigate to="/" replace />
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          {/* Public auth routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Public job browsing */}
          <Route path="/jobs" element={<MainLayout />}>
            <Route index element={<FindJobsPage />} />
            <Route path=":jobId" element={<JobDetailPage />} />
          </Route>

          {/* Candidate routes */}
          <Route path="/" element={
            <ProtectedRoute allowedRoles={['CANDIDATE']}>
              <MainLayout />
            </ProtectedRoute>
          }>
            <Route index element={<HomePage />} />
            <Route path="find-jobs" element={<FindJobsPage />} />
            <Route path="find-jobs/:jobId" element={<JobDetailPage />} />
            <Route path="my-applications" element={<MyApplicationsPage />} />
            <Route path="saved-jobs" element={<SavedJobsPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* Recruiter routes */}
          <Route path="/recruiter" element={
            <ProtectedRoute allowedRoles={['RECRUITER']}>
              <MainLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<RecruiterDashboardPage />} />
            <Route path="post-job" element={<PostJobPage />} />
            <Route path="jobs" element={<ManageJobsPage />} />
            <Route path="jobs/:jobId/applicants" element={<JobApplicantsPage />} />
            <Route path="company" element={<CompanyProfilePage />} />
          </Route>

          {/* Admin routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <MainLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="users" element={<AdminUsersPage />} />
          </Route>

          <Route path="/dashboard" element={<RoleRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
