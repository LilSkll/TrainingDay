/**
 * ============================================================================
 *  Сервис генерации программы тренировок.
 * ============================================================================
 *
 *  Отвечает за:
 *    1. Формирование user-prompt на основе анкеты.
 *    2. Отправку запроса в оркестратор моделей.
 *    3. Парсинг ответа (ожидаем строгий JSON) в доменный TrainingProgram.
 *    4. Если ответ не парсится — мягкий fallback на JSON-repair / mock-план.
 *
 *  Зависимости: только ModelOrchestrator + библиотека упражнений.
 *  Не знает ни про API-роуты, ни про React — чистая бизнес-логика.
 * ============================================================================
 */
import {
  EXPERIENCE_LABELS,
  GOAL_LABELS,
  PLACE_LABELS,
} from '../../constants';
import type {
  Exercise,
  TrainingProgram,
  UserProfile,
  WorkoutDay,
} from '../../types';
import { getOrchestrator } from '../orchestrator';
import { COACH_SYSTEM_PROMPT } from '../prompts';

/* -------------------------------------------------------------------------- */
/*  Промпт-конструктор                                                          */
/* -------------------------------------------------------------------------- */

/** Описывает анкету человеческим языком — это попадёт в user-сообщение. */
function describeProfile(p: UserProfile): string {
  return [
    `Возраст: ${p.age} лет`,
    `Пол: ${p.gender === 'male' ? 'мужской' : 'женский'}`,
    `Рост: ${p.heightCm} см`,
    `Вес: ${p.weightKg} кг`,
    `Уровень подготовки: ${EXPERIENCE_LABELS[p.experience]}`,
    `Цель: ${GOAL_LABELS[p.goal]}`,
    `Тренировок в неделю: ${p.workoutsPerWeek}`,
    `Место тренировок: ${PLACE_LABELS[p.place]}`,
    `Оборудование: ${p.equipment.join(', ') || 'не указано'}`,
    `Травмы/ограничения: ${p.injuries || 'нет'}`,
    `Дополнительно: ${p.notes || 'нет'}`,
  ].join('\n');
}

/**
 * Строгий промпт, требующий JSON. Перечисляем доступные id упражнений из
 * библиотеки, чтобы модель по возможности использовала именно их — тогда
 * мы сможем автоматически подтянуть изображения.
 */
function buildUserPrompt(profile: UserProfile, exerciseIds: string[]): string {
  return `Составь тренировочную программу на неделю для пользователя.
Вот его анкета:

${describeProfile(profile)}

Требования к программе:
- Ровно ${profile.workoutsPerWeek} тренировочных дней.
- Учти место тренировок и доступное оборудование.
- Учти травмы и ограничения: если они есть, исключи опасные движения.
- По возможности используй упражнения из этого списка id (они есть в библиотеке с изображениями): ${exerciseIds.join(', ')}.

ОТВЕТ ВЕРНИ СТРОГО в виде JSON по такой схеме (без markdown, без пояснений, только JSON):
{
  "title": "краткое название программы",
  "summary": "1-2 предложения: логика программы",
  "days": [
    {
      "day": 1,
      "title": "Название дня, например «День ног»",
      "focus": "фокус дня, например «Сила / гипертрофия»",
      "exercises": [
        {
          "exerciseId": "id из библиотеки ИЛИ slug на латинице если своего",
          "name": "Русское название упражнения",
          "sets": 4,
          "reps": "8-10",
          "restSeconds": 90,
          "weightPercent": 75,
          "technique": "1-2 предложения про технику",
          "muscles": ["грудь", "трицепс"],
          "coachComment": "совет тренера по этому упражнению"
        }
      ]
    }
  ]
}
`;
}

/* -------------------------------------------------------------------------- */
/*  Парсинг ответа                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Достаёт первый осмысленный JSON-объект из произвольного текста модели.
 * Модели иногда оборачивают ответ в ```json ... ``` или добавляют текст.
 */
function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) return fenced[1].trim();
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return text.slice(firstBrace, lastBrace + 1);
  }
  return text.trim();
}

/** Нормализуем «день» из ответа модели в доменный WorkoutDay. */
function normalizeDay(raw: any, fallbackIdPool: string[]): WorkoutDay {
  const exercises = Array.isArray(raw?.exercises) ? raw.exercises : [];
  return {
    day: Number(raw?.day) || 1,
    title: String(raw?.title ?? `День ${raw?.day ?? 1}`),
    focus: String(raw?.focus ?? ''),
    exercises: exercises.map((e: any, i: number) => ({
      exerciseId: String(e?.exerciseId ?? fallbackIdPool[i] ?? `ex_${i}`),
      name: String(e?.name ?? 'Упражнение'),
      sets: Number(e?.sets) || 3,
      reps: String(e?.reps ?? '10'),
      restSeconds: Number(e?.restSeconds) || 60,
      weightPercent: Number(e?.weightPercent) || 60,
      technique: String(e?.technique ?? ''),
      muscles: Array.isArray(e?.muscles) ? e.muscles.map(String) : [],
      coachComment: String(e?.coachComment ?? ''),
    })),
  };
}

