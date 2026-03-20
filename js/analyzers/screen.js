/**
 * analyzers/screen.js — Screen time analyzer
 */
import { $, show, statBox, progBar, donutChart } from '../utils.js';

export const APP_CATEGORIES = [
  { icon:'📱', name:'Media Sosial',   id:'sc-social',  color:'#e8923a' },
  { icon:'🎬', name:'Video',          id:'sc-video',   color:'#d4a840' },
  { icon:'💼', name:'Kerja/Belajar',  id:'sc-work',    color:'#4d8fe0' },
  { icon:'🎮', name:'Gaming',         id:'sc-gaming',  color:'#2eb8a0' },
  { icon:'💬', name:'Chatting',       id:'sc-chat',    color:'#8b6fd4' },
  { icon:'📰', name:'Lainnya',        id:'sc-misc',    color:'#7a8fa0' },
];

export function initScreenRows() {
  const container = $('screen-rows');
  container.innerHTML = APP_CATEGORIES.map(a => `
    <div class="app-row">
      <div class="app-row-icon" style="color:${a.color}">${a.icon}</div>
      <label>${a.name}</label>
      <input type="number" id="${a.id}" min="0" max="16" step="0.5" value="0"/>
      <span class="unit">jam</span>
    </div>`
  ).join('');
}

export function analyze(state) {
  const vals  = APP_CATEGORIES.map(a => parseFloat($(a.id).value) || 0);
  const total = vals.reduce((a, b) => a + b, 0);
  if (!total) { alert('Masukkan setidaknya 1 jam!'); return; }

  donutChart(
    'screen-chart',
    APP_CATEGORIES.map(a => a.name),
    vals,
    APP_CATEGORIES.map(a => a.color),
  );

  const topIdx = vals.indexOf(Math.max(...vals));
  const topApp = APP_CATEGORIES[topIdx];
  const perYear = Math.round(total * 365);

  state.screen = {
    total:  total.toFixed(1),
    vals,
    top:    topApp.name,
    perYear,
  };

  // Stats
  $('screen-stats').innerHTML = [
    statBox(total.toFixed(1) + 'h',    'Total Hari Ini',  '#4d8fe0'),
    statBox(perYear + 'h',             'Estimasi/Tahun',  '#d95040'),
    statBox(topApp.icon + ' ' + topApp.name, 'Terbanyak', topApp.color),
  ].join('');

  // Story
  const socialH = vals[0], videoH = vals[1], workH = vals[2];
  const stories = [];
  if (socialH > 2)  stories.push(`📱 Media sosial <strong>${socialH}h</strong> = <strong>${Math.round(socialH * 365 / 24)} hari/tahun</strong> scrolling.`);
  if (videoH > 1)   stories.push(`🎬 Setara menonton <strong>${Math.round(videoH * 365 / 2)} film</strong> per tahun.`);
  if (workH >= 6)   stories.push(`💼 Produktif! <strong>${workH}h kerja/belajar</strong> hari ini.`);
  if (total > 8)    stories.push(`⚠️ Total <strong>${total.toFixed(1)} jam</strong> cukup tinggi — coba sisihkan waktu offline.`);
  else              stories.push(`✅ Total <strong>${total.toFixed(1)} jam</strong> masih dalam batas wajar.`);

  $('screen-story').innerHTML = stories.map(t =>
    `<p style="margin-bottom:7px;font-size:.84rem;line-height:1.65;color:var(--text-2)">${t}</p>`
  ).join('');

  // Wellness score
  const ws = Math.min(100, Math.round(
    (vals[2] / total * 35) + ((1 - vals[0] / total) * 35) + (total < 6 ? 30 : total < 8 ? 20 : 10)
  ));
  const wc = ws > 70 ? '#2eb8a0' : ws > 40 ? '#e8923a' : '#d95040';
  const wl = ws > 70 ? 'Sehat 🌿' : ws > 40 ? 'Cukup Baik 🌤️' : 'Perlu Perhatian ⚠️';

  $('screen-wellness').innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px">
      <div style="font-family:var(--font-mono);font-size:2.6rem;font-weight:500;color:${wc}">${ws}</div>
      <div>
        <div style="font-weight:600;color:${wc};font-size:.9rem">${wl}</div>
        <div style="font-size:.72rem;color:var(--text-3)">Digital Wellness Score</div>
      </div>
    </div>
    ${progBar('Skor Wellness', ws, wc)}`;

  show('screen-result');
}
