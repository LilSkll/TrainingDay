/**
 * Валидация доменных объектов на границе API.
 *  Бросает Error с человекочитаемым сообщением — его поймает withApi().
 */
import type {
  UserProfile,
  WorkoutAnalysisInput,
} from '@/lib/types';

export function validateProfile(p: unknown): asserts p is UserProfile {
  if (!p || typeof p !== 'object') throw new Error('Анкета не передана');
  const o = p as Record<string, unknown>;

  const num = (v: unknown, min: number, max: number, field: string) => {
    const n = Number(v);
    if (!Number.isFinite(n) || n < min || n > max) {
      throw new Error(`Некорректное поле «${field}»`);
    }
  };

  num(o.age, 10, 100, 'возраст');
  num(o.heightCm, 100, 250, 'рост');
  num(o.weightKg, 30, 300, 'вес');

  if (!['male', 'female'].includes(o.gender as string)) {
    throw new Error('Некорректное поле «пол»');
  }
  if (
    !['beginner', 'intermediate', 'advanced'].includes(o.experience as string)
  ) {
    throw new Error('Некорректное поле «уровень подготовки»');
  }
  if (
    ![
      'weight_loss',
      'muscle_gain',
      'maintain',
      'strength',
      'competition',
    ].includes(o.goal as string)
  ) {
    throw new Error('Некорректное поле «цель»');
  }
  const wpw = Number(o.workoutsPerWeek);
  if (![2, 3, 4, 5, 6].includes(wpw)) {
    throw new Error('Некорректное поле «тренировок в неделю»');
  }
  if (!['home', 'gym', 'mixed'].includes(o.place as string)) {
    throw new Error('Некорректное поле «место тренировок»');
  }
  if (!Array.isArray(o.equipment)) {
    throw new Error('Некорректное поле «оборудование»');
  }

  // Новые опциональные поля — проверяем только если заданы.
  if (o.workoutDuration !== undefined) {
    const d = Number(o.workoutDuration);
    if (![30, 45, 60, 75, 90].includes(d)) {
      throw new Error('Некорректное поле «длительность тренировки»');
    }
  }
  if (
    o.split !== undefined &&
    !['full_body', 'upper_lower', 'ppl', 'bro_split', 'auto'].includes(o.split as string)
  ) {
    throw new Error('Некорректное поле «сплит»');
  }
  if (o.sleepHours !== undefined) {
    const s = Number(o.sleepHours);
    if (!Number.isFinite(s) || s < 3 || s > 12) {
      throw new Error('Некорректное поле «сон»');
    }
  }
  if (o.stressLevel !== undefined) {
    const lvl = Number(o.stressLevel);
    if (![1, 2, 3, 4, 5].includes(lvl)) {
      throw new Error('Некорректное поле «уровень стресса»');
    }
  }
}

export function validateAnalysisInput(
  i: unknown,
): asserts i is WorkoutAnalysisInput {
  if (!i || typeof i !== 'object') throw new Error('Данные анализа не переданы');
  const o = i as Record<string, unknown>;
  if (!Array.isArray(o.entries)) throw new Error('Нужны записи тренировки');
  if (![1, 2, 3, 4, 5].includes(Number(o.wellbeing))) {
    throw new Error('Самочувствие должно быть 1–5');
  }
  if (![1, 2, 3, 4, 5].includes(Number(o.fatigue))) {
    throw new Error('Усталость должна быть 1–5');
  }
}
