/**
 * analyzers/music.js — Music DNA analyzer
 */
import { $, show, statBox, progBar, badge, donutChart } from '../utils.js';

export const GENRES = [
  { name:'Pop',         color:'#e8923a', traits:['sosial','energik','terbuka']        },
  { name:'R&B',         color:'#c47328', traits:['emosional','romantis','ekspresif']  },
  { name:'Hip-Hop',     color:'#d4a840', traits:['percaya diri','kreatif','ambisius'] },
  { name:'Indie',       color:'#4d8fe0', traits:['unik','introspektif','artistik']    },
  { name:'Electronic',  color:'#2eb8a0', traits:['futuristik','energik','analitis']   },
  { name:'Jazz',        color:'#6a9fd8', traits:['intelektual','rileks','kompleks']   },
  { name:'Classical',   color:'#8b6fd4', traits:['fokus','detail','tenang']           },
  { name:'Rock',        color:'#d95040', traits:['passionate','bebas','berani']       },
  { name:'K-Pop',       color:'#d070b8', traits:['sosial','estetik','optimis']        },
  { name:'Acoustic',    color:'#5aac78', traits:['autentik','tenang','nostalgia']     },
  { name:'Lo-fi',       color:'#5a8fcc', traits:['fokus','santai','kreatif']          },
  { name:'Metal',       color:'#7a8fa0', traits:['intens','kuat','ekspresif']         },
];

const PERSONALITY_TYPES = [
  { test: t => t.includes('kreatif') && t.includes('unik'),       label:'The Creative Soul',     emoji:'🎨', desc:'Musik adalah ekspresi diri, bukan sekadar hiburan.' },
  { test: t => t.includes('intens') || t.includes('passionate'),  label:'The Passionate One',    emoji:'🔥', desc:'Taste musikmu intense — nggak pernah setengah-setengah.' },
  { test: t => t.includes('fokus') && t.includes('analitis'),     label:'The Deep Thinker',      emoji:'🧠', desc:'Kamu pakai musik untuk produktivitas dan kedalaman pikiran.' },
  { test: t => t.includes('sosial') && t.includes('energik'),     label:'The Party Starter',     emoji:'🎉', desc:'Playlist kamu bikin suasana hidup.' },
  { test: t => t.includes('rileks') || t.includes('santai'),      label:'The Chill Wanderer',    emoji:'🌊', desc:'Musik adalah pelarian dari keramaian dunia.' },
  { test: t => t.includes('romantis') || t.includes('emosional'), label:'The Hopeless Romantic', emoji:'💫', desc:'Setiap lagu yang kamu pilih punya kedalaman emosi.' },
];

/** Initialize genre chip selector */
export function initMusicChips() {
  const container = $('genre-chips');
  GENRES.forEach((g, i) => {
    const chip = document.createElement('div');
    chip.className = 'chip';
    chip.textContent = g.name;
    chip.dataset.i = i;
    chip.addEventListener('click', () => {
      chip.classList.toggle('on');
      chip.style.background = chip.classList.contains('on') ? g.color : '';
      refreshChart();
    });
    container.appendChild(chip);
  });
}

/** Refresh donut chart based on selected genres */
export function refreshChart() {
  const selected = [...document.querySelectorAll('#genre-chips .chip.on')];
  if (!selected.length) return;
  donutChart(
    'music-chart',
    selected.map(c => GENRES[c.dataset.i].name),
    selected.map(() => Math.floor(20 + Math.random() * 80)),
    selected.map(c => GENRES[c.dataset.i].color),
  );
}

/** Run music analysis and update DOM */
export function analyze(state) {
  const selected = [...document.querySelectorAll('#genre-chips .chip.on')];
  if (!selected.length) { alert('Pilih minimal 1 genre!'); return; }

  const genres   = selected.map(c => GENRES[parseInt(c.dataset.i)]);
  const mood     = $('music-mood').value;
  const artists  = $('music-artists').value.split(',').map(a => a.trim()).filter(Boolean);

  // Trait frequency
  const traitFreq = {};
  genres.forEach(g => g.traits.forEach(t => traitFreq[t] = (traitFreq[t] || 0) + 1));
  const topTraits = Object.entries(traitFreq).sort((a, b) => b[1] - a[1]).slice(0, 4).map(e => e[0]);

  const p = PERSONALITY_TYPES.find(x => x.test(topTraits)) || {
    label: 'The Eclectic Explorer', emoji: '🗺️', desc: 'Taste musikmu terlalu luas untuk dikategorikan.',
  };

  const col = genres[0].color;
  const moodMap = { hype:'Energetik',chill:'Chill',sad:'Melankolis',focus:'Fokus',happy:'Happy' };

  // Update state
  state.music = { type: p.label, genres: genres.length, traits: topTraits };

  // Render
  $('music-badge').innerHTML = badge(p.emoji, p.label, col, col + '18');
  $('music-desc').textContent = p.desc;
  $('music-stats').innerHTML = [
    statBox(genres.length, 'Genre', col),
    statBox(artists.length || '—', 'Artis', genres[1]?.color || col),
    statBox(moodMap[mood] || 'Beragam', 'Mood', genres[2]?.color || col),
  ].join('');
  $('music-bars').innerHTML = topTraits.map((t, i) =>
    progBar(t[0].toUpperCase() + t.slice(1), 95 - i * 13, genres[i % genres.length].color)
  ).join('');

  show('music-result');
  refreshChart();
}
