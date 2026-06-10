import { useState } from 'react'
import { Outlet, useNavigate, Link as RouterLink, useLocation } from 'react-router-dom'
import {
  AppBar, Toolbar, Box, Button, Typography, Avatar, Menu, MenuItem,
  IconButton, Badge, Divider, Chip, Container, useTheme, useMediaQuery,
  Drawer, List, ListItem, ListItemText, ListItemButton,
} from '@mui/material'
import WorkIcon from '@mui/icons-material/Work'
import NotificationsIcon from '@mui/icons-material/Notifications'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import MenuIcon from '@mui/icons-material/Menu'
import LogoutIcon from '@mui/icons-material/Logout'
import SettingsIcon from '@mui/icons-material/Settings'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../store/AuthContext'
import { authApi, notificationsApi } from '../../api/services'
import { useSnackbar } from 'notistack'
import NotificationsPanel from '../common/NotificationsPanel'

export default function MainLayout() {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { enqueueSnackbar } = useSnackbar()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [notifAnchor, setNotifAnchor] = useState<null | HTMLElement>(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  const { data: unreadCount } = useQuery({
    queryKey: ['notif-count'],
    queryFn: () => notificationsApi.getUnreadCount().then(r => r.data.data.count),
    enabled: isAuthenticated,
    refetchInterval: 30000,
  })

  const handleLogout = async () => {
    try {
      await authApi.logout()
    } catch { /* silent */ } finally {
      logout()
      navigate('/login')
      enqueueSnackbar('Logged out successfully', { variant: 'success' })
    }
  }

  const candidateNavLinks = [
    { label: 'Home', path: '/' },
    { label: 'Find Jobs', path: '/find-jobs' },
    { label: 'My Applications', path: '/my-applications' },
    { label: 'Saved Jobs', path: '/saved-jobs' },
    { label: 'Profile', path: '/profile' },
  ]

  const recruiterNavLinks = [
    { label: 'Dashboard', path: '/recruiter/dashboard' },
    { label: 'Post Job', path: '/recruiter/post-job' },
    { label: 'My Jobs', path: '/recruiter/jobs' },
    { label: 'Company', path: '/recruiter/company' },
  ]

  const adminNavLinks = [
    { label: 'Dashboard', path: '/admin/dashboard' },
    { label: 'Users', path: '/admin/users' },
  ]

  const navLinks = user?.role === 'RECRUITER'
    ? recruiterNavLinks
    : user?.role === 'ADMIN'
    ? adminNavLinks
    : candidateNavLinks

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: 'white',
          borderBottom: '1px solid',
          borderColor: 'divider',
          color: 'text.primary',
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ gap: 2, minHeight: '64px !important' }}>
            {isMobile && (
              <IconButton onClick={() => setMobileOpen(true)} edge="start">
                <MenuIcon />
              </IconButton>
            )}

            {/* Logo */}
            <RouterLink to={user?.role === 'RECRUITER' ? '/recruiter/dashboard' : '/'}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    bgcolor: 'primary.main',
                    borderRadius: 1.5,
                    p: 0.6,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <WorkIcon sx={{ color: 'white', fontSize: 20 }} />
                </Box>
                <Typography variant="h6" fontWeight={700} sx={{ color: 'text.primary' }}>
                  Job<span style={{ color: theme.palette.primary.main }}>Portal</span>
                </Typography>
              </Box>
            </RouterLink>

            {/* Desktop Nav */}
            {!isMobile && isAuthenticated && (
              <Box sx={{ display: 'flex', gap: 0.5, flexGrow: 1, ml: 3 }}>
                {navLinks.map(link => (
                  <Button
                    key={link.path}
                    component={RouterLink}
                    to={link.path}
                    sx={{
                      color: isActive(link.path) ? 'primary.main' : 'text.secondary',
                      fontWeight: isActive(link.path) ? 700 : 500,
                      borderBottom: isActive(link.path) ? '2px solid' : '2px solid transparent',
                      borderRadius: 0,
                      pb: 0.5,
                      '&:hover': { color: 'primary.main', bgcolor: 'transparent' },
                    }}
                  >
                    {link.label}
                  </Button>
                ))}
              </Box>
            )}

            <Box sx={{ flexGrow: isMobile ? 1 : 0 }} />

            {isAuthenticated && user ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {/* Notifications */}
                <IconButton onClick={(e) => setNotifAnchor(e.currentTarget)} size="small">
                  <Badge badgeContent={unreadCount || 0} color="error" max={99}>
                    <NotificationsIcon />
                  </Badge>
                </IconButton>

                {/* User menu */}
                <Button
                  onClick={(e) => setAnchorEl(e.currentTarget)}
                  sx={{ gap: 1, color: 'text.primary', textTransform: 'none' }}
                  startIcon={
                    <Avatar
                      src={user.profilePicture}
                      sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 14 }}
                    >
                      {user.firstName[0]}
                    </Avatar>
                  }
                >
                  {!isMobile && `Hello, ${user.firstName}`}
                </Button>

                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={() => setAnchorEl(null)}
                  PaperProps={{ sx: { minWidth: 200, mt: 1 } }}
                >
                  <Box sx={{ px: 2, py: 1.5 }}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {user.firstName} {user.lastName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {user.email}
                    </Typography>
                    <Chip
                      label={user.role}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ mt: 0.5, display: 'block', width: 'fit-content' }}
                    />
                  </Box>
                  <Divider />
                  <MenuItem
                    onClick={() => {
                      setAnchorEl(null)
                      navigate(user.role === 'RECRUITER' ? '/recruiter/company' : '/profile')
                    }}
                  >
                    <AccountCircleIcon fontSize="small" sx={{ mr: 1 }} />
                    Profile
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={() => { setAnchorEl(null); handleLogout() }} sx={{ color: 'error.main' }}>
                    <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
                    Sign Out
                  </MenuItem>
                </Menu>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button component={RouterLink} to="/login" variant="outlined" size="small">
                  Sign In
                </Button>
                <Button component={RouterLink} to="/register" variant="contained" size="small">
                  Get Started
                </Button>
              </Box>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer open={mobileOpen} onClose={() => setMobileOpen(false)}>
        <Box sx={{ width: 260, pt: 2 }}>
          <Box sx={{ px: 2, pb: 2 }}>
            <Typography variant="h6" fontWeight={700}>
              Job<span style={{ color: theme.palette.primary.main }}>Portal</span>
            </Typography>
          </Box>
          <Divider />
          <List>
            {navLinks.map(link => (
              <ListItem key={link.path} disablePadding>
                <ListItemButton
                  selected={isActive(link.path)}
                  onClick={() => { navigate(link.path); setMobileOpen(false) }}
                >
                  <ListItemText primary={link.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider />
          <List>
            <ListItem disablePadding>
              <ListItemButton onClick={() => { handleLogout(); setMobileOpen(false) }}>
                <LogoutIcon sx={{ mr: 1, fontSize: 18 }} />
                <ListItemText primary="Sign Out" />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* Notifications Panel */}
      <NotificationsPanel
        anchorEl={notifAnchor}
        onClose={() => setNotifAnchor(null)}
      />

      <Box component="main" sx={{ flexGrow: 1 }}>
        <Outlet />
      </Box>
    </Box>
  )
}
