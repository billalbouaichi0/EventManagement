import React, { useState } from 'react';
import { useRouter } from 'next/router';
import confetti from 'canvas-confetti';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Alert,
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
  ListItemText
} from '@mui/material';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Sparkles
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
  const [errorMessage, setErrorMessage] = useState('');

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
    setAnalyzing(true);
    setErrorMessage('');
    setAnalysisResult(null);
    setImportSuccess(false);

    const formData = new FormData();
    formData.append('file', fileToUpload);

    try {
      const res = await api.post('/guests/upload-csv', formData, {
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

  const handleConfirmImport = async () => {
    if (!analysisResult?.guests || !eventId) return;

    setImporting(true);
    try {
      await api.post('/guests/confirm-import', {
        eventId,
        guests: analysisResult.guests,
        fileName: file?.name || 'import.csv'
      });

      setImportSuccess(true);
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
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
          Importation de la Liste des Invités (CSV)
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b' }}>
          Importez vos fichiers CSV avec séparateur point-virgule (;) et vérifiez les données avant confirmation
        </Typography>
      </Box>

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {errorMessage}
        </Alert>
      )}

      {importSuccess ? (
        <Card sx={{ p: 6, textAlign: 'center', borderRadius: 3.5, bgcolor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
          <CheckCircle size={56} color="#16a34a" style={{ marginBottom: 16 }} />
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#14532d', mb: 1 }}>
            Importation réussie !
          </Typography>
          <Typography variant="body1" sx={{ color: '#166534', mb: 3 }}>
            {analysisResult.validCount} invités ont été ajoutés à l'événement avec succès.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              onClick={() => router.push(`/events/${eventId}/check-in`)}
              sx={{ bgcolor: '#2596be', fontWeight: 700 }}
            >
              Aller au Guichet d'Émargement
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                setFile(null);
                setAnalysisResult(null);
                setImportSuccess(false);
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
                p: { xs: 3, md: 5 },
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: '#2596be',
                  bgcolor: 'rgba(37, 150, 190, 0.02)'
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

              <Box sx={{ maxWidth: 480, mx: 'auto' }}>
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '16px',
                    bgcolor: 'rgba(37, 150, 190, 0.1)',
                    color: '#2596be',
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
                  ou cliquez pour parcourir vos dossiers (Séparateur standard : point-virgule ;)
                </Typography>

                <Button variant="outlined" size="small" sx={{ borderColor: '#cbd5e1', color: '#334155' }}>
                  Sélectionner un fichier
                </Button>
              </Box>
            </Card>
          </Grid>

          {/* Analysis & Validation Summary */}
          {analyzing && (
            <Grid item xs={12}>
              <Card sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
                <LinearProgress sx={{ color: '#2596be', mb: 2 }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#64748b' }}>
                  Analyse et validation de la structure du fichier CSV en cours...
                </Typography>
              </Card>
            </Grid>
          )}

          {analysisResult && !analyzing && (
            <>
              {/* Stats Summary Bar */}
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Card sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2.5, border: '1px solid #e2e8f0' }}>
                      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>TOTAL LIGNES DÉTECTÉES</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>{analysisResult.totalRows}</Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Card sx={{ p: 2, bgcolor: '#f0fdf4', borderRadius: 2.5, border: '1px solid #bbf7d0' }}>
                      <Typography variant="caption" sx={{ color: '#166534', fontWeight: 600 }}>LIGNES VALIDES À IMPORTER</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 800, color: '#16a34a' }}>{analysisResult.validCount}</Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Card sx={{ p: 2, bgcolor: analysisResult.invalidCount > 0 ? '#fef2f2' : '#f8fafc', borderRadius: 2.5, border: '1px solid #e2e8f0' }}>
                      <Typography variant="caption" sx={{ color: analysisResult.invalidCount > 0 ? '#b91c1c' : '#64748b', fontWeight: 600 }}>LIGNES AVEC ERREUR</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 800, color: analysisResult.invalidCount > 0 ? '#ef4444' : '#64748b' }}>{analysisResult.invalidCount}</Typography>
                    </Card>
                  </Grid>
                </Grid>
              </Grid>

              {/* Errors Section if Any */}
              {analysisResult.errors?.length > 0 && (
                <Grid item xs={12}>
                  <Alert severity="warning" sx={{ borderRadius: 2.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                      {analysisResult.errors.length} anomalie(s) détectée(s) :
                    </Typography>
                    <List dense disablePadding>
                      {analysisResult.errors.slice(0, 5).map((err, i) => (
                        <ListItem key={i} disablePadding>
                          <ListItemText
                            primary={`Ligne ${err.line}: ${err.error}`}
                            primaryTypographyProps={{ fontSize: '0.8rem', color: '#b45309' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Alert>
                </Grid>
              )}

              {/* Preview Table */}
              <Grid item xs={12}>
                <Card sx={{ borderRadius: 3.5, overflow: 'hidden' }}>
                  <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '0.95rem' }}>
                      Aperçu des 10 premières lignes analysées
                    </Typography>
                    <Chip label={`${analysisResult.validCount} prêts à l'insertion`} size="small" color="primary" sx={{ fontWeight: 700 }} />
                  </Box>

                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Nom / Raison Sociale</TableCell>
                          <TableCell>Prénom</TableCell>
                          <TableCell>Actions</TableCell>
                          <TableCell>NIN</TableCell>
                          <TableCell>Banque</TableCell>
                          <TableCell>Wilaya</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {analysisResult.preview?.map((row, idx) => (
                          <TableRow key={idx}>
                            <TableCell sx={{ fontWeight: 700 }}>{row.lastNameOrCompany}</TableCell>
                            <TableCell>{row.firstName || '-'}</TableCell>
                            <TableCell>{row.numberOfShares}</TableCell>
                            <TableCell>{row.nationalIdentificationNumber || '-'}</TableCell>
                            <TableCell>{row.bank || '-'}</TableCell>
                            <TableCell>{row.wilaya || '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <Box sx={{ p: 2.5, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button
                      variant="contained"
                      size="large"
                      disabled={importing || analysisResult.validCount === 0}
                      onClick={handleConfirmImport}
                      startIcon={<CheckCircle size={18} />}
                      sx={{ px: 4, py: 1.2, fontWeight: 800, bgcolor: '#2596be' }}
                    >
                      {importing ? 'Importation en cours...' : `Confirmer l'Importation (${analysisResult.validCount} Invités)`}
                    </Button>
                  </Box>
                </Card>
              </Grid>
            </>
          )}
        </Grid>
      )}
    </AppLayout>
  );
}
