/**
 * ============================================================================
 *  Группа кнопок YouTube-поиска по упражнению.
 * ============================================================================
 *
 *  4 целевых запроса: Техника / Ошибки / Разминка / Новичкам.
 *  Переиспользуется в карточках программы/библиотеки и в модалке техники.
 *
 *  Два режима отображения:
 *    - `variant="compact"` — только иконки (для карточек, экономит место);
 *    - `variant="full"` — иконка + подпись (для модалки).
 * ============================================================================
 */
import YouTubeIcon from '@mui/icons-material/YouTube';
import {
  Button,
  IconButton,
  Stack,
  Tooltip,
  type TooltipProps,
} from '@mui/material';
import { getYoutubeLinks, openYoutube } from '@/lib/youtube/links';

interface Props {
  exerciseName: string;
  variant?: 'compact' | 'full';
  /** Размер кнопок. */
  size?: 'small' | 'medium';
}

export default function YoutubeButtons({
  exerciseName,
  variant = 'full',
  size = 'small',
}: Props) {
  const links = getYoutubeLinks(exerciseName);

  if (variant === 'compact') {
    // Компактно: 4 иконки YouTube с тултипами.
    return (
      <Stack direction="row" spacing={0.5}>
        {links.map((link) => (
          <Tooltip key={link.kind} title={`YouTube: ${link.label}`} arrow>
            <IconButton
              size={size}
              color="error"
              aria-label={`YouTube: ${link.label}`}
              onClick={(e) => {
                e.stopPropagation();
                openYoutube(link.url);
              }}
              sx={{ p: size === 'small' ? 0.5 : 1 }}
            >
              <YouTubeIcon fontSize={size === 'small' ? 'small' : 'medium'} />
            </IconButton>
          </Tooltip>
        ))}
      </Stack>
    );
  }

  // Полный режим: кнопки с подписями.
  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
      {links.map((link) => (
        <Button
          key={link.kind}
          size={size}
          variant="outlined"
          color="error"
          startIcon={<YouTubeIcon />}
          onClick={() => openYoutube(link.url)}
        >
          {link.label}
        </Button>
      ))}
    </Stack>
  );
}
