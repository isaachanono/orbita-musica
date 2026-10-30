const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
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
const db = Object.assign({ artists: {}, tracks: [], ids: [], liked: [], sources: [], playlists: [], nope: [], prefs: { useTaste: true } }, store.get(DB_KEY, {}));
(function migrate() {
  const oldKnown = store.get('known', null), oldSaved = store.get('saved', null);
  if (oldKnown) { db.ids = [...new Set([...db.ids, ...oldKnown.map(String)])]; localStorage.removeItem('known'); }
  if (oldSaved) { oldSaved.forEach(s => { const m = String(s.link || '').match(/deezer\.com\/(?:[a-z]{2}\/)?track\/(\d+)/); db.liked.push({ id: m ? m[1] : 'legacy-' + uid(), title: s.title, artist: s.sub, link: s.link, legacy: !m }); }); localStorage.removeItem('saved'); }
})();
let knownTracks = new Set(db.tracks);
let knownIds = new Set(db.ids.map(String));
let mapT;
const persist = () => { db.tracks = [...knownTracks]; db.ids = [...knownIds]; try { store.set(DB_KEY, db); } catch { toast('No hay espacio para guardar más en este navegador'); } refreshCounts(); clearTimeout(mapT); mapT = setTimeout(() => MapView.refresh(), 300); };

