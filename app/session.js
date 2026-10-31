import { K, TK, store, toast, uid } from './util.js';

/* ---------- persistent profile ---------- */
// UI callbacks registered by ui.js (avoids a session ↔ ui import cycle)
export const hooks = {};
export const DB_KEY = 'descubre:v2';
export const db = Object.assign({ artists: {}, tracks: [], ids: [], liked: [], sources: [], playlists: [], nope: [], prefs: { useTaste: true } }, store.get(DB_KEY, {}));
(function migrate() {
  const oldKnown = store.get('known', null), oldSaved = store.get('saved', null);
  if (oldKnown) { db.ids = [...new Set([...db.ids, ...oldKnown.map(String)])]; localStorage.removeItem('known'); }
  if (oldSaved) { oldSaved.forEach(s => { const m = String(s.link || '').match(/deezer\.com\/(?:[a-z]{2}\/)?track\/(\d+)/); db.liked.push({ id: m ? m[1] : 'legacy-' + uid(), title: s.title, artist: s.sub, link: s.link, legacy: !m }); }); localStorage.removeItem('saved'); }
})();
export const S = { knownTracks: new Set(db.tracks), knownIds: new Set(db.ids.map(String)), mapT: null, session: null, now: null, queue: [], qi: -1, dStack: [], curPl: null };
export const persist = () => { db.tracks = [...S.knownTracks]; db.ids = [...S.knownIds]; try { store.set(DB_KEY, db); } catch { toast('No hay espacio para guardar más en este navegador'); } hooks.refreshCounts(); clearTimeout(S.mapT); S.mapT = setTimeout(() => MapView.refresh(), 300); if (typeof Sync !== 'undefined') Sync.changed(); };

// Artists dropped by removeSource keep their first-seen date and "via" only if a refresh re-adds them in the same tick.
export const retired = new Map();
export function addArtist(name, { id = null, src = 'manual', w = 1, via = null } = {}) {
  const k = K(name); if (!k) return null;
  const e = db.artists[k] || (db.artists[k] = { name, n: 0, srcs: [], ...retired.get(k) });
  e.n += w;
  e.by = e.by || {}; e.by[src] = (e.by[src] || 0) + w;
  if (id) { e.id = id; S.knownIds.add(String(id)); }
  if (!e.srcs.includes(src)) e.srcs.push(src);
  if (!e.first) e.first = Date.now();
  if (via && !e.via && K(via) !== k) e.via = via;
  return k;
}
export function markKnownTrack(artist, title) {
  const tk = TK(artist, title); S.knownTracks.add(tk);
  db.manualTracks = [...new Set([...(db.manualTracks || []), tk])];
}
export const isKnownArtist = a => a && (S.knownIds.has(String(a.id)) || !!db.artists[K(a.name)] || (db.nope || []).includes(K(a.name)));
export const tasteList = () => Object.values(db.artists).sort((a, b) => b.n - a.n);

export const shazamArtists = () => { const ids = new Set(db.sources.filter(x => x.shazam).map(x => x.id)); return tasteList().filter(e => e.srcs.some(x => ids.has(x))); };

export function applyProfile(d) {
  if (!d || typeof d.artists !== 'object') throw new Error('perfil inválido');
  Object.assign(db, d); S.knownTracks = new Set(db.tracks || []); S.knownIds = new Set((db.ids || []).map(String));
  persist(); hooks.renderAll();
}
