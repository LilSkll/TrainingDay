#!/usr/bin/env node
/**
 * Генератор SVG-плейсхолдеров для упражнений.
 *
 * Реальные фотографии лучше положить позже, заменив файлы в
 * /public/images/exercises/. SVG-плейсхолдеры сделаны минималистичными
 * (Notion/Apple Fitness vibe), без внешних зависимостей.
 */
const fs = require('fs');
const path = require('path');

const json = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, '..', 'src', 'data', 'exercises.json'),
    'utf8',
  ),
);

const OUT_DIR = path.join(__dirname, '..', 'public', 'images', 'exercises');
fs.mkdirSync(OUT_DIR, { recursive: true });

// Палитра под бренд.
const BG = '#eef2ff';
const BG2 = '#e0e7ff';
const INK = '#4f46e5';
const INK2 = '#6366f1';
const TEXT = '#1e1b4b';

/** Возвращает имя файла svg по id упражнения. */
function svgFile(id) {
  return `${id}.svg`;
}

/**
 * Рисуем абстрактную фигуру + иконку гантели + название.
 * Не пытаемся изобразить упражнение анатомически — это плейсхолдер.
 */
function renderSvg(name) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300" role="img" aria-label="${escapeXml(name)}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${BG}"/>
      <stop offset="1" stop-color="${BG2}"/>
    </linearGradient>
  </defs>
  <rect width="400" height="300" fill="url(#g)"/>

  <!-- абстрактная фигура (силуэт спортсмена) -->
  <g fill="none" stroke="${INK2}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" opacity="0.85">
    <circle cx="200" cy="95" r="22" fill="${INK}"/>
    <path d="M200 120 L200 195 M200 140 L155 165 M200 140 L245 165 M200 195 L165 250 M200 195 L235 250"/>
  </g>

  <!-- иконка гантели -->
  <g transform="translate(285,225) rotate(-20)" fill="${INK}">
    <rect x="-30" y="-7" width="60" height="14" rx="4"/>
    <rect x="-38" y="-14" width="10" height="28" rx="3"/>
    <rect x="28" y="-14" width="10" height="28" rx="3"/>
  </g>

  <!-- подпись -->
  <text x="20" y="285" font-family="Inter, system-ui, sans-serif" font-size="22" font-weight="700" fill="${TEXT}">${escapeXml(name)}</text>
</svg>`;
}

function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

let count = 0;
for (const ex of json) {
  const file = path.join(OUT_DIR, svgFile(ex.id));
  fs.writeFileSync(file, renderSvg(ex.name), 'utf8');
  count++;
}

console.log(`✓ Generated ${count} exercise SVGs into ${OUT_DIR}`);