// Artists dropped by removeSource keep their first-seen date and "via" only if a refresh re-adds them in the same tick.
const retired = new Map();
function addArtist(name, { id = null, src = 'manual', w = 1, via = null } = {}) {
  const k = K(name); if (!k) return null;
  const e = db.artists[k] || (db.artists[k] = { name, n: 0, srcs: [], ...retired.get(k) });
  e.n += w;
  e.by = e.by || {}; e.by[src] = (e.by[src] || 0) + w;
  if (id) { e.id = id; knownIds.add(String(id)); }
  if (!e.srcs.includes(src)) e.srcs.push(src);
  if (!e.first) e.first = Date.now();
  if (via && !e.via && K(via) !== k) e.via = via;
  return k;
}
function markKnownTrack(artist, title) {
  const tk = TK(artist, title); knownTracks.add(tk);
  db.manualTracks = [...new Set([...(db.manualTracks || []), tk])];
}
const isKnownArtist = a => a && (knownIds.has(String(a.id)) || !!db.artists[K(a.name)] || (db.nope || []).includes(K(a.name)));
const tasteList = () => Object.values(db.artists).sort((a, b) => b.n - a.n);

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
    const near = rel.map(a => ({ artist: a, why: `Cercano a ${seed.name}`, hop: 1, via: seed.name }));
    let far = [];
    if (novelty >= 35) {
      const via = shuffle(rel).slice(0, novelty >= 70 ? 5 : 3);
      const res = await pool(via, 5, v => dz(`/artist/${v.id}/related`, { limit: 15 }).then(x => (x.data || []).map(a => ({ artist: a, why: `A 2 pasos de ${seed.name} (vía ${v.name})`, hop: 2, via: seed.name }))));
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

const shazamArtists = () => { const ids = new Set(db.sources.filter(x => x.shazam).map(x => x.id)); return tasteList().filter(e => e.srcs.some(x => ids.has(x))); };

// Similar artists from open libraries: ListenBrainz (listening sessions) and Last.fm (only via the gateway node).
async function fromLibs(s) {
  const seeds = s.intent.artists.length ? s.intent.artists.slice(0, 2)
    : s.useTaste ? shuffle((s.intent.shazam ? shazamArtists() : tasteList()).slice(0, 20)).slice(0, 2).map(e => e.name) : [];
  const res = await pool(seeds, 2, async seed => {
    const names = new Map();
    const mb = await MB.artist(seed).catch(() => null);
    if (mb?.mbid) (await lbSimilar(mb.mbid).catch(() => [])).forEach(n => names.set(K(n), { n, src: 'ListenBrainz' }));
    (await lfmSimilar(seed).catch(() => [])).forEach(n => { if (!names.has(K(n))) names.set(K(n), { n, src: 'Last.fm' }); });
    const pick = shuffle([...names.values()].slice(s.novelty >= 60 ? 5 : 0)).filter(x => !db.artists[K(x.n)] && !s.exclude.has(K(x.n)) && K(x.n) !== K(seed)).slice(0, 8);
    const found = await pool(pick, 4, async x => { const a = (await dz('/search/artist', { q: x.n, limit: 1 })).data?.[0]; return a && K(a.name) === K(x.n) ? { a, src: x.src } : null; });
    return found.filter(Boolean).map(({ a, src }) => ({ artist: a, why: `${src === 'Last.fm' ? 'Similar a' : 'Se escucha junto a'} ${seed} · ${src}`, hop: 1, via: seed, scene: 'lib:' + seed, taste: !s.intent.artists.length }));
  });
  return res.filter(Boolean).flat();
}

// Taste: related artists of what you already listen to (imported playlists + likes).
async function fromTaste(s) {
  const top = (s.intent.shazam ? shazamArtists() : tasteList()).slice(0, 40);
  if (!top.length) return [];
  const verb = s.intent.shazam ? 'Porque shazameaste' : 'Porque escuchas';
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
    let out = rel.map(a => ({ artist: a, why: `${verb} ${e.name}`, hop: 1, taste: true, via: e.name }));
    if (s.novelty >= 60 && rel.length) {
      const v = shuffle(rel)[0];
      const far = (await dz(`/artist/${v.id}/related`, { limit: 15 })).data || [];
      far.forEach(a => { if (!s.tasteNear.has(a.id)) s.tasteNear.set(a.id, e.name); });
      out = out.concat(far.map(a => ({ artist: a, why: `Más allá de ${e.name} (vía ${v.name})`, hop: 2, taste: true, via: e.name })));
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
    const r = await fetch(readerUrl('https://everynoise.com/engenremap-' + enSlug(genre) + '.html'), { signal: ctl.signal });
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
    preview: t.preview, link: t.link || `https://www.deezer.com/track/${t.id}`, why: it.why, via: it.via };
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
  const [ac, sc, tc, ec, lc] = await Promise.all([
    s.intent.artists.length ? fromArtists(s.intent.artists, s.novelty, s).catch(() => []) : [],
    scenes.length ? fromScenes(scenes, s.intent).catch(() => []) : [],
    s.useTaste ? fromTaste(s).catch(() => []) : [],
    scenes.length ? fromEveryNoise(scenes, s).catch(() => []) : [],
    fromLibs(s).catch(() => []),
  ]);
  return [...ac, ...sc, ...tc, ...ec, ...lc];
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
  playerActs(t);
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
  syncActs();
  document.body.classList.toggle('is-playing', !!on);
  $$('[data-tid]').forEach(el => {
    const p = on && String(el.dataset.tid) === String(now.id);
    el.classList.toggle('playing', !!p);
    const b = el.querySelector('.pbtn, .th'); if (b) b.innerHTML = icon(p ? 'pause' : 'play');
  });
}
player.onplay = player.onpause = syncPlaying;
// Same actions as the cards, right from the 30 s preview. If the song is a card on screen, act through that card (so ♥ on an album opens "what to save" and the slot gets refilled).
const tileOf = t => t && [...$$('#results .tile')].find(el => el._track && sameTrack(el._track, t));
function playerActs(t) {
  const box = $('#pActs'), b = (k, ic, title) => `<button class="icon-btn" data-p="${k}" title="${title}">${icon(ic)}</button>`;
  box.innerHTML = b('like', 'heart', 'Me gusta') + b('known', 'known', 'Ya la conozco') + b('add', 'plus', 'Añadir a playlist') + b('swap', 'swap', 'Otra opción') + b('more', 'list', 'Ver más canciones y abrir en tu servicio');
  box.hidden = false;
  syncActs();
  box.onclick = async e => {
    const btn = e.target.closest('[data-p]'); if (!btn || !now) return;
    const k = btn.dataset.p, cur = now, el = tileOf(cur);
    if (k === 'add') { e.stopPropagation(); return openMenu(btn, [cur]); }
    if (k === 'more') return openDetail(cur.albumId ? { type: 'album', id: cur.albumId, via: cur.via, trackId: cur.id } : { type: 'artist', id: cur.artistId, via: cur.via, trackId: cur.id });
    if (el && k !== 'swap') { e.stopPropagation(); return el.querySelector(`.t-acts [data-a="${k}"]`).click(); }
    if (k === 'like') { likeMany([cur]); toast(`Guardada ♥ ${cur.title}`); return syncActs(); }
    if (k === 'known') { e.stopPropagation(); return askKnown(btn, { name: cur.artist, id: cur.artistId, title: cur.title, via: cur.via }); }
    if (k === 'swap' && el) { const n = await replaceTile(el); if (n?._track) playTrack(n._track, currentTracks()); }
  };
}
function syncActs() {
  const box = $('#pActs'); if (box.hidden || !now) return;
  const liked = db.liked.some(x => sameTrack(x, now));
  box.querySelector('[data-p=like]').classList.toggle('on', liked);
  box.querySelector('[data-p=like]').title = liked ? 'Ya está en Guardados' : 'Me gusta';
  box.querySelector('[data-p=swap]').hidden = !tileOf(now);
}
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
  placeMenu(anchor, Math.min(320, 80 + pls.length * 36));
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
function placeMenu(anchor, h, w = 230) {
  const m = $('#menu'), r = anchor.getBoundingClientRect();
  m.hidden = false;
  m.style.left = Math.max(8, Math.min(innerWidth - w - 8, r.left - w / 2)) + 'px';
  m.style.top = (r.bottom + h > innerHeight ? Math.max(8, r.top - h) : r.bottom + 4) + 'px';
}
// "Ya lo conozco": ask whether they like the artist; yes → taste profile + map, no → never recommended again.
function askKnown(anchor, { name, id, title, via }, done) {
  const m = $('#menu');
  m.innerHTML = `<div class="mh q">Ya conoces a ${esc(name)}. ¿Te gusta?</div><button data-k="yes">${icon('heart')}Sí, agrégalo a mis gustos y al mapa</button><button data-k="meh">${icon('known')}Lo conozco, pero no es para mí</button>`;
  placeMenu(anchor, 130, 270);
  m.onclick = e => {
    const b = e.target.closest('[data-k]'); if (!b) return;
    const k = K(name);
    if (b.dataset.k === 'yes') { db.nope = (db.nope || []).filter(x => x !== k); addArtist(name, { id, src: 'liked', w: 3, via }); toast(`${name} quedó en tus gustos y en tu mapa`); }
    else { db.nope = [...new Set([...(db.nope || []), k])]; if (id) knownIds.add(String(id)); toast(`Anotado: no te recomiendo más a ${name}`); }
    if (title) markKnownTrack(name, title);
    persist(); closeMenu(); done?.();
  };
  setTimeout(() => document.addEventListener('click', closeMenuOutside), 0);
}
function closeMenuOutside(e) { if (!$('#menu').contains(e.target)) closeMenu(); }
function closeMenu() { $('#menu').hidden = true; document.removeEventListener('click', closeMenuOutside); }

/* ---------- discover view ---------- */
function tile(it, fmt) {
  const t = toTrack(it), a = it.artist;
  let cover = t.coverBig, title = t.title, sub = `<a href="https://www.deezer.com/artist/${a.id}" class="go" data-open="artist" title="Ver artista">${esc(a.name)}</a>`, q = `${a.name} ${t.title}`;
  if (fmt === 'artist') { cover = a.picture_big || a.picture_medium || `${API}/artist/${a.id}/image?size=big`; title = a.name; sub = `Escucha: ${esc(t.title)}`; q = a.name; }
  if (fmt === 'album') { title = t.album || t.title; q = `${a.name} ${t.album || ''}`; }
  const el = document.createElement('article');
  el.className = `tile ${fmt}`; el.dataset.tid = t.id;
  el.innerHTML = `<div class="art" style="background-image:url('${cssUrl(cover)}')"><button class="pbtn" title="Preview 30 s">${icon('play')}</button></div>
  <div class="meta"><div class="t-title go" data-open="${fmt === 'artist' ? 'artist' : 'album'}" title="Ver más de ${esc(title)}">${esc(title)}</div><div class="t-sub">${sub}</div><div class="why">${esc(it.why)}</div><div class="tags" data-artist="${esc(a.name)}"></div>
  <div class="t-acts">
    <button class="icon-btn" data-a="like" title="Guardar (te doy otra)">${icon('heart')}</button>
    <button class="icon-btn" data-a="known" title="Ya la conozco (te doy otra)">${icon('known')}</button>
    <button class="icon-btn" data-a="swap" title="Otra opción">${icon('swap')}</button>
    <button class="icon-btn" data-a="add" title="Añadir a playlist">${icon('plus')}</button>
    <button class="icon-btn" data-a="more" title="Ver más canciones y abrir en tu servicio">${icon('list')}</button>
    <span class="links"><a href="https://open.spotify.com/search/${encodeURIComponent(q)}" target="_blank" rel="noopener">Spotify</a><a href="https://music.apple.com/us/search?term=${encodeURIComponent(q)}" target="_blank" rel="noopener">Apple</a></span>
  </div></div>`;
  const play = () => playTrack(t, currentTracks());
  el.querySelector('.art').onclick = play;
  el.querySelector('.pbtn').onclick = e => { e.stopPropagation(); play(); };
  const detail = (type, extra = {}) => openDetail({ type, id: type === 'album' ? t.albumId : a.id, via: it.via, trackId: t.id, ...extra });
  el.querySelectorAll('[data-open]').forEach(x => x.onclick = e => { e.preventDefault(); detail(x.dataset.open); });
  el.querySelector('.t-acts').onclick = e => {
    const b = e.target.closest('[data-a]'); if (!b) return;
    const act = b.dataset.a;
    if (act === 'add') { e.stopPropagation(); openMenu(b, [t]); return; }
    if (act === 'more') return detail(fmt === 'artist' ? 'artist' : 'album');
    if (act === 'like' && fmt !== 'track') return detail(fmt, { pick: true, onSaved: () => replaceTile(el) });
    if (act === 'known') { e.stopPropagation(); askKnown(b, { name: a.name, id: a.id, title: t.title, via: it.via }, () => replaceTile(el)); return; }
    if (act === 'like') { like(t); toast('Guardada ♥ — aquí va otra opción'); }
    replaceTile(el);
  };
  el._track = t;
  return el;
}
const currentTracks = () => $$('#results [data-tid]').map(el => el._track).filter(Boolean);

const flag = cc => /^[A-Z]{2}$/.test(cc || '') ? String.fromCodePoint(...[...cc].map(c => 0x1f1a5 + c.charCodeAt(0))) : '';
async function enrichTiles() {
  for (const el of $$('#results .tags:not([data-done])')) {
    el.dataset.done = '1';
    const info = await MB.artist(el.dataset.artist).catch(() => null);
    if (!info || !el.isConnected) continue;
    el.innerHTML = [...info.genres.slice(0, 2).map(g => `<button type="button" class="tag" data-g="${esc(g)}" title="Buscar ${esc(g)}">${esc(g)}</button>`),
      info.country ? `<span class="tag mut" title="${esc(info.area || info.country)}">${flag(info.country)} ${esc(info.country)}</span>` : '',
      info.begin ? `<span class="tag mut">desde ${esc(info.begin)}</span>` : ''].join('');
    el.querySelectorAll('[data-g]').forEach(b => b.onclick = () => deepSearch(b.dataset.g));
  }
}
async function replaceTile(el) {
  const s = session; if (!s) return;
  el.classList.add('out');
  el.style.pointerEvents = 'none';
  const [nx] = await nextItems(s, 1);
  if (s !== session) return;
  if (nx) { const n = tile(nx, s.fmt); el.replaceWith(n); syncPlaying(); enrichTiles(); return n; }
  else { el.remove(); toast('No encontré más opciones con ese prompt; prueba otro'); }
}

function likeMany(tracks, via = null) {
  const arts = new Map();
  for (const t of tracks) {
    if (!db.liked.some(x => sameTrack(x, t))) db.liked.unshift({ ...t, added: Date.now() });
    knownTracks.add(TK(t.artist, t.title));
    arts.set(K(t.artist), t);
  }
  arts.forEach((t, k) => { db.nope = (db.nope || []).filter(x => x !== k); addArtist(t.artist, { id: t.artistId, src: 'liked', w: 3, via: t.via || via }); });
  persist();
}
const like = t => likeMany([t]);

/* ---------- detail sheet: an artist or album with more previews, links to your service, and pick what to save ---------- */
const dlg = $('#detail');
let dStack = [];
const dzTrack = (x, al, ar) => {
  const a = x.artist || ar, b = x.album || al;
  return { id: x.id, title: x.title_short || x.title, artist: a.name, artistId: a.id, album: b?.title, albumId: b?.id, cover: b?.cover_medium, coverBig: b?.cover_big,
    preview: x.preview, link: x.link || `https://www.deezer.com/track/${x.id}` };
};
function openIn(kind, name, album, dzUrl) {
  const q = encodeURIComponent(kind === 'album' ? `${name} ${album}` : name), a = (h, l, x = '') => `<a href="${esc(h)}" target="_blank" rel="noopener"${x}>${l}</a>`;
  return `<div class="d-open">Abrir en: ${a(`https://open.spotify.com/search/${q}/${kind === 'album' ? 'albums' : 'artists'}`, 'Spotify', ' data-sp')}${a(`https://music.apple.com/us/search?term=${q}`, 'Apple Music')}${a(`https://music.youtube.com/search?q=${q}`, 'YouTube Music')}${a(`https://music.amazon.com/search/${q}`, 'Amazon Music')}${safeHref(dzUrl) ? a(dzUrl, 'Deezer') : ''}</div>`;
}
async function openDetail(o, push = true) {
  if (push) dStack.push(o);
  dlg.className = 'dlg detail ' + o.type;
  const box = $('#detailBody');
  box.innerHTML = `<button class="icon-btn x" data-x title="Cerrar">${icon('x')}</button><div class="d-load">Cargando…</div>`;
  box.querySelector('[data-x]').onclick = closeDetail;
  if (!dlg.open) dlg.showModal();
  try { await (o.type === 'album' ? albumDetail(o) : artistDetail(o)); }
  catch { if (dStack.at(-1) === o) box.querySelector('.d-load').textContent = 'No pude cargar esto desde Deezer. Intenta de nuevo.'; }
}
function closeDetail() { dStack = []; if (dlg.open) dlg.close(); }
dlg.addEventListener('close', () => { dStack = []; });
dlg.addEventListener('click', e => { if (e.target === dlg) closeDetail(); });
async function artistDetail(o) {
  const [a, top, als] = await Promise.all([dz(`/artist/${o.id}`), dz(`/artist/${o.id}/top`, { limit: 15 }), dz(`/artist/${o.id}/albums`, { limit: 40 }).catch(() => ({ data: [] }))]);
  if (dStack.at(-1) !== o) return;
  const seen = new Set(), albums = (als.data || []).sort((x, y) => (y.record_type === 'album') - (x.record_type === 'album') || String(y.release_date).localeCompare(String(x.release_date)))
    .filter(x => { const k = K(x.title.replace(/\s*[([].*$/, '')); return !seen.has(k) && seen.add(k); }).slice(0, 12);
  renderDetail(o, { img: a.picture_big || a.picture_medium, kind: 'Artista', title: a.name, artist: a, albums,
    sub: `${(a.nb_fan || 0).toLocaleString('es-MX')} fans en Deezer${a.nb_album ? ` · ${a.nb_album} lanzamientos` : ''}`,
    open: openIn('artist', a.name, '', a.link || `https://www.deezer.com/artist/${a.id}`), tracks: (top.data || []).filter(x => x.readable !== false).map(x => dzTrack(x)) });
}
async function albumDetail(o) {
  const al = await dz(`/album/${o.id}`);
  let rows = al.tracks?.data || [];
  while (rows.length < Math.min(al.nb_tracks || 0, 500)) {
    const r = await dz(`/album/${o.id}/tracks`, { index: rows.length, limit: 100 }).catch(() => null);
    if (!r?.data?.length) break;
    rows = rows.concat(r.data);
  }
  if (dStack.at(-1) !== o) return;
  renderDetail(o, { img: al.cover_big || al.cover_medium, kind: { single: 'Sencillo', ep: 'EP', compile: 'Compilación' }[al.record_type] || 'Álbum', title: al.title, artist: al.artist,
    sub: `<a href="#" data-artist="${esc(al.artist.id)}">${esc(al.artist.name)}</a>${al.release_date ? ` · ${esc(al.release_date.slice(0, 4))}` : ''} · ${al.nb_tracks} canciones`,
    facts: (al.genres?.data || []).map(g => `<button type="button" class="chip g" data-g="${esc(g.name)}">${esc(g.name)}</button>`).join(''),
    open: openIn('album', al.artist.name, al.title, al.link), tracks: [...new Map(rows.map(x => [x.id, x])).values()].map(x => dzTrack(x, al, al.artist)) });
}
function renderDetail(o, d) {
  const box = $('#detailBody'), name = d.artist.name, known = !!db.artists[K(name)];
  const isNew = t => !knownTracks.has(TK(t.artist, t.title));
  box.innerHTML = `${dStack.length > 1 ? `<button class="icon-btn back" data-back title="Atrás">←</button>` : ''}<button class="icon-btn x" data-x title="Cerrar">${icon('x')}</button>
    <div class="d-head"><div class="d-img" style="background-image:url('${cssUrl(d.img)}')"></div><div><div class="d-kind">${d.kind}${known ? ' · ya está en tus gustos' : ''}</div><h3>${esc(d.title)}</h3><div class="d-sub">${d.sub}</div><div class="facts" data-facts>${d.facts || ''}</div></div></div>
    ${d.open}
    ${o.pick ? `<div class="d-ask">${o.type === 'album' ? 'Lo guardo completo. Desmarca las canciones que no quieras.' : `Agrego a ${esc(name)} a tus gustos y a tu mapa, junto con las canciones que marques.`}</div>` : ''}
    <h4>${o.type === 'album' ? 'Canciones' : 'Canciones más escuchadas'}</h4><div class="d-tracks"></div>
    ${d.albums?.length ? `<h4>Álbumes</h4><div class="d-albums">${d.albums.map(x => `<button type="button" data-al="${esc(x.id)}"><i style="background-image:url('${cssUrl(x.cover_medium)}')"></i><b title="${esc(x.title)}">${esc(x.title)}</b><small>${esc(String(x.release_date || '').slice(0, 4))}</small></button>`).join('')}</div>` : ''}
    <div class="d-foot"><label class="chk"><input type="checkbox" data-all> Todas</label><button class="btn" data-pl>${icon('plus')}Añadir a playlist</button><button class="btn primary" data-save></button></div>`;
  const list = d.tracks, rows = [];
  let preset = o.pick ? (o.type === 'album' ? list.filter(isNew) : [list.find(t => String(t.id) === String(o.trackId)), ...list.filter(isNew)].filter(Boolean).slice(0, 5)) : [];
  preset = new Set(preset.map(t => t.id));
  list.forEach((t, i) => {
    if (!isNew(t)) t.why = 'ya la conoces';
    const r = trackRow(t, i, list, [{ a: 'heart', t: 'Guardar esta', fn: b => { likeMany([t], o.via); b.disabled = true; toast(`Guardada: ${t.title}`); } }]);
    const cb = document.createElement('input'); cb.type = 'checkbox'; cb.checked = preset.has(t.id); cb.title = 'Marcar'; cb.onchange = upd;
    r.querySelector('.n').replaceChildren(cb);
    rows.push({ t, cb }); box.querySelector('.d-tracks').appendChild(r);
  });
  if (!list.length) box.querySelector('.d-tracks').innerHTML = '<p class="empty">Deezer no tiene canciones de esto.</p>';
  const all = box.querySelector('[data-all]'), save = box.querySelector('[data-save]');
  const picked = () => rows.filter(r => r.cb.checked).map(r => r.t);
  function upd() {
    const n = picked().length, songs = `${n} ${n === 1 ? 'canción' : 'canciones'}`;
    all.checked = n > 0 && n === rows.length;
    save.textContent = o.type === 'artist' ? (n ? `Guardar artista + ${songs}` : known ? 'Guardar' : 'Agregar artista a mis gustos') : !n ? 'Marca canciones para guardar' : n === rows.length ? `Guardar álbum completo (${n})` : `Guardar ${songs}`;
    save.disabled = o.type === 'album' ? !n : known && !n;
  }
  all.onchange = () => { rows.forEach(r => r.cb.checked = all.checked); upd(); };
  upd();
  save.onclick = () => {
    const sel = picked();
    likeMany(sel, o.via);
    if (o.type === 'artist') { db.nope = (db.nope || []).filter(x => x !== K(name)); addArtist(name, { id: d.artist.id, src: 'liked', w: 3, via: o.via }); persist(); }
    toast(o.type === 'artist' ? `${name} quedó en tus gustos y en tu mapa${sel.length ? ` con ${sel.length} ${sel.length === 1 ? 'canción guardada' : 'canciones guardadas'}` : ''}` : `Guardé ${sel.length} ${sel.length === 1 ? 'canción' : 'canciones'} de «${d.title}»`);
    const done = o.onSaved; closeDetail(); done?.();
  };
  box.querySelector('[data-pl]').onclick = e => { e.stopPropagation(); const sel = picked(); sel.length ? openMenu(e.currentTarget, sel) : toast('Marca al menos una canción'); };
  box.querySelector('[data-x]').onclick = closeDetail;
  box.querySelector('[data-back]')?.addEventListener('click', () => { dStack.pop(); openDetail(dStack.at(-1), false); });
  box.querySelectorAll('[data-al]').forEach(b => b.onclick = () => openDetail({ type: 'album', id: b.dataset.al, via: o.via }));
  box.querySelectorAll('[data-artist]').forEach(b => b.onclick = e => { e.preventDefault(); openDetail({ type: 'artist', id: b.dataset.artist, via: o.via }); });
  const facts = box.querySelector('[data-facts]');
  const bindG = () => facts.querySelectorAll('[data-g]').forEach(b => b.onclick = () => { closeDetail(); deepSearch(b.dataset.g); });
  bindG();
  if (o.type === 'artist') MB.artist(name).then(info => {
    if (!info || dStack.at(-1) !== o) return;
    facts.innerHTML = [...info.genres.slice(0, 4).map(g => `<button type="button" class="chip g" data-g="${esc(g)}">${esc(g)}</button>`), info.country ? `<span class="chip">${flag(info.country)} ${esc(info.area || info.country)}</span>` : '', info.begin ? `<span class="chip">desde ${esc(info.begin)}</span>` : ''].join('');
    bindG();
  }).catch(() => {});
  if (Spotify.connected()) Spotify.findUrl(o.type, name, o.type === 'album' ? d.title : '').then(u => { const l = box.querySelector('[data-sp]'); if (u && l && safeHref(u)) l.href = u; }).catch(() => {});
  syncPlaying();
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
    intent.shazam ? `<span class="chip g">desde tus Shazams</span>` : s.useTaste ? `<span class="chip g">${icon('user')} según tus gustos${intent.fromProfile ? ' y tus géneros' : ''}</span>` : '',
    `<span class="chip">→ ${fmtName}</span>`,
  ];
  $('#intent').innerHTML = chips.join(''); $('#intent').hidden = false;
}

async function discover() {
  const prompt = $('#prompt').value.trim();
  const useTaste = $('#useTaste').checked && tasteList().length > 0;
  const intent = parseIntent(prompt);
  if (intent.deepTaste && !tasteList().length) { toast('Primero importa tus playlists en Mis gustos'); return; }
  if (intent.shazam && !shazamArtists().length) { toast('Primero importa tus Shazams en Mis gustos'); location.hash = '#gustos'; return; }
  if (!prompt && useTaste && db.prefs.genres?.length) { intent.genres = shuffle(db.prefs.genres.slice(0, 8).map(x => x.g)).slice(0, 2); intent.fromProfile = true; }
  if (!prompt && !useTaste && !intent.shazam) { $('#prompt').focus(); toast(tasteList().length ? 'Escribe un prompt o activa “Usar mis gustos”' : 'Escribe un prompt (o importa tus playlists en Mis gustos)'); return; }
  const novelty = +$('#novelty').value;
  const chosen = document.querySelector('input[name=format]:checked').value;
  let fmt = chosen === 'auto' ? (intent.format || 'track') : chosen;
  const deep = intent.deep.length || intent.deepTaste;
  if (deep && fmt === 'artist') fmt = 'track';
  if (prompt && !deep && !intent.shazam && !intent.genres.length && !intent.moods.length && !intent.artists.length && !intent.keywords.length) intent.keywords = [prompt];
  history.replaceState(null, '', '?' + new URLSearchParams({ q: prompt, f: chosen, n: novelty }) + '#descubrir');
  const s = session = newSession({ intent, fmt, novelty, useTaste: (useTaste || intent.shazam) && !deep });
  const want = fmt === 'playlist' ? 25 : 9;
  Telemetry.ev('buscar'); $('#go').disabled = true; $('#actions').hidden = true; $('#legend').hidden = true; $('#intent').hidden = true;
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
    syncPlaying(); enrichTiles();
  } catch (e) {
    console.error(e); $('#results').innerHTML = ''; status('#status', 'Algo falló consultando el catálogo (' + e.message + '). Intenta de nuevo.');
  } finally { if (s === session) { $('#go').disabled = false; renderExamples(); } }
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
  items.forEach(i => $('#results').appendChild(tile(i, s.fmt))); syncPlaying(); enrichTiles();
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
function renderExamples() {
  const fmt = document.querySelector('input[name=format]:checked').value;
  const list = suggestPrompts(fmt, { artists: tasteList().slice(0, 30).map(e => e.name), genres: (db.prefs.genres || []).slice(0, 12).map(x => x.g), shazam: db.sources.some(x => x.shazam) });
  $('#examples').innerHTML = list.map(x => `<button type="button">${esc(x)}</button>`).join('');
  $('#examples').querySelectorAll('button').forEach(b => b.onclick = () => { $('#prompt').value = b.textContent; discover(); });
  $('#prompt').placeholder = 'ej. ' + list[0];
}
$$('input[name=format]').forEach(r => r.addEventListener('change', renderExamples));

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
    Telemetry.ev('exportar-spotify');
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
  $('#spState').textContent = !Spotify.clientId() ? 'Sin configurar' : on && !Spotify.canRead() ? 'Conectado (vuelve a conectar para leer playlists)' : on ? 'Conectado ✓' : 'Configurado, sin conectar';
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
function registerImport(res, url, extra = {}) {
  const id = uid();
  const keys = new Set(), tks = new Set();
  let n = 0;
  for (const t of res.tracks) {
    t.artists.forEach((a, j) => { const k = addArtist(a, { id: t.ids?.[j], src: id, w: t.w || 1 }); if (k) keys.add(k); });
    if (t.title && t.artists[0]) { const tk = TK(t.artists[0], t.title); knownTracks.add(tk); tks.add(tk); n++; }
  }
  db.sources.unshift({ id, url, service: res.service, name: res.name, tracks: n, artists: keys.size, keys: [...tks], date: Date.now(), ...(res.full ? { full: true } : {}), ...extra });
  persist();
  return { n, a: keys.size };
}
// A public page only shows the first ~100 songs; don't replace a complete import (Spotify API or file) with that preview.
// Sources saved before `full` existed count as complete if they have more songs than any preview.
const keepsFullerImport = (old, res) => !!(old && (old.full || old.tracks > EMBED_CAP) && res.truncated && old.tracks > res.tracks.filter(t => t.title).length);
const fullerMsg = old => `Ya tienes «${old.name}» completa (${old.tracks} canciones); su página pública solo muestra las primeras. Para actualizarla usa «Elegir de mis playlists de Spotify» o sube el archivo.`;
$('#importForm').onsubmit = async e => {
  e.preventDefault();
  const url = $('#importUrl').value.trim(); if (!url) return;
  if (spotifyUserId(url)) { $('#importUrl').value = ''; $('#profUrl').value = url; $('#profPanel').scrollIntoView({ behavior: 'smooth' }); return importProfile(url); }
  const btn = $('#importBtn'); btn.disabled = true;
  status('#importStatus', 'Leyendo el link… (puede tardar unos segundos)');
  try {
    const res = await importLink(url);
    if (!res.tracks.length) throw new Error('No encontré canciones en ese link.');
    const old = db.sources.find(s => s.url === url && !s.shazam);
    if (keepsFullerImport(old, res)) throw new Error(fullerMsg(old));
    if (old) removeSource(old.id);
    const r = registerImport(res, url);
    Telemetry.ev('importar-' + res.service, res.truncated ? 'incompleta' : '');
    const how = res.service === 'spotify' ? 'Usa «Elegir de mis playlists de Spotify» para leerla completa.' : 'Para leerla completa, exporta la playlist a CSV y usa «Subir archivo».';
    status('#importStatus', `Listo: «${res.name}» — ${r.n} canciones de ${r.a} artistas registradas.${res.truncated ? ` Ojo: ${SERVICES[res.service] || res.service} solo muestra las primeras canciones en su página pública; si tu playlist es más larga, faltan algunas. ${how}` : res.full ? ' (playlist completa)' : ''}`);
    $('#importUrl').value = '';
    renderGustos();
  } catch (err) { status('#importStatus', err.message || 'No pude importar ese link'); }
  finally { btn.disabled = false; }
};
$('#fileImport').onchange = async e => {
  const f = e.target.files[0]; e.target.value = '';
  if (!f) return;
  status('#importStatus', `Leyendo «${f.name}»…`);
  try {
    const tracks = parseFileTracks(await readFileText(f));
    if (!tracks.length) throw new Error('No encontré columnas de canción y artista en ese archivo.');
    const r = registerImport({ service: 'file', name: f.name.replace(/\.[^.]+$/, ''), tracks, full: true }, '');
    Telemetry.ev('importar-archivo');
    status('#importStatus', `Listo: «${f.name}» — ${r.n} canciones de ${r.a} artistas registradas.`);
    renderGustos();
  } catch (err) { status('#importStatus', err.message || 'No pude leer ese archivo'); }
};
async function pickSpotify() {
  if (!Spotify.clientId()) { $('#spPanel').scrollIntoView({ behavior: 'smooth' }); return toast('Primero configura Spotify en «Conectar Spotify» (abajo)'); }
  if (!Spotify.canRead()) return Spotify.connect('#pick').catch(e => toast(e.message));
  const box = $('#spLists'); box.hidden = false; box.innerHTML = '<p class="empty">Leyendo tus playlists de Spotify…</p>';
  try {
    const lists = await Spotify.myPlaylists();
    box.innerHTML = lists.length ? '' : '<p class="empty">No encontré playlists en tu cuenta.</p>';
    lists.forEach(p => {
      const url = 'https://open.spotify.com/playlist/' + p.id;
      const row = document.createElement('div'); row.className = 'src';
      row.innerHTML = `<span class="badge">Spotify</span><div class="nm"><b>${esc(p.name)}</b><span>${p.n} canciones${p.owner ? ' · ' + esc(p.owner) : ''}</span></div><button class="btn sm" type="button">${db.sources.some(s => s.url === url) ? 'Actualizar' : 'Importar'}</button>`;
      const btn = row.querySelector('button');
      btn.onclick = async () => {
        btn.disabled = true; btn.textContent = 'Leyendo…';
        try {
          const res = await Spotify.readPlaylist('playlist', p.id);
          const old = db.sources.find(s => s.url === url); if (old) removeSource(old.id);
          const r = registerImport({ service: 'spotify', name: res.name || p.name, tracks: res.tracks, full: true }, url);
          Telemetry.ev('importar-spotify-api');
          btn.textContent = `✓ ${r.n} canciones`; renderGustos();
        } catch (err) { btn.disabled = false; btn.textContent = 'Reintentar'; toast(err.message === 'auth' ? 'Vuelve a conectar Spotify' : err.message); }
      };
      box.appendChild(row);
    });
  } catch (err) { box.innerHTML = `<p class="empty">${esc(err.message === 'auth' ? 'Vuelve a conectar Spotify.' : 'No pude leer tus playlists: ' + err.message)}</p>`; }
}
$('#spPick').onclick = pickSpotify;
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
    if (e.by?.[id]) { e.n = Math.max(0, e.n - e.by[id]); delete e.by[id]; }
    if (!e.srcs.length) { retired.set(k, { first: e.first, ...(e.via ? { via: e.via } : {}) }); delete db.artists[k]; if (e.id) knownIds.delete(String(e.id)); }
  }
  queueMicrotask(() => retired.clear());
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
  $('#sources').innerHTML = db.sources.map(s => `<div class="src"><span class="badge">${esc(s.shazam ? 'Shazam' : SERVICES[s.service] || s.service)}</span><div class="nm"><b>${safeHref(s.url) ? `<a href="${esc(s.url)}" target="_blank" rel="noopener" style="color:inherit">${esc(s.name)}</a>` : esc(s.name)}</b><span>${s.tracks} canciones · ${s.artists} artistas · ${new Date(s.date).toLocaleDateString()}</span></div>${safeHref(s.url) ? `<button class="icon-btn" data-re="${s.id}" title="Actualizar (volver a leer el link)">${icon('swap')}</button>` : ''}<button class="icon-btn" data-src="${s.id}" title="Quitar esta fuente">${icon('x')}</button></div>`).join('') || '<p class="empty" style="padding:6px 0">Todavía no importas nada.</p>';
  $$('#sources [data-src]').forEach(b => b.onclick = () => removeSource(b.dataset.src));
  $$('#sources [data-re]').forEach(b => b.onclick = () => refreshSource(b.dataset.re, b));
  renderGenres();
  $('#shazamUrl').value = db.prefs.shazamUrl || '';
  if (!$('#profUrl').value) $('#profUrl').value = db.prefs.spProfile || '';
  $('#profBtn').textContent = db.prefs.spProfile ? 'Actualizar perfil' : 'Leer mi perfil';
  $('#shazamBtn').textContent = db.prefs.shazamUrl ? 'Actualizar mis Shazams' : 'Importar mis Shazams';
  $('#artistChips').innerHTML = arts.slice(0, 300).map(e => `<span class="chip n"><a href="#descubrir" data-deep="${esc(e.name)}" title="Canciones de ${esc(e.name)} que no conoces">${esc(e.name)}</a> <em>${Math.round(e.n)}</em><button data-k="${esc(K(e.name))}" title="Olvidar">${icon('x')}</button></span>`).join('') || '<p class="empty" style="padding:6px 0">Sin artistas todavía.</p>';
  $$('#artistChips [data-deep]').forEach(a => a.onclick = e => { e.preventDefault(); deepSearch('más de ' + a.dataset.deep); });
  renderSpotify();
  $$('#artistChips [data-k]').forEach(b => b.onclick = () => { const e = db.artists[b.dataset.k]; if (e?.id) knownIds.delete(String(e.id)); delete db.artists[b.dataset.k]; persist(); renderGustos(); });
}
async function refreshSource(id, btn) {
  const src = db.sources.find(x => x.id === id); if (!src?.url) return;
  if (src.shazam) return importShazam(src.url);
  if (spotifyUserId(src.url)) return importProfile(db.prefs.spProfile || src.url);
  btn.disabled = true; toast('Actualizando «' + src.name + '»…');
  try {
    const res = await importLink(src.url);
    if (!res.tracks.length) throw new Error('No encontré canciones en ese link.');
    if (keepsFullerImport(src, res)) throw new Error(fullerMsg(src));
    removeSource(id); const r = registerImport(res, src.url); renderGustos(); toast(`Actualizada: ${r.n} canciones`);
  } catch (e) { btn.disabled = false; toast(e.message || 'No pude actualizarla'); }
}

