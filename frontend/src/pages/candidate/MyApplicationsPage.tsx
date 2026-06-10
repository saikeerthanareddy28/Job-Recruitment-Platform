import { useState } from 'react'
import { Container, Typography, Card, CardContent, Box, Chip, Button, CircularProgress, Avatar, Pagination, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { applicationsApi } from '../../api/services'
import { useSnackbar } from 'notistack'
import { formatDistanceToNow } from 'date-fns'
import type { ApplicationStatus } from '../../types'

const STATUS_COLORS: Record<ApplicationStatus, 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'> = {
  APPLIED: 'info', UNDER_REVIEW: 'warning', SHORTLISTED: 'primary',
  INTERVIEW_SCHEDULED: 'secondary' as any, OFFERED: 'success',
  REJECTED: 'error', WITHDRAWN: 'default',
}

export default function MyApplicationsPage() {
  const [page, setPage] = useState(1)
  const [withdrawId, setWithdrawId] = useState<number | null>(null)
  const { enqueueSnackbar } = useSnackbar()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['my-applications', page],
    queryFn: () => applicationsApi.getMyApplications(page - 1, 10).then(r => r.data.data),
  })

  const withdrawMutation = useMutation({
    mutationFn: (id: number) => applicationsApi.withdraw(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-applications'] })
      setWithdrawId(null)
      enqueueSnackbar('Application withdrawn', { variant: 'success' })
    },
    onError: () => enqueueSnackbar('Failed to withdraw application', { variant: 'error' }),
  })

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>My Applications</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        {data?.totalElements ?? 0} total applications
      </Typography>

      {isLoading ? (
        <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>
      ) : data?.content?.length === 0 ? (
        <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">No applications yet</Typography>
            <Button variant="contained" href="/find-jobs" sx={{ mt: 2 }}>Browse Jobs</Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {data?.content?.map(app => (
            <Card key={app.id} sx={{ mb: 2, border: '1px solid', borderColor: 'divider' }}>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Avatar variant="rounded" sx={{ bgcolor: 'primary.50', color: 'primary.main', fontWeight: 700 }}>
                      {app.companyName[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700}>{app.jobTitle}</Typography>
                      <Typography variant="body2" color="text.secondary">{app.companyName}</Typography>
                      {app.jobLocation && (
                        <Typography variant="caption" color="text.disabled">{app.jobLocation}</Typography>
                      )}
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ textAlign: 'right' }}>
                      <Chip label={app.status.replace(/_/g, ' ')} color={STATUS_COLORS[app.status]} size="small" sx={{ fontWeight: 600 }} />
                      <Typography variant="caption" color="text.disabled" display="block" sx={{ mt: 0.5 }}>
                        Applied {formatDistanceToNow(new Date(app.appliedAt), { addSuffix: true })}
                      </Typography>
                    </Box>
                    {app.status === 'APPLIED' || app.status === 'UNDER_REVIEW' ? (
                      <Button size="small" color="error" variant="outlined" onClick={() => setWithdrawId(app.id)}>
                        Withdraw
                      </Button>
                    ) : null}
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

      <Dialog open={!!withdrawId} onClose={() => setWithdrawId(null)}>
        <DialogTitle>Withdraw Application</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to withdraw this application? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWithdrawId(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={() => withdrawId && withdrawMutation.mutate(withdrawId)} disabled={withdrawMutation.isPending}>
            {withdrawMutation.isPending ? <CircularProgress size={20} /> : 'Withdraw'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
