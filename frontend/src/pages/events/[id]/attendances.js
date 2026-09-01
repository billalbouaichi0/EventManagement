import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Chip,
  Button,
  Avatar,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  ClipboardList,
  UserCheck,
  Printer,
  XCircle,
  Radio,
  Clock,
  Download
} from 'lucide-react';
import AppLayout from '../../../components/layout/AppLayout';
import { useAuth } from '../../../context/AuthContext';
import { socket } from '../../../services/socket';
import api from '../../../services/api';

export default function AttendancesPage() {
  const router = useRouter();
  const { id: eventId } = router.query;
  const { user } = useAuth();

  const [attendances, setAttendances] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [loading, setLoading] = useState(true);

  const fetchAttendances = async () => {
    if (!eventId) return;
    setLoading(true);
    try {
      const res = await api.get('/attendances', {
        params: {
          eventId,
          page: page + 1,
          limit: rowsPerPage
        }
      });
      setAttendances(res.data.attendances || []);
      setTotalCount(res.data.totalCount || 0);
    } catch (err) {
      console.error('Erreur fetchAttendances:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendances();
  }, [eventId, page, rowsPerPage]);

  // Socket.IO real-time listener
  useEffect(() => {
    const handleCheckedIn = (data) => {
      if (data.eventId === parseInt(eventId, 10)) {
        fetchAttendances();
      }
    };

    const handleCancelled = (data) => {
      if (data.eventId === parseInt(eventId, 10)) {
        fetchAttendances();
      }
    };

    socket.on('guest:checked-in', handleCheckedIn);
    socket.on('guest:check-in-cancelled', handleCancelled);

    return () => {
      socket.off('guest:checked-in', handleCheckedIn);
      socket.off('guest:check-in-cancelled', handleCancelled);
    };
  }, [eventId]);

  const handleCancel = async (att) => {
    if (!window.confirm(`Confirmez-vous l'annulation de la présence de ${att.guest?.lastNameOrCompany} ?`)) {
      return;
    }

    try {
      await api.post('/attendances/cancel', {
        eventId,
        guestId: att.guestId
      });
      fetchAttendances();
    } catch (err) {
      alert(err.response?.data?.error || 'Erreur lors de l\'annulation');
    }
  };

  return (
    <AppLayout>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>
              Registre des Présences en Direct
            </Typography>
            <Chip
              icon={<Radio size={14} color="#10b981" />}
              label="Flux Temps Réel"
              size="small"
              sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#059669', fontWeight: 700 }}
            />
          </Box>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
            Historique complet chronologique des émargements avec traçabilité agent et guichet
          </Typography>
        </Box>

        <Chip
          label={`${totalCount} Présences Enregistrées`}
          color="primary"
          sx={{ fontWeight: 800, fontSize: '0.85rem', px: 1 }}
        />
      </Box>

      {/* Attendances Table */}
      <Card sx={{ borderRadius: 3.5, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Heure Émargement</TableCell>
                <TableCell>Réf Invité</TableCell>
                <TableCell>Nom / Raison Sociale</TableCell>
                <TableCell>Actions</TableCell>
                <TableCell>Agent d'accueil</TableCell>
                <TableCell>Guichet / Poste</TableCell>
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
              ) : attendances.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6, color: '#94a3b8' }}>
                    Aucune présence enregistrée pour cet événement.
                  </TableCell>
                </TableRow>
              ) : (
                attendances.map((att) => (
                  <TableRow key={att.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Clock size={15} color="#722083" />
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                          {new Date(att.checkedInAt).toLocaleTimeString('fr-FR')}
                        </Typography>
                      </Box>
                      <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                        {new Date(att.checkedInAt).toLocaleDateString('fr-FR')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={att.guest?.refId || `INV-${att.guestId}`}
                        size="small"
                        sx={{ fontWeight: 700, bgcolor: '#f8fafc', color: '#722083', border: '1px solid #e2e8f0' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                        {att.guest?.lastNameOrCompany} {att.guest?.firstName || ''}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b' }}>
                        {att.guest?.bank || att.guest?.wilaya || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>
                        {att.guest?.numberOfShares?.toLocaleString('fr-FR') || '0'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 24, height: 24, bgcolor: '#722083', fontSize: '0.7rem', fontWeight: 700 }}>
                          {att.agent?.fullName?.charAt(0) || 'A'}
                        </Avatar>
                        <Typography variant="body2" sx={{ fontSize: '0.85rem', fontWeight: 600 }}>
                          {att.agent?.fullName || 'Agent'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={att.workstation || 'Poste Standard'}
                        size="small"
                        sx={{ bgcolor: '#f1f5f9', fontWeight: 600, fontSize: '0.75rem' }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Annuler cet émargement">
                        <IconButton size="small" color="error" onClick={() => handleCancel(att)}>
                          <XCircle size={18} />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
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
    </AppLayout>
  );
}
