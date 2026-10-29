// Reads public playlist / album / artist links from streaming services and returns
// { service, name, tracks: [{ title, artists: [..] }] }. No login: Deezer via its public API,
// the rest by reading the public web page through a CORS-friendly reader.
const SERVICES = { spotify: 'Spotify', apple: 'Apple Music', youtube: 'YouTube', deezer: 'Deezer', paste: 'Lista pegada', manual: 'Manual' };

async function fetchPage(url) {
  // Plain GET (no custom headers) so the browser does not need a CORS preflight.
  for (let i = 0; i < 2; i++) {
    try {
      const r = await fetch('https://r.jina.ai/' + url);
      const t = await r.text();
      if (r.ok && t.length > 300) return t;
    } catch { /* retry */ }
    await new Promise(res => setTimeout(res, 1500));
  }
  throw new Error('No pude leer ese link. ¿Es público? Intenta de nuevo en unos segundos.');
}
const pageTitle = md => ((md.match(/^Title:\s*(.+)$/m) || [])[1] || '').replace(/^\u200e/, '').replace(/\s*-\s*(Playlist|Album|Single|EP)?\s*-?\s*(Apple Music|Spotify|YouTube)\s*$/i, '').replace(/\s*-\s*(Playlist|Album)$/i, '').trim();

const splitArtists = s => String(s || '').split(/\s*(?:,|&| x | y | feat\.?| ft\.?| featuring | with )\s*/i).map(x => x.trim()).filter(Boolean);

async function importSpotify(type, id) {
  const md = await fetchPage(`https://open.spotify.com/embed/${type}/${id}`);
  const name = pageTitle(md) || 'Spotify';
  let tracks = [...md.matchAll(/^\s*\d+\.\s+###\s+(.+?)\s*\n+\s*####\s+(.+?)\s*$/gm)].map(m => ({ title: m[1], artists: splitArtists(m[2].replace(/^E\s+(?=\S)/, '')) }));
  if (type === 'artist') tracks = [{ title: '', artists: [name] }, ...tracks.map(t => ({ ...t, artists: [name, ...t.artists.filter(a => a !== name)] }))];
  if (!tracks.length && type === 'track') { const by = md.match(/^####\s+(.+)$/m) || md.match(/^#+\s+.+\n+(.+)$/m); if (by) tracks = [{ title: name, artists: splitArtists(by[1]) }]; }
  if (!tracks.length) throw new Error('Spotify no regresó canciones (¿playlist privada?)');
  return { service: 'spotify', name, tracks };
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
  return { service: 'apple', name, tracks: out };
}

const ytClean = s => String(s || '').replace(/\s*[([][^)\]]*(official|video|audio|lyric|letra|visualizer|oficial|en vivo|live|hd|4k)[^)\]]*[)\]]/gi, '').replace(/\s+/g, ' ').trim();
const ytChan = s => String(s || '').replace(/\s*-\s*Topic$/i, '').replace(/VEVO$/i, '').replace(/\s*(official|oficial)$/i, '').trim();
async function importYouTube(list) {
  const md = await fetchPage(`https://www.youtube.com/playlist?list=${list}`);
  const name = (md.match(/^#\s+\[?([^\]\n]+?)\]?(?:\(|$)/m) || [])[1] || pageTitle(md) || 'YouTube';
  const K = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const blocks = md.split(/\n(?=###\s+\[)/).slice(1);
  const tracks = blocks.map(b => {
    const t = (b.match(/^###\s+\[(.+?)\]\(https:\/\/www\.youtube\.com\/watch/) || [])[1];
    if (!t) return null;
    const c = (b.match(/\]\([^)]*\)[\s\S]*?\[([^\]\n]+)\]\(https:\/\/www\.youtube\.com\/(?:@|channel\/)/) || [])[1];
    const chan = ytChan(c), title = ytClean(t);
    const parts = title.split(/\s+[-–—]\s+/);
    if (parts.length >= 2) {
      const l = parts[0], r = parts.slice(1).join(' - ');
      if (chan && K(r).includes(K(chan)) && !K(l).includes(K(chan))) return { title: l, artists: splitArtists(r) };
      return { title: r.replace(/\s+(ft|feat)\.?\s.*$/i, ''), artists: splitArtists(l) };
    }
    return chan ? { title, artists: [chan] } : null;
  }).filter(t => t && t.artists.length);
  return { service: 'youtube', name, tracks };
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

async function importLink(input) {
  const url = input.trim();
  let m;
  if ((m = url.match(/open\.spotify\.com\/(?:intl-[a-z-]+\/)?(?:embed\/)?(playlist|album|artist|track)\/([A-Za-z0-9]+)/))) return importSpotify(m[1], m[2]);
  if ((m = url.match(/^spotify:(playlist|album|artist|track):([A-Za-z0-9]+)/))) return importSpotify(m[1], m[2]);
  if (/music\.apple\.com\//.test(url)) return importApple(url.split('?')[0]);
  if (/(youtube\.com|youtu\.be)/.test(url) && (m = url.match(/[?&]list=([A-Za-z0-9_-]+)/))) return importYouTube(m[1]);
  if ((m = url.match(/deezer\.com\/(?:[a-z]{2}\/)?(playlist|album|artist)\/(\d+)/))) return importDeezer(m[1], m[2]);
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
