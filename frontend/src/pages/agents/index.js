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
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Avatar,
  CircularProgress
} from '@mui/material';
import {
  ShieldCheck,
  UserPlus,
  UserCheck,
  UserX,
  Trash2,
  Calendar,
  Lock,
  Mail,
  User
} from 'lucide-react';
import AppLayout from '../../components/layout/AppLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function AgentsManagementPage() {
  const { user, isAdmin } = useAuth();

  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    role: 'AGENT'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/auth/agents');
      setAgents(res.data.agents || []);
    } catch (err) {
      console.error('Erreur chargement agents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleCreateAgent = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/auth/agents', formData);
      setCreateOpen(false);
      setFormData({ fullName: '', username: '', email: '', password: '', role: 'AGENT' });
      fetchAgents();
    } catch (err) {
      alert(err.response?.data?.error || 'Erreur lors de la création du compte');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (agent) => {
    const newStatus = agent.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await api.put(`/auth/agents/${agent.id}`, { status: newStatus });
      fetchAgents();
    } catch (err) {
      alert('Erreur lors du changement de statut');
    }
  };

  const handleDeleteAgent = async (agent) => {
    if (!window.confirm(`Confirmez-vous la suppression du compte ${agent.fullName} ?`)) {
      return;
    }
    try {
      await api.delete(`/auth/agents/${agent.id}`);
      fetchAgents();
    } catch (err) {
      alert(err.response?.data?.error || 'Erreur lors de la suppression');
    }
  };

  return (
    <AppLayout>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>
            Gestion des Comptes & Agents d'Accueil
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            Créez et configurez les accès des hôtesses et superviseurs pour les guichets d'accueil
          </Typography>
        </Box>

        <Button
          variant="contained"
          onClick={() => setCreateOpen(true)}
          startIcon={<UserPlus size={18} />}
          sx={{ fontWeight: 700 }}
        >
          Créer un Utilisateur
        </Button>
      </Box>

      {/* Agents Table */}
      <Card sx={{ borderRadius: 3.5, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Utilisateur</TableCell>
                <TableCell>Identifiant</TableCell>
                <TableCell>Rôle</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Événements Assignés</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <CircularProgress sx={{ color: '#722083' }} />
                  </TableCell>
                </TableRow>
              ) : (
                agents.map((ag) => (
                  <TableRow key={ag.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ bgcolor: '#722083', width: 34, height: 34, fontSize: '0.85rem', fontWeight: 700 }}>
                          {ag.fullName?.charAt(0) || 'U'}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                            {ag.fullName}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748b' }}>
                            {ag.email || 'Pas d\'email'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>
                        @{ag.username}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={ag.role}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.7rem',
                          bgcolor: ag.role === 'ADMIN' ? '#e0f2fe' : '#f1f5f9',
                          color: ag.role === 'ADMIN' ? '#0369a1' : '#475569'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={ag.status === 'ACTIVE' ? 'ACTIF' : 'INACTIF'}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.7rem',
                          bgcolor: ag.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.15)' : '#fee2e2',
                          color: ag.status === 'ACTIVE' ? '#059669' : '#dc2626'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {ag.assignedEvents && ag.assignedEvents.length > 0 ? (
                          ag.assignedEvents.map((evt) => (
                            <Chip key={evt.id} label={evt.name} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                          ))
                        ) : (
                          <Typography variant="caption" sx={{ color: '#94a3b8' }}>Tous les événements</Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleToggleStatus(ag)}
                          sx={{ fontSize: '0.75rem', py: 0.2, px: 1 }}
                        >
                          {ag.status === 'ACTIVE' ? 'Désactiver' : 'Activer'}
                        </Button>
                        {ag.id !== user?.id && (
                          <IconButton size="small" color="error" onClick={() => handleDeleteAgent(ag)}>
                            <Trash2 size={16} />
                          </IconButton>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Modal Création Agent */}
      <Dialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Ajouter un Agent / Superviseur</DialogTitle>
        <form onSubmit={handleCreateAgent}>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Nom complet de l'agent *"
                required
                fullWidth
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="ex: Amina Mansouri"
              />

              <TextField
                label="Nom d'utilisateur (Identifiant) *"
                required
                fullWidth
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="ex: amina.mansouri"
              />

              <TextField
                label="Adresse Email"
                type="email"
                fullWidth
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />

              <TextField
                label="Mot de passe temporaire *"
                type="password"
                required
                fullWidth
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />

              <FormControl fullWidth size="small">
                <InputLabel>Rôle & Droits d'accès</InputLabel>
                <Select
                  value={formData.role}
                  label="Rôle & Droits d'accès"
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <MenuItem value="AGENT">Agent d'accueil (Émargement, Impression)</MenuItem>
                  <MenuItem value="ADMIN">Administrateur (Gestion complète, Import CSV, Exports)</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setCreateOpen(false)} sx={{ color: '#64748b' }}>Annuler</Button>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              Créer le Compte
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </AppLayout>
  );
}
