/**
 * ============================================================================
 *  Экспорт тренировочной программы.
 * ============================================================================
 *  Два формата:
 *    - TXT: чистый текст, удобно для заметок / Telegram.
 *    - PDF: печатаем через печать браузера (window.print со скрытым стилем),
 *           чтобы не тянуть тяжёлые pdf-библиотеки на MVP.
 *
 *  В будущем PDF можно заменить на серверный рендер (puppeteer / pdf-lib),
 *  не трогая UI — кнопка просто вызовет другой сервис.
 * ============================================================================
 */
import { formatRest } from '@/lib/constants';
import type { TrainingProgram } from '@/lib/types';

/** Превращает программу в удобный plain-text. */
export function programToText(program: TrainingProgram): string {
  const lines: string[] = [];
  lines.push(program.title);
  lines.push('='.repeat(program.title.length));
  lines.push('');
  if (program.summary) {
    lines.push(program.summary);
    lines.push('');
  }
  lines.push(
    `Цель: ${program.profileSnapshot.goal} · Тренировок/нед: ${program.profileSnapshot.workoutsPerWeek} · Уровень: ${program.profileSnapshot.experience}`,
  );
  lines.push(`Сгенерировано: ${new Date(program.createdAt).toLocaleString('ru-RU')}`);
  lines.push('');

  for (const day of program.days) {
    lines.push('');
    lines.push(`День ${day.day}. ${day.title}`);
    if (day.focus) lines.push(`Фокус: ${day.focus}`);
    lines.push('-'.repeat(40));
    day.exercises.forEach((ex, i) => {
      lines.push(`${i + 1}. ${ex.name}`);
      lines.push(`   Подходы: ${ex.sets} · Повторения: ${ex.reps} · Отдых: ${formatRest(ex.restSeconds)} · Вес: ~${ex.weightPercent}% от max`);
      if (ex.technique) lines.push(`   Техника: ${ex.technique}`);
      if (ex.muscles.length) lines.push(`   Мышцы: ${ex.muscles.join(', ')}`);
      if (ex.coachComment) lines.push(`   Тренер: ${ex.coachComment}`);
      lines.push('');
    });
  }
  return lines.join('\n');
}

/** Скачивает программу как .txt через временный <a>. */
export function downloadTxt(program: TrainingProgram) {
  const text = programToText(program);
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  triggerDownload(blob, `${slug(program.title)}.txt`);
}

/**
 * «PDF» на MVP = открываем окно печати браузера с программой.
 *  Это даёт «Сохранить как PDF» из диалога печати без доп. зависимостей.
 */
export function downloadPdf(program: TrainingProgram) {
  const win = window.open('', '_blank', 'width=820,height=1000');
  if (!win) {
    alert('Разрешите всплывающие окна, чтобы скачать PDF.');
    return;
  }
  const html = programToHtml(program);
  win.document.open();
  win.document.write(html);
  win.document.close();
  // Немного ждём рендер, затем вызываем печать.
  win.onload = () => {
    setTimeout(() => {
      win.focus();
      win.print();
    }, 300);
  };
}

/* --------------------------- внутренние утилиты --------------------------- */

function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9а-я]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'program';
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** Минимальный HTML-шаблон для печати. */
function programToHtml(program: TrainingProgram): string {
  const days = program.days
    .map((day) => {
      const rows = day.exercises
        .map(
          (ex) => `
        <tr>
          <td><strong>${escapeHtml(ex.name)}</strong><br><small>${escapeHtml(ex.muscles.join(', '))}</small></td>
          <td>${ex.sets}</td>
          <td>${escapeHtml(ex.reps)}</td>
          <td>${formatRest(ex.restSeconds)}</td>
          <td>~${ex.weightPercent}%</td>
        </tr>
        <tr><td colspan="5" class="tech">${escapeHtml(ex.technique)}${ex.coachComment ? `<br><em>Тренер:</em> ${escapeHtml(ex.coachComment)}` : ''}</td></tr>`,
        )
        .join('');
      return `
      <section>
        <h2>День ${day.day}. ${escapeHtml(day.title)}</h2>
        ${day.focus ? `<p class="focus">Фокус: ${escapeHtml(day.focus)}</p>` : ''}
        <table>
          <thead>
            <tr><th>Упражнение</th><th>Подходы</th><th>Повторения</th><th>Отдых</th><th>Вес</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </section>`;
    })
    .join('');

  return `<!doctype html>
<html lang="ru"><head><meta charset="utf-8">
<title>${escapeHtml(program.title)}</title>
<style>
  body { font-family: -apple-system, 'Segoe UI', Roboto, sans-serif; color:#0f172a; margin:32px; }
  h1 { font-size: 24px; margin:0 0 4px; }
  h2 { font-size: 18px; margin:24px 0 8px; border-bottom:2px solid #4f46e5; padding-bottom:4px; }
  p.summary { color:#475569; margin:4px 0 16px; }
  p.focus { color:#4f46e5; font-weight:600; margin:0 0 8px; }
  table { width:100%; border-collapse:collapse; font-size:13px; }
  th,td { text-align:left; padding:6px 8px; border-bottom:1px solid #e2e8f0; vertical-align:top; }
  th { background:#f1f5f9; }
  td.tech { color:#475569; padding-left:8px; padding-bottom:12px; font-size:12px; }
  @media print { body { margin:12mm; } }
</style></head>
<body>
  <h1>${escapeHtml(program.title)}</h1>
  ${program.summary ? `<p class="summary">${escapeHtml(program.summary)}</p>` : ''}
  <p class="summary">Цель: ${escapeHtml(program.profileSnapshot.goal)} · Тренировок/нед: ${program.profileSnapshot.workoutsPerWeek} · Уровень: ${escapeHtml(program.profileSnapshot.experience)}</p>
  ${days}
</body></html>`;
}
