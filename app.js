const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const API = 'https://api.deezer.com';
const store = {
  get: (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
};
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const K = s => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').normalize('NFC').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
const cssUrl = u => /^https:\/\/[^\s"'()\\<>&]+$/.test(String(u || '')) ? u : '';
const safeHref = u => /^https?:\/\//i.test(String(u || '')) ? u : '';
const TK = (artist, title) => K(artist) + '|' + K(String(title || '').replace(/\s*[([].*$/, ''));
const shuffle = a => a.map(v => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(x => x[1]);
const uid = () => Math.random().toString(36).slice(2, 10);
const icon = (n, cls = '') => `<svg class="${cls}"><use href="#i-${n}"/></svg>`;

/* ---------- persistent profile ---------- */
const DB_KEY = 'descubre:v2';
const db = Object.assign({ artists: {}, tracks: [], ids: [], liked: [], sources: [], playlists: [], prefs: { useTaste: true } }, store.get(DB_KEY, {}));
(function migrate() {
  const oldKnown = store.get('known', null), oldSaved = store.get('saved', null);
  if (oldKnown) { db.ids = [...new Set([...db.ids, ...oldKnown.map(String)])]; localStorage.removeItem('known'); }
  if (oldSaved) { oldSaved.forEach(s => { const m = String(s.link || '').match(/deezer\.com\/(?:[a-z]{2}\/)?track\/(\d+)/); db.liked.push({ id: m ? m[1] : 'legacy-' + uid(), title: s.title, artist: s.sub, link: s.link, legacy: !m }); }); localStorage.removeItem('saved'); }
})();
let knownTracks = new Set(db.tracks);
let knownIds = new Set(db.ids.map(String));
const persist = () => { db.tracks = [...knownTracks]; db.ids = [...knownIds]; try { store.set(DB_KEY, db); } catch { toast('No hay espacio para guardar más en este navegador'); } refreshCounts(); };

function addArtist(name, { id = null, src = 'manual', w = 1 } = {}) {
  const k = K(name); if (!k) return null;
  const e = db.artists[k] || (db.artists[k] = { name, n: 0, srcs: [] });
  e.n += w;
  if (id) { e.id = id; knownIds.add(String(id)); }
  if (!e.srcs.includes(src)) e.srcs.push(src);
  return k;
}
function markKnownTrack(artist, title) {
  const tk = TK(artist, title); knownTracks.add(tk);
  db.manualTracks = [...new Set([...(db.manualTracks || []), tk])];
}
const isKnownArtist = a => a && (knownIds.has(String(a.id)) || !!db.artists[K(a.name)]);
const tasteList = () => Object.values(db.artists).sort((a, b) => b.n - a.n);

/* ---------- Deezer (JSONP: no CORS, no key) ---------- */
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
async function resolveArtistId(entry) {
  if (entry.id) return entry.id;
  const r = await dz('/search/artist', { q: entry.name, limit: 1 });
  const a = r.data?.[0];
  if (a && K(a.name) === K(entry.name)) { entry.id = a.id; knownIds.add(String(a.id)); }
  else entry.id = -1;
  return entry.id;
}

/* ---------- candidate sources ---------- */
async function fromArtists(names, novelty, s) {
  const cands = [];
  for (const name of names.slice(0, 2)) {
    const r = await dz('/search/artist', { q: name, limit: 1 });
    const seed = r.data?.[0]; if (!seed) continue;
    s.seedIds.add(seed.id);
    const rel = (await dz(`/artist/${seed.id}/related`, { limit: 25 })).data || [];
    const near = rel.map(a => ({ artist: a, why: `Cercano a ${seed.name}`, hop: 1 }));
    let far = [];
    if (novelty >= 35) {
      const via = shuffle(rel).slice(0, novelty >= 70 ? 5 : 3);
      const res = await pool(via, 5, v => dz(`/artist/${v.id}/related`, { limit: 15 }).then(x => (x.data || []).map(a => ({ artist: a, why: `A 2 pasos de ${seed.name} (vía ${v.name})`, hop: 2 }))));
      far = res.flat().filter(Boolean).filter(c => !rel.some(r => r.id === c.artist.id));
    }
    if (novelty < 35) cands.push(...near);
    else if (novelty < 70) cands.push(...near.filter(c => (c.artist.nb_fan || 0) < 1500000), ...far);
    else cands.push(...far, ...near.filter(c => (c.artist.nb_fan || 0) < 300000));
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
    const tracks = await pool(pls, 2, p => dz(`/playlist/${p.id}/tracks`, { limit: 100 }).then(x => (x.data || []).map(t => ({ track: t, artist: t.artist, why: sc.far ? `Escena «${sc.term}», vecina de ${sc.from}` : `Escena «${sc.term}»`, scene: sc.term }))));
    return tracks.flat().filter(Boolean);
  });
  return res.filter(Boolean).flat();
}

// Taste: related artists of what you already listen to (imported playlists + likes).
async function fromTaste(s) {
  const top = tasteList().slice(0, 40);
  if (!top.length) return [];
  const picks = [];
  const bag = top.flatMap(e => Array(Math.min(6, Math.ceil(e.n))).fill(e));
  while (picks.length < Math.min(4, top.length) && bag.length) {
    const e = bag.splice(Math.floor(Math.random() * bag.length), 1)[0];
    if (!picks.includes(e)) picks.push(e);
  }
  const res = await pool(picks, 4, async e => {
    const id = await resolveArtistId(e); if (!id || id < 0) return [];
    const rel = (await dz(`/artist/${id}/related`, { limit: 20 })).data || [];
    rel.forEach(a => { if (!s.tasteNear.has(a.id)) s.tasteNear.set(a.id, e.name); });
    let out = rel.map(a => ({ artist: a, why: `Porque escuchas ${e.name}`, hop: 1, taste: true }));
    if (s.novelty >= 60 && rel.length) {
      const v = shuffle(rel)[0];
      const far = (await dz(`/artist/${v.id}/related`, { limit: 15 })).data || [];
      far.forEach(a => { if (!s.tasteNear.has(a.id)) s.tasteNear.set(a.id, e.name); });
      out = out.concat(far.map(a => ({ artist: a, why: `Más allá de ${e.name} (vía ${v.name})`, hop: 2, taste: true })));
    }
    return out;
  });
  persist();
  return res.filter(Boolean).flat();
}

// Unknown songs by artists you already know (or name in the prompt): top tracks + deeper album cuts.
const NOT_CUT = /\b(remix|remixed|live|en vivo|karaoke|instrumental|acapella|sped up|slowed)\b/i;
async function fromDeep(s) {
  const named = s.intent.deep.map(name => ({ name }));
  const mine = s.intent.deepTaste ? shuffle(tasteList().slice(0, 40)).slice(0, 6) : [];
  const res = await pool([...named, ...mine].slice(0, 6), 4, async e => {
    let a;
    if (db.artists[K(e.name)]) { const id = await resolveArtistId(db.artists[K(e.name)]); if (id > 0) a = await dz(`/artist/${id}`); }
    if (!a) a = (await dz('/search/artist', { q: e.name, limit: 1 })).data?.[0];
    if (!a) return [];
    s.seedIds.add(a.id);
    const [top, albums] = await Promise.all([dz(`/artist/${a.id}/top`, { limit: 50 }), dz(`/artist/${a.id}/albums`, { limit: 50 })]);
    const al = shuffle((albums.data || []).filter(x => x.record_type !== 'single')).slice(0, s.novelty >= 60 ? 4 : 2);
    const cuts = await pool(al, 3, x => dz(`/album/${x.id}/tracks`, { limit: 60 }).then(r => (r.data || []).map(t => ({ ...t, album: { id: x.id, title: x.title, cover_medium: x.cover_medium, cover_big: x.cover_big } }))));
    const hits = (top.data || []).slice(s.novelty >= 50 ? 5 : 0).map(t => ({ t, why: `Otra de ${a.name} que no tienes registrada` }));
    const deep = cuts.flat().filter(Boolean).map(t => ({ t, why: `De «${t.album.title}» · ${a.name}` }));
    const seen = new Set();
    return [...hits, ...deep].filter(({ t }) => t.artist?.id === a.id && !NOT_CUT.test(t.title) && !knownTracks.has(TK(a.name, t.title)) && !seen.has(K(t.title_short || t.title)) && seen.add(K(t.title_short || t.title)))
      .map(({ t, why }) => ({ track: t, artist: a, why, deep: true, scene: 'deep:' + a.id }));
  });
  return res.filter(Boolean).flat();
}

// Every Noise genre pages list artists by popularity; read them through the public reader and match on Deezer.
async function enArtists(genre) {
  const cache = store.get('descubre:en', {});
  if (cache[genre]) return cache[genre];
  const ctl = new AbortController(); const tm = setTimeout(() => ctl.abort(), 9000);
  try {
    const r = await fetch('https://r.jina.ai/https://everynoise.com/engenremap-' + enSlug(genre) + '.html', { signal: ctl.signal });
    if (!r.ok) throw new Error('everynoise ' + r.status);
    const names = [...(await r.text()).matchAll(/^(.+?)\[»\]\(https:\/\/everynoise\.com\/artistprofile/gm)].map(m => m[1].trim()).filter(Boolean);
    const keys = Object.keys(cache); if (keys.length > 30) delete cache[keys[0]];
    cache[genre] = names; try { store.set('descubre:en', cache); } catch {}
    return names;
  } finally { clearTimeout(tm); }
}
async function fromEveryNoise(scenes, s) {
  const gs = [...new Set(scenes.map(sc => enFind(sc.term)?.g).filter(Boolean))].slice(0, 2);
  const res = await pool(gs, 2, async g => {
    const names = await enArtists(g);
    const start = Math.floor(names.length * (s.novelty / 100) * 0.6);
    const pick = shuffle(names.slice(start)).filter(n => !db.artists[K(n)] && !s.exclude.has(K(n))).slice(0, 8);
    const found = await pool(pick, 4, async n => { const a = (await dz('/search/artist', { q: n, limit: 1 })).data?.[0]; return a && K(a.name) === K(n) ? a : null; });
    return found.filter(Boolean).map(a => ({ artist: a, why: `Mapa Every Noise · «${g}»`, hop: 1, scene: 'en:' + g }));
  });
  return res.filter(Boolean).flat();
}

const ckey = c => c.deep ? 't' + c.track.id : c.artist.id;
function rank(cands, s) {
  const { novelty } = s;
  const byArtist = new Map();
  const hasContext = s.scenes.length || s.intent.artists.length;
  for (const c of cands) {
    const a = c.artist; if (!a || !a.id) continue;
    if (!c.deep && (s.seedIds.has(a.id) || isKnownArtist(a) || s.exclude.has(K(a.name)))) continue;
    if (c.track && (!c.track.readable || knownTracks.has(TK(a.name, c.track.title)))) continue;
    const pop = c.track ? (c.track.rank || 0) / 1e6 : Math.min(1, Math.log10((a.nb_fan || 1) + 1) / 7);
    if (novelty >= 70 && pop > 0.85) continue;
    const target = 1 - novelty / 100;
    let score = Math.random() * 0.6 + (1 - Math.abs(pop - target * 0.9)) * 0.6 + (c.hop === 2 ? novelty / 250 : 0);
    if (c.taste && hasContext) score -= 0.3;
    const near = !c.taste && s.tasteNear.get(a.id);
    const item = { ...c, score };
    if (near) { item.score += 0.35; item.why = `${c.why} · cerca de ${near}`; }
    const key = ckey(c);
    const list = byArtist.get(key) || [];
    list.push(item);
    byArtist.set(key, list);
  }
  const groups = [...byArtist.values()].map(l => l.sort((x, y) => y.score - x.score)[0]);
  groups.sort((x, y) => y.score - x.score);
  const seen = {};
  return groups.map(x => { const k = x.scene || x.why; seen[k] = (seen[k] || 0) + 1; return { ...x, score: x.score - seen[k] * 0.08 }; }).sort((x, y) => y.score - x.score);
}

async function ensureTrack(items) {
  return (await pool(items, 6, async it => {
    if (it.track) return it;
    const top = (await dz(`/artist/${it.artist.id}/top`, { limit: 5 })).data || [];
    const t = top.find(x => x.readable && x.preview && !knownTracks.has(TK(it.artist.name, x.title))) || top[0];
    return t ? { ...it, track: t } : null;
  })).filter(Boolean);
}

const toTrack = it => {
  const t = it.track, a = it.artist;
  return { id: t.id, title: t.title_short || t.title, artist: a.name, artistId: a.id, album: t.album?.title, albumId: t.album?.id,
    cover: t.album?.cover_medium || t.album?.cover_big, coverBig: t.album?.cover_big || t.album?.cover_xl || t.album?.cover_medium,
    preview: t.preview, link: t.link || `https://www.deezer.com/track/${t.id}`, why: it.why };
};

/* ---------- discovery sessions: a queue that refills so every slot can be replaced ---------- */
let session = null;
function newSession({ intent, fmt, novelty, useTaste, exclude = [] }) {
  return { intent, fmt, novelty, useTaste, scenes: [], seedIds: new Set(), tasteNear: new Map(), exclude: new Set(exclude.map(K)),
    queue: [], shownArtists: new Set(), shownAlbums: new Set(), refills: 0, lock: null, dead: false };
}
async function gather(s) {
  const scenes = pickScenes(s.intent, s.novelty);
  if (!s.scenes.length) s.scenes = scenes;
  if (s.intent.deep.length || s.intent.deepTaste) return fromDeep(s).catch(() => []);
  const [ac, sc, tc, ec] = await Promise.all([
    s.intent.artists.length ? fromArtists(s.intent.artists, s.novelty, s).catch(() => []) : [],
    scenes.length ? fromScenes(scenes, s.intent).catch(() => []) : [],
    s.useTaste ? fromTaste(s).catch(() => []) : [],
    scenes.length ? fromEveryNoise(scenes, s).catch(() => []) : [],
  ]);
  return [...ac, ...sc, ...tc, ...ec];
}
function refill(s) {
  if (s.lock) return s.lock;
  if (s.refills >= 4) return Promise.resolve();
  s.lock = (async () => {
    s.refills++;
    let ranked = rank(await gather(s), s);
    if (!ranked.length && s.novelty >= 70) ranked = rank(await gather(s), { ...s, novelty: 50 });
    const inQ = new Set(s.queue.map(ckey));
    s.queue.push(...ranked.filter(c => !inQ.has(ckey(c)) && (c.deep || !s.shownArtists.has(c.artist.id))));
  })().finally(() => { s.lock = null; });
  return s.lock;
}
const stillValid = (s, c) => c.deep ? !knownTracks.has(TK(c.artist.name, c.track.title)) && !(s.shownTracks && s.shownTracks.has(String(c.track.id))) : !s.shownArtists.has(c.artist.id) && !isKnownArtist(c.artist) && !s.exclude.has(K(c.artist.name));
async function nextItems(s, n) {
  const out = [];
  while (out.length < n) {
    if (s.queue.length < (n - out.length) + 3) await refill(s);
    s.queue = s.queue.filter(c => stillValid(s, c));
    if (!s.queue.length) break;
    const batch = s.queue.splice(0, (n - out.length) + 2);
    for (const it of await ensureTrack(batch)) {
      if (out.length >= n) { s.queue.unshift(it); continue; }
      if (!stillValid(s, it) || knownTracks.has(TK(it.artist.name, it.track.title))) continue;
      const shownT = s.shownTracks || (s.shownTracks = new Set());
      const shownK = s.shownTK || (s.shownTK = new Set()), tk = TK(it.artist.name, it.track.title);
      if (shownT.has(String(it.track.id)) || shownK.has(tk)) continue;
      shownT.add(String(it.track.id)); shownK.add(tk);
      if (s.fmt === 'album') { const al = it.track.album?.id; if (!al || s.shownAlbums.has(al)) continue; s.shownAlbums.add(al); }
      if (!it.deep) s.shownArtists.add(it.artist.id);
      out.push(it);
    }
  }
  if (s.queue.length < 6 && !s.dead) refill(s);
  return out;
}

/* ---------- player ---------- */
const player = $('#player');
let now = null, queue = [], qi = -1;
async function freshPreview(t) {
  if (!t.id || isNaN(+t.id)) return null;
  const x = await dz(`/track/${t.id}`).catch(() => null);
  if (x?.preview) { t.preview = x.preview; return x.preview; }
  return null;
}
async function playTrack(t, list = null) {
  if (list) { queue = list; qi = list.indexOf(t); }
  if (now && sameTrack(now, t)) { player.paused ? player.play() : player.pause(); return; }
  now = t;
  $('#pTitle').textContent = t.title; $('#pArtist').textContent = t.artist;
  $('#pArt').style.backgroundImage = t.cover ? `url('${cssUrl(t.cover)}')` : '';
  $('#pSide').innerHTML = links(`${t.artist} ${t.title}`);
  let src = t.preview || await freshPreview(t);
  if (!src) { toast('Esta canción no tiene preview'); return; }
  player.src = src;
  try { await player.play(); } catch {
    src = await freshPreview(t);
    if (src) { player.src = src; player.play().catch(() => toast('No se pudo reproducir el preview')); }
  }
  syncPlaying();
}
const sameTrack = (a, b) => a && b && String(a.id) === String(b.id);
function syncPlaying() {
  const on = !player.paused && now;
  $('#pPlay').innerHTML = icon(on ? 'pause' : 'play');
  document.body.classList.toggle('is-playing', !!on);
  $$('[data-tid]').forEach(el => {
    const p = on && String(el.dataset.tid) === String(now.id);
    el.classList.toggle('playing', !!p);
    const b = el.querySelector('.pbtn, .th'); if (b) b.innerHTML = icon(p ? 'pause' : 'play');
  });
}
player.onplay = player.onpause = syncPlaying;
player.ontimeupdate = () => { $('#pProg').style.width = (player.duration ? player.currentTime / player.duration * 100 : 0) + '%'; };
player.onended = () => { if (queue.length && qi < queue.length - 1) playTrack(queue[++qi]); else syncPlaying(); };
$('#pPlay').onclick = () => { if (!now) { const f = $('[data-tid] .pbtn, [data-tid] .th'); f ? f.click() : toast('Elige una canción'); return; } player.paused ? player.play() : player.pause(); };
$('#pNext').onclick = () => { if (queue.length && qi < queue.length - 1) playTrack(queue[++qi]); };

/* ---------- helpers UI ---------- */
function links(q) {
  const e = encodeURIComponent(q);
  return `<a href="https://open.spotify.com/search/${e}" target="_blank" rel="noopener">Spotify</a><a href="https://music.apple.com/us/search?term=${e}" target="_blank" rel="noopener">Apple</a><a href="https://music.youtube.com/search?q=${e}" target="_blank" rel="noopener">YouTube</a><a href="https://music.amazon.com/search/${e}" target="_blank" rel="noopener">Amazon</a>`;
}
let toastT;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => t.hidden = true, 2600); }
const status = (sel, msg) => { $(sel).hidden = !msg; $(sel).textContent = msg || ''; };

/* add-to-playlist menu */
function openMenu(anchor, tracks) {
  const m = $('#menu');
  const pls = db.playlists;
  m.innerHTML = `<div class="mh">Añadir a playlist</div><button data-new>${icon('plus')}Nueva playlist…</button>` + pls.map(p => `<button data-id="${p.id}">${icon('list')}${esc(p.name)}</button>`).join('');
  m.hidden = false;
  const r = anchor.getBoundingClientRect();
  const w = 230, h = Math.min(320, 80 + pls.length * 36);
  m.style.left = Math.max(8, Math.min(innerWidth - w - 8, r.left - w / 2)) + 'px';
  m.style.top = (r.bottom + h > innerHeight ? Math.max(8, r.top - h) : r.bottom + 4) + 'px';
  m.onclick = e => {
    const b = e.target.closest('button'); if (!b) return;
    let p;
    if (b.hasAttribute('data-new')) { const name = prompt('Nombre de la playlist', 'Mi descubrimiento'); if (!name) return; p = createPlaylist(name); }
    else p = db.playlists.find(x => x.id === b.dataset.id);
    const added = addToPlaylist(p, tracks);
    closeMenu(); toast(added ? `Añadida a «${p.name}»` : `Ya estaba en «${p.name}»`);
  };
  setTimeout(() => document.addEventListener('click', closeMenuOutside), 0);
}
function closeMenuOutside(e) { if (!$('#menu').contains(e.target)) closeMenu(); }
function closeMenu() { $('#menu').hidden = true; document.removeEventListener('click', closeMenuOutside); }

/* ---------- discover view ---------- */
function tile(it, fmt) {
  const t = toTrack(it), a = it.artist;
  let cover = t.coverBig, title = t.title, sub = `<a href="https://www.deezer.com/artist/${a.id}" target="_blank" rel="noopener">${esc(a.name)}</a>`, q = `${a.name} ${t.title}`;
  if (fmt === 'artist') { cover = a.picture_big || a.picture_medium || `${API}/artist/${a.id}/image?size=big`; title = a.name; sub = `Escucha: ${esc(t.title)}`; q = a.name; }
  if (fmt === 'album') { title = t.album || t.title; q = `${a.name} ${t.album || ''}`; }
  const el = document.createElement('article');
  el.className = `tile ${fmt}`; el.dataset.tid = t.id;
  el.innerHTML = `<div class="art" style="background-image:url('${cssUrl(cover)}')"><button class="pbtn" title="Preview 30 s">${icon('play')}</button></div>
  <div class="meta"><div class="t-title" title="${esc(title)}">${esc(title)}</div><div class="t-sub">${sub}</div><div class="why">${esc(it.why)}</div>
  <div class="t-acts">
    <button class="icon-btn" data-a="like" title="Guardar (te doy otra)">${icon('heart')}</button>
    <button class="icon-btn" data-a="known" title="Ya la conozco (te doy otra)">${icon('known')}</button>
    <button class="icon-btn" data-a="swap" title="Otra opción">${icon('swap')}</button>
    <button class="icon-btn" data-a="add" title="Añadir a playlist">${icon('plus')}</button>
    <span class="links"><a href="https://open.spotify.com/search/${encodeURIComponent(q)}" target="_blank" rel="noopener">Spotify</a><a href="https://music.apple.com/us/search?term=${encodeURIComponent(q)}" target="_blank" rel="noopener">Apple</a></span>
  </div></div>`;
  const play = () => playTrack(t, currentTracks());
  el.querySelector('.art').onclick = play;
  el.querySelector('.pbtn').onclick = e => { e.stopPropagation(); play(); };
  el.querySelector('.t-acts').onclick = e => {
    const b = e.target.closest('[data-a]'); if (!b) return;
    const act = b.dataset.a;
    if (act === 'add') { e.stopPropagation(); openMenu(b, [t]); return; }
    if (act === 'like') { like(t); toast('Guardada ♥ — aquí va otra opción'); }
    if (act === 'known') { addArtist(a.name, { id: a.id, src: 'manual' }); markKnownTrack(a.name, t.title); persist(); toast(`Anotado: ya conoces a ${a.name}`); }
    replaceTile(el);
  };
  el._track = t;
  return el;
}
const currentTracks = () => $$('#results [data-tid]').map(el => el._track).filter(Boolean);

async function replaceTile(el) {
  const s = session; if (!s) return;
  el.classList.add('out');
  el.style.pointerEvents = 'none';
  const [nx] = await nextItems(s, 1);
  if (s !== session) return;
  if (nx) { const n = tile(nx, s.fmt); el.replaceWith(n); syncPlaying(); }
  else { el.remove(); toast('No encontré más opciones con ese prompt; prueba otro'); }
}

function like(t) {
  if (!db.liked.some(x => sameTrack(x, t))) db.liked.unshift({ ...t, added: Date.now() });
  addArtist(t.artist, { id: t.artistId, src: 'liked', w: 3 });
  knownTracks.add(TK(t.artist, t.title));
  persist();
}

function skeleton(n) { $('#results').innerHTML = Array.from({ length: n }, () => `<div class="tile skel"><div class="art"></div><div class="meta"><i></i><i></i></div></div>`).join(''); }

function showIntent(s) {
  const { intent, fmt } = s;
  const fmtName = { track: 'canciones', artist: 'artistas', album: 'álbumes', playlist: 'playlist' }[fmt];
  const chips = [
    `<span>Entendí:</span>`,
    ...intent.moods.map(m => `<span class="chip">${esc(m.label)}</span>`),
    ...intent.artists.map(a => `<span class="chip">como ${esc(a)}</span>`),
    ...intent.deep.map(a => `<span class="chip g">más de ${esc(a)}</span>`),
    intent.deepTaste ? `<span class="chip g">canciones nuevas de tus artistas</span>` : '',
    ...s.scenes.map(x => `<span class="chip g">${esc(x.term)}${x.far ? ` <small>(vecina de ${esc(x.from)}${x.en ? ' en Every Noise' : ''})</small>` : ''}</span>`),
    intent.era ? `<span class="chip">${esc(intent.era)}</span>` : '', intent.region ? `<span class="chip">${esc(intent.region)}</span>` : '',
    s.useTaste ? `<span class="chip g">${icon('user')} según tus gustos</span>` : '',
    `<span class="chip">→ ${fmtName}</span>`,
  ];
  $('#intent').innerHTML = chips.join(''); $('#intent').hidden = false;
}

async function discover() {
  const prompt = $('#prompt').value.trim();
  const useTaste = $('#useTaste').checked && tasteList().length > 0;
  const intent = parseIntent(prompt);
  if (intent.deepTaste && !tasteList().length) { toast('Primero importa tus playlists en Mis gustos'); return; }
  if (!prompt && !useTaste) { $('#prompt').focus(); toast(tasteList().length ? 'Escribe un prompt o activa “Usar mis gustos”' : 'Escribe un prompt (o importa tus playlists en Mis gustos)'); return; }
  const novelty = +$('#novelty').value;
  const chosen = document.querySelector('input[name=format]:checked').value;
  let fmt = chosen === 'auto' ? (intent.format || 'track') : chosen;
  const deep = intent.deep.length || intent.deepTaste;
  if (deep && fmt === 'artist') fmt = 'track';
  if (prompt && !deep && !intent.genres.length && !intent.moods.length && !intent.artists.length && !intent.keywords.length) intent.keywords = [prompt];
  history.replaceState(null, '', '?' + new URLSearchParams({ q: prompt, f: chosen, n: novelty }) + '#descubrir');
  const s = session = newSession({ intent, fmt, novelty, useTaste: useTaste && !deep });
  const want = fmt === 'playlist' ? 25 : 9;
  $('#go').disabled = true; $('#actions').hidden = true; $('#legend').hidden = true; $('#intent').hidden = true;
  status('#status', deep ? 'Buscando canciones que no tienes registradas de esos artistas…' : useTaste ? 'Explorando escenas y artistas cercanos a lo que escuchas…' : 'Explorando escenas y artistas relacionados…');
  fmt === 'playlist' ? ($('#results').innerHTML = '') : skeleton(9);
  try {
    const items = await nextItems(s, want);
    if (s !== session) return;
    showIntent(s);
    if (!items.length) { $('#results').innerHTML = ''; status('#status', 'No encontré nada nuevo con eso. Prueba otras palabras, un género o "como <artista>".'); return; }
    status('#status', '');
    $('#results').innerHTML = '';
    if (fmt === 'playlist') { renderDraft(items.map(toTrack), prompt); return; }
    items.forEach(i => $('#results').appendChild(tile(i, fmt)));
    $('#legend').hidden = false; $('#actions').hidden = false;
    syncPlaying();
  } catch (e) {
    console.error(e); $('#results').innerHTML = ''; status('#status', 'Algo falló consultando el catálogo (' + e.message + '). Intenta de nuevo.');
  } finally { if (s === session) $('#go').disabled = false; }
}

/* playlist format: an editable draft you can save */
function renderDraft(tracks, prompt) {
  const name = prompt ? prompt.charAt(0).toUpperCase() + prompt.slice(1, 60) : 'Según mis gustos';
  const box = document.createElement('div');
  box.style.gridColumn = '1 / -1';
  box.innerHTML = `<div class="pl-head" style="margin:0 0 14px">${collage(tracks)}<div class="pl-meta"><small class="mut">Borrador de playlist</small>
    <input class="pl-name" id="draftName" value="${esc(name)}"><span class="mut" id="draftCount"></span>
    <div class="actions left"><button class="btn primary" id="draftSave">${icon('plus')}Guardar en mis playlists</button><button class="btn" id="draftPlay">${icon('play')}Reproducir</button><button class="btn" id="draftSpotify">Guardar y pasar a Spotify</button><button class="btn ghost" id="draftCopy">Copiar lista</button></div>
    <p class="hint">Quita o cambia canciones antes de guardarla. ${icon('known')} = ya la conozco, ${icon('swap')} = otra opción.</p></div></div><div class="tracks" id="draftRows"></div>`;
  $('#results').appendChild(box);
  const draw = () => {
    $('#draftCount').textContent = `${tracks.length} canciones`;
    $('#draftRows').innerHTML = '';
    tracks.forEach((t, i) => $('#draftRows').appendChild(trackRow(t, i, tracks, [
      { a: 'known', t: 'Ya la conozco', fn: async () => { addArtist(t.artist, { id: t.artistId }); markKnownTrack(t.artist, t.title); persist(); await swapIn(i); } },
      { a: 'swap', t: 'Otra opción', fn: () => swapIn(i) },
      { a: 'x', t: 'Quitar', fn: () => { tracks.splice(i, 1); draw(); } },
    ])));
    syncPlaying();
  };
  const swapIn = async i => {
    const [nx] = await nextItems(session, 1);
    if (nx) tracks.splice(i, 1, toTrack(nx)); else { tracks.splice(i, 1); toast('No encontré más opciones'); }
    draw();
  };
  draw();
  $('#draftSave').onclick = () => { const p = createPlaylist($('#draftName').value || name); addToPlaylist(p, tracks); toast(`Playlist «${p.name}» guardada`); location.hash = '#playlist/' + p.id; };
  $('#draftPlay').onclick = () => tracks[0] && playTrack(tracks[0], tracks);
  $('#draftCopy').onclick = () => copyList(tracks, $('#draftCopy'));
  $('#draftSpotify').onclick = () => { const p = createPlaylist($('#draftName').value || name); addToPlaylist(p, tracks); location.hash = '#playlist/' + p.id; sendToSpotify(p); };
}

$('#form').onsubmit = e => { e.preventDefault(); discover(); };
$('#prompt').onkeydown = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); discover(); } };
$('#again').onclick = async () => {
  const s = session; if (!s) return;
  $('#again').disabled = true; skeleton(9);
  const items = await nextItems(s, 9);
  $('#again').disabled = false;
  if (s !== session) return;
  $('#results').innerHTML = '';
  if (!items.length) { status('#status', 'Ya no encontré más con ese prompt. Prueba otro o sube “qué tan nuevo”.'); return; }
  items.forEach(i => $('#results').appendChild(tile(i, s.fmt))); syncPlaying();
  scrollTo({ top: $('#intent').offsetTop - 80, behavior: 'smooth' });
};
$('#toPlaylist').onclick = e => openMenu(e.currentTarget, currentTracks());
$('#copy').onclick = () => copyList(currentTracks(), $('#copy'));
async function copyList(tracks, btn) {
  const txt = tracks.map(t => `${t.artist} - ${t.title}`).join('\n');
  try { await navigator.clipboard.writeText(txt); const o = btn.textContent; btn.textContent = '¡Copiada!'; setTimeout(() => btn.textContent = o, 1500); } catch { prompt('Copia la lista:', txt); }
}
const nov = $('#novelty');
const novLabel = () => $('#noveltyLabel').textContent = nov.value < 35 ? 'Cerca' : nov.value < 70 ? 'Medio' : 'Lejos';
nov.oninput = novLabel;
$('#useTaste').onchange = () => { db.prefs.useTaste = $('#useTaste').checked; persist(); };
const EXAMPLES = ['canciones que no conozco de mis artistas', 'más de Natalia Lafourcade', 'algo melancólico con groove para manejar de noche', 'para estudiar sin letra pero que no sea lofi típico', 'fiesta en casa, cumbia y cosas raras', 'parecido a Natalia Lafourcade pero menos conocido', 'un álbum de jazz para el domingo en la mañana', 'playlist para el gym con energía', 'city pop japonés 80s', 'triste pero bonito, para un día de lluvia'];
$('#examples').innerHTML = EXAMPLES.map(x => `<button type="button">${esc(x)}</button>`).join('');
$('#examples').querySelectorAll('button').forEach(b => b.onclick = () => { $('#prompt').value = b.textContent; discover(); });

