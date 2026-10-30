import { S, db, isKnownArtist, persist, shazamArtists, tasteList } from './session.js';
import { $, K, TK, shuffle, store } from './util.js';

export async function resolveArtistId(entry) {
  if (entry.id) return entry.id;
  const r = await dz('/search/artist', { q: entry.name, limit: 1 });
  const a = r.data?.[0];
  if (a && K(a.name) === K(entry.name)) { entry.id = a.id; S.knownIds.add(String(a.id)); }
  else entry.id = -1;
  return entry.id;
}

/* ---------- candidate sources ---------- */
export async function fromArtists(names, novelty, s) {
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

export async function fromScenes(scenes, intent) {
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

// Similar artists from open libraries: ListenBrainz (listening sessions) and Last.fm (only via the gateway node).
export async function fromLibs(s) {
  const seeds = s.intent.artists.length ? s.intent.artists.slice(0, 2)
    : s.useTaste ? shuffle((s.intent.shazam ? shazamArtists() : tasteList()).slice(0, 20)).slice(0, 2).map(e => e.name) : [];
  const res = await pool(seeds, 2, async seed => {
    const names = new Map();
    const mb = await soft('musicbrainz', MB.artist(seed), null);
    if (mb?.mbid) (await soft('listenbrainz', lbSimilar(mb.mbid))).forEach(n => names.set(K(n), { n, src: 'ListenBrainz' }));
    (await soft('lastfm', lfmSimilar(seed))).forEach(n => { if (!names.has(K(n))) names.set(K(n), { n, src: 'Last.fm' }); });
    const pick = shuffle([...names.values()].slice(s.novelty >= 60 ? 5 : 0)).filter(x => !db.artists[K(x.n)] && !s.exclude.has(K(x.n)) && K(x.n) !== K(seed)).slice(0, 8);
    const found = await pool(pick, 4, async x => { const a = (await dz('/search/artist', { q: x.n, limit: 1 })).data?.[0]; return a && K(a.name) === K(x.n) ? { a, src: x.src } : null; });
    return found.filter(Boolean).map(({ a, src }) => ({ artist: a, why: `${src === 'Last.fm' ? 'Similar a' : 'Se escucha junto a'} ${seed} · ${src}`, hop: 1, via: seed, scene: 'lib:' + seed, taste: !s.intent.artists.length }));
  });
  return res.filter(Boolean).flat();
}

// Taste: related artists of what you already listen to (imported playlists + likes).
export async function fromTaste(s) {
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
export const NOT_CUT = /\b(remix|remixed|live|en vivo|karaoke|instrumental|acapella|sped up|slowed)\b/i;
export async function fromDeep(s) {
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
    return [...hits, ...deep].filter(({ t }) => t.artist?.id === a.id && !NOT_CUT.test(t.title) && !S.knownTracks.has(TK(a.name, t.title)) && !seen.has(K(t.title_short || t.title)) && seen.add(K(t.title_short || t.title)))
      .map(({ t, why }) => ({ track: t, artist: a, why, deep: true, scene: 'deep:' + a.id }));
  });
  return res.filter(Boolean).flat();
}

// Every Noise genre pages list artists by popularity; read them through the public reader and match on Deezer.
export async function enArtists(genre) {
  const cache = store.get('descubre:en', {});
  if (cache[genre]) return cache[genre];
  const ctl = new AbortController(); const tm = setTimeout(() => ctl.abort(), 9000);
  try {
    const r = await readPage('https://everynoise.com/engenremap-' + enSlug(genre) + '.html', { signal: ctl.signal });
    if (!r.ok) throw new Error('everynoise ' + r.status);
    const names = [...(await r.text()).matchAll(/^(.+?)\[»\]\(https:\/\/everynoise\.com\/artistprofile/gm)].map(m => m[1].trim()).filter(Boolean);
    const keys = Object.keys(cache); if (keys.length > 30) delete cache[keys[0]];
    cache[genre] = names; try { store.set('descubre:en', cache); } catch {}
    return names;
  } catch (e) {
    reportFail('everynoise-scrape', e);
    const snap = await enSnapshot(genre);
    if (snap?.length) return snap;
    throw e;
  } finally { clearTimeout(tm); }
}
// Fallback: data/everynoise/<first letter>.json holds the top 30 artists of every genre (Every Noise has been frozen since 2023).
export const enShards = {};
export async function enSnapshot(genre) {
  const c = /^[a-z]/.test(enSlug(genre)) ? enSlug(genre)[0] : '0';
  enShards[c] ||= fetch(`data/everynoise/${c}.json`).then(r => r.ok ? r.json() : {}).catch(() => ({}));
  return (await enShards[c])[genre] || null;
}
export async function fromEveryNoise(scenes, s) {
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

export const ckey = c => c.deep ? 't' + c.track.id : c.artist.id;
export function rank(cands, s) {
  const { novelty } = s;
  const byArtist = new Map();
  const hasContext = s.scenes.length || s.intent.artists.length;
  for (const c of cands) {
    const a = c.artist; if (!a || !a.id) continue;
    if (!c.deep && (s.seedIds.has(a.id) || isKnownArtist(a) || s.exclude.has(K(a.name)))) continue;
    if (c.track && (!c.track.readable || S.knownTracks.has(TK(a.name, c.track.title)))) continue;
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

export async function ensureTrack(items) {
  return (await pool(items, 6, async it => {
    if (it.track) return it;
    const top = (await dz(`/artist/${it.artist.id}/top`, { limit: 5 })).data || [];
    const t = top.find(x => x.readable && x.preview && !S.knownTracks.has(TK(it.artist.name, x.title))) || top[0];
    return t ? { ...it, track: t } : null;
  })).filter(Boolean);
}

export const toTrack = it => {
  const t = it.track, a = it.artist;
  return { id: t.id, title: t.title_short || t.title, artist: a.name, artistId: a.id, album: t.album?.title, albumId: t.album?.id,
    cover: t.album?.cover_medium || t.album?.cover_big, coverBig: t.album?.cover_big || t.album?.cover_xl || t.album?.cover_medium,
    preview: t.preview, link: t.link || `https://www.deezer.com/track/${t.id}`, why: it.why, via: it.via };
};

export function newSession({ intent, fmt, novelty, useTaste, exclude = [] }) {
  return { intent, fmt, novelty, useTaste, scenes: [], seedIds: new Set(), tasteNear: new Map(), exclude: new Set(exclude.map(K)),
    queue: [], shownArtists: new Set(), shownAlbums: new Set(), refills: 0, lock: null, dead: false };
}
export async function gather(s) {
  const scenes = pickScenes(s.intent, s.novelty);
  if (!s.scenes.length) s.scenes = scenes;
  if (s.intent.deep.length || s.intent.deepTaste) return soft('profundo', fromDeep(s));
  const [ac, sc, tc, ec, lc] = await Promise.all([
    s.intent.artists.length ? soft('artistas', fromArtists(s.intent.artists, s.novelty, s)) : [],
    scenes.length ? soft('escenas', fromScenes(scenes, s.intent)) : [],
    s.useTaste ? soft('gustos', fromTaste(s)) : [],
    scenes.length ? soft('everynoise', fromEveryNoise(scenes, s)) : [],
    soft('bibliotecas', fromLibs(s)),
  ]);
  return [...ac, ...sc, ...tc, ...ec, ...lc];
}
export function refill(s) {
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
export const stillValid = (s, c) => c.deep ? !S.knownTracks.has(TK(c.artist.name, c.track.title)) && !(s.shownTracks && s.shownTracks.has(String(c.track.id))) : !s.shownArtists.has(c.artist.id) && !isKnownArtist(c.artist) && !s.exclude.has(K(c.artist.name));
export async function nextItems(s, n) {
  const out = [];
  while (out.length < n) {
    if (s.queue.length < (n - out.length) + 3) await refill(s);
    s.queue = s.queue.filter(c => stillValid(s, c));
    if (!s.queue.length) break;
    const batch = s.queue.splice(0, (n - out.length) + 2);
    for (const it of await ensureTrack(batch)) {
      if (out.length >= n) { s.queue.unshift(it); continue; }
      if (!stillValid(s, it) || S.knownTracks.has(TK(it.artist.name, it.track.title))) continue;
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
