/**
 * ============================================================================
 *  Оркестратор моделей (ModelOrchestrator).
 * ============================================================================
 *
 *  Единственная точка, через которую сервисы обращаются к LLM.
 *  Отвечает за:
 *    1. Выбор активного провайдера по env (LLM_PROVIDER).
 *    2. Fallback-цепочку: если выбранный провайдер не доступен/упал —
 *       перебираем остальные, и в самом конце всегда есть Mock.
 *    3. Возврат имени фактического провайдера (для прозрачности в UI).
 *
 *  Добавить нового провайдера = реализовать LLMProvider и зарегистрировать
 *  его в `buildProviders()`. Больше нигде код менять не нужно.
 * ============================================================================
 */
import { GroqProvider } from './providers/groq';
import { GeminiProvider } from './providers/gemini';
import { MockProvider } from './providers/mock';
import { OpenAIProvider } from './providers/openai';
import type { LLMProvider, LLMRequest, LLMResponse } from './types';

export type ProviderName = 'groq' | 'openai' | 'gemini' | 'mock';

export class ModelOrchestrator {
  private readonly providers: Map<ProviderName, LLMProvider>;
  private readonly preferred: ProviderName;

  constructor() {
    this.providers = buildProviders();
    this.preferred = resolvePreferredProvider();
  }

  /** Имя предпочтительного провайдера (для отображения в UI). */
  get preferredName(): ProviderName {
    return this.preferred;
  }

  /**
   * Главный метод. Пытается preferred-провайдера, затем остальных доступных,
   * в самом конце — Mock (он всегда доступен).
   */
  async complete(req: LLMRequest): Promise<LLMResponse> {
    const ordered = this.orderedCandidates();
    let lastError: unknown = null;

    for (const provider of ordered) {
      if (!provider.isAvailable()) continue;
      try {
        return await provider.complete(req);
      } catch (err) {
        lastError = err;
        // логируем и идём к следующему кандидату
        console.warn(`[orchestrator] ${provider.name} failed, trying fallback`, err);
      }
    }

    // До сюда дойти почти невозможно (Mock всегда отвечает),
    // но на всякий случай кидаем последнюю ошибку.
    throw lastError ?? new Error('No LLM provider available');
  }

  /** Цепочка попыток: preferred -> остальные доступные -> Mock гарантированно последним. */
  private orderedCandidates(): LLMProvider[] {
    const result: LLMProvider[] = [];
    const seen = new Set<string>();

    const pushIfKnown = (name: ProviderName) => {
      const p = this.providers.get(name);
      if (p && !seen.has(p.name)) {
        result.push(p);
        seen.add(p.name);
      }
    };

    pushIfKnown(this.preferred);
    // Остальные провайдеры — в стабильном порядке.
    (['groq', 'openai', 'gemini'] as ProviderName[]).forEach(pushIfKnown);
    // Mock — гарантированно последним.
    pushIfKnown('mock');
    return result;
  }
}

/* -------------------------------------------------------------------------- */
/*  Фабрики                                                                     */
/* -------------------------------------------------------------------------- */

function buildProviders(): Map<ProviderName, LLMProvider> {
  const map = new Map<ProviderName, LLMProvider>();
  map.set('groq', new GroqProvider());
  map.set('openai', new OpenAIProvider());
  map.set('gemini', new GeminiProvider());
  map.set('mock', new MockProvider()); // всегда есть
  return map;
}

function resolvePreferredProvider(): ProviderName {
  // 1. Явно указанный провайдер имеет высший приоритет.
  const raw = (process.env.LLM_PROVIDER ?? '').toLowerCase().trim();
  if (raw === 'groq' || raw === 'openai' || raw === 'gemini' || raw === 'mock') {
    return raw;
  }

  // 2. Если LLM_PROVIDER не задан — автоопределение по наличию ключа.
  //    Это спасает от частой ошибки деплоя: ключ вставили, а провайдер
  //    забыли указать, и оркестратор молча уходит в mock.
  if (process.env.GROQ_API_KEY) return 'groq';
  if (process.env.OPENAI_API_KEY) return 'openai';
  if (process.env.GEMINI_API_KEY) return 'gemini';

  // 3. Ничего нет — mock.
  return 'mock';
}

/** Синглтон оркестратора — создаётся один раз на процесс. */
let _orchestrator: ModelOrchestrator | null = null;
export function getOrchestrator(): ModelOrchestrator {
  if (!_orchestrator) _orchestrator = new ModelOrchestrator();
  return _orchestrator;
}
