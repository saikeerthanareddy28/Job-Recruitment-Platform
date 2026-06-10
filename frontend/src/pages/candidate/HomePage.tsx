import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Container, Typography, Button, Paper, Grid, Card, CardContent,
  MenuItem, Select, FormControl, InputAdornment, Chip, CircularProgress,
  useTheme, Alert,
} from '@mui/material'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import SearchIcon from '@mui/icons-material/Search'
import DescriptionIcon from '@mui/icons-material/Description'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import WorkIcon from '@mui/icons-material/Work'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../store/AuthContext'
import { candidateApi } from '../../api/services'
import { useSnackbar } from 'notistack'
import type { CandidateProfile } from '../../types'

const POPULAR_SEARCHES = [
  'Software Developer',
  'Frontend Developer',
  'Backend Developer',
  'Data Analyst',
  'UI/UX Designer',
]

const INDIAN_CITIES = [
  'Bangalore, Karnataka',
  'Mumbai, Maharashtra',
  'Delhi, NCR',
  'Hyderabad, Telangana',
  'Chennai, Tamil Nadu',
  'Pune, Maharashtra',
  'Kolkata, West Bengal',
  'Ahmedabad, Gujarat',
  'Noida, Uttar Pradesh',
  'Gurgaon, Haryana',
]

const SALARY_OPTIONS = [
  { label: '₹ 3,00,000', value: 300000 },
  { label: '₹ 5,00,000', value: 500000 },
  { label: '₹ 6,00,000', value: 600000 },
  { label: '₹ 8,00,000', value: 800000 },
  { label: '₹ 10,00,000', value: 1000000 },
  { label: '₹ 15,00,000', value: 1500000 },
  { label: '₹ 20,00,000', value: 2000000 },
  { label: '₹ 25,00,000', value: 2500000 },
]

