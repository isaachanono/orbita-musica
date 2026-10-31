// MusicBrainz (open, CC0) classifies artists: genres, country, type and start year. Max 1 request/second; cached 30 days.
const MB = (() => {
  const KEY = 'descubre:mb', TTL = 30 * 864e5, MAX = 800;
  let cache = null, last = 0, chain = Promise.resolve();
  const load = () => cache || (cache = (() => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } })());
  const save = () => { const c = load(), ks = Object.keys(c); ks.slice(0, Math.max(0, ks.length - MAX)).forEach(k => delete c[k]); try { localStorage.setItem(KEY, JSON.stringify(c)); } catch {} };
  const nk = s => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\p{L}\p{N}]+/gu, '');
  function get(path) {
    const run = chain.then(async () => {
      for (let i = 0; i < 4; i++) {
        const wait = Math.max(0, last + 1100 + i * 1500 - Date.now()); if (wait) await new Promise(r => setTimeout(r, wait));
        last = Date.now();
        const p = path + (path.includes('?') ? '&' : '?') + 'fmt=json';
        const r = await viaGateway('/mb' + p, 'https://musicbrainz.org/ws/2' + p, {}, { tries: 1 });
        if (r.status === 503) continue;
        if (!r.ok) throw new Error('musicbrainz ' + r.status);
        return r.json();
      }
      throw new Error('musicbrainz 503 busy');
    });
    chain = run.catch(() => {});
    return run;
  }
  async function artist(name) {
    const k = nk(name); if (!k) return null;
    const c = load();
    if (c[k] && Date.now() - c[k].t < TTL) return c[k].v;
    const r = await get('/artist?query=' + encodeURIComponent(`artist:"${String(name).replace(/["\\]/g, '')}"`) + '&limit=3');
    const a = (r.artists || []).find(x => (x.score ?? 100) >= 85 && (nk(x.name) === k || (x.aliases || []).some(al => nk(al.name) === k)));
    let v = null;
    if (a) {
      const tags = (a.tags || []).sort((x, y) => y.count - x.count).map(t => t.name);
      v = { mbid: a.id, name: a.name, type: a.type || null, country: a.country || null, area: a.area?.name || null, begin: (a['life-span']?.begin || '').slice(0, 4) || null,
        genres: tags.filter(t => typeof enFind !== 'function' || enFind(t)).slice(0, 5), tags: tags.slice(0, 8) };
    }
    c[k] = { t: Date.now(), v }; save();
    return v;
  }
  // Cached result without a network call: undefined = never looked up, null = not found.
  const peek = name => { const c = load()[nk(name)]; return c ? c.v : undefined; };
  return { artist, peek };
})();
