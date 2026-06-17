/**
 * Google Gemini-провайдер (generateContent REST API).
 *
 *  Подключается при LLM_PROVIDER=gemini и наличии GEMINI_API_KEY.
 *  Использует нативный REST endpoint Gemini (не OpenAI-совместимый),
 *  поэтому здесь своя трансформация messages.
 */
import type { LLMMessage, LLMProvider, LLMRequest, LLMResponse } from '../types';

interface GeminiConfig {
  apiKey?: string;
  model?: string;
}

export class GeminiProvider implements LLMProvider {
  readonly name = 'gemini';
  private readonly apiKey: string | undefined;
  private readonly model: string;

  constructor(cfg: GeminiConfig = {}) {
    this.apiKey = cfg.apiKey ?? process.env.GEMINI_API_KEY;
    this.model = cfg.model ?? process.env.GEMINI_MODEL ?? 'gemini-1.5-flash';
  }

  isAvailable(): boolean {
    return Boolean(this.apiKey);
  }

  async complete(req: LLMRequest): Promise<LLMResponse> {
    if (!this.apiKey) {
      throw new Error('GeminiProvider: GEMINI_API_KEY не задан');
    }

    // Gemini: system-instruction отдельно, остальное — contents.
    const system = req.messages.find((m) => m.role === 'system');
    const contents = req.messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })) as GeminiContent[];

    const body: Record<string, unknown> = {
      contents,
      generationConfig: {
        temperature: req.temperature ?? 0.4,
        maxOutputTokens: req.maxTokens ?? 2048,
      },
    };
    if (system) {
      body.systemInstruction = { parts: [{ text: system.content }] };
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`Gemini API error ${res.status}: ${await res.text()}`);
    }

    const data = await res.json();
    const text: string =
      data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text).join('') ?? '';
    return { text, provider: this.name, model: this.model };
  }
}

interface GeminiContent {
  role: 'user' | 'model';
  parts: { text: string }[];
}

/** Нужен, чтобы TS не ругался на неиспользуемый импорт типа в маппинге. */
export type { LLMMessage };
