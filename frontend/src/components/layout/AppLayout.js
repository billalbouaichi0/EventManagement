import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, CircularProgress, Container } from '@mui/material';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '../../context/AuthContext';

const DRAWER_WIDTH = 260;

export default function AppLayout({ children, maxWidth = 'xl' }) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  useEffect(() => {
    if (!loading && !user && router.pathname !== '/login' && !router.pathname.startsWith('/badge/')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', bgcolor: '#f8fafc' }}>
        <CircularProgress sx={{ color: '#722083' }} />
      </Box>
    );
  }

  // If user is not logged in and on protected page
  if (!user && router.pathname !== '/login' && !router.pathname.startsWith('/badge/')) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8fafc' }}>
      <Sidebar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          width: { xs: '100%', md: `calc(100% - ${DRAWER_WIDTH}px)` }
        }}
      >
        <Header handleDrawerToggle={handleDrawerToggle} />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 3 },
            width: '100%',
            boxSizing: 'border-box'
          }}
        >
          <Container maxWidth={maxWidth} disableGutters>
            {children}
          </Container>
        </Box>
      </Box>
    </Box>
  );
}
