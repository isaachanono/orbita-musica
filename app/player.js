import { S, db } from './session.js';
import { askKnown, currentTracks, like, likeMany, openDetail, openMenu, replaceTile } from './ui.js';
import { $, $$, cssUrl, icon, links, toast } from './util.js';

/* ---------- player ---------- */
export const player = $('#player');
export async function freshPreview(t) {
  if (!t.id || isNaN(+t.id)) return null;
  const x = await soft('deezer', dz(`/track/${t.id}`), null);
  if (x?.preview) { t.preview = x.preview; return x.preview; }
  return null;
}
export async function playTrack(t, list = null) {
  if (list) { S.queue = list; S.qi = list.indexOf(t); }
  if (S.now && sameTrack(S.now, t)) { player.paused ? player.play() : player.pause(); return; }
  S.now = t;
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
export const sameTrack = (a, b) => a && b && String(a.id) === String(b.id);
export function syncPlaying() {
  const on = !player.paused && S.now;
  $('#pPlay').innerHTML = icon(on ? 'pause' : 'play');
  syncActs();
  document.body.classList.toggle('is-playing', !!on);
  $$('[data-tid]').forEach(el => {
    const p = on && String(el.dataset.tid) === String(S.now.id);
    el.classList.toggle('playing', !!p);
    const b = el.querySelector('.pbtn, .th'); if (b) b.innerHTML = icon(p ? 'pause' : 'play');
  });
}
player.onplay = player.onpause = syncPlaying;
// Same actions as the cards, right from the 30 s preview. If the song is a card on screen, act through that card (so ♥ on an album opens "what to save" and the slot gets refilled).
export const tileOf = t => t && [...$$('#results .tile')].find(el => el._track && sameTrack(el._track, t));
export function playerActs(t) {
  const box = $('#pActs'), b = (k, ic, title) => `<button class="icon-btn" data-p="${k}" title="${title}">${icon(ic)}</button>`;
  box.innerHTML = b('like', 'heart', 'Me gusta') + b('known', 'known', 'Ya la conozco') + b('add', 'plus', 'Añadir a playlist') + b('swap', 'swap', 'Otra opción') + b('more', 'list', 'Ver más canciones y abrir en tu servicio');
  box.hidden = false;
  syncActs();
  box.onclick = async e => {
    const btn = e.target.closest('[data-p]'); if (!btn || !S.now) return;
    const k = btn.dataset.p, cur = S.now, el = tileOf(cur);
    if (k === 'add') { e.stopPropagation(); return openMenu(btn, [cur]); }
    if (k === 'more') return openDetail(cur.albumId ? { type: 'album', id: cur.albumId, via: cur.via, trackId: cur.id } : { type: 'artist', id: cur.artistId, via: cur.via, trackId: cur.id });
    if (el && k !== 'swap') { e.stopPropagation(); return el.querySelector(`.t-acts [data-a="${k}"]`).click(); }
    if (k === 'like') { likeMany([cur]); toast(`Guardada ♥ ${cur.title}`); return syncActs(); }
    if (k === 'known') { e.stopPropagation(); return askKnown(btn, { name: cur.artist, id: cur.artistId, title: cur.title, via: cur.via }); }
    if (k === 'swap' && el) { const n = await replaceTile(el); if (n?._track) playTrack(n._track, currentTracks()); }
  };
}
export function syncActs() {
  const box = $('#pActs'); if (box.hidden || !S.now) return;
  const liked = db.liked.some(x => sameTrack(x, S.now));
  box.querySelector('[data-p=like]').classList.toggle('on', liked);
  box.querySelector('[data-p=like]').title = liked ? 'Ya está en Guardados' : 'Me gusta';
  box.querySelector('[data-p=swap]').hidden = !tileOf(S.now);
}
player.ontimeupdate = () => { $('#pProg').style.width = (player.duration ? player.currentTime / player.duration * 100 : 0) + '%'; };
player.onended = () => { if (S.queue.length && S.qi < S.queue.length - 1) playTrack(S.queue[++S.qi]); else syncPlaying(); };
$('#pPlay').onclick = () => { if (!S.now) { const f = $('[data-tid] .pbtn, [data-tid] .th'); f ? f.click() : toast('Elige una canción'); return; } player.paused ? player.play() : player.pause(); };
$('#pNext').onclick = () => { if (S.queue.length && S.qi < S.queue.length - 1) playTrack(S.queue[++S.qi]); };
