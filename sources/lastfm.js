// Last.fm similar artists and tags. Needs an API key, so it only runs through the gateway node (config.apiBase).
async function lfm(method, params) {
  if (!apiBase()) return null;
  const r = await fetch(`${apiBase()}/lastfm?` + new URLSearchParams({ method, ...params }));
  if (!r.ok) throw new Error('lastfm ' + r.status);
  return r.json();
}
async function lfmSimilar(name, n = 30) {
  const d = await lfm('artist.getsimilar', { artist: name, limit: n, autocorrect: 1 });
  return (d?.similarartists?.artist || []).map(a => a.name).filter(Boolean);
}
