// Órbita gateway (Cloudflare Worker): default route for every external API the app uses.
// Keeps API keys off the browser (wrangler secrets), reads pages without CORS limits and caches at the edge.
//   GET /read?url=<page>        public page → markdown via r.jina.ai (playlists 30 min, Every Noise 7 days)
//   GET /mb/<path>              MusicBrainz WS/2 with an identifiable User-Agent, cached 30 days
//   GET /lb/similar-artists?…   ListenBrainz labs similar artists, cached 7 days
//   GET /lastfm?method=…        Last.fm with the LASTFM_KEY secret (allow-listed methods), cached 1 day
//   GET|PUT|DELETE /sync/<id>  optional encrypted profile sync (KV binding PROFILES); id = SHA-256 of the user's code
//   GET /health
// Every response carries X-Gateway so the client can tell "gateway down" from "upstream failed".
const READ_HOSTS = ['open.spotify.com', 'music.apple.com', 'youtube.com', 'music.youtube.com', 'everynoise.com'];
const LASTFM_METHODS = new Set(['artist.getsimilar', 'artist.gettoptags', 'artist.getinfo', 'tag.gettopartists', 'tag.getsimilar', 'track.getsimilar']);
const DAY = 86400, TTL = { everynoise: 7 * DAY, playlist: 1800, mb: 30 * DAY, lb: 7 * DAY, lastfm: DAY };
const UA = 'Orbita/1.0 ( https://github.com/isaachanono/orbita-musica )';
const onHost = (h, d) => h === d || h.endsWith('.' + d);

async function upstreamFetch(url, init, retries = 1) {
  for (let i = 0; ; i++) {
    const r = await fetch(url, init);
    if (!(r.status === 429 || r.status === 503) || i >= retries) return r;
    await new Promise(res => setTimeout(res, 1000 * 2 ** i));
  }
}

// Opaque blobs only: the client encrypts with a key derived from its recovery code, so the gateway cannot read profiles.
// Entries expire after a year without writes.
const SYNC_MAX = 4 * 1024 * 1024;
async function syncRoute(req, env, id, json, cors) {
  if (!env.PROFILES) return json({ error: 'sync not configured' }, 501);
  if (req.method === 'GET') {
    const v = await env.PROFILES.get(id);
    return v ? new Response(v, { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...cors } }) : json({ error: 'not found' }, 404);
  }
  if (req.method === 'DELETE') { await env.PROFILES.delete(id); return json({ ok: true }); }
  if (req.method !== 'PUT') return json({ error: 'method not allowed' }, 405);
  const body = await req.text();
  if (body.length > SYNC_MAX) return json({ error: 'too large' }, 413);
  let o; try { o = JSON.parse(body); } catch { return json({ error: 'bad json' }, 400); }
  if (!Number.isFinite(o.t) || typeof o.iv !== 'string' || typeof o.data !== 'string' || Object.keys(o).length !== 3) return json({ error: 'bad body' }, 400);
  await env.PROFILES.put(id, body, { expirationTtl: 365 * 86400 });
  return json({ ok: true, t: o.t });
}

export default {
  async fetch(req, env, ctx) {
    const origin = req.headers.get('Origin') || '';
    const allowed = (env.ALLOWED_ORIGINS || '*').split(',').map(s => s.trim()).filter(Boolean);
    const cors = { 'Access-Control-Allow-Origin': allowed.includes('*') ? '*' : allowed.includes(origin) ? origin : allowed[0],
      'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Expose-Headers': 'X-Gateway, X-Cache', Vary: 'Origin', 'X-Gateway': '1' };
    const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { 'Content-Type': 'application/json', ...cors } });
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
    const url = new URL(req.url);
    const sync = url.pathname.match(/^\/sync\/([0-9a-f]{64})$/);
    if (sync) return syncRoute(req, env, sync[1], json, cors);
    if (req.method !== 'GET') return json({ error: 'method not allowed' }, 405);
    if (url.pathname === '/health') return json({ ok: true, lastfm: !!env.LASTFM_KEY, jina: !!env.JINA_KEY, sync: !!env.PROFILES });

    const cache = caches.default, key = new Request(url.toString());
    const hit = await cache.match(key);
    if (hit) { const r = new Response(hit.body, hit); Object.entries(cors).forEach(([k, v]) => r.headers.set(k, v)); r.headers.set('X-Cache', 'HIT'); return r; }

    let upstream, ttl;
    try {
      if (url.pathname === '/read') {
        const target = url.searchParams.get('url') || '';
        let h = ''; try { const t = new URL(target); if (t.protocol === 'https:') h = t.hostname; } catch {}
        if (!READ_HOSTS.some(d => onHost(h, d))) return json({ error: 'host not allowed' }, 400);
        upstream = await upstreamFetch('https://r.jina.ai/' + target, { headers: env.JINA_KEY ? { Authorization: 'Bearer ' + env.JINA_KEY } : {} });
        ttl = h === 'everynoise.com' ? TTL.everynoise : TTL.playlist;
      } else if (url.pathname.startsWith('/mb/')) {
        upstream = await upstreamFetch('https://musicbrainz.org/ws/2/' + url.pathname.slice(4) + url.search, { headers: { 'User-Agent': env.MB_USER_AGENT || UA, Accept: 'application/json' } });
        ttl = TTL.mb;
      } else if (url.pathname === '/lb/similar-artists') {
        upstream = await upstreamFetch('https://labs.api.listenbrainz.org/similar-artists/json' + url.search, { headers: { 'User-Agent': UA } });
        ttl = TTL.lb;
      } else if (url.pathname === '/lastfm') {
        if (!env.LASTFM_KEY) return json({ error: 'LASTFM_KEY not configured' }, 501);
        const method = (url.searchParams.get('method') || '').toLowerCase();
        if (!LASTFM_METHODS.has(method)) return json({ error: 'method not allowed' }, 400);
        const q = new URLSearchParams(url.searchParams); q.set('method', method); q.set('api_key', env.LASTFM_KEY); q.set('format', 'json');
        upstream = await upstreamFetch('https://ws.audioscrobbler.com/2.0/?' + q, { headers: { 'User-Agent': UA } });
        ttl = TTL.lastfm;
      } else return json({ error: 'not found' }, 404);
    } catch (e) {
      return json({ error: 'upstream unreachable' }, 502);
    }

    const res = new Response(upstream.body, { status: upstream.status, headers: { 'Content-Type': upstream.headers.get('Content-Type') || 'text/plain; charset=utf-8', 'Cache-Control': `public, max-age=${ttl}`, 'X-Cache': 'MISS', ...cors } });
    if (upstream.ok) ctx.waitUntil(cache.put(key, res.clone()));
    return res;
  },
};
