import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { QRCodeSVG } from 'qrcode.react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Chip,
  Paper
} from '@mui/material';
import { Printer, ArrowLeft, CheckCircle } from 'lucide-react';
import api from '../../services/api';

export default function BadgePrintPage() {
  const router = useRouter();
  const { refId, autoPrint } = router.query;

  const [guest, setGuest] = useState(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    if (guest && autoPrint === 'true') {
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [guest, autoPrint]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', bgcolor: '#f8fafc' }}>
        <CircularProgress sx={{ color: '#2596be' }} />
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
    event: guest.event?.name || 'Event'
  });

  return (
    <>
      <Head>
        <title>Badge — {guest.lastNameOrCompany} ({guest.refId})</title>
        <style>{`
          @media print {
            @page {
              size: 4.5cm 6cm;
              margin: 0;
            }
            html, body {
              width: 4.5cm !important;
              height: 6cm !important;
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
              width: 4.5cm !important;
              height: 6cm !important;
              border-radius: 0 !important;
              margin: 0 !important;
              padding: 6px !important;
            }
          }
        `}</style>
      </Head>

      {/* Screen Controls Header (Hidden during print) */}
      <Box
        className="no-print"
        sx={{
          bgcolor: '#0f172a',
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: '#ffffff'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => window.close()}
            startIcon={<ArrowLeft size={16} />}
            sx={{ color: '#ffffff', borderColor: '#334155' }}
          >
            Fermer
          </Button>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Aperçu Badge Officiel (Format Réel 4.5 × 6 cm)
          </Typography>
        </Box>

        <Button
          variant="contained"
          onClick={() => window.print()}
          startIcon={<Printer size={18} />}
          sx={{ bgcolor: '#2596be', fontWeight: 700 }}
        >
          Lancer l'impression
        </Button>
      </Box>

      {/* Badge Viewport Container */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 'calc(100vh - 70px)',
          bgcolor: '#f1f5f9',
          p: 2
        }}
      >
        {/* Physical Badge Layout: EXACT 4.5cm x 6cm */}
        <Paper
          className="badge-card badge-print-container"
          elevation={4}
          sx={{
            width: '4.5cm',
            height: '6cm',
            bgcolor: '#ffffff',
            borderRadius: '6px',
            border: '1px solid #e2e8f0',
            p: '6px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            textAlign: 'center',
            boxSizing: 'border-box',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Top Decorative Band */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '5px',
              bgcolor: '#2596be'
            }}
          />

          {/* Event Header */}
          <Box sx={{ pt: '4px' }}>
            <Typography
              sx={{
                fontSize: '7.5pt',
                fontWeight: 800,
                color: '#0f172a',
                lineHeight: 1.1,
                textTransform: 'uppercase',
                letterSpacing: '0.02em'
              }}
            >
              {guest.event?.name || 'ASSEMBLÉE GÉNÉRALE 2026'}
            </Typography>
            <Typography sx={{ fontSize: '5.5pt', color: '#64748b', fontWeight: 600, mt: '1px' }}>
              {guest.event?.organizer || 'ACCUEIL OFFICIEL'}
            </Typography>
          </Box>

          {/* Category Chip */}
          <Box sx={{ my: '2px' }}>
            <Box
              sx={{
                display: 'inline-block',
                bgcolor: guest.guestType === 'VIP' ? '#fef3c7' : '#e0f2fe',
                color: guest.guestType === 'VIP' ? '#92400e' : '#0369a1',
                border: guest.guestType === 'VIP' ? '1px solid #fde68a' : '1px solid #bae6fd',
                fontSize: '6.5pt',
                fontWeight: 800,
                px: '6px',
                py: '1px',
                borderRadius: '3px',
                textTransform: 'uppercase'
              }}
            >
              {guest.guestType === 'VIP' ? '★ VIP' : guest.guestType || 'INVITÉ'}
            </Box>
          </Box>

          {/* Guest Identity Name */}
          <Box sx={{ px: '2px' }}>
            <Typography
              sx={{
                fontSize: '9.5pt',
                fontWeight: 800,
                color: '#0f172a',
                lineHeight: 1.15,
                wordBreak: 'break-word',
                textTransform: 'uppercase'
              }}
            >
              {guest.lastNameOrCompany}
            </Typography>
            {guest.firstName && (
              <Typography sx={{ fontSize: '8.5pt', fontWeight: 600, color: '#334155', lineHeight: 1.1 }}>
                {guest.firstName}
              </Typography>
            )}
            {guest.numberOfShares > 0 && (
              <Typography sx={{ fontSize: '6pt', color: '#2596be', fontWeight: 700, mt: '2px' }}>
                {guest.numberOfShares.toLocaleString('fr-FR')} ACTIONS
              </Typography>
            )}
          </Box>

          {/* QR Code */}
          <Box sx={{ display: 'flex', justifyContent: 'center', my: '2px' }}>
            <QRCodeSVG
              value={qrData}
              size={56}
              level="M"
              includeMargin={false}
              fgColor="#0f172a"
            />
          </Box>

          {/* Footer Ref ID & Date */}
          <Box sx={{ borderTop: '1px solid #f1f5f9', pt: '3px' }}>
            <Typography sx={{ fontSize: '7.5pt', fontWeight: 800, color: '#2596be', letterSpacing: '0.04em' }}>
              {guest.refId}
            </Typography>
            <Typography sx={{ fontSize: '5pt', color: '#94a3b8', fontWeight: 500 }}>
              {new Date().toLocaleDateString('fr-FR')} • NVOTI EVENT
            </Typography>
          </Box>
        </Paper>
      </Box>
    </>
  );
}
