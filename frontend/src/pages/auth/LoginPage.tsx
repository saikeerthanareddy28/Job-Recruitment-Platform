import { useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { Box, Card, CardContent, TextField, Button, Typography, Link, Alert, InputAdornment, IconButton, CircularProgress } from '@mui/material'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import WorkIcon from '@mui/icons-material/Work'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { authApi } from '../../api/services'
import { useAuth } from '../../store/AuthContext'
import { useSnackbar } from 'notistack'

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})
type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setError('')
    try {
      const res = await authApi.login(data)
      login(res.data.data)
      const role = res.data.data.user.role
      if (role === 'RECRUITER') navigate('/recruiter/dashboard')
      else if (role === 'ADMIN') navigate('/admin/dashboard')
      else navigate('/')
      enqueueSnackbar(`Welcome back, ${res.data.data.user.firstName}!`, { variant: 'success' })
    } catch (e: any) {
      setError(e.response?.data?.message || 'Invalid email or password')
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f8fafc', p: 2 }}>
      <Box sx={{ width: '100%', maxWidth: 440 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Box sx={{ bgcolor: 'primary.main', borderRadius: 1.5, p: 0.8, display: 'flex' }}>
              <WorkIcon sx={{ color: 'white', fontSize: 22 }} />
            </Box>
            <Typography variant="h5" fontWeight={800}>Job<span style={{ color: '#2563eb' }}>Portal</span></Typography>
          </Box>
          <Typography variant="h5" fontWeight={700}>Welcome back</Typography>
          <Typography variant="body2" color="text.secondary">Sign in to your account</Typography>
        </Box>

        <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
          <CardContent sx={{ p: 3 }}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
              <TextField fullWidth label="Email address" size="small" sx={{ mb: 2 }} {...register('email')} error={!!errors.email} helperText={errors.email?.message} />
              <TextField fullWidth label="Password" type={showPassword ? 'text' : 'password'} size="small" sx={{ mb: 1 }} {...register('password')} error={!!errors.password} helperText={errors.password?.message}
                InputProps={{ endAdornment: <InputAdornment position="end"><IconButton size="small" onClick={() => setShowPassword(s => !s)}>{showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}</IconButton></InputAdornment> }} />
              <Box sx={{ textAlign: 'right', mb: 2 }}>
                <Link component={RouterLink} to="/forgot-password" variant="body2">Forgot password?</Link>
              </Box>
              <Button fullWidth variant="contained" type="submit" size="large" disabled={isSubmitting}>
                {isSubmitting ? <CircularProgress size={22} color="inherit" /> : 'Sign In'}
              </Button>
            </Box>
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account? <Link component={RouterLink} to="/register">Sign up</Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  )
}