/* ---------- track rows (playlists, saved, drafts) ---------- */
function trackRow(t, i, list, acts) {
  const el = document.createElement('div');
  el.className = 'trow'; el.dataset.tid = t.id;
  el.innerHTML = `<span class="n">${i + 1}</span><div class="th" style="background-image:url('${cssUrl(t.cover)}')">${icon('play')}</div>
    <div class="tt"><b>${esc(t.title)}</b><span>${esc(t.artist)}${t.why ? ' · ' + esc(t.why) : ''}</span></div>
    <div class="ra">${acts.map((a, k) => `<button class="icon-btn" data-k="${k}" title="${esc(a.t)}">${icon(a.a)}</button>`).join('')}
    ${t.legacy && safeHref(t.link) ? `<a href="${esc(t.link)}" target="_blank" rel="noopener">Deezer</a>` : ''}<a href="https://open.spotify.com/search/${encodeURIComponent(t.artist + ' ' + t.title)}" target="_blank" rel="noopener">Spotify</a><a href="https://music.apple.com/us/search?term=${encodeURIComponent(t.artist + ' ' + t.title)}" target="_blank" rel="noopener">Apple</a><a href="https://music.youtube.com/search?q=${encodeURIComponent(t.artist + ' ' + t.title)}" target="_blank" rel="noopener">YouTube</a></div>`;
  el.querySelector('.th').onclick = () => playTrack(t, list);
  el.querySelectorAll('[data-k]').forEach(b => b.onclick = e => { e.stopPropagation(); acts[+b.dataset.k].fn(b); });
  return el;
}

