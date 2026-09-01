import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import confetti from 'canvas-confetti';
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
  Alert,
  Avatar,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  CircularProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Search,
  UserCheck,
  Printer,
  UserPlus,
  AlertTriangle,
  CheckCircle,
  Building,
  CreditCard,
  MapPin,
  Calendar,
  Layers,
  Award,
  Sparkles,
  Command,
  CornerDownLeft,
  X
} from 'lucide-react';
import AppLayout from '../../../components/layout/AppLayout';
import NewGuestModal from '../../../components/guests/NewGuestModal';
import { useAuth } from '../../../context/AuthContext';
import { socket } from '../../../services/socket';
import { playSuccessSound, playWarningSound, playPrintSound } from '../../../components/common/SoundEffects';
import api from '../../../services/api';

export default function CheckInPage() {
  const router = useRouter();
  const { id: eventId } = router.query;
  const { user, workstation, printerName, setSelectedEvent, selectedEvent } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success'|'warning'|'error', message, details }
  const [newGuestOpen, setNewGuestOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const searchInputRef = useRef(null);

  // Load event details if needed
  useEffect(() => {
    if (eventId) {
      api.get(`/events/${eventId}`)
        .then((res) => {
          setSelectedEvent(res.data.event);
        })
        .catch(() => {});
    }
  }, [eventId]);

  // Focus search bar automatically
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // Global Keyboard Shortcuts (CTRL+K, P, I, ESC)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Focus Search: CTRL+K or F2
      if ((e.ctrlKey && e.key === 'k') || e.key === 'F2') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }

      // Check-in shortcut: P (when not typing in an input field)
      if ((e.key === 'p' || e.key === 'P') && document.activeElement !== searchInputRef.current && selectedGuest && !selectedGuest.attendance) {
        e.preventDefault();
        handleCheckIn(selectedGuest);
      }

      // Print shortcut: I (when not typing in an input field)
      if ((e.key === 'i' || e.key === 'I') && document.activeElement !== searchInputRef.current && selectedGuest) {
        e.preventDefault();
        handlePrintBadge(selectedGuest);
      }

      // Clear / Reset: ESC
      if (e.key === 'Escape') {
        setSelectedGuest(null);
        setSearchQuery('');
        setSearchResults([]);
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedGuest]);

  // Instant Search Query Execution
  useEffect(() => {
    if (!eventId || !searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await api.get(`/guests/search?eventId=${eventId}&q=${encodeURIComponent(searchQuery)}`);
        const list = res.data.guests || [];
        setSearchResults(list);
        setSelectedIndex(0);

        // If exact 1 result and perfect match, we can highlight it
        if (list.length === 1) {
          setSelectedGuest(list[0]);
        }
      } catch (err) {
        console.error('Erreur recherche:', err);
      } finally {
        setIsSearching(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [searchQuery, eventId]);

  // Handle Arrow navigation in search results
  const handleSearchKeyDown = (e) => {
    if (searchResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (searchResults[selectedIndex]) {
        setSelectedGuest(searchResults[selectedIndex]);
      }
    }
  };

  // Perform Check-in
  const handleCheckIn = async (guestToProcess) => {
    const guest = guestToProcess || selectedGuest;
    if (!guest || !eventId) return;

    setIsCheckingIn(true);
    try {
      const res = await api.post('/attendances/check-in', {
        eventId,
        guestId: guest.id,
        workstation
      });

      // Update state
      const updatedGuest = { ...guest, attendance: res.data.attendance };
      setSelectedGuest(updatedGuest);

      // Audio & Visual celebratory feedback
      playSuccessSound();
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#722083', '#10b981', '#fbbf24']
      });

      setFeedback({
        type: 'success',
        message: `Présence validée pour ${guest.lastNameOrCompany} ${guest.firstName || ''} !`,
        details: `Enregistré à ${new Date().toLocaleTimeString('fr-FR')} sur ${workstation}`
      });

      // Automatically launch badge print
      handlePrintBadge(updatedGuest);
    } catch (err) {
      console.error('Erreur check-in:', err);
      playWarningSound();

      if (err.response?.status === 409) {
        const data = err.response.data;
        setFeedback({
          type: 'warning',
          message: 'ATTENTION : Cet invité est DÉJÀ ÉMARGÉ !',
          details: `Enregistré à ${new Date(data.checkedInAt).toLocaleTimeString('fr-FR')} par ${data.checkedInBy} (${data.workstation})`
        });
        if (data.attendance) {
          setSelectedGuest({ ...guest, attendance: data.attendance });
        }
      } else {
        setFeedback({
          type: 'error',
          message: err.response?.data?.error || 'Erreur lors de l\'enregistrement de la présence.'
        });
      }
    } finally {
      setIsCheckingIn(false);
    }
  };

  // Launch Badge Print
  const handlePrintBadge = async (guestToPrint) => {
    const guest = guestToPrint || selectedGuest;
    if (!guest) return;

    setIsPrinting(true);
    try {
      playPrintSound();

      // Record print event in database
      await api.post('/badges/print', {
        eventId,
        guestId: guest.id,
        printerName
      });

      // Open print window / popup
      const printUrl = `/badge/${guest.refId}?autoPrint=true`;
      const printWindow = window.open(printUrl, '_blank', 'width=450,height=600');
      if (printWindow) {
        printWindow.focus();
      }
    } catch (err) {
      console.error('Erreur impression badge:', err);
    } finally {
      setIsPrinting(false);
    }
  };

  // Add Walk-in Guest
  const handleCreateWalkIn = async (formData) => {
    try {
      const res = await api.post('/guests', {
        ...formData,
        eventId,
        workstation
      });

      setNewGuestOpen(false);
      const createdGuest = res.data.guest;
      setSelectedGuest(createdGuest);

      playSuccessSound();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.7 }
      });

      setFeedback({
        type: 'success',
        message: `Invité ${createdGuest.lastNameOrCompany} ajouté et émargé avec succès !`,
        details: `RÉF: ${createdGuest.refId}`
      });

      if (formData.autoPrintBadge) {
        handlePrintBadge(createdGuest);
      }
    } catch (err) {
      console.error('Erreur création walk-in:', err);
      playWarningSound();
      const errDetail = err.response?.data?.error || 'Erreur lors de la création de l\'invité (doublon détecté).';
      setFeedback({
        type: 'warning',
        message: 'DOUBLON DÉTECTÉ',
        details: errDetail
      });
      alert(errDetail);
    }
  };

  const isPresent = !!selectedGuest?.attendance;

  return (
    <AppLayout>
      {/* Top Banner / Event Bar */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>
              Guichet d'Émargement Express
            </Typography>
            <Chip
              label={workstation}
              size="small"
              sx={{ bgcolor: 'rgba(114, 32, 131, 0.1)', color: '#722083', fontWeight: 700 }}
            />
          </Box>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
            Recherche universelle multi-critères et validation instantanée en 15 secondes
          </Typography>
        </Box>

        <Button
          variant="contained"
          onClick={() => setNewGuestOpen(true)}
          startIcon={<UserPlus size={18} />}
          sx={{
            bgcolor: '#0f172a',
            fontWeight: 700,
            '&:hover': { bgcolor: '#1e293b' }
          }}
        >
          Ajouter un invité non répertorié
        </Button>
      </Box>

      {/* Main Split Interface */}
      <Grid container spacing={3}>
        {/* Left: Universal Search & Instant Results List */}
        <Grid item xs={12} md={5} lg={4.5}>
          <Card sx={{ borderRadius: 3.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              {/* Search Field */}
              <Box sx={{ mb: 2 }}>
                <TextField
                  inputRef={searchInputRef}
                  fullWidth
                  placeholder="Rechercher par Nom, NIN, RC, NIF, Banque..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        {isSearching ? <CircularProgress size={18} sx={{ color: '#722083' }} /> : <Search size={20} color="#722083" />}
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        {searchQuery ? (
                          <IconButton size="small" onClick={() => setSearchQuery('')}>
                            <X size={16} />
                          </IconButton>
                        ) : (
                          <Chip label="CTRL+K" size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, bgcolor: '#f1f5f9' }} />
                        )}
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2.5,
                      bgcolor: '#f8fafc',
                      fontSize: '0.95rem'
                    }
                  }}
                />
              </Box>

              {/* Search Results List */}
              <Box sx={{ flexGrow: 1, overflowY: 'auto', maxHeight: 'calc(100vh - 340px)' }}>
                {searchResults.length === 0 ? (
                  <Box sx={{ py: 8, textAlign: 'center', color: '#94a3b8' }}>
                    <Search size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {searchQuery ? 'Aucun invité correspondant' : 'Saisissez un nom, un NIN ou une banque pour rechercher'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#cbd5e1', mt: 1, display: 'block' }}>
                      Raccourcis : [Entrée] Sélectionner • [P] Émarger • [I] Imprimer
                    </Typography>
                  </Box>
                ) : (
                  <List disablePadding>
                    {searchResults.map((guest, index) => {
                      const isGuestPresent = !!guest.attendance;
                      const isSelected = selectedGuest?.id === guest.id;

                      return (
                        <ListItem key={guest.id} disablePadding sx={{ mb: 1 }}>
                          <ListItemButton
                            onClick={() => setSelectedGuest(guest)}
                            sx={{
                              borderRadius: 2,
                              p: 1.5,
                              bgcolor: isSelected ? 'rgba(114, 32, 131, 0.08)' : '#ffffff',
                              border: isSelected ? '2px solid #722083' : '1px solid #e2e8f0',
                              '&:hover': {
                                bgcolor: isSelected ? 'rgba(114, 32, 131, 0.12)' : '#f8fafc'
                              }
                            }}
                          >
                            <Avatar
                              sx={{
                                width: 38,
                                height: 38,
                                mr: 1.5,
                                bgcolor: isGuestPresent ? '#10b981' : '#722083',
                                fontSize: '0.85rem',
                                fontWeight: 700
                              }}
                            >
                              {guest.lastNameOrCompany.charAt(0)}
                            </Avatar>

                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                                    {guest.lastNameOrCompany} {guest.firstName || ''}
                                  </Typography>
                                  <Chip
                                    label={isGuestPresent ? 'PRÉSENT' : 'ABSENT'}
                                    size="small"
                                    sx={{
                                      height: 18,
                                      fontSize: '0.62rem',
                                      fontWeight: 700,
                                      bgcolor: isGuestPresent ? 'rgba(16, 185, 129, 0.15)' : '#f1f5f9',
                                      color: isGuestPresent ? '#059669' : '#64748b'
                                    }}
                                  />
                                </Box>
                              }
                              secondary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.3 }}>
                                  <Typography variant="caption" sx={{ color: '#722083', fontWeight: 600 }}>
                                    {guest.refId}
                                  </Typography>
                                  {guest.bank && (
                                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                                      • {guest.bank}
                                    </Typography>
                                  )}
                                </Box>
                              }
                            />
                          </ListItemButton>
                        </ListItem>
                      );
                    })}
                  </List>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Right: Verification & Instant Action Terminal */}
        <Grid item xs={12} md={7} lg={7.5}>
          {feedback && (
            <Alert
              severity={feedback.type}
              onClose={() => setFeedback(null)}
              sx={{
                mb: 2.5,
                borderRadius: 2.5,
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                {feedback.message}
              </Typography>
              {feedback.details && (
                <Typography variant="caption" sx={{ display: 'block', mt: 0.5, opacity: 0.9 }}>
                  {feedback.details}
                </Typography>
              )}
            </Alert>
          )}

          {!selectedGuest ? (
            <Card sx={{ borderRadius: 3.5, p: 6, textAlign: 'center', bgcolor: '#ffffff' }}>
              <Sparkles size={48} color="#722083" style={{ marginBottom: 16, opacity: 0.6 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', mb: 1 }}>
                En attente de sélection d'un invité
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', maxWidth: 460, mx: 'auto' }}>
                Recherchez l'invité par son nom ou son document d'identité pour ouvrir sa fiche de vérification et imprimer son badge.
              </Typography>
            </Card>
          ) : (
            <Card sx={{ borderRadius: 3.5, overflow: 'hidden', border: isPresent ? '2px solid #10b981' : '1px solid #e2e8f0' }}>
              {/* Header Profile Bar */}
              <Box
                sx={{
                  p: 3,
                  bgcolor: isPresent ? '#ecfdf5' : '#f8fafc',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: 2
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar
                    sx={{
                      width: 60,
                      height: 60,
                      bgcolor: isPresent ? '#10b981' : '#722083',
                      fontSize: '1.4rem',
                      fontWeight: 800,
                      borderRadius: 3
                    }}
                  >
                    {selectedGuest.lastNameOrCompany.charAt(0)}
                  </Avatar>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>
                        {selectedGuest.lastNameOrCompany} {selectedGuest.firstName || ''}
                      </Typography>
                      <Chip
                        label={selectedGuest.refId}
                        size="small"
                        sx={{ bgcolor: '#ffffff', color: '#722083', fontWeight: 800, border: '1px solid #cbd5e1' }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={isPresent ? 'PRÉSENCE ENREGISTRÉE' : 'NON ÉMARGÉ'}
                        size="small"
                        color={isPresent ? 'success' : 'default'}
                        sx={{ fontWeight: 700 }}
                      />
                      <Chip label={`Type: ${selectedGuest.guestType}`} size="small" variant="outlined" />
                    </Box>
                  </Box>
                </Box>

                {/* Big Action Buttons */}
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                  <Button
                    variant="outlined"
                    onClick={() => handlePrintBadge(selectedGuest)}
                    disabled={isPrinting}
                    startIcon={<Printer size={18} />}
                    sx={{
                      borderColor: '#722083',
                      color: '#722083',
                      fontWeight: 700,
                      py: 1,
                      px: 2
                    }}
                  >
                    {isPresent ? 'Réimprimer (I)' : 'Imprimer Badge (I)'}
                  </Button>

                  {!isPresent ? (
                    <Button
                      variant="contained"
                      size="large"
                      onClick={() => handleCheckIn(selectedGuest)}
                      disabled={isCheckingIn}
                      startIcon={<UserCheck size={20} />}
                      sx={{
                        bgcolor: '#10b981',
                        fontWeight: 800,
                        py: 1.2,
                        px: 3,
                        fontSize: '0.95rem',
                        '&:hover': { bgcolor: '#059669' }
                      }}
                    >
                      Valider Présence (P)
                    </Button>
                  ) : (
                    <Chip
                      icon={<CheckCircle size={16} />}
                      label="Émargé"
                      color="success"
                      sx={{ height: 36, px: 1, fontWeight: 800, fontSize: '0.85rem' }}
                    />
                  )}
                </Box>
              </Box>

              {/* Already Checked-in Warning Banner */}
              {isPresent && (
                <Box sx={{ p: 2, bgcolor: '#f0fdf4', borderBottom: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <CheckCircle size={20} color="#166534" />
                    <Typography variant="body2" sx={{ color: '#166534', fontWeight: 600 }}>
                      Présent depuis {new Date(selectedGuest.attendance.checkedInAt).toLocaleTimeString('fr-FR')} • {selectedGuest.attendance.workstation || 'Guichet'}
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* Full Identity Verification Grid */}
              <CardContent sx={{ p: 3 }}>
                <Typography variant="caption" sx={{ color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, mb: 2, display: 'block' }}>
                  Vérification des informations de l'invité
                </Typography>

                <Grid container spacing={2.5}>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #f1f5f9' }}>
                      <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>Nombre d'actions</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                        {selectedGuest.numberOfShares?.toLocaleString('fr-FR') || '0'}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #f1f5f9' }}>
                      <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>Banque</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 700, color: '#0f172a' }}>
                        {selectedGuest.bank || 'Non renseignée'}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #f1f5f9' }}>
                      <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>Wilaya</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 700, color: '#0f172a' }}>
                        {selectedGuest.wilaya || 'Non renseignée'}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>Numéro d'Identification National (NIN)</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700, color: '#0f172a' }}>
                      {selectedGuest.nationalIdentificationNumber || '-'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>RC / N° d'Agrément</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700, color: '#0f172a' }}>
                      {selectedGuest.registrationNumber || '-'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>Numéro d'Identification Fiscale (NIF)</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700, color: '#0f172a' }}>
                      {selectedGuest.taxIdentificationNumber || '-'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>Date de naissance</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#0f172a' }}>
                      {selectedGuest.birthDate || '-'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>Adresse</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>
                      {selectedGuest.address || '-'}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* New Guest / Walk-in Modal */}
      <NewGuestModal
        open={newGuestOpen}
        onClose={() => setNewGuestOpen(false)}
        onSubmit={handleCreateWalkIn}
      />
    </AppLayout>
  );
}
