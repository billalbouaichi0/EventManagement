import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Divider,
  Alert,
  Avatar
} from '@mui/material';
import { Edit, ShieldCheck, FileText, Building, Award, CheckCircle } from 'lucide-react';
import api from '../../services/api';

export default function EditGuestModal({ open, onClose, guest, onSaved }) {
  const [formData, setFormData] = useState({
    lastNameOrCompany: '',
    firstName: '',
    guestType: 'REGISTERED',
    numberOfShares: 0,
    nationalIdentificationNumber: '',
    registrationNumber: '',
    registrationIssueDate: '',
    taxIdentificationNumber: '',
    bank: '',
    wilaya: '',
    address: '',
    birthDate: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (guest && open) {
      setFormData({
        lastNameOrCompany: guest.lastNameOrCompany || '',
        firstName: guest.firstName || '',
        guestType: guest.guestType || 'REGISTERED',
        numberOfShares: guest.numberOfShares || 0,
        nationalIdentificationNumber: guest.nationalIdentificationNumber || '',
        registrationNumber: guest.registrationNumber || '',
        registrationIssueDate: guest.registrationIssueDate || '',
        taxIdentificationNumber: guest.taxIdentificationNumber || '',
        bank: guest.bank || '',
        wilaya: guest.wilaya || '',
        address: guest.address || '',
        birthDate: guest.birthDate || ''
      });
      setError('');
    }
  }, [guest, open]);

  if (!guest) return null;

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.lastNameOrCompany.trim()) {
      setError('Le Nom ou la Raison Sociale est obligatoire.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await api.put(`/guests/${guest.id}`, {
        ...formData,
        numberOfShares: parseInt(formData.numberOfShares, 10) || 0
      });
      if (onSaved) {
        onSaved(res.data.guest);
      }
      onClose();
    } catch (err) {
      console.error('Erreur modification invité:', err);
      setError(err.response?.data?.error || 'Erreur lors de la mise à jour des informations.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
    >
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
              width: 44,
              height: 44,
              borderRadius: 2.5,
              fontWeight: 800
            }}
          >
            <Edit size={22} color="#ffffff" />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
              Modifier les Informations de l'Invité
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b' }}>
              Réf: <strong style={{ color: '#722083' }}>{guest.refId}</strong> • {guest.lastNameOrCompany} {guest.firstName || ''}
            </Typography>
          </Box>
        </Box>
      </Box>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ p: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {/* Section 1: Identifiants Réglementaires & Fiscaux (NIN, RC, NIF) */}
          <Box sx={{ mb: 3, p: 2, bgcolor: '#f8fafc', borderRadius: 2.5, border: '1px solid #e2e8f0' }}>
            <Typography
              variant="subtitle2"
              sx={{ color: '#722083', fontWeight: 800, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <ShieldCheck size={18} color="#722083" />
              Identifiants Légaux & Fiscaux (NIN, RC, NIF) :
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Numéro d'Identification National (NIN)"
                  fullWidth
                  value={formData.nationalIdentificationNumber}
                  onChange={handleChange('nationalIdentificationNumber')}
                  placeholder="Numéro à 18 chiffres"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#ffffff' } }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Numéro Registre du Commerce (RC) / N° Agrément"
                  fullWidth
                  value={formData.registrationNumber}
                  onChange={handleChange('registrationNumber')}
                  placeholder="ex: 16/00-1234567B19"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#ffffff' } }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Numéro d'Identification Fiscale (NIF)"
                  fullWidth
                  value={formData.taxIdentificationNumber}
                  onChange={handleChange('taxIdentificationNumber')}
                  placeholder="Numéro NIF à 15 chiffres"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#ffffff' } }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Date de délivrance RC"
                  fullWidth
                  value={formData.registrationIssueDate}
                  onChange={handleChange('registrationIssueDate')}
                  placeholder="JJ/MM/AAAA"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#ffffff' } }}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Section 2: Identité / Entreprise */}
          <Typography
            variant="subtitle2"
            sx={{ color: '#0f172a', fontWeight: 800, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <FileText size={18} color="#722083" />
            Identité / Raison Sociale :
          </Typography>

          <Grid container spacing={2} sx={{ mb: 2.5 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Nom ou Raison Sociale *"
                required
                fullWidth
                value={formData.lastNameOrCompany}
                onChange={handleChange('lastNameOrCompany')}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Prénom (si personne physique)"
                fullWidth
                value={formData.firstName}
                onChange={handleChange('firstName')}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Type d'invité</InputLabel>
                <Select
                  value={formData.guestType}
                  label="Type d'invité"
                  onChange={handleChange('guestType')}
                >
                  <MenuItem value="REGISTERED">Actionnaire (CSV)</MenuItem>
                  <MenuItem value="WALK_IN">Invité sur place (Walk-in)</MenuItem>
                  <MenuItem value="VIP">Personnalité VIP</MenuItem>
                  <MenuItem value="ORGANIZATION">Personne Morale / Entreprise</MenuItem>
                  <MenuItem value="PRESS">Presse & Médias</MenuItem>
                  <MenuItem value="OTHER">Autre</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                label="Nombre d'actions"
                type="number"
                fullWidth
                value={formData.numberOfShares}
                onChange={handleChange('numberOfShares')}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                label="Date de naissance"
                fullWidth
                value={formData.birthDate}
                onChange={handleChange('birthDate')}
                placeholder="JJ/MM/AAAA"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
          </Grid>

          {/* Section 3: Banque et Coordonnées */}
          <Typography
            variant="subtitle2"
            sx={{ color: '#0f172a', fontWeight: 800, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <Building size={18} color="#722083" />
            Banque & Coordonnées :
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Banque / Établissement financier"
                fullWidth
                value={formData.bank}
                onChange={handleChange('bank')}
                placeholder="ex: BNA, BEA, CPA, BDL..."
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Wilaya"
                fullWidth
                value={formData.wilaya}
                onChange={handleChange('wilaya')}
                placeholder="ex: Alger, Oran..."
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Adresse"
                fullWidth
                value={formData.address}
                onChange={handleChange('address')}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0', justifyContent: 'space-between' }}>
          <Button onClick={onClose} sx={{ color: '#64748b', fontWeight: 600 }}>
            Annuler
          </Button>

          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={<CheckCircle size={18} />}
            sx={{
              bgcolor: '#722083',
              color: '#ffffff',
              fontWeight: 800,
              px: 3,
              '&:hover': { bgcolor: '#5a1967' }
            }}
          >
            {loading ? 'Enregistrement...' : 'Enregistrer les Modifications'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
