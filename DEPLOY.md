# Деплой на Vercel

Проект уже на GitHub: **https://github.com/LilSkll/TrainingDay**

## Шаг 1. Импорт в Vercel

1. Откройте **https://vercel.com/new**
2. Авторизуйтесь через GitHub.
3. Нажмите **Import Git Repository** → выберите `LilSkll/TrainingDay`.
4. Vercel сам определит Next.js — настройки менять не нужно:
   - **Framework Preset:** Next.js
   - **Build Command:** `next build`
   - **Output Directory:** `.next`
   - **Install Command:** `npm install`

## Шаг 2. Переменные окружения (сюда вставить ключ Groq)

На шаге **Environment Variables** добавьте **минимум две** переменные:

| Key | Value | Назначение |
| --- | --- | --- |
| `LLM_PROVIDER` | `groq` | Активировать Groq вместо mock-режима |
| `GROQ_API_KEY` | `gsk_...` | Ваш ключ из https://console.groq.com/keys |
| `GROQ_MODEL` | `llama-3.3-70b-versatile` | *(опционально)* модель по умолчанию |

> Без `LLM_PROVIDER` и `GROQ_API_KEY` приложение **тоже работает** — просто в
> mock-режиме (генерирует заглушечный план локально). Это удобно для первой
> проверки деплоя.

Опционально (на будущее) — можно сразу добавить OpenAI/Gemini:

```
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
GEMINI_API_KEY=
GEMINI_MODEL=gemini-1.5-flash
```

## Шаг 3. Deploy

Нажмите **Deploy**. Первый билд занимает ~1–2 минуты.
Готовую ссылку вида `https://training-day.vercel.app` Vercel выдаст сразу.

## Проверка

- `/` — главная с кнопкой «Создать программу»
- Заполните анкету → `/program` — сгенерированный план
- Чип «Источник» в шапке программы покажет `groq` (а не `mock`), значит ключ подхватился

## Дальнейшие деплои

Любой `git push origin main` → Vercel **автоматически** пересобирает и
деплоит. Превью-деплой создаётся для каждой ветки/PR.

## Локально

```bash
npm install
npm run dev   # http://localhost:3000
```
