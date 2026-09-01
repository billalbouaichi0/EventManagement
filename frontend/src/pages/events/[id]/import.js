import React, { useState } from 'react';
import { useRouter } from 'next/router';
import confetti from 'canvas-confetti';
import {
  Box,
  Card,
  Typography,
  Button,
  Grid,
  Alert,
  AlertTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Sparkles,
  ChevronDown,
  Edit3,
  Trash2,
  UserCheck,
  Info,
  XCircle,
  PlusCircle,
  EyeOff
} from 'lucide-react';
import AppLayout from '../../../components/layout/AppLayout';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';

export default function ImportCSVPage() {
  const router = useRouter();
  const { id: eventId } = router.query;
  const { user } = useAuth();

  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [importStats, setImportStats] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Manual Rectification Modal State
  const [rectifyOpen, setRectifyOpen] = useState(false);
  const [selectedErrorRow, setSelectedErrorRow] = useState(null);
  const [rectifyForm, setRectifyForm] = useState({
    lastNameOrCompany: '',
    firstName: '',
    numberOfShares: 0,
    nationalIdentificationNumber: '',
    registrationNumber: '',
    registrationIssueDate: '',
    taxIdentificationNumber: '',
    birthDate: '',
    bank: '',
    wilaya: '',
    address: '',
    guestType: 'REGISTERED'
  });

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      handleAnalyze(selected);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selected = e.dataTransfer.files[0];
      setFile(selected);
      handleAnalyze(selected);
    }
  };

  const handleAnalyze = async (fileToUpload) => {
    if (!eventId) return;

    setAnalyzing(true);
    setErrorMessage('');
    setSuccessMessage('');
    setAnalysisResult(null);
    setImportSuccess(false);
    setImportStats(null);

    const formData = new FormData();
    formData.append('file', fileToUpload);

    try {
      const res = await api.post(`/guests/upload-csv?eventId=${eventId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setAnalysisResult(res.data);
    } catch (err) {
      console.error('Erreur analyse CSV:', err);
      setErrorMessage(err.response?.data?.error || 'Erreur lors de la lecture du fichier CSV.');
    } finally {
      setAnalyzing(false);
    }
  };

  // Open Rectify Modal for a specific row
  const handleOpenRectify = (errItem) => {
    setSelectedErrorRow(errItem);
    const draft = errItem.draft || {};
    const raw = errItem.rawData || {};

    setRectifyForm({
      lastNameOrCompany: draft.lastNameOrCompany || raw['Nom ou raison sociale'] || raw['Nom'] || raw['Raison Sociale'] || '',
      firstName: draft.firstName || raw['Prénom'] || raw['Prenom'] || '',
      numberOfShares: draft.numberOfShares || parseInt(raw['Nombre d\'actions'] || raw['Actions'] || '0', 10) || 0,
      nationalIdentificationNumber: draft.nationalIdentificationNumber || raw['Numéro d\'Identification National'] || raw['NIN'] || '',
      registrationNumber: draft.registrationNumber || raw['RC/N° agrément'] || raw['RC'] || '',
      registrationIssueDate: draft.registrationIssueDate || raw['Date de délivrance RC'] || '',
      taxIdentificationNumber: draft.taxIdentificationNumber || raw['Numéro d\'identification fiscal (NIF)'] || raw['NIF'] || '',
      birthDate: draft.birthDate || raw['Date de naissance'] || '',
      bank: draft.bank || raw['Banque'] || '',
      wilaya: draft.wilaya || raw['Wilaya'] || '',
      address: draft.address || raw['Adresse'] || '',
      guestType: draft.guestType || 'REGISTERED'
    });
    setRectifyOpen(true);
  };

  // Save Rectified Guest
  const handleSaveRectified = (e) => {
    e.preventDefault();
    if (!rectifyForm.lastNameOrCompany.trim()) {
      alert('Le Nom ou la Raison Sociale est obligatoire pour valider cette ligne.');
      return;
    }

    const newGuest = {
      ...rectifyForm,
      importNumber: selectedErrorRow?.draft?.importNumber || (analysisResult.guests.length + 1),
      guestType: rectifyForm.guestType || 'REGISTERED',
      source: 'CSV'
    };

    // Remove from errors list
    const updatedErrors = analysisResult.errors.filter(err => err.line !== selectedErrorRow.line);
    const updatedGuests = [...analysisResult.guests, newGuest];
    const updatedPreview = [...analysisResult.preview];
    if (updatedPreview.length < 10) {
      updatedPreview.push(newGuest);
    }

    setAnalysisResult({
      ...analysisResult,
      guests: updatedGuests,
      preview: updatedPreview,
      errors: updatedErrors,
      validCount: updatedGuests.length,
      invalidCount: updatedErrors.length
    });

    setRectifyOpen(false);
    setSelectedErrorRow(null);
    setSuccessMessage(`Ligne #${selectedErrorRow.line} rectifiée et ajoutée avec succès aux invités prêts à l'import !`);

    setTimeout(() => {
      setSuccessMessage('');
    }, 4000);
  };

  // Ignore Single Error Row
  const handleIgnoreError = (line) => {
    const updatedErrors = analysisResult.errors.filter(err => err.line !== line);
    setAnalysisResult({
      ...analysisResult,
      errors: updatedErrors,
      invalidCount: updatedErrors.length
    });
  };

  // Ignore All Error Rows
  const handleIgnoreAllErrors = () => {
    setAnalysisResult({
      ...analysisResult,
      errors: [],
      invalidCount: 0
    });
    setSuccessMessage('Toutes les lignes incomplètes ont été ignorées.');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Confirm Final Import
  const handleConfirmImport = async () => {
    if (!analysisResult?.guests || analysisResult.guests.length === 0 || !eventId) return;

    setImporting(true);
    setErrorMessage('');

    try {
      const res = await api.post('/guests/confirm-import', {
        eventId,
        guests: analysisResult.guests,
        fileName: file?.name || 'import.csv',
        skipDuplicates: true
      });

      setImportStats(res.data);
      setImportSuccess(true);

      if (res.data.importedCount > 0) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      console.error('Erreur confirmation import:', err);
      setErrorMessage(err.response?.data?.error || 'Erreur lors de l\'enregistrement des données.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <AppLayout>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>
          Importation & Validation Interactive (CSV)
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b' }}>
          Analyse automatique, détection des doublons et possibilité de rectifier manuellement les lignes non reconnues.
        </Typography>
      </Box>

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {errorMessage}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
          {successMessage}
        </Alert>
      )}

      {importSuccess ? (
        <Card sx={{ p: 6, textAlign: 'center', borderRadius: 3.5, bgcolor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
          <CheckCircle size={56} color="#16a34a" style={{ marginBottom: 16 }} />
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#14532d', mb: 1 }}>
            Importation traitée avec succès !
          </Typography>
          <Typography variant="body1" sx={{ color: '#166534', mb: 1, fontWeight: 600 }}>
            {importStats?.importedCount || 0} nouvel(s) invité(s) ajouté(s) à la liste de l'événement.
          </Typography>
          {(importStats?.duplicateCount > 0 || analysisResult?.duplicateCount > 0) && (
            <Typography variant="body2" sx={{ color: '#854d0e', mb: 3 }}>
              ℹ️ {importStats?.duplicateCount || analysisResult?.duplicateCount} doublon(s) ont été ignorés en toute sécurité pour préserver l'intégrité des données.
            </Typography>
          )}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 3 }}>
            <Button
              variant="contained"
              onClick={() => router.push(`/events/${eventId}/check-in`)}
              sx={{ bgcolor: '#722083', fontWeight: 700, px: 3 }}
            >
              Aller au Guichet d'Émargement
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                setFile(null);
                setAnalysisResult(null);
                setImportSuccess(false);
                setImportStats(null);
              }}
              sx={{ color: '#334155', borderColor: '#cbd5e1' }}
            >
              Importer un autre fichier
            </Button>
          </Box>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {/* Upload Drop Zone */}
          <Grid item xs={12}>
            <Card
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              sx={{
                borderRadius: 3.5,
                border: '2px dashed #cbd5e1',
                bgcolor: '#ffffff',
                p: { xs: 3, md: 4.5 },
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: '#722083',
                  bgcolor: 'rgba(114, 32, 131, 0.02)'
                }
              }}
              onClick={() => document.getElementById('csv-file-input').click()}
            >
              <input
                type="file"
                id="csv-file-input"
                accept=".csv"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />

              <Box sx={{ maxWidth: 520, mx: 'auto' }}>
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '16px',
                    bgcolor: 'rgba(114, 32, 131, 0.1)',
                    color: '#722083',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2
                  }}
                >
                  <UploadCloud size={32} />
                </Box>

                <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', mb: 0.5 }}>
                  {file ? file.name : 'Glissez-déposez votre fichier CSV ici'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
                  Séparateur auto-détecté (point-virgule ; virgule , ou tabulation) avec encodage UTF-8
                </Typography>

                <Button variant="outlined" size="small" sx={{ borderColor: '#cbd5e1', color: '#334155' }}>
                  {file ? 'Changer de fichier' : 'Sélectionner un fichier CSV'}
                </Button>
              </Box>
            </Card>
          </Grid>

          {/* Analysis & Validation Progress */}
          {analyzing && (
            <Grid item xs={12}>
              <Card sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
                <LinearProgress sx={{ color: '#722083', mb: 2 }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#64748b' }}>
                  Vérification de la conformité, analyse des colonnes et détection des doublons en cours...
                </Typography>
              </Card>
            </Grid>
          )}

          {analysisResult && !analyzing && (
            <>
              {/* Stats Summary Bar */}
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={3}>
                    <Card sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2.5, border: '1px solid #e2e8f0' }}>
                      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>TOTAL LIGNES ANALYSÉES</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>{analysisResult.totalRows}</Typography>
                    </Card>
                  </Grid>

                  <Grid item xs={12} sm={3}>
                    <Card sx={{ p: 2, bgcolor: '#f0fdf4', borderRadius: 2.5, border: '1px solid #bbf7d0' }}>
                      <Typography variant="caption" sx={{ color: '#166534', fontWeight: 600 }}>NOUVEAUX INVITÉS VALIDES</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 800, color: '#16a34a' }}>{analysisResult.validCount}</Typography>
                    </Card>
                  </Grid>

                  <Grid item xs={12} sm={3}>
                    <Card sx={{ p: 2, bgcolor: analysisResult.duplicateCount > 0 ? '#fffbeb' : '#f8fafc', borderRadius: 2.5, border: analysisResult.duplicateCount > 0 ? '1px solid #fde68a' : '1px solid #e2e8f0' }}>
                      <Typography variant="caption" sx={{ color: analysisResult.duplicateCount > 0 ? '#b45309' : '#64748b', fontWeight: 600 }}>DOUBLONS DÉTECTÉS</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 800, color: analysisResult.duplicateCount > 0 ? '#d97706' : '#64748b' }}>{analysisResult.duplicateCount}</Typography>
                    </Card>
                  </Grid>

                  <Grid item xs={12} sm={3}>
                    <Card sx={{ p: 2, bgcolor: analysisResult.invalidCount > 0 ? '#fef2f2' : '#f8fafc', borderRadius: 2.5, border: analysisResult.invalidCount > 0 ? '1px solid #fecaca' : '1px solid #e2e8f0' }}>
                      <Typography variant="caption" sx={{ color: analysisResult.invalidCount > 0 ? '#b91c1c' : '#64748b', fontWeight: 600 }}>LIGNES À RECTIFIER / IGNORER</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 800, color: analysisResult.invalidCount > 0 ? '#ef4444' : '#64748b' }}>{analysisResult.invalidCount}</Typography>
                    </Card>
                  </Grid>
                </Grid>
              </Grid>

              {/* Duplicate Details Accordion if Any */}
              {analysisResult.duplicateCount > 0 && (
                <Grid item xs={12}>
                  <Accordion
                    sx={{
                      borderRadius: '12px !important',
                      border: '1px solid #fde68a',
                      bgcolor: '#fffbeb',
                      boxShadow: 'none',
                      '&:before': { display: 'none' }
                    }}
                  >
                    <AccordionSummary expandIcon={<ChevronDown size={20} color="#b45309" />}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <AlertTriangle size={22} color="#d97706" />
                        <Typography sx={{ fontWeight: 700, color: '#92400e', fontSize: '0.95rem' }}>
                          {analysisResult.duplicateCount} doublon(s) identifié(s) (seront automatiquement ignorés)
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ pt: 0 }}>
                      <Typography variant="body2" sx={{ color: '#78350f', mb: 2, fontSize: '0.85rem' }}>
                        Ces invités existent déjà dans cet événement ou apparaissent plusieurs fois dans votre fichier :
                      </Typography>

                      <TableContainer component={Paper} elevation={0} sx={{ bgcolor: '#ffffff', borderRadius: 2, border: '1px solid #fef3c7' }}>
                        <Table size="small">
                          <TableHead sx={{ bgcolor: '#fef3c7' }}>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#92400e' }}>Ligne</TableCell>
                              <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#92400e' }}>Nom de l'Invité</TableCell>
                              <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#92400e' }}>Identifiant</TableCell>
                              <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#92400e' }}>Motif du doublon</TableCell>
                              <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#92400e' }}>Type</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {analysisResult.duplicates.map((dup, i) => (
                              <TableRow key={i}>
                                <TableCell sx={{ fontWeight: 700, color: '#64748b' }}>#{dup.line}</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#0f172a' }}>{dup.name}</TableCell>
                                <TableCell sx={{ color: '#475569', fontSize: '0.8rem' }}>{dup.identifier}</TableCell>
                                <TableCell sx={{ color: '#b45309', fontSize: '0.8rem' }}>{dup.reason}</TableCell>
                                <TableCell>
                                  <Chip
                                    label={dup.type === 'DB_DUPLICATE' ? 'Existant en Base' : 'Doublon Fichier'}
                                    size="small"
                                    sx={{
                                      fontSize: '0.68rem',
                                      fontWeight: 700,
                                      bgcolor: dup.type === 'DB_DUPLICATE' ? '#fef3c7' : '#fed7aa',
                                      color: dup.type === 'DB_DUPLICATE' ? '#92400e' : '#9a3412'
                                    }}
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </AccordionDetails>
                  </Accordion>
                </Grid>
              )}

              {/* UNPARSED / INCOMPLETE ROWS WITH MANUAL RECTIFICATION */}
              {analysisResult.errors?.length > 0 && (
                <Grid item xs={12}>
                  <Card sx={{ borderRadius: 3.5, border: '1px solid #fecaca', bgcolor: '#fff5f5', p: 2.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <XCircle size={24} color="#dc2626" />
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#991b1b' }}>
                            {analysisResult.errors.length} ligne(s) non détectée(s) ou incomplètes
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#7f1d1d', fontSize: '0.82rem' }}>
                            Vous pouvez rectifier manuellement les informations manquantes ou les ignorer pour finaliser l'importation.
                          </Typography>
                        </Box>
                      </Box>

                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={handleIgnoreAllErrors}
                        startIcon={<EyeOff size={16} />}
                        sx={{ fontWeight: 700, bgcolor: '#ffffff' }}
                      >
                        Ignorer toutes les lignes incomplètes
                      </Button>
                    </Box>

                    <TableContainer component={Paper} elevation={0} sx={{ bgcolor: '#ffffff', borderRadius: 2, border: '1px solid #fee2e2' }}>
                      <Table size="small">
                        <TableHead sx={{ bgcolor: '#fee2e2' }}>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 700, color: '#991b1b', fontSize: '0.78rem' }}>Ligne</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#991b1b', fontSize: '0.78rem' }}>Anomalie constatée</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#991b1b', fontSize: '0.78rem' }}>Données détectées</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, color: '#991b1b', fontSize: '0.78rem' }}>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {analysisResult.errors.map((errItem, idx) => {
                            const raw = errItem.rawData || {};
                            const rawValues = Object.entries(raw)
                              .filter(([k, v]) => String(v).trim().length > 0)
                              .map(([k, v]) => `${k}: ${v}`)
                              .join(' | ');

                            return (
                              <TableRow key={idx} hover>
                                <TableCell sx={{ fontWeight: 800, color: '#b91c1c' }}>#{errItem.line}</TableCell>
                                <TableCell sx={{ color: '#b91c1c', fontWeight: 600, fontSize: '0.8rem' }}>
                                  {errItem.error}
                                </TableCell>
                                <TableCell sx={{ color: '#475569', fontSize: '0.78rem', maxWidth: 360, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {rawValues || 'Aucune donnée valide'}
                                </TableCell>
                                <TableCell align="right">
                                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                    <Button
                                      variant="contained"
                                      size="small"
                                      onClick={() => handleOpenRectify(errItem)}
                                      startIcon={<Edit3 size={14} />}
                                      sx={{ bgcolor: '#722083', fontWeight: 700, fontSize: '0.72rem', textTransform: 'none' }}
                                    >
                                      Rectifier
                                    </Button>
                                    <Button
                                      variant="outlined"
                                      size="small"
                                      color="inherit"
                                      onClick={() => handleIgnoreError(errItem.line)}
                                      startIcon={<Trash2 size={14} />}
                                      sx={{ color: '#64748b', borderColor: '#cbd5e1', fontSize: '0.72rem', textTransform: 'none' }}
                                    >
                                      Ignorer
                                    </Button>
                                  </Box>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Card>
                </Grid>
              )}

              {/* All Duplicates Notice if validCount === 0 */}
              {analysisResult.validCount === 0 && analysisResult.duplicateCount > 0 && analysisResult.invalidCount === 0 && (
                <Grid item xs={12}>
                  <Alert severity="info" sx={{ borderRadius: 2.5, bgcolor: '#eff6ff', border: '1px solid #bfdbfe' }}>
                    <AlertTitle sx={{ fontWeight: 700, color: '#1e40af' }}>Aucune nouvelle ligne à importer</AlertTitle>
                    Tous les invités présents dans ce fichier ({analysisResult.duplicateCount}) sont déjà enregistrés dans cet événement.
                  </Alert>
                </Grid>
              )}

              {/* Valid Guests Preview Table */}
              {analysisResult.validCount > 0 && (
                <Grid item xs={12}>
                  <Card sx={{ borderRadius: 3.5, overflow: 'hidden' }}>
                    <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9' }}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
                          Aperçu des invités prêts à l'importation ({analysisResult.validCount} validés)
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>
                          Affichage des 10 premières lignes uniques vérifiées
                        </Typography>
                      </Box>
                      <Chip
                        icon={<UserCheck size={14} />}
                        label={`${analysisResult.validCount} prêts à l'insertion`}
                        size="small"
                        color="success"
                        sx={{ fontWeight: 700 }}
                      />
                    </Box>

                    <TableContainer>
                      <Table size="small">
                        <TableHead sx={{ bgcolor: '#f8fafc' }}>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>Nom / Raison Sociale</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Prénom</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>NIN</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Banque</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Wilaya</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {analysisResult.preview?.map((row, idx) => (
                            <TableRow key={idx} hover>
                              <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>{row.lastNameOrCompany}</TableCell>
                              <TableCell>{row.firstName || '-'}</TableCell>
                              <TableCell>
                                <Chip label={row.numberOfShares || 0} size="small" variant="outlined" sx={{ fontWeight: 700, fontSize: '0.75rem' }} />
                              </TableCell>
                              <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{row.nationalIdentificationNumber || '-'}</TableCell>
                              <TableCell>{row.bank || '-'}</TableCell>
                              <TableCell>{row.wilaya || '-'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>

                    <Box sx={{ p: 2.5, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" sx={{ color: '#64748b' }}>
                        {analysisResult.duplicateCount > 0 ? `ℹ️ ${analysisResult.duplicateCount} doublon(s) seront automatiquement écartés lors de l'insertion.` : '✅ Aucun doublon détecté.'}
                      </Typography>

                      <Button
                        variant="contained"
                        size="large"
                        disabled={importing || analysisResult.validCount === 0}
                        onClick={handleConfirmImport}
                        startIcon={<CheckCircle size={18} />}
                        sx={{ px: 4, py: 1.2, fontWeight: 800, bgcolor: '#722083', '&:hover': { bgcolor: '#591766' } }}
                      >
                        {importing ? 'Importation en cours...' : `Confirmer l'Importation (${analysisResult.validCount} Invités)`}
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              )}
            </>
          )}
        </Grid>
      )}

      {/* MODAL DE RECTIFICATION MANUELLE D'UNE LIGNE INCOMPLÈTE */}
      <Dialog
        open={rectifyOpen}
        onClose={() => setRectifyOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3.5, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Edit3 size={24} color="#722083" />
          Rectification manuelle de la ligne #{selectedErrorRow?.line}
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: '#f1f5f9' }}>
          <Box sx={{ mb: 2, p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block' }}>
              Données brutes détectées dans le fichier :
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', color: '#0f172a', fontSize: '0.78rem', wordBreak: 'break-all' }}>
              {selectedErrorRow?.rawData ? JSON.stringify(selectedErrorRow.rawData) : '-'}
            </Typography>
          </Box>

          <form id="rectify-form" onSubmit={handleSaveRectified}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Nom ou Raison Sociale *"
                  required
                  fullWidth
                  autoFocus
                  value={rectifyForm.lastNameOrCompany}
                  onChange={(e) => setRectifyForm({ ...rectifyForm, lastNameOrCompany: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Prénom"
                  fullWidth
                  value={rectifyForm.firstName}
                  onChange={(e) => setRectifyForm({ ...rectifyForm, firstName: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Nombre d'Actions"
                  type="number"
                  fullWidth
                  value={rectifyForm.numberOfShares}
                  onChange={(e) => setRectifyForm({ ...rectifyForm, numberOfShares: parseInt(e.target.value, 10) || 0 })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Numéro NIN"
                  fullWidth
                  value={rectifyForm.nationalIdentificationNumber}
                  onChange={(e) => setRectifyForm({ ...rectifyForm, nationalIdentificationNumber: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="RC / N° Agrément"
                  fullWidth
                  value={rectifyForm.registrationNumber}
                  onChange={(e) => setRectifyForm({ ...rectifyForm, registrationNumber: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Banque"
                  fullWidth
                  value={rectifyForm.bank}
                  onChange={(e) => setRectifyForm({ ...rectifyForm, bank: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Wilaya"
                  fullWidth
                  value={rectifyForm.wilaya}
                  onChange={(e) => setRectifyForm({ ...rectifyForm, wilaya: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Date de Naissance"
                  fullWidth
                  placeholder="JJ/MM/AAAA"
                  value={rectifyForm.birthDate}
                  onChange={(e) => setRectifyForm({ ...rectifyForm, birthDate: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Adresse"
                  fullWidth
                  value={rectifyForm.address}
                  onChange={(e) => setRectifyForm({ ...rectifyForm, address: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Type d'invité"
                  select
                  fullWidth
                  value={rectifyForm.guestType}
                  onChange={(e) => setRectifyForm({ ...rectifyForm, guestType: e.target.value })}
                >
                  <MenuItem value="REGISTERED">Invité Inscrit</MenuItem>
                  <MenuItem value="VIP">VIP</MenuItem>
                  <MenuItem value="ORGANIZATION">Organisation</MenuItem>
                  <MenuItem value="PRESS">Presse</MenuItem>
                  <MenuItem value="OTHER">Autre</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </form>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setRectifyOpen(false)} sx={{ color: '#64748b' }}>
            Annuler
          </Button>
          <Button
            type="submit"
            form="rectify-form"
            variant="contained"
            startIcon={<CheckCircle size={18} />}
            sx={{ bgcolor: '#722083', fontWeight: 700, px: 3 }}
          >
            Valider et Ajouter à la Liste
          </Button>
        </DialogActions>
      </Dialog>
    </AppLayout>
  );
}
