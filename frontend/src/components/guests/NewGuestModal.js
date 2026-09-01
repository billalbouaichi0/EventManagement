import React, { useState } from 'react';
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
  FormControlLabel,
  Checkbox,
  Box,
  Typography,
  Divider,
  Alert
} from '@mui/material';
import { UserPlus, Sparkles, Printer, UserCheck } from 'lucide-react';

export default function NewGuestModal({ open, onClose, onSubmit, isSubmitting = false }) {
  const [formData, setFormData] = useState({
    lastNameOrCompany: '',
    firstName: '',
    guestType: 'WALK_IN',
    numberOfShares: 0,
    nationalIdentificationNumber: '',
    registrationNumber: '',
    registrationIssueDate: '',
    taxIdentificationNumber: '',
    bank: '',
    wilaya: 'Alger',
    address: '',
    birthDate: '',
    autoCheckIn: true,
    autoPrintBadge: true
  });

  const [error, setError] = useState('');

  const handleChange = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.lastNameOrCompany.trim()) {
      setError('Le Nom ou la Raison sociale est obligatoire.');
      return;
    }
    setError('');
    onSubmit(formData);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ fontWeight: 800, pb: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ bgcolor: 'rgba(114, 32, 131, 0.1)', p: 1, borderRadius: 2, display: 'flex' }}>
          <UserPlus size={22} color="#722083" />
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
            Ajouter un Invité Non Répertorié
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b' }}>
            Enregistrement express sur place avec émargement immédiat
          </Typography>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Nom ou Raison Sociale *"
                required
                fullWidth
                value={formData.lastNameOrCompany}
                onChange={handleChange('lastNameOrCompany')}
                placeholder="ex: SPA SIDER ou BENALI"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Prénom (si personne physique)"
                fullWidth
                value={formData.firstName}
                onChange={handleChange('firstName')}
                placeholder="ex: Mohamed"
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
                  <MenuItem value="WALK_IN">Invité sur place (Walk-in)</MenuItem>
                  <MenuItem value="VIP">Personnalité VIP</MenuItem>
                  <MenuItem value="ORGANIZATION">Personne Morale / Entreprise</MenuItem>
                  <MenuItem value="PRESS">Presse & Médias</MenuItem>
                  <MenuItem value="REGISTERED">Actionnaire</MenuItem>
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
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                label="Date de naissance"
                placeholder="JJ/MM/AAAA"
                fullWidth
                value={formData.birthDate}
                onChange={handleChange('birthDate')}
              />
            </Grid>

            {/* Identifiants légaux */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Numéro d'Identification National (NIN)"
                fullWidth
                value={formData.nationalIdentificationNumber}
                onChange={handleChange('nationalIdentificationNumber')}
                placeholder="18 ou 20 chiffres"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="N° Registre du Commerce (RC) / Agrément"
                fullWidth
                value={formData.registrationNumber}
                onChange={handleChange('registrationNumber')}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Numéro d'Identification Fiscale (NIF)"
                fullWidth
                value={formData.taxIdentificationNumber}
                onChange={handleChange('taxIdentificationNumber')}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Banque / Établissement financier"
                fullWidth
                value={formData.bank}
                onChange={handleChange('bank')}
                placeholder="ex: BNA, BEA, CPA, BDL..."
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Wilaya"
                fullWidth
                value={formData.wilaya}
                onChange={handleChange('wilaya')}
                placeholder="ex: Alger, Oran, Constantine..."
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Adresse"
                fullWidth
                value={formData.address}
                onChange={handleChange('address')}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 2.5 }} />

          {/* Quick Actions Checkboxes */}
          <Box sx={{ bgcolor: '#f8fafc', p: 2, borderRadius: 2, border: '1px solid #e2e8f0' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a', mb: 1 }}>
              Actions immédiates à la création :
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.autoCheckIn}
                    onChange={handleChange('autoCheckIn')}
                    color="primary"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                    <UserCheck size={16} color="#10b981" />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Émarger immédiatement comme Présent
                    </Typography>
                  </Box>
                }
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.autoPrintBadge}
                    onChange={handleChange('autoPrintBadge')}
                    color="primary"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                    <Printer size={16} color="#722083" />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Lancer l'impression du badge
                    </Typography>
                  </Box>
                }
              />
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
          <Button onClick={onClose} sx={{ color: '#64748b' }}>
            Annuler
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            startIcon={<UserPlus size={18} />}
            sx={{ px: 3 }}
          >
            Enregistrer l'Invité
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
