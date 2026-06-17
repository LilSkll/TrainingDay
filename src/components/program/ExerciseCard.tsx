/**
 * Карточка одного упражнения внутри тренировочного дня.
 *  Показывает изображение (из библиотеки), подходы/повторения/отдых,
 *  технику, мышцы и комментарий тренера.
 */
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import ExerciseImage from '@/components/common/ExerciseImage';
import { formatRest } from '@/lib/constants';
import { getExerciseById } from '@/lib/exercises/service';
import type { ExerciseEntry } from '@/lib/types';

interface Props {
  entry: ExerciseEntry;
  index: number;
}

export default function ExerciseCard({ entry, index }: Props) {
  // Подтягиваем изображение из библиотеки по id.
  const lib = getExerciseById(entry.exerciseId);
  const image = lib?.image;

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          {/* Картинка */}
          <Box sx={{ flex: { sm: '0 0 200px' }, width: { xs: '100%', sm: 200 } }}>
            <ExerciseImage src={image} alt={entry.name} height={140} />
          </Box>

          {/* Контент */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" fontWeight={800}>
              {index + 1}. {entry.name}
            </Typography>

            {/* Метрики */}
            <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }} useFlexGap>
              <MetricChip label="Подходы" value={`${entry.sets}`} />
              <MetricChip label="Повторения" value={entry.reps} />
              <MetricChip label="Отдых" value={formatRest(entry.restSeconds)} />
              <MetricChip label="Вес" value={`~${entry.weightPercent}%`} />
            </Stack>

            {/* Мышцы */}
            {entry.muscles.length > 0 && (
              <Stack direction="row" spacing={0.5} sx={{ mt: 1.5, flexWrap: 'wrap' }} useFlexGap>
                {entry.muscles.map((m) => (
                  <Chip key={m} size="small" label={m} variant="outlined" color="primary" />
                ))}
              </Stack>
            )}

            {entry.technique && (
              <>
                <Divider sx={{ my: 1.5 }} />
                <Typography variant="body2" color="text.secondary">
                  <strong>Техника:</strong> {entry.technique}
                </Typography>
              </>
            )}

            {entry.coachComment && (
              <Box
                sx={{
                  mt: 1,
                  px: 1.5,
                  py: 1,
                  borderRadius: 2,
                  bgcolor: (t) => t.palette.action.hover,
                }}
              >
                <Typography variant="body2">
                  💬 <em>{entry.coachComment}</em>
                </Typography>
              </Box>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function MetricChip({ label, value }: { label: string; value: string }) {
  return (
    <Box
      sx={{
        px: 1.25,
        py: 0.5,
        borderRadius: 2,
        bgcolor: (t) => t.palette.primary.main,
        color: '#fff',
        textAlign: 'center',
        minWidth: 64,
      }}
    >
      <Box sx={{ fontSize: 11, opacity: 0.85 }}>{label}</Box>
      <Box sx={{ fontSize: 15, fontWeight: 800 }}>{value}</Box>
    </Box>
  );
}
