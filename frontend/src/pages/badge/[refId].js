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
import { Printer, ArrowLeft, Sparkles } from 'lucide-react';
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
              size: 102mm 65mm landscape;
              margin: 0;
            }
            html, body {
              width: 102mm !important;
              height: 65mm !important;
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
              width: 102mm !important;
              height: 65mm !important;
              min-width: 102mm !important;
              max-width: 102mm !important;
              min-height: 65mm !important;
              max-height: 65mm !important;
              border-radius: 0 !important;
              margin: 0 !important;
              padding: 4mm 6mm !important;
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
            Aperçu Badge Officiel Horizontal (102 mm × 65 mm)
          </Typography>
        </Box>

        <Button
          variant="contained"
          onClick={() => window.print()}
          startIcon={<Printer size={18} />}
          sx={{ bgcolor: '#722083', '&:hover': { bgcolor: '#591766' }, fontWeight: 700 }}
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
          bgcolor: '#fbf9fc',
          p: 3
        }}
      >
        {/* Physical Badge Layout: EXACT 102mm (10.2cm) x 65mm (6.5cm) */}
        <Paper
          className="badge-card badge-print-container"
          elevation={4}
          sx={{
            width: '102mm',
            height: '65mm',
            minWidth: '102mm',
            maxWidth: '102mm',
            minHeight: '65mm',
            maxHeight: '65mm',
            bgcolor: '#ffffff',
            borderRadius: '8px',
            border: '1px solid #f0e6f2',
            p: '4mm 6mm',
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
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', pt: '1mm', mb: '1mm' }}>
            <img
              src="/logo-acronyme.png"
              alt="Logo BDL"
              style={{
                height: '14mm',
                maxWidth: '55mm',
                objectFit: 'contain'
              }}
              onError={(e) => {
                // Fallback if image path differs
                e.target.src = '/LOGO-ACRONYME-.png';
              }}
            />
          </Box>

          {/* 2. JUSTE EN BAS : NOM ÉVÉNEMENT */}
          <Typography
            sx={{
              fontSize: '8.5pt',
              fontWeight: 800,
              color: '#722083',
              lineHeight: 1.15,
              textTransform: 'uppercase',
              letterSpacing: '0.03em',
              maxWidth: '90mm',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {guest.event?.name || 'ASSEMBLÉE GÉNÉRALE 2026'}
          </Typography>

          {/* 3. EN BAS : BANQUE DE DÉVELOPPEMENT LOCAL - BDL */}
          <Typography
            sx={{
              fontSize: '6.5pt',
              fontWeight: 700,
              color: '#475569',
              lineHeight: 1.1,
              letterSpacing: '0.02em',
              textTransform: 'uppercase'
            }}
          >
            Banque de Développement Local - BDL
          </Typography>

          {/* 4. EN BAS : STATUT / REGISTERED */}
          <Box sx={{ my: '1mm' }}>
            <Box
              sx={{
                display: 'inline-block',
                bgcolor: guest.guestType === 'VIP' ? '#fef3c7' : '#fcf4ff',
                color: guest.guestType === 'VIP' ? '#92400e' : '#722083',
                border: guest.guestType === 'VIP' ? '1px solid #fde68a' : '1px solid #f0d6f7',
                fontSize: '6.5pt',
                fontWeight: 800,
                px: '8px',
                py: '1.5px',
                borderRadius: '4px',
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
              }}
            >
              {guestStatusText}
            </Box>
          </Box>

          {/* 5. EN BAS : NOM & PRÉNOM (Très lisible) */}
          <Box sx={{ width: '100%', px: '2mm', my: '0.5mm' }}>
            <Typography
              sx={{
                fontSize: '12pt',
                fontWeight: 900,
                color: '#1e0824',
                lineHeight: 1.15,
                wordBreak: 'break-word',
                textTransform: 'uppercase',
                letterSpacing: '-0.01em'
              }}
            >
              {guest.lastNameOrCompany} {guest.firstName ? guest.firstName : ''}
            </Typography>
          </Box>

          {/* 6. PUIS : NOMBRE D'ACTIONS */}
          {guest.numberOfShares > 0 ? (
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                bgcolor: '#fffbeb',
                border: '1px solid #fde68a',
                color: '#b45309',
                px: '7px',
                py: '1px',
                borderRadius: '3px',
                fontSize: '7pt',
                fontWeight: 800,
                letterSpacing: '0.02em'
              }}
            >
              <span>{guest.numberOfShares.toLocaleString('fr-FR')} ACTIONS</span>
            </Box>
          ) : (
            <Box sx={{ height: '4px' }} />
          )}

          {/* 7. PUIS : LA RÉFÉRENCE & QR CODE EN BAS */}
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px solid #f1e5f5',
              pt: '1.5mm',
              mt: '1mm'
            }}
          >
            {/* Réf ID */}
            <Typography sx={{ fontSize: '8pt', fontWeight: 900, color: '#722083', letterSpacing: '0.05em', fontFamily: 'monospace' }}>
              {guest.refId}
            </Typography>

            {/* Date & Mention */}
            <Typography sx={{ fontSize: '5.5pt', color: '#94a3b8', fontWeight: 600 }}>
              {new Date().toLocaleDateString('fr-FR')} • EL-MOULTAKA APP
            </Typography>

            {/* Compact QR Code */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <QRCodeSVG
                value={qrData}
                size={32}
                level="M"
                includeMargin={false}
                fgColor="#1e0824"
              />
            </Box>
          </Box>
        </Paper>
      </Box>
    </>
  );
}
