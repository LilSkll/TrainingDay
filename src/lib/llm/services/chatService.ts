/**
 * ============================================================================
 *  Сервис чата с AI-тренером.
 * ============================================================================
 *  Хранит контекст диалога (последние N сообщений + система) и возвращает
 *  один ассистентский ответ. Само持久ание истории лежит на клиенте.
 * ============================================================================
 */
import type { ChatMessage, UserProfile } from '../../types';
import {
  EXPERIENCE_LABELS,
  GOAL_LABELS,
  PLACE_LABELS,
} from '../../constants';
import { getOrchestrator } from '../orchestrator';
import { ASSISTANT_SYSTEM_PROMPT } from '../prompts';

/** Сколько последних реплик держим в контексте, чтобы не раздувать токены. */
const MAX_HISTORY = 10;

export interface ChatArgs {
  /** Существующая история диалога (без новой реплики пользователя). */
  history: ChatMessage[];
  /** Новое сообщение пользователя. */
  message: string;
  /** Контекст пользователя — чтобы тренер «помнил» анкету. */
  profile?: UserProfile | null;
  /** Текущий план (если есть) — даёт тренеру опору для адаптации. */
  programSummary?: string | null;
}

export async function chat(args: ChatArgs): Promise<ChatMessage> {
  const { history, message, profile, programSummary } = args;
  const orchestrator = getOrchestrator();

  // Системное сообщение: базовый промпт + краткий профиль + план.
  const contextParts: string[] = [ASSISTANT_SYSTEM_PROMPT];
  if (profile) {
    contextParts.push(
      `\nКонтекст пользователя: ${EXPERIENCE_LABELS[profile.experience]}, цель — ${GOAL_LABELS[profile.goal]}, ${profile.workoutsPerWeek} тренировок/нед, место: ${PLACE_LABELS[profile.place]}, оборудование: ${profile.equipment.join(', ') || 'нет'}. Травмы: ${profile.injuries || 'нет'}.`,
    );
  }
  if (programSummary) {
    contextParts.push(`\nТекущая программа: ${programSummary}`);
  }

  // Берём только последние MAX_HISTORY реплик для контекста.
  const tail = history.slice(-MAX_HISTORY).map((m) => ({
    role: m.role === 'system' ? ('user' as const) : m.role,
    content: m.content,
  }));

  const llm = await orchestrator.complete({
    messages: [
      { role: 'system', content: contextParts.join('\n') },
      ...tail,
      { role: 'user', content: message },
    ],
    temperature: 0.6,
    maxTokens: 800,
  });

  return {
    id: createId(),
    role: 'assistant',
    content: llm.text,
    createdAt: new Date().toISOString(),
  };
}

function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `id_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
