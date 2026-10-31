// Last.fm similar artists and tags. The API key lives in the gateway (wrangler secret LASTFM_KEY), so there is no direct fallback.
async function lfm(method, params) {
  if (!apiBase()) return null;
  const r = await viaGateway('/lastfm?' + new URLSearchParams({ method, ...params }), null);
  if (!r.ok) throw new Error('lastfm ' + r.status);
  return r.json();
}
async function lfmSimilar(name, n = 30) {
  const d = await lfm('artist.getsimilar', { artist: name, limit: n, autocorrect: 1 });
  return (d?.similarartists?.artist || []).map(a => a.name).filter(Boolean);
}
