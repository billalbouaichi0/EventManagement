import React, { useState, useEffect } from 'react';
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
  CircularProgress
} from '@mui/material';
import { History, Shield, Clock, Monitor } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import api from '../services/api';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(30);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/stats/audit-logs', {
        params: {
          page: page + 1,
          limit: rowsPerPage
        }
      });
      setLogs(res.data.logs || []);
      setTotalCount(res.data.totalCount || 0);
    } catch (err) {
      console.error('Erreur logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, rowsPerPage]);

  return (
    <AppLayout>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>
          Journal d'Audit & Sécurité
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b' }}>
          Traçabilité exhaustive des actions, connexions, émargements et impressions
        </Typography>
      </Box>

      <Card sx={{ borderRadius: 3.5, overflow: 'hidden' }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date & Heure</TableCell>
                <TableCell>Utilisateur</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Ressource</TableCell>
                <TableCell>Détails</TableCell>
                <TableCell>Poste / IP</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <CircularProgress sx={{ color: '#2596be' }} />
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6, color: '#94a3b8' }}>
                    Aucun log d'audit enregistré.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id} hover>
                    <TableCell>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: '#0f172a' }}>
                        {new Date(log.date).toLocaleString('fr-FR')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155' }}>
                        {log.user ? log.user.fullName : 'Système'}
                      </Typography>
                      {log.user && (
                        <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                          @{log.user.username}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={log.action}
                        size="small"
                        sx={{
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          bgcolor: log.action === 'CHECK_IN' ? '#ecfdf5' : log.action === 'PRINT_BADGE' ? '#e0f2fe' : '#f1f5f9',
                          color: log.action === 'CHECK_IN' ? '#059669' : log.action === 'PRINT_BADGE' ? '#0284c7' : '#475569'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: '#475569' }}>
                        {log.resource} #{log.resourceId}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#475569' }}>
                        {log.details}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                        {log.workstation || 'Poste Standard'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.68rem' }}>
                        {log.ipAddress}
                      </Typography>
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
