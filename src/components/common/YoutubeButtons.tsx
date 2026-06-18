/**
 * ============================================================================
 *  Кнопка быстрого YouTube-поиска по упражнению.
 * ============================================================================
 *
 *  Одна кнопка «Как выполнить правильно» — открывает YouTube-поиск с
 *  целевым запросом (отсекает кликбейт: «как правильно», «разбор техники»).
 *
 *  Раньше было 4 кнопки — упрощено до одной, чтобы интерфейс был чище.
 *
 *  Два варианта отображения:
 *    - `variant="compact"` — маленький размер (для карточек);
 *    - `variant="full"` — крупнее, для модалки.
 * ============================================================================
 */
import YouTubeIcon from '@mui/icons-material/YouTube';
import { Button } from '@mui/material';
import { getYoutubeLink, openYoutube } from '@/lib/youtube/links';

interface Props {
  exerciseName: string;
  variant?: 'compact' | 'full';
}

export default function YoutubeButtons({
  exerciseName,
  variant = 'compact',
}: Props) {
  const link = getYoutubeLink(exerciseName, 'technique');

  return (
    <Button
      size="small"
      variant="text"
      color="error"
      startIcon={<YouTubeIcon />}
      onClick={(e) => {
        e.stopPropagation();
        openYoutube(link.url);
      }}
      sx={
        variant === 'compact'
          ? { px: 1, py: 0.25, fontSize: '0.8rem', textTransform: 'none' }
          : { textTransform: 'none' }
      }
    >
      Как выполнить правильно
    </Button>
  );
}