function formatINR(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function HomePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const theme = useTheme()

  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['candidate-profile'],
    queryFn: () => candidateApi.getProfile().then(r => r.data.data),
    enabled: !!user,
  })

  const profile = profileData as CandidateProfile | undefined

  const [selectedLocation, setSelectedLocation] = useState<string>(
    profile?.preferredLocation || 'Bangalore, Karnataka'
  )
  const [selectedSalary, setSelectedSalary] = useState<number>(
    profile?.expectedSalary || 600000
  )

  const primaryResume = profile?.resumes?.find(r => r.isPrimary) || profile?.resumes?.[0]

  const updateLocationMutation = useMutation({
    mutationFn: (loc: string) => candidateApi.updateLocation(loc),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidate-profile'] })
      enqueueSnackbar('Preferred location saved', { variant: 'success' })
    },
  })

  const updateSalaryMutation = useMutation({
    mutationFn: (sal: number) => candidateApi.updateSalary(sal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidate-profile'] })
      enqueueSnackbar('Expected salary saved', { variant: 'success' })
    },
  })

  const uploadResumeMutation = useMutation({
    mutationFn: (file: File) => candidateApi.uploadResume(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidate-profile'] })
      enqueueSnackbar('Resume uploaded successfully', { variant: 'success' })
    },
    onError: () => enqueueSnackbar('Failed to upload resume', { variant: 'error' }),
  })

  const handleFindJobs = () => {
    const params = new URLSearchParams()
    if (selectedLocation) params.set('location', selectedLocation)
    if (selectedSalary) params.set('minSalary', String(selectedSalary))
    navigate(`/find-jobs?${params.toString()}`)
  }

  const handlePopularSearch = (term: string) => {
    navigate(`/find-jobs?keyword=${encodeURIComponent(term)}`)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) uploadResumeMutation.mutate(file)
  }

  const salaryLabel =
    SALARY_OPTIONS.find(o => o.value === selectedSalary)?.label ||
    formatINR(selectedSalary)

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #eff6ff 0%, #e0f2fe 50%, #f0fdf4 100%)',
          pt: { xs: 4, md: 6 },
          pb: { xs: 3, md: 5 },
          px: 2,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography
                variant="h2"
                sx={{ fontWeight: 800, fontSize: { xs: '2rem', md: '2.8rem' }, lineHeight: 1.2 }}
              >
                Find the job
                <br />
                that fits{' '}
                <Box component="span" sx={{ color: 'primary.main' }}>
                  your future
                </Box>
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ mt: 2, mb: 4, maxWidth: 480, lineHeight: 1.7 }}
              >
                Explore opportunities, connect with top companies
                <br />
                and build your career.
              </Typography>
            </Grid>
            <Grid item xs={12} md={5} sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center', gap: 2 }}>
              <Typography fontSize={64}>🌿</Typography>
              <Typography fontSize={64}>💻</Typography>
              <Typography fontSize={64}>🪑</Typography>
            </Grid>
          </Grid>

          {/* Search Card */}
          <Paper
            elevation={0}
            sx={{
              mt: 2,
              p: 3,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'white',
            }}
          >
            <Grid container spacing={2} alignItems="flex-end">
              {/* Location */}
              <Grid item xs={12} md={3.5}>
                <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ display: 'block', mb: 0.5 }}>
                  Location
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={selectedLocation}
                    onChange={(e) => {
                      setSelectedLocation(e.target.value)
                      updateLocationMutation.mutate(e.target.value)
                    }}
                    startAdornment={
                      <InputAdornment position="start">
                        <LocationOnIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                      </InputAdornment>
                    }
                    sx={{ bgcolor: 'white' }}
                  >
                    {INDIAN_CITIES.map(city => (
                      <MenuItem key={city} value={city}>{city}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Expected Salary */}
              <Grid item xs={12} md={3.5}>
                <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ display: 'block', mb: 0.5 }}>
                  Expected Salary
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={selectedSalary}
                    onChange={(e) => {
                      setSelectedSalary(Number(e.target.value))
                      updateSalaryMutation.mutate(Number(e.target.value))
                    }}
                    startAdornment={
                      <InputAdornment position="start">
                        <CalendarTodayIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                      </InputAdornment>
                    }
                  >
                    {SALARY_OPTIONS.map(opt => (
                      <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Resume */}
              <Grid item xs={12} md={3}>
                <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ display: 'block', mb: 0.5 }}>
                  Resume
                </Typography>
                <Box
                  onClick={() => !primaryResume && fileInputRef.current?.click()}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 1.5,
                    py: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    bgcolor: 'white',
                    cursor: primaryResume ? 'default' : 'pointer',
                    '&:hover': { borderColor: primaryResume ? 'divider' : 'primary.main' },
                    height: '40px',
                  }}
                >
                  <DescriptionIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary" noWrap sx={{ flex: 1 }}>
                    {uploadResumeMutation.isPending
                      ? 'Uploading…'
                      : primaryResume
                      ? primaryResume.originalName
                      : 'Upload Resume'}
                  </Typography>
                  {primaryResume && (
                    <CheckCircleIcon sx={{ fontSize: 18, color: 'success.main' }} />
                  )}
                </Box>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  style={{ display: 'none' }}
                  onChange={handleFileSelect}
                />
              </Grid>

              {/* Find Jobs Button */}
              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleFindJobs}
                  startIcon={<SearchIcon />}
                  sx={{ height: 40, borderRadius: 1.5, fontWeight: 700 }}
                >
                  Find Jobs
                </Button>
              </Grid>
            </Grid>

            {/* Popular Searches */}
            <Box sx={{ mt: 2.5, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                Popular Searches:
              </Typography>
              {POPULAR_SEARCHES.map(term => (
                <Button
                  key={term}
                  size="small"
                  onClick={() => handlePopularSearch(term)}
                  sx={{
                    color: 'primary.main',
                    fontWeight: 500,
                    fontSize: '0.8rem',
                    p: 0,
                    minWidth: 'auto',
                    '&:hover': { textDecoration: 'underline', bgcolor: 'transparent' },
                  }}
                >
                  {term}
                </Button>
              ))}
            </Box>
          </Paper>
        </Container>
      </Box>

      {/* Dashboard Cards */}
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Grid container spacing={3}>
          {/* My Resume Card */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', border: '1px solid', borderColor: 'divider' }}>
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    width: 48, height: 48, borderRadius: 2,
                    bgcolor: '#eff6ff', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', mb: 2,
                  }}
                >
                  <DescriptionIcon sx={{ color: 'primary.main', fontSize: 24 }} />
                </Box>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  My Resume
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {primaryResume ? primaryResume.originalName : 'Upload or update your resume'}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadResumeMutation.isPending}
                >
                  {uploadResumeMutation.isPending ? (
                    <CircularProgress size={16} sx={{ mr: 1 }} />
                  ) : null}
                  Manage Resume
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Preferred Location Card */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', border: '1px solid', borderColor: 'divider' }}>
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    width: 48, height: 48, borderRadius: 2,
                    bgcolor: '#f0fdf4', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', mb: 2,
                  }}
                >
                  <LocationOnIcon sx={{ color: '#16a34a', fontSize: 24 }} />
                </Box>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Preferred Location
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {profile?.preferredLocation || 'Not set'}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  color="success"
                  onClick={() => {
                    const loc = prompt('Enter your preferred location:', profile?.preferredLocation || '')
                    if (loc) updateLocationMutation.mutate(loc)
                  }}
                >
                  Edit Location
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Expected Salary Card */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', border: '1px solid', borderColor: 'divider' }}>
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    width: 48, height: 48, borderRadius: 2,
                    bgcolor: '#fffbeb', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', mb: 2,
                  }}
                >
                  <CalendarTodayIcon sx={{ color: '#d97706', fontSize: 24 }} />
                </Box>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Expected Salary
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {profile?.expectedSalary
                    ? `${formatINR(profile.expectedSalary)} (Annual)`
                    : 'Not set'}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  color="warning"
                  onClick={() => {
                    const val = prompt('Enter expected annual salary (in INR):', String(profile?.expectedSalary || ''))
                    if (val && !isNaN(Number(val))) updateSalaryMutation.mutate(Number(val))
                  }}
                >
                  Edit Salary
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Find Jobs Card */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', border: '1px solid', borderColor: 'divider' }}>
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    width: 48, height: 48, borderRadius: 2,
                    bgcolor: '#faf5ff', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', mb: 2,
                  }}
                >
                  <WorkIcon sx={{ color: '#7c3aed', fontSize: 24 }} />
                </Box>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Find Jobs
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Search and apply for jobs
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  color="secondary"
                  onClick={() => navigate('/find-jobs')}
                >
                  Browse Jobs
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}
