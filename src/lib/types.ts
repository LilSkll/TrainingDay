/**
 * ============================================================================
 *  Глобальные доменные типы приложения AI Fitness Coach.
 *  Один файл — один источник правды по бизнес-сущностям.
 * ============================================================================
 */

/* -------------------------------------------------------------------------- */
/*  Анкета пользователя                                                        */
/* -------------------------------------------------------------------------- */

export type Gender = 'male' | 'female';

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

export type FitnessGoal =
  | 'weight_loss'
  | 'muscle_gain'
  | 'maintain'
  | 'strength'
  | 'competition';

export type WorkoutPlace = 'home' | 'gym' | 'mixed';

export type Equipment =
  | 'dumbbells'
  | 'barbell'
  | 'pull_up_bar'
  | 'resistance_bands'
  | 'cable_machine' // кроссовер / блочные тренажёры
  | 'machines' // тренажёры вообще (пек-дек, Смита, гакк и т.д.)
  | 'kettlebell' // гиря
  | 'none';

/** Длительность тренировки в минутах — влияет на объём программы. */
export type WorkoutDuration = 30 | 45 | 60 | 75 | 90;

/**
 * Способ разбиения программы по дням. Влияет на структуру:
 *  - full_body — всё тело каждый день;
 *  - upper_lower — верх/низ чередуются;
 *  - ppl — push/pull/legs;
 *  - bro_split — одна группа мышц в день.
 */
export type SplitType = 'full_body' | 'upper_lower' | 'ppl' | 'bro_split' | 'auto';

/**
 * Полная анкета пользователя. Хранится в LocalStorage,
 * в будущем — строка таблицы `profiles` в Postgres/Supabase.
 */
export interface UserProfile {
  age: number;
  gender: Gender;
  heightCm: number;
  weightKg: number;
  experience: ExperienceLevel;
  goal: FitnessGoal;
  workoutsPerWeek: 2 | 3 | 4 | 5 | 6;
  place: WorkoutPlace;
  equipment: Equipment[];
  injuries: string;
  notes: string;
  /** Новые поля персонализации (опциональны — старые анкеты не сломаются). */
  /** Длительность тренировки в минутах. */
  workoutDuration?: WorkoutDuration;
  /** Предпочитаемый сплит. */
  split?: SplitType;
  /** Средняя продолжительность сна в часах (влияет на восстановление). */
  sleepHours?: number;
  /** Уровень стресса 1-5 (влияет на объём/интенсивность). */
  stressLevel?: 1 | 2 | 3 | 4 | 5;
  /** ISO-дата создания/обновления анкеты. */
  updatedAt: string;
}

/* -------------------------------------------------------------------------- */
/*  Программа тренировок (результат генерации)                                 */
/* -------------------------------------------------------------------------- */

/** Одно упражнение внутри тренировочного дня. */
export interface ExerciseEntry {
  /** id из exercises.json — нужен, чтобы подтянуть изображение. */
  exerciseId: string;
  name: string;
  sets: number;
  reps: string;
  restSeconds: number;
  /** Рабочий вес в % от предполагаемого одноповторного максимума. */
  weightPercent: number;
  technique: string;
  muscles: string[];
  coachComment: string;
}

/** Один тренировочный день. */
export interface WorkoutDay {
  day: number;
  title: string;
  focus: string;
  exercises: ExerciseEntry[];
}

/** Сгенерированная программа целиком. */
export interface TrainingProgram {
  id: string;
  /** Снимок анкеты, под которую сгенерирована программа. */
  profileSnapshot: UserProfile;
  title: string;
  summary: string;
  days: WorkoutDay[];
  createdAt: string;
  /** Какой провайдер сгенерировал план (для прозрачности). */
  provider: string;
}

/* -------------------------------------------------------------------------- */
/*  Анализ тренировки                                                          */
/* -------------------------------------------------------------------------- */

export interface WorkoutLogEntry {
  exerciseName: string;
  actualWeightKg: number;
  reps: number;
}

export interface WorkoutAnalysisInput {
  entries: WorkoutLogEntry[];
  wellbeing: 1 | 2 | 3 | 4 | 5;
  fatigue: 1 | 2 | 3 | 4 | 5;
  notes?: string;
}

export type LoadAdjustment = 'increase' | 'decrease' | 'keep';

export interface WorkoutAnalysis {
  summary: string;
  adjustment: LoadAdjustment;
  recommendations: string[];
  createdAt: string;
}

/* -------------------------------------------------------------------------- */
/*  Чат с AI-тренером                                                          */
/* -------------------------------------------------------------------------- */

export type ChatRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
}

/* -------------------------------------------------------------------------- */
/*  Прогресс                                                                   */
/* -------------------------------------------------------------------------- */

/** Одна точка изменения веса тела во времени. */
export interface BodyWeightPoint {
  date: string; // ISO
  weightKg: number;
}

/** Один зафиксированный результат по конкретному упражнению. */
export interface ExerciseProgressPoint {
  date: string; // ISO
  exerciseName: string;
  weightKg: number;
  reps: number;
}

/* -------------------------------------------------------------------------- */
/*  Упражнение (библиотека)                                                    */
/* -------------------------------------------------------------------------- */

export interface Exercise {
  id: string;
  name: string;
  description: string;
  muscles: string[];
  image: string;
  /** Какие типы оборудования требуются — для фильтрации под анкету. */
  requiredEquipment: Equipment[];
  /** Пошаговая техника выполнения (опционально — не у всех упражнений). */
  techniqueSteps?: string[];
  /** Частые ошибки (опционально). */
  commonMistakes?: string[];
  /** Запрос для поиска видео на YouTube (опционально; иначе берётся из name). */
  youtubeQuery?: string;
}
