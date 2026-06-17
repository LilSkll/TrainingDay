/**
 * ============================================================================
 *  Слой хранилища (Repository pattern).
 * ============================================================================
 *
 *  На MVP реализация одна — `LocalStorageRepository`, всё лежит в браузере,
 *  никаких внешних БД и авторизации.
 *
 *  Архитектурно интерфейс `DataRepository` намеренно описан так, чтобы
 *  завтра добавить `SupabaseRepository` / `PostgresRepository`, не трогая
 *  остальной код: React-компоненты зависят только от интерфейса.
 *
 *      ┌─────────────────────────┐
 *      │   React UI / hooks      │  <- зависит только от DataRepository
 *      └────────────┬────────────┘
 *                   │
 *      ┌────────────▼────────────┐
 *      │     DataRepository      │  (интерфейс)
 *      └────────────┬────────────┘
 *                   │
 *   ┌───────────────┼──────────────────┐
 *   │               │                  │
 * LocalStorage   Supabase*        Postgres*
 * (сейчас)        (будущее)         (будущее)
 * ============================================================================
 */
import { STORAGE_KEYS } from '../constants';
import type {
  BodyWeightPoint,
  ChatMessage,
  ExerciseProgressPoint,
  TrainingProgram,
  UserProfile,
  WorkoutAnalysis,
} from '../types';

/** Единый контракт хранилища для всех сущностей приложения. */
export interface DataRepository {
  /* Анкета */
  getProfile(): UserProfile | null;
  saveProfile(profile: UserProfile): void;
  clearProfile(): void;

  /* Программы */
  getCurrentProgram(): TrainingProgram | null;
  setCurrentProgram(program: TrainingProgram | null): void;
  listPrograms(): TrainingProgram[];
  saveProgram(program: TrainingProgram): void;
  deleteProgram(id: string): void;

  /* Анализы тренировок */
  listAnalyses(): WorkoutAnalysis[];
  saveAnalysis(analysis: WorkoutAnalysis): void;

  /* Прогресс: вес тела */
  getBodyWeight(): BodyWeightPoint[];
  addBodyWeightPoint(point: BodyWeightPoint): void;

  /* Прогресс: рабочие веса */
  getExerciseProgress(): ExerciseProgressPoint[];
  addExerciseProgressPoint(point: ExerciseProgressPoint): void;

  /* Чат */
  getChat(): ChatMessage[];
  saveChat(messages: ChatMessage[]): void;

  /* Полный сброс */
  resetAll(): void;
}

/* -------------------------------------------------------------------------- */
/*  Утилиты безопасной работы с localStorage (только клиентская среда)         */
/* -------------------------------------------------------------------------- */

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function read<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* квота переполнена — тихо игнорируем на MVP */
  }
}

/* -------------------------------------------------------------------------- */
/*  Реализация №1 — LocalStorage (текущая)                                     */
/* -------------------------------------------------------------------------- */

export class LocalStorageRepository implements DataRepository {
  /* --- Анкета --- */
  getProfile(): UserProfile | null {
    return read<UserProfile | null>(STORAGE_KEYS.profile, null);
  }
  saveProfile(profile: UserProfile): void {
    write(STORAGE_KEYS.profile, profile);
  }
  clearProfile(): void {
    if (isBrowser()) window.localStorage.removeItem(STORAGE_KEYS.profile);
  }

  /* --- Программы --- */
  getCurrentProgram(): TrainingProgram | null {
    return read<TrainingProgram | null>(STORAGE_KEYS.currentProgram, null);
  }
  setCurrentProgram(program: TrainingProgram | null): void {
    if (!isBrowser()) return;
    if (program === null) {
      window.localStorage.removeItem(STORAGE_KEYS.currentProgram);
      return;
    }
    write(STORAGE_KEYS.currentProgram, program);
  }
  listPrograms(): TrainingProgram[] {
    return read<TrainingProgram[]>(STORAGE_KEYS.programs, []);
  }
  saveProgram(program: TrainingProgram): void {
    const all = this.listPrograms();
    const idx = all.findIndex((p) => p.id === program.id);
    if (idx >= 0) all[idx] = program;
    else all.unshift(program);
    write(STORAGE_KEYS.programs, all);
    this.setCurrentProgram(program);
  }
  deleteProgram(id: string): void {
    write(
      STORAGE_KEYS.programs,
      this.listPrograms().filter((p) => p.id !== id),
    );
  }

  /* --- Анализы --- */
  listAnalyses(): WorkoutAnalysis[] {
    return read<WorkoutAnalysis[]>(STORAGE_KEYS.analyses, []);
  }
  saveAnalysis(analysis: WorkoutAnalysis): void {
    const all = this.listAnalyses();
    all.unshift(analysis);
    write(STORAGE_KEYS.analyses, all);
  }

  /* --- Прогресс: вес тела --- */
  getBodyWeight(): BodyWeightPoint[] {
    return read<BodyWeightPoint[]>(STORAGE_KEYS.bodyWeight, []);
  }
  addBodyWeightPoint(point: BodyWeightPoint): void {
    const all = this.getBodyWeight();
    all.push(point);
    write(STORAGE_KEYS.bodyWeight, all);
  }

  /* --- Прогресс: рабочие веса --- */
  getExerciseProgress(): ExerciseProgressPoint[] {
    return read<ExerciseProgressPoint[]>(STORAGE_KEYS.exerciseProgress, []);
  }
  addExerciseProgressPoint(point: ExerciseProgressPoint): void {
    const all = this.getExerciseProgress();
    all.push(point);
    write(STORAGE_KEYS.exerciseProgress, all);
  }

  /* --- Чат --- */
  getChat(): ChatMessage[] {
    return read<ChatMessage[]>(STORAGE_KEYS.chat, []);
  }
  saveChat(messages: ChatMessage[]): void {
    write(STORAGE_KEYS.chat, messages);
  }

  /* --- Сброс --- */
  resetAll(): void {
    if (!isBrowser()) return;
    Object.values(STORAGE_KEYS).forEach((k) => window.localStorage.removeItem(k));
  }
}

/* -------------------------------------------------------------------------- */
/*  DI-контейнер: синглтон репозитория.
 *  Завтра здесь можно решить на основе env, какую реализацию вернуть.
 * -------------------------------------------------------------------------- */
let _repo: DataRepository | null = null;

export function getRepository(): DataRepository {
  // На MVP всегда LocalStorage.
  // В будущем:
  //   if (process.env.NEXT_PUBLIC_USE_SUPABASE === 'true') return new SupabaseRepository();
  if (!_repo) _repo = new LocalStorageRepository();
  return _repo;
}
