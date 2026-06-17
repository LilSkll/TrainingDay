/**
 * Каркас страницы: верхняя навигация + контейнер + подвал.
 *  Все экраны оборачивают свой контент в <PageShell>.
 */
import { Box, Container } from '@mui/material';
import type { ReactNode } from 'react';
import Footer from './Footer';
import NavBar from './NavBar';

interface Props {
  children: ReactNode;
  /** Максимальная ширина контейнера. По умолчанию lg. */
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
}

export default function PageShell({ children, maxWidth = 'lg' }: Props) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
      }}
    >
      <NavBar />
      <Box component="main" sx={{ flexGrow: 1, py: { xs: 3, md: 5 } }}>
        <Container maxWidth={maxWidth}>{children}</Container>
      </Box>
      <Footer />
    </Box>
  );
}
