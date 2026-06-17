/**
 * ============================================================================
 *  Сервис библиотеки упражнений.
 * ============================================================================
 *  Загружает exercises.json и предоставляет удобный доступ:
 *    - получить всё / по id / по оборудованию
 *    - словарь id → Exercise для быстрого маппинга плана на изображения
 * ============================================================================
 */
import rawData from '@/data/exercises.json';
import type { Exercise, ExerciseEntry } from '@/lib/types';

/** Гарантированно валидный массив упражнений. */
export const EXERCISES: Exercise[] = (rawData as Exercise[]).map((e) => ({
  id: String(e.id),
  name: String(e.name),
  description: String(e.description),
  muscles: Array.isArray(e.muscles) ? e.muscles.map(String) : [],
  image: String(e.image),
  requiredEquipment: Array.isArray(e.requiredEquipment)
    ? (e.requiredEquipment as Exercise['requiredEquipment'])
    : [],
  // Новые опциональные поля. Если их нет в JSON — undefined, UI покажет
  // общее описание вместо пошаговой техники.
  techniqueSteps: Array.isArray(e.techniqueSteps) ? e.techniqueSteps.map(String) : undefined,
  commonMistakes: Array.isArray(e.commonMistakes) ? e.commonMistakes.map(String) : undefined,
  youtubeQuery: typeof e.youtubeQuery === 'string' ? e.youtubeQuery : undefined,
}));

/** Быстрый доступ по id — O(1). */
const BY_ID: Map<string, Exercise> = new Map(EXERCISES.map((e) => [e.id, e]));

export function getExerciseById(id: string): Exercise | undefined {
  return BY_ID.get(id);
}

/** Фильтр по доступному оборудованию пользователя (с запасом «none»). */
export function filterByEquipment(
  owned: Exercise['requiredEquipment'],
): Exercise[] {
  return EXERCISES.filter((ex) => {
    if (ex.requiredEquipment.includes('none')) return true;
    if (owned.includes('none')) return ex.requiredEquipment.includes('none');
    return ex.requiredEquipment.some((eq) => owned.includes(eq));
  });
}

/**
 * Дополняет записи плана изображением/описанием из библиотеки.
 * Если упражнение не из библиотеки — изображение остаётся пустым.
 */
export function enrichEntries(
  entries: ExerciseEntry[],
): Array<ExerciseEntry & { image?: string; libraryDescription?: string }> {
  return entries.map((entry) => {
    const lib = getExerciseById(entry.exerciseId);
    return {
      ...entry,
      image: lib?.image,
      libraryDescription: lib?.description,
    };
  });
}
