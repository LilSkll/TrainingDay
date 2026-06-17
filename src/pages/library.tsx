/**
 * Экран «Библиотека упражнений».
 *  Сетка карточек с изображением, описанием и мышцами.
 *  Поиск + фильтр по оборудованию.
 */
import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';
import ExerciseImage from '@/components/common/ExerciseImage';
import PageHeader from '@/components/common/PageHeader';
import PageShell from '@/components/layout/PageShell';
import { EQUIPMENT_LABELS } from '@/lib/constants';
import { EXERCISES } from '@/lib/exercises/service';
import type { Equipment } from '@/lib/types';

export default function LibraryPage() {
  const [query, setQuery] = useState('');
  const [equipment, setEquipment] = useState<Equipment | 'all'>('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return EXERCISES.filter((ex) => {
      const matchesQuery =
        !q ||
        ex.name.toLowerCase().includes(q) ||
        ex.muscles.some((m) => m.toLowerCase().includes(q));
      const matchesEquipment =
        equipment === 'all' || ex.requiredEquipment.includes(equipment);
      return matchesQuery && matchesEquipment;
    });
  }, [query, equipment]);

  return (
    <PageShell maxWidth="lg">
      <PageHeader
        title="Библиотека упражнений"
        subtitle="База движений, которые AI использует в программах."
      />

      {/* Фильтры */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
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
      </Stack>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Найдено: {filtered.length}
      </Typography>

      <Grid container spacing={3}>
        {filtered.map((ex) => (
          <Grid item xs={12} sm={6} md={4} key={ex.id}>
            <Card sx={{ height: '100%' }}>
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
                <Typography variant="body2" color="text.secondary">
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
            </Card>
          </Grid>
        ))}
      </Grid>

      {filtered.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography color="text.secondary">
            Ничего не найдено. Измените запрос или фильтр.
          </Typography>
        </Box>
      )}
    </PageShell>
  );
}
