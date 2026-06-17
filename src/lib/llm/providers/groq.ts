/**
 * Groq-провайдер.
 *
 *  Использует OpenAI-совместимый Chat Completions API Groq
 *  (https://api.groq.com/openai/v1/chat/completions), поэтому реализация
 *  максимально простая и не требует сторонних SDK.
 */
import type { LLMProvider, LLMRequest, LLMResponse } from '../types';

interface GroqConfig {
  apiKey?: string;
  model?: string;
}

export class GroqProvider implements LLMProvider {
  readonly name = 'groq';
  private readonly apiKey: string | undefined;
  private readonly model: string;

  constructor(cfg: GroqConfig = {}) {
    this.apiKey = cfg.apiKey ?? process.env.GROQ_API_KEY;
    this.model = cfg.model ?? process.env.GROQ_MODEL ?? 'llama-3.3-70b-versatile';
  }

  isAvailable(): boolean {
    return Boolean(this.apiKey);
  }

  async complete(req: LLMRequest): Promise<LLMResponse> {
    if (!this.apiKey) {
      throw new Error('GroqProvider: GROQ_API_KEY не задан');
    }

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: req.messages,
        temperature: req.temperature ?? 0.4,
        max_tokens: req.maxTokens ?? 2048,
      }),
    });

    if (!res.ok) {
      throw new Error(`Groq API error ${res.status}: ${await res.text()}`);
    }

    const data = await res.json();
    const text: string = data?.choices?.[0]?.message?.content ?? '';
    return { text, provider: this.name, model: this.model };
  }
}
