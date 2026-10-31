// ListenBrainz (MetaBrainz): artists that people play in the same listening sessions. Keyed by MusicBrainz IDs.
const LB_ALGO = 'session_based_days_7500_session_300_contribution_5_threshold_10_limit_100_filter_True_skip_30';
async function lbSimilar(mbid, n = 30) {
  const q = `?artist_mbids=${encodeURIComponent(mbid)}&algorithm=${LB_ALGO}`;
  const r = await viaGateway('/lb/similar-artists' + q, 'https://labs.api.listenbrainz.org/similar-artists/json' + q);
  if (!r.ok) throw new Error('listenbrainz ' + r.status);
  const d = await r.json();
  return (Array.isArray(d) ? d : []).slice(0, n).map(x => x.name).filter(Boolean);
}
