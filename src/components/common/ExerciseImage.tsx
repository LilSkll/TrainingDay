/**
 * Изображение упражнения с аккуратным fallback-плейсхолдером,
 *  если exerciseId нет в библиотеке (LLM придумал своё упражнение).
 *
 *  Опциональный onClick превращает картинку в кликабельный элемент
 *  (например, для открытия модалки с техникой).
 */
import { Box, Typography, useTheme } from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';

interface Props {
  src?: string;
  alt: string;
  /** Высота картинки. */
  height?: number;
  /** Кликабельна ли картинка (добавляет pointer-cursor + hover-затемнение). */
  onClick?: () => void;
}

export default function ExerciseImage({ src, alt, height = 160, onClick }: Props) {
  const theme = useTheme();
  const clickable = Boolean(onClick);
  const hoverSx = clickable
    ? {
        cursor: 'pointer',
        transition: 'transform .15s ease, box-shadow .15s ease',
        '&:hover': { transform: 'scale(1.02)' },
      }
    : {};

  if (!src) {
    // Нет картинки — показываем фирменный плейсхолдер.
    return (
      <Box
        onClick={onClick}
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
          ...hoverSx,
        }}
      >
        <FitnessCenterIcon fontSize="large" />
        <Typography variant="caption">изображение скоро</Typography>
      </Box>
    );
  }

  return (
    <Box
      onClick={onClick}
      sx={{
        height,
        borderRadius: 2,
        overflow: 'hidden',
        bgcolor: theme.palette.action.hover,
        position: 'relative',
        '& img': { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
        // На hover — лёгкое затемнение + «лупа», показывающее, что кликабельно.
        ...(clickable
          ? {
              '&::after': {
                content: '""',
                position: 'absolute',
                inset: 0,
                bgcolor: 'rgba(0,0,0,0)',
                transition: 'background-color .15s ease',
                pointerEvents: 'none',
              },
              '&:hover::after': { bgcolor: 'rgba(0,0,0,.15)' },
            }
          : {}),
        ...hoverSx,
      }}
    >
      {/* Используем обычный img — для статичных SVG это оптимально. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} loading="lazy" />
    </Box>
  );
}
