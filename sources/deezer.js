// Deezer public API (JSONP: no CORS, no key). Main catalogue: search, related artists, top tracks, albums, 30 s previews.
const API = 'https://api.deezer.com';
let cbId = 0;
// Network errors, timeouts and Deezer's quota error (code 4) are retried with exponential backoff.
async function dz(path, params = {}) {
  for (let i = 0; ; i++) {
    try { return await dzOnce(path, params); } catch (e) {
      if (i >= 2 || !e.transient) throw e;
      await new Promise(r => setTimeout(r, 500 * 2 ** i + Math.random() * 300));
    }
  }
}
function dzOnce(path, params) {
  return new Promise((resolve, reject) => {
    const name = '__dz' + (++cbId);
    const qs = new URLSearchParams({ ...params, output: 'jsonp', callback: name });
    const s = document.createElement('script');
    const timer = setTimeout(() => { cleanup(); reject(Object.assign(new Error('timeout'), { transient: true })); }, 12000);
    function cleanup() { clearTimeout(timer); delete window[name]; s.remove(); }
    window[name] = data => { cleanup(); data && data.error ? reject(Object.assign(new Error(data.error.message || 'deezer'), { transient: data.error.code === 4 })) : resolve(data); };
    s.onerror = () => { cleanup(); reject(Object.assign(new Error('network'), { transient: true })); };
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
