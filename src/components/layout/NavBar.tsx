/**
 * Верхняя панель навигации.
 *  - Логотип-надпись «AI Fitness Coach».
 *  - Переключатель светлой/тёмной темы.
 *  - На мобильных — выезжающее Drawer-меню.
 */
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import {
  AppBar,
  Box,
  Button,
  Container,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { APP_NAME } from '@/lib/constants';
import { useThemeMode } from '@/theme/ThemeContext';

/** Основные разделы приложения. */
export const NAV_ITEMS: Array<{ href: string; label: string }> = [
  { href: '/', label: 'Главная' },
  { href: '/survey', label: 'Анкета' },
  { href: '/program', label: 'Программа' },
  { href: '/analysis', label: 'Анализ' },
  { href: '/trainer', label: 'AI-Тренер' },
  { href: '/progress', label: 'Прогресс' },
  { href: '/library', label: 'Библиотека' },
];

export default function NavBar() {
  const router = useRouter();
  const { mode, toggle } = useThemeMode();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === '/' ? router.pathname === '/' : router.pathname.startsWith(href);

  return (
    <AppBar
      position="sticky"
      sx={{
        backdropFilter: 'saturate(180%) blur(8px)',
        backgroundColor: (t) =>
          t.palette.mode === 'light'
            ? 'rgba(255,255,255,.75)'
            : 'rgba(11,15,26,.7)',
        borderBottom: (t) => `1px solid ${t.palette.divider}`,
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ gap: 2 }}>
          {/* Лого */}
          <Link href="/" passHref legacyBehavior>
            <Button
              component="a"
              startIcon={<FitnessCenterIcon />}
              sx={{ color: 'text.primary', px: 0, fontWeight: 800 }}
            >
              <Typography variant="h6" fontWeight={800} noWrap>
                {APP_NAME}
              </Typography>
            </Button>
          </Link>

          <Box sx={{ flexGrow: 1 }} />

          {/* Десктоп-меню */}
          <Stack
            direction="row"
            spacing={0.5}
            sx={{ display: { xs: 'none', md: 'flex' } }}
          >
            {NAV_ITEMS.map((item) => (
              <Link key={item.href} href={item.href} passHref legacyBehavior>
                <Button
                  component="a"
                  color={isActive(item.href) ? 'primary' : 'inherit'}
                  variant={isActive(item.href) ? 'outlined' : 'text'}
                  size="small"
                >
                  {item.label}
                </Button>
              </Link>
            ))}
          </Stack>

          {/* Тема + бургер */}
          <IconButton onClick={toggle} aria-label="Сменить тему">
            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
          <IconButton
            onClick={() => setOpen(true)}
            sx={{ display: { xs: 'inline-flex', md: 'none' } }}
            aria-label="Меню"
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </Container>

      {/* Мобильный drawer */}
      <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
        <Box sx={{ width: 260, pt: 2 }}>
          <List>
            {NAV_ITEMS.map((item) => (
              <Link key={item.href} href={item.href} passHref legacyBehavior>
                <ListItemButton
                  component="a"
                  selected={isActive(item.href)}
                  onClick={() => setOpen(false)}
                >
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </Link>
            ))}
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
}
