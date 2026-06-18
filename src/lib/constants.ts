/**
 * Общие константы и человекочитаемые словари (RU).
 * Хранятся в одном месте, чтобы не плодить дубли по компонентам.
 */
import type {
  Equipment,
  ExperienceLevel,
  FitnessGoal,
  Gender,
  SplitType,
  WorkoutDuration,
  WorkoutPlace,
} from './types';

export const APP_NAME = 'AI Fitness Coach';
export const APP_TAGLINE =
  'Персональный ИИ-тренер, который создаёт тренировочные программы под ваши цели и уровень подготовки.';

/** Ключи в LocalStorage. Префикс `afc:` = AI Fitness Coach. */
export const STORAGE_KEYS = {
  profile: 'afc:profile',
  currentProgram: 'afc:currentProgram',
  programs: 'afc:programs',
  analyses: 'afc:analyses',
  bodyWeight: 'afc:bodyWeight',
  exerciseProgress: 'afc:exerciseProgress',
  chat: 'afc:chat',
  favorites: 'afc:favorites',
  theme: 'afc:theme',
} as const;

export const GENDER_LABELS: Record<Gender, string> = {
  male: 'Мужской',
  female: 'Женский',
};

export const EXPERIENCE_LABELS: Record<ExperienceLevel, string> = {
  beginner: 'Новичок',
  intermediate: 'Средний',
  advanced: 'Продвинутый',
};

export const GOAL_LABELS: Record<FitnessGoal, string> = {
  weight_loss: 'Похудение',
  muscle_gain: 'Набор мышечной массы',
  maintain: 'Поддержание формы',
  strength: 'Развитие силы',
  competition: 'Подготовка к соревнованиям',
};

export const PLACE_LABELS: Record<WorkoutPlace, string> = {
  home: 'Дом',
  gym: 'Тренажёрный зал',
  mixed: 'Смешанный формат',
};

export const EQUIPMENT_LABELS: Record<Equipment, string> = {
  dumbbells: 'Гантели',
  barbell: 'Штанга',
  pull_up_bar: 'Турник',
  resistance_bands: 'Резинки',
  cable_machine: 'Кроссовер / блоки',
  machines: 'Тренажёры',
  kettlebell: 'Гиря',
  none: 'Нет оборудования',
};

/** Длительность тренировки. */
export const DURATION_LABELS: Record<WorkoutDuration, string> = {
  30: '30 мин',
  45: '45 мин',
  60: '60 мин',
  75: '75 мин',
  90: '90 мин',
};

/** Способы разбиения программы по дням. */
export const SPLIT_LABELS: Record<SplitType, string> = {
  full_body: 'Всё тело (Full body)',
  upper_lower: 'Верх / Низ',
  ppl: 'Push / Pull / Legs',
  bro_split: 'По одной группе в день',
  auto: 'Подобрать автоматически',
};

/** Длительность отдыха в секундах → короткая подпись. */
export function formatRest(seconds: number): string {
  if (seconds < 60) return `${seconds} сек`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s ? `${m} мин ${s} сек` : `${m} мин`;
}
