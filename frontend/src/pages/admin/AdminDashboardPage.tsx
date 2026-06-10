import { Container, Grid, Card, CardContent, Typography, Box } from '@mui/material'
import PeopleIcon from '@mui/icons-material/People'
import WorkIcon from '@mui/icons-material/Work'
import { useQuery } from '@tanstack/react-query'
import { adminApi, jobsApi } from '../../api/services'

export default function AdminDashboardPage() {
  const { data: usersData } = useQuery({ queryKey: ['admin-users'], queryFn: () => adminApi.getUsers(0, 1).then(r => r.data.data) })
  const { data: jobsData } = useQuery({ queryKey: ['admin-jobs'], queryFn: () => jobsApi.search({ page: 0, size: 1 }).then(r => r.data.data) })

  const stats = [
    { label: 'Total Users', value: usersData?.totalElements ?? '…', icon: <PeopleIcon />, color: '#eff6ff', iconColor: '#2563eb' },
    { label: 'Active Jobs', value: jobsData?.totalElements ?? '…', icon: <WorkIcon />, color: '#f0fdf4', iconColor: '#16a34a' },
  ]

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>Admin Dashboard</Typography>
      <Grid container spacing={3}>
        {stats.map(stat => (
          <Grid item xs={12} sm={6} md={3} key={stat.label}>
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
    </Container>
  )
}