/* ---------- playlists ---------- */
function createPlaylist(name) { const p = { id: uid(), name: name.trim() || 'Nueva playlist', tracks: [], created: Date.now() }; db.playlists.unshift(p); persist(); renderSide(); return p; }
function addToPlaylist(p, tracks) {
  let n = 0;
  for (const t of tracks) if (!p.tracks.some(x => sameTrack(x, t))) { p.tracks.push({ ...t }); n++; }
  persist(); renderSide(); return n;
}
function collage(tracks, cls = '') {
  const covers = [...new Set(tracks.map(t => t.coverBig || t.cover).filter(Boolean))];
  if (!covers.length) return `<div class="collage empty ${cls}">${icon('note')}</div>`;
  if (covers.length < 4) return `<div class="collage one ${cls}"><i style="background-image:url('${cssUrl(covers[0])}')"></i></div>`;
  return `<div class="collage ${cls}">${covers.slice(0, 4).map(c => `<i style="background-image:url('${cssUrl(c)}')"></i>`).join('')}</div>`;
}
function renderSide() {
  $('#sidePlaylists').innerHTML = db.playlists.map(p => { const c = p.tracks.find(t => t.cover)?.cover; return `<a href="#playlist/${p.id}" data-nav="playlist/${p.id}"><span class="pl-mini" style="${c ? `background-image:url('${cssUrl(c)}')` : ''}"></span>${esc(p.name)}</a>`; }).join('') || '<span class="hint" style="padding:0 10px">Aún no tienes playlists</span>';
}
function renderPlaylists() {
  $('#plGrid').innerHTML = db.playlists.map(p => `<div class="ptile" data-id="${p.id}">${collage(p.tracks)}<div class="meta"><b>${esc(p.name)}</b><span class="t-sub">${p.tracks.length} canciones</span></div></div>`).join('') || '<p class="empty">Crea una playlist o guarda una desde Descubrir.</p>';
  $$('#plGrid .ptile').forEach(el => el.onclick = () => location.hash = '#playlist/' + el.dataset.id);
}
let curPl = null;
function renderPlaylist(id) {
  const p = curPl = db.playlists.find(x => x.id === id);
  if (!p) { location.hash = '#playlists'; return; }
  $('#plCover').outerHTML = collage(p.tracks).replace('class="collage', 'id="plCover" class="collage');
  $('#plName').value = p.name;
  $('#plCount').textContent = `${p.tracks.length} canciones`;
  const box = $('#plTracks'); box.innerHTML = '';
  if (!p.tracks.length) box.innerHTML = '<p class="empty">Vacía. Usa “Sugerir canciones” o añade desde Descubrir con el botón +.</p>';
  p.tracks.forEach((t, i) => box.appendChild(trackRow(t, i, p.tracks, [
    { a: 'up', t: 'Subir', fn: () => { if (i) { [p.tracks[i - 1], p.tracks[i]] = [p.tracks[i], p.tracks[i - 1]]; persist(); renderPlaylist(id); } } },
    { a: 'down', t: 'Bajar', fn: () => { if (i < p.tracks.length - 1) { [p.tracks[i + 1], p.tracks[i]] = [p.tracks[i], p.tracks[i + 1]]; persist(); renderPlaylist(id); } } },
    { a: 'x', t: 'Quitar', fn: () => { p.tracks.splice(i, 1); persist(); renderPlaylist(id); renderSide(); } },
  ])));
  syncPlaying();
}
$('#plName').onchange = () => { if (curPl) { curPl.name = $('#plName').value.trim() || curPl.name; persist(); renderSide(); } };
$('#plPlay').onclick = () => curPl?.tracks[0] && playTrack(curPl.tracks[0], curPl.tracks);
$('#plCopy').onclick = () => curPl && copyList(curPl.tracks, $('#plCopy'));
$('#plExport').onclick = () => curPl && download(`${curPl.name}.txt`, curPl.tracks.map(t => `${t.artist} - ${t.title}`).join('\n'), 'text/plain');
$('#plSpotify').onclick = () => curPl && sendToSpotify(curPl);
async function sendToSpotify(p) {
  if (!p?.tracks.length) { toast('La playlist está vacía'); return; }
  if (!Spotify.clientId()) { location.hash = '#gustos'; setTimeout(() => $('#spPanel').scrollIntoView({ behavior: 'smooth' }), 80); toast('Primero configura Spotify (una sola vez)'); return; }
  const st = '#plStatus';
  try {
    status(st, 'Buscando tus canciones en Spotify…');
    const r = await Spotify.exportPlaylist(p, (d, n) => status(st, `Buscando en Spotify… ${d}/${n}`));
    $(st).hidden = false;
    $(st).innerHTML = `Listo: «${esc(p.name)}» ya está en tu Spotify con ${r.added} canciones${r.missing.length ? ` (no encontré ${r.missing.length}: ${esc(r.missing.slice(0, 3).map(t => t.title).join(', '))}${r.missing.length > 3 ? '…' : ''})` : ''}. ${safeHref(r.url) ? `<a href="${esc(r.url)}" target="_blank" rel="noopener">Abrir en Spotify</a>` : ''}`;
  } catch (e) {
    if (e.message === 'auth') { status(st, 'Conectando con Spotify…'); Spotify.connect(p.id).catch(err => status(st, 'No se pudo conectar: ' + err.message)); return; }
    status(st, 'No se pudo crear en Spotify: ' + e.message);
  }
}
function renderSpotify() {
  $('#spRedirect').textContent = Spotify.redirectUri();
  $('#spClient').value = Spotify.clientId();
  const on = Spotify.connected();
  $('#spState').textContent = !Spotify.clientId() ? 'Sin configurar' : on ? 'Conectado ✓' : 'Configurado, sin conectar';
  $('#spDisconnect').hidden = !on;
}
$('#spForm').onsubmit = e => { e.preventDefault(); Spotify.setClientId($('#spClient').value); renderSpotify(); toast($('#spClient').value.trim() ? 'Client ID guardado' : 'Client ID borrado'); };
$('#spConnect').onclick = () => Spotify.connect('').catch(e => toast(e.message === 'no-client' ? 'Pega primero tu Client ID' : e.message));
$('#spDisconnect').onclick = () => { Spotify.disconnect(); renderSpotify(); };
$('#plDelete').onclick = () => { if (curPl && confirm(`¿Eliminar «${curPl.name}»?`)) { db.playlists = db.playlists.filter(x => x !== curPl); persist(); renderSide(); location.hash = '#playlists'; } };
$('#plSuggest').onclick = async () => {
  const p = curPl; if (!p) return;
  const names = [...new Set(p.tracks.map(t => t.artist))];
  if (!names.length && !tasteList().length) { toast('Agrega al menos una canción primero'); return; }
  const btn = $('#plSuggest'); btn.disabled = true;
  $('#plSuggestBox').hidden = false; $('#plSuggestions').innerHTML = '<p class="empty">Buscando canciones que vayan con esta playlist…</p>';
  const intent = { raw: '', genres: [], moods: [], artists: shuffle(names).slice(0, 2), format: 'track', era: null, region: null, keywords: [] };
  const s = newSession({ intent, fmt: 'track', novelty: +nov.value, useTaste: !names.length, exclude: names });
  const items = (await nextItems(s, 9)).map(toTrack);
  btn.disabled = false;
  if (curPl !== p) return;
  const box = $('#plSuggestions'); box.innerHTML = items.length ? '' : '<p class="empty">No encontré sugerencias; intenta de nuevo.</p>';
  items.forEach((t, i) => box.appendChild(trackRow(t, i, items, [
    { a: 'plus', t: 'Añadir', fn: b => { addToPlaylist(p, [t]); b.closest('.trow').remove(); renderPlaylist(p.id); toast('Añadida'); } },
    { a: 'known', t: 'Ya la conozco', fn: b => { addArtist(t.artist, { id: t.artistId }); persist(); b.closest('.trow').remove(); } },
  ])));
  syncPlaying();
};
const newPl = () => { const name = prompt('Nombre de la playlist', 'Nueva playlist'); if (name) { const p = createPlaylist(name); location.hash = '#playlist/' + p.id; } };
$('#newPl').onclick = newPl; $('#newPl2').onclick = newPl;

