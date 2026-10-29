const $ = s => document.querySelector(s);
const API = 'https://api.deezer.com';
const store = {
  get: (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
};
let known = new Set(store.get('known', []));
let saved = store.get('saved', []);
let lastItems = [];
let shown = new Set();

let cbId = 0;
function dz(path, params = {}) {
  return new Promise((resolve, reject) => {
    const name = '__dz' + (++cbId);
    const qs = new URLSearchParams({ ...params, output: 'jsonp', callback: name });
    const s = document.createElement('script');
    const timer = setTimeout(() => { cleanup(); reject(new Error('timeout')); }, 12000);
    function cleanup() { clearTimeout(timer); delete window[name]; s.remove(); }
    window[name] = data => { cleanup(); data && data.error ? reject(new Error(data.error.message || 'deezer')) : resolve(data); };
    s.onerror = () => { cleanup(); reject(new Error('network')); };
    s.src = `${API}${path}?${qs}`;
    document.head.appendChild(s);
  });
}
async function pool(items, n, fn) {
  const out = []; let i = 0;
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => {
    while (i < items.length) { const k = i++; try { out[k] = await fn(items[k]); } catch { out[k] = null; } }
  }));
  return out;
}
const shuffle = a => a.map(v => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(x => x[1]);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

async function fromArtists(names, novelty, seedIds) {
  const cands = [];
  for (const name of names.slice(0, 2)) {
    const r = await dz('/search/artist', { q: name, limit: 1 });
    const seed = r.data?.[0]; if (!seed) continue;
    seedIds.add(seed.id);
    const rel = (await dz(`/artist/${seed.id}/related`, { limit: 25 })).data || [];
    rel.forEach(a => seedIds.add(a.id));
    const near = rel.map(a => ({ artist: a, why: `Cercano a ${seed.name}`, hop: 1 }));
    let far = [];
    if (novelty >= 35) {
      const via = shuffle(rel).slice(0, novelty >= 70 ? 5 : 3);
      const res = await pool(via, 5, v => dz(`/artist/${v.id}/related`, { limit: 15 }).then(x => (x.data || []).map(a => ({ artist: a, why: `A 2 pasos de ${seed.name} (vía ${v.name})`, hop: 2 }))));
      far = res.flat().filter(Boolean);
    }
    if (novelty < 35) cands.push(...near);
    else if (novelty < 70) cands.push(...near.filter(c => (c.artist.nb_fan || 0) < 1500000), ...far);
    else cands.push(...far);
  }
  return cands;
}

async function fromScenes(scenes, intent) {
  const mod = [intent.region, intent.era].filter(Boolean).join(' ');
  const res = await pool(scenes, 4, async sc => {
    const q = (sc.term + ' ' + mod).trim();
    let pls = (await dz('/search/playlist', { q, limit: 12 })).data || [];
    if (!pls.length && mod) pls = (await dz('/search/playlist', { q: sc.term, limit: 12 })).data || [];
    pls = shuffle(pls.filter(p => p.nb_tracks >= 15)).slice(0, 2);
    const tracks = await pool(pls, 2, p => dz(`/playlist/${p.id}/tracks`, { limit: 100 }).then(x => (x.data || []).map(t => ({ track: t, artist: t.artist, why: sc.far ? `Escena «${sc.term}», vecina de ${sc.from}` : `Escena «${sc.term}»`, scene: sc.term, playlist: p }))));
    return { scene: sc, playlists: pls, items: tracks.flat().filter(Boolean) };
  });
  return res.filter(Boolean);
}

function rank(cands, novelty, seedIds, perArtist) {
  const byArtist = new Map();
  for (const c of cands) {
    const a = c.artist; if (!a || !a.id) continue;
    if (seedIds.has(a.id) && c.hop !== 1) continue;
    if (known.has(String(a.id)) || shown.has(String(a.id))) continue;
    if (c.track && !c.track.readable) continue;
    const pop = c.track ? (c.track.rank || 0) / 1e6 : Math.min(1, Math.log10((a.nb_fan || 1) + 1) / 7);
    if (novelty >= 70 && pop > 0.85) continue;
    const target = 1 - novelty / 100;
    const score = Math.random() * 0.6 + (1 - Math.abs(pop - target * 0.9)) * 0.6 + (c.hop === 2 ? novelty / 250 : 0);
    const list = byArtist.get(a.id) || [];
    list.push({ ...c, score });
    byArtist.set(a.id, list);
  }
  const groups = [...byArtist.values()].map(l => l.sort((x, y) => y.score - x.score).slice(0, perArtist));
  const scenes = {};
  groups.sort((x, y) => y[0].score - x[0].score);
  const out = [];
  for (const g of groups) {
    const key = g[0].scene || g[0].why;
    scenes[key] = (scenes[key] || 0) + 1;
    out.push(...g.map(x => ({ ...x, score: x.score - scenes[key] * 0.08 })));
  }
  return out.sort((x, y) => y.score - x.score);
}

async function ensureTrack(items) {
  return (await pool(items, 6, async it => {
    if (it.track) return it;
    const top = (await dz(`/artist/${it.artist.id}/top`, { limit: 5 })).data || [];
    const t = top.find(x => x.readable && x.preview) || top[0];
    return t ? { ...it, track: t } : null;
  })).filter(Boolean);
}

function links(q) {
  const e = encodeURIComponent(q);
  return `<a href="https://open.spotify.com/search/${e}" target="_blank" rel="noopener">Spotify</a>
  <a href="https://music.apple.com/us/search?term=${e}" target="_blank" rel="noopener">Apple</a>
  <a href="https://music.youtube.com/search?q=${e}" target="_blank" rel="noopener">YouTube</a>
  <a href="https://music.amazon.com/search/${e}" target="_blank" rel="noopener">Amazon</a>`;
}

function card(it, fmt) {
  const t = it.track, a = it.artist;
  let cover, title, sub, q, dzl;
  if (fmt === 'artist') { cover = `${API}/artist/${a.id}/image?size=big`; title = a.name; sub = `Escucha: ${t.title}`; q = a.name; dzl = `https://www.deezer.com/artist/${a.id}`; }
  else if (fmt === 'album') { cover = t.album?.cover_big || t.album?.cover_medium; title = t.album?.title || t.title; sub = a.name; q = `${a.name} ${t.album?.title || ''}`; dzl = t.album ? `https://www.deezer.com/album/${t.album.id}` : t.link; }
  else { cover = t.album?.cover_big || t.album?.cover_medium; title = t.title; sub = a.name; q = `${a.name} ${t.title_short || t.title}`; dzl = t.link; }
  const el = document.createElement('article');
  el.className = 'card';
  el.innerHTML = `<div class="cover" style="background-image:url('${esc(cover)}')">${t.preview ? `<button class="play" title="Preview 30s">▶</button>` : ''}</div>
  <div class="body"><div class="title">${esc(title)}</div><div class="sub">${esc(sub)}</div><div class="why">${esc(it.why)}</div>
  <div class="links"><a href="${esc(dzl)}" target="_blank" rel="noopener">Deezer</a>${links(q)}</div>
  <div class="fb"><button class="save">♡ Guardar</button><button class="known">Ya lo conozco</button></div></div>`;
  const play = el.querySelector('.play');
  if (play) play.onclick = () => togglePlay(t.preview, play);
  el.querySelector('.save').onclick = e => { saveItem({ title, sub, link: dzl, q }); e.target.classList.add('saved'); e.target.textContent = '♥ Guardado'; };
  el.querySelector('.known').onclick = () => { known.add(String(a.id)); store.set('known', [...known]); el.style.opacity = .25; setTimeout(() => el.remove(), 250); updateSaved(); };
  return el;
}

function playlistView(items, playlists) {
  const el = document.createElement('article');
  el.className = 'card';
  el.style.gridColumn = '1 / -1';
  const rows = items.map((it, i) => `<div class="row"><span>${i + 1}. <b>${esc(it.track.title)}</b> — ${esc(it.artist.name)} <small style="color:var(--mut)">· ${esc(it.why)}</small></span>
    <span>${it.track.preview ? `<button class="mini" data-i="${i}">▶</button>` : ''} <a href="${esc(it.track.link)}" target="_blank" rel="noopener">Deezer</a> <a href="https://open.spotify.com/search/${encodeURIComponent(it.artist.name + ' ' + it.track.title_short)}" target="_blank" rel="noopener">Spotify</a> <a href="https://music.youtube.com/search?q=${encodeURIComponent(it.artist.name + ' ' + it.track.title_short)}" target="_blank" rel="noopener">YouTube</a></span></div>`).join('');
  const pl = playlists.length ? `<p class="sub" style="margin-top:14px">Playlists de donde salió (Deezer): ${playlists.map(p => `<a href="${esc(p.link)}" target="_blank" rel="noopener" style="color:var(--txt)">${esc(p.title)}</a>`).join(' · ')}</p>` : '';
  el.innerHTML = `<div class="body"><div class="title">Tu playlist de descubrimiento · ${items.length} canciones</div>
  <div class="sub">Copia la lista y pégala en <a href="https://www.tunemymusic.com/" target="_blank" rel="noopener" style="color:var(--acc)">TuneMyMusic</a> o <a href="https://soundiiz.com/" target="_blank" rel="noopener" style="color:var(--acc)">Soundiiz</a> para pasarla a tu servicio.</div>
  <div class="saved" style="margin:10px 0 0">${rows}</div>${pl}</div>`;
  el.querySelectorAll('.mini').forEach(b => { b.className = 'play mini'; b.style.cssText = 'position:static;width:30px;height:30px;font-size:12px'; b.onclick = () => togglePlay(items[+b.dataset.i].track.preview, b); });
  return el;
}

const player = $('#player'); let playingBtn = null;
function togglePlay(src, btn) {
  if (playingBtn === btn && !player.paused) { player.pause(); btn.textContent = '▶'; btn.classList.remove('on'); return; }
  if (playingBtn) { playingBtn.textContent = '▶'; playingBtn.classList.remove('on'); }
  player.src = src; player.play().catch(() => {}); btn.textContent = '❚❚'; btn.classList.add('on'); playingBtn = btn;
}
player.onended = () => { if (playingBtn) { playingBtn.textContent = '▶'; playingBtn.classList.remove('on'); } };

function saveItem(x) { if (!saved.some(s => s.link === x.link)) { saved.unshift(x); store.set('saved', saved.slice(0, 200)); } updateSaved(); }
function updateSaved() {
  $('#savedCount').textContent = saved.length; $('#knownCount').textContent = known.size;
  $('#savedList').innerHTML = saved.map(s => `<div class="row"><span><a href="${esc(s.link)}" target="_blank" rel="noopener">${esc(s.title)}</a> — ${esc(s.sub)}</span><span>${links(s.q)}</span></div>`).join('') || '<p>Aún no guardas nada.</p>';
}
$('#clearKnown').onclick = () => { known = new Set(); store.set('known', []); updateSaved(); };

function showIntent(intent, scenes, fmt) {
  const fmtName = { track: 'canciones', artist: 'artistas', album: 'álbumes', playlist: 'playlist' }[fmt];
  const chips = [
    `<span>Entendí:</span>`,
    ...intent.moods.map(m => `<span class="chip">${esc(m.label)}</span>`),
    ...intent.artists.map(a => `<span class="chip a">como ${esc(a)}</span>`),
    ...scenes.map(s => `<span class="chip g">${esc(s.term)}${s.far ? ` <small>(vecina de ${esc(s.from)})</small>` : ''}</span>`),
    intent.era ? `<span class="chip">${esc(intent.era)}</span>` : '', intent.region ? `<span class="chip">${esc(intent.region)}</span>` : '',
    `<span class="chip">→ ${fmtName}</span>`,
  ];
  $('#intent').innerHTML = chips.join(''); $('#intent').hidden = false;
}
const status = (msg) => { $('#status').hidden = !msg; $('#status').textContent = msg || ''; };

async function discover({ append = false } = {}) {
  const prompt = $('#prompt').value.trim();
  if (!prompt) { $('#prompt').focus(); return; }
  const novelty = +$('#novelty').value;
  const intent = parseIntent(prompt);
  const chosen = document.querySelector('input[name=format]:checked').value;
  const fmt = chosen === 'auto' ? (intent.format || 'track') : chosen;
  if (!intent.genres.length && !intent.moods.length && !intent.artists.length && !intent.keywords.length) intent.keywords = [prompt];
  const scenes = pickScenes(intent, novelty);
  showIntent(intent, scenes, fmt);
  const params = new URLSearchParams({ q: prompt, f: chosen, n: novelty });
  history.replaceState(null, '', '?' + params);
  if (!append) { $('#results').innerHTML = ''; shown = new Set(); }
  $('#go').disabled = true; $('#actions').hidden = true;
  status('Explorando escenas y artistas relacionados…');
  try {
    const seedIds = new Set();
    const [artistC, sceneRes] = await Promise.all([
      intent.artists.length ? fromArtists(intent.artists, novelty, seedIds) : [],
      scenes.length ? fromScenes(scenes, intent) : [],
    ]);
    const sceneC = sceneRes.flatMap(r => r.items);
    let ranked = rank([...artistC, ...sceneC], novelty, seedIds, fmt === 'playlist' ? 2 : 1);
    if (!ranked.length && novelty >= 70) ranked = rank([...artistC, ...sceneC], 50, seedIds, 1);
    const want = fmt === 'playlist' ? 25 : 12;
    let items = await ensureTrack(ranked.slice(0, want + 6));
    if (fmt === 'album') { const seen = new Set(); items = items.filter(i => i.track.album && !seen.has(i.track.album.id) && seen.add(i.track.album.id)); }
    items = items.slice(0, want);
    if (!items.length) { status('No encontré nada nuevo con eso. Prueba otras palabras, un género o "como <artista>".'); return; }
    items.forEach(i => shown.add(String(i.artist.id)));
    lastItems = append ? [...lastItems, ...items] : items;
    status('');
    if (fmt === 'playlist') { $('#results').innerHTML = ''; $('#results').appendChild(playlistView(lastItems, sceneRes.flatMap(r => r.playlists))); }
    else items.forEach(i => $('#results').appendChild(card(i, fmt)));
    $('#actions').hidden = false;
  } catch (e) {
    console.error(e); status('Algo falló consultando el catálogo (' + e.message + '). Intenta de nuevo.');
  } finally { $('#go').disabled = false; }
}

$('#form').onsubmit = e => { e.preventDefault(); discover(); };
$('#prompt').onkeydown = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); discover(); } };
$('#again').onclick = () => discover({ append: true });
$('#copy').onclick = async () => {
  const txt = lastItems.map(i => `${i.artist.name} - ${i.track.title}`).join('\n');
  try { await navigator.clipboard.writeText(txt); $('#copy').textContent = '¡Copiada!'; } catch { prompt('Copia la lista:', txt); }
  setTimeout(() => $('#copy').textContent = 'Copiar lista', 1500);
};
const nov = $('#novelty');
const novLabel = () => $('#noveltyLabel').textContent = nov.value < 35 ? 'Cerca' : nov.value < 70 ? 'Medio' : 'Lejos';
nov.oninput = novLabel;

const EXAMPLES = ['algo melancólico con groove para manejar de noche', 'para estudiar sin letra pero que no sea lofi típico', 'fiesta en casa, cumbia y cosas raras', 'parecido a Natalia Lafourcade pero menos conocido', 'un álbum de jazz para el domingo en la mañana', 'playlist para el gym con energía', 'city pop japonés 80s', 'triste pero bonito, para un día de lluvia'];
$('#examples').innerHTML = EXAMPLES.map(x => `<button type="button">${esc(x)}</button>`).join('');
$('#examples').querySelectorAll('button').forEach(b => b.onclick = () => { $('#prompt').value = b.textContent; discover(); });

const qp = new URLSearchParams(location.search);
if (qp.get('n')) { nov.value = qp.get('n'); }
if (qp.get('f')) { const r = document.querySelector(`input[name=format][value="${qp.get('f')}"]`); if (r) r.checked = true; }
novLabel(); updateSaved();
if (qp.get('q')) { $('#prompt').value = qp.get('q'); discover(); }
