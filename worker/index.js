// Descubre gateway: optional server node (Cloudflare Worker).
// Keeps API keys off the browser, reads pages without CORS limits and caches slow sources at the edge.
//   GET /read?url=<page>     public page → markdown (Spotify/Apple/YouTube playlists, Every Noise genre pages)
//   GET /mb/<path>           MusicBrainz WS/2 with a proper User-Agent, cached 7 days
//   GET /lastfm?method=...   Last.fm API with the LASTFM_KEY secret (allow-listed methods)
//   GET /health
const READ_HOSTS = ['open.spotify.com', 'music.apple.com', 'youtube.com', 'music.youtube.com', 'everynoise.com'];
const LASTFM_METHODS = new Set(['artist.getsimilar', 'artist.gettoptags', 'artist.getinfo', 'tag.gettopartists', 'tag.getsimilar', 'track.getsimilar']);
const onHost = (h, d) => h === d || h.endsWith('.' + d);

export default {
  async fetch(req, env, ctx) {
    const origin = req.headers.get('Origin') || '';
    const allowed = (env.ALLOWED_ORIGINS || '*').split(',').map(s => s.trim()).filter(Boolean);
    const cors = { 'Access-Control-Allow-Origin': allowed.includes('*') ? '*' : allowed.includes(origin) ? origin : allowed[0], 'Access-Control-Allow-Methods': 'GET, OPTIONS', Vary: 'Origin' };
    const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { 'Content-Type': 'application/json', ...cors } });
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (req.method !== 'GET') return json({ error: 'method not allowed' }, 405);

    const url = new URL(req.url);
    if (url.pathname === '/health') return json({ ok: true, lastfm: !!env.LASTFM_KEY });

    const cache = caches.default, key = new Request(url.toString());
    const hit = await cache.match(key);
    if (hit) { const r = new Response(hit.body, hit); Object.entries(cors).forEach(([k, v]) => r.headers.set(k, v)); return r; }

    let upstream, ttl;
    if (url.pathname === '/read') {
      const target = url.searchParams.get('url') || '';
      let h = ''; try { const t = new URL(target); if (t.protocol === 'https:') h = t.hostname; } catch {}
      if (!READ_HOSTS.some(d => onHost(h, d))) return json({ error: 'host not allowed' }, 400);
      upstream = await fetch('https://r.jina.ai/' + target, { headers: env.JINA_KEY ? { Authorization: 'Bearer ' + env.JINA_KEY } : {} });
      ttl = h === 'everynoise.com' ? 7 * 86400 : 1800;
    } else if (url.pathname.startsWith('/mb/')) {
      upstream = await fetch('https://musicbrainz.org/ws/2/' + url.pathname.slice(4) + url.search, { headers: { 'User-Agent': env.MB_USER_AGENT || 'Descubre/1.0 ( https://github.com/isaachanono/descubre-musica )', Accept: 'application/json' } });
      ttl = 7 * 86400;
    } else if (url.pathname === '/lastfm') {
      if (!env.LASTFM_KEY) return json({ error: 'LASTFM_KEY not configured' }, 501);
      const method = (url.searchParams.get('method') || '').toLowerCase();
      if (!LASTFM_METHODS.has(method)) return json({ error: 'method not allowed' }, 400);
      const q = new URLSearchParams(url.searchParams); q.set('method', method); q.set('api_key', env.LASTFM_KEY); q.set('format', 'json');
      upstream = await fetch('https://ws.audioscrobbler.com/2.0/?' + q);
      ttl = 86400;
    } else return json({ error: 'not found' }, 404);

    const res = new Response(upstream.body, { status: upstream.status, headers: { 'Content-Type': upstream.headers.get('Content-Type') || 'text/plain; charset=utf-8', 'Cache-Control': `public, max-age=${ttl}`, ...cors } });
    if (upstream.ok) ctx.waitUntil(cache.put(key, res.clone()));
    return res;
  },
};
