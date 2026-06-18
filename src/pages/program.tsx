/**
 * Экран «Программа».
 *  Показывает текущую сгенерированную программу с разбивкой по дням,
 *  подтягивает изображения упражнений из библиотеки.
 *  Кнопки экспорта: TXT и PDF.
 */
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import Link from 'next/link';
import PageHeader, { HeaderButton } from '@/components/common/PageHeader';
import PageShell from '@/components/layout/PageShell';
import ExerciseCard from '@/components/program/ExerciseCard';
import { useCurrentProgram } from '@/hooks/useStorage';
import { DURATION_LABELS, SPLIT_LABELS } from '@/lib/constants';
import { downloadPdf, downloadTxt } from '@/lib/export/programExport';

export default function ProgramPage() {
  const { program } = useCurrentProgram();

  // Нет программы — зовём заполнить анкету.
  if (!program) {
    return (
      <PageShell>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <AutoAwesomeIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Здесь появится ваша программа
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Сначала заполните анкету — AI составит персональный план тренировок.
            </Typography>
            <Link href="/survey" passHref legacyBehavior>
              <Button component="a" variant="contained" size="large">
                Заполнить анкету
              </Button>
            </Link>
          </CardContent>
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell maxWidth="lg">
      <PageHeader
        title={program.title}
        subtitle={program.summary}
        action={
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<DescriptionIcon />}
              onClick={() => downloadTxt(program)}
            >
              TXT
            </Button>
            <Button
              variant="outlined"
              startIcon={<PictureAsPdfIcon />}
              onClick={() => downloadPdf(program)}
            >
              PDF
            </Button>
          </Stack>
        }
      />

      {/* Мета-чипы */}
      <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap' }} useFlexGap>
        <Chip
          label={`Тренировок/нед: ${program.profileSnapshot.workoutsPerWeek}`}
          color="primary"
          variant="outlined"
        />
        <Chip
          label={`Цель: ${program.profileSnapshot.goal}`}
          variant="outlined"
        />
        <Chip
          label={`Уровень: ${program.profileSnapshot.experience}`}
          variant="outlined"
        />
        <Chip label={`Дней в плане: ${program.days.length}`} variant="outlined" />
        {program.profileSnapshot.workoutDuration && (
          <Chip
            label={`Длительность: ${DURATION_LABELS[program.profileSnapshot.workoutDuration]}`}
            variant="outlined"
          />
        )}
        {program.profileSnapshot.split && program.profileSnapshot.split !== 'auto' && (
          <Chip
            label={`Сплит: ${SPLIT_LABELS[program.profileSnapshot.split]}`}
            variant="outlined"
          />
        )}
        {program.profileSnapshot.sleepHours !== undefined && (
          <Chip
            label={`Сон: ${program.profileSnapshot.sleepHours} ч`}
            variant="outlined"
          />
        )}
        {program.profileSnapshot.stressLevel !== undefined && program.profileSnapshot.stressLevel >= 4 && (
          <Chip label={`Стресс: ${program.profileSnapshot.stressLevel}/5`} variant="outlined" color="warning" />
        )}
        <Chip
          label={`Источник: ${program.provider}`}
          variant="outlined"
          color={program.provider === 'mock' ? 'warning' : 'success'}
        />
      </Stack>

      <Stack spacing={4}>
        {program.days.map((day) => (
          <Card key={`day-${day.day}`} variant="outlined" sx={{ p: { xs: 2, md: 3 } }}>
            {/* Заголовок дня */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ sm: 'baseline' }}
              sx={{ mb: 3 }}
            >
              <Typography variant="h6" fontWeight={800}>
                День {day.day}
                {day.title && day.title !== `День ${day.day}` ? `. ${day.title}` : ''}
              </Typography>
              {day.focus && (
                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                  Фокус: {day.focus}
                </Typography>
              )}
            </Stack>

            {/* Упражнения дня с увеличенными интервалами */}
            <Stack spacing={2.5}>
              {day.exercises.map((ex, i) => (
                <ExerciseCard key={`${day.day}-${i}`} entry={ex} index={i} />
              ))}
            </Stack>
          </Card>
        ))}
      </Stack>

      <Divider sx={{ my: 4 }} />

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Link href="/survey" passHref legacyBehavior>
          <Button variant="contained">Сгенерировать заново</Button>
        </Link>
        <Link href="/analysis" passHref legacyBehavior>
          <Button variant="outlined">Проанализировать тренировку</Button>
        </Link>
      </Box>
    </PageShell>
  );
}
