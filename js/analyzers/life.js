/**
 * analyzers/life.js — Life in Weeks analyzer
 */
import { $, show, statBox, noteBox } from '../utils.js';

export function analyze(state) {
  const bd = $('birthdate').value;
  if (!bd) { alert('Masukkan tanggal lahir!'); return; }

  const expect = parseInt($('life-expect').value) || 80;
  const birth  = new Date(bd);
  const now    = new Date();
  const totalW = expect * 52;
  const livedW = Math.floor((now - birth) / (7 * 24 * 3600 * 1000));
  const remW   = Math.max(0, totalW - livedW);
  const pct    = (livedW / totalW * 100).toFixed(1);

  state.life = { weeks: livedW, remaining: remW, pct, expect };

  // Build dot grid
  const grid = $('life-grid');
  grid.innerHTML = '';
  const YOUTH_END = 18 * 52;
  const WORK_END  = 65 * 52;

  for (let i = 0; i < totalW; i++) {
    const dot = document.createElement('div');
    dot.className = 'week-dot';
    dot.title = `Minggu ke-${i + 1}`;

    if (i < livedW) {
      dot.style.background = i < YOUTH_END ? '#e8923a' : '#4d8fe0';
      dot.style.opacity = '0.82';
    } else if (i < WORK_END) {
      dot.style.background = '#2eb8a0';
      dot.style.opacity = '0.2';
    } else {
      dot.style.background = '#252d3d';
      dot.style.opacity = '0.6';
    }
    grid.appendChild(dot);
  }

  // Stats
  $('life-stats').innerHTML = [
    statBox(livedW.toLocaleString(), 'Minggu Dijalani', '#e8923a'),
    statBox(remW.toLocaleString(),   'Minggu Tersisa',  '#2eb8a0'),
    statBox(pct + '%',               'Perjalanan',      '#4d8fe0'),
  ].join('');

  // Insights
  const years = (livedW / 52).toFixed(1);
  const booksLeft = remW.toLocaleString();
  $('life-notes').innerHTML = [
    noteBox(`Sudah menjalani <strong>${livedW.toLocaleString()} minggu</strong> — sekitar <strong>${years} tahun</strong>.`, '#e8923a'),
    noteBox(`Masih ada <strong>${remW.toLocaleString()} minggu</strong> ke depan. Setiap minggunya berharga.`, '#2eb8a0'),
    noteBox(`Jika tiap minggu kamu baca 1 buku, kamu masih bisa baca <strong>${booksLeft} buku</strong> lagi.`, '#4d8fe0'),
  ].join('<div class="sp-8"></div>');

  show('life-result');
}
