import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Chip,
  Divider,
  Avatar
} from '@mui/material';
import {
  LayoutDashboard,
  Calendar,
  UserCheck,
  Users,
  FileSpreadsheet,
  ClipboardList,
  BarChart3,
  ShieldCheck,
  History,
  LogOut,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const DRAWER_WIDTH = 260;

export default function Sidebar({ mobileOpen, handleDrawerToggle }) {
  const router = useRouter();
  const { user, isAdmin, selectedEvent, logout } = useAuth();

  const currentEventId = selectedEvent?.id || (router.query.id ? router.query.id : null);

  const mainNavItems = [
    {
      title: 'Tableau de bord',
      path: '/dashboard',
      icon: LayoutDashboard,
      roles: ['ADMIN', 'AGENT']
    },
    {
      title: 'Événements',
      path: '/events',
      icon: Calendar,
      roles: ['ADMIN', 'AGENT']
    }
  ];

  const eventNavItems = currentEventId ? [
    {
      title: 'Guichet Émargement',
      path: `/events/${currentEventId}/check-in`,
      icon: UserCheck,
      badge: 'Direct',
      roles: ['ADMIN', 'AGENT']
    },
    {
      title: 'Liste des Invités',
      path: `/events/${currentEventId}/guests`,
      icon: Users,
      roles: ['ADMIN', 'AGENT']
    },
    {
      title: 'Importation CSV',
      path: `/events/${currentEventId}/import`,
      icon: FileSpreadsheet,
      roles: ['ADMIN']
    },
    {
      title: 'Registre Présences',
      path: `/events/${currentEventId}/attendances`,
      icon: ClipboardList,
      roles: ['ADMIN', 'AGENT']
    },
    {
      title: 'Statistiques & Rapports',
      path: `/events/${currentEventId}/statistics`,
      icon: BarChart3,
      roles: ['ADMIN', 'AGENT']
    }
  ] : [];

  const adminNavItems = [
    {
      title: 'Agents d\'accueil',
      path: '/agents',
      icon: ShieldCheck,
      roles: ['ADMIN']
    },
    {
      title: 'Journal d\'audit',
      path: '/audit-logs',
      icon: History,
      roles: ['ADMIN']
    }
  ];

  const renderNavList = (items, sectionTitle) => (
    <Box sx={{ mb: 2 }}>
      {sectionTitle && (
        <Typography
          variant="caption"
          sx={{
            px: 3,
            py: 1,
            display: 'block',
            color: '#94a3b8',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontSize: '0.7rem'
          }}
        >
          {sectionTitle}
        </Typography>
      )}
      <List sx={{ px: 1.5, py: 0 }}>
        {items
          .filter(item => item.roles.includes(user?.role || 'AGENT'))
          .map((item) => {
            const isActive = router.pathname === item.path || router.asPath === item.path;
            const Icon = item.icon;

            return (
              <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                <Link href={item.path} passHref legacyBehavior>
                  <ListItemButton
                    component="a"
                    onClick={mobileOpen ? handleDrawerToggle : undefined}
                    sx={{
                      borderRadius: '8px',
                      py: 1,
                      px: 1.5,
                      backgroundColor: isActive ? 'rgba(114, 32, 131, 0.08)' : 'transparent',
                      color: isActive ? '#722083' : '#475569',
                      fontWeight: isActive ? 700 : 500,
                      '&:hover': {
                        backgroundColor: isActive ? 'rgba(114, 32, 131, 0.12)' : '#f8f4f9',
                        color: isActive ? '#722083' : '#1e0824'
                      }
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 36,
                        color: isActive ? '#722083' : '#64748b'
                      }}
                    >
                      <Icon size={19} />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.title}
                      primaryTypographyProps={{
                        fontSize: '0.875rem',
                        fontWeight: isActive ? 700 : 500
                      }}
                    />
                    {item.badge && (
                      <Chip
                        label={item.badge}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.65rem',
                          bgcolor: '#fdb700',
                          color: '#1e0824',
                          fontWeight: 800
                        }}
                      />
                    )}
                  </ListItemButton>
                </Link>
              </ListItem>
            );
          })}
      </List>
    </Box>
  );

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#ffffff', borderRight: '1px solid #f0e6f2' }}>
      {/* Brand Header */}
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar
          sx={{
            bgcolor: '#722083',
            width: 38,
            height: 38,
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(114, 32, 131, 0.3)'
          }}
        >
          <Sparkles size={20} color="#fdb700" />
        </Avatar>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e0824', lineHeight: 1.1, fontSize: '1.05rem', letterSpacing: '-0.01em' }}>
            EL-MOULTAKA <span style={{ color: '#722083' }}>APP</span>
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem', fontWeight: 500 }}>
            Gestion & Accueil des Invités
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ mb: 2, borderColor: '#f7eff9' }} />

      {/* Selected Event Indicator */}
      {selectedEvent && (
        <Box sx={{ mx: 2, mb: 2, p: 1.5, bgcolor: '#fdf9ff', borderRadius: '8px', border: '1px solid #f0e6f2' }}>
          <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', fontWeight: 600, fontSize: '0.68rem', textTransform: 'uppercase' }}>
            Événement Actif
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e0824', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.82rem' }}>
            {selectedEvent.name}
          </Typography>
          <Typography variant="caption" sx={{ color: '#722083', fontWeight: 700, fontSize: '0.7rem' }}>
            {selectedEvent.refId}
          </Typography>
        </Box>
      )}

      {/* Navigation Groups */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
        {renderNavList(mainNavItems, 'Navigation')}
        {eventNavItems.length > 0 && renderNavList(eventNavItems, 'Opérations Événement')}
        {isAdmin && renderNavList(adminNavItems, 'Administration')}
      </Box>

      <Divider sx={{ borderColor: '#f7eff9' }} />

      {/* User Footer */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#fbf9fc' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, overflow: 'hidden' }}>
          <Avatar sx={{ width: 34, height: 34, bgcolor: '#722083', color: '#ffffff', fontSize: '0.85rem', fontWeight: 700 }}>
            {user?.fullName?.charAt(0) || 'U'}
          </Avatar>
          <Box sx={{ overflow: 'hidden' }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a', fontSize: '0.82rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {user?.fullName || 'Utilisateur'}
            </Typography>
            <Chip
              label={user?.role || 'AGENT'}
              size="small"
              sx={{
                height: 18,
                fontSize: '0.62rem',
                fontWeight: 700,
                bgcolor: user?.role === 'ADMIN' ? '#e0f2fe' : '#f1f5f9',
                color: user?.role === 'ADMIN' ? '#0284c7' : '#475569'
              }}
            />
          </Box>
        </Box>
        <ListItemButton
          onClick={logout}
          sx={{
            p: 1,
            borderRadius: '8px',
            color: '#ef4444',
            minWidth: 'auto',
            '&:hover': { bgcolor: '#fee2e2' }
          }}
          title="Se déconnecter"
        >
          <LogOut size={18} />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH }
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Persistent Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH, border: 'none' }
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
}
