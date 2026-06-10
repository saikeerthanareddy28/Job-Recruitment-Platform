import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Container, Typography, Card, CardContent, Box, Chip, Button, CircularProgress, Select, MenuItem, FormControl, Pagination, Avatar } from '@mui/material'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { applicationsApi, jobsApi } from '../../api/services'
import { useSnackbar } from 'notistack'
import type { ApplicationStatus } from '../../types'
import { formatDistanceToNow } from 'date-fns'

const STATUSES: ApplicationStatus[] = ['APPLIED','UNDER_REVIEW','SHORTLISTED','INTERVIEW_SCHEDULED','OFFERED','REJECTED']
const STATUS_COLORS: Record<string, any> = { APPLIED:'info', UNDER_REVIEW:'warning', SHORTLISTED:'primary', INTERVIEW_SCHEDULED:'secondary', OFFERED:'success', REJECTED:'error', WITHDRAWN:'default' }

export default function JobApplicantsPage() {
  const { jobId } = useParams<{ jobId: string }>()
  const [page, setPage] = useState(1)
  const { enqueueSnackbar } = useSnackbar()
  const queryClient = useQueryClient()

  const { data: jobData } = useQuery({ queryKey: ['job', jobId], queryFn: () => jobsApi.getById(Number(jobId)).then(r => r.data.data) })
  const { data, isLoading } = useQuery({
    queryKey: ['job-applicants', jobId, page],
    queryFn: () => applicationsApi.getJobApplications(Number(jobId), page - 1, 10).then(r => r.data.data),
    enabled: !!jobId,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => applicationsApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-applicants', jobId] })
      enqueueSnackbar('Application status updated', { variant: 'success' })
    },
  })

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>Applicants</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        {jobData?.title} · {data?.totalElements ?? 0} applicants
      </Typography>

      {isLoading ? <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box> :
        data?.content?.length === 0 ? (
          <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent sx={{ textAlign: 'center', py: 8 }}>
              <Typography color="text.secondary">No applications yet</Typography>
            </CardContent>
          </Card>
        ) : (
          <>
            {data?.content?.map(app => (
              <Card key={app.id} sx={{ mb: 2, border: '1px solid', borderColor: 'divider' }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>{app.candidateName[0]}</Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700}>{app.candidateName}</Typography>
                        <Typography variant="caption" color="text.secondary">{app.candidateEmail}</Typography>
                        <Typography variant="caption" color="text.disabled" display="block">
                          Applied {formatDistanceToNow(new Date(app.appliedAt), { addSuffix: true })}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <Chip label={app.status.replace(/_/g,' ')} color={STATUS_COLORS[app.status]} size="small" />
                      <FormControl size="small" sx={{ minWidth: 160 }}>
                        <Select value={app.status} onChange={e => updateMutation.mutate({ id: app.id, status: e.target.value })}>
                          {STATUSES.map(s => <MenuItem key={s} value={s}>{s.replace(/_/g,' ')}</MenuItem>)}
                        </Select>
                      </FormControl>
                      {app.resumeFileName && (
                        <Button size="small" variant="outlined">
                          Resume
                        </Button>
                      )}
                    </Box>
                  </Box>
                  {app.coverLetter && (
                    <Box sx={{ mt: 1.5, p: 1.5, bgcolor: '#f8fafc', borderRadius: 1 }}>
                      <Typography variant="caption" fontWeight={600}>Cover Letter:</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{app.coverLetter}</Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            ))}
            {data && data.totalPages > 1 && (
              <Box display="flex" justifyContent="center" mt={3}>
                <Pagination count={data.totalPages} page={page} onChange={(_, v) => setPage(v)} color="primary" />
              </Box>
            )}
          </>
        )
      }
    </Container>
  )
}
