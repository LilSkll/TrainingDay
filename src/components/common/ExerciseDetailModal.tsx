/**
 * ============================================================================
 *  Модальное окно с подробной информацией об упражнении.
 * ============================================================================
 *
 *  Показывает:
 *    - крупное изображение,
 *    - название + задействованные мышцы,
 *    - пошаговую технику (techniqueSteps),
 *    - частые ошибки (commonMistakes),
 *    - кнопку ⭐ Добавить в избранное,
 *    - кнопку «Смотреть на YouTube» (открывает поиск видео).
 *
 *  Принимает либо полный Exercise (из библиотеки), либо набор полей
 *  ExerciseEntry + опциональный libraryExercise — для карточек из программы,
 *  где упражнение могло быть сгенерировано LLM и не быть в библиотеке.
 * ============================================================================
 */
import CloseIcon from '@mui/icons-material/Close';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import type { ReactNode } from 'react';
import ExerciseImage from '@/components/common/ExerciseImage';
import YoutubeButtons from '@/components/common/YoutubeButtons';
import { useFavorites } from '@/hooks/useStorage';
import type { Exercise } from '@/lib/types';

interface Props {
  /** Полное упражнение из библиотеки (если есть). */
  exercise?: Exercise;
  /** Фоллбэк-имя/описание/мышцы для сгенерированных LLM упражнений. */
  fallbackName?: string;
  fallbackDescription?: string;
  fallbackMuscles?: string[];
  open: boolean;
  onClose: () => void;
}

/** Строит поисковый URL на YouTube по названию упражнения. */
export default function ExerciseDetailModal({
  exercise,
  fallbackName,
  fallbackDescription,
  fallbackMuscles,
  open,
  onClose,
}: Props) {
  const { isFavorite, toggleFavorite } = useFavorites();

  // Разрешаем финальные значения (приоритет — библиотечному упражнению).
  const id = exercise?.id;
  const name = exercise?.name ?? fallbackName ?? 'Упражнение';
  const description = exercise?.description ?? fallbackDescription ?? '';
  const muscles = exercise?.muscles ?? fallbackMuscles ?? [];
  const image = exercise?.image;
  const steps = exercise?.techniqueSteps;
  const mistakes = exercise?.commonMistakes;

  const fav = id ? isFavorite(id) : false;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pr: 6 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="h6" component="span" fontWeight={800}>
            {name}
          </Typography>
        </Stack>
        <IconButton
          onClick={onClose}
          aria-label="Закрыть"
          sx={{ position: 'absolute', right: 8, top: 8, color: 'text.secondary' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2.5}>
          {/* Картинка */}
          <Box sx={{ maxHeight: 280, overflow: 'hidden', borderRadius: 2 }}>
            <ExerciseImage src={image} alt={name} height={260} />
          </Box>

          {/* Мышцы + действия */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ sm: 'center' }}
            spacing={1.5}
          >
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
              {muscles.map((m) => (
                <Chip key={m} size="small" label={m} color="primary" variant="outlined" />
              ))}
            </Stack>
            <Stack direction="row" spacing={1}>
              {id && (
                <Button
                  size="small"
                  variant={fav ? 'contained' : 'outlined'}
                  color={fav ? 'warning' : 'inherit'}
                  startIcon={fav ? <StarIcon /> : <StarBorderIcon />}
                  onClick={() => toggleFavorite(id)}
                >
                  {fav ? 'В избранном' : 'В избранное'}
                </Button>
              )}
            </Stack>
          </Stack>

          {/* 4 целевых YouTube-поиска: техника / ошибки / разминка / новичкам */}
          <YoutubeButtons exerciseName={name} variant="full" />

          {description && (
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          )}

          {/* Пошаговая техника */}
          {steps && steps.length > 0 ? (
            <Section title="Техника выполнения">
              <OrderedList items={steps} />
            </Section>
          ) : null}

          {/* Частые ошибки */}
          {mistakes && mistakes.length > 0 ? (
            <Section title="Частые ошибки">
              <OrderedList items={mistakes} ordered={false} accent="error" />
            </Section>
          ) : null}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------- внутренние компоненты ------------------------- */

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Box>
      <Typography variant="subtitle2" fontWeight={800} gutterBottom>
        {title}
      </Typography>
      <Divider sx={{ mb: 1 }} />
      {children}
    </Box>
  );
}

function OrderedList({
  items,
  ordered = true,
  accent = 'primary',
}: {
  items: string[];
  ordered?: boolean;
  accent?: 'primary' | 'error';
}) {
  const color = accent === 'error' ? 'error.main' : 'primary.main';
  return (
    <Stack component="ol" spacing={1} sx={{ m: 0, pl: 0, listStyle: 'none' }}>
      {items.map((text, i) => (
        <Stack key={i} direction="row" spacing={1.5} alignItems="flex-start">
          <Box
            component="span"
            sx={{
              flexShrink: 0,
              width: 22,
              height: 22,
              borderRadius: '50%',
              bgcolor: color,
              color: '#fff',
              fontSize: 12,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mt: 0.25,
            }}
          >
            {ordered ? i + 1 : '!'}
          </Box>
          <Typography variant="body2">{text}</Typography>
        </Stack>
      ))}
    </Stack>
  );
}
