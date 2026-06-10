import { useState } from 'react'
import { Container, Card, CardContent, Typography, TextField, Button, Box, Grid, CircularProgress, Alert } from '@mui/material'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { companiesApi } from '../../api/services'
import { useSnackbar } from 'notistack'

export default function CompanyProfilePage() {
  const { enqueueSnackbar } = useSnackbar()
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', websiteUrl: '', description: '', industry: '', companySize: '', headquartersLocation: '', foundedYear: '', linkedinUrl: '' })

  const { data: companies, isLoading } = useQuery({ queryKey: ['companies'], queryFn: () => companiesApi.getAll().then(r => r.data.data) })
  const myCompany = companies?.[0]

  const createMutation = useMutation({
    mutationFn: () => companiesApi.create({ ...form, foundedYear: form.foundedYear ? Number(form.foundedYear) : undefined }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['companies'] }); setEditing(false); enqueueSnackbar('Company created', { variant: 'success' }) },
    onError: (e: any) => setError(e.response?.data?.message || 'Failed to save'),
  })

  const updateMutation = useMutation({
    mutationFn: () => companiesApi.update(myCompany!.id, { ...form, foundedYear: form.foundedYear ? Number(form.foundedYear) : undefined }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['companies'] }); setEditing(false); enqueueSnackbar('Company updated', { variant: 'success' }) },
    onError: (e: any) => setError(e.response?.data?.message || 'Failed to save'),
  })

  const startEdit = () => {
    if (myCompany) setForm({ name: myCompany.name, websiteUrl: '', description: '', industry: myCompany.industry || '', companySize: myCompany.companySize || '', headquartersLocation: myCompany.headquartersLocation || '', foundedYear: '', linkedinUrl: '' })
    setEditing(true)
  }

  const f = (key: string) => (e: any) => setForm(p => ({ ...p, [key]: e.target.value }))

  if (isLoading) return <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>Company Profile</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {!myCompany && !editing ? (
        <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" gutterBottom>No company profile yet</Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>Create your company profile to start posting jobs</Typography>
            <Button variant="contained" onClick={() => setEditing(true)}>Create Company Profile</Button>
          </CardContent>
        </Card>
      ) : !editing ? (
        <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h5" fontWeight={700}>{myCompany?.name}</Typography>
              <Button variant="outlined" onClick={startEdit}>Edit</Button>
            </Box>
            {[
              { label: 'Industry', value: myCompany?.industry },
              { label: 'Company Size', value: myCompany?.companySize },
              { label: 'Location', value: myCompany?.headquartersLocation },
              { label: 'Verified', value: myCompany?.isVerified ? 'Yes' : 'Pending verification' },
            ].map(item => item.value && (
              <Box key={item.label} sx={{ mb: 1.5 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>{item.label}</Typography>
                <Typography variant="body2">{item.value}</Typography>
              </Box>
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
          <CardContent sx={{ p: 3 }}>
            <Grid container spacing={2}>
              {[
                { label: 'Company Name *', key: 'name' }, { label: 'Website URL', key: 'websiteUrl' },
                { label: 'Industry', key: 'industry' }, { label: 'Company Size', key: 'companySize', placeholder: 'e.g. 50-200 employees' },
                { label: 'Headquarters Location', key: 'headquartersLocation' }, { label: 'Founded Year', key: 'foundedYear' },
                { label: 'LinkedIn URL', key: 'linkedinUrl' },
              ].map(field => (
                <Grid item xs={12} sm={6} key={field.key}>
                  <TextField fullWidth size="small" label={field.label} placeholder={(field as any).placeholder} value={(form as any)[field.key]} onChange={f(field.key)} />
                </Grid>
              ))}
              <Grid item xs={12}>
                <TextField fullWidth multiline rows={4} size="small" label="Description" value={form.description} onChange={f('description')} />
              </Grid>
            </Grid>
            <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'flex-end' }}>
              <Button variant="outlined" onClick={() => setEditing(false)}>Cancel</Button>
              <Button variant="contained" onClick={() => myCompany ? updateMutation.mutate() : createMutation.mutate()} disabled={createMutation.isPending || updateMutation.isPending}>
                {(createMutation.isPending || updateMutation.isPending) ? <CircularProgress size={22} color="inherit" /> : 'Save'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}
    </Container>
  )
}
