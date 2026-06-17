/**
 * Экран «Прогресс».
 *  - График изменения веса тела (Chart.js / react-chartjs-2).
 *  - График рабочих весов по упражнениям.
 *  - Карточка со сводкой (количество тренировок = кол-во анализов, дельта веса).
 *  - Формы добавления новых точек.
 *
 *  Chart.js регистрируется один раз на клиенте (useEffect), чтобы не падать
 *  при SSR.
 */
import 'chart.js/auto';
import { Line } from 'react-chartjs-2';

import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';
import PageHeader from '@/components/common/PageHeader';
import PageShell from '@/components/layout/PageShell';
import {
  useAnalyses,
  useBodyWeight,
  useExerciseProgress,
  usePrograms,
} from '@/hooks/useStorage';

export default function ProgressPage() {
  const { points: bodyPoints, addPoint: addBody } = useBodyWeight();
  const { points: exPoints, addPoint: addEx } = useExerciseProgress();
  const { analyses } = useAnalyses();
  const { programs } = usePrograms();

  // Уникальный список упражнений с историей — для селектора графика.
  const exerciseNames = useMemo(
    () => Array.from(new Set(exPoints.map((p) => p.exerciseName))).sort(),
    [exPoints],
  );
  const [selected, setSelected] = useState(exerciseNames[0] ?? '');
  const [newWeight, setNewWeight] = useState('');
  const [newExName, setNewExName] = useState('');
  const [newExWeight, setNewExWeight] = useState('');
  const [newExReps, setNewExReps] = useState('');

  const sortedBody = useMemo(
    () => [...bodyPoints].sort((a, b) => a.date.localeCompare(b.date)),
    [bodyPoints],
  );
  const filteredEx = useMemo(
    () =>
      exPoints
        .filter((p) => !selected || p.exerciseName === selected)
        .sort((a, b) => a.date.localeCompare(b.date)),
    [exPoints, selected],
  );

  const bodyDelta =
    sortedBody.length >= 2
      ? +(sortedBody[sortedBody.length - 1].weightKg - sortedBody[0].weightKg).toFixed(1)
      : null;

  function addBodyWeight() {
    const w = Number(newWeight);
    if (!Number.isFinite(w) || w <= 0) return;
    addBody({ date: new Date().toISOString(), weightKg: w });
    setNewWeight('');
  }
  function addExerciseLog() {
    const w = Number(newExWeight);
    const r = Number(newExReps);
    if (!newExName.trim() || !Number.isFinite(w) || !Number.isFinite(r)) return;
    addEx({
      date: new Date().toISOString(),
      exerciseName: newExName.trim(),
      weightKg: w,
      reps: r,
    });
    if (!exerciseNames.includes(newExName.trim())) setSelected(newExName.trim());
    setNewExWeight('');
    setNewExReps('');
  }

  return (
    <PageShell maxWidth="lg">
      <PageHeader
        title="Прогресс"
        subtitle="Следите за изменением веса тела и рабочих весов."
      />

      {/* --- Сводка --- */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <StatCard title="Вес: изменение" value={bodyDelta === null ? '—' : `${bodyDelta > 0 ? '+' : ''}${bodyDelta} кг`} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard title="Текущий вес" value={sortedBody.length ? `${sortedBody[sortedBody.length - 1].weightKg} кг` : '—'} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard title="Тренировок проанализировано" value={`${analyses.length}`} />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* --- График веса тела --- */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={800} gutterBottom>
                Вес тела
              </Typography>
              <Line
                data={{
                  labels: sortedBody.map((p) => fmtDate(p.date)),
                  datasets: [
                    {
                      label: 'Вес, кг',
                      data: sortedBody.map((p) => p.weightKg),
                      borderColor: '#4f46e5',
                      backgroundColor: 'rgba(79,70,229,.15)',
                      fill: true,
                      tension: 0.3,
                    },
                  ],
                }}
                options={{ responsive: true, plugins: { legend: { display: false } } }}
              />
              <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                <TextField
                  size="small"
                  type="number"
                  label="Вес, кг"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                />
                <Button variant="contained" onClick={addBodyWeight}>
                  Добавить
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* --- График рабочих весов --- */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={800} gutterBottom>
                Рабочие веса
              </Typography>
              <TextField
                select
                size="small"
                fullWidth
                label="Упражнение"
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                sx={{ mb: 2 }}
              >
                {exerciseNames.length === 0 && (
                  <MenuItem value="" disabled>
                    Нет данных
                  </MenuItem>
                )}
                {exerciseNames.map((n) => (
                  <MenuItem key={n} value={n}>
                    {n}
                  </MenuItem>
                ))}
              </TextField>
              <Line
                data={{
                  labels: filteredEx.map((p) => fmtDate(p.date)),
                  datasets: [
                    {
                      label: 'Вес, кг',
                      data: filteredEx.map((p) => p.weightKg),
                      borderColor: '#0ea5e9',
                      backgroundColor: 'rgba(14,165,233,.15)',
                      fill: true,
                      tension: 0.3,
                    },
                  ],
                }}
                options={{ responsive: true, plugins: { legend: { display: false } } }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* --- Добавить запись по упражнению --- */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={800} gutterBottom>
                Добавить результат упражнения
              </Typography>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
                <TextField
                  size="small"
                  label="Упражнение"
                  value={newExName}
                  onChange={(e) => setNewExName(e.target.value)}
                  sx={{ flex: 2 }}
                />
                <TextField
                  size="small"
                  type="number"
                  label="Вес, кг"
                  value={newExWeight}
                  onChange={(e) => setNewExWeight(e.target.value)}
                  sx={{ flex: 1 }}
                />
                <TextField
                  size="small"
                  type="number"
                  label="Повторения"
                  value={newExReps}
                  onChange={(e) => setNewExReps(e.target.value)}
                  sx={{ flex: 1 }}
                />
                <Button variant="contained" onClick={addExerciseLog} sx={{ flex: { md: '0 0 auto' } }}>
                  Добавить
                </Button>
              </Stack>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Программ сохранено: {programs.length} · Точек прогресса: {exPoints.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </PageShell>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <CardContent>
        <Typography variant="caption" color="text.secondary">
          {title}
        </Typography>
        <Typography variant="h4" fontWeight={800} sx={{ mt: 0.5 }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
  } catch {
    return iso;
  }
}
