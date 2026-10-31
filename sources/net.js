// Shared network helpers. The gateway node (worker/, config.apiBase) is the default route for external APIs.
// If it is unreachable the app falls back to direct calls where the source allows it (degraded mode, no server needed).
const CFG = window.DESCUBRE_CONFIG || {};
const apiBase = () => String(CFG.apiBase || '').replace(/\/+$/, '');
let gwDownUntil = 0;
const gwUp = () => !!apiBase() && Date.now() > gwDownUntil;
const backoffWait = ms => new Promise(r => setTimeout(r, ms));
const transient = s => s === 429 || s === 502 || s === 503 || s === 504;

// fetch with exponential backoff + jitter for network errors and 429/5xx (honours Retry-After up to 10 s).
async function fetchRetry(url, opts = {}, { tries = 3, base = 600, timeout = 15000 } = {}) {
  let last;
  for (let i = 0; i < tries; i++) {
    const ctl = new AbortController(), tm = setTimeout(() => ctl.abort(), timeout);
    const onAbort = () => ctl.abort(); opts.signal?.addEventListener('abort', onAbort);
    let wait = base * 2 ** i + Math.random() * base;
    try {
      const r = await fetch(url, { ...opts, signal: ctl.signal });
      if (!transient(r.status) || i === tries - 1) return r;
      last = new Error('http ' + r.status);
      const ra = +r.headers.get('Retry-After'); if (ra > 0) wait = Math.min(ra, 10) * 1000;
    } catch (e) { last = e; if (opts.signal?.aborted) throw e; }
    finally { clearTimeout(tm); opts.signal?.removeEventListener('abort', onAbort); }
    if (i < tries - 1) await backoffWait(wait);
  }
  throw last;
}

// Gateway first, then direct. `direct` is null when the source needs a server-side key (Last.fm).
// Gateway responses carry X-Gateway: an upstream 5xx relayed by the gateway is returned as is (the gateway works);
// a network error or a response without the header means the gateway itself is down → skip it for 5 minutes.
async function viaGateway(path, direct, opts = {}, retry = {}) {
  if (gwUp()) {
    try {
      const r = await fetchRetry(apiBase() + path, opts, { tries: 2, ...retry });
      if (r.headers.get('X-Gateway')) return r;
      throw new Error('gateway ' + r.status);
    } catch (e) {
      if (opts.signal?.aborted) throw e;
      gwDownUntil = Date.now() + 5 * 60e3;
      window.dispatchEvent(new CustomEvent('source-fail', { detail: { source: 'gateway', error: String(e?.message || e) } }));
    }
  }
  if (!direct) throw new Error('gateway unavailable');
  return fetchRetry(direct, opts, retry);
}
// Public page → markdown (playlists, Every Noise genre pages).
const readPage = (url, opts) => viaGateway('/read?url=' + encodeURIComponent(url), 'https://r.jina.ai/' + url, opts);
