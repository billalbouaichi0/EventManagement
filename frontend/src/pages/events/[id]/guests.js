import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  InputAdornment,
  Grid,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Avatar,
  CircularProgress
} from '@mui/material';
import {
  Search,
  Users,
  UserCheck,
  Printer,
  Download,
  Filter,
  Eye,
  Plus,
  ArrowUpDown
} from 'lucide-react';
import AppLayout from '../../../components/layout/AppLayout';
import GuestDetailModal from '../../../components/guests/GuestDetailModal';
import NewGuestModal from '../../../components/guests/NewGuestModal';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';

export default function GuestsPage() {
  const router = useRouter();
  const { id: eventId } = router.query;
  const { user, workstation, printerName, setSelectedEvent, selectedEvent } = useAuth();

  const [guests, setGuests] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(''); // 'PRESENT', 'ABSENT', ''
  const [guestTypeFilter, setGuestTypeFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const [selectedGuest, setSelectedGuest] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [newGuestOpen, setNewGuestOpen] = useState(false);

  const fetchGuests = async () => {
    if (!eventId) return;
    setLoading(true);
    try {
      const params = {
        eventId,
        page: page + 1,
        limit: rowsPerPage,
        search: search.trim() || undefined,
        status: statusFilter || undefined,
        guestType: guestTypeFilter || undefined
      };

      const res = await api.get('/guests', { params });
      setGuests(res.data.guests || []);
      setTotalCount(res.data.totalCount || 0);
    } catch (err) {
      console.error('Erreur fetchGuests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests();
  }, [eventId, page, rowsPerPage, statusFilter, guestTypeFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0);
      fetchGuests();
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  const handleOpenDetail = (guest) => {
    setSelectedGuest(guest);
    setDetailOpen(true);
  };

  const handleCheckIn = async (guest) => {
    try {
      await api.post('/attendances/check-in', {
        eventId,
        guestId: guest.id,
        workstation
      });
      fetchGuests();
      setDetailOpen(false);
    } catch (err) {
      alert(err.response?.data?.error || 'Erreur lors de l\'émargement');
    }
  };

  const handleCancelCheckIn = async (guest) => {
    try {
      await api.post('/attendances/cancel', {
        eventId,
        guestId: guest.id
      });
      fetchGuests();
      setDetailOpen(false);
    } catch (err) {
      alert(err.response?.data?.error || 'Erreur lors de l\'annulation');
    }
  };

  const handlePrintBadge = async (guest) => {
    try {
      await api.post('/badges/print', {
        eventId,
        guestId: guest.id,
        printerName
      });
      window.open(`/badge/${guest.refId}?autoPrint=true`, '_blank', 'width=450,height=600');
    } catch (err) {
      console.error('Erreur impression:', err);
    }
  };

  const handleExportExcel = () => {
    if (!eventId) return;
    const token = localStorage.getItem('token');
    window.open(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/stats/export-excel/${eventId}?token=${token}`, '_blank');
  };

  return (
    <AppLayout>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>
            Répertoire des Invités
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            Consultez, filtrez et gérez l'ensemble des {totalCount} invités de l'événement
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            onClick={handleExportExcel}
            startIcon={<Download size={18} />}
            sx={{ borderColor: '#cbd5e1', color: '#334155', fontWeight: 600 }}
          >
            Exporter Excel
          </Button>

          <Button
            variant="contained"
            onClick={() => setNewGuestOpen(true)}
            startIcon={<Plus size={18} />}
            sx={{ fontWeight: 700 }}
          >
            Ajouter un Invité
          </Button>
        </Box>
      </Box>

      {/* Filter Bar */}
      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent sx={{ p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                placeholder="Rechercher par nom, prénom, NIN, RC, banque..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={18} color="#94a3b8" />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>

            <Grid item xs={6} md={3.5}>
              <FormControl fullWidth size="small">
                <InputLabel>Statut Présence</InputLabel>
                <Select
                  value={statusFilter}
                  label="Statut Présence"
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(0);
                  }}
                >
                  <MenuItem value="">Tous les statuts</MenuItem>
                  <MenuItem value="PRESENT">Présents uniquement</MenuItem>
                  <MenuItem value="ABSENT">Absents uniquement</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={6} md={3.5}>
              <FormControl fullWidth size="small">
                <InputLabel>Catégorie Invité</InputLabel>
                <Select
                  value={guestTypeFilter}
                  label="Catégorie Invité"
                  onChange={(e) => {
                    setGuestTypeFilter(e.target.value);
                    setPage(0);
                  }}
                >
                  <MenuItem value="">Toutes les catégories</MenuItem>
                  <MenuItem value="REGISTERED">Actionnaire (CSV)</MenuItem>
                  <MenuItem value="WALK_IN">Walk-in (Sur place)</MenuItem>
                  <MenuItem value="VIP">VIP</MenuItem>
                  <MenuItem value="ORGANIZATION">Personne Morale</MenuItem>
                  <MenuItem value="PRESS">Presse</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Guests Table */}
      <Card sx={{ borderRadius: 3.5, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Réf ID</TableCell>
                <TableCell>Nom / Raison Sociale</TableCell>
                <TableCell>Actions</TableCell>
                <TableCell>Banque</TableCell>
                <TableCell>Wilaya</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <CircularProgress sx={{ color: '#722083' }} />
                  </TableCell>
                </TableRow>
              ) : guests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6, color: '#94a3b8' }}>
                    Aucun invité trouvé avec ces filtres.
                  </TableCell>
                </TableRow>
              ) : (
                guests.map((g) => {
                  const isPresent = !!g.attendance;

                  return (
                    <TableRow key={g.id} hover>
                      <TableCell>
                        <Chip
                          label={g.refId}
                          size="small"
                          sx={{ fontWeight: 700, bgcolor: '#f8fafc', color: '#722083', border: '1px solid #e2e8f0' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                          {g.lastNameOrCompany} {g.firstName || ''}
                        </Typography>
                        {g.nationalIdentificationNumber && (
                          <Typography variant="caption" sx={{ color: '#64748b' }}>
                            NIN: {g.nationalIdentificationNumber}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155' }}>
                          {g.numberOfShares?.toLocaleString('fr-FR') || '0'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.85rem' }}>
                          {g.bank || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.85rem' }}>
                          {g.wilaya || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={isPresent ? 'PRÉSENT' : 'ABSENT'}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            fontSize: '0.7rem',
                            bgcolor: isPresent ? 'rgba(16, 185, 129, 0.15)' : '#f1f5f9',
                            color: isPresent ? '#059669' : '#64748b'
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                          <IconButton size="small" onClick={() => handleOpenDetail(g)} title="Voir la fiche">
                            <Eye size={18} color="#722083" />
                          </IconButton>
                          <IconButton size="small" onClick={() => handlePrintBadge(g)} title="Imprimer le badge">
                            <Printer size={18} color="#64748b" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="Lignes par page"
          sx={{ borderTop: '1px solid #f1f5f9' }}
        />
      </Card>

      {/* Guest Detail Modal */}
      <GuestDetailModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        guest={selectedGuest}
        onCheckIn={handleCheckIn}
        onCancelCheckIn={handleCancelCheckIn}
        onPrintBadge={handlePrintBadge}
      />

      {/* New Guest Modal */}
      <NewGuestModal
        open={newGuestOpen}
        onClose={() => setNewGuestOpen(false)}
        onSubmit={async (data) => {
          try {
            await api.post('/guests', { ...data, eventId, workstation });
            setNewGuestOpen(false);
            fetchGuests();
          } catch (err) {
            alert(err.response?.data?.error || 'Erreur lors de l\'ajout de l\'invité (doublon détecté).');
          }
        }}
      />
    </AppLayout>
  );
}
