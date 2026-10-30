
export const $ = s => document.querySelector(s);
export const $$ = s => [...document.querySelectorAll(s)];
export const store = {
  get: (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
};
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const K = s => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').normalize('NFC').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
export const cssUrl = u => /^https:\/\/[^\s"'()\\<>&]+$/.test(String(u || '')) ? u : '';
export const safeHref = u => /^https?:\/\//i.test(String(u || '')) ? u : '';
export const TK = (artist, title) => K(artist) + '|' + K(String(title || '').replace(/\s*[([].*$/, ''));
export const shuffle = a => a.map(v => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(x => x[1]);
export const uid = () => Math.random().toString(36).slice(2, 10);
export const icon = (n, cls = '') => `<svg class="${cls}"><use href="#i-${n}"/></svg>`;

/* ---------- helpers UI ---------- */
export function links(q) {
  const e = encodeURIComponent(q);
  return `<a href="https://open.spotify.com/search/${e}" target="_blank" rel="noopener">Spotify</a><a href="https://music.apple.com/us/search?term=${e}" target="_blank" rel="noopener">Apple</a><a href="https://music.youtube.com/search?q=${e}" target="_blank" rel="noopener">YouTube</a><a href="https://music.amazon.com/search/${e}" target="_blank" rel="noopener">Amazon</a>`;
}
export let toastT;
export function toast(msg) { const t = $('#toast'); t.textContent = msg; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => t.hidden = true, 2600); }
export const status = (sel, msg) => { $(sel).hidden = !msg; $(sel).textContent = msg || ''; };

export const flag = cc => /^[A-Z]{2}$/.test(cc || '') ? String.fromCodePoint(...[...cc].map(c => 0x1f1a5 + c.charCodeAt(0))) : '';
/* Public Spotify profile: recently played artists weigh more; public playlists are listed to import one by one or all. */
export const sleep = ms => new Promise(r => setTimeout(r, ms));
