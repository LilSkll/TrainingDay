/**
 * ============================================================================
 *  Генерация целевых YouTube-поисков для упражнений.
 * ============================================================================
 *
 *  Центральная утилита: единое место, где формируются поисковые запросы,
 *  отсекающие кликбейт и нацеленные на качество (обучающие видео, разборы
 *  ошибок, подводящие движения, материалы для новичков).
 *
 *  Используется и в карточках, и в модалке — гарантирует, что запросы
 *  идентичны везде.
 * ============================================================================
 */

export type YoutubeQueryKind =
  | 'technique' // как правильно выполнять
  | 'mistakes' // частые ошибки
  | 'warmup' // разминка / подводящие
  | 'beginner'; // версия для новичков

export interface YoutubeLink {
  kind: YoutubeQueryKind;
  /** Короткая подпись для кнопки. */
  label: string;
  /** Полный URL на YouTube-поиск. */
  url: string;
}

/** Подписи для каждого типа запроса (RU). */
const LABELS: Record<YoutubeQueryKind, string> = {
  technique: 'Техника',
  mistakes: 'Ошибки',
  warmup: 'Разминка',
  beginner: 'Новичкам',
};

/**
 * Суффиксы-модификаторы запроса. Подобраны так, чтобы YouTube выдавал
 * обучающий контент, а не подборки «top 10» или кликбейт:
 *  - «как правильно» / «разбор техники» — уроки тренеров;
 *  - «ошибки» — разборы частых нарушений;
 *  - «разминка» + «подводящие» — подготовка и упрощённые варианты;
 *  - «для новичков» + «обучение» — базовые обучающие видео.
 */
const SUFFIXES: Record<YoutubeQueryKind, string> = {
  technique: 'как правильно техника выполнения разбор',
  mistakes: 'частые ошибки как не делать',
  warmup: 'разминка подводящие упражнения подготовка',
  beginner: 'для новичков обучение с нуля',
};

/**
 * Строит URL YouTube-поиска для заданного названия упражнения и типа запроса.
 *  encoded как параметры, + → %20 (пробел).
 */
function buildUrl(exerciseName: string, kind: YoutubeQueryKind): string {
  const query = `${exerciseName} ${SUFFIXES[kind]}`;
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

/**
 * Возвращает ВСЕ 4 целевых YouTube-ссылки для упражнения.
 *  Основной API — используется в модалке и в быстром меню.
 */
export function getYoutubeLinks(exerciseName: string): YoutubeLink[] {
  return (Object.keys(SUFFIXES) as YoutubeQueryKind[]).map((kind) => ({
    kind,
    label: LABELS[kind],
    url: buildUrl(exerciseName, kind),
  }));
}

/**
 * Возвращает одну ссылку заданного типа (для отдельных кнопок на карточках).
 *  Удобно, когда нужна только одна конкретная.
 */
export function getYoutubeLink(
  exerciseName: string,
  kind: YoutubeQueryKind = 'technique',
): YoutubeLink {
  return { kind, label: LABELS[kind], url: buildUrl(exerciseName, kind) };
}

/**
 * Открывает YouTube-поиск в новой вкладке. Вынесено отдельно, чтобы
 * логика открытия была в одном месте (и здесь же можно добавить аналитику).
 */
export function openYoutube(url: string): void {
  if (typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
