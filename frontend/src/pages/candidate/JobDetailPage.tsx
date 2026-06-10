import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Container, Grid, Card, CardContent, Typography, Button, Box, Chip,
  Avatar, Divider, CircularProgress, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Alert,
} from '@mui/material'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import WorkIcon from '@mui/icons-material/Work'
import BusinessIcon from '@mui/icons-material/Business'
import BookmarkIcon from '@mui/icons-material/Bookmark'
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { jobsApi, applicationsApi, candidateApi } from '../../api/services'
import { useAuth } from '../../store/AuthContext'
import { useSnackbar } from 'notistack'
import { formatDistanceToNow } from 'date-fns'

export default function JobDetailPage() {
  const { jobId } = useParams<{ jobId: string }>()
  const { user, isAuthenticated } = useAuth()
  const { enqueueSnackbar } = useSnackbar()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const [applyDialogOpen, setApplyDialogOpen] = useState(false)
  const [coverLetter, setCoverLetter] = useState('')

  const { data: jobData, isLoading } = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => jobsApi.getById(Number(jobId)).then(r => r.data.data),
    enabled: !!jobId,
  })

  const { data: profileData } = useQuery({
    queryKey: ['candidate-profile'],
    queryFn: () => candidateApi.getProfile().then(r => r.data.data),
    enabled: isAuthenticated && user?.role === 'CANDIDATE',
  })

  const applyMutation = useMutation({
    mutationFn: () => {
      const primaryResume = profileData?.resumes?.find(r => r.isPrimary)
      return applicationsApi.apply(Number(jobId), primaryResume?.id, coverLetter || undefined)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job', jobId] })
      queryClient.invalidateQueries({ queryKey: ['my-applications'] })
      setApplyDialogOpen(false)
      enqueueSnackbar('Application submitted successfully!', { variant: 'success' })
    },
    onError: (e: any) =>
      enqueueSnackbar(e.response?.data?.message || 'Failed to apply', { variant: 'error' }),
  })

  const saveMutation = useMutation({
    mutationFn: () =>
      jobData?.isSaved
        ? applicationsApi.unsaveJob(Number(jobId))
        : applicationsApi.saveJob(Number(jobId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job', jobId] })
      enqueueSnackbar(jobData?.isSaved ? 'Job removed from saved' : 'Job saved', { variant: 'success' })
    },
  })

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <CircularProgress />
      </Box>
    )
  }

  if (!jobData) return null

  const empTypeLabel: Record<string, string> = {
    FULL_TIME: 'Full Time', PART_TIME: 'Part Time', CONTRACT: 'Contract',
    INTERNSHIP: 'Internship', FREELANCE: 'Freelance',
  }

  const expLevelLabel: Record<string, string> = {
    ENTRY_LEVEL: 'Entry Level', MID_LEVEL: 'Mid Level', SENIOR_LEVEL: 'Senior',
    LEAD: 'Lead', MANAGER: 'Manager', EXECUTIVE: 'Executive',
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          <Card sx={{ border: '1px solid', borderColor: 'divider', mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'flex-start' }}>
                <Avatar
                  src={jobData.companyLogo}
                  variant="rounded"
                  sx={{ width: 64, height: 64, bgcolor: 'primary.50', fontSize: 24, fontWeight: 700 }}
                >
                  {jobData.companyName[0]}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h5" fontWeight={700}>{jobData.title}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                    <BusinessIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body1" color="text.secondary">{jobData.companyName}</Typography>
                  </Box>
                  <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: 'block' }}>
                    Posted {formatDistanceToNow(new Date(jobData.createdAt), { addSuffix: true })}
                    {' · '}{jobData.applicationsCount} applications
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
                {jobData.location && (
                  <Chip icon={<LocationOnIcon />} label={jobData.isRemote ? `${jobData.location} (Remote)` : jobData.location} variant="outlined" />
                )}
                {jobData.employmentType && (
                  <Chip label={empTypeLabel[jobData.employmentType]} color="primary" variant="outlined" />
                )}
                {jobData.experienceLevel && (
                  <Chip label={expLevelLabel[jobData.experienceLevel]} variant="outlined" />
                )}
                {jobData.categoryName && (
                  <Chip label={jobData.categoryName} variant="outlined" />
                )}
              </Box>

              {jobData.minSalary && (
                <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Salary Range</Typography>
                  <Typography variant="h6" fontWeight={700} color="primary.main">
                    {jobData.maxSalary
                      ? `₹${(jobData.minSalary / 100000).toFixed(1)}L – ₹${(jobData.maxSalary / 100000).toFixed(1)}L`
                      : `From ₹${(jobData.minSalary / 100000).toFixed(1)}L`} per annum
                  </Typography>
                </Box>
              )}

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" fontWeight={700} gutterBottom>Job Description</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line', mb: 3 }}>
                {jobData.description}
              </Typography>

              {jobData.responsibilities && (
                <>
                  <Typography variant="h6" fontWeight={700} gutterBottom>Responsibilities</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line', mb: 3 }}>
                    {jobData.responsibilities}
                  </Typography>
                </>
              )}

              {jobData.requirements && (
                <>
                  <Typography variant="h6" fontWeight={700} gutterBottom>Requirements</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line', mb: 3 }}>
                    {jobData.requirements}
                  </Typography>
                </>
              )}

              {jobData.skillsRequired && (
                <>
                  <Typography variant="h6" fontWeight={700} gutterBottom>Skills Required</Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {jobData.skillsRequired.split(',').map(s => (
                      <Chip key={s.trim()} label={s.trim()} size="small" />
                    ))}
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <Card sx={{ border: '1px solid', borderColor: 'divider', position: 'sticky', top: 80 }}>
            <CardContent sx={{ p: 3 }}>
              {jobData.hasApplied ? (
                <Box sx={{ textAlign: 'center', py: 1 }}>
                  <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                  <Typography variant="subtitle1" fontWeight={700} color="success.main">
                    Applied!
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Your application has been submitted
                  </Typography>
                  <Button
                    variant="outlined"
                    fullWidth
                    sx={{ mt: 2 }}
                    onClick={() => navigate('/my-applications')}
                  >
                    View My Applications
                  </Button>
                </Box>
              ) : isAuthenticated && user?.role === 'CANDIDATE' ? (
                <>
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={() => setApplyDialogOpen(true)}
                    sx={{ mb: 2 }}
                  >
                    Apply Now
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={jobData.isSaved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                    onClick={() => saveMutation.mutate()}
                    disabled={saveMutation.isPending}
                  >
                    {jobData.isSaved ? 'Saved' : 'Save Job'}
                  </Button>
                </>
              ) : !isAuthenticated ? (
                <Button variant="contained" fullWidth onClick={() => navigate('/login')}>
                  Login to Apply
                </Button>
              ) : null}

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" fontWeight={700} gutterBottom>Job Overview</Typography>
              {[
                { label: 'Posted', value: formatDistanceToNow(new Date(jobData.createdAt), { addSuffix: true }) },
                { label: 'Applications', value: String(jobData.applicationsCount) },
                { label: 'Views', value: String(jobData.viewsCount) },
                ...(jobData.applicationDeadline ? [{ label: 'Deadline', value: new Date(jobData.applicationDeadline).toLocaleDateString() }] : []),
              ].map(item => (
                <Box key={item.label} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">{item.label}</Typography>
                  <Typography variant="body2" fontWeight={500}>{item.value}</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Apply Dialog */}
      <Dialog open={applyDialogOpen} onClose={() => setApplyDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Apply for {jobData.title}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Applying to <strong>{jobData.companyName}</strong>
          </Typography>
          {profileData?.resumes?.length === 0 && (
            <Alert severity="warning" sx={{ my: 1 }}>
              No resume uploaded. Please upload a resume from your profile first.
            </Alert>
          )}
          {profileData?.resumes && profileData.resumes.length > 0 && (
            <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, mb: 2, mt: 1 }}>
              <Typography variant="body2" fontWeight={600}>
                Resume: {profileData.resumes.find(r => r.isPrimary)?.originalName || profileData.resumes[0]?.originalName}
              </Typography>
            </Box>
          )}
          <TextField
            fullWidth
            multiline
            rows={5}
            label="Cover Letter (optional)"
            placeholder="Tell the recruiter why you're a great fit for this role…"
            value={coverLetter}
            onChange={e => setCoverLetter(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setApplyDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => applyMutation.mutate()}
            disabled={applyMutation.isPending}
          >
            {applyMutation.isPending ? <CircularProgress size={20} /> : 'Submit Application'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