/* Public Spotify profile: recently played artists weigh more; public playlists are listed to import one by one or all. */
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function importSpotifyPlaylist(id, name, profileId) {
  const url = 'https://open.spotify.com/playlist/' + id;
  const res = await importSpotify('playlist', id);
  const old = db.sources.find(s => s.url === url);
  if (keepsFullerImport(old, res)) return { n: old.tracks, kept: true };
  if (old) removeSource(old.id);
  return { ...registerImport({ ...res, name: res.name || name }, url, profileId ? { profile: profileId } : {}), truncated: res.truncated };
}
async function importProfile(input) {
  const id = spotifyUserId(input);
  if (!id) return status('#profStatus', 'Pega el link de tu perfil: open.spotify.com/user/…');
  const btn = $('#profBtn'), box = $('#profLists');
  btn.disabled = true; box.hidden = true;
  status('#profStatus', 'Leyendo tu perfil de Spotify… (unos segundos)');
  try {
    const p = await readSpotifyProfile(id);
    db.prefs.spProfile = p.url;
    const rpUrl = p.url + '/recently-played-artists';
    const old = db.sources.find(s => s.url === rpUrl); if (old) removeSource(old.id);
    if (p.artists.length) registerImport({ service: 'spotify', name: `Artistas recientes · ${p.name}`, tracks: p.artists.map(name => ({ title: '', artists: [name], w: 3 })) }, rpUrl, { profile: p.id });
    else persist();
    Telemetry.ev('importar-perfil-spotify', p.artists.length ? 'con-recientes' : 'sin-recientes');
    status('#profStatus', `«${p.name}»: ${p.artists.length ? `registré ${p.artists.length} artistas que escuchas últimamente` : 'tu perfil no muestra artistas recientes (actívalo en Spotify → Configuración → Social → «Artistas escuchados recientemente»)'} y encontré ${p.playlists.length} playlists públicas${p.total > p.playlists.length ? ` de ${p.total} (Spotify solo muestra las primeras)` : ''}. Elige cuáles importar.`);
    renderProfileLists(p);
    renderGustos();
  } catch (e) { status('#profStatus', e.message || 'No pude leer ese perfil'); }
  finally { btn.disabled = false; }
}
function renderProfileLists(p) {
  const box = $('#profLists'); box.hidden = false; box.innerHTML = '';
  if (!p.playlists.length) { box.innerHTML = '<p class="empty">No tiene playlists públicas. En Spotify, en cada playlist: ··· → Agregar al perfil.</p>'; return; }
  const head = document.createElement('div'); head.className = 'actions left';
  head.innerHTML = `<button class="btn primary sm" type="button">Importar todas (${p.playlists.length})</button>`;
  box.appendChild(head);
  const rows = p.playlists.map(pl => {
    const url = 'https://open.spotify.com/playlist/' + pl.id;
    const row = document.createElement('div'); row.className = 'src';
    row.innerHTML = `<span class="badge">Spotify</span><div class="nm"><b><a href="${esc(url)}" target="_blank" rel="noopener" style="color:inherit">${esc(pl.name)}</a></b><span>${pl.owner ? 'de ' + esc(pl.owner) : 'playlist pública'}</span></div><button class="btn sm" type="button">${db.sources.some(s => s.url === url) ? 'Actualizar' : 'Importar'}</button>`;
    const b = row.querySelector('button');
    const run = async () => {
      b.disabled = true; b.textContent = 'Leyendo…';
      try { const r = await importSpotifyPlaylist(pl.id, pl.name, p.id); b.textContent = `✓ ${r.n} ${r.n === 1 ? 'canción' : 'canciones'}${r.kept ? ' (ya la tenías completa)' : r.truncated ? ' (primeras 100)' : ''}`; return 'ok'; }
      catch (err) {
        // Empty, unavailable or region-locked playlists won't work on retry.
        if (/no regresó canciones/.test(err.message)) { b.textContent = 'Sin canciones visibles'; return 'empty'; }
        b.disabled = false; b.textContent = 'Reintentar'; console.warn(pl.name, err); return 'fail';
      }
    };
    b.onclick = async () => { await run(); renderGustos(); };
    box.appendChild(row);
    return { url, b, run };
  });
  const all = head.querySelector('button');
  all.onclick = async () => {
    all.disabled = true;
    const todo = rows.filter(r => !db.sources.some(s => s.url === r.url));
    let ok = 0, empty = 0, fail = 0;
    const failed = [];
    for (const [i, r] of todo.entries()) {
      all.textContent = `Importando ${i + 1} de ${todo.length}…`;
      const st = await r.run();
      st === 'ok' ? ok++ : st === 'empty' ? empty++ : failed.push(r);
      if (i < todo.length - 1) await sleep(1500);
    }
    // The free reader sometimes answers 429/503 under load; one slower retry recovers most of those.
    for (const [i, r] of failed.entries()) {
      all.textContent = `Reintentando ${i + 1} de ${failed.length}…`;
      await sleep(4000);
      const st = await r.run();
      st === 'ok' ? ok++ : st === 'empty' ? empty++ : fail++;
    }
    renderGustos();
    all.textContent = `✓ ${ok} importadas${empty ? ` · ${empty} sin canciones` : ''}${fail ? ` · ${fail} fallaron (reintenta)` : ''}`;
    all.disabled = !fail;
    Telemetry.ev('importar-perfil-playlists', String(ok));
  };
}
$('#profForm').onsubmit = e => { e.preventDefault(); importProfile($('#profUrl').value || db.prefs.spProfile); };

