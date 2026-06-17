/**
 * Экран «AI-Тренер» — чат с персональным ассистентом.
 *  Контекст (анкета + текущая программа) автоматически прокидывается
 *  в каждый запрос, чтобы тренер «помнил» вашу ситуацию.
 *  История хранится в LocalStorage.
 */
import SendIcon from '@mui/icons-material/Send';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import { useEffect, useRef, useState } from 'react';
import PageHeader from '@/components/common/PageHeader';
import PageShell from '@/components/layout/PageShell';
import { useChat, useCurrentProgram, useProfile } from '@/hooks/useStorage';
import type { ChatMessage } from '@/lib/types';

/** Быстрые подсказки — частые кейсы из ТЗ. */
const QUICK_PROMPTS = [
  'Сегодня болит плечо',
  'Не выспался',
  'Есть только гантели',
  'Могу тренироваться 30 минут',
];

const WELCOME: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    'Привет! Я ваш AI-тренер. Расскажите, что не так с тренировкой сегодня — травма, усталость, нехватка времени, ограниченное оборудование — и я помогу адаптировать программу.',
  createdAt: new Date().toISOString(),
};

export default function TrainerPage() {
  const { profile } = useProfile();
  const { program } = useCurrentProgram();
  const { messages, saveMessages } = useChat();

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Отображаем welcome-сообщение первым, если истории ещё нет.
  const visible = messages.length ? messages : [WELCOME];

  // Автоскролл вниз при появлении новых сообщений.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [visible.length, loading]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setInput('');
    setLoading(true);

    // Оптимистично добавляем сообщение пользователя.
    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      role: 'user',
      content: trimmed,
      createdAt: new Date().toISOString(),
    };
    const history = messages; // то, что уже сохранено
    saveMessages([...history, userMsg]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history,
          message: trimmed,
          profile,
          programSummary: program?.summary ?? null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? 'Не удалось получить ответ');
      }
      const { message } = await res.json();
      saveMessages([...history, userMsg, message]);
    } catch (e) {
      // Сообщение об ошибке тоже как assistant-реплика, чтобы было видно.
      const errMsg: ChatMessage = {
        id: `e_${Date.now()}`,
        role: 'assistant',
        content:
          '⚠️ ' +
          (e instanceof Error ? e.message : 'Ошибка соединения с AI. Попробуйте ещё раз.'),
        createdAt: new Date().toISOString(),
      };
      saveMessages([...history, userMsg, errMsg]);
    } finally {
      setLoading(false);
    }
  }

  function handleClear() {
    saveMessages([]);
  }

  return (
    <PageShell maxWidth="md">
      <PageHeader
        title="AI-Тренер"
        subtitle="Адаптирует программу под вашу текущую ситуацию."
        action={
          messages.length > 0 && (
            <Button onClick={handleClear} variant="text" color="inherit">
              Очистить
            </Button>
          )
        }
      />

      {/* Чат-окно */}
      <Card sx={{ display: 'flex', flexDirection: 'column', height: '60vh', minHeight: 420 }}>
        <Box
          ref={scrollRef}
          sx={{
            flex: 1,
            overflowY: 'auto',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
          }}
        >
          {visible.map((m) => (
            <Bubble key={m.id} message={m} />
          ))}
          {loading && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pl: 1 }}>
              <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.main' }}>
                <FitnessCenterIcon fontSize="small" />
              </Avatar>
              <CircularProgress size={18} />
              <Typography variant="caption" color="text.secondary">
                тренер печатает…
              </Typography>
            </Box>
          )}
        </Box>

        {/* Быстрые подсказки */}
        <Stack direction="row" spacing={1} sx={{ px: 2, py: 1, flexWrap: 'wrap' }} useFlexGap>
          {QUICK_PROMPTS.map((q) => (
            <Chip
              key={q}
              label={q}
              variant="outlined"
              clickable
              onClick={() => send(q)}
              disabled={loading}
            />
          ))}
        </Stack>

        <Divider />

        {/* Поле ввода */}
        <Box sx={{ p: 1.5 }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder="Напишите тренеру…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    color="primary"
                    onClick={() => send(input)}
                    disabled={loading || !input.trim()}
                    aria-label="Отправить"
                  >
                    <SendIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Card>

      {/* Контекст-бар */}
      <CardContent component={Paper} variant="outlined" sx={{ mt: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Контекст тренера:
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }} useFlexGap>
          <Chip
            size="small"
            label={profile ? `Цель: ${profile.goal}` : 'Анкета не заполнена'}
            variant="outlined"
          />
          <Chip
            size="small"
            label={program ? `План: ${program.title}` : 'Программа не создана'}
            variant="outlined"
          />
        </Stack>
      </CardContent>
    </PageShell>
  );
}

/** Одна реплика чата. */
function Bubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  return (
    <Box
      sx={{
        alignSelf: isUser ? 'flex-end' : 'flex-start',
        maxWidth: '85%',
        display: 'flex',
        flexDirection: isUser ? 'row-reverse' : 'row',
        gap: 1,
        alignItems: 'flex-end',
      }}
    >
      {!isUser && (
        <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.main' }}>
          <FitnessCenterIcon fontSize="small" />
        </Avatar>
      )}
      <Paper
        elevation={0}
        sx={{
          px: 1.75,
          py: 1.25,
          borderRadius: 3,
          bgcolor: isUser ? 'primary.main' : 'background.paper',
          color: isUser ? '#fff' : 'text.primary',
          border: (t) => (isUser ? 'none' : `1px solid ${t.palette.divider}`),
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        <Typography variant="body2">{message.content}</Typography>
      </Paper>
    </Box>
  );
}
