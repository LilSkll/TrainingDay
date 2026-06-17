/**
 * OpenAI-провайдер (Chat Completions API).
 *
 *  Подключается при LLM_PROVIDER=openai и наличии OPENAI_API_KEY.
 *  Реализация идентична Groq по форме, отличается только endpoint.
 */
import type { LLMProvider, LLMRequest, LLMResponse } from '../types';

interface OpenAIConfig {
  apiKey?: string;
  model?: string;
}

export class OpenAIProvider implements LLMProvider {
  readonly name = 'openai';
  private readonly apiKey: string | undefined;
  private readonly model: string;

  constructor(cfg: OpenAIConfig = {}) {
    this.apiKey = cfg.apiKey ?? process.env.OPENAI_API_KEY;
    this.model = cfg.model ?? process.env.OPENAI_MODEL ?? 'gpt-4o-mini';
  }

  isAvailable(): boolean {
    return Boolean(this.apiKey);
  }

  async complete(req: LLMRequest): Promise<LLMResponse> {
    if (!this.apiKey) {
      throw new Error('OpenAIProvider: OPENAI_API_KEY не задан');
    }

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
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
      throw new Error(`OpenAI API error ${res.status}: ${await res.text()}`);
    }

    const data = await res.json();
    const text: string = data?.choices?.[0]?.message?.content ?? '';
    return { text, provider: this.name, model: this.model };
  }
}
