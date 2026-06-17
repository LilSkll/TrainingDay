/**
 * ============================================================================
 *  Сервис анализа тренировки.
 * ============================================================================
 *  Принимает фактические результаты + самочувствие, возвращает структуриро-
 *  ванный анализ (summary, рекомендацию по нагрузке, список советов).
 * ============================================================================
 */
import type {
  LoadAdjustment,
  WorkoutAnalysis,
  WorkoutAnalysisInput,
} from '../../types';
import { getOrchestrator } from '../orchestrator';
import { ANALYST_SYSTEM_PROMPT } from '../prompts';

function buildUserPrompt(input: WorkoutAnalysisInput): string {
  const entries = input.entries
    .map(
      (e) =>
        `• ${e.exerciseName}: ${e.actualWeightKg} кг × ${e.reps} повт.`,
    )
    .join('\n');
  return `Проанализируй тренировку пользователя.

Фактические результаты:
${entries || '—'}

Самочувствие по шкале 1-5: ${input.wellbeing} (${input.wellbeing <= 2 ? 'плохо' : input.wellbeing === 3 ? 'нормально' : 'хорошо'}).
Уровень усталости 1-5: ${input.fatigue} (${input.fatigue >= 4 ? 'высокая' : input.fatigue === 3 ? 'средняя' : 'низкая'}).
Заметки пользователя: ${input.notes || 'нет'}

Верни СТРОГО JSON без markdown:
{
  "summary": "краткий разбор 1-2 предложения",
  "adjustment": "increase | decrease | keep",
  "recommendations": ["совет 1", "совет 2", "совет 3"]
}
`;
}

export async function analyzeWorkout(
  input: WorkoutAnalysisInput,
): Promise<WorkoutAnalysis> {
  const orchestrator = getOrchestrator();
  const llm = await orchestrator.complete({
    messages: [
      { role: 'system', content: ANALYST_SYSTEM_PROMPT },
      { role: 'user', content: buildUserPrompt(input) },
    ],
    temperature: 0.3,
    maxTokens: 800,
  });

  let summary = '';
  let adjustment: LoadAdjustment = 'keep';
  let recommendations: string[] = [];

  try {
    const text = llm.text
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();
    const first = text.indexOf('{');
    const last = text.lastIndexOf('}');
    const json = JSON.parse(text.slice(first, last + 1));
    summary = String(json.summary ?? '');
    adjustment = normalizeAdjustment(json.adjustment);
    recommendations = Array.isArray(json.recommendations)
      ? json.recommendations.map(String)
      : [];
  } catch {
    // fallback — простая эвристика
    const fb = fallbackAnalysis(input);
    summary = fb.summary;
    adjustment = fb.adjustment;
    recommendations = fb.recommendations;
  }

  if (!summary) summary = fallbackAnalysis(input).summary;

  return {
    summary,
    adjustment,
    recommendations,
    createdAt: new Date().toISOString(),
  };
}

function normalizeAdjustment(v: unknown): LoadAdjustment {
  if (v === 'increase' || v === 'decrease' || v === 'keep') return v;
  return 'keep';
}

/** Локальная эвристика, если модель не ответила валидно. */
function fallbackAnalysis(input: WorkoutAnalysisInput): WorkoutAnalysis {
  let adjustment: LoadAdjustment = 'keep';
  if (input.fatigue >= 4 || input.wellbeing <= 2) adjustment = 'decrease';
  else if (input.wellbeing >= 4 && input.fatigue <= 2) adjustment = 'increase';

  return {
    summary:
      adjustment === 'increase'
        ? 'Хорошее самочувствие и низкая усталость — есть запас для прогрессии.'
        : adjustment === 'decrease'
          ? 'Высокая усталость или низкое самочувствие — стоит снизить нагрузку.'
          : 'Нагрузка соответствует восстановлению — продолжаем в том же режиме.',
    adjustment,
    recommendations:
      adjustment === 'increase'
        ? ['Увеличь рабочий вес на 2.5–5%', 'Следи за техникой при новых весах']
        : adjustment === 'decrease'
          ? ['Снизь вес на 5–10%', 'Добавь отдых между подходами', 'Удели время сну']
          : ['Сохраняй текущие веса', 'Фокусируйся на технике'],
    createdAt: new Date().toISOString(),
  };
}
