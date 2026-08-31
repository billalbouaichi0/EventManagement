import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Divider,
  LinearProgress,
  Avatar
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  BarChart3,
  Download,
  Users,
  UserCheck,
  UserX,
  UserPlus,
  Printer,
  Award,
  Building,
  MapPin
} from 'lucide-react';
import AppLayout from '../../../components/layout/AppLayout';
import StatsCard from '../../../components/common/StatsCard';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';

const COLORS = ['#2596be', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#3b82f6'];

export default function StatisticsPage() {
  const router = useRouter();
  const { id: eventId } = router.query;
  const { user } = useAuth();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    if (!eventId) return;
    try {
      const res = await api.get(`/stats/event/${eventId}`);
      setStats(res.data.stats || {});
    } catch (err) {
      console.error('Erreur stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [eventId]);

  const handleExportExcel = () => {
    if (!eventId) return;
    const token = localStorage.getItem('token');
    window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/stats/export-excel/${eventId}?token=${token}`, '_blank');
  };

  if (loading || !stats) {
    return (
      <AppLayout>
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <LinearProgress sx={{ color: '#2596be' }} />
        </Box>
      </AppLayout>
    );
  }

  const pieData = [
    { name: 'Présents', value: stats.presentCount },
    { name: 'Absents', value: stats.absentCount }
  ];

  return (
    <AppLayout>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>
            Statistiques & Rapports d'Événement
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            Analyse détaillée des flux d'arrivée, de la répartition géographique et de l'activité des guichets
          </Typography>
        </Box>

        <Button
          variant="contained"
          onClick={handleExportExcel}
          startIcon={<Download size={18} />}
          sx={{ bgcolor: '#2596be', fontWeight: 700 }}
        >
          Exporter le Rapport Excel Complet
        </Button>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatsCard
            title="Total Enregistrés"
            value={stats.totalGuests}
            subtitle="Base officielle"
            icon={Users}
            color="#2596be"
            lightBg="rgba(37, 150, 190, 0.08)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatsCard
            title="Présents Émargés"
            value={stats.presentCount}
            subtitle={`Taux: ${stats.presenceRate}%`}
            icon={UserCheck}
            color="#10b981"
            lightBg="rgba(16, 185, 129, 0.08)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatsCard
            title="Absents"
            value={stats.absentCount}
            subtitle={`${(100 - stats.presenceRate).toFixed(1)}% restants`}
            icon={UserX}
            color="#f59e0b"
            lightBg="rgba(245, 158, 11, 0.08)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatsCard
            title="Ajouts Walk-in"
            value={stats.walkInCount}
            subtitle="Sur place"
            icon={UserPlus}
            color="#8b5cf6"
            lightBg="rgba(139, 92, 246, 0.08)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatsCard
            title="Total Badges"
            value={stats.totalBadgePrints}
            subtitle="Format 4.5 × 6 cm"
            icon={Printer}
            color="#0284c7"
            lightBg="rgba(2, 132, 199, 0.08)"
          />
        </Grid>
      </Grid>

      {/* Graphical Analytics */}
      <Grid container spacing={3}>
        {/* Hourly Arrivals Chart */}
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 3.5, p: 2.5, height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem', mb: 2 }}>
              Flux des Arrivées par Tranche Horaire
            </Typography>

            <Box sx={{ width: '100%', height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.hourlyArrivals || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="hour" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <ChartTooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: 8,
                      border: 'none',
                      color: '#ffffff'
                    }}
                  />
                  <Bar dataKey="count" fill="#2596be" radius={[6, 6, 0, 0]} name="Arrivées" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>

        {/* Presence Breakdown Ratio */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3.5, p: 2.5, height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem', mb: 2 }}>
              Taux Global d'Assistance
            </Typography>

            <Box sx={{ width: '100%', height: 200, display: 'flex', justifyContent: 'center' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#f1f5f9" />
                  </Pie>
                  <ChartTooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 2 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 700 }}>PRÉSENTS</Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#10b981' }}>{stats.presenceRate}%</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>ABSENTS</Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#64748b' }}>{(100 - stats.presenceRate).toFixed(1)}%</Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        {/* Wilaya Distribution */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3.5, p: 2.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <MapPin size={18} color="#2596be" />
              Répartition par Wilaya d'origine
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {stats.wilayaDistribution?.map((w, idx) => {
                const percent = stats.totalGuests > 0 ? (w.count / stats.totalGuests) * 100 : 0;
                return (
                  <Box key={idx}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>{w.wilaya}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#2596be' }}>{w.count} ({percent.toFixed(1)}%)</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={percent} sx={{ height: 6, borderRadius: 3, bgcolor: '#f1f5f9' }} />
                  </Box>
                );
              })}
            </Box>
          </Card>
        </Grid>

        {/* Bank Distribution */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3.5, p: 2.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Building size={18} color="#2596be" />
              Répartition par Banque de Domiciliation
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {stats.bankDistribution?.map((b, idx) => {
                const percent = stats.totalGuests > 0 ? (b.count / stats.totalGuests) * 100 : 0;
                return (
                  <Box key={idx}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>{b.bank}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#2596be' }}>{b.count} ({percent.toFixed(1)}%)</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={percent} sx={{ height: 6, borderRadius: 3, bgcolor: '#f1f5f9' }} />
                  </Box>
                );
              })}
            </Box>
          </Card>
        </Grid>
      </Grid>
    </AppLayout>
  );
}
