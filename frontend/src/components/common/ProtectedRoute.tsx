import { Navigate } from 'react-router-dom'
import { CircularProgress, Box } from '@mui/material'
import { useAuth } from '../../store/AuthContext'

interface Props {
  children: React.ReactNode
  allowedRoles?: string[]
}

export default function ProtectedRoute({ children, allowedRoles }: Props) {
  const { isAuthenticated, isLoading, user } = useAuth()

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    if (user.role === 'RECRUITER') return <Navigate to="/recruiter/dashboard" replace />
    if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
