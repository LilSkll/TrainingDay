/**
 * Удобные React-хуки над репозиторием.
 *
 *  ВАЖНО (баг, который тут исправлён): данные из LocalStorage нельзя читать
 *  прямо в теле компонента на каждом рендере — JSON.parse каждый раз возвращает
 *  НОВЫЙ объект-ссылку, и любой useEffect от такого значения зацикливается,
 *  затирая пользовательский ввод. Поэтому читаем ОДИН раз в useState и
 *  обновляем только при изменении версии хранилища.
 *
 *  Завтра, при подключении Supabase/Postgres, эти хуки можно будет
 *  переписать на SWR/React-Query без правки экранов — API идентичен.
 */
import { useCallback, useEffect, useState } from 'react';
import { getRepository } from '@/lib/storage/repository';
import type {
  BodyWeightPoint,
  ChatMessage,
  ExerciseProgressPoint,
  TrainingProgram,
  UserProfile,
  WorkoutAnalysis,
} from '@/lib/types';

/**
 * Базовый сторадж-биндинг:
 *  - стартовая версия 0, монтируемся в useEffect -> bump до 1 (на клиенте),
 *    чтобы избежать SSR/CSR-расхождений (hydration mismatch);
 *  - подписываемся на межвкладочные storage-события.
 *
 *  Возвращает `version` — её используют потребители как ключ для useState.
 */
function useRepository() {
  const repo = getRepository();
  const [version, setVersion] = useState(0);

  const refresh = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    // На клиенте один раз форсируем чтение актуальных данных.
    setVersion((v) => v + 1);
    const handler = () => setVersion((v) => v + 1);
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  return { repo, version, refresh };
}

/**
 * Универсальный читатель: кладёт значение из репозитория в state и
 * обновляет его ТОЛЬКО при смене version (а не при каждом рендере).
 * Благодаря этому ссылка стабильна между записями в хранилище.
 */
function useStored<T>(read: () => T, version: number) {
  const [value, setValue] = useState<T>(read);
  useEffect(() => {
    setValue(read());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version]);
  return value;
}

/* ----------------------------- Анкета ----------------------------- */
export function useProfile() {
  const { repo, version, refresh } = useRepository();
  const profile = useStored(() => repo.getProfile(), version);
  const save = useCallback(
    (p: UserProfile) => {
      repo.saveProfile({ ...p, updatedAt: new Date().toISOString() });
      refresh();
    },
    [repo, refresh],
  );
  return { profile, saveProfile: save };
}

/* --------------------------- Программы ---------------------------- */
export function useCurrentProgram() {
  const { repo, version, refresh } = useRepository();
  const program = useStored(() => repo.getCurrentProgram(), version);
  const set = useCallback(
    (p: TrainingProgram | null) => {
      repo.setCurrentProgram(p);
      if (p) repo.saveProgram(p);
      refresh();
    },
    [repo, refresh],
  );
  return { program, setProgram: set };
}

export function usePrograms() {
  const { repo, version, refresh } = useRepository();
  const programs = useStored(() => repo.listPrograms(), version);
  const remove = useCallback(
    (id: string) => {
      repo.deleteProgram(id);
      refresh();
    },
    [repo, refresh],
  );
  return { programs, deleteProgram: remove };
}

/* ---------------------------- Анализы ----------------------------- */
export function useAnalyses() {
  const { repo, version, refresh } = useRepository();
  const analyses = useStored(() => repo.listAnalyses(), version);
  const add = useCallback(
    (a: WorkoutAnalysis) => {
      repo.saveAnalysis(a);
      refresh();
    },
    [repo, refresh],
  );
  return { analyses, addAnalysis: add };
}

/* ----------------------- Прогресс: вес тела ----------------------- */
export function useBodyWeight() {
  const { repo, version, refresh } = useRepository();
  const points = useStored(() => repo.getBodyWeight(), version);
  const add = useCallback(
    (p: BodyWeightPoint) => {
      repo.addBodyWeightPoint(p);
      refresh();
    },
    [repo, refresh],
  );
  return { points, addPoint: add };
}

/* --------------------- Прогресс: рабочие веса --------------------- */
export function useExerciseProgress() {
  const { repo, version, refresh } = useRepository();
  const points = useStored(() => repo.getExerciseProgress(), version);
  const add = useCallback(
    (p: ExerciseProgressPoint) => {
      repo.addExerciseProgressPoint(p);
      refresh();
    },
    [repo, refresh],
  );
  return { points, addPoint: add };
}

/* ------------------------------- Чат ------------------------------ */
export function useChat() {
  const { repo, version, refresh } = useRepository();
  const messages = useStored(() => repo.getChat(), version);
  const save = useCallback(
    (m: ChatMessage[]) => {
      repo.saveChat(m);
      refresh();
    },
    [repo, refresh],
  );
  return { messages, saveMessages: save };
}

/* --------------------------- Избранное ---------------------------- */
export function useFavorites() {
  const { repo, version, refresh } = useRepository();
  const favorites = useStored(() => repo.getFavorites(), version);

  /** Перезаписать весь список избранного. */
  const saveFavorites = useCallback(
    (ids: string[]) => {
      repo.saveFavorites(ids);
      refresh();
    },
    [repo, refresh],
  );

  /** Переключить упражнение в/из избранного. Возвращает новое состояние. */
  const toggleFavorite = useCallback(
    (id: string): boolean => {
      const current = repo.getFavorites();
      const isFav = current.includes(id);
      const next = isFav ? current.filter((x) => x !== id) : [...current, id];
      repo.saveFavorites(next);
      refresh();
      return !isFav; // новое состояние: добавили → true
    },
    [repo, refresh],
  );

  const isFavorite = useCallback(
    (id: string) => favorites.includes(id),
    [favorites],
  );

  return { favorites, saveFavorites, toggleFavorite, isFavorite };
}
