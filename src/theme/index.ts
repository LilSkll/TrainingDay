/**
 * Тема приложения (MUI). Светлая и тёмная.
 *
 *  Стиль: современный, минималистичный, «Notion + Apple Fitness».
 *  - скруглённые углы,
 *  - мягкие тени,
 *  - фирменный индиго-акцент.
 */
import { createTheme } from '@mui/material/styles';

const BRAND = '#4f46e5';

/** Базовые общие опции для обеих тем. */
function base(palette: 'light' | 'dark') {
  return createTheme({
    palette: {
      mode: palette,
      primary: { main: BRAND },
      secondary: { main: '#0ea5e9' },
      background: {
        default: palette === 'light' ? '#f7f8fb' : '#0b0f1a',
        paper: palette === 'light' ? '#ffffff' : '#141a2a',
      },
    },
    shape: { borderRadius: 14 },
    typography: {
      fontFamily:
        'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      h1: { fontWeight: 800, letterSpacing: '-0.02em' },
      h2: { fontWeight: 800, letterSpacing: '-0.02em' },
      h3: { fontWeight: 700, letterSpacing: '-0.01em' },
      h4: { fontWeight: 700 },
      h5: { fontWeight: 700 },
      h6: { fontWeight: 700 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: { borderRadius: 999 },
          sizeLarge: { paddingInline: 28, paddingBlock: 12, fontSize: '1rem' },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            boxShadow:
              palette === 'light'
                ? '0 1px 2px rgba(16,24,40,.04), 0 8px 24px rgba(16,24,40,.06)'
                : '0 1px 2px rgba(0,0,0,.4), 0 8px 24px rgba(0,0,0,.45)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: { root: { backgroundImage: 'none' } },
      },
      MuiChip: {
        styleOverrides: { root: { fontWeight: 600 } },
      },
      MuiAppBar: {
        defaultProps: { elevation: 0, color: 'transparent' },
      },
    },
  });
}

export const lightTheme = base('light');
export const darkTheme = base('dark');
