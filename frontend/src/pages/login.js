import React, { useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  Avatar,
  Divider,
  Chip
} from '@mui/material';
import { Sparkles, Lock, User, Monitor, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const router = useRouter();
  const { login, setWorkstation } = useAuth();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [workstationInput, setWorkstationInput] = useState('Poste Principal A');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (workstationInput.trim()) {
        setWorkstation(workstationInput.trim());
      }
      await login(username, password);
      router.push('/dashboard');
    } catch (err) {
      console.error('Erreur login:', err);
      setError(err.response?.data?.error || 'Échec de connexion. Vérifiez vos identifiants.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (u, p, ws) => {
    setUsername(u);
    setPassword(p);
    setWorkstationInput(ws);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f1f5f9',
        p: 2,
        backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)',
        backgroundSize: '24px 24px'
      }}
    >
      <Card
        sx={{
          maxWidth: 440,
          width: '100%',
          p: { xs: 2, sm: 3 },
          borderRadius: 3.5,
          boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.1)',
          border: '1px solid #e2e8f0',
          bgcolor: '#ffffff'
        }}
      >
        <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
          {/* Logo & Header */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Avatar
              sx={{
                bgcolor: '#722083',
                width: 52,
                height: 52,
                borderRadius: '14px',
                mx: 'auto',
                mb: 1.5,
                boxShadow: '0 8px 16px rgba(114, 32, 131, 0.3)'
              }}
            >
              <Sparkles size={26} color="#fdb700" />
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e0824', letterSpacing: '-0.02em' }}>
              EL-MOULTAKA <span style={{ color: '#722083' }}>APP</span>
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5, fontWeight: 500 }}>
              Plateforme d'Accueil & Gestion des Invités
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Nom d'utilisateur"
                required
                fullWidth
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                InputProps={{
                  startAdornment: <User size={18} color="#94a3b8" style={{ marginRight: 8 }} />
                }}
              />

              <TextField
                label="Mot de passe"
                type="password"
                required
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  startAdornment: <Lock size={18} color="#94a3b8" style={{ marginRight: 8 }} />
                }}
              />

              <TextField
                label="Poste / Guichet d'accueil"
                fullWidth
                value={workstationInput}
                onChange={(e) => setWorkstationInput(e.target.value)}
                placeholder="ex: Guichet A - Entrée Nord"
                InputProps={{
                  startAdornment: <Monitor size={18} color="#94a3b8" style={{ marginRight: 8 }} />
                }}
                helperText="Identifie ce terminal pour le suivi en direct"
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={isLoading}
                endIcon={<ArrowRight size={18} />}
                sx={{
                  py: 1.3,
                  mt: 1,
                  fontSize: '0.95rem',
                  fontWeight: 700
                }}
              >
                {isLoading ? 'Connexion en cours...' : 'Se connecter'}
              </Button>
            </Box>
          </form>

          {/* Quick Demo Access */}
          <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #f1f5f9' }}>
            <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', textAlign: 'center', mb: 1.5, fontWeight: 600 }}>
              COMPTES DE DÉMONSTRATION
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => handleQuickFill('admin', 'admin123', 'Poste Superviseur')}
                sx={{ fontSize: '0.75rem', borderColor: '#e2e8f0', color: '#334155' }}
              >
                Admin (admin123)
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => handleQuickFill('agent1', 'agent123', 'Guichet 1 - Hall')}
                sx={{ fontSize: '0.75rem', borderColor: '#e2e8f0', color: '#334155' }}
              >
                Agent 1 (agent123)
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => handleQuickFill('agent2', 'agent123', 'Guichet 2 - VIP')}
                sx={{ fontSize: '0.75rem', borderColor: '#e2e8f0', color: '#334155' }}
              >
                Agent 2 (agent123)
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
