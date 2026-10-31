// Reads public playlist / album / artist links from streaming services and returns
// { service, name, tracks: [{ title, artists: [..] }] }. No login: Deezer via its public API,
// the rest by reading the public web page through a CORS-friendly reader.
const SERVICES = { spotify: 'Spotify', apple: 'Apple Music', youtube: 'YouTube', deezer: 'Deezer', paste: 'Lista pegada', file: 'Archivo', manual: 'Manual', shazam: 'Shazam' };

async function fetchPage(url) {
  // Plain GET (no custom headers) so the browser does not need a CORS preflight. readPage already backs off on 429/5xx.
  for (let i = 0; i < 2; i++) {
    try {
      const r = await readPage(url);
      const t = await r.text();
      if (r.ok && t.length > 300) return t;
    } catch { /* retry */ }
    await new Promise(res => setTimeout(res, 1500));
  }
  throw new Error('No pude leer ese link. ¿Es público? Intenta de nuevo en unos segundos.');
}
const pageTitle = md => ((md.match(/^Title:\s*(.+)$/m) || [])[1] || '').replace(/^\u200e/, '').replace(/\s*-\s*(Playlist|Album|Single|EP)?\s*-?\s*(Apple Music|Spotify|YouTube)\s*$/i, '').replace(/\s*-\s*(Playlist|Album)$/i, '').trim();

const cleanArtist = x => {
  x = x.replace(/\s*[‘“«"][^’”»"]+$/, '').trim();
  if (/^[‘“«"].*[’”»"]$/.test(x)) x = x.slice(1, -1).trim();
  if (!/[‘“«"]/.test(x.slice(0, -1))) x = x.replace(/[’”»"]+$/, '');
  return x.replace(/^[’”»]+/, '').trim();
};
const splitArtists = s => String(s || '').split(/\s*(?:,|&|\|| x | y | feat\.?| ft\.?| featuring | with )\s*|\s+\/\s+/i).map(cleanArtist).filter(Boolean);

