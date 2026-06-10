import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Container, Card, CardContent, Typography, TextField, Button, Box, Grid, FormControl, InputLabel, Select, MenuItem, CircularProgress, Alert } from '@mui/material'
import { useQuery, useMutation } from '@tanstack/react-query'
import { jobsApi, companiesApi } from '../../api/services'
import { useSnackbar } from 'notistack'

export default function PostJobPage() {
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: '', description: '', requirements: '', responsibilities: '', skillsRequired: '',
    location: '', isRemote: false, employmentType: 'FULL_TIME', experienceLevel: 'MID_LEVEL',
    minSalary: '', maxSalary: '', categoryId: '', companyId: '',
  })

  const { data: categoriesData } = useQuery({ queryKey: ['categories'], queryFn: () => jobsApi.getCategories().then(r => r.data.data) })
  const { data: companiesData } = useQuery({ queryKey: ['my-companies'], queryFn: () => companiesApi.getAll().then(r => r.data.data) })

  const createMutation = useMutation({
    mutationFn: () => jobsApi.createJob({
      title: form.title, description: form.description, requirements: form.requirements,
      responsibilities: form.responsibilities, skillsRequired: form.skillsRequired,
      location: form.location, isRemote: form.isRemote,
      employmentType: form.employmentType, experienceLevel: form.experienceLevel,
      minSalary: form.minSalary ? Number(form.minSalary) : undefined,
      maxSalary: form.maxSalary ? Number(form.maxSalary) : undefined,
      categoryId: form.categoryId ? Number(form.categoryId) : undefined,
      companyId: Number(form.companyId),
    }),
    onSuccess: () => {
      enqueueSnackbar('Job posted successfully!', { variant: 'success' })
      navigate('/recruiter/jobs')
    },
    onError: (e: any) => setError(e.response?.data?.message || 'Failed to post job'),
  })

  const f = (key: string) => (e: any) => setForm(p => ({ ...p, [key]: e.target.value }))

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>Post a New Job</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField fullWidth label="Job Title *" size="small" value={form.title} onChange={f('title')} placeholder="e.g. Senior React Developer" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Company *</InputLabel>
                <Select value={form.companyId} label="Company *" onChange={f('companyId')}>
                  {companiesData?.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select value={form.categoryId} label="Category" onChange={f('categoryId')}>
                  <MenuItem value="">None</MenuItem>
                  {categoriesData?.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Location" size="small" value={form.location} onChange={f('location')} placeholder="e.g. Bangalore, Karnataka" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Employment Type</InputLabel>
                <Select value={form.employmentType} label="Employment Type" onChange={f('employmentType')}>
                  {['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE'].map(t => <MenuItem key={t} value={t}>{t.replace('_', ' ')}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Experience Level</InputLabel>
                <Select value={form.experienceLevel} label="Experience Level" onChange={f('experienceLevel')}>
                  {['ENTRY_LEVEL', 'MID_LEVEL', 'SENIOR_LEVEL', 'LEAD', 'MANAGER', 'EXECUTIVE'].map(l => <MenuItem key={l} value={l}>{l.replace('_', ' ')}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField fullWidth label="Min Salary (₹)" size="small" type="number" value={form.minSalary} onChange={f('minSalary')} />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField fullWidth label="Max Salary (₹)" size="small" type="number" value={form.maxSalary} onChange={f('maxSalary')} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth multiline rows={5} label="Job Description *" size="small" value={form.description} onChange={f('description')} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth multiline rows={3} label="Requirements" size="small" value={form.requirements} onChange={f('requirements')} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth multiline rows={3} label="Responsibilities" size="small" value={form.responsibilities} onChange={f('responsibilities')} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Required Skills (comma separated)" size="small" value={form.skillsRequired} onChange={f('skillsRequired')} placeholder="React, TypeScript, Node.js" />
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'flex-end' }}>
            <Button variant="outlined" onClick={() => navigate('/recruiter/jobs')}>Cancel</Button>
            <Button variant="contained" onClick={() => createMutation.mutate()} disabled={createMutation.isPending || !form.title || !form.description || !form.companyId}>
              {createMutation.isPending ? <CircularProgress size={22} color="inherit" /> : 'Post Job'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  )
}
