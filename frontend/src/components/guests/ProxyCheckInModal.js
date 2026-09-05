import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Box,
  Typography,
  Divider,
  Alert,
  Avatar,
  Chip
} from '@mui/material';
import { Users, UserCheck, ShieldCheck, Printer, Building } from 'lucide-react';

export default function ProxyCheckInModal({
  open,
  onClose,
  guest,
  onSubmit,
  isSubmitting = false
}) {
  const [formData, setFormData] = useState({
    representativeLastName: '',
    representativeFirstName: '',
    representativeNIN: '',
    representativePosition: '',
    representativeNotes: ''
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setFormData({
        representativeLastName: '',
        representativeFirstName: '',
        representativeNIN: '',
        representativePosition: '',
        representativeNotes: ''
      });
      setError('');
    }
  }, [open, guest]);

  if (!guest) return null;

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.representativeLastName.trim()) {
      setError('Le Nom du Mandataire / Représentant est obligatoire.');
      return;
    }
    setError('');
    onSubmit({
      ...formData,
      attendanceType: 'PROXY'
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
    >
      {/* Header Banner */}
      <Box
        sx={{
          bgcolor: 'rgba(114, 32, 131, 0.06)',
          p: 2.5,
          borderBottom: '1px solid rgba(114, 32, 131, 0.15)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{
              bgcolor: '#722083',
              width: 48,
              height: 48,
              borderRadius: 2.5,
              fontWeight: 800
            }}
          >
            <Users size={24} color="#ffffff" />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
              Validation Présence par Mandataire / Représentant
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b' }}>
              Pour le compte de : <strong style={{ color: '#722083' }}>{guest.lastNameOrCompany} {guest.firstName || ''}</strong> ({guest.refId})
            </Typography>
          </Box>
        </Box>

        <Chip
          label="MANDATAIRE"
          size="small"
          sx={{ bgcolor: '#722083', color: '#ffffff', fontWeight: 800 }}
        />
      </Box>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ p: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {/* Principal Info Banner */}
          <Box sx={{ mb: 3, p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
            <Typography variant="caption" sx={{ color: '#64748b', textTransform: 'uppercase', fontWeight: 700, display: 'block', mb: 0.5 }}>
              Titulaire / Actionnaire Représenté
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
                {guest.lastNameOrCompany} {guest.firstName || ''}
              </Typography>
              <Chip label={`Réf: ${guest.refId}`} size="small" variant="outlined" sx={{ fontWeight: 700 }} />
              <Chip label={`${guest.numberOfShares?.toLocaleString('fr-FR') || 0} Actions`} size="small" sx={{ bgcolor: 'rgba(114, 32, 131, 0.1)', color: '#722083', fontWeight: 700 }} />
              {guest.bank && <Chip label={`Banque: ${guest.bank}`} size="small" variant="outlined" />}
            </Box>
          </Box>

          <Typography variant="subtitle2" sx={{ color: '#0f172a', fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <ShieldCheck size={18} color="#722083" />
            Identité du Mandataire / Représentant Présent :
          </Typography>

          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Nom du Mandataire / Représentant *"
                required
                fullWidth
                autoFocus
                value={formData.representativeLastName}
                onChange={handleChange('representativeLastName')}
                placeholder="ex: BENALI ou MEZIANE"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Prénom du Mandataire / Représentant"
                fullWidth
                value={formData.representativeFirstName}
                onChange={handleChange('representativeFirstName')}
                placeholder="ex: Karim"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="NIN du Mandataire (Identité Nationale)"
                fullWidth
                value={formData.representativeNIN}
                onChange={handleChange('representativeNIN')}
                placeholder="Numéro de carte / permis / passeport"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Poste / Fonction / Qualité"
                fullWidth
                value={formData.representativePosition}
                onChange={handleChange('representativePosition')}
                placeholder="ex: PDG, Directeur Général, Avocat, Mandataire Légal..."
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Observations / Autre (Réf. Procuration, Remarques...)"
                fullWidth
                multiline
                rows={2}
                value={formData.representativeNotes}
                onChange={handleChange('representativeNotes')}
                placeholder="ex: Présentation de la procuration notariée N° 124/2026..."
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 2.5, p: 1.5, bgcolor: '#f0fdf4', borderRadius: 2, border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Printer size={18} color="#166534" />
            <Typography variant="caption" sx={{ color: '#166534', fontWeight: 600 }}>
              Le badge imprimé portera la désignation du titulaire principal (<strong>{guest.lastNameOrCompany} {guest.firstName || ''}</strong>).
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0', justifyContent: 'space-between' }}>
          <Button onClick={onClose} sx={{ color: '#64748b', fontWeight: 600 }}>
            Annuler
          </Button>

          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            startIcon={<UserCheck size={18} />}
            sx={{
              bgcolor: '#722083',
              color: '#ffffff',
              fontWeight: 800,
              px: 3,
              py: 1.2,
              '&:hover': { bgcolor: '#5a1967' }
            }}
          >
            Valider la Présence (Mandataire)
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
