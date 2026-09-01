import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Chip,
  Divider,
  Avatar,
  IconButton
} from '@mui/material';
import {
  UserCheck,
  Printer,
  X,
  Building,
  CreditCard,
  MapPin,
  FileText,
  Calendar,
  Layers,
  Award
} from 'lucide-react';

export default function GuestDetailModal({
  open,
  onClose,
  guest,
  onCheckIn,
  onCancelCheckIn,
  onPrintBadge,
  isCheckingIn = false,
  isPrinting = false
}) {
  if (!guest) return null;

  const isPresent = !!guest.attendance;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, overflow: 'hidden' }
      }}
    >
      {/* Header Banner */}
      <Box
        sx={{
          bgcolor: isPresent ? '#ecfdf5' : '#f0f9ff',
          p: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          borderBottom: isPresent ? '1px solid #a7f3d0' : '1px solid #bae6fd'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{
              bgcolor: isPresent ? '#10b981' : '#722083',
              width: 56,
              height: 56,
              borderRadius: 2.5,
              fontSize: '1.25rem',
              fontWeight: 700,
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
            }}
          >
            {guest.lastNameOrCompany?.charAt(0) || 'I'}
          </Avatar>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>
                {guest.lastNameOrCompany} {guest.firstName || ''}
              </Typography>
              <Chip
                label={guest.refId}
                size="small"
                sx={{ bgcolor: '#ffffff', fontWeight: 700, color: '#722083', border: '1px solid #cbd5e1' }}
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              <Chip
                label={isPresent ? 'PRÉSENT / ÉMARGÉ' : 'ABSENT'}
                size="small"
                color={isPresent ? 'success' : 'default'}
                sx={{ fontWeight: 700, px: 0.5 }}
              />
              <Chip
                label={`Catégorie: ${guest.guestType || 'STANDARD'}`}
                size="small"
                variant="outlined"
                sx={{ fontWeight: 600, borderColor: '#cbd5e1' }}
              />
              <Chip
                label={`Source: ${guest.source || 'CSV'}`}
                size="small"
                variant="outlined"
                sx={{ fontWeight: 600, borderColor: '#cbd5e1' }}
              />
            </Box>
          </Box>
        </Box>

        <IconButton onClick={onClose} size="small" sx={{ color: '#64748b' }}>
          <X size={20} />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        {/* Presence Details if Present */}
        {isPresent && (
          <Box sx={{ mb: 3, p: 2, bgcolor: '#f0fdf4', borderRadius: 2, border: '1px solid #bbf7d0' }}>
            <Typography variant="subtitle2" sx={{ color: '#166534', fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <UserCheck size={18} color="#166534" />
              Détails de l'émargement enregistré
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Typography variant="caption" sx={{ color: '#15803d', display: 'block' }}>Heure d'arrivée</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#14532d' }}>
                  {new Date(guest.attendance.checkedInAt).toLocaleString('fr-FR')}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="caption" sx={{ color: '#15803d', display: 'block' }}>Agent d'accueil</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#14532d' }}>
                  {guest.attendance.agent?.fullName || 'Agent'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="caption" sx={{ color: '#15803d', display: 'block' }}>Guichet / Poste</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#14532d' }}>
                  {guest.attendance.workstation || 'Poste Standard'}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Guest Full Information Grid */}
        <Typography variant="subtitle2" sx={{ color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 2, fontWeight: 700, fontSize: '0.75rem' }}>
          Fiche d'identification complète
        </Typography>

        <Grid container spacing={2.5}>
          {/* Identity & Shares */}
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
              <Award size={18} color="#722083" style={{ marginTop: 2 }} />
              <Box>
                <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>Nombre d'actions</Typography>
                <Typography variant="body1" sx={{ fontWeight: 700, color: '#0f172a' }}>
                  {guest.numberOfShares?.toLocaleString('fr-FR') || '0'}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
              <Calendar size={18} color="#722083" style={{ marginTop: 2 }} />
              <Box>
                <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>Date de naissance</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: '#0f172a' }}>
                  {guest.birthDate || '-'}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
              <CreditCard size={18} color="#722083" style={{ marginTop: 2 }} />
              <Box>
                <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>NIN (Identité Nationale)</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: '#0f172a' }}>
                  {guest.nationalIdentificationNumber || '-'}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Legal / Company details */}
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
              <Building size={18} color="#722083" style={{ marginTop: 2 }} />
              <Box>
                <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>RC / N° Agrément</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: '#0f172a' }}>
                  {guest.registrationNumber || '-'}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
              <Calendar size={18} color="#722083" style={{ marginTop: 2 }} />
              <Box>
                <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>Date délivrance RC</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: '#0f172a' }}>
                  {guest.registrationIssueDate || '-'}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
              <FileText size={18} color="#722083" style={{ marginTop: 2 }} />
              <Box>
                <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>NIF (Fiscal)</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: '#0f172a' }}>
                  {guest.taxIdentificationNumber || '-'}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Location & Bank */}
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
              <Building size={18} color="#722083" style={{ marginTop: 2 }} />
              <Box>
                <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>Banque</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: '#0f172a' }}>
                  {guest.bank || '-'}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
              <MapPin size={18} color="#722083" style={{ marginTop: 2 }} />
              <Box>
                <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>Wilaya</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: '#0f172a' }}>
                  {guest.wilaya || '-'}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
              <MapPin size={18} color="#722083" style={{ marginTop: 2 }} />
              <Box>
                <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>Adresse</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: '#0f172a' }}>
                  {guest.address || '-'}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Badge Prints History */}
        {guest.badgePrints && guest.badgePrints.length > 0 && (
          <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #f1f5f9' }}>
            <Typography variant="caption" sx={{ color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1, display: 'block', fontWeight: 700 }}>
              Historique des impressions ({guest.badgePrints.length})
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {guest.badgePrints.map((bp, i) => (
                <Chip
                  key={bp.id || i}
                  icon={<Printer size={13} />}
                  label={`Imprimé le ${new Date(bp.printedAt).toLocaleTimeString('fr-FR')} (${bp.agent?.fullName || 'Agent'})`}
                  size="small"
                  sx={{ bgcolor: '#f8fafc', fontSize: '0.75rem', borderColor: '#e2e8f0' }}
                  variant="outlined"
                />
              ))}
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2.5, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0', justifyContent: 'space-between' }}>
        <Box>
          {isPresent && onCancelCheckIn && (
            <Button
              color="error"
              size="small"
              onClick={() => onCancelCheckIn(guest)}
              sx={{ fontWeight: 600 }}
            >
              Annuler l'émargement
            </Button>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            onClick={() => onPrintBadge(guest)}
            disabled={isPrinting}
            startIcon={<Printer size={18} />}
            sx={{ borderColor: '#722083', color: '#722083' }}
          >
            {isPresent ? 'Réimprimer Badge' : 'Imprimer Badge'}
          </Button>

          {!isPresent && (
            <Button
              variant="contained"
              onClick={() => onCheckIn(guest)}
              disabled={isCheckingIn}
              startIcon={<UserCheck size={18} />}
              sx={{ px: 3 }}
            >
              Valider Présence
            </Button>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
}