const EMBED_CAP = 100;
async function importSpotify(type, id) {
  if ((type === 'playlist' || type === 'album') && typeof Spotify !== 'undefined' && Spotify.canRead()) {
    try { const r = await Spotify.readPlaylist(type, id); if (r.tracks.length) return { service: 'spotify', name: r.name, tracks: r.tracks, full: true }; }
    catch (e) { console.warn('Spotify API read failed, using public page', e); }
  }
  const md = await fetchPage(`https://open.spotify.com/embed/${type}/${id}`);
  const name = pageTitle(md) || 'Spotify';
  let tracks = [...md.matchAll(/^\s*\d+\.\s+###\s+(.+?)\s*\n+\s*####\s+(.+?)\s*$/gm)].map(m => ({ title: m[1], artists: splitArtists(m[2].replace(/^E\s+(?=\S)/, '')) }));
  if (type === 'artist') tracks = [{ title: '', artists: [name] }, ...tracks.map(t => ({ ...t, artists: [name, ...t.artists.filter(a => a !== name)] }))];
  if (!tracks.length && type === 'track') { const by = md.match(/^####\s+(.+)$/m) || md.match(/^#+\s+.+\n+(.+)$/m); if (by) tracks = [{ title: name, artists: splitArtists(by[1]) }]; }
  if (!tracks.length) throw new Error('Spotify no regresó canciones (¿playlist privada?)');
  return { service: 'spotify', name, tracks, truncated: type === 'playlist' && tracks.length >= EMBED_CAP };
}

// Public Spotify profile, no login: name, public playlists and (if the user shows them) recently played artists.
// Following, top artists and liked songs are not public.
function spotifyUserId(input) {
  const s = String(input || '').trim();
  const m = s.match(/open\.spotify\.com\/(?:intl-[a-z-]+\/)?user\/([^/?#\s]+)/i) || s.match(/^spotify:user:([^:\s]+)/i);
  return m ? decodeURIComponent(m[1]) : null;
}
function mdSection(md, head) {
  const i = md.search(head); if (i < 0) return '';
  const s = md.slice(i), nl = s.indexOf('\n'), end = s.slice(nl).search(/^(#{1,2}\s|\* \* \*)/m);
  return end < 0 ? s : s.slice(0, nl + end);
}
// Page body without Spotify's footer (its links include a "Top Song Lyrics" playlist).
const mainMd = md => { const i = md.search(/^(\* \* \*|#{2,4}\s+Company)\s*$/m); return i < 0 ? md : md.slice(0, i); };
async function readSpotifyProfile(id) {
  const url = `https://open.spotify.com/user/${encodeURIComponent(id)}`;
  const [home, pls, rp] = await Promise.all([fetchPage(url), fetchPage(url + '/playlists').catch(() => ''), fetchPage(url + '/recently-played-artists').catch(() => '')]);
  const name = (home.match(/^Profile\s*\n+#\s+(.+)$/m) || [])[1];
  if (!name) throw new Error('No encontré ese perfil. Revisa el link (Spotify → tu perfil → ··· → Compartir → Copiar link).');
  const num = re => +((home.match(re) || [])[1] || '0').replace(/[,.\s]/g, '');
  const plMd = mainMd(pls) || mdSection(home, /^##\s+\[Public Playlists\]/m);
  const playlists = [], seen = new Set();
  for (const b of plMd.split(/\n(?=\[[^\]\n]+\]\(https:\/\/open\.spotify\.com\/playlist\/)/)) {
    const m = b.match(/^\[([^\]\n]+)\]\(https:\/\/open\.spotify\.com\/playlist\/([A-Za-z0-9]+)\)/);
    if (!m || seen.has(m[2]) || m[2] === '37i9dQZF1CLcTo7UzL0sYK') continue;
    seen.add(m[2]);
    playlists.push({ id: m[2], name: m[1].trim(), owner: ((b.match(/^By (.+)$/m) || [])[1] || '').trim() });
  }
  const arMd = mainMd(rp) || mdSection(home, /^##\s+\[Recently played artists\]/m);
  const artists = [...new Map([...arMd.matchAll(/\[([^\]\n]+)\]\(https:\/\/open\.spotify\.com\/artist\/([A-Za-z0-9]+)\)/g)].map(m => [m[2], m[1].trim()])).values()];
  return { id, url, name: name.trim(), total: num(/([\d,.]+)\s+Public Playlists?/i), followers: num(/([\d,.]+)\s+Followers?/i), playlists, artists };
}

async function importApple(url) {
  const md = await fetchPage(url);
  const name = pageTitle(md) || 'Apple Music';
  const tracks = []; const loose = [];
  let cur = null;
  for (const m of md.matchAll(/\[([^\]\n]+)\]\((https:\/\/music\.apple\.com\/[^)\s]+)\)/g)) {
    const [, text, href] = m;
    if (/\/song\//.test(href) || /[?&]i=\d+/.test(href)) { cur = { title: text.trim(), artists: [] }; tracks.push(cur); }
    else if (/\/artist\//.test(href)) {
      const a = text.trim();
      if (cur) { if (!cur.artists.includes(a)) cur.artists.push(a); }
      else if (!loose.includes(a)) loose.push(a);
    }
  }
  tracks.forEach(t => { if (!t.artists.length && loose[0]) t.artists.push(loose[0]); });
  let out = tracks.filter(t => t.title && t.artists.length);
  if (!out.length && loose.length) out = loose.slice(0, 20).map(a => ({ title: '', artists: [a] }));
  if (!out.length && /\/artist\//.test(url)) out = [{ title: '', artists: [name] }];
  return { service: 'apple', name, tracks: out, truncated: /\/playlist\//.test(url) && out.length >= EMBED_CAP };
}

const ytClean = s => String(s || '').replace(/\s*[([][^)\]]*(official|video|audio|lyric|letra|visualizer|oficial|en vivo|live|hd|4k)[^)\]]*[)\]]/gi, '').replace(/\s+/g, ' ').trim();
const ytChan = s => String(s || '').replace(/\s*-\s*Topic$/i, '').replace(/VEVO$/i, '').replace(/\s*(official|oficial)$/i, '').trim();
const ytLabel = /\b(records|recordings|label|labels|entertainment|music|t-series|studios?|soundtrack|ost|tv|lyrics?|letras?)\b/i;
const ytK = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\p{L}\p{N}]+/gu, '');
function ytTrack(t, c) {
  const chan = ytChan(c), title = ytClean(t).replace(/\s*\|.*$/, '');
  const parts = title.split(/\s+[-–—]\s+/).map(x => x.replace(/^[\s'"‘’“”]+|[\s'"‘’“”]+$/g, ''));
  if (parts.length >= 2) {
    const l = parts[0], r = parts.slice(1).join(' - ');
    if (chan && ytK(r).includes(ytK(chan)) && !ytK(l).includes(ytK(chan))) return { title: l, artists: splitArtists(r) };
    return { title: r.replace(/\s+(ft|feat)\.?\s.*$/i, ''), artists: splitArtists(l) };
  }
  return chan && !ytLabel.test(chan) ? { title, artists: [chan] } : null;
}
// Full playlist through the YouTube Data API (1 quota unit per 50 videos) when a browser key is configured.
async function importYouTubeApi(list, key) {
  const get = async (path, q) => { const r = await fetch(`https://www.googleapis.com/youtube/v3/${path}?` + new URLSearchParams({ key, ...q })); const j = await r.json(); if (!r.ok) throw new Error(j.error?.message || r.status); return j; };
  const meta = await get('playlists', { part: 'snippet', id: list });
  const tracks = []; let pageToken = '';
  do {
    const j = await get('playlistItems', { part: 'snippet', maxResults: 50, playlistId: list, ...(pageToken ? { pageToken } : {}) });
    (j.items || []).forEach(i => { const t = ytTrack(i.snippet?.title, i.snippet?.videoOwnerChannelTitle); if (t && t.artists.length) tracks.push(t); });
    pageToken = j.nextPageToken;
  } while (pageToken && tracks.length < 5000);
  return { service: 'youtube', name: meta.items?.[0]?.snippet?.title || 'YouTube', tracks, full: true };
}
async function importYouTube(list) {
  if (CFG.youtubeKey) { try { return await importYouTubeApi(list, CFG.youtubeKey); } catch (e) { console.warn('YouTube API failed, using public page', e); } }
  const md = await fetchPage(`https://www.youtube.com/playlist?list=${list}`);
  const name = (md.match(/^#\s+\[?([^\]\n]+?)\]?(?:\(|$)/m) || [])[1] || pageTitle(md) || 'YouTube';
  const blocks = md.split(/\n(?=###\s+\[)/).slice(1);
  const tracks = blocks.map(b => {
    const t = (b.match(/^###\s+\[(.+?)\]\(https:\/\/www\.youtube\.com\/watch/) || [])[1];
    if (!t) return null;
    const c = (b.match(/\]\([^)]*\)[\s\S]*?\[([^\]\n]+)\]\(https:\/\/www\.youtube\.com\/(?:@|channel\/)/) || [])[1];
    return ytTrack(t, c);
  }).filter(t => t && t.artists.length);
  return { service: 'youtube', name, tracks, truncated: blocks.length >= EMBED_CAP };
}

async function importDeezer(type, id) {
  if (type === 'artist') {
    const a = await dz(`/artist/${id}`);
    const top = (await dz(`/artist/${id}/top`, { limit: 10 })).data || [];
    return { service: 'deezer', name: a.name, tracks: [{ title: '', artists: [a.name], ids: [a.id] }, ...top.map(t => ({ title: t.title_short || t.title, artists: [t.artist.name], ids: [t.artist.id] }))] };
  }
  const meta = await dz(`/${type}/${id}`);
  const tracks = [];
  for (let index = 0; index < 2000; index += 400) {
    const page = await dz(`/${type}/${id}/tracks`, { limit: 400, index });
    const data = page.data || [];
    data.forEach(t => tracks.push({ title: t.title_short || t.title, artists: [t.artist?.name || meta.artist?.name].filter(Boolean), ids: [t.artist?.id || meta.artist?.id] }));
    if (data.length < 400) break;
  }
  return { service: 'deezer', name: meta.title || meta.name, tracks };
}

const hostOf = u => { try { return new URL(/^[a-z]+:\/\//i.test(u) ? u : 'https://' + u).hostname.toLowerCase(); } catch { return ''; } };
const onHost = (h, d) => h === d || h.endsWith('.' + d);

async function importLink(input) {
  const url = input.trim();
  const h = hostOf(url);
  let m;
  if (onHost(h, 'open.spotify.com') && (m = url.match(/open\.spotify\.com\/(?:intl-[a-z-]+\/)?(?:embed\/)?(playlist|album|artist|track)\/([A-Za-z0-9]+)/))) return importSpotify(m[1], m[2]);
  if ((m = url.match(/^spotify:(playlist|album|artist|track):([A-Za-z0-9]+)/))) return importSpotify(m[1], m[2]);
  if (h === 'music.apple.com') return importApple(new URL(/^https?:\/\//i.test(url) ? url : 'https://' + url).origin + new URL(/^https?:\/\//i.test(url) ? url : 'https://' + url).pathname);
  if ((onHost(h, 'youtube.com') || h === 'youtu.be') && (m = url.match(/[?&]list=([A-Za-z0-9_-]+)/))) return importYouTube(m[1]);
  if (onHost(h, 'deezer.com') && (m = url.match(/deezer\.com\/(?:[a-z]{2}\/)?(playlist|album|artist)\/(\d+)/))) return importDeezer(m[1], m[2]);
  if (/link\.deezer\.com|deezer\.page\.link|spotify\.link/.test(url)) throw new Error('Es un link corto: ábrelo en el navegador y copia el link largo de la barra de direcciones.');
  if (/amazon\.|tidal\.com/.test(url)) throw new Error('Amazon Music y Tidal no publican sus listas sin login. Usa “Pegar lista”.');
  throw new Error('No reconozco ese link. Usa uno de Spotify, Apple Music, YouTube o Deezer.');
}

function parsePasted(text) {
  return text.split('\n').map(l => l.replace(/^\s*\d+[.)]\s*/, '').trim()).filter(Boolean).map(l => {
    const p = l.split(/\s+[-–—]\s+/);
    return p.length >= 2 ? { title: p.slice(1).join(' - '), artists: splitArtists(p[0]) } : { title: '', artists: [l] };
  });
}

// Files exported by Exportify, TuneMyMusic, Soundiiz (CSV) or Apple Music / iTunes (tab-separated, UTF-16).
async function readFileText(file) {
  const buf = await file.arrayBuffer(), b = new Uint8Array(buf.slice(0, 2));
  return new TextDecoder(b[0] === 0xFF && b[1] === 0xFE ? 'utf-16le' : b[0] === 0xFE && b[1] === 0xFF ? 'utf-16be' : 'utf-8').decode(buf).replace(/^\uFEFF/, '');
}
function parseTable(text) {
  const head = text.split(/\r?\n/, 1)[0], cnt = ch => head.split(ch).length;
  const d = cnt('\t') > cnt(',') ? '\t' : cnt(';') > cnt(',') ? ';' : ',';
  const rows = []; let row = [], f = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
    else if (c === '"' && f === '') q = true;
    else if (c === d) { row.push(f); f = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(f); rows.push(row); row = []; f = ''; }
    else f += c;
  }
  if (f || row.length) { row.push(f); rows.push(row); }
  return rows.filter(r => r.some(x => x.trim()));
}
const TITLE_COLS = ['track name', 'name', 'title', 'song', 'song name', 'track', 'track title', 'nombre', 'canción', 'cancion', 'título', 'titulo'];
const ARTIST_COLS = ['artist name(s)', 'artist name', 'artist names', 'artists', 'artist', 'artist(s)', 'artista', 'artistas', 'intérprete'];
function parseFileTracks(text) {
  const rows = parseTable(text);
  const h = (rows[0] || []).map(x => x.trim().toLowerCase());
  const col = names => names.map(c => h.indexOf(c)).find(i => i >= 0);
  const ti = col(TITLE_COLS), ai = col(ARTIST_COLS);
  const tabular = h.length > 1 && rows.slice(1).every(r => r.length === h.length);
  if (ai === undefined) return tabular ? [] : parsePasted(text);
  if (rows.length < 2) return [];
  return rows.slice(1).map(r => ({ title: ti === undefined ? '' : String(r[ti] || '').trim(), artists: String(r[ai] || '').split(/\s*;\s*/).flatMap(splitArtists) })).filter(t => t.artists.length);
}
