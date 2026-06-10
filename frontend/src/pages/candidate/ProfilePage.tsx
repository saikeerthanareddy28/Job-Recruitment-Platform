import { useState, useRef } from 'react'
import { Container, Grid, Card, CardContent, Typography, TextField, Button, Box, Avatar, Chip, CircularProgress, Divider, IconButton } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import DeleteIcon from '@mui/icons-material/Delete'
import StarIcon from '@mui/icons-material/Star'
import StarBorderIcon from '@mui/icons-material/StarBorder'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { candidateApi, userApi } from '../../api/services'
import { useAuth } from '../../store/AuthContext'
import { useSnackbar } from 'notistack'

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const { enqueueSnackbar } = useSnackbar()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const resumeInputRef = useRef<HTMLInputElement>(null)
  const [editing, setEditing] = useState(false)

  const { data: profile, isLoading } = useQuery({
    queryKey: ['candidate-profile'],
    queryFn: () => candidateApi.getProfile().then(r => r.data.data),
  })

  const [form, setForm] = useState({
    headline: '', summary: '', currentLocation: '', preferredLocation: '',
    expectedSalary: '', experienceYears: '', skills: '',
    linkedinUrl: '', githubUrl: '', portfolioUrl: '',
  })

  const updateProfileMutation = useMutation({
    mutationFn: () => candidateApi.updateProfile({
      headline: form.headline,
      summary: form.summary,
      currentLocation: form.currentLocation,
      preferredLocation: form.preferredLocation,
      expectedSalary: form.expectedSalary ? Number(form.expectedSalary) : undefined,
      experienceYears: form.experienceYears ? Number(form.experienceYears) : undefined,
      skills: form.skills,
      linkedinUrl: form.linkedinUrl,
      githubUrl: form.githubUrl,
      portfolioUrl: form.portfolioUrl,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidate-profile'] })
      setEditing(false)
      enqueueSnackbar('Profile updated', { variant: 'success' })
    },
    onError: () => enqueueSnackbar('Failed to update profile', { variant: 'error' }),
  })

  const uploadPictureMutation = useMutation({
    mutationFn: (file: File) => userApi.uploadProfilePicture(file),
    onSuccess: (res) => {
      updateUser(res.data.data)
      enqueueSnackbar('Profile picture updated', { variant: 'success' })
    },
  })

  const uploadResumeMutation = useMutation({
    mutationFn: (file: File) => candidateApi.uploadResume(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidate-profile'] })
      enqueueSnackbar('Resume uploaded', { variant: 'success' })
    },
  })

  const deleteResumeMutation = useMutation({
    mutationFn: (id: number) => candidateApi.deleteResume(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidate-profile'] })
      enqueueSnackbar('Resume deleted', { variant: 'success' })
    },
  })

  const setPrimaryMutation = useMutation({
    mutationFn: (id: number) => candidateApi.setPrimaryResume(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidate-profile'] })
      enqueueSnackbar('Primary resume updated', { variant: 'success' })
    },
  })

  const startEditing = () => {
    if (profile) {
      setForm({
        headline: profile.headline || '',
        summary: profile.summary || '',
        currentLocation: profile.currentLocation || '',
        preferredLocation: profile.preferredLocation || '',
        expectedSalary: profile.expectedSalary ? String(profile.expectedSalary) : '',
        experienceYears: profile.experienceYears ? String(profile.experienceYears) : '',
        skills: profile.skills || '',
        linkedinUrl: profile.linkedinUrl || '',
        githubUrl: profile.githubUrl || '',
        portfolioUrl: profile.portfolioUrl || '',
      })
    }
    setEditing(true)
  }

  if (isLoading) return <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>My Profile</Typography>

      <Grid container spacing={3}>
        {/* Left: Avatar + basic info */}
        <Grid item xs={12} md={4}>
          <Card sx={{ border: '1px solid', borderColor: 'divider', mb: 3 }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                <Avatar src={user?.profilePicture} sx={{ width: 96, height: 96, fontSize: 36, bgcolor: 'primary.main', mx: 'auto' }}>
                  {user?.firstName[0]}
                </Avatar>
                <IconButton size="small" sx={{ position: 'absolute', bottom: 0, right: 0, bgcolor: 'white', border: '1px solid', borderColor: 'divider' }} onClick={() => fileInputRef.current?.click()}>
                  <EditIcon fontSize="small" />
                </IconButton>
                <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) uploadPictureMutation.mutate(f) }} />
              </Box>
              <Typography variant="h6" fontWeight={700}>{user?.firstName} {user?.lastName}</Typography>
              <Typography variant="body2" color="text.secondary">{user?.email}</Typography>
              {profile?.headline && <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{profile.headline}</Typography>}
              {profile?.currentLocation && <Chip label={profile.currentLocation} size="small" sx={{ mt: 1 }} />}
            </CardContent>
          </Card>

          {/* Resumes */}
          <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={700}>Resumes</Typography>
                <Button size="small" startIcon={<UploadFileIcon />} variant="outlined" onClick={() => resumeInputRef.current?.click()} disabled={uploadResumeMutation.isPending}>
                  Upload
                </Button>
                <input ref={resumeInputRef} type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) uploadResumeMutation.mutate(f) }} />
              </Box>
              {profile?.resumes?.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No resumes uploaded</Typography>
              ) : (
                profile?.resumes?.map(resume => (
                  <Box key={resume.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, p: 1.5, bgcolor: '#f8fafc', borderRadius: 1 }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={600} noWrap>{resume.originalName}</Typography>
                      <Typography variant="caption" color="text.secondary">{(resume.fileSize / 1024).toFixed(0)} KB</Typography>
                    </Box>
                    <IconButton size="small" onClick={() => setPrimaryMutation.mutate(resume.id)} title={resume.isPrimary ? 'Primary' : 'Set as primary'}>
                      {resume.isPrimary ? <StarIcon sx={{ color: 'warning.main', fontSize: 18 }} /> : <StarBorderIcon sx={{ fontSize: 18 }} />}
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => deleteResumeMutation.mutate(resume.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Right: profile details */}
        <Grid item xs={12} md={8}>
          <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight={700}>Profile Details</Typography>
                {!editing ? (
                  <Button startIcon={<EditIcon />} onClick={startEditing} variant="outlined">Edit</Button>
                ) : (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button onClick={() => setEditing(false)} variant="outlined">Cancel</Button>
                    <Button variant="contained" onClick={() => updateProfileMutation.mutate()} disabled={updateProfileMutation.isPending}>
                      {updateProfileMutation.isPending ? <CircularProgress size={20} /> : 'Save'}
                    </Button>
                  </Box>
                )}
              </Box>

              {editing ? (
                <Grid container spacing={2}>
                  {[
                    { label: 'Headline', key: 'headline', placeholder: 'e.g. Senior Software Engineer' },
                    { label: 'Current Location', key: 'currentLocation', placeholder: 'e.g. Bangalore, Karnataka' },
                    { label: 'Preferred Location', key: 'preferredLocation', placeholder: 'e.g. Bangalore, Karnataka' },
                    { label: 'Expected Salary (INR)', key: 'expectedSalary', placeholder: 'e.g. 1200000' },
                    { label: 'Years of Experience', key: 'experienceYears', placeholder: 'e.g. 5' },
                    { label: 'LinkedIn URL', key: 'linkedinUrl', placeholder: 'https://linkedin.com/in/...' },
                    { label: 'GitHub URL', key: 'githubUrl', placeholder: 'https://github.com/...' },
                    { label: 'Portfolio URL', key: 'portfolioUrl', placeholder: 'https://...' },
                  ].map(field => (
                    <Grid item xs={12} sm={6} key={field.key}>
                      <TextField fullWidth size="small" label={field.label} placeholder={field.placeholder}
                        value={(form as any)[field.key]}
                        onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))} />
                    </Grid>
                  ))}
                  <Grid item xs={12}>
                    <TextField fullWidth multiline rows={3} size="small" label="Summary" placeholder="Brief professional summary..."
                      value={form.summary} onChange={e => setForm(f => ({ ...f, summary: e.target.value }))} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth size="small" label="Skills (comma separated)" placeholder="React, TypeScript, Node.js..."
                      value={form.skills} onChange={e => setForm(f => ({ ...f, skills: e.target.value }))} />
                  </Grid>
                </Grid>
              ) : (
                <Box>
                  {[
                    { label: 'Headline', value: profile?.headline },
                    { label: 'Current Location', value: profile?.currentLocation },
                    { label: 'Preferred Location', value: profile?.preferredLocation },
                    { label: 'Expected Salary', value: profile?.expectedSalary ? `₹${profile.expectedSalary.toLocaleString('en-IN')} per annum` : null },
                    { label: 'Experience', value: profile?.experienceYears ? `${profile.experienceYears} years` : null },
                    { label: 'LinkedIn', value: profile?.linkedinUrl },
                    { label: 'GitHub', value: profile?.githubUrl },
                    { label: 'Portfolio', value: profile?.portfolioUrl },
                  ].map(item => item.value && (
                    <Box key={item.label} sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">{item.label}</Typography>
                      <Typography variant="body2" sx={{ mt: 0.25 }}>{item.value}</Typography>
                    </Box>
                  ))}
                  {profile?.summary && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">Summary</Typography>
                      <Typography variant="body2" sx={{ mt: 0.25 }}>{profile.summary}</Typography>
                    </Box>
                  )}
                  {profile?.skills && (
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">Skills</Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 0.5 }}>
                        {profile.skills.split(',').map(s => <Chip key={s.trim()} label={s.trim()} size="small" />)}
                      </Box>
                    </Box>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  )
}