/* Shazam: the app syncs identified songs to a "My Shazam Tracks" playlist in Spotify or Apple Music; we read that playlist. */
async function importShazam(url) {
  url = String(url || '').trim(); if (!url) { toast('Pega el link de tu playlist “My Shazam Tracks”'); return; }
  status('#shazamStatus', 'Leyendo tus Shazams…'); $('#shazamBtn').disabled = true;
  try {
    const res = await importLink(url);
    if (!['spotify', 'apple'].includes(res.service)) throw new Error('Usa el link de la playlist “My Shazam Tracks” de Spotify o Apple Music.');
    if (!res.tracks.length) throw new Error('No encontré canciones en esa playlist (¿es pública?).');
    status('#shazamStatus', 'Buscando tus Shazams en el catálogo…');
    const found = await findShazamTracks(res.tracks.filter(t => t.title));
    db.sources.filter(x => x.shazam).forEach(x => removeSource(x.id));
    const r = registerImport({ ...res, name: 'Mis Shazams · ' + SERVICES[res.service] }, url, { shazam: true });
    db.prefs.shazamUrl = url;
    const p = saveShazamPlaylist(found);
    status('#shazamStatus', `Listo: ${r.n} Shazams de ${r.a} artistas y la playlist «${p.name}» con ${p.tracks.length} canciones.`);
    renderGustos(); renderExamples();
  } catch (e) { status('#shazamStatus', e.message || 'No pude leer tus Shazams'); }
  finally { $('#shazamBtn').disabled = false; }
}
async function findShazamTracks(list) {
  const base = s => K(String(s || '').replace(/\s*[([].*?[)\]]/g, '').replace(/\s+-\s+.*$/, ''));
  const found = (await pool(list, 5, async t => {
    const r = (await dz('/search', { q: `${t.artists[0]} ${t.title}`, limit: 8 })).data || [];
    const x = r.find(y => t.artists.some(a => K(a) === K(y.artist?.name)) && (base(y.title) === base(t.title) || base(y.title_short) === base(t.title)));
    return x ? toTrack({ track: x, artist: x.artist, why: 'Shazam' }) : null;
  })).filter(Boolean);
  if (!found.length && list.length) throw new Error('No pude encontrar tus Shazams en el catálogo ahora mismo; no cambié nada. Intenta de nuevo.');
  return found;
}
function saveShazamPlaylist(found) {
  let p = db.playlists.find(x => x.id === db.prefs.shazamPl);
  if (!p) { p = createPlaylist('Mis Shazams'); db.prefs.shazamPl = p.id; }
  p.tracks = []; addToPlaylist(p, found);
  return p;
}
$('#shazamForm').onsubmit = e => { e.preventDefault(); importShazam($('#shazamUrl').value || db.prefs.shazamUrl); };
$('#shazamDiscover').onclick = () => shazamArtists().length ? deepSearch('descubrir desde mis shazams') : toast('Primero importa tus Shazams');
$('#shazamOpen').onclick = () => db.playlists.some(x => x.id === db.prefs.shazamPl) ? location.hash = '#playlist/' + db.prefs.shazamPl : toast('Primero importa tus Shazams');

