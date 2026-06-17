/**
 * Удобные React-хуки над репозиторием.
 *  Читают данные из LocalStorage, дают сеттеры, и при изменении форсируют
 *  перерисовку компонента (через локальный счетчик версий).
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

/** Простой сторадж-биндинг: подписка на изменение + ручной bump версии. */
function useRepository() {
  const repo = getRepository();
  const [version, bump] = useState(0);
  const refresh = useCallback(() => bump((v) => v + 1), []);
  // Подписываемся на storage-события между вкладками.
  useEffect(() => {
    const handler = () => bump((v) => v + 1);
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);
  return { repo, version, refresh };
}

/* ----------------------------- Анкета ----------------------------- */
export function useProfile() {
  const { repo, version, refresh } = useRepository();
  const profile = repo.getProfile();
  const save = useCallback(
    (p: UserProfile) => {
      repo.saveProfile({ ...p, updatedAt: new Date().toISOString() });
      refresh();
    },
    [repo, refresh],
  );
  return { profile, saveProfile: save, version };
}

/* --------------------------- Программы ---------------------------- */
export function useCurrentProgram() {
  const { repo, version, refresh } = useRepository();
  const program = repo.getCurrentProgram();
  const set = useCallback(
    (p: TrainingProgram | null) => {
      repo.setCurrentProgram(p);
      if (p) repo.saveProgram(p);
      refresh();
    },
    [repo, refresh],
  );
  return { program, setProgram: set, version };
}

export function usePrograms() {
  const { repo, version, refresh } = useRepository();
  const remove = useCallback(
    (id: string) => {
      repo.deleteProgram(id);
      refresh();
    },
    [repo, refresh],
  );
  return { programs: repo.listPrograms(), deleteProgram: remove, version };
}

/* ---------------------------- Анализы ----------------------------- */
export function useAnalyses() {
  const { repo, version, refresh } = useRepository();
  const add = useCallback(
    (a: WorkoutAnalysis) => {
      repo.saveAnalysis(a);
      refresh();
    },
    [repo, refresh],
  );
  return { analyses: repo.listAnalyses(), addAnalysis: add, version };
}

/* ----------------------- Прогресс: вес тела ----------------------- */
export function useBodyWeight() {
  const { repo, version, refresh } = useRepository();
  const add = useCallback(
    (p: BodyWeightPoint) => {
      repo.addBodyWeightPoint(p);
      refresh();
    },
    [repo, refresh],
  );
  return { points: repo.getBodyWeight(), addPoint: add, version };
}

/* --------------------- Прогресс: рабочие веса --------------------- */
export function useExerciseProgress() {
  const { repo, version, refresh } = useRepository();
  const add = useCallback(
    (p: ExerciseProgressPoint) => {
      repo.addExerciseProgressPoint(p);
      refresh();
    },
    [repo, refresh],
  );
  return { points: repo.getExerciseProgress(), addPoint: add, version };
}

/* ------------------------------- Чат ------------------------------ */
export function useChat() {
  const { repo, version, refresh } = useRepository();
  const messages = repo.getChat();
  const save = useCallback(
    (m: ChatMessage[]) => {
      repo.saveChat(m);
      refresh();
    },
    [repo, refresh],
  );
  return { messages, saveMessages: save, version };
}
