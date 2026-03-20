/**
 * analyzers/mood.js — Mood as Color analyzer
 */
import { $, show, statBox, progBar, badge } from '../utils.js';

export const ACTIVITIES = [
  { name:'Olahraga',      color:'#e8923a', emoji:'🏃', mood:+2 },
  { name:'Kerja/Belajar', color:'#4d8fe0', emoji:'💼', mood: 0 },
  { name:'Makan Enak',    color:'#d4a840', emoji:'🍜', mood:+2 },
  { name:'Ngobrol Teman', color:'#2eb8a0', emoji:'💬', mood:+3 },
  { name:'Main Game',     color:'#8b6fd4', emoji:'🎮', mood:+1 },
  { name:'Musik',         color:'#d070b8', emoji:'🎵', mood:+2 },
  { name:'Nonton',        color:'#c47328', emoji:'🎬', mood:+1 },
  { name:'Tidur Siang',   color:'#5a8fcc', emoji:'😴', mood:+1 },
  { name:'Macet',         color:'#7a8fa0', emoji:'🚗', mood:-2 },
  { name:'Deadline',      color:'#d95040', emoji:'⏰', mood:-2 },
  { name:'Konflik',       color:'#b03830', emoji:'😤', mood:-3 },
  { name:'Meditasi',      color:'#5aac78', emoji:'🧘', mood:+3 },
  { name:'Baca/Nulis',    color:'#6a9fd8', emoji:'📖', mood:+1 },
  { name:'Kreasi',        color:'#2abba0', emoji:'✨', mood:+2 },
  { name:'Belanja',       color:'#c06030', emoji:'🛍️', mood:+1 },
  { name:'Sendirian',     color:'#5a6278', emoji:'🌙', mood: 0 },
];

/** Initialize activity checkboxes */
export function initMoodChecks() {
  const container = $('mood-checks');
  ACTIVITIES.forEach((a, i) => {
    const item = document.createElement('div');
    item.className = 'check-item';
    item.style.color = a.color;
    item.innerHTML = `<div class="check-dot"></div><span>${a.emoji} ${a.name}</span>`;
    item.addEventListener('click', () => {
      item.classList.toggle('on');
      refreshPalettePreview();
    });
    container.appendChild(item);
  });
}

/** Update the live palette preview */
export function refreshPalettePreview() {
  const active = ACTIVITIES.filter((_, i) =>
    document.querySelectorAll('#mood-checks .check-item')[i]?.classList.contains('on')
  );

  const strip = $('mood-palette');
  const label = $('mood-palette-label');

  if (!active.length) {
    strip.innerHTML = '<div class="palette-swatch" style="background:var(--surface-2)"></div>';
    if (label) label.textContent = '';
    return;
  }

  strip.innerHTML = active.map(a =>
    `<div class="palette-swatch" style="background:${a.color}" title="${a.name}"></div>`
  ).join('');

  if (label) label.textContent = active.map(a => a.name).join(' · ');
}

export function analyze(state) {
  const active = ACTIVITIES.filter((_, i) =>
    document.querySelectorAll('#mood-checks .check-item')[i]?.classList.contains('on')
  );

  if (!active.length) { alert('Pilih minimal 1 aktivitas!'); return; }

  const score   = active.reduce((s, a) => s + a.mood, 0);
  const maxScore = active.length * 3;
  const pct     = Math.min(100, Math.round(((score + maxScore) / (maxScore * 2)) * 100));
  const moodLabel = pct > 75 ? 'Luar Biasa 😄'
                  : pct > 55 ? 'Baik 😊'
                  : pct > 40 ? 'Biasa Aja 😐'
                  : pct > 25 ? 'Kurang Baik 😔'
                  : 'Berat 😢';

  const dominant  = active.slice().sort((a, b) => b.mood - a.mood)[0];
  const paletteName = pct > 70 ? 'Vibrant City Day'
                    : pct > 50 ? 'Rush Hour Balance'
                    : pct > 35 ? 'Overcast Evening'
                    : 'Midnight Reflection';

  state.mood = {
    score: pct,
    text:  moodLabel.split(' ')[0],
    label: moodLabel,
    palette: paletteName,
    colors: active.map(a => a.color),
  };

  $('mood-badge').innerHTML = badge('🌆', paletteName, dominant.color, dominant.color + '18');
  $('mood-desc').textContent = `${moodLabel} — ${active.length} aktivitas hari ini.`;
  $('mood-bar').innerHTML = progBar('Mood Score', pct, dominant.color);
  $('mood-stats').innerHTML = [
    statBox(moodLabel,     'Mood Hari Ini', dominant.color),
    statBox(active.length, 'Aktivitas',     '#8b6fd4'),
    statBox(pct + '%',     'Positivity',    '#2eb8a0'),
  ].join('');

  show('mood-result');
  refreshPalettePreview();
}
