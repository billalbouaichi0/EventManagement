import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#722083',
      light: '#9133a4',
      dark: '#531560',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#fdb700',
      light: '#fecb43',
      dark: '#d99b00',
      contrastText: '#1e0824'
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
      contrastText: '#ffffff'
    },
    warning: {
      main: '#fdb700',
      light: '#fecb43',
      dark: '#d99b00',
      contrastText: '#1e0824'
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
      contrastText: '#ffffff'
    },
    info: {
      main: '#722083',
      light: '#9133a4',
      dark: '#531560'
    },
    background: {
      default: '#fbf9fc',
      paper: '#ffffff'
    },
    text: {
      primary: '#1e0824',
      secondary: '#64748b'
    },
    divider: '#f0e6f2'
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
            boxShadow: '0 4px 12px rgba(114, 32, 131, 0.25)'
          }
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #722083 0%, #531560 100%)',
          color: '#ffffff',
          '&:hover': {
            background: 'linear-gradient(135deg, #842898 0%, #461151 100%)'
          }
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #fdb700 0%, #e09f00 100%)',
          color: '#1e0824',
          fontWeight: 700,
          '&:hover': {
            background: 'linear-gradient(135deg, #ffc226 0%, #c98e00 100%)'
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
            borderColor: '#722083'
          },
          '&.Mui-focused fieldset': {
            borderColor: '#722083',
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
