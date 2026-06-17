/**
 * Экран «Анализ тренировки».
 *  Пользователь вводит фактические веса, повторения, самочувствие,
 *  уровень усталости — AI выдаёт разбор и рекомендацию по нагрузке.
 *
 *  Список упражнений предзаполняется из текущей программы, чтобы не
 *  набивать всё руками.
 */
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import { useState } from 'react';
import PageHeader from '@/components/common/PageHeader';
import PageShell from '@/components/layout/PageShell';
import { useAnalyses, useCurrentProgram } from '@/hooks/useStorage';
import type { LoadAdjustment, WorkoutLogEntry } from '@/lib/types';

const ADJUSTMENT_META: Record<
  LoadAdjustment,
  { label: string; color: 'success' | 'warning' | 'info' }
> = {
  increase: { label: 'Увеличить вес', color: 'success' },
  decrease: { label: 'Уменьшить вес', color: 'warning' },
  keep: { label: 'Оставить без изменений', color: 'info' },
};

export default function AnalysisPage() {
  const { program } = useCurrentProgram();
  const { addAnalysis, analyses } = useAnalyses();

  const [entries, setEntries] = useState<WorkoutLogEntry[]>(() =>
    program?.days?.[0]?.exercises?.slice(0, 3).map((e) => ({
      exerciseName: e.name,
      actualWeightKg: Math.round((e.weightPercent * 100) / 100) || 20,
      reps: Number(String(e.reps).replace(/\D/g, '')) || 10,
    })) ?? [{ exerciseName: '', actualWeightKg: 20, reps: 10 }],
  );
  const [wellbeing, setWellbeing] = useState<1 | 2 | 3 | 4 | 5>(4);
  const [fatigue, setFatigue] = useState<1 | 2 | 3 | 4 | 5>(2);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const latest = analyses[0];

  function updateEntry(i: number, patch: Partial<WorkoutLogEntry>) {
    setEntries((arr) => arr.map((e, idx) => (idx === i ? { ...e, ...patch } : e)));
  }
  function addRow() {
    setEntries((arr) => [...arr, { exerciseName: '', actualWeightKg: 20, reps: 10 }]);
  }
  function removeRow(i: number) {
    setEntries((arr) => arr.filter((_, idx) => idx !== i));
  }

  async function handleAnalyze() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/analyze-workout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries, wellbeing, fatigue, notes }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? 'Не удалось проанализировать тренировку');
      }
      const { analysis } = await res.json();
      addAnalysis(analysis);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Неизвестная ошибка');
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell maxWidth="md">
      <PageHeader
        title="Анализ тренировки"
        subtitle="Введите фактические результаты и самочувствие — AI даст рекомендации."
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Stack spacing={3}>
        {/* --- Фактические результаты --- */}
        <Card>
          <CardContent>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: 2 }}
            >
              <Typography variant="subtitle1" fontWeight={800}>
                Фактические результаты
              </Typography>
              <Button startIcon={<AddIcon />} onClick={addRow} size="small">
                Добавить
              </Button>
            </Stack>

            <Stack spacing={1.5}>
              {entries.map((e, i) => (
                <Grid container spacing={1} alignItems="center" key={i}>
                  <Grid item xs={12} sm={5}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Упражнение"
                      value={e.exerciseName}
                      onChange={(ev) => updateEntry(i, { exerciseName: ev.target.value })}
                    />
                  </Grid>
                  <Grid item xs={5} sm={3}>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      label="Вес, кг"
                      value={e.actualWeightKg}
                      onChange={(ev) =>
                        updateEntry(i, { actualWeightKg: Number(ev.target.value) })
                      }
                    />
                  </Grid>
                  <Grid item xs={5} sm={3}>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      label="Повторения"
                      value={e.reps}
                      onChange={(ev) => updateEntry(i, { reps: Number(ev.target.value) })}
                    />
                  </Grid>
                  <Grid item xs={2} sm={1}>
                    <IconButton
                      color="error"
                      onClick={() => removeRow(i)}
                      aria-label="Удалить"
                    >
                      <DeleteOutlineIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              ))}
            </Stack>
          </CardContent>
        </Card>

        {/* --- Самочувствие и усталость --- */}
        <Card>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 2 }}>
              Самочувствие и усталость
            </Typography>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
              <ScaleInput
                label="Самочувствие"
                icon={<SentimentSatisfiedAltIcon />}
                value={wellbeing}
                onChange={(v) => setWellbeing(v as 1 | 2 | 3 | 4 | 5)}
                hint={['очень плохо', 'плохо', 'нормально', 'хорошо', 'отлично']}
              />
              <ScaleInput
                label="Уровень усталости"
                icon={<SentimentDissatisfiedIcon />}
                value={fatigue}
                onChange={(v) => setFatigue(v as 1 | 2 | 3 | 4 | 5)}
                hint={['нет усталости', 'слабая', 'средняя', 'сильная', 'очень сильная']}
              />
            </Stack>
            <TextField
              fullWidth
              multiline
              minRows={2}
              label="Заметки о тренировке"
              placeholder="Что-то важное для анализа"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              sx={{ mt: 2 }}
            />
          </CardContent>
        </Card>

        <Box>
          <Button
            variant="contained"
            size="large"
            onClick={handleAnalyze}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : undefined}
          >
            {loading ? 'Анализ…' : 'Проанализировать'}
          </Button>
        </Box>

        {/* --- Результат --- */}
        {latest && (
          <Card sx={{ borderLeft: (t) => `4px solid ${t.palette.primary.main}` }}>
            <CardContent>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 1 }}
              >
                <Typography variant="subtitle1" fontWeight={800}>
                  Анализ AI
                </Typography>
                <Chip
                  label={ADJUSTMENT_META[latest.adjustment].label}
                  color={ADJUSTMENT_META[latest.adjustment].color}
                />
              </Stack>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                {latest.summary}
              </Typography>
              <Divider sx={{ mb: 1.5 }} />
              <Typography variant="subtitle2" gutterBottom>
                Рекомендации:
              </Typography>
              <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
                {latest.recommendations.map((r, i) => (
                  <li key={i}>
                    <Typography variant="body2">{r}</Typography>
                  </li>
                ))}
              </Box>
            </CardContent>
          </Card>
        )}
      </Stack>
    </PageShell>
  );
}

/** Шкала 1–5. */
function ScaleInput({
  label,
  icon,
  value,
  onChange,
  hint,
}: {
  label: string;
  icon: React.ReactNode;
  value: number;
  onChange: (v: number) => void;
  hint: string[];
}) {
  return (
    <Box sx={{ flex: 1 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
        {icon}
        <Typography variant="body2">{label}</Typography>
      </Stack>
      <Stack direction="row" spacing={1}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Button
            key={n}
            variant={value === n ? 'contained' : 'outlined'}
            onClick={() => onChange(n)}
            sx={{ minWidth: 0, width: 44, height: 44, borderRadius: '50%' }}
          >
            {n}
          </Button>
        ))}
      </Stack>
      <Typography variant="caption" color="text.secondary">
        {hint[value - 1]}
      </Typography>
    </Box>
  );
}
