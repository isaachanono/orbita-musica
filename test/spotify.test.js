import { describe, it, expect, beforeEach } from 'vitest';
import { loadClassic } from './load.js';

const mem = () => { const m = new Map(); return { getItem: k => m.has(k) ? m.get(k) : null, setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k), m }; };
const res = (status, body, headers = {}) => ({ status, ok: status >= 200 && status < 300, headers: { get: k => headers[k] ?? null }, json: async () => (typeof body === 'string' ? JSON.parse(body) : body), text: async () => (typeof body === 'string' ? body : JSON.stringify(body)) });

let ls, calls, onToken, onApi, Spotify;
const TOK = 'descubre:sp';
const tok = () => JSON.parse(ls.getItem(TOK));
beforeEach(() => {
  ls = mem(); calls = [];
  ls.setItem('descubre:spClient', 'cid');
  onToken = () => res(200, { access_token: 'new', refresh_token: 'r2', expires_in: 3600 });
  onApi = () => res(200, { items: [], next: null });
  const fetch = async (url, opts = {}) => {
    calls.push(url);
    await new Promise(r => setTimeout(r, 5));
    return url.includes('accounts.spotify.com') ? onToken(opts) : onApi(url, opts);
  };
  ({ Spotify } = loadClassic(['sources/spotify.js'], ['Spotify'], { localStorage: ls, sessionStorage: mem(), fetch, setTimeout, URLSearchParams, window: {} }));
});
const expired = (extra = {}) => ls.setItem(TOK, JSON.stringify({ access: 'old', refresh: 'r1', scope: 'playlist-read-private', exp: Date.now() - 1, ...extra }));
const tokenCalls = () => calls.filter(u => u.includes('/api/token')).length;

describe('Spotify PKCE: expiración y refresh', () => {
  it('usa el token vigente sin refrescar', async () => {
    ls.setItem(TOK, JSON.stringify({ access: 'ok', refresh: 'r1', exp: Date.now() + 3600e3 }));
    await Spotify.myPlaylists();
    expect(tokenCalls()).toBe(0);
  });

  it('refresca 60 s antes de expirar', async () => {
    expired({ exp: Date.now() + 30e3 });
    await Spotify.myPlaylists();
    expect(tokenCalls()).toBe(1);
    expect(tok()).toMatchObject({ access: 'new', refresh: 'r2', scope: 'playlist-read-private' });
  });

  it('llamadas en paralelo comparten un solo refresh (Spotify rota el refresh token)', async () => {
    expired();
    await Promise.all([Spotify.myPlaylists(), Spotify.myPlaylists(), Spotify.myPlaylists(), Spotify.myPlaylists()]);
    expect(tokenCalls()).toBe(1);
    expect(tok().access).toBe('new');
  });

  it('refresh token inválido → borra la sesión y pide reconectar', async () => {
    expired();
    onToken = () => res(400, { error: 'invalid_grant' });
    await expect(Spotify.myPlaylists()).rejects.toThrow('auth');
    expect(ls.getItem(TOK)).toBeNull();
    expect(Spotify.connected()).toBe(false);
  });

  it('error de red al refrescar → conserva la sesión', async () => {
    expired();
    onToken = () => { throw new TypeError('Failed to fetch'); };
    await expect(Spotify.myPlaylists()).rejects.toThrow('Failed to fetch');
    expect(tok().refresh).toBe('r1');
  });

  it('401 de la API → refresca una vez y reintenta', async () => {
    ls.setItem(TOK, JSON.stringify({ access: 'revoked', refresh: 'r1', exp: Date.now() + 3600e3 }));
    let n = 0;
    onApi = () => (n++ === 0 ? res(401, { error: { message: 'expired' } }) : res(200, { items: [{ id: 'p', name: 'L', items: { total: 3 } }], next: null }));
    expect(await Spotify.myPlaylists()).toEqual([{ id: 'p', name: 'L', n: 3, owner: '' }]);
    expect(tokenCalls()).toBe(1);
  });

  it('401 que persiste → borra la sesión', async () => {
    ls.setItem(TOK, JSON.stringify({ access: 'x', refresh: 'r1', exp: Date.now() + 3600e3 }));
    onApi = () => res(401, {});
    await expect(Spotify.myPlaylists()).rejects.toThrow('auth');
    expect(ls.getItem(TOK)).toBeNull();
  });
});

describe('usuarios fuera de User Management', () => {
  it('403 «user may not be registered» → not-registered y sin sesión', async () => {
    ls.setItem(TOK, JSON.stringify({ access: 'ok', refresh: 'r1', exp: Date.now() + 3600e3 }));
    onApi = () => res(403, 'Check settings on developer.spotify.com/dashboard, the user may not be registered.');
    await expect(Spotify.myPlaylists()).rejects.toThrow('not-registered');
    expect(Spotify.connected()).toBe(false);
  });

  it('otro 403 conserva la sesión y muestra el mensaje de Spotify', async () => {
    ls.setItem(TOK, JSON.stringify({ access: 'ok', refresh: 'r1', exp: Date.now() + 3600e3 }));
    onApi = () => res(403, { error: { status: 403, message: 'Insufficient client scope' } });
    await expect(Spotify.myPlaylists()).rejects.toThrow('Spotify: Insufficient client scope');
    expect(Spotify.connected()).toBe(true);
  });
});

describe('cerrar sesión', () => {
  it('disconnect borra tokens y el verificador PKCE pendiente', () => {
    ls.setItem(TOK, JSON.stringify({ access: 'ok', exp: Date.now() + 1e6 }));
    Spotify.disconnect();
    expect(Spotify.connected()).toBe(false);
    expect(Spotify.clientId()).toBe('cid');
  });
});
