/**
 * Mock-провайдер LLM.
 *
 * Нужен для двух вещей:
 *  1. Локальной разработки без API-ключей — продукт можно демонстрировать «из коробки».
 *  2. Fallback, если настоящий провайдер недоступен (нет ключа / упал запрос).
 *
 *  Mock НЕ генерирует «осмысленный» текст — он просто возвращает переданный
 *  ему контент из бизнес-сервисов (см. mockProgram / mockAnalysis), выступая
 *  как «транспорт». Вся «интеллектуальная» часть для mock живёт в сервисах,
 *  чтобы реальный LLM получал тот же самый промпт, что и mock.
 *
 *  Это сделано намеренно: один и тот же путь кода для онлайн- и офлайн-режима.
 */
import type { LLMProvider, LLMRequest, LLMResponse } from '../types';

export class MockProvider implements LLMProvider {
  readonly name = 'mock';

  isAvailable(): boolean {
    return true; // всегда доступен
  }

  async complete(req: LLMRequest): Promise<LLMResponse> {
    // Имитируем сетевую задержку, чтобы UI показывал loading-состояние.
    await new Promise((r) => setTimeout(r, 600));

    // Для mock-режима договорились: сервис кладёт готовый ответ в поле
    // `assistant` последнего сообщения. Если его нет — возвращаем заглушку.
    const injected = [...req.messages]
      .reverse()
      .find((m) => m.role === 'assistant' && m.content.startsWith('__MOCK__:'));

    const text = injected
      ? injected.content.replace('__MOCK__:', '').trim()
      : 'Mock-режим: задайте LLM_PROVIDER и ключ, чтобы получить ответ модели.';

    return { text, provider: this.name, model: 'mock-1.0' };
  }
}
