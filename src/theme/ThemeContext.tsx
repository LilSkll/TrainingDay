/**
 * Контекст темы (light / dark / system).
 *  - Значение сохраняется в LocalStorage.
 *  - При первом рендере читаем сохранённое значение и выставляем класс
 *    на <html>, чтобы Tailwind dark: тоже работал синхронно с MUI.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { CssBaseline, ThemeProvider as MuiThemeProvider } from '@mui/material';
import { lightTheme, darkTheme } from '@/theme';
import { STORAGE_KEYS } from '@/lib/constants';

type Mode = 'light' | 'dark';

interface ThemeCtx {
  mode: Mode;
  toggle: () => void;
  setMode: (m: Mode) => void;
}

const Ctx = createContext<ThemeCtx | null>(null);

/** Применяет класс `dark` на <html> — для Tailwind и любых CSS. */
function syncHtmlClass(mode: Mode) {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', mode === 'dark');
  document.documentElement.style.colorScheme = mode;
}

/** Считывает стартовое значение темы (SSR-safe). */
function readInitialMode(): Mode {
  if (typeof window === 'undefined') return 'light';
  const stored = window.localStorage.getItem(STORAGE_KEYS.theme);
  if (stored === 'light' || stored === 'dark') return stored;
  // по умолчанию следуем системной настройке
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<Mode>('light');

  // На клиенте один раз синхронизируем с сохранённым значением.
  useEffect(() => {
    const m = readInitialMode();
    setModeState(m);
    syncHtmlClass(m);
  }, []);

  const setMode = useCallback((m: Mode) => {
    setModeState(m);
    syncHtmlClass(m);
    try {
      window.localStorage.setItem(STORAGE_KEYS.theme, m);
    } catch {
      /* ignore */
    }
  }, []);

  const toggle = useCallback(
    () => setMode(mode === 'light' ? 'dark' : 'light'),
    [mode, setMode],
  );

  const value = useMemo(() => ({ mode, toggle, setMode }), [mode, toggle, setMode]);

  return (
    <Ctx.Provider value={value}>
      <MuiThemeProvider theme={mode === 'dark' ? darkTheme : lightTheme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </Ctx.Provider>
  );
}

export function useThemeMode(): ThemeCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useThemeMode должен использоваться внутри AppThemeProvider');
  return ctx;
}
