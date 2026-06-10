import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Container, Typography, Card, CardContent, Box, Chip, Button, CircularProgress, IconButton, Pagination } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import PeopleIcon from '@mui/icons-material/People'
import AddIcon from '@mui/icons-material/Add'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { jobsApi } from '../../api/services'
import { useSnackbar } from 'notistack'

export default function ManageJobsPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const { enqueueSnackbar } = useSnackbar()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['recruiter-jobs-list', page],
    queryFn: () => jobsApi.getMyJobs(page - 1, 10).then(r => r.data.data),
  })

  const closeMutation = useMutation({
    mutationFn: (jobId: number) => jobsApi.deleteJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruiter-jobs-list'] })
      enqueueSnackbar('Job closed', { variant: 'success' })
    },
  })

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>My Job Postings</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/recruiter/post-job')}>Post Job</Button>
      </Box>

      {isLoading ? <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box> :
        data?.content?.map(job => (
          <Card key={job.id} sx={{ mb: 2, border: '1px solid', borderColor: 'divider' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700}>{job.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{job.location} · {job.employmentType?.replace('_', ' ')}</Typography>
                  <Typography variant="caption" color="text.disabled">{job.applicationsCount} applications · {new Date(job.createdAt).toLocaleDateString()}</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Chip label={job.status} size="small" color={job.status === 'ACTIVE' ? 'success' : 'default'} />
                  <Button size="small" startIcon={<PeopleIcon />} variant="outlined" onClick={() => navigate(`/recruiter/jobs/${job.id}/applicants`)}>
                    Applicants
                  </Button>
                  {job.status === 'ACTIVE' && (
                    <Button size="small" color="error" variant="outlined" onClick={() => closeMutation.mutate(job.id)}>Close</Button>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))
      }
      {data && data.totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination count={data.totalPages} page={page} onChange={(_, v) => setPage(v)} color="primary" />
        </Box>
      )}
    </Container>
  )
}
