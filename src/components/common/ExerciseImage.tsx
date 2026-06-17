/**
 * Изображение упражнения с аккуратным fallback-плейсхолдером,
 *  если exerciseId нет в библиотеке (LLM придумал своё упражнение).
 */
import { Box, Typography, useTheme } from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';

interface Props {
  src?: string;
  alt: string;
  /** Высота картинки. */
  height?: number;
}

export default function ExerciseImage({ src, alt, height = 160 }: Props) {
  const theme = useTheme();

  if (!src) {
    // Нет картинки — показываем фирменный плейсхолдер.
    return (
      <Box
        sx={{
          height,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
          borderRadius: 2,
          bgcolor: theme.palette.action.hover,
          color: 'text.secondary',
        }}
      >
        <FitnessCenterIcon fontSize="large" />
        <Typography variant="caption">изображение скоро</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height,
        borderRadius: 2,
        overflow: 'hidden',
        bgcolor: theme.palette.action.hover,
        '& img': { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
      }}
    >
      {/* Используем обычный img — для статичных SVG это оптимально. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} loading="lazy" />
    </Box>
  );
}
