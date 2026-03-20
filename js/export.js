/**
 * export.js — Generate and download the summary card
 *
 * Card layout (city report board aesthetic):
 *   Header: title + date/time
 *   Grid: 5 sections (one per analyzer)
 *   Footer: branding
 */

import { $ } from './utils.js';
import { GENRES }          from './analyzers/music.js';
import { APP_CATEGORIES }  from './analyzers/screen.js';
import { ACTIVITIES }      from './analyzers/mood.js';

/** Generate and show the export card */
export function generateCard(state) {
  const now = new Date();

  // Header
  $('ec-date').innerHTML = `
    ${now.toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' })}<br>
    ${now.toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit' })}
  `;

  const filled = [state.music.type, state.life.pct, state.writing.type, state.screen.total, state.mood.text]
    .filter(Boolean).length;
  $('ec-filled').textContent = `${filled}/5 analisis`;

  // Render each section
  _renderMusic(state);
  _renderLife(state);
  _renderWriting(state);
  _renderScreen(state);
  _renderMood(state);

  const wrap = $('export-wrap');
  wrap.classList.add('show');
  wrap.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// ── Section renderers ──────────────────────────────────────

function _renderMusic(state) {
  const el = $('ecs-music');
  el.style.setProperty('--ec-color', '#e8923a');

  if (!state.music.type) {
    el.querySelector('.ec-s-content').innerHTML =
      '<div style="font-size:.68rem;color:#5a6278">Belum dianalisis</div>';
    return;
  }

  const selected = [...document.querySelectorAll('#genre-chips .chip.on')];
  const genres   = selected.slice(0, 4).map(c => GENRES[parseInt(c.dataset.i)]);

  el.querySelector('.ec-s-value').textContent = state.music.type;
  el.querySelector('.ec-s-content').innerHTML = genres.map((g, i) => `
    <div class="ec-mini-bar" style="margin-bottom:5px">
      <div style="display:flex;justify-content:space-between;font-size:.58rem;color:#5a6278;margin-bottom:2px">
        <span>${g.name}</span><span>${95 - i * 13}%</span>
      </div>
      <div class="ec-mini-bar" style="margin-bottom:0">
        <div class="ec-mini-bar-fill" style="width:${95 - i * 13}%;background:${g.color}"></div>
      </div>
    </div>`
  ).join('');
}

function _renderLife(state) {
  const el = $('ecs-life');
  el.style.setProperty('--ec-color', '#4d8fe0');

  if (!state.life.weeks) {
    el.querySelector('.ec-s-value').textContent = 'Belum dianalisis';
    el.querySelector('.ec-s-content').innerHTML =
      '<div style="font-size:.68rem;color:#5a6278">Isi tanggal lahir di tab Hidup</div>';
    return;
  }

  el.querySelector('.ec-s-value').textContent = `${state.life.pct}% dijalani`;

  // Mini dot grid (~200 dots)
  const total  = Math.min(200, (state.life.weeks + state.life.remaining));
  const lived  = Math.min(state.life.weeks, total);
  const grid   = document.createElement('div');
  grid.className = 'ec-dot-grid';
  for (let i = 0; i < total; i++) {
    const d = document.createElement('div');
    d.className = 'ec-dot';
    d.style.background = i < lived ? '#e8923a' : '#252d3d';
    d.style.opacity = i < lived ? '.85' : '.5';
    grid.appendChild(d);
  }
  el.querySelector('.ec-s-content').innerHTML = '';
  el.querySelector('.ec-s-content').appendChild(grid);
}

function _renderWriting(state) {
  const el = $('ecs-writing');
  el.style.setProperty('--ec-color', '#2eb8a0');

  if (!state.writing.type) {
    el.querySelector('.ec-s-value').textContent = 'Belum dianalisis';
    el.querySelector('.ec-s-content').innerHTML =
      '<div style="font-size:.68rem;color:#5a6278">Paste teks di tab Tulisan</div>';
    return;
  }

  el.querySelector('.ec-s-value').textContent = state.writing.type;
  el.querySelector('.ec-s-content').innerHTML = [
    { l:'Kata',    v: state.writing.words },
    { l:'Gaya',    v: state.writing.style },
    { l:'Flesch',  v: state.writing.readability + '/100' },
  ].map(p => `
    <div class="ec-pill">
      <span class="ec-pill-label">${p.l}</span>
      <span class="ec-pill-val" style="color:#2eb8a0">${p.v}</span>
    </div>`
  ).join('');
}

function _renderScreen(state) {
  const el = $('ecs-screen');
  el.style.setProperty('--ec-color', '#d95040');

  if (!state.screen.total) {
    el.querySelector('.ec-s-value').textContent = 'Belum dianalisis';
    el.querySelector('.ec-s-content').innerHTML =
      '<div style="font-size:.68rem;color:#5a6278">Isi data di tab Screen</div>';
    return;
  }

  el.querySelector('.ec-s-value').textContent = `${state.screen.total}h hari ini`;

  const total = Math.max(1, state.screen.vals.reduce((a, b) => a + b, 0));
  const bar   = document.createElement('div');
  bar.className = 'ec-stack-bar';
  state.screen.vals.forEach((v, i) => {
    if (!v) return;
    const seg = document.createElement('div');
    seg.className = 'ec-stack-seg';
    seg.style.flex = v / total;
    seg.style.background = APP_CATEGORIES[i].color;
    bar.appendChild(seg);
  });

  const labels = state.screen.vals
    .map((v, i) => v ? `${APP_CATEGORIES[i].name.split('/')[0]} ${v}h` : '')
    .filter(Boolean).slice(0, 3).join(' · ');

  el.querySelector('.ec-s-content').innerHTML = '';
  el.querySelector('.ec-s-content').appendChild(bar);
  el.querySelector('.ec-s-content').innerHTML += `<div style="font-size:.6rem;color:#5a6278;margin-top:5px">${labels}</div>`;
}

function _renderMood(state) {
  const el = $('ecs-mood');
  el.style.setProperty('--ec-color', '#8b6fd4');

  if (!state.mood.text) {
    el.querySelector('.ec-s-value').textContent = 'Belum dianalisis';
    el.querySelector('.ec-s-content').innerHTML =
      '<div style="font-size:.68rem;color:#5a6278">Pilih aktivitas di tab Mood</div>';
    return;
  }

  el.querySelector('.ec-s-value').textContent = state.mood.label || state.mood.text;

  // Color palette
  const palette = document.createElement('div');
  palette.className = 'ec-palette';
  state.mood.colors.slice(0, 8).forEach(c => {
    const sw = document.createElement('div');
    sw.className = 'ec-palette-sw';
    sw.style.background = c;
    palette.appendChild(sw);
  });

  el.querySelector('.ec-s-content').innerHTML = '';
  el.querySelector('.ec-s-content').appendChild(palette);

  if (state.mood.score) {
    el.querySelector('.ec-s-content').innerHTML += `
      <div style="margin-top:8px">
        <div class="ec-mini-bar">
          <div class="ec-mini-bar-fill" style="width:${state.mood.score}%;background:#8b6fd4"></div>
        </div>
        <div style="font-size:.6rem;color:#5a6278;margin-top:3px">Score: ${state.mood.score}%</div>
      </div>`;
  }
}

/** Download card as PNG */
export function downloadCard() {
  const card = $('export-card');
  html2canvas(card, {
    backgroundColor: '#0c0e15',
    scale:           2.5,
    logging:         false,
    useCORS:         true,
  }).then(canvas => {
    const link      = document.createElement('a');
    link.download   = `life-dashboard-${new Date().toISOString().slice(0, 10)}.png`;
    link.href       = canvas.toDataURL('image/png');
    link.click();
  });
}
