/**
 * Главная страница.
 *  - Hero-блок с названием, подзаголовком и кнопкой «Создать программу».
 *  - Карточки возможностей (Notion/Apple Fitness vibe).
 *  - Подсказка про хранение данных локально.
 */
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ChatIcon from '@mui/icons-material/Chat';
import InsightsIcon from '@mui/icons-material/Insights';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Link from 'next/link';
import PageShell from '@/components/layout/PageShell';
import { APP_NAME, APP_TAGLINE } from '@/lib/constants';

const FEATURES = [
  {
    icon: <AutoAwesomeIcon color="primary" />,
    title: 'AI-программа под вас',
    text: 'Учитывает цель, уровень, место тренировок, оборудование и травмы.',
  },
  {
    icon: <InsightsIcon color="primary" />,
    title: 'Анализ тренировки',
    text: 'Подскажет, увеличить вес, уменьшить или оставить — по самочувствию.',
  },
  {
    icon: <ChatIcon color="primary" />,
    title: 'AI-тренер в чате',
    text: 'Адаптирует программу под ситуацию: болит плечо, нет времени, только гантели.',
  },
  {
    icon: <TrendingUpIcon color="primary" />,
    title: 'Отслеживание прогресса',
    text: 'Графики изменения веса тела и рабочих весов по упражнениям.',
  },
  {
    icon: <MenuBookIcon color="primary" />,
    title: 'Библиотека упражнений',
    text: 'Каждое упражнение — с описанием, техникой и изображением.',
  },
  {
    icon: <LockOutlinedIcon color="primary" />,
    title: 'Без регистрации',
    text: 'Данные хранятся локально в браузере. Ничего никуда не уходит.',
  },
];

export default function HomePage() {
  return (
    <PageShell maxWidth="lg">
      {/* ---------- HERO ---------- */}
      <Box
        className="hero-gradient"
        sx={{
          borderRadius: 4,
          px: { xs: 3, md: 8 },
          py: { xs: 6, md: 10 },
          textAlign: 'center',
        }}
      >
        <Chip
          label="Персональный ИИ-тренер"
          color="primary"
          variant="outlined"
          sx={{ mb: 3, fontWeight: 700 }}
        />
        <Typography
          variant="h2"
          component="h1"
          fontWeight={800}
          gutterBottom
          sx={{
            background:
              'linear-gradient(90deg, #4f46e5 0%, #0ea5e9 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {APP_NAME}
        </Typography>
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ maxWidth: 720, mx: 'auto', mb: 5, fontWeight: 500 }}
        >
          {APP_TAGLINE}
        </Typography>

        <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap" useFlexGap>
          <Link href="/survey" passHref legacyBehavior>
            <Button
              component="a"
              size="large"
              variant="contained"
              endIcon={<ArrowForwardIcon />}
            >
              Создать программу
            </Button>
          </Link>
          <Link href="/library" passHref legacyBehavior>
            <Button component="a" size="large" variant="outlined">
              Библиотека упражнений
            </Button>
          </Link>
        </Stack>
      </Box>

      {/* ---------- FEATURES ---------- */}
      <Box sx={{ mt: 8 }}>
        <Typography variant="h5" fontWeight={800} sx={{ mb: 3 }}>
          Что умеет тренер
        </Typography>
        <Grid container spacing={3}>
          {FEATURES.map((f) => (
            <Grid item xs={12} sm={6} md={4} key={f.title}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ mb: 1.5 }}>{f.icon}</Box>
                  <Typography variant="h6" gutterBottom>
                    {f.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {f.text}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* ---------- CTA STRIP ---------- */}
      <Card
        sx={{
          mt: 8,
          background:
            'linear-gradient(120deg, rgba(79,70,229,.08), rgba(14,165,233,.08))',
        }}
      >
        <CardContent
          sx={{
            p: { xs: 3, md: 5 },
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 3,
          }}
        >
          <Box>
            <Typography variant="h5" fontWeight={800}>
              Готовы начать?
            </Typography>
            <Typography color="text.secondary">
              Заполните короткую анкету — и получите персональную программу за минуту.
            </Typography>
          </Box>
          <Link href="/survey" passHref legacyBehavior>
            <Button
              component="a"
              size="large"
              variant="contained"
              endIcon={<ArrowForwardIcon />}
            >
              Создать программу
            </Button>
          </Link>
        </CardContent>
      </Card>
    </PageShell>
  );
}
