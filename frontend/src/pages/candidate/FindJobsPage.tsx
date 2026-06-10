import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  Box, Container, Grid, TextField, Select, MenuItem, FormControl,
  InputLabel, Button, Card, CardContent, Typography, Chip, Pagination,
  InputAdornment, CircularProgress, Avatar, IconButton, Tooltip,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder'
import BookmarkIcon from '@mui/icons-material/Bookmark'
import BusinessIcon from '@mui/icons-material/Business'
import WorkOutlineIcon from '@mui/icons-material/WorkOutline'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { jobsApi, applicationsApi } from '../../api/services'
import { useAuth } from '../../store/AuthContext'
import { useSnackbar } from 'notistack'
import type { JobSummary } from '../../types'
import { formatDistanceToNow } from 'date-fns'

const EMPLOYMENT_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'FULL_TIME', label: 'Full Time' },
  { value: 'PART_TIME', label: 'Part Time' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'INTERNSHIP', label: 'Internship' },
  { value: 'FREELANCE', label: 'Freelance' },
]

const EXPERIENCE_LEVELS = [
  { value: '', label: 'All Levels' },
  { value: 'ENTRY_LEVEL', label: 'Entry Level' },
  { value: 'MID_LEVEL', label: 'Mid Level' },
  { value: 'SENIOR_LEVEL', label: 'Senior Level' },
  { value: 'LEAD', label: 'Lead' },
  { value: 'MANAGER', label: 'Manager' },
]

function JobCard({ job }: { job: JobSummary }) {
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()
  const queryClient = useQueryClient()

  const saveMutation = useMutation({
    mutationFn: () => job.isSaved ? applicationsApi.unsaveJob(job.id) : applicationsApi.saveJob(job.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      enqueueSnackbar(job.isSaved ? 'Job removed from saved' : 'Job saved', { variant: 'success' })
    },
    onError: (e: any) => enqueueSnackbar(e.response?.data?.message || 'Action failed', { variant: 'error' }),
  })

  const empTypeLabel: Record<string, string> = {
    FULL_TIME: 'Full Time', PART_TIME: 'Part Time', CONTRACT: 'Contract',
    INTERNSHIP: 'Internship', FREELANCE: 'Freelance',
  }

  return (
    <Card
      sx={{
        border: '1px solid', borderColor: 'divider', cursor: 'pointer',
        transition: 'all 0.2s',
        '&:hover': { borderColor: 'primary.main', boxShadow: '0 4px 16px rgba(37,99,235,0.12)', transform: 'translateY(-2px)' },
      }}
      onClick={() => navigate(`/find-jobs/${job.id}`)}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
          <Box sx={{ display: 'flex', gap: 1.5, flex: 1 }}>
            <Avatar
              src={job.companyLogo}
              variant="rounded"
              sx={{ width: 44, height: 44, bgcolor: 'primary.50', fontSize: 18, fontWeight: 700 }}
            >
              {job.companyName[0]}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle1" fontWeight={700} noWrap>
                {job.title}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <BusinessIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary" noWrap>
                  {job.companyName}
                </Typography>
              </Box>
            </Box>
          </Box>
          {isAuthenticated && user?.role === 'CANDIDATE' && (
            <Tooltip title={job.isSaved ? 'Remove from saved' : 'Save job'}>
              <IconButton
                size="small"
                onClick={(e) => { e.stopPropagation(); saveMutation.mutate() }}
                disabled={saveMutation.isPending}
              >
                {job.isSaved
                  ? <BookmarkIcon sx={{ color: 'primary.main' }} />
                  : <BookmarkBorderIcon />}
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1.5 }}>
          {job.location && (
            <Chip
              icon={<LocationOnIcon />}
              label={job.isRemote ? `${job.location} (Remote)` : job.location}
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.72rem' }}
            />
          )}
          {job.employmentType && (
            <Chip
              label={empTypeLabel[job.employmentType] || job.employmentType}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ fontSize: '0.72rem' }}
            />
          )}
          {job.categoryName && (
            <Chip label={job.categoryName} size="small" variant="outlined" sx={{ fontSize: '0.72rem' }} />
          )}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {job.minSalary && job.maxSalary
              ? `₹${(job.minSalary / 100000).toFixed(1)}L – ₹${(job.maxSalary / 100000).toFixed(1)}L`
              : job.minSalary
              ? `From ₹${(job.minSalary / 100000).toFixed(1)}L`
              : 'Salary not disclosed'}
          </Typography>
          <Typography variant="caption" color="text.disabled">
            {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}

export default function FindJobsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '')
  const [location, setLocation] = useState(searchParams.get('location') || '')
  const [employmentType, setEmploymentType] = useState(searchParams.get('employmentType') || '')
  const [experienceLevel, setExperienceLevel] = useState(searchParams.get('experienceLevel') || '')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['jobs', keyword, location, employmentType, experienceLevel, page],
    queryFn: () =>
      jobsApi.search({
        keyword: keyword || undefined,
        location: location || undefined,
        employmentType: employmentType || undefined,
        experienceLevel: experienceLevel || undefined,
        page: page - 1,
        size: 12,
      }).then(r => r.data.data),
  })

  const handleSearch = () => {
    setPage(1)
    const params: Record<string, string> = {}
    if (keyword) params.keyword = keyword
    if (location) params.location = location
    if (employmentType) params.employmentType = employmentType
    if (experienceLevel) params.experienceLevel = experienceLevel
    setSearchParams(params)
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Find Your Next Job
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        {data?.totalElements?.toLocaleString() ?? '…'} jobs available
      </Typography>

      {/* Filters */}
      <Card sx={{ mb: 3, border: '1px solid', borderColor: 'divider' }}>
        <CardContent>
          <Grid container spacing={2} alignItems="flex-end">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Job title, skills, company…"
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                placeholder="Location"
                value={location}
                onChange={e => setLocation(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOnIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Type</InputLabel>
                <Select
                  value={employmentType}
                  label="Type"
                  onChange={e => setEmploymentType(e.target.value)}
                >
                  {EMPLOYMENT_TYPES.map(t => (
                    <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Experience</InputLabel>
                <Select
                  value={experienceLevel}
                  label="Experience"
                  onChange={e => setExperienceLevel(e.target.value)}
                >
                  {EXPERIENCE_LEVELS.map(l => (
                    <MenuItem key={l.value} value={l.value}>{l.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={1}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleSearch}
                sx={{ height: 40 }}
              >
                Search
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Results */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : data?.content?.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <WorkOutlineIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No jobs found matching your criteria
          </Typography>
          <Button variant="outlined" sx={{ mt: 2 }} onClick={() => {
            setKeyword(''); setLocation(''); setEmploymentType(''); setExperienceLevel('')
            setSearchParams({})
          }}>
            Clear Filters
          </Button>
        </Box>
      ) : (
        <>
          <Grid container spacing={2}>
            {data?.content?.map(job => (
              <Grid item xs={12} sm={6} md={4} key={job.id}>
                <JobCard job={job} />
              </Grid>
            ))}
          </Grid>
          {data && data.totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={data.totalPages}
                page={page}
                onChange={(_, val) => { setPage(val); window.scrollTo(0, 0) }}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Container>
  )
}