/* -------------------------------------------------------------------------- */
/*  Публичный API                                                               */
/* -------------------------------------------------------------------------- */

export interface GenerateProgramArgs {
  profile: UserProfile;
  exercises: Exercise[];
}

export async function generateProgram({
  profile,
  exercises,
}: GenerateProgramArgs): Promise<TrainingProgram> {
  const orchestrator = getOrchestrator();
  const exerciseIds = exercises.map((e) => e.id);

  const llm = await orchestrator.complete({
    messages: [
      { role: 'system', content: COACH_SYSTEM_PROMPT },
      { role: 'user', content: buildUserPrompt(profile, exerciseIds) },
    ],
    temperature: 0.5,
    maxTokens: 3500,
  });

  let days: WorkoutDay[] = [];
  let title = 'Персональная программа';
  let summary = '';

  try {
    const parsed = JSON.parse(extractJson(llm.text));
    title = String(parsed?.title ?? title);
    summary = String(parsed?.summary ?? '');
    const rawDays = Array.isArray(parsed?.days) ? parsed.days : [];
    days = rawDays.map((d: any, i: number) =>
      normalizeDay(d, exerciseIds.length ? exerciseIds : [`ex_${i}`]),
    );
  } catch {
    // Модель вернула не-JSON — используем детерминированный fallback.
    const fallback = mockProgram(profile, exercises);
    title = fallback.title;
    summary = fallback.summary;
    days = fallback.days;
  }

  // Гарантия: всегда есть хотя бы один день с упражнениями.
  if (days.length === 0) {
    const fallback = mockProgram(profile, exercises);
    days = fallback.days;
    if (!summary) summary = fallback.summary;
  }

  return {
    id: createId(),
    profileSnapshot: profile,
    title,
    summary,
    days,
    createdAt: new Date().toISOString(),
    provider: llm.provider,
  };
}

/* -------------------------------------------------------------------------- */
/*  Mock-план (используется ТОЛЬКО когда LLM-ответ не распарсен ИЛИ mock-режим) */
/* -------------------------------------------------------------------------- */

/** Сопоставление типов оборудования → приоритетные категории упражнений. */
function pickExercises(exercises: Exercise[], profile: UserProfile, dayIdx: number): Exercise[] {
  // фильтруем по доступному оборудованию
  const allowed = exercises.filter((ex) => {
    if (ex.requiredEquipment.includes('none')) return true;
    return ex.requiredEquipment.some((eq) =>
      profile.equipment.includes(eq) || profile.equipment.includes('none'),
    );
  });
  const pool = allowed.length ? allowed : exercises;
  // чередуем по дням, чтобы дни различались
  const start = (dayIdx * 3) % Math.max(pool.length, 1);
  return [0, 1, 2].map((i) => pool[(start + i) % pool.length]);
}

/** Детерминированная программа «по умолчанию», если LLM недоступен. */
export function mockProgram(profile: UserProfile, exercises: Exercise[]): TrainingProgram {
  const days: WorkoutDay[] = Array.from({ length: profile.workoutsPerWeek }, (_, i) => {
    const picked = pickExercises(exercises, profile, i);
    return {
      day: i + 1,
      title: `День ${i + 1}`,
      focus: GOAL_LABELS[profile.goal],
      exercises: picked.map((ex, j) => ({
        exerciseId: ex.id,
        name: ex.name,
        sets: profile.goal === 'strength' ? 5 : 4,
        reps:
          profile.goal === 'strength'
            ? '3-5'
            : profile.goal === 'muscle_gain'
              ? '8-12'
              : '12-15',
        restSeconds: profile.goal === 'strength' ? 180 : 75,
        weightPercent:
          profile.experience === 'beginner'
            ? 55
            : profile.experience === 'intermediate'
              ? 70
              : 80,
        technique: ex.description,
        muscles: ex.muscles,
        coachComment: `Контролируй темп, ${
          profile.experience === 'beginner' ? 'начни с разминки' : 'следи за прогрессией'
        }.`,
      })),
    };
  });

  return {
    id: createId(),
    profileSnapshot: profile,
    title: `${GOAL_LABELS[profile.goal]} · ${profile.workoutsPerWeek}×/нед`,
    summary: `Базовая программа из библиотеки под цель «${GOAL_LABELS[profile.goal]}» и уровень «${EXPERIENCE_LABELS[profile.experience]}». Сгенерирована локально (mock-режим).`,
    days,
    createdAt: new Date().toISOString(),
    provider: 'mock',
  };
}

/* -------------------------------------------------------------------------- */
/*  Утилиты                                                                     */
/* -------------------------------------------------------------------------- */

function createId(): string {
  // Крипто-стойкий id, если доступен; иначе — временный fallback.
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `id_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
