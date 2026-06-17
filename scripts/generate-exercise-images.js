#!/usr/bin/env node
/**
 * Генератор SVG-плейсхолдеров для упражнений (v2).
 *  Категоризация по мышцам → разная поза + иконка оборудования.
 *  Перегенерирует ВСЕ изображения в /public/images/exercises/.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const json = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'src', 'data', 'exercises.json'), 'utf8'),
);
const OUT_DIR = path.join(ROOT, 'public', 'images', 'exercises');
fs.mkdirSync(OUT_DIR, { recursive: true });

const C = { bg1: '#eef2ff', bg2: '#e0e7ff', ink: '#4f46e5', ink2: '#6366f1', text: '#1e1b4b' };

function category(ex) {
  const m = ex.muscles.join(' ').toLowerCase();
  if (m.includes('кардио')) return 'cardio';
  if (m.includes('косые')) return 'core';
  if (m.includes('кор') && m.length <= 8) return 'core';
  if (m.includes('грудь')) return 'chest';
  if (m.includes('спин')) return 'back';
  if (m.includes('дельт') || m.includes('плеч')) return 'shoulders';
  if (m.includes('бицепс') || m.includes('трицепс') || m.includes('предплеч')) return 'arms';
  if (m.includes('ягодиц') || m.includes('квадрицепсы') || m.includes('бедра') || m.includes('икры')) return 'legs';
  return 'core';
}

function figure(cat, ink, ink2) {
  const head = `<circle cx="200" cy="85" r="20" fill="${ink}"/>`;
  const torso = `<path d="M200 108 L200 185" stroke="${ink2}" stroke-width="14" stroke-linecap="round"/>`;
  switch (cat) {
    case 'chest': return head + torso +
      `<path d="M200 130 L150 150 M200 130 L250 150 M200 185 L165 245 M200 185 L235 245" stroke="${ink2}" stroke-width="12" stroke-linecap="round" fill="none"/>`;
    case 'back': return head + torso +
      `<path d="M200 115 L150 95 M200 115 L250 95 M200 185 L170 250 M200 185 L230 250" stroke="${ink2}" stroke-width="12" stroke-linecap="round" fill="none"/>`;
    case 'shoulders': return head + torso +
      `<path d="M200 125 L135 125 M200 125 L265 125 M200 185 L170 250 M200 185 L230 250" stroke="${ink2}" stroke-width="12" stroke-linecap="round" fill="none"/>`;
    case 'arms': return head + torso +
      `<path d="M200 128 L160 150 Q150 160 165 165 M200 128 L240 150 Q250 160 235 165 M200 185 L170 250 M200 185 L230 250" stroke="${ink2}" stroke-width="12" stroke-linecap="round" fill="none"/>`;
    case 'core': return head +
      `<path d="M150 130 L250 130" stroke="${ink2}" stroke-width="14" stroke-linecap="round"/>` +
      `<path d="M200 100 L200 165" stroke="${ink2}" stroke-width="14" stroke-linecap="round"/>` +
      `<path d="M200 165 L165 250 M200 165 L235 250" stroke="${ink2}" stroke-width="12" stroke-linecap="round" fill="none"/>`;
    case 'cardio': return head + torso +
      `<path d="M200 130 L155 140 M200 130 L255 145 M200 185 L160 235 L150 250 M200 185 L245 230 L260 240" stroke="${ink2}" stroke-width="12" stroke-linecap="round" fill="none"/>`;
    case 'legs': default: return head + torso +
      `<path d="M200 130 L155 155 M200 130 L245 155 M200 185 L150 250 M200 185 L250 250" stroke="${ink2}" stroke-width="12" stroke-linecap="round" fill="none"/>`;
  }
}

function equipmentIcon(ex, color) {
  const eq = ex.requiredEquipment || [];
  if (eq.includes('barbell')) return `<g transform="translate(300,40) rotate(-25)" fill="${color}"><rect x="-26" y="-6" width="52" height="12" rx="3"/><rect x="-34" y="-12" width="9" height="24" rx="2"/><rect x="25" y="-12" width="9" height="24" rx="2"/></g>`;
  if (eq.includes('dumbbells')) return `<g transform="translate(305,45) rotate(-20)" fill="${color}"><rect x="-22" y="-5" width="44" height="10" rx="3"/><rect x="-29" y="-11" width="8" height="22" rx="2"/><rect x="21" y="-11" width="8" height="22" rx="2"/></g>`;
  if (eq.includes('resistance_bands')) return `<g transform="translate(305,45)" fill="none" stroke="${color}" stroke-width="4"><path d="M-18 12 Q0 -14 18 12"/></g>`;
  if (eq.includes('pull_up_bar')) return `<g transform="translate(300,40)" fill="${color}"><rect x="-26" y="-3" width="52" height="6" rx="3"/></g>`;
  return `<g transform="translate(305,45)" fill="${color}"><path d="M2 -14 L-8 4 L0 4 L-2 14 L8 -4 L0 -4 Z"/></g>`;
}

function escapeXml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function renderSvg(ex) {
  const cat = category(ex);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300" role="img" aria-label="${escapeXml(ex.name)}">
  <defs>
    <linearGradient id="bg-${ex.id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${C.bg1}"/>
      <stop offset="1" stop-color="${C.bg2}"/>
    </linearGradient>
  </defs>
  <rect width="400" height="300" fill="url(#bg-${ex.id})"/>
  <g opacity="0.9">${figure(cat, C.ink, C.ink2)}</g>
  ${equipmentIcon(ex, C.ink)}
  <text x="20" y="282" font-family="Inter, system-ui, sans-serif" font-size="20" font-weight="700" fill="${C.text}">${escapeXml(ex.name)}</text>
  <text x="380" y="282" text-anchor="end" font-family="Inter, system-ui, sans-serif" font-size="12" font-weight="600" fill="${C.ink}" opacity="0.7">${cat.toUpperCase()}</text>
</svg>`;
}

let count = 0;
for (const ex of json) {
  fs.writeFileSync(path.join(OUT_DIR, `${ex.id}.svg`), renderSvg(ex), 'utf8');
  count++;
}
console.log(`Generated ${count} exercise SVGs (v2 style)`);
