/**
 * app.js — Entry point & orchestrator
 *
 * Responsibilities:
 *   - Initialize all modules
 *   - Handle tab switching
 *   - Manage global state
 *   - Connect UI events to analyzer functions
 */

import { initMusicChips, analyze as analyzeMusic, refreshChart }  from './analyzers/music.js';
import { analyze as analyzeLife }                                  from './analyzers/life.js';
import { analyze as analyzeWriting }                               from './analyzers/writing.js';
import { initScreenRows, analyze as analyzeScreen }               from './analyzers/screen.js';
import { initMoodChecks, analyze as analyzeMood }                  from './analyzers/mood.js';
import { generateCard, downloadCard }                              from './export.js';

// ── Global State ───────────────────────────────────────────
const STATE = {
  music:   {},
  life:    {},
  writing: {},
  screen:  {},
  mood:    {},
};

// ── Tab switching ──────────────────────────────────────────
function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
    });
  });
}

// ── Bind analyze buttons ───────────────────────────────────
function initButtons() {
  document.getElementById('btn-music')  .addEventListener('click', () => analyzeMusic(STATE));
  document.getElementById('btn-life')   .addEventListener('click', () => analyzeLife(STATE));
  document.getElementById('btn-writing').addEventListener('click', () => analyzeWriting(STATE));
  document.getElementById('btn-screen') .addEventListener('click', () => analyzeScreen(STATE));
  document.getElementById('btn-mood')   .addEventListener('click', () => analyzeMood(STATE));
  document.getElementById('btn-export') .addEventListener('click', () => generateCard(STATE));
  document.getElementById('btn-download').addEventListener('click', downloadCard);
  document.getElementById('btn-back')   .addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ── Init ───────────────────────────────────────────────────
function init() {
  initTabs();
  initMusicChips();
  initScreenRows();
  initMoodChecks();
  initButtons();
}

document.addEventListener('DOMContentLoaded', init);
