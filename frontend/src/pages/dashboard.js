import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  IconButton
} from '@mui/material';
import {
  Users,
  UserCheck,
  UserX,
  UserPlus,
  Printer,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Calendar,
  MapPin,
  Clock,
  Radio,
  ExternalLink
} from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import StatsCard from '../components/common/StatsCard';
import { useAuth } from '../context/AuthContext';
import { socket } from '../services/socket';
import api from '../services/api';

export default function Dashboard() {
  const router = useRouter();
  const { user, selectedEvent } = useAuth();

  const [stats, setStats] = useState({
    totalGuests: 0,
    presentCount: 0,
    absentCount: 0,
    presenceRate: 0,
    walkInCount: 0,
    totalBadgePrints: 0,
    wilayaDistribution: [],
    bankDistribution: [],
    agentLeaderboard: []
  });

  const [recentAttendances, setRecentAttendances] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    if (!selectedEvent?.id) return;
    try {
      const [statsRes, attRes] = await Promise.all([
        api.get(`/stats/event/${selectedEvent.id}`),
        api.get(`/attendances?eventId=${selectedEvent.id}&limit=6`)
      ]);
      setStats(statsRes.data.stats || {});
      setRecentAttendances(attRes.data.attendances || []);
    } catch (err) {
      console.error('Erreur chargement stats dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [selectedEvent]);

  // Socket.IO real-time updates
  useEffect(() => {
    const handleCheckedIn = (data) => {
      if (data.eventId === selectedEvent?.id) {
        fetchStats();
      }
    };

    const handleCheckInCancelled = (data) => {
      if (data.eventId === selectedEvent?.id) {
        fetchStats();
      }
    };

    const handleStatsRefresh = (data) => {
      if (data.eventId === selectedEvent?.id) {
        fetchStats();
      }
    };

    socket.on('guest:checked-in', handleCheckedIn);
    socket.on('guest:check-in-cancelled', handleCheckInCancelled);
    socket.on('stats:refresh', handleStatsRefresh);

    return () => {
      socket.off('guest:checked-in', handleCheckedIn);
      socket.off('guest:check-in-cancelled', handleCheckInCancelled);
      socket.off('stats:refresh', handleStatsRefresh);
    };
  }, [selectedEvent]);

  return (
    <AppLayout>
      <Box sx={{ mb: 3 }}>
        {/* Welcome / Event Hero Card */}
        <Card
          sx={{
            mb: 3,
            p: 3,
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: '#ffffff',
            borderRadius: 3.5,
            position: 'relative',
            overflow: 'hidden',
            border: 'none',
            boxShadow: '0 20px 30px -10px rgba(15, 23, 42, 0.2)'
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              right: -30,
              top: -30,
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(37, 150, 190, 0.3) 0%, rgba(37, 150, 190, 0) 70%)',
              pointerEvents: 'none'
            }}
          />

          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                <Chip
                  label={selectedEvent?.status || 'EN_COURS'}
                  size="small"
                  sx={{
                    bgcolor: '#2596be',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.72rem'
                  }}
                />
                <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
                  RÉF: {selectedEvent?.refId || 'EVT-2026-0001'}
                </Typography>
              </Box>

              <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.02em' }}>
                {selectedEvent?.name || 'Sélectionnez un Événement'}
              </Typography>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2.5, color: '#cbd5e1', fontSize: '0.85rem' }}>
                {selectedEvent?.eventDate && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                    <Calendar size={16} color="#2596be" />
                    <span>{new Date(selectedEvent.eventDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </Box>
                )}
                {selectedEvent?.location && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                    <MapPin size={16} color="#2596be" />
                    <span>{selectedEvent.location}</span>
                  </Box>
                )}
              </Box>
            </Grid>

            <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
              {selectedEvent && (
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => router.push(`/events/${selectedEvent.id}/check-in`)}
                  startIcon={<UserCheck size={20} />}
                  sx={{
                    bgcolor: '#2596be',
                    color: '#ffffff',
                    fontWeight: 700,
                    px: 3,
                    py: 1.4,
                    fontSize: '0.95rem',
                    borderRadius: 2.5,
                    boxShadow: '0 8px 20px rgba(37, 150, 190, 0.4)',
                    '&:hover': { bgcolor: '#1b7495' }
                  }}
                >
                  Ouvrir Guichet Émargement
                </Button>
              )}
            </Grid>
          </Grid>
        </Card>

        {/* 5 Key Metric Cards */}
        <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatsCard
              title="Total Invités"
              value={stats.totalGuests}
              subtitle="Liste officielle importée"
              icon={Users}
              color="#2596be"
              lightBg="rgba(37, 150, 190, 0.08)"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <StatsCard
              title="Présents"
              value={stats.presentCount}
              subtitle={`Taux: ${stats.presenceRate}%`}
              icon={UserCheck}
              color="#10b981"
              lightBg="rgba(16, 185, 129, 0.08)"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <StatsCard
              title="Attente / Absents"
              value={stats.absentCount}
              subtitle={`${(100 - stats.presenceRate).toFixed(1)}% restants`}
              icon={UserX}
              color="#f59e0b"
              lightBg="rgba(245, 158, 11, 0.08)"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <StatsCard
              title="Ajouts sur place"
              value={stats.walkInCount}
              subtitle="Walk-in & VIP"
              icon={UserPlus}
              color="#8b5cf6"
              lightBg="rgba(139, 92, 246, 0.08)"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <StatsCard
              title="Badges Imprimés"
              value={stats.totalBadgePrints}
              subtitle="Format 4.5 × 6 cm"
              icon={Printer}
              color="#0284c7"
              lightBg="rgba(2, 132, 199, 0.08)"
            />
          </Grid>
        </Grid>

        {/* Secondary Section: Live Feed & Agent Leaderboard */}
        <Grid container spacing={3}>
          {/* Live Recent Check-ins */}
          <Grid item xs={12} md={7}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10b981', animation: 'pulseGlow 2s infinite' }} />
                    <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>
                      Derniers Émargements en Direct
                    </Typography>
                  </Box>

                  {selectedEvent && (
                    <Button
                      size="small"
                      onClick={() => router.push(`/events/${selectedEvent.id}/attendances`)}
                      endIcon={<ArrowRight size={14} />}
                      sx={{ color: '#2596be', fontWeight: 600, fontSize: '0.8rem' }}
                    >
                      Voir tout
                    </Button>
                  )}
                </Box>

                {recentAttendances.length === 0 ? (
                  <Box sx={{ py: 6, textAlign: 'center', color: '#94a3b8' }}>
                    <Users size={36} style={{ marginBottom: 8, opacity: 0.5 }} />
                    <Typography variant="body2">Aucun émargement enregistré pour le moment.</Typography>
                  </Box>
                ) : (
                  <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #f1f5f9' }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Invité / Raison Sociale</TableCell>
                          <TableCell>Heure</TableCell>
                          <TableCell>Agent</TableCell>
                          <TableCell>Guichet</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {recentAttendances.map((att) => (
                          <TableRow key={att.id} hover>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                                {att.guest?.lastNameOrCompany} {att.guest?.firstName || ''}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#2596be', fontWeight: 600 }}>
                                {att.guest?.refId}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="caption" sx={{ fontWeight: 600, color: '#475569' }}>
                                {new Date(att.checkedInAt).toLocaleTimeString('fr-FR')}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#334155' }}>
                                {att.agent?.fullName || 'Agent'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={att.workstation || 'Poste'}
                                size="small"
                                sx={{ height: 20, fontSize: '0.65rem', bgcolor: '#f1f5f9' }}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Leaderboard & Breakdown */}
          <Grid item xs={12} md={5}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a', mb: 2 }}>
                  Activité des Agents d'Accueil
                </Typography>

                {stats.agentLeaderboard?.length === 0 ? (
                  <Box sx={{ py: 6, textAlign: 'center', color: '#94a3b8' }}>
                    <Typography variant="body2">En attente d'activité des agents.</Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {stats.agentLeaderboard.map((ag, index) => {
                      const percent = stats.presentCount > 0 ? (ag.checkInCount / stats.presentCount) * 100 : 0;
                      return (
                        <Box key={ag.agentId || index} sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar sx={{ width: 28, height: 28, bgcolor: '#2596be', fontSize: '0.75rem', fontWeight: 700 }}>
                                {ag.agentName.charAt(0)}
                              </Avatar>
                              <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                                {ag.agentName}
                              </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#2596be' }}>
                              {ag.checkInCount} émargements
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={percent}
                            sx={{
                              height: 6,
                              borderRadius: 3,
                              bgcolor: '#e2e8f0',
                              '& .MuiLinearProgress-bar': { bgcolor: '#2596be', borderRadius: 3 }
                            }}
                          />
                        </Box>
                      );
                    })}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </AppLayout>
  );
}
