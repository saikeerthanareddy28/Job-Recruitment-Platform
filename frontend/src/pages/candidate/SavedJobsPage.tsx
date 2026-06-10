import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Container, Typography, Card, CardContent, Box, Chip, Button, CircularProgress, Avatar, Pagination, IconButton, Tooltip } from '@mui/material'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { applicationsApi } from '../../api/services'
import { useSnackbar } from 'notistack'
import { formatDistanceToNow } from 'date-fns'

export default function SavedJobsPage() {
  const [page, setPage] = useState(1)
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['saved-jobs', page],
    queryFn: () => applicationsApi.getSavedJobs(page - 1, 12).then(r => r.data.data),
  })

  const unsaveMutation = useMutation({
    mutationFn: (jobId: number) => applicationsApi.unsaveJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-jobs'] })
      enqueueSnackbar('Job removed from saved', { variant: 'success' })
    },
  })

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>Saved Jobs</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>{data?.totalElements ?? 0} saved jobs</Typography>

      {isLoading ? (
        <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>
      ) : data?.content?.length === 0 ? (
        <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">No saved jobs yet</Typography>
            <Button variant="contained" onClick={() => navigate('/find-jobs')} sx={{ mt: 2 }}>Browse Jobs</Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {data?.content?.map(job => (
            <Card key={job.id} sx={{ mb: 2, border: '1px solid', borderColor: 'divider', cursor: 'pointer', '&:hover': { borderColor: 'primary.main' } }}>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flex: 1 }} onClick={() => navigate(`/find-jobs/${job.id}`)}>
                    <Avatar variant="rounded" sx={{ bgcolor: 'primary.50', color: 'primary.main', fontWeight: 700 }}>
                      {job.companyName[0]}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" fontWeight={700}>{job.title}</Typography>
                      <Typography variant="body2" color="text.secondary">{job.companyName}</Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                        {job.location && <Chip icon={<LocationOnIcon />} label={job.location} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />}
                        {job.employmentType && <Chip label={job.employmentType.replace('_', ' ')} size="small" color="primary" variant="outlined" sx={{ fontSize: '0.7rem' }} />}
                      </Box>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Typography variant="caption" color="text.disabled">
                      {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                    </Typography>
                    <Button size="small" variant="contained" onClick={() => navigate(`/find-jobs/${job.id}`)}>Apply</Button>
                    <Tooltip title="Remove">
                      <IconButton size="small" onClick={() => unsaveMutation.mutate(job.id)} disabled={unsaveMutation.isPending}>
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
          {data && data.totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={3}>
              <Pagination count={data.totalPages} page={page} onChange={(_, v) => setPage(v)} color="primary" />
            </Box>
          )}
        </>
      )}
    </Container>
  )
}
