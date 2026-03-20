/**
 * utils.js — Shared helper functions
 *
 * All functions are exported and used by analyzer modules and app.js.
 * No side effects — pure functions that return HTML strings or
 * manipulate DOM elements passed as arguments.
 */

// ── DOM ────────────────────────────────────────────────────
export const $ = id => document.getElementById(id);
export const show = id => $(id).classList.add('show');

// ── HTML Builders ──────────────────────────────────────────

/**
 * Build a stat box HTML string.
 * @param {string} val   - displayed value
 * @param {string} label - label below value
 * @param {string} color - CSS color for value text
 */
export function statBox(val, label, color) {
  return `
    <div class="stat" style="color:${color}">
      <div class="stat-val">${val}</div>
      <div class="stat-lbl">${label}</div>
    </div>`;
}

/**
 * Build a progress bar HTML string.
 * @param {string} label
 * @param {number} pct   - 0..100
 * @param {string} color - fill color
 */
export function progBar(label, pct, color) {
  const clamped = Math.max(0, Math.min(100, pct));
  return `
    <div class="prog">
      <div class="prog-row">
        <span>${label}</span>
        <span>${Math.round(clamped)}%</span>
      </div>
      <div class="prog-track">
        <div class="prog-fill" style="width:${clamped}%;background:${color}"></div>
      </div>
    </div>`;
}

/**
 * Build a note/insight box HTML string.
 * @param {string} html  - inner HTML content
 * @param {string} color - left border color
 */
export function noteBox(html, color) {
  return `<div class="note" style="border-left-color:${color}">${html}</div>`;
}

/**
 * Build a badge HTML string.
 * @param {string} emoji
 * @param {string} text
 * @param {string} color     - text color
 * @param {string} bgColor   - background color (rgba recommended)
 */
export function badge(emoji, text, color, bgColor) {
  return `
    <div class="badge" style="color:${color};background:${bgColor};border-color:${color}22">
      <span>${emoji}</span> ${text}
    </div>`;
}

// ── Chart ──────────────────────────────────────────────────

const chartInstances = {};

/**
 * Create or update a doughnut chart.
 * @param {string}   canvasId
 * @param {string[]} labels
 * @param {number[]} data
 * @param {string[]} colors
 */
export function donutChart(canvasId, labels, data, colors) {
  if (chartInstances[canvasId]) {
    chartInstances[canvasId].destroy();
  }

  const ctx = $(canvasId);
  if (!ctx) return;

  chartInstances[canvasId] = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors,
        borderWidth: 0,
        hoverOffset: 6,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: '#9aa0b4',
            font: { family: "'DM Sans'", size: 11 },
            boxWidth: 10,
            padding: 12,
          },
        },
      },
      cutout: '65%',
    },
  });
}

// ── Text Analysis Utilities ────────────────────────────────

/** Common stopwords (Indonesian + English) */
export const STOPWORDS = new Set([
  // Indonesian
  'yang','dan','di','ke','dari','dengan','adalah','ini','itu','ada','tidak',
  'juga','untuk','saya','aku','lo','gue','kamu','bisa','kalau','sudah','akan',
  'karena','tapi','atau','pada','dalam','lebih','sangat','jadi','bagi','oleh',
  'kami','kita','mereka','apa','siapa','bagaimana','kapan','dimana','kenapa',
  'nya','lah','pun','pun','si','ya','no','iya','oke','ok',
  // English
  'the','a','an','and','or','but','in','on','at','to','for','of','with',
  'is','was','are','were','be','been','i','you','he','she','we','they','it',
  'this','that','have','has','had','do','does','did','not','my','your','his',
  'her','our','their','all','if','so','just','get','got','going',
]);

/**
 * Count word frequency in text, excluding stopwords.
 * @param {string[]} words
 * @returns {Array<[string, number]>} sorted by frequency desc
 */
export function wordFrequency(words) {
  const freq = {};
  words.forEach(w => {
    if (!STOPWORDS.has(w) && w.length > 2) {
      freq[w] = (freq[w] || 0) + 1;
    }
  });
  return Object.entries(freq).sort((a, b) => b[1] - a[1]);
}

/**
 * Calculate simplified Flesch reading ease score.
 * @param {string[]} words
 * @param {string[]} sentences
 * @returns {number} 0..100
 */
export function fleschScore(words, sentences) {
  const syl = words.reduce((s, w) => s + Math.max(1, w.replace(/[^aeiou]/gi, '').length), 0);
  const avgWS = words.length / Math.max(1, sentences.length);
  const avgSW = syl / Math.max(1, words.length);
  return Math.min(100, Math.max(0, Math.round(206.835 - 1.015 * avgWS - 84.6 * avgSW)));
}

// ── Color utilities ─────────────────────────────────────────

/**
 * Add alpha to a hex color by appending 2-digit hex.
 * @param {string} hex   e.g. '#c0392b'
 * @param {number} alpha 0..1
 * @returns {string} hex + alpha
 */
export function hexAlpha(hex, alpha) {
  return hex + Math.round(alpha * 255).toString(16).padStart(2, '0');
}