/* ---------- saved ---------- */
function renderSaved() {
  const box = $('#savedList'); box.innerHTML = '';
  if (!db.liked.length) { box.innerHTML = '<p class="empty">Aún no guardas nada. Toca ♡ en Descubrir.</p>'; return; }
  db.liked.forEach((t, i) => box.appendChild(trackRow(t, i, db.liked, [
    { a: 'plus', t: 'Añadir a playlist', fn: b => openMenu(b, [t]) },
    { a: 'x', t: 'Quitar de guardados', fn: () => { db.liked.splice(i, 1); persist(); renderSaved(); } },
  ])));
  syncPlaying();
}
$('#savedPlayAll').onclick = () => db.liked[0] && playTrack(db.liked[0], db.liked);
$('#savedToPl').onclick = () => { if (!db.liked.length) return toast('Aún no guardas nada'); const p = createPlaylist('Mis guardados'); addToPlaylist(p, db.liked); location.hash = '#playlist/' + p.id; };

/* ---------- gustos ---------- */
function registerImport(res, url) {
  const id = uid();
  const keys = new Set(), tks = new Set();
  let n = 0;
  for (const t of res.tracks) {
    t.artists.forEach((a, j) => { const k = addArtist(a, { id: t.ids?.[j], src: id }); if (k) keys.add(k); });
    if (t.title && t.artists[0]) { const tk = TK(t.artists[0], t.title); knownTracks.add(tk); tks.add(tk); n++; }
  }
  db.sources.unshift({ id, url, service: res.service, name: res.name, tracks: n, artists: keys.size, keys: [...tks], date: Date.now() });
  persist();
  return { n, a: keys.size };
}
$('#importForm').onsubmit = async e => {
  e.preventDefault();
  const url = $('#importUrl').value.trim(); if (!url) return;
  const btn = $('#importBtn'); btn.disabled = true;
  status('#importStatus', 'Leyendo el link… (puede tardar unos segundos)');
  try {
    const res = await importLink(url);
    if (!res.tracks.length) throw new Error('No encontré canciones en ese link.');
    const r = registerImport(res, url);
    status('#importStatus', `Listo: «${res.name}» — ${r.n} canciones de ${r.a} artistas registradas.`);
    $('#importUrl').value = '';
    renderGustos();
  } catch (err) { status('#importStatus', err.message || 'No pude importar ese link'); }
  finally { btn.disabled = false; }
};
$('#pasteBtn').onclick = () => {
  const txt = $('#pasteList').value; const tracks = parsePasted(txt);
  if (!tracks.length) return toast('Pega al menos una línea');
  const r = registerImport({ service: 'paste', name: `Lista pegada (${tracks.length})`, tracks }, '');
  $('#pasteList').value = ''; toast(`Agregué ${r.a} artistas`); renderGustos();
};
$('#addArtistForm').onsubmit = e => { e.preventDefault(); const v = $('#addArtist').value.trim(); if (!v) return; addArtist(v, { w: 2 }); persist(); $('#addArtist').value = ''; renderGustos(); };
function removeSource(id) {
  for (const [k, e] of Object.entries(db.artists)) {
    if (!e.srcs.includes(id)) continue;
    e.srcs = e.srcs.filter(x => x !== id);
    if (!e.srcs.length) { delete db.artists[k]; if (e.id) knownIds.delete(String(e.id)); }
  }
  const gone = db.sources.find(s => s.id === id);
  db.sources = db.sources.filter(s => s.id !== id);
  if (gone?.keys) {
    const keep = new Set([...(db.manualTracks || []), ...db.sources.flatMap(s => s.keys || [])]);
    gone.keys.forEach(k => { if (!keep.has(k)) knownTracks.delete(k); });
  }
  persist(); renderGustos();
}
function renderGustos() {
  const arts = tasteList();
  $('#stats').innerHTML = `<div class="stat"><b>${arts.length}</b><span>artistas que conoces</span></div><div class="stat"><b>${knownTracks.size}</b><span>canciones registradas</span></div><div class="stat"><b>${db.sources.length}</b><span>fuentes importadas</span></div><div class="stat"><b>${db.liked.length}</b><span>guardados</span></div>`;
  $('#sources').innerHTML = db.sources.map(s => `<div class="src"><span class="badge">${esc(SERVICES[s.service] || s.service)}</span><div class="nm"><b>${safeHref(s.url) ? `<a href="${esc(s.url)}" target="_blank" rel="noopener" style="color:inherit">${esc(s.name)}</a>` : esc(s.name)}</b><span>${s.tracks} canciones · ${s.artists} artistas · ${new Date(s.date).toLocaleDateString()}</span></div><button class="icon-btn" data-src="${s.id}" title="Quitar esta fuente">${icon('x')}</button></div>`).join('') || '<p class="empty" style="padding:6px 0">Todavía no importas nada.</p>';
  $$('#sources [data-src]').forEach(b => b.onclick = () => removeSource(b.dataset.src));
  $('#artistChips').innerHTML = arts.slice(0, 300).map(e => `<span class="chip n"><a href="#descubrir" data-deep="${esc(e.name)}" title="Canciones de ${esc(e.name)} que no conoces">${esc(e.name)}</a> <em>${Math.round(e.n)}</em><button data-k="${esc(K(e.name))}" title="Olvidar">${icon('x')}</button></span>`).join('') || '<p class="empty" style="padding:6px 0">Sin artistas todavía.</p>';
  $$('#artistChips [data-deep]').forEach(a => a.onclick = e => { e.preventDefault(); deepSearch('más de ' + a.dataset.deep); });
  renderSpotify();
  $$('#artistChips [data-k]').forEach(b => b.onclick = () => { const e = db.artists[b.dataset.k]; if (e?.id) knownIds.delete(String(e.id)); delete db.artists[b.dataset.k]; persist(); renderGustos(); });
}
function deepSearch(q) { $('#prompt').value = q; location.hash = '#descubrir'; discover(); }
$('#deepTaste').onclick = () => deepSearch('canciones que no conozco de mis artistas');
function download(name, text, type = 'application/json') {
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
$('#exportData').onclick = () => { persist(); download(`descubre-respaldo-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(db)); };
$('#importData').onchange = async e => {
  const f = e.target.files[0]; if (!f) return;
  try {
    const d = JSON.parse(await f.text());
    if (!d || typeof d.artists !== 'object') throw new Error();
    Object.assign(db, d); knownTracks = new Set(db.tracks || []); knownIds = new Set((db.ids || []).map(String));
    persist(); renderAll(); toast('Respaldo cargado');
  } catch { toast('Ese archivo no es un respaldo válido'); }
  e.target.value = '';
};
$('#wipe').onclick = () => { if (!confirm('¿Borrar todos tus gustos, guardados y playlists de este navegador?')) return; localStorage.removeItem(DB_KEY); location.reload(); };

function refreshCounts() {
  const n = Object.keys(db.artists).length;
  $('#tasteCount').textContent = n ? `(${n})` : '(vacío)';
}

/* ---------- routing ---------- */
function route() {
  const h = location.hash.slice(1) || 'descubrir';
  const [view, id] = h.split('/');
  const name = ['descubrir', 'gustos', 'guardados', 'playlists', 'playlist'].includes(view) ? view : 'descubrir';
  $$('.view').forEach(v => v.hidden = v.dataset.view !== name);
  $$('[data-nav]').forEach(a => a.classList.toggle('on', a.dataset.nav === h || (a.dataset.nav === 'playlists' && name === 'playlist')));
  if (name === 'gustos') renderGustos();
  if (name === 'guardados') renderSaved();
  if (name === 'playlists') renderPlaylists();
  if (name === 'playlist') { $('#plSuggestBox').hidden = true; $('#plStatus').hidden = true; renderPlaylist(id); }
  closeMenu();
  if (name !== 'descubrir') scrollTo(0, 0);
}
function renderAll() { renderSide(); refreshCounts(); route(); }
addEventListener('hashchange', route);

const qp = new URLSearchParams(location.search);
if (qp.get('n')) nov.value = qp.get('n');
if (qp.get('f')) { const r = document.querySelector(`input[name=format][value="${qp.get('f')}"]`); if (r) r.checked = true; }
$('#useTaste').checked = db.prefs.useTaste !== false;
novLabel(); persist(); renderAll(); syncPlaying();
if (qp.get('q') && (location.hash === '' || location.hash === '#descubrir')) { $('#prompt').value = qp.get('q'); discover(); }
Spotify.handleRedirect().then(pid => {
  if (pid === null) return;
  toast('Spotify conectado');
  const p = db.playlists.find(x => x.id === pid);
  if (p) { location.hash = '#playlist/' + p.id; sendToSpotify(p); } else route();
}).catch(e => toast(e.message));
