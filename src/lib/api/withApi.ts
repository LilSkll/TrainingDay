/**
 * Базовый класс для HTTP-обработчиков API-роутов.
 *
 *  Унифицирует:
 *    - валидацию method (только POST / GET / ...),
 *    - try/catch с единым форматом ошибок,
 *    - безопасное чтение JSON-тела.
 *
 *  В будущем сюда же ляжет rate-limiting, проверка JWT (когда появится
 *  авторизация) и подписка Stripe — без правки роутов.
 */
import type { NextApiRequest, NextApiResponse } from 'next';

export type ApiHandler<T> = (
  req: NextApiRequest,
  res: NextApiResponse<T>,
) => Promise<void> | void;

interface JsonBodyOptions {
  /** Разрешённые HTTP-методы. */
  methods: ('GET' | 'POST' | 'PUT' | 'DELETE')[];
}

/**
 * Декоратор-обёртка для API-роутов: метод-гейт + единая обработка ошибок.
 *
 * @example
 *   export default withApi({ methods: ['POST'] }, async (req, res) => {
 *     const body = readJson(req);
 *     ...
 *     res.status(200).json({ ok: true });
 *   });
 */
export function withApi<T>(
  opts: JsonBodyOptions,
  handler: ApiHandler<T>,
) {
  return async function route(
    req: NextApiRequest,
    res: NextApiResponse<T | { error: string }>,
  ) {
    // CORS (опционально, для будущего Telegram-бота / расширений).
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', opts.methods.join(', '));
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }
    if (!opts.methods.includes(req.method as any)) {
      res.setHeader('Allow', opts.methods.join(', '));
      res.status(405).json({ error: `Метод ${req.method} не поддерживается` });
      return;
    }
    try {
      await handler(req, res as NextApiResponse<T>);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Внутренняя ошибка сервера';
      console.error('[api] error', err);
      res.status(500).json({ error: message });
    }
  };
}

/** Безопасно парсит тело запроса как JSON. Бросает понятную ошибку. */
export function readJson<T = unknown>(req: NextApiRequest): T {
  const body = req.body;
  if (body && typeof body === 'object') return body as T;
  if (typeof body === 'string') {
    try {
      return JSON.parse(body) as T;
    } catch {
      throw new Error('Некорректный JSON в теле запроса');
    }
  }
  throw new Error('Пустое тело запроса');
}
