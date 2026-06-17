/**
 * POST /api/chat
 *
 * Тело: { history: ChatMessage[], message: string, profile?: UserProfile, programSummary?: string }
 * Ответ: { message: ChatMessage }
 */
import { withApi, readJson } from '@/lib/api/withApi';
import { chat } from '@/lib/llm/services/chatService';
import type { ChatMessage, UserProfile } from '@/lib/types';

interface RequestBody {
  history: ChatMessage[];
  message: string;
  profile?: UserProfile | null;
  programSummary?: string | null;
}

interface Response {
  message: ChatMessage;
}

export default withApi<Response>(
  { methods: ['POST'] },
  async (req, res) => {
    const body = readJson<RequestBody>(req);

    if (!body.message || typeof body.message !== 'string') {
      throw new Error('Поле message обязательно');
    }

    const message = await chat({
      history: Array.isArray(body.history) ? body.history : [],
      message: body.message,
      profile: body.profile ?? null,
      programSummary: body.programSummary ?? null,
    });

    res.status(200).json({ message });
  },
);
