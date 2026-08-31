import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Button,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Tooltip,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Menu as MenuIcon,
  Monitor,
  Printer,
  Calendar,
  Clock,
  Radio,
  Settings,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { socket } from '../../services/socket';
import api from '../../services/api';


export default function Header({ handleDrawerToggle }) {
  const router = useRouter();
  const {
    user,
    selectedEvent,
    setSelectedEvent,
    workstation,
    setWorkstation,
    printerName,
    setPrinterName
  } = useAuth();

  const [currentTime, setCurrentTime] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [eventsList, setEventsList] = useState([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tempWs, setTempWs] = useState(workstation);
  const [tempPrinter, setTempPrinter] = useState(printerName);

  // Live Clock
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  // Socket Connection Status
  useEffect(() => {
    setIsConnected(socket.connected);
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  // Fetch Events for Quick Switcher
  useEffect(() => {
    if (user) {
      api.get('/events')
        .then((res) => {
          const list = res.data.events || [];
          setEventsList(list);
          if (!selectedEvent && list.length > 0) {
            setSelectedEvent(list[0]);
          }
        })
        .catch(() => {});
    }
  }, [user]);

  const handleSaveSettings = () => {
    setWorkstation(tempWs || 'Poste Standard');
    setPrinterName(tempPrinter || 'Imprimante 1');
    setSettingsOpen(false);
  };

  const handleEventChange = (e) => {
    const found = eventsList.find(evt => evt.id === e.target.value);
    if (found) {
      setSelectedEvent(found);
    }
  };

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          width: '100%',
          bgcolor: '#ffffff',
          color: '#0f172a',
          borderBottom: '1px solid #e2e8f0',
          zIndex: (theme) => theme.zIndex.drawer + 1
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 3 }, minHeight: 64 }}>
          {/* Left: Mobile Toggle & Event Selector */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ display: { md: 'none' }, color: '#64748b' }}
            >
              <MenuIcon size={22} />
            </IconButton>

            {/* Quick Event Switcher */}
            {eventsList.length > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FormControl size="small" sx={{ minWidth: 200, maxWidth: 300 }}>
                  <Select
                    value={selectedEvent?.id || ''}
                    onChange={handleEventChange}
                    displayEmpty
                    sx={{
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      borderRadius: '8px',
                      bgcolor: '#f8fafc',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e2e8f0' }
                    }}
                  >
                    {eventsList.map((evt) => (
                      <MenuItem key={evt.id} value={evt.id} sx={{ fontSize: '0.85rem' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="inherit" sx={{ fontWeight: 600 }}>{evt.name}</Typography>
                          <Chip label={evt.refId} size="small" sx={{ height: 18, fontSize: '0.65rem' }} />
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            )}
          </Box>

          {/* Right: Live Clock, Sync Badge, Workstation Config */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {/* Live Clock */}
            <Box
              sx={{
                display: { xs: 'none', sm: 'flex' },
                alignItems: 'center',
                gap: 0.8,
                px: 1.5,
                py: 0.6,
                bgcolor: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                color: '#475569'
              }}
            >
              <Clock size={15} color="#2596be" />
              <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.04em' }}>
                {currentTime}
              </Typography>
            </Box>

            {/* Live Sync Badge */}
            <Tooltip title={isConnected ? 'Connecté en temps réel (Socket.IO)' : 'Connexion en cours...'}>
              <Chip
                icon={<Radio size={14} color={isConnected ? '#10b981' : '#f59e0b'} />}
                label={isConnected ? 'Direct' : 'Sync...'}
                size="small"
                sx={{
                  bgcolor: isConnected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                  color: isConnected ? '#059669' : '#d97706',
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  border: isConnected ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(245, 158, 11, 0.2)'
                }}
              />
            </Tooltip>

            {/* Workstation & Printer Button */}
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                setTempWs(workstation);
                setTempPrinter(printerName);
                setSettingsOpen(true);
              }}
              startIcon={<Monitor size={15} color="#2596be" />}
              sx={{
                borderColor: '#e2e8f0',
                color: '#334155',
                bgcolor: '#f8fafc',
                fontSize: '0.8rem',
                fontWeight: 600,
                display: { xs: 'none', md: 'inline-flex' },
                '&:hover': { bgcolor: '#f1f5f9', borderColor: '#cbd5e1' }
              }}
            >
              {workstation}
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Workstation Configuration Modal */}
      <Dialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Settings size={20} color="#2596be" />
          Configuration du Poste d'accueil
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#64748b', mb: 2.5 }}>
            Identifiez votre guichet pour tracer vos émargements et impressions dans les logs d'audit.
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Nom du Poste / Guichet"
              placeholder="ex: Guichet A - Entrée Principale"
              value={tempWs}
              onChange={(e) => setTempWs(e.target.value)}
              fullWidth
              InputProps={{
                startAdornment: <Monitor size={18} color="#94a3b8" style={{ marginRight: 8 }} />
              }}
            />

            <TextField
              label="Nom de l'Imprimante Badgeuse"
              placeholder="ex: Brother QL-800 / Zebra ZD410"
              value={tempPrinter}
              onChange={(e) => setTempPrinter(e.target.value)}
              fullWidth
              InputProps={{
                startAdornment: <Printer size={18} color="#94a3b8" style={{ marginRight: 8 }} />
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setSettingsOpen(false)} sx={{ color: '#64748b' }}>
            Annuler
          </Button>
          <Button variant="contained" onClick={handleSaveSettings}>
            Enregistrer le Poste
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
