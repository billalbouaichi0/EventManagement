import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { QRCodeSVG } from 'qrcode.react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Paper
} from '@mui/material';
import { Printer, ArrowLeft, Download } from 'lucide-react';
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

  // Clean, stable print handler without state collisions
  const handleDirectPrint = () => {
    window.print();
  };

  // Function to generate and download the actual .pdf file (65mm x 102mm)
  const handleDownloadPdf = async () => {
    if (!badgeRef.current || !guest) return;
    setDownloadingPdf(true);

    try {
      const element = badgeRef.current;
      const canvas = await html2canvas(element, {
        scale: 3, // High resolution for crisp printing
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
      
      const fileName = `Badge_${guest.refId}_${guest.lastNameOrCompany || 'Invite'}.pdf`.replace(/[^a-zA-Z0-9_\.-]/g, '_');
      pdf.save(fileName);
    } catch (err) {
      console.error('Erreur génération PDF badge:', err);
    } finally {
      setDownloadingPdf(false);
    }
  };

  // Auto trigger Print or Download when requested via URL query params
  useEffect(() => {
    if (guest && !loading && !printTriggered.current) {
      printTriggered.current = true;

      if (autoDownload === 'true') {
        handleDownloadPdf();
      } else if (autoPrint === 'true') {
        // Wait for logo and fonts to fully paint, then trigger print safely
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

  const qrData = JSON.stringify({
    ref: guest.refId,
    id: guest.id,
    name: `${guest.lastNameOrCompany} ${guest.firstName || ''}`.trim(),
    event: guest.event?.name || 'BDL Event'
  });

  const guestStatusText = guest.guestType === 'VIP' ? '★ VIP' : (guest.guestType === 'ORGANIZATION' ? 'ORGANISATION' : (guest.guestType === 'PRESS' ? 'PRESSE' : 'REGISTERED'));

  return (
    <>
      <Head>
        <title>Badge — {guest.lastNameOrCompany} ({guest.refId})</title>
        <style>{`
          @media print {
            @page {
              size: 65mm 102mm portrait;
              margin: 0;
            }
            html, body {
              width: 65mm !important;
              height: 102mm !important;
              margin: 0 !important;
              padding: 0 !important;
              overflow: hidden !important;
              background: #ffffff !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .no-print {
              display: none !important;
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
            Badge — {guest.lastNameOrCompany} ({guest.refId})
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          {/* Download PDF Button */}
          <Button
            variant="contained"
            disabled={downloadingPdf}
            onClick={handleDownloadPdf}
            startIcon={downloadingPdf ? <CircularProgress size={16} color="inherit" /> : <Download size={18} />}
            sx={{ bgcolor: '#fdb700', color: '#1e0824', '&:hover': { bgcolor: '#fecb43' }, fontWeight: 800 }}
          >
            {downloadingPdf ? 'Génération...' : 'Télécharger PDF (.pdf)'}
          </Button>

          {/* Print Button */}
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

      {/* Badge Viewport Container */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 'calc(100vh - 70px)',
          bgcolor: '#fbf9fc',
          p: 3
        }}
      >
        {/* Physical Badge Layout: EXACT Largeur 65mm x Hauteur 102mm */}
        <Paper
          ref={badgeRef}
          id="badge-to-print"
          className="badge-card badge-print-container"
          elevation={4}
          sx={{
            width: '65mm',
            height: '102mm',
            minWidth: '65mm',
            maxWidth: '65mm',
            minHeight: '102mm',
            maxHeight: '102mm',
            bgcolor: '#ffffff',
            borderRadius: '8px',
            border: '1px solid #f0e6f2',
            p: '4mm 4.5mm',
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
              height: '4px',
              bgcolor: '#722083',
              borderBottom: '1px solid #fdb700'
            }}
          />

          {/* 1. EN HAUT AU CENTRE : LOGO */}
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', pt: '1.5mm', mb: '1mm', width: '100%' }}>
            <img
              src="/logo-acronyme.png"
              alt="Logo BDL"
              crossOrigin="anonymous"
              style={{
                height: '16mm',
                maxWidth: '48mm',
                objectFit: 'contain'
              }}
              onError={(e) => {
                e.target.src = '/LOGO-ACRONYME-.png';
              }}
            />
          </Box>

          {/* 2. JUSTE EN BAS : NOM DE L'ÉVÉNEMENT */}
          <Typography
            sx={{
              fontSize: '8.5pt',
              fontWeight: 800,
              color: '#722083',
              lineHeight: 1.15,
              textTransform: 'uppercase',
              letterSpacing: '0.02em',
              px: '1mm',
              wordBreak: 'break-word'
            }}
          >
            {guest.event?.name || 'ASSEMBLÉE GÉNÉRALE ORDINAIRE 2026'}
          </Typography>

          {/* 3. EN BAS : BANQUE DE DÉVELOPPEMENT LOCAL - BDL */}
          <Typography
            sx={{
              fontSize: '6.5pt',
              fontWeight: 700,
              color: '#475569',
              lineHeight: 1.1,
              letterSpacing: '0.02em',
              textTransform: 'uppercase',
              mt: '0.5mm'
            }}
          >
            Banque de Développement Local - BDL
          </Typography>

          {/* 4. EN BAS : REGISTRED / STATUT */}
          <Box sx={{ my: '1mm' }}>
            <Box
              sx={{
                display: 'inline-block',
                bgcolor: guest.guestType === 'VIP' ? '#fef3c7' : '#fcf4ff',
                color: guest.guestType === 'VIP' ? '#92400e' : '#722083',
                border: guest.guestType === 'VIP' ? '1px solid #fde68a' : '1px solid #f0d6f7',
                fontSize: '7pt',
                fontWeight: 800,
                px: '10px',
                py: '2px',
                borderRadius: '4px',
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
              }}
            >
              {guestStatusText}
            </Box>
          </Box>

          {/* 5. EN BAS : NOM PRÉNOM */}
          <Box sx={{ width: '100%', px: '1mm', my: '1mm' }}>
            <Typography
              sx={{
                fontSize: '11.5pt',
                fontWeight: 900,
                color: '#1e0824',
                lineHeight: 1.15,
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
                  fontSize: '10.5pt',
                  fontWeight: 700,
                  color: '#475569',
                  lineHeight: 1.15,
                  wordBreak: 'break-word',
                  textTransform: 'capitalize',
                  mt: '1px'
                }}
              >
                {guest.firstName}
              </Typography>
            )}
          </Box>

          {/* 6. PUIS : NOMBRE D'ACTIONS */}
          {guest.numberOfShares > 0 ? (
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: '#fffbeb',
                border: '1px solid #fde68a',
                color: '#b45309',
                px: '8px',
                py: '2px',
                borderRadius: '4px',
                fontSize: '7.5pt',
                fontWeight: 800,
                letterSpacing: '0.02em',
                my: '0.5mm'
              }}
            >
              <span>{guest.numberOfShares.toLocaleString('fr-FR')} ACTIONS</span>
            </Box>
          ) : (
            <Box sx={{ height: '4px' }} />
          )}

          {/* 7. PUIS : LA RÉFÉRENCE + QR CODE */}
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              borderTop: '1px solid #f1e5f5',
              pt: '1.5mm',
              mt: '1mm'
            }}
          >
            {/* QR Code */}
            <Box sx={{ my: '1mm' }}>
              <QRCodeSVG
                value={qrData}
                size={48}
                level="M"
                includeMargin={false}
                fgColor="#1e0824"
              />
            </Box>

            {/* Référence */}
            <Typography
              sx={{
                fontSize: '8.5pt',
                fontWeight: 900,
                color: '#722083',
                letterSpacing: '0.05em',
                fontFamily: 'monospace'
              }}
            >
              {guest.refId}
            </Typography>

            {/* Mention Footer */}
            <Typography sx={{ fontSize: '5pt', color: '#94a3b8', fontWeight: 600, mt: '1px' }}>
              {new Date().toLocaleDateString('fr-FR')} • EL-MOULTAKA APP
            </Typography>
          </Box>
        </Paper>
      </Box>
    </>
  );
}
