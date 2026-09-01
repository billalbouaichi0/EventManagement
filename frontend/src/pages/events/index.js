import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
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
  Avatar
} from '@mui/material';
import {
  Calendar,
  Plus,
  MapPin,
  Clock,
  Users,
  UserCheck,
  Building,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import AppLayout from '../../components/layout/AppLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function EventsPage() {
  const router = useRouter();
  const { user, isAdmin, setSelectedEvent, selectedEvent } = useAuth();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    eventDate: new Date().toISOString().split('T')[0],
    startTime: '08:30',
    endTime: '18:00',
    location: '',
    address: '',
    wilaya: 'Alger',
    organizer: '',
    status: 'EN_COURS'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events');
      setEvents(res.data.events || []);
    } catch (err) {
      console.error('Erreur chargement événements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.post('/events', formData);
      setCreateOpen(false);
      fetchEvents();
      setSelectedEvent(res.data.event);
    } catch (err) {
      console.error('Erreur création événement:', err);
      alert(err.response?.data?.error || 'Erreur lors de la création');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectEvent = (evt) => {
    setSelectedEvent(evt);
    router.push(`/events/${evt.id}/check-in`);
  };

  return (
    <AppLayout>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>
            Gestion des Événements
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            Consultez, configurez et basculez entre vos sessions d'accueil
          </Typography>
        </Box>

        {isAdmin && (
          <Button
            variant="contained"
            onClick={() => setCreateOpen(true)}
            startIcon={<Plus size={18} />}
            sx={{ px: 2.5, fontWeight: 700 }}
          >
            Nouvel Événement
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        {events.map((evt) => {
          const isCurrent = selectedEvent?.id === evt.id;

          return (
            <Grid item xs={12} md={6} lg={4} key={evt.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderRadius: 3.5,
                  border: isCurrent ? '2px solid #722083' : '1px solid #e2e8f0',
                  boxShadow: isCurrent ? '0 10px 25px -5px rgba(114, 32, 131, 0.15)' : 'none',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 12px 24px -5px rgba(15, 23, 42, 0.08)'
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Chip
                      label={evt.status}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.72rem',
                        bgcolor: evt.status === 'EN_COURS' ? 'rgba(16, 185, 129, 0.1)' : '#f1f5f9',
                        color: evt.status === 'EN_COURS' ? '#059669' : '#475569'
                      }}
                    />
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#722083' }}>
                      {evt.refId}
                    </Typography>
                  </Box>

                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 1, lineHeight: 1.3 }}>
                    {evt.name}
                  </Typography>

                  {evt.organizer && (
                    <Typography variant="caption" sx={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 0.8, mb: 2, fontWeight: 600 }}>
                      <Building size={14} color="#94a3b8" />
                      {evt.organizer}
                    </Typography>
                  )}

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#475569', fontSize: '0.85rem' }}>
                      <Calendar size={15} color="#722083" />
                      <span>{new Date(evt.eventDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#475569', fontSize: '0.85rem' }}>
                      <Clock size={15} color="#722083" />
                      <span>{evt.startTime || '08:30'} — {evt.endTime || '18:00'}</span>
                    </Box>
                    {evt.location && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#475569', fontSize: '0.85rem' }}>
                        <MapPin size={15} color="#722083" />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{evt.location}</span>
                      </Box>
                    )}
                  </Box>

                  {/* Counters */}
                  <Box sx={{ display: 'flex', gap: 2, p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #f1f5f9' }}>
                    <Box sx={{ flex: 1, textAlign: 'center' }}>
                      <Typography variant="caption" sx={{ color: '#64748b', display: 'block', fontSize: '0.7rem', fontWeight: 600 }}>Invités</Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>{evt.totalGuests || 0}</Typography>
                    </Box>
                    <Box sx={{ width: '1px', bgcolor: '#e2e8f0' }} />
                    <Box sx={{ flex: 1, textAlign: 'center' }}>
                      <Typography variant="caption" sx={{ color: '#10b981', display: 'block', fontSize: '0.7rem', fontWeight: 600 }}>Présents</Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#10b981' }}>{evt.presentCount || 0}</Typography>
                    </Box>
                    <Box sx={{ width: '1px', bgcolor: '#e2e8f0' }} />
                    <Box sx={{ flex: 1, textAlign: 'center' }}>
                      <Typography variant="caption" sx={{ color: '#722083', display: 'block', fontSize: '0.7rem', fontWeight: 600 }}>Taux</Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#722083' }}>{evt.presenceRate || 0}%</Typography>
                    </Box>
                  </Box>
                </CardContent>

                <Box sx={{ p: 2, pt: 0 }}>
                  <Button
                    fullWidth
                    variant={isCurrent ? 'contained' : 'outlined'}
                    onClick={() => handleSelectEvent(evt)}
                    endIcon={<ArrowRight size={16} />}
                    sx={{
                      py: 1,
                      fontWeight: 700,
                      borderColor: '#cbd5e1'
                    }}
                  >
                    {isCurrent ? 'Accéder au Guichet (Actif)' : 'Sélectionner cet événement'}
                  </Button>
                </Box>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Modal Création Événement */}
      <Dialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Créer un Nouvel Événement</DialogTitle>
        <form onSubmit={handleCreate}>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Nom de l'événement *"
                required
                fullWidth
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="ex: Assemblée Générale Ordinaire 2026"
              />

              <TextField
                label="Description"
                multiline
                rows={2}
                fullWidth
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Date de l'événement *"
                    type="date"
                    required
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    value={formData.eventDate}
                    onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    label="Début"
                    fullWidth
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    label="Fin"
                    fullWidth
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Lieu / Salle"
                    fullWidth
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="ex: Palais des Congrès, Salle A"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Wilaya"
                    fullWidth
                    value={formData.wilaya}
                    onChange={(e) => setFormData({ ...formData, wilaya: e.target.value })}
                  />
                </Grid>
              </Grid>

              <TextField
                label="Organisateur"
                fullWidth
                value={formData.organizer}
                onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                placeholder="ex: Ministère de l'Industrie / Groupe Sonatrach"
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setCreateOpen(false)} sx={{ color: '#64748b' }}>Annuler</Button>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              Créer l'Événement
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </AppLayout>
  );
}
