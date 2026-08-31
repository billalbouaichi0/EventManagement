import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2596be',
      light: '#53b4d6',
      dark: '#1b7495',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#0f172a',
      light: '#334155',
      dark: '#020617',
      contrastText: '#ffffff'
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
      contrastText: '#ffffff'
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
      contrastText: '#ffffff'
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
      contrastText: '#ffffff'
    },
    info: {
      main: '#2596be',
      light: '#67e8f9',
      dark: '#0e7490'
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff'
    },
    text: {
      primary: '#0f172a',
      secondary: '#64748b'
    },
    divider: '#e2e8f0'
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: { fontWeight: 700, letterSpacing: '-0.02em' },
    h2: { fontWeight: 700, letterSpacing: '-0.02em' },
    h3: { fontWeight: 600, letterSpacing: '-0.01em' },
    h4: { fontWeight: 600, letterSpacing: '-0.01em' },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 500 },
    subtitle2: { fontWeight: 500 },
    body1: { fontSize: '0.925rem', lineHeight: 1.6 },
    body2: { fontSize: '0.85rem', lineHeight: 1.5 },
    button: { textTransform: 'none', fontWeight: 600, letterSpacing: '0.01em' }
  },
  shape: {
    borderRadius: 10
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 18px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(37, 150, 190, 0.2)'
          }
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #2596be 0%, #1b7495 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #2a9ec6 0%, #176582 100%)'
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(0, 0, 0, 0.02)',
          backgroundImage: 'none'
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none'
        },
        rounded: {
          borderRadius: 14
        }
      }
    },
    MuiTextField: {
      defaultProps: {
        size: 'small',
        variant: 'outlined'
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: '#ffffff',
          '& fieldset': {
            borderColor: '#e2e8f0'
          },
          '&:hover fieldset': {
            borderColor: '#2596be'
          },
          '&.Mui-focused fieldset': {
            borderColor: '#2596be',
            borderWidth: 2
          }
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 600,
          fontSize: '0.75rem'
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: '#f8fafc',
          color: '#475569',
          fontWeight: 600,
          borderBottom: '1px solid #e2e8f0'
        },
        root: {
          borderBottom: '1px solid #f1f5f9',
          padding: '12px 16px'
        }
      }
    }
  }
});

export default theme;
