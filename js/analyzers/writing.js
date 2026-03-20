/**
 * analyzers/writing.js — Writing personality analyzer
 */
import { $, show, statBox, progBar, noteBox, badge, wordFrequency, fleschScore, hexAlpha } from '../utils.js';

const PERSONALITY_TYPES = [
  { test: (sl, style, pos, neg, vr) => sl > 20 && style === 'Formal',  label:'The Intellectual',      emoji:'📚', desc:'Kalimat panjang dan diksi formal — kamu nulis dengan kedalaman.' },
  { test: (sl, style, pos, neg, vr) => style === 'Kasual',             label:'The Storyteller',       emoji:'✍️',  desc:'Gaya santai tapi mengalir — natural dan relatable.' },
  { test: (sl, style, pos, neg, vr) => pos > neg * 2,                  label:'The Optimist',          emoji:'☀️',  desc:'Tulisanmu penuh energi positif.' },
  { test: (sl, style, pos, neg, vr) => neg > pos,                      label:'The Realist',           emoji:'🔍', desc:'Tulisanmu jujur dan apa adanya.' },
  { test: (sl, style, pos, neg, vr) => parseFloat(vr) > 60,            label:'The Wordsmith',         emoji:'🎭', desc:'Kosakatamu kaya — jarang pakai kata yang sama dua kali.' },
];

const WORD_COLORS = [
  '#e8923a','#c47328','#4d8fe0','#2eb8a0','#8b6fd4',
  '#d95040','#5aac78','#5a8fcc','#d4a840','#d070b8',
];

const CASUAL_WORDS = new Set(['gue','lo','sih','dong','nih','loh','banget','wkwk','haha','btw','fyi','lol']);
const FORMAL_WORDS = new Set(['tersebut','merupakan','sehingga','demikian','furthermore','however','therefore','consequently']);
const POS_WORDS    = new Set(['senang','baik','bagus','keren','cinta','suka','indah','berhasil','happy','great','good','love','wonderful','amazing']);
const NEG_WORDS    = new Set(['sedih','buruk','gagal','susah','benci','takut','khawatir','sad','bad','fail','hate','fear','terrible']);

export function analyze(state) {
  const text = $('writing-input').value.trim();
  if (text.length < 40) { alert('Teks terlalu pendek. Minimal 40 karakter!'); return; }

  const words  = text.toLowerCase().match(/\b[\w]+\b/g) || [];
  const sents  = text.split(/[.!?]+/).filter(s => s.trim().length > 3);
  const unique = new Set(words);
  const avgSL  = words.length / Math.max(1, sents.length);
  const vocabR = (unique.size / words.length * 100).toFixed(1);

  const topWords = wordFrequency(words).slice(0, 14);
  const flesch   = fleschScore(words, sents);

  const pos    = words.filter(w => POS_WORDS.has(w)).length;
  const neg    = words.filter(w => NEG_WORDS.has(w)).length;
  const casual = words.filter(w => CASUAL_WORDS.has(w)).length;
  const formal = words.filter(w => FORMAL_WORDS.has(w)).length;
  const style  = formal > casual ? 'Formal' : casual > formal ? 'Kasual' : 'Semi-Formal';

  const p = PERSONALITY_TYPES.find(x => x.test(avgSL, style, pos, neg, vocabR))
    || { label:'The Original', emoji:'💎', desc:'Gaya tulisanmu unik dan nggak bisa dikategorikan.' };

  state.writing = { type: p.label, words: words.length, style, readability: flesch };

  // Badge
  $('writing-badge').innerHTML = badge(p.emoji, p.label, '#2eb8a0', '#2eb8a018');
  $('writing-desc').textContent = p.desc;

  // Stats
  $('writing-stats').innerHTML = [
    statBox(words.length, 'Kata',    '#2eb8a0'),
    statBox(sents.length, 'Kalimat', '#4d8fe0'),
    statBox(style,        'Gaya',    '#e8923a'),
  ].join('');

  // Word cloud
  $('writing-wordcloud').innerHTML = topWords.map(([w, c], i) => {
    const size = 0.75 + (c / topWords[0][1]) * 0.55;
    return `<span class="tag" style="background:${hexAlpha(WORD_COLORS[i % WORD_COLORS.length], .12)};color:${WORD_COLORS[i % WORD_COLORS.length]};font-size:${size}rem;border-color:${hexAlpha(WORD_COLORS[i % WORD_COLORS.length], .25)}">${w}</span>`;
  }).join('');

  // Progress bars
  $('writing-bars').innerHTML = [
    progBar('Keterbacaan',                    flesch,                                   '#2eb8a0'),
    progBar('Kekayaan Kosakata',              Math.min(100, parseFloat(vocabR)),         '#4d8fe0'),
    progBar('Emosi Positif',                  Math.min(100, pos / words.length * 800),   '#e8923a'),
    progBar('Panjang Kalimat Rata-rata',       Math.min(100, avgSL / 25 * 100),           '#8b6fd4'),
  ].join('');

  // Insight note
  const styleNote = style === 'Kasual'
    ? 'Tulisanmu terasa personal dan natural — cocok untuk konten yang relatable.'
    : style === 'Formal'
    ? 'Tulisanmu terstruktur dan rapi — cocok untuk konten profesional.'
    : 'Gaya tulisanmu fleksibel — formal dan santai sesuai situasi.';
  $('writing-note').innerHTML = noteBox(
    `Gaya <strong>${style}</strong>. Readability: <strong>${flesch}/100</strong>. ${styleNote}`,
    '#2eb8a0',
  );

  show('writing-result');
}
