import { Menu, Box, Typography, IconButton, Divider, MenuItem, Chip, Button } from '@mui/material'
import DoneAllIcon from '@mui/icons-material/DoneAll'
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationsApi } from '../../api/services'
import { formatDistanceToNow } from 'date-fns'
import type { Notification } from '../../types'
import { useAuth } from '../../store/AuthContext'

interface Props {
  anchorEl: null | HTMLElement
  onClose: () => void
}

const typeColors: Record<Notification['type'], string> = {
  JOB_ALERT: '#3b82f6',
  APPLICATION_UPDATE: '#10b981',
  INTERVIEW_SCHEDULED: '#8b5cf6',
  NEW_MESSAGE: '#f59e0b',
  PROFILE_VIEW: '#ec4899',
  SYSTEM: '#64748b',
}

export default function NotificationsPanel({ anchorEl, onClose }: Props) {
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.getAll(0, 10).then(r => r.data.data),
    enabled: isAuthenticated && Boolean(anchorEl),
  })

  const markAllMutation = useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notif-count'] })
    },
  })

  const markOneMutation = useMutation({
    mutationFn: (id: number) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notif-count'] })
    },
  })

  const notifications = data?.content ?? []

  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 380,
          maxHeight: 520,
          mt: 1,
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        },
      }}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
    >
      <Box
        sx={{
          px: 2,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="subtitle1" fontWeight={700}>
          Notifications
        </Typography>
        <Button
          size="small"
          startIcon={<DoneAllIcon />}
          onClick={() => markAllMutation.mutate()}
          disabled={markAllMutation.isPending}
        >
          Mark all read
        </Button>
      </Box>
      <Divider />

      {notifications.length === 0 ? (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            No notifications yet
          </Typography>
        </Box>
      ) : (
        notifications.map((notif) => (
          <MenuItem
            key={notif.id}
            onClick={() => {
              if (!notif.isRead) markOneMutation.mutate(notif.id)
              onClose()
            }}
            sx={{
              alignItems: 'flex-start',
              gap: 1.5,
              py: 1.5,
              px: 2,
              bgcolor: notif.isRead ? 'transparent' : 'primary.50',
              borderLeft: notif.isRead ? 'none' : `3px solid ${typeColors[notif.type]}`,
              whiteSpace: 'normal',
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: notif.isRead ? 'transparent' : typeColors[notif.type],
                mt: 0.8,
                flexShrink: 0,
              }}
            />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" fontWeight={notif.isRead ? 400 : 600} noWrap>
                {notif.title}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mt: 0.25, lineHeight: 1.4 }}
              >
                {notif.message}
              </Typography>
              <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: 'block' }}>
                {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
              </Typography>
            </Box>
          </MenuItem>
        ))
      )}
    </Menu>
  )
}
