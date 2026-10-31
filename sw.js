// Órbita service worker: precaches the app shell so it opens offline (profile, saved songs and playlists live in
// localStorage). Same-origin files are network-first (deploys show up on the next load), Google Fonts cache-first.
// External APIs are not intercepted. Bump VERSION when the file list changes.
const VERSION = 'orbita-v4';
const SHELL = ['./', 'index.html', 'style.css', 'config.js', 'feedback.js', 'sources/net.js', 'sources/deezer.js', 'sources/everynoise.js',
  'sources/musicbrainz.js', 'sources/listenbrainz.js', 'sources/lastfm.js', 'sources/import.js', 'sources/spotify.js', 'engine.js',
  'prompts.js', 'vendor/d3.min.js', 'map.js', 'app/util.js', 'app/session.js', 'app/ranking.js', 'app/player.js', 'app/ui.js', 'app/main.js', 'app/globals.js', 'sync.js', 'icon.svg', 'manifest.webmanifest'];
const FONTS = /^https:\/\/fonts\.(googleapis|gstatic)\.com\//;

self.addEventListener('install', e => e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())));

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    e.respondWith(fetch(req).then(r => {
      if (r.ok && r.type === 'basic') { const c = r.clone(); caches.open(VERSION).then(ca => ca.put(req, c)); }
      return r;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || (req.mode === 'navigate' ? caches.match('index.html') : Response.error()))));
  } else if (FONTS.test(req.url)) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => { const c = r.clone(); caches.open(VERSION).then(ca => ca.put(req, c)); return r; })));
  }
});
