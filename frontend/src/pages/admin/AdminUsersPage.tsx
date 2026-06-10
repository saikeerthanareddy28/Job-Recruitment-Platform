import { useState } from 'react'
import { Container, Typography, Card, CardContent, Box, Chip, Button, CircularProgress, Avatar, Pagination } from '@mui/material'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../api/services'
import { useSnackbar } from 'notistack'
import { formatDistanceToNow } from 'date-fns'

export default function AdminUsersPage() {
  const [page, setPage] = useState(1)
  const { enqueueSnackbar } = useSnackbar()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({ queryKey: ['admin-users-list', page], queryFn: () => adminApi.getUsers(page - 1, 20).then(r => r.data.data) })

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) => active ? adminApi.deactivateUser(id) : adminApi.activateUser(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-users-list'] }); enqueueSnackbar('User status updated', { variant: 'success' }) },
  })

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>User Management</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>{data?.totalElements ?? 0} total users</Typography>

      {isLoading ? <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box> :
        data?.content?.map(user => (
          <Card key={user.id} sx={{ mb: 2, border: '1px solid', borderColor: 'divider' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Avatar src={user.profilePicture} sx={{ bgcolor: 'primary.main' }}>{user.firstName[0]}</Avatar>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700}>{user.firstName} {user.lastName}</Typography>
                    <Typography variant="caption" color="text.secondary">{user.email} · @{user.username}</Typography>
                    <Typography variant="caption" color="text.disabled" display="block">
                      Joined {user.createdAt ? formatDistanceToNow(new Date(user.createdAt), { addSuffix: true }) : ''}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Chip label={user.role} size="small" color={user.role === 'ADMIN' ? 'error' : user.role === 'RECRUITER' ? 'warning' : 'primary'} />
                  <Chip label={user.isActive ? 'Active' : 'Inactive'} size="small" color={user.isActive ? 'success' : 'default'} />
                  <Button size="small" variant="outlined" color={user.isActive ? 'error' : 'success'} onClick={() => toggleMutation.mutate({ id: user.id, active: user.isActive ?? true })}>
                    {user.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
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
