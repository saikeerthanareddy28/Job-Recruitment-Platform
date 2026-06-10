import { useNavigate } from 'react-router-dom'
import { Container, Grid, Card, CardContent, Typography, Button, Box, CircularProgress, Chip } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import WorkIcon from '@mui/icons-material/Work'
import PeopleIcon from '@mui/icons-material/People'
import BusinessIcon from '@mui/icons-material/Business'
import { useQuery } from '@tanstack/react-query'
import { jobsApi } from '../../api/services'

export default function RecruiterDashboardPage() {
  const navigate = useNavigate()

  const { data: jobsData, isLoading } = useQuery({
    queryKey: ['recruiter-jobs'],
    queryFn: () => jobsApi.getMyJobs(0, 5).then(r => r.data.data),
  })

  const totalJobs = jobsData?.totalElements ?? 0
  const activeJobs = jobsData?.content?.filter(j => j.status === 'ACTIVE').length ?? 0
  const totalApplications = jobsData?.content?.reduce((sum, j) => sum + j.applicationsCount, 0) ?? 0

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Recruiter Dashboard</Typography>
          <Typography color="text.secondary">Manage your job postings and candidates</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/recruiter/post-job')}>Post a Job</Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: 'Total Jobs', value: totalJobs, icon: <WorkIcon />, color: '#eff6ff', iconColor: '#2563eb' },
          { label: 'Active Jobs', value: activeJobs, icon: <WorkIcon />, color: '#f0fdf4', iconColor: '#16a34a' },
          { label: 'Total Applications', value: totalApplications, icon: <PeopleIcon />, color: '#faf5ff', iconColor: '#7c3aed' },
        ].map(stat => (
          <Grid item xs={12} sm={4} key={stat.label}>
            <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.iconColor }}>{stat.icon}</Box>
                  <Box>
                    <Typography variant="h4" fontWeight={700}>{stat.value}</Typography>
                    <Typography variant="body2" color="text.secondary">{stat.label}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight={700}>Recent Job Postings</Typography>
            <Button variant="outlined" size="small" onClick={() => navigate('/recruiter/jobs')}>View All</Button>
          </Box>
          {isLoading ? <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box> :
            jobsData?.content?.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">No jobs posted yet</Typography>
                <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/recruiter/post-job')}>Post Your First Job</Button>
              </Box>
            ) : (
              jobsData?.content?.map(job => (
                <Box key={job.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5, borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { borderBottom: 0 } }}>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600}>{job.title}</Typography>
                    <Typography variant="caption" color="text.secondary">{job.location} · {job.applicationsCount} applications</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Chip label={job.status} size="small" color={job.status === 'ACTIVE' ? 'success' : 'default'} />
                    <Button size="small" variant="outlined" onClick={() => navigate(`/recruiter/jobs/${job.id}/applicants`)}>View</Button>
                  </Box>
                </Box>
              ))
            )
          }
        </CardContent>
      </Card>
    </Container>
  )
}
