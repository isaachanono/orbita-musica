// Deezer public API (JSONP: no CORS, no key). Main catalogue: search, related artists, top tracks, albums, 30 s previews.
const API = 'https://api.deezer.com';
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
