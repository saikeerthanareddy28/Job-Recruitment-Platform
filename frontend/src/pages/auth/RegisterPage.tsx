import { useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { Box, Card, CardContent, TextField, Button, Typography, Link, Alert, ToggleButton, ToggleButtonGroup, InputAdornment, IconButton, CircularProgress, Grid } from '@mui/material'
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
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  username: z.string().min(3, 'Username must be at least 3 characters').max(50),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phoneNumber: z.string().optional(),
})
type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()
  const [role, setRole] = useState<'CANDIDATE' | 'RECRUITER'>('CANDIDATE')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setError('')
    try {
      const res = await authApi.register({ ...data, role })
      login(res.data.data)
      navigate(role === 'RECRUITER' ? '/recruiter/dashboard' : '/')
      enqueueSnackbar('Account created successfully!', { variant: 'success' })
    } catch (e: any) {
      setError(e.response?.data?.message || 'Registration failed. Please try again.')
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f8fafc', p: 2 }}>
      <Box sx={{ width: '100%', maxWidth: 500 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Box sx={{ bgcolor: 'primary.main', borderRadius: 1.5, p: 0.8, display: 'flex' }}>
              <WorkIcon sx={{ color: 'white', fontSize: 22 }} />
            </Box>
            <Typography variant="h5" fontWeight={800}>Job<span style={{ color: '#2563eb' }}>Portal</span></Typography>
          </Box>
          <Typography variant="h5" fontWeight={700}>Create your account</Typography>
          <Typography variant="body2" color="text.secondary">Join thousands of professionals</Typography>
        </Box>

        <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
          <CardContent sx={{ p: 3 }}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>I am a:</Typography>
              <ToggleButtonGroup value={role} exclusive onChange={(_, v) => v && setRole(v)} fullWidth size="small">
                <ToggleButton value="CANDIDATE">Job Seeker</ToggleButton>
                <ToggleButton value="RECRUITER">Recruiter / Employer</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField fullWidth label="First Name" size="small" {...register('firstName')} error={!!errors.firstName} helperText={errors.firstName?.message} />
                </Grid>
                <Grid item xs={6}>
                  <TextField fullWidth label="Last Name" size="small" {...register('lastName')} error={!!errors.lastName} helperText={errors.lastName?.message} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Username" size="small" {...register('username')} error={!!errors.username} helperText={errors.username?.message} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Email" size="small" {...register('email')} error={!!errors.email} helperText={errors.email?.message} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Phone Number (optional)" size="small" {...register('phoneNumber')} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Password" type={showPassword ? 'text' : 'password'} size="small" {...register('password')} error={!!errors.password} helperText={errors.password?.message}
                    InputProps={{ endAdornment: <InputAdornment position="end"><IconButton size="small" onClick={() => setShowPassword(s => !s)}>{showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}</IconButton></InputAdornment> }} />
                </Grid>
              </Grid>
              <Button fullWidth variant="contained" type="submit" size="large" disabled={isSubmitting} sx={{ mt: 3 }}>
                {isSubmitting ? <CircularProgress size={22} color="inherit" /> : 'Create Account'}
              </Button>
            </Box>
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account? <Link component={RouterLink} to="/login">Sign in</Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  )
}
