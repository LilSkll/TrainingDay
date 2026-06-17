/**
 * Подвал сайта. Минималистичный, с подсказкой про локальное хранение данных.
 */
import { Box, Container, Divider, Stack, Typography } from '@mui/material';
import { APP_NAME } from '@/lib/constants';

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        mt: 8,
        py: 4,
        borderTop: (t) => `1px solid ${t.palette.divider}`,
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={1}>
          <Typography variant="subtitle2" fontWeight={800}>
            {APP_NAME}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Все данные хранятся локально в вашем браузере (LocalStorage).
            Внешние базы данных и регистрация на MVP не используются.
          </Typography>
          <Divider sx={{ my: 1 }} />
          <Typography variant="caption" color="text.secondary">
            © {new Date().getFullYear()} {APP_NAME}. Образовательный проект.
            Перед началом тренировок проконсультируйтесь со специалистом.
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}
