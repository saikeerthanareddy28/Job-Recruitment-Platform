import { useState } from 'react'
import { Link as RouterLink, useSearchParams, useNavigate } from 'react-router-dom'
import { Box, Card, CardContent, TextField, Button, Typography, Link, Alert, CircularProgress, InputAdornment, IconButton } from '@mui/material'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import WorkIcon from '@mui/icons-material/Work'
import { authApi } from '../../api/services'
import { useSnackbar } from 'notistack'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()
  const token = searchParams.get('token') || ''
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    setLoading(true); setError('')
    try {
      await authApi.resetPassword(token, password)
      enqueueSnackbar('Password reset successfully! Please sign in.', { variant: 'success' })
      navigate('/login')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid or expired reset link')
    } finally { setLoading(false) }
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f8fafc', p: 2 }}>
      <Box sx={{ width: '100%', maxWidth: 420 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Box sx={{ bgcolor: 'primary.main', borderRadius: 1.5, p: 0.8, display: 'flex' }}><WorkIcon sx={{ color: 'white', fontSize: 22 }} /></Box>
            <Typography variant="h5" fontWeight={800}>Job<span style={{ color: '#2563eb' }}>Portal</span></Typography>
          </Box>
          <Typography variant="h5" fontWeight={700}>Reset Password</Typography>
          <Typography variant="body2" color="text.secondary">Enter your new password below</Typography>
        </Box>
        <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
          <CardContent sx={{ p: 3 }}>
            {!token ? (
              <Alert severity="error">Invalid reset link. Please request a new one.</Alert>
            ) : (
              <>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <Box component="form" onSubmit={handleSubmit}>
                  <TextField fullWidth label="New Password" type={showPassword ? 'text' : 'password'} size="small" value={password} onChange={e => setPassword(e.target.value)} sx={{ mb: 2 }}
                    InputProps={{ endAdornment: <InputAdornment position="end"><IconButton size="small" onClick={() => setShowPassword(s => !s)}>{showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}</IconButton></InputAdornment> }} />
                  <Button fullWidth variant="contained" type="submit" size="large" disabled={loading}>
                    {loading ? <CircularProgress size={22} color="inherit" /> : 'Reset Password'}
                  </Button>
                </Box>
              </>
            )}
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Link component={RouterLink} to="/login" variant="body2">Back to Sign In</Link>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  )
}
