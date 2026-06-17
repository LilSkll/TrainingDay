/**
 * Экран «Библиотека упражнений».
 *  Сетка карточек с изображением, описанием и мышцами.
 *  Поиск + фильтр по оборудованию + фильтр «Только избранное».
 *
 *  Клик по карточке (или по картинке) открывает модалку с пошаговой техникой;
 *  кнопка ⭐ добавляет упражнение в избранное (LocalStorage).
 */
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';
import ExerciseDetailModal from '@/components/common/ExerciseDetailModal';
import ExerciseImage from '@/components/common/ExerciseImage';
import PageHeader from '@/components/common/PageHeader';
import PageShell from '@/components/layout/PageShell';
import { EQUIPMENT_LABELS } from '@/lib/constants';
import { EXERCISES } from '@/lib/exercises/service';
import { useFavorites } from '@/hooks/useStorage';
import type { Equipment, Exercise } from '@/lib/types';

export default function LibraryPage() {
  const [query, setQuery] = useState('');
  const [equipment, setEquipment] = useState<Equipment | 'all'>('all');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [selected, setSelected] = useState<Exercise | null>(null);

  const { favorites, isFavorite, toggleFavorite } = useFavorites();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return EXERCISES.filter((ex) => {
      const matchesQuery =
        !q ||
        ex.name.toLowerCase().includes(q) ||
        ex.muscles.some((m) => m.toLowerCase().includes(q));
      const matchesEquipment =
        equipment === 'all' || ex.requiredEquipment.includes(equipment);
      const matchesFavorites = !onlyFavorites || favorites.includes(ex.id);
      return matchesQuery && matchesEquipment && matchesFavorites;
    });
  }, [query, equipment, onlyFavorites, favorites]);

  return (
    <PageShell maxWidth="lg">
      <PageHeader
        title="Библиотека упражнений"
        subtitle="База движений, которые AI использует в программах."
      />

      {/* Фильтры */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          label="Поиск по названию или мышцам"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <TextField
          select
          size="small"
          label="Оборудование"
          value={equipment}
          onChange={(e) => setEquipment(e.target.value as Equipment | 'all')}
          sx={{ minWidth: { md: 220 } }}
        >
          <MenuItem value="all">Все</MenuItem>
          {(Object.keys(EQUIPMENT_LABELS) as Equipment[]).map((eq) => (
            <MenuItem key={eq} value={eq}>
              {EQUIPMENT_LABELS[eq]}
            </MenuItem>
          ))}
        </TextField>
        <Button
          variant={onlyFavorites ? 'contained' : 'outlined'}
          color={onlyFavorites ? 'warning' : 'inherit'}
          startIcon={onlyFavorites ? <StarIcon /> : <StarBorderIcon />}
          onClick={() => setOnlyFavorites((v) => !v)}
          sx={{ minWidth: { md: 200 }, whiteSpace: 'nowrap' }}
        >
          Избранное{favorites.length ? ` (${favorites.length})` : ''}
        </Button>
      </Stack>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Найдено: {filtered.length}
      </Typography>

      <Grid container spacing={3}>
        {filtered.map((ex) => {
          const fav = isFavorite(ex.id);
          return (
            <Grid item xs={12} sm={6} md={4} key={ex.id}>
              <Card sx={{ height: '100%', position: 'relative' }}>
                {/* Кнопка избранного — поверх карточки */}
                <IconButton
                  size="small"
                  aria-label={fav ? 'Убрать из избранного' : 'Добавить в избранное'}
                  color={fav ? 'warning' : 'default'}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(ex.id);
                  }}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    zIndex: 2,
                    bgcolor: 'background.paper',
                    boxShadow: 1,
                  }}
                >
                  {fav ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
                </IconButton>

                <CardActionArea onClick={() => setSelected(ex)}>
                  <CardContent>
                    <ExerciseImage src={ex.image} alt={ex.name} height={150} />
                    <Typography variant="h6" fontWeight={800} sx={{ mt: 1.5 }}>
                      {ex.name}
                    </Typography>
                    <Stack direction="row" spacing={0.5} sx={{ my: 1, flexWrap: 'wrap' }} useFlexGap>
                      {ex.muscles.map((m) => (
                        <Chip key={m} size="small" label={m} color="primary" variant="outlined" />
                      ))}
                    </Stack>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {ex.description}
                    </Typography>
                    <Box sx={{ mt: 1.5 }}>
                      {ex.requiredEquipment.map((eq) => (
                        <Chip
                          key={eq}
                          size="small"
                          label={EQUIPMENT_LABELS[eq]}
                          variant="outlined"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      ))}
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {filtered.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography color="text.secondary">
            {onlyFavorites
              ? 'В избранном пока ничего нет. Нажмите ⭐ на любом упражнении.'
              : 'Ничего не найдено. Измените запрос или фильтр.'}
          </Typography>
        </Box>
      )}

      {/* Модалка с подробной техникой */}
      <ExerciseDetailModal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        exercise={selected ?? undefined}
      />
    </PageShell>
  );
}
