/**
 * Карточка одного упражнения внутри тренировочного дня.
 *  Показывает изображение (из библиотеки), подходы/повторения/отдых,
 *  технику, мышцы и комментарий тренера.
 *
 *  Изображение и кнопка «Техника» открывают модалку с пошаговым описанием;
 *  кнопка ⭐ добавляет упражнение в избранное.
 */
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useState } from 'react';
import ExerciseDetailModal from '@/components/common/ExerciseDetailModal';
import ExerciseImage from '@/components/common/ExerciseImage';
import YoutubeButtons from '@/components/common/YoutubeButtons';
import { formatRest } from '@/lib/constants';
import { getExerciseById } from '@/lib/exercises/service';
import { useFavorites } from '@/hooks/useStorage';
import type { ExerciseEntry } from '@/lib/types';

interface Props {
  entry: ExerciseEntry;
  index: number;
}

export default function ExerciseCard({ entry, index }: Props) {
  // Подтягиваем изображение из библиотеки по id.
  const lib = getExerciseById(entry.exerciseId);
  const image = lib?.image;

  // Модалка техники.
  const [modalOpen, setModalOpen] = useState(false);

  // Избранное.
  const { isFavorite, toggleFavorite } = useFavorites();
  const fav = lib ? isFavorite(lib.id) : false;

  return (
    <>
      <Card variant="outlined">
        <CardContent sx={{ p: { xs: 2, sm: 2.5 }, '&:last-child': { pb: { xs: 2, sm: 2.5 } } }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5}>
            {/* Картинка (кликабельна → модалка) */}
            <Box sx={{ flex: { sm: '0 0 200px' }, width: { xs: '100%', sm: 200 } }}>
              <ExerciseImage
                src={image}
                alt={entry.name}
                height={140}
                onClick={() => setModalOpen(true)}
              />
            </Box>

            {/* Контент */}
            <Box sx={{ flex: 1 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Typography variant="subtitle1" fontWeight={800}>
                  {index + 1}. {entry.name}
                </Typography>
                <Stack direction="row" spacing={0.5}>
                  {/* Кнопка техники (модалка) */}
                  <IconButton
                    size="small"
                    aria-label="Подробная техника"
                    onClick={() => setModalOpen(true)}
                  >
                    <InfoOutlinedIcon fontSize="small" />
                  </IconButton>
                  {/* Кнопка избранного */}
                  {lib && (
                    <IconButton
                      size="small"
                      aria-label={fav ? 'Убрать из избранного' : 'Добавить в избранное'}
                      color={fav ? 'warning' : 'default'}
                      onClick={() => toggleFavorite(lib.id)}
                    >
                      {fav ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
                    </IconButton>
                  )}
                </Stack>
              </Stack>

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

              {/* Быстрый YouTube-поиск: как выполнить правильно */}
              <Box sx={{ mt: 1 }}>
                <YoutubeButtons exerciseName={entry.name} variant="compact" />
              </Box>

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

      {/* Модалка с пошаговой техникой */}
      <ExerciseDetailModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        exercise={lib}
        fallbackName={entry.name}
        fallbackDescription={entry.technique}
        fallbackMuscles={entry.muscles}
      />
    </>
  );
}

function MetricChip({ label, value }: { label: string; value: string }) {
  return (
    <Box
      sx={{
        px: 1.5,
        py: 0.75,
        borderRadius: 2,
        bgcolor: (t) => t.palette.primary.main,
        color: '#fff',
        textAlign: 'center',
        minWidth: 64,
        flex: '1 1 auto',
      }}
    >
      {/* Минимум 13px для читаемости на мобильных; было 11 — слишком мелко. */}
      <Box sx={{ fontSize: { xs: 13, sm: 12 }, opacity: 0.9, lineHeight: 1.1 }}>
        {label}
      </Box>
      <Box sx={{ fontSize: { xs: 16, sm: 15 }, fontWeight: 800, lineHeight: 1.2 }}>
        {value}
      </Box>
    </Box>
  );
}
