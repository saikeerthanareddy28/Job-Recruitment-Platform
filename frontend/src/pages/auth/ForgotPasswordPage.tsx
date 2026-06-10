import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Box, Card, CardContent, TextField, Button, Typography, Link, Alert, CircularProgress } from '@mui/material'
import WorkIcon from '@mui/icons-material/Work'
import { authApi } from '../../api/services'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await authApi.forgotPassword(email)
      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please try again.')
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
          <Typography variant="h5" fontWeight={700}>Forgot Password</Typography>
          <Typography variant="body2" color="text.secondary">We'll send a reset link to your email</Typography>
        </Box>
        <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
          <CardContent sx={{ p: 3 }}>
            {submitted ? (
              <Alert severity="success">
                If an account exists for <strong>{email}</strong>, a password reset link has been sent. Please check your inbox.
              </Alert>
            ) : (
              <>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <Box component="form" onSubmit={handleSubmit}>
                  <TextField fullWidth label="Email address" type="email" size="small" value={email} onChange={e => setEmail(e.target.value)} sx={{ mb: 2 }} required />
                  <Button fullWidth variant="contained" type="submit" size="large" disabled={loading}>
                    {loading ? <CircularProgress size={22} color="inherit" /> : 'Send Reset Link'}
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
