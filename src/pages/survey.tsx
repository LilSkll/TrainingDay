/**
 * Экран анкеты.
 *  Пользователь заполняет физические параметры и цели.
 *  После отправки — POST /api/generate-program и редирект на /program.
 */
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import PageHeader from '@/components/common/PageHeader';
import PageShell from '@/components/layout/PageShell';
import { MultiPillSelect, default as PillSelect } from '@/components/common/PillSelect';
import { useCurrentProgram, useProfile } from '@/hooks/useStorage';
import {
  EQUIPMENT_LABELS,
  EXPERIENCE_LABELS,
  GENDER_LABELS,
  GOAL_LABELS,
  PLACE_LABELS,
} from '@/lib/constants';
import type {
  Equipment,
  ExperienceLevel,
  FitnessGoal,
  Gender,
  UserProfile,
  WorkoutPlace,
} from '@/lib/types';

/** Дефолтная пустая анкета. */
const EMPTY: UserProfile = {
  age: 30,
  gender: 'male',
  heightCm: 178,
  weightKg: 75,
  experience: 'beginner',
  goal: 'muscle_gain',
  workoutsPerWeek: 3,
  place: 'gym',
  equipment: ['dumbbells'],
  injuries: '',
  notes: '',
  updatedAt: new Date().toISOString(),
};

export default function SurveyPage() {
  const router = useRouter();
  const { profile, saveProfile } = useProfile();
  const { setProgram } = useCurrentProgram(); // hooks — на верхнем уровне

  // Локальное состояние формы. Инициализируем пустой.
  const [form, setForm] = useState<UserProfile>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Загружаем сохранённую анкету ОДИН раз после монтирования на клиенте.
  // Раньше тут был бесконечный цикл: profile = новый объект каждый рендер.
  useEffect(() => {
    if (!hydrated && profile) {
      setForm(profile);
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, hydrated]);

  // Универсальный setter для примитивных полей.
  function set<K extends keyof UserProfile>(key: K, value: UserProfile[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit() {
    setError(null);
    setLoading(true);
    // Сохраняем анкету локально ДО генерации — даже при ошибке LLM
    // пользователь не потеряет введённые данные.
    saveProfile(form);

    try {
      const res = await fetch('/api/generate-program', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: form }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? 'Не удалось сгенерировать программу');
      }
      const { program } = await res.json();
      setProgram(program); // saveProgram внутри setCurrentProgram
      router.push('/program');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Неизвестная ошибка');
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell maxWidth="md">
      <PageHeader
        title="Анкета"
        subtitle="Расскажите о себе — AI составит программу под ваши параметры."
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Stack spacing={3}>
        {/* --- Физические параметры --- */}
        <Card>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 2 }}>
              Физические параметры
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={4}>
                <TextField
                  fullWidth
                  label="Возраст"
                  type="number"
                  value={form.age}
                  onChange={(e) => set('age', Number(e.target.value))}
                  inputProps={{ min: 10, max: 100 }}
                />
              </Grid>
              <Grid item xs={6} sm={4}>
                <TextField
                  fullWidth
                  label="Рост, см"
                  type="number"
                  value={form.heightCm}
                  onChange={(e) => set('heightCm', Number(e.target.value))}
                  inputProps={{ min: 100, max: 250 }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Вес, кг"
                  type="number"
                  value={form.weightKg}
                  onChange={(e) => set('weightKg', Number(e.target.value))}
                  inputProps={{ min: 30, max: 300 }}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Пол
                </Typography>
                <PillSelect<Gender>
                  value={form.gender}
                  onChange={(v) => set('gender', v)}
                  options={(Object.keys(GENDER_LABELS) as Gender[]).map((g) => ({
                    value: g,
                    label: GENDER_LABELS[g],
                  }))}
                  columns={2}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* --- Цель и уровень --- */}
        <Card>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 2 }}>
              Цель и уровень
            </Typography>
            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Уровень подготовки
                </Typography>
                <PillSelect<ExperienceLevel>
                  value={form.experience}
                  onChange={(v) => set('experience', v)}
                  options={(Object.keys(EXPERIENCE_LABELS) as ExperienceLevel[]).map((e) => ({
                    value: e,
                    label: EXPERIENCE_LABELS[e],
                  }))}
                  columns={3}
                />
              </Box>
              <Divider />
              <Box>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Основная цель
                </Typography>
                <PillSelect<FitnessGoal>
                  value={form.goal}
                  onChange={(v) => set('goal', v)}
                  options={(Object.keys(GOAL_LABELS) as FitnessGoal[]).map((g) => ({
                    value: g,
                    label: GOAL_LABELS[g],
                  }))}
                />
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* --- Расписание и место --- */}
        <Card>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 2 }}>
              Расписание и место
            </Typography>
            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Тренировок в неделю
                </Typography>
                <PillSelect<number>
                  value={form.workoutsPerWeek}
                  onChange={(v) => set('workoutsPerWeek', v as UserProfile['workoutsPerWeek'])}
                  options={[2, 3, 4, 5, 6].map((n) => ({ value: n, label: `${n}` }))}
                  columns={5}
                />
              </Box>
              <Divider />
              <Box>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Тип тренировок
                </Typography>
                <PillSelect<WorkoutPlace>
                  value={form.place}
                  onChange={(v) => set('place', v)}
                  options={(Object.keys(PLACE_LABELS) as WorkoutPlace[]).map((p) => ({
                    value: p,
                    label: PLACE_LABELS[p],
                  }))}
                  columns={3}
                />
              </Box>
              <Divider />
              <Box>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Доступное оборудование
                </Typography>
                <MultiPillSelect<Equipment>
                  values={form.equipment}
                  onChange={(v) => set('equipment', v)}
                  options={(Object.keys(EQUIPMENT_LABELS) as Equipment[]).map((eq) => ({
                    value: eq,
                    label: EQUIPMENT_LABELS[eq],
                  }))}
                />
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* --- Ограничения и заметки --- */}
        <Card>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 2 }}>
              Ограничения и заметки
            </Typography>
            <Stack spacing={2}>
              <TextField
                fullWidth
                multiline
                minRows={2}
                label="Травмы или ограничения"
                placeholder="Например: травма колена, нельзя приседать со штангой"
                value={form.injuries}
                onChange={(e) => set('injuries', e.target.value)}
              />
              <TextField
                fullWidth
                multiline
                minRows={2}
                label="Дополнительная информация"
                placeholder="Всё, что стоит знать тренеру: режим сна, диета, предпочтения…"
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
              />
            </Stack>
          </CardContent>
        </Card>

        {/* --- Кнопка отправки --- */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            size="large"
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : undefined}
          >
            {loading ? 'Генерация…' : 'Создать программу'}
          </Button>
        </Box>
      </Stack>
    </PageShell>
  );
}