/* genres of your profile, classified with MusicBrainz tags that Every Noise recognises as genres */
function renderGenres() {
  const g = db.prefs.genres || [];
  $('#genreChips').innerHTML = g.length ? g.slice(0, 30).map(x => `<button type="button" class="chip g" data-g="${esc(x.g)}">${esc(x.g)} <em>${x.n}</em></button>`).join('')
    : '<p class="empty" style="padding:6px 0">Toca “Clasificar mis artistas” para ver tus géneros.</p>';
  $$('#genreChips [data-g]').forEach(b => b.onclick = () => deepSearch(b.dataset.g));
}
$('#classify').onclick = async () => {
  const top = tasteList().slice(0, 30); if (!top.length) { toast('Primero importa tus playlists'); return; }
  const btn = $('#classify'); btn.disabled = true; const w = {}; let i = 0, ok = 0;
  for (const e of top) {
    $('#classifyStatus').textContent = `${++i}/${top.length} · ${e.name}`;
    const info = await MB.artist(e.name).catch(() => null);
    if (!info) continue;
    ok++;
    info.genres.forEach((g, j) => { w[g] = (w[g] || 0) + Math.min(6, e.n) * (1 - j * 0.15); });
    const a = db.artists[K(e.name)]; if (a) { a.genres = info.genres; a.country = info.country; }
  }
  db.prefs.genres = Object.entries(w).sort((a, b) => b[1] - a[1]).map(([g, v]) => ({ g, n: Math.max(1, Math.round(v)) }));
  persist(); btn.disabled = false; $('#classifyStatus').textContent = ''; renderGenres(); renderExamples();
  toast(`Clasifiqué ${ok} de ${top.length} artistas en ${db.prefs.genres.length} géneros`);
};
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
  const name = ['descubrir', 'gustos', 'guardados', 'playlists', 'playlist', 'mapa'].includes(view) ? view : 'descubrir';
  $$('.view').forEach(v => v.hidden = v.dataset.view !== name);
  $$('[data-nav]').forEach(a => a.classList.toggle('on', a.dataset.nav === h || (a.dataset.nav === 'playlists' && name === 'playlist')));
  if (name === 'gustos') renderGustos();
  if (name === 'guardados') renderSaved();
  if (name === 'playlists') renderPlaylists();
  name === 'mapa' ? MapView.open() : MapView.close();
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
novLabel(); persist(); renderAll(); syncPlaying(); renderExamples();
if (qp.get('q') && (location.hash === '' || location.hash === '#descubrir')) { $('#prompt').value = qp.get('q'); discover(); }
Spotify.handleRedirect().then(pid => {
  if (pid === null) return;
  toast('Spotify conectado');
  if (pid === '#pick') { location.hash = '#gustos'; route(); renderSpotify(); pickSpotify(); return; }
  const p = db.playlists.find(x => x.id === pid);
  if (p) { location.hash = '#playlist/' + p.id; sendToSpotify(p); } else route();
}).catch(e => toast(e.message));
