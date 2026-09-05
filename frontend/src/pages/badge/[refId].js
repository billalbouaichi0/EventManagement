import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Paper
} from '@mui/material';
import { Printer, ArrowLeft, Download, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function BadgePrintPage() {
  const router = useRouter();
  const { refId, autoPrint, autoDownload } = router.query;

  const [guest, setGuest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const badgeRef = useRef(null);
  const printTriggered = useRef(false);

  useEffect(() => {
    if (refId) {
      api.get(`/guests/${refId}`)
        .then((res) => {
          setGuest(res.data.guest);
        })
        .catch((err) => {
          console.error('Erreur chargement invité badge:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [refId]);

  const handleDirectPrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!badgeRef.current || !guest) return;
    setDownloadingPdf(true);

    try {
      const element = badgeRef.current;
      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [65, 102]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, 65, 102, undefined, 'FAST');

      const fileName = `Badge_${guest.lastNameOrCompany || 'Invite'}.pdf`.replace(/[^a-zA-Z0-9_\.-]/g, '_');
      pdf.save(fileName);
    } catch (err) {
      console.error('Erreur génération PDF badge:', err);
    } finally {
      setDownloadingPdf(false);
    }
  };

  useEffect(() => {
    if (guest && !loading && !printTriggered.current) {
      printTriggered.current = true;

      if (autoDownload === 'true') {
        handleDownloadPdf();
      } else if (autoPrint === 'true') {
        const timer = setTimeout(() => {
          window.print();
        }, 600);
        return () => clearTimeout(timer);
      }
    }
  }, [guest, loading, autoPrint, autoDownload]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', bgcolor: '#fbf9fc' }}>
        <CircularProgress sx={{ color: '#722083' }} />
      </Box>
    );
  }

  if (!guest) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="error">Invité introuvable</Typography>
        <Button onClick={() => router.back()} sx={{ mt: 2 }}>Retour</Button>
      </Box>
    );
  }

  const guestStatusText = guest.guestType === 'VIP' ? '★ VIP' : (guest.guestType === 'ORGANIZATION' ? 'ORGANISATION' : (guest.guestType === 'PRESS' ? 'PRESSE' : 'REGISTERED'));

  return (
    <>
      <Head>
        <title>Badge — {guest.lastNameOrCompany}</title>
        <style>{`
          @media print {
            @page {
              size: 65mm 102mm portrait;
              margin: 0mm !important;
              padding: 0mm !important;
            }
            * {
              margin: 0 !important;
              padding: 0 !important;
              box-sizing: border-box !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            html, body {
              width: 65mm !important;
              height: 102mm !important;
              min-width: 65mm !important;
              min-height: 102mm !important;
              max-width: 65mm !important;
              max-height: 102mm !important;
              margin: 0 !important;
              padding: 0 !important;
              overflow: hidden !important;
              background: #ffffff !important;
            }
            .no-print {
              display: none !important;
            }
            .badge-print-wrapper {
              width: 65mm !important;
              height: 102mm !important;
              min-width: 65mm !important;
              min-height: 102mm !important;
              max-width: 65mm !important;
              max-height: 102mm !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              overflow: hidden !important;
              background: #ffffff !important;
              padding: 0 !important;
              margin: 0 !important;
            }
            .badge-card {
              box-shadow: none !important;
              border: none !important;
              width: 65mm !important;
              height: 102mm !important;
              min-width: 65mm !important;
              max-width: 65mm !important;
              min-height: 102mm !important;
              max-height: 102mm !important;
              border-radius: 0 !important;
              margin: 0 !important;
              padding: 4mm 5mm !important;
              transform: none !important;
            }
          }
        `}</style>
      </Head>

      {/* Screen Controls Header (Hidden during print) */}
      <Box
        className="no-print"
        sx={{
          bgcolor: '#1e0824',
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
          color: '#ffffff'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => window.close()}
            startIcon={<ArrowLeft size={16} />}
            sx={{ color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.3)' }}
          >
            Fermer
          </Button>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Badge (Largeur 65 mm × Hauteur 102 mm) — {guest.lastNameOrCompany} {guest.firstName || ''}
          </Typography>
        </Box>

        {/* Action Controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Button
            variant="contained"
            disabled={downloadingPdf}
            onClick={handleDownloadPdf}
            startIcon={downloadingPdf ? <CircularProgress size={16} color="inherit" /> : <Download size={18} />}
            sx={{ bgcolor: '#fdb700', color: '#1e0824', '&:hover': { bgcolor: '#fecb43' }, fontWeight: 800 }}
          >
            {downloadingPdf ? 'PDF...' : 'Télécharger PDF'}
          </Button>

          <Button
            variant="contained"
            onClick={handleDirectPrint}
            startIcon={<Printer size={18} />}
            sx={{ bgcolor: '#722083', '&:hover': { bgcolor: '#591766' }, fontWeight: 700 }}
          >
            Imprimer le badge
          </Button>
        </Box>
      </Box>

      {/* Guide Banner for Printer Margins */}
      <Box className="no-print" sx={{ bgcolor: '#fdf9ff', borderBottom: '1px solid #f0e6f2', px: 3, py: 1, display: 'flex', justifyContent: 'center' }}>
        <Typography variant="caption" sx={{ color: '#722083', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckCircle2 size={14} color="#722083" />
          Format 65 mm × 102 mm : Dans les paramètres d'impression, réglez <b>Marges : « Aucune »</b> et <b>Échelle : 100%</b>.
        </Typography>
      </Box>

      {/* Badge Viewport Container */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 'calc(100vh - 120px)',
          bgcolor: '#fbf9fc',
          p: 2
        }}
      >
        <Box
          className="badge-print-wrapper"
          sx={{
            width: '65mm',
            height: '102mm',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}
        >
          {/* Card: Exact 65mm Largeur x 102mm Hauteur - Zero rotation */}
          <Paper
            ref={badgeRef}
            id="badge-to-print"
            className="badge-card badge-print-container"
            elevation={3}
            sx={{
              width: '65mm',
              height: '102mm',
              minWidth: '65mm',
              maxWidth: '65mm',
              minHeight: '102mm',
              maxHeight: '102mm',
              bgcolor: '#ffffff',
              borderRadius: '0px',
              border: '1px solid #f0e6f2',
              p: '5mm 4mm',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'center',
              textAlign: 'center',
              boxSizing: 'border-box',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Top Decorative Border (Violet + Gold) */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4.5px',
                bgcolor: '#722083',
                borderBottom: '1.5px solid #fdb700'
              }}
            />

            {/* 1. EN HAUT AU CENTRE : LOGO BDL */}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', pt: '2mm', width: '100%' }}>
              <img
                src="/LogoBadge.png"
                alt="Logo BDL"
                crossOrigin="anonymous"
                style={{
                  height: '22mm',
                  maxWidth: '56mm',
                  objectFit: 'contain'
                }}
                onError={(e) => {
                  e.target.src = '/LogoBadge.png';
                }}
              />
            </Box>

            {/* 2. JUSTE EN BAS : NOM DE L'ÉVÉNEMENT */}
            <Box sx={{ width: '100%', px: '0.5mm' }}>
              <Typography
                sx={{
                  fontSize: '9.5pt',
                  fontWeight: 800,
                  color: '#722083',
                  lineHeight: 1.2,
                  textTransform: 'uppercase',
                  letterSpacing: '0.02em',
                  wordBreak: 'break-word'
                }}
              >
                {guest.event?.name || 'ASSEMBLÉE GÉNÉRALE ORDINAIRE 2026'}
              </Typography>

              {/* 3. EN BAS : BANQUE DE DÉVELOPPEMENT LOCAL - BDL */}
              <Typography
                sx={{
                  fontSize: '7.5pt',
                  fontWeight: 700,
                  color: '#475569',
                  lineHeight: 1.15,
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase',
                  mt: '1mm'
                }}
              >
                Banque de Développement Local - BDL
              </Typography>
            </Box>

            {/* 4. EN BAS : REGISTRED / STATUT */}
            <Box sx={{ my: '1mm' }}>
              <Box
                sx={{
                  display: 'inline-block',
                  bgcolor: guest.guestType === 'VIP' ? '#fef3c7' : '#fcf4ff',
                  color: guest.guestType === 'VIP' ? '#92400e' : '#722083',
                  border: guest.guestType === 'VIP' ? '1.5px solid #fde68a' : '1.5px solid #f0d6f7',
                  fontSize: '8pt',
                  fontWeight: 800,
                  px: '14px',
                  py: '3px',
                  borderRadius: '4px',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase'
                }}
              >
                {guestStatusText}
              </Box>
            </Box>

            {/* 5. EN BAS : NOM & PRÉNOM (Grand format central et aéré) */}
            <Box sx={{ width: '100%', px: '0.5mm', mb: '3mm' }}>
              <Typography
                sx={{
                  fontSize: '14.5pt',
                  fontWeight: 900,
                  color: '#1e0824',
                  lineHeight: 1.2,
                  wordBreak: 'break-word',
                  textTransform: 'uppercase',
                  letterSpacing: '-0.01em'
                }}
              >
                {guest.lastNameOrCompany}
              </Typography>
              {guest.firstName && (
                <Typography
                  sx={{
                    fontSize: '12.5pt',
                    fontWeight: 700,
                    color: '#475569',
                    lineHeight: 1.2,
                    wordBreak: 'break-word',
                    textTransform: 'capitalize',
                    mt: '2px'
                  }}
                >
                  {guest.firstName}
                </Typography>
              )}
            </Box>
          </Paper>
        </Box>
      </Box>
    </>
  );
}
