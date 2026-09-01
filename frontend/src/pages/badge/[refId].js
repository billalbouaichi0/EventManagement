import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { QRCodeSVG } from 'qrcode.react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Paper,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import { Printer, ArrowLeft, RotateCw } from 'lucide-react';
import api from '../../services/api';

export default function BadgePrintPage() {
  const router = useRouter();
  const { refId, autoPrint, rot } = router.query;

  const [guest, setGuest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rotation, setRotation] = useState('90'); // '90' (default rotated 90deg), '-90', '0'

  useEffect(() => {
    if (rot && ['90', '-90', '0', '270'].includes(rot)) {
      setRotation(rot === '270' ? '-90' : rot);
    }
  }, [rot]);

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
      }, 600);
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

  const isRotated = rotation !== '0';
  const pageSize = isRotated ? '65mm 102mm' : '102mm 65mm';
  const pageWrapWidth = isRotated ? '65mm' : '102mm';
  const pageWrapHeight = isRotated ? '102mm' : '65mm';

  return (
    <>
      <Head>
        <title>Badge — {guest.lastNameOrCompany} ({guest.refId})</title>
        <style>{`
          @media print {
            @page {
              size: ${pageSize};
              margin: 0;
            }
            html, body {
              width: ${pageWrapWidth} !important;
              height: ${pageWrapHeight} !important;
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
            .badge-print-wrapper {
              width: ${pageWrapWidth} !important;
              height: ${pageWrapHeight} !important;
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
              width: 102mm !important;
              height: 65mm !important;
              min-width: 102mm !important;
              max-width: 102mm !important;
              min-height: 65mm !important;
              max-height: 65mm !important;
              border-radius: 0 !important;
              margin: 0 !important;
              padding: 3.5mm 5mm !important;
              transform: ${rotation === '0' ? 'none' : `rotate(${rotation}deg)`} !important;
              transform-origin: center center !important;
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
            Aperçu Badge — Largeur 102 mm × Hauteur 65 mm (Pivote {rotation}°)
          </Typography>
        </Box>

        {/* Orientation Switcher for Thermal Printers */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography variant="caption" sx={{ color: '#cbd5e1', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <RotateCw size={14} /> Rotation :
          </Typography>
          <ToggleButtonGroup
            value={rotation}
            exclusive
            onChange={(e, val) => val && setRotation(val)}
            size="small"
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              '& .MuiToggleButton-root': {
                color: '#e2e8f0',
                py: 0.5,
                px: 1.5,
                fontSize: '0.75rem',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                '&.Mui-selected': {
                  bgcolor: '#fdb700',
                  color: '#1e0824',
                  fontWeight: 800,
                  '&:hover': { bgcolor: '#fecb43' }
                }
              }
            }}
          >
            <ToggleButton value="90">90° (Défaut)</ToggleButton>
            <ToggleButton value="-90">-90° (270°)</ToggleButton>
            <ToggleButton value="0">0° (Horizontal direct)</ToggleButton>
          </ToggleButtonGroup>

          <Button
            variant="contained"
            onClick={() => window.print()}
            startIcon={<Printer size={18} />}
            sx={{ bgcolor: '#722083', '&:hover': { bgcolor: '#591766' }, fontWeight: 700, ml: 1 }}
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
          minHeight: 'calc(100vh - 80px)',
          bgcolor: '#fbf9fc',
          p: 3
        }}
      >
        <Box
          className="badge-print-wrapper"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 1
          }}
        >
          {/* Physical Badge Layout: EXACT 102mm x 65mm with 90° rotation */}
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
              p: '3.5mm 5mm',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'center',
              textAlign: 'center',
              boxSizing: 'border-box',
              position: 'relative',
              overflow: 'hidden',
              transform: rotation === '0' ? 'none' : `rotate(${rotation}deg)`,
              transformOrigin: 'center center',
              transition: 'transform 0.2s ease'
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
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', pt: '1mm', mb: '0.5mm' }}>
              <img
                src="/logo-acronyme.png"
                alt="Logo BDL"
                style={{
                  height: '13mm',
                  maxWidth: '52mm',
                  objectFit: 'contain'
                }}
                onError={(e) => {
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
                maxWidth: '92mm',
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
            <Box sx={{ my: '0.8mm' }}>
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

            {/* 5. EN BAS : NOM & PRÉNOM (Très grand et très lisible) */}
            <Box sx={{ width: '100%', px: '2mm', my: '0.5mm' }}>
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
              <Box sx={{ height: '3px' }} />
            )}

            {/* 7. PUIS : LA RÉFÉRENCE & QR CODE EN BAS */}
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: '1px solid #f1e5f5',
                pt: '1.2mm',
                mt: '0.8mm'
              }}
            >
              {/* Réf ID */}
              <Typography sx={{ fontSize: '8pt', fontWeight: 900, color: '#722083', letterSpacing: '0.05em', fontFamily: 'monospace' }}>
                {guest.refId}
              </Typography>

              {/* Mention */}
              <Typography sx={{ fontSize: '5.5pt', color: '#94a3b8', fontWeight: 600 }}>
                {new Date().toLocaleDateString('fr-FR')} • EL-MOULTAKA APP
              </Typography>

              {/* Compact QR Code */}
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <QRCodeSVG
                  value={qrData}
                  size={30}
                  level="M"
                  includeMargin={false}
                  fgColor="#1e0824"
                />
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>
    </>
  );
}
