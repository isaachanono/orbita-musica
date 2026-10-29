// Export playlists to Spotify with Authorization Code + PKCE: runs fully in the browser, no client secret.
const Spotify = (() => {
  const TOK = 'descubre:sp', CID = 'descubre:spClient';
  const SCOPES = 'playlist-modify-private playlist-modify-public';
  const redirectUri = () => location.origin + location.pathname;
  const clientId = () => localStorage.getItem(CID) || (window.DESCUBRE_CONFIG || {}).spotifyClientId || '';
  const setClientId = id => { id = String(id || '').trim(); id ? localStorage.setItem(CID, id) : localStorage.removeItem(CID); localStorage.removeItem(TOK); };
  const b64 = buf => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const rand = n => b64(crypto.getRandomValues(new Uint8Array(n)));
  const getTok = () => { try { return JSON.parse(localStorage.getItem(TOK)); } catch { return null; } };
  const saveTok = (r, old = {}) => localStorage.setItem(TOK, JSON.stringify({ access: r.access_token, refresh: r.refresh_token || old.refresh, exp: Date.now() + ((r.expires_in || 3600) - 60) * 1000 }));

  async function connect(pending = '') {
    const id = clientId(); if (!id) throw new Error('no-client');
    const verifier = rand(48), state = rand(12);
    const challenge = b64(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier)));
    sessionStorage.setItem('sp_auth', JSON.stringify({ verifier, state, pending, back: location.hash }));
    const u = new URL('https://accounts.spotify.com/authorize');
    u.search = new URLSearchParams({ response_type: 'code', client_id: id, scope: SCOPES, code_challenge_method: 'S256', code_challenge: challenge, redirect_uri: redirectUri(), state });
    location.href = u.toString();
  }
  async function token(body) {
    const r = await fetch('https://accounts.spotify.com/api/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ client_id: clientId(), ...body }) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.error_description || j.error || 'token');
    return j;
  }
  // Returns null when this page load is not an OAuth callback, otherwise the pending playlist id ('' if none).
  async function handleRedirect() {
    const q = new URLSearchParams(location.search);
    const code = q.get('code'), err = q.get('error'), state = q.get('state');
    if (!code && !err) return null;
    const auth = JSON.parse(sessionStorage.getItem('sp_auth') || 'null');
    sessionStorage.removeItem('sp_auth');
    ['code', 'state', 'error'].forEach(k => q.delete(k));
    history.replaceState(null, '', location.pathname + (q.toString() ? '?' + q : '') + (auth?.back || ''));
    if (err) throw new Error(err === 'access_denied' ? 'Cancelaste el permiso de Spotify' : 'Spotify: ' + err);
    if (!auth || state !== auth.state) throw new Error('La respuesta de Spotify no coincide; intenta de nuevo');
    saveTok(await token({ grant_type: 'authorization_code', code, redirect_uri: redirectUri(), code_verifier: auth.verifier }));
    return auth.pending || '';
  }
  async function access() {
    const t = getTok(); if (!t) return null;
    if (Date.now() < t.exp) return t.access;
    if (!t.refresh) return null;
    try { const r = await token({ grant_type: 'refresh_token', refresh_token: t.refresh }); saveTok(r, t); return r.access_token; }
    catch { localStorage.removeItem(TOK); return null; }
  }
  async function api(path, opts = {}, retry = 2) {
    const a = await access(); if (!a) throw new Error('auth');
    const r = await fetch('https://api.spotify.com/v1' + path, { ...opts, headers: { Authorization: 'Bearer ' + a, ...(opts.body ? { 'Content-Type': 'application/json' } : {}) } });
    if (r.status === 429 && retry) { await new Promise(res => setTimeout(res, (+r.headers.get('Retry-After') || 2) * 1000)); return api(path, opts, retry - 1); }
    if (r.status === 401) { localStorage.removeItem(TOK); throw new Error('auth'); }
    if (!r.ok) { let m = r.status; try { m = (await r.json()).error?.message || m; } catch {} throw new Error('Spotify: ' + m); }
    return r.status === 204 ? null : r.json();
  }
  const clean = s => String(s || '').replace(/\s*[([].*?[)\]]/g, '').replace(/"/g, '').trim();
  const nk = s => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\p{L}\p{N}]+/gu, '');
  async function findUri(t) {
    const title = clean(t.title), artist = clean(t.artist);
    for (const q of [`track:${title} artist:${artist}`, `${artist} ${title}`]) {
      const items = (await api('/search?' + new URLSearchParams({ q, type: 'track', limit: 5 }))).tracks?.items || [];
      const byArtist = items.filter(x => x.artists.some(a => nk(a.name) === nk(artist)));
      const hit = byArtist.find(x => nk(clean(x.name)) === nk(title)) || byArtist.find(x => nk(x.name).startsWith(nk(title)));
      if (hit) return hit.uri;
    }
    return null;
  }
  async function exportPlaylist(p, progress = () => {}) {
    const res = new Array(p.tracks.length); let i = 0, done = 0;
    await Promise.all(Array.from({ length: Math.min(4, p.tracks.length) }, async () => {
      while (i < p.tracks.length) {
        const k = i++;
        res[k] = await findUri(p.tracks[k]);
        progress(++done, p.tracks.length);
      }
    }));
    const uris = [...new Set(res.filter(Boolean))], missing = p.tracks.filter((_, k) => !res[k]);
    if (!uris.length) throw new Error('No encontré ninguna de estas canciones en Spotify');
    const pl = await api('/me/playlists', { method: 'POST', body: JSON.stringify({ name: p.name, description: 'Creada con Descubre', public: false }) });
    for (let k = 0; k < uris.length; k += 100) await api(`/playlists/${pl.id}/items`, { method: 'POST', body: JSON.stringify({ uris: uris.slice(k, k + 100) }) });
    return { url: pl.external_urls?.spotify, added: uris.length, missing };
  }
  return { clientId, setClientId, connect, handleRedirect, exportPlaylist, redirectUri, connected: () => !!getTok(), disconnect: () => localStorage.removeItem(TOK) };
})();
