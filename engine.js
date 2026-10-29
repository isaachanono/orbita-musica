// Intent parser: turns a free-text prompt (es/en) into genres, moods, artist seeds, format and modifiers.
const norm = s => ' ' + s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9ñ&'\- ]+/g, ' ').replace(/\s+/g, ' ').trim() + ' ';

const MOODS = [
  { label: 'concentración', keys: ['estudiar', 'estudio', 'concentr', 'focus', 'study', 'trabajar', 'trabajo', 'programar', 'codear', 'coding', 'leer', 'lectura', 'home office', 'oficina'], genres: ['lofi', 'jazzhop', 'ambient', 'post-rock', 'neo-classical', 'chillhop', 'downtempo'] },
  { label: 'ejercicio', keys: ['gym', 'correr', 'running', 'ejercicio', 'entrenar', 'workout', 'pesas', 'crossfit', 'cardio', 'bici'], genres: ['drum and bass', 'phonk', 'hard techno', 'trap', 'electro house', 'breakbeat', 'nu metal'] },
  { label: 'manejar', keys: ['manejar', 'carretera', 'road trip', 'roadtrip', 'driving', 'viaje', 'conducir', 'coche', 'carro'], genres: ['synthwave', 'city pop', 'yacht rock', 'indie rock', 'krautrock', 'desert rock'] },
  { label: 'noche', keys: ['noche', 'night', 'madrugada', 'nocturn', '3am', 'late night'], genres: ['darkwave', 'trip hop', 'dream pop', 'deep house', 'alternative r&b', 'nu jazz'] },
  { label: 'relajado', keys: ['relaj', 'chill', 'tranqui', 'calma', 'descans', 'relax', 'sunset', 'atardecer', 'domingo'], genres: ['bossa nova', 'chillwave', 'neo soul', 'balearic', 'indie folk', 'downtempo'] },
  { label: 'dormir', keys: ['dormir', 'sleep', 'sueño', 'meditar', 'meditacion', 'yoga', 'respirar'], genres: ['ambient', 'drone', 'neo-classical', 'new age', 'field recordings'] },
  { label: 'fiesta', keys: ['fiesta', 'party', 'bailar', 'antro', 'peda', 'perreo', 'dance', 'pregame', 'previa', 'club'], genres: ['nu-disco', 'afro house', 'baile funk', 'reggaeton', 'french house', 'amapiano', 'electro swing'] },
  { label: 'triste', keys: ['triste', 'sad', 'llorar', 'melancol', 'desamor', 'corazon roto', 'heartbreak', 'nostalg', 'extrañ', 'solo', 'soledad'], genres: ['slowcore', 'sadcore', 'indie folk', 'dream pop', 'bolero', 'emo'] },
  { label: 'feliz', keys: ['feliz', 'happy', 'alegre', 'buen humor', 'contento', 'verano', 'summer', 'sol', 'good vibes', 'buena vibra'], genres: ['indie pop', 'afrobeat', 'tropicalia', 'surf rock', 'highlife', 'funk'] },
  { label: 'playa', keys: ['playa', 'beach', 'mar', 'tropical', 'vacacion'], genres: ['tropical house', 'reggae', 'surf rock', 'cumbia', 'bossa nova', 'dub'] },
  { label: 'energía', keys: ['energia', 'energy', 'motiv', 'hype', 'intenso', 'adrenalina', 'despertar'], genres: ['punk', 'garage rock', 'big beat', 'grime', 'drum and bass'] },
  { label: 'enojo', keys: ['enojad', 'rabia', 'coraje', 'angry', 'furia', 'estres', 'frustr'], genres: ['hardcore punk', 'metalcore', 'industrial', 'noise rock', 'drill'] },
  { label: 'romántico', keys: ['romant', 'amor', 'love', 'cita', 'date', 'sensual', 'pareja', 'cena'], genres: ['neo soul', 'bolero', 'r&b', 'bossa nova', 'quiet storm', 'jazz vocal'] },
  { label: 'mañana / café', keys: ['mañana', 'morning', 'cafe', 'coffee', 'desayuno', 'amanecer', 'brunch'], genres: ['jazz', 'indie folk', 'soft rock', 'bossa nova', 'chamber pop'] },
  { label: 'lluvia', keys: ['lluvia', 'rain', 'lluvioso', 'nublado', 'otoño', 'autumn', 'invierno'], genres: ['trip hop', 'shoegaze', 'post-rock', 'jazz', 'slowcore'] },
  { label: 'cocinar', keys: ['cocinar', 'cooking', 'limpiar', 'casa'], genres: ['funk', 'soul', 'afrobeat', 'latin jazz', 'disco'] },
  { label: 'gaming', keys: ['gaming', 'jugar', 'videojuego', 'gamer'], genres: ['synthwave', 'chiptune', 'drum and bass', 'future funk', 'dubstep'] },
  { label: 'creatividad', keys: ['crear', 'creativ', 'pintar', 'diseñar', 'escribir', 'inspira'], genres: ['art pop', 'experimental', 'idm', 'jazz fusion', 'psychedelic rock'] },
  { label: 'raro / experimental', keys: ['raro', 'weird', 'experimental', 'diferente', 'sorprend', 'loco', 'extraño'], genres: ['experimental', 'avant-garde', 'idm', 'zeuhl', 'free jazz', 'hyperpop'] },
];

const GENRES = ['lofi', 'jazzhop', 'chillhop', 'ambient', 'post-rock', 'post-punk', 'neo-classical', 'downtempo', 'drum and bass', 'jungle', 'phonk', 'hard techno', 'techno', 'house', 'deep house', 'tech house', 'trap', 'electro house', 'breakbeat', 'nu metal', 'metal', 'black metal', 'doom metal', 'metalcore', 'synthwave', 'city pop', 'yacht rock', 'indie rock', 'krautrock', 'desert rock', 'stoner rock', 'darkwave', 'coldwave', 'trip hop', 'dream pop', 'alternative r&b', 'r&b', 'nu jazz', 'jazz', 'free jazz', 'jazz fusion', 'latin jazz', 'bossa nova', 'samba', 'mpb', 'tropicalia', 'chillwave', 'vaporwave', 'neo soul', 'soul', 'funk', 'disco', 'nu-disco', 'italo disco', 'balearic', 'indie folk', 'folk', 'drone', 'new age', 'afro house', 'afrobeat', 'afrobeats', 'amapiano', 'highlife', 'baile funk', 'reggaeton', 'dembow', 'french house', 'electro swing', 'slowcore', 'sadcore', 'bolero', 'emo', 'midwest emo', 'indie pop', 'surf rock', 'garage rock', 'punk', 'hardcore punk', 'big beat', 'grime', 'uk garage', 'drill', 'industrial', 'noise rock', 'shoegaze', 'chamber pop', 'art pop', 'experimental', 'idm', 'psychedelic rock', 'psychedelic', 'avant-garde', 'zeuhl', 'hyperpop', 'chiptune', 'future funk', 'dubstep', 'reggae', 'dub', 'ska', 'cumbia', 'cumbia psicodelica', 'cumbia rebajada', 'chicha', 'tropical house', 'corridos', 'corridos tumbados', 'regional mexicano', 'norteño', 'son jarocho', 'mariachi', 'bachata', 'salsa', 'merengue', 'champeta', 'tango', 'flamenco', 'nuevo flamenco', 'rock en español', 'rock nacional', 'trova', 'nueva cancion', 'k-pop', 'j-pop', 'j-rock', 'k-indie', 'math rock', 'hip hop', 'boom bap', 'rap', 'jazz rap', 'cloud rap', 'gospel', 'blues', 'country', 'americana', 'bluegrass', 'classical', 'minimal', 'minimalism', 'opera', 'soundtrack', 'lo-fi house', 'quiet storm', 'jazz vocal', 'soft rock', 'pop punk', 'grunge', 'britpop', 'new wave', 'synthpop', 'electropop', 'electronica', 'trance', 'progressive house', 'hardstyle', 'gqom', 'kuduro', 'rai', 'qawwali', 'bollywood', 'ethio jazz', 'desert blues', 'arabic pop', 'turkish psych', 'anatolian rock', 'cumbia villera', 'field recordings', 'garage', 'neo-psychedelia', 'space rock', 'progressive rock', 'art rock', 'glam rock', 'dark ambient', 'witch house', 'footwork', 'bass music', 'uk bass', 'electroclash', 'indietronica', 'bedroom pop', 'jangle pop', 'twee pop', 'riot grrrl', 'shibuya-kei', 'enka', 'fado', 'chanson', 'musique concrete'];

// Further-away neighbours used when the novelty slider is high.
const NEIGHBORS = {
  'lofi': ['jazzhop', 'lo-fi house', 'nu jazz', 'ambient'], 'jazzhop': ['nu jazz', 'jazz rap', 'broken beat'], 'chillhop': ['jazzhop', 'neo soul', 'nu jazz'],
  'ambient': ['dark ambient', 'drone', 'kankyo ongaku', 'field recordings'], 'post-rock': ['math rock', 'slowcore', 'krautrock'], 'neo-classical': ['minimalism', 'modern classical', 'drone'],
  'downtempo': ['trip hop', 'balearic', 'dub'], 'drum and bass': ['jungle', 'liquid funk', 'footwork'], 'phonk': ['memphis rap', 'drift phonk', 'witch house'],
  'hard techno': ['industrial techno', 'gabber', 'ebm'], 'trap': ['cloud rap', 'drill', 'rage'], 'electro house': ['big room', 'fidget house', 'electroclash'],
  'breakbeat': ['big beat', 'uk garage', 'nu skool breaks'], 'nu metal': ['alternative metal', 'industrial metal', 'metalcore'], 'synthwave': ['italo disco', 'darksynth', 'future funk'],
  'city pop': ['shibuya-kei', 'japanese funk', 'future funk', 'aor'], 'yacht rock': ['aor', 'soft rock', 'city pop'], 'indie rock': ['jangle pop', 'math rock', 'post-punk revival'],
  'krautrock': ['kosmische', 'space rock', 'neu!'], 'desert rock': ['stoner rock', 'desert blues', 'turkish psych'], 'darkwave': ['coldwave', 'minimal wave', 'ebm'],
  'trip hop': ['downtempo', 'illbient', 'dub'], 'dream pop': ['shoegaze', 'ethereal wave', 'slowcore'], 'deep house': ['lo-fi house', 'afro house', 'micro house'],
  'alternative r&b': ['neo soul', 'quiet storm', 'pnb r&b'], 'nu jazz': ['broken beat', 'jazz fusion', 'spiritual jazz'], 'bossa nova': ['mpb', 'tropicalia', 'samba jazz'],
  'chillwave': ['vaporwave', 'hypnagogic pop', 'dream pop'], 'neo soul': ['quiet storm', 'jazz funk', 'alternative r&b'], 'balearic': ['italo disco', 'cosmic disco', 'ambient house'],
  'indie folk': ['freak folk', 'chamber folk', 'american primitive'], 'drone': ['dark ambient', 'minimalism', 'musique concrete'], 'new age': ['kankyo ongaku', 'fourth world', 'ambient'],
  'nu-disco': ['italo disco', 'cosmic disco', 'boogie'], 'afro house': ['amapiano', 'gqom', 'afro tech'], 'baile funk': ['funk mandelao', 'kuduro', 'gqom'],
  'reggaeton': ['dembow', 'moombahton', 'neoperreo'], 'french house': ['filter house', 'nu-disco', 'electroclash'], 'electro swing': ['gypsy jazz', 'nu jazz', 'balkan beat'],
  'slowcore': ['sadcore', 'dream pop', 'post-rock'], 'sadcore': ['slowcore', 'chamber folk', 'emo'], 'bolero': ['trova', 'son cubano', 'filin'], 'emo': ['midwest emo', 'math rock', 'screamo'],
  'indie pop': ['jangle pop', 'twee pop', 'bedroom pop'], 'afrobeat': ['ethio jazz', 'highlife', 'afro funk'], 'tropicalia': ['mpb', 'brazilian psych', 'samba rock'],
  'surf rock': ['garage rock', 'exotica', 'cumbia psicodelica'], 'highlife': ['palm wine', 'afrobeat', 'soukous'], 'funk': ['p-funk', 'jazz funk', 'boogie', 'afro funk'],
  'reggae': ['dub', 'lovers rock', 'rocksteady'], 'cumbia': ['cumbia psicodelica', 'chicha', 'cumbia rebajada', 'cumbia digital'], 'punk': ['post-punk', 'garage punk', 'hardcore punk'],
  'garage rock': ['garage punk', 'proto-punk', 'psych garage'], 'big beat': ['breakbeat', 'trip hop', 'electroclash'], 'grime': ['uk drill', 'uk garage', 'dubstep'],
  'hardcore punk': ['powerviolence', 'post-hardcore', 'crust punk'], 'metalcore': ['mathcore', 'post-hardcore', 'deathcore'], 'industrial': ['ebm', 'power electronics', 'industrial rock'],
  'noise rock': ['no wave', 'sludge', 'post-hardcore'], 'drill': ['uk drill', 'brooklyn drill', 'grime'], 'r&b': ['quiet storm', 'new jack swing', 'neo soul'],
  'quiet storm': ['smooth soul', 'philly soul', 'neo soul'], 'jazz vocal': ['vocal jazz', 'bossa nova', 'cabaret'], 'jazz': ['spiritual jazz', 'ethio jazz', 'modal jazz', 'jazz fusion'],
  'soft rock': ['aor', 'yacht rock', 'sunshine pop'], 'chamber pop': ['baroque pop', 'chamber folk', 'art pop'], 'shoegaze': ['dream pop', 'blackgaze', 'nu gaze'],
  'latin jazz': ['boogaloo', 'descarga', 'salsa dura'], 'disco': ['italo disco', 'boogie', 'cosmic disco'], 'chiptune': ['bitpop', 'video game music', 'synthwave'],
  'future funk': ['city pop', 'vaporwave', 'nu-disco'], 'dubstep': ['uk bass', 'riddim', 'brostep'], 'art pop': ['chamber pop', 'avant-pop', 'experimental pop'],
  'experimental': ['musique concrete', 'avant-garde', 'sound collage'], 'idm': ['glitch', 'braindance', 'ambient techno'], 'jazz fusion': ['zeuhl', 'canterbury scene', 'jazz rock'],
  'psychedelic rock': ['turkish psych', 'anatolian rock', 'space rock', 'neo-psychedelia'], 'avant-garde': ['free improvisation', 'musique concrete', 'zeuhl'], 'free jazz': ['spiritual jazz', 'free improvisation', 'avant-garde jazz'],
  'hyperpop': ['digicore', 'glitchcore', 'bubblegum bass'], 'tropical house': ['balearic', 'afro house', 'deep house'], 'dub': ['dub techno', 'roots reggae', 'digital dub'],
  'corridos tumbados': ['corridos', 'sierreño', 'trap corridos'], 'regional mexicano': ['son jarocho', 'huapango', 'norteño'], 'rock en español': ['rock nacional', 'rock alternativo mexicano', 'latin alternative'],
  'hip hop': ['jazz rap', 'boom bap', 'abstract hip hop'], 'rap': ['abstract hip hop', 'jazz rap', 'cloud rap'], 'techno': ['dub techno', 'minimal techno', 'detroit techno'], 'house': ['deep house', 'chicago house', 'garage house'],
  'k-pop': ['k-indie', 'k-r&b', 'city pop'], 'j-pop': ['shibuya-kei', 'city pop', 'j-rock'], 'post-punk': ['coldwave', 'darkwave', 'no wave'], 'synthpop': ['minimal wave', 'italo disco', 'new wave'],
};

const FORMAT_KEYS = [
  ['album', ['album', 'disco ', 'lp ', 'ep ']], ['artist', ['artista', 'banda', 'grupo', 'cantante', 'artist', 'band ', 'rapero', 'dj ']],
  ['playlist', ['playlist', 'lista', 'mix ', 'mixtape', 'setlist']], ['track', ['cancion', 'canciones', 'rola', 'rolas', 'tema ', 'temas', 'track', 'song', 'single']],
];
const ERAS = [[/\b(60s|sesentas|anos 60|60's)\b/, '60s'], [/\b(70s|setentas|anos 70|70's)\b/, '70s'], [/\b(80s|ochentas|anos 80|80's)\b/, '80s'], [/\b(90s|noventas|anos 90|90's)\b/, '90s'], [/\b(2000s|dosmiles|y2k)\b/, '2000s'], [/\b(nuev[oa]s?|reciente|2025|2026|actual)\b/, '2026']];
const REGIONS = [['mexic', 'mexico'], ['latin', 'latino'], ['espanol', 'español'], ['japon', 'japan'], ['japanese', 'japan'], ['brasil', 'brasil'], ['brazil', 'brasil'], ['franc', 'french'], ['african', 'africa'], ['nigeria', 'nigeria'], ['corea', 'korean'], ['korean', 'korean'], ['argentin', 'argentina'], ['colombia', 'colombia'], ['peru', 'peru'], ['chile', 'chile'], ['cuba', 'cuba'], ['turk', 'turkish'], ['ital', 'italian'], ['aleman', 'german'], ['ingles', 'uk'], ['britan', 'uk'], ['arabe', 'arabic'], ['india', 'india']];
const ARTIST_RE = /(?:parecid[oa]s? a|similar(?:es)? a|del estilo de|estilo de|tipo|como|onda|rollo|like|similar to|vibe de|vibes de|a lo)\s+(.+?)(?=\s+(?:pero|para|y|con|que|sin|o|mientras|cuando|en|de los|but|for|and|with)\s|[,.;!?]|$)/gi;
const DEEP_RE = /(m[aá]s (?:canciones |rolas |temas )?de|otras (?:canciones |rolas |temas )?de|lo menos conocido de|deep cuts de|canciones de|rolas de|temas de)\s+(.+?)(?=\s+(?:pero|para|y que|que|sin|mientras|cuando|but|for)\s|[,.;!?]|$)/gi;
const NOT_ARTIST = /^(algo|para|un|una|el|la|los|las|que|si|cuando|de|lo|mas|muy|esto|eso|tipo|cuando)\b/;

function parseIntent(prompt) {
  const raw = prompt.trim();
  const t = norm(raw);
  const intent = { raw, genres: [], moods: [], artists: [], deep: [], deepTaste: false, shazam: false, format: null, era: null, region: null, keywords: [] };

  for (const [fmt, keys] of FORMAT_KEYS) if (keys.some(k => t.includes(' ' + k))) { intent.format = fmt; break; }

  const sortedGenres = [...GENRES].sort((a, b) => b.length - a.length);
  let rest = t;
  for (const g of sortedGenres) {
    const ng = norm(g);
    if (rest.includes(ng)) { intent.genres.push(g); rest = rest.replace(ng, ' '); }
  }

  if (typeof enMatchText === 'function' && intent.genres.length < 4) for (const g of enMatchText(rest)) { if (!intent.genres.includes(g)) { intent.genres.push(g); rest = rest.replace(norm(g), ' '); } }

  let m; ARTIST_RE.lastIndex = 0;
  while ((m = ARTIST_RE.exec(raw))) {
    const name = m[1].trim().replace(/^(a|de|el|la)\s+/i, '');
    const n = norm(name).trim();
    if (!n || n.length < 2 || NOT_ARTIST.test(n)) continue;
    if (GENRES.some(g => norm(g).trim() === n)) continue;
    if (MOODS.some(md => md.keys.some(k => n.startsWith(k)))) continue;
    intent.artists.push(name);
  }

  DEEP_RE.lastIndex = 0;
  while ((m = DEEP_RE.exec(raw))) {
    const name = m[2].trim(), n = norm(name).trim(), loose = /(canciones|rolas|temas) de$/i.test(m[1]);
    if (/^(mis|tus|los|las)? ?artistas\b/.test(n)) { intent.deepTaste = true; continue; }
    const moodOnly = n.split(' ').every(w => MOODS.some(md => md.keys.some(k => w.startsWith(k.split(' ')[0]))));
    if (!n || n.length < 2 || NOT_ARTIST.test(n) || (loose && (GENRES.some(g => norm(g).trim() === n) || (typeof enFind === 'function' && enFind(n)) || intent.genres.some(g => n.startsWith(norm(g).trim())) || (typeof enFind === 'function' && n.split(' ').slice(1, 4).some((_, i, w) => enFind(n.split(' ').slice(0, i + 1).join(' ')))))) || moodOnly) continue;
    intent.deep.push(name);
  }
  if (/ mis artistas | artistas que (ya )?conozco /.test(t)) intent.deepTaste = true;
  if (/ (mis )?shazam/.test(t)) intent.shazam = true;
  intent.artists = intent.artists.filter(a => !intent.deep.some(d => norm(d) === norm(a)));
  const names = [...intent.artists, ...intent.deep].map(norm);
  intent.genres = intent.genres.filter(g => !names.some(n => n.includes(norm(g))));

  for (const md of MOODS) if (md.keys.some(k => t.includes(' ' + k))) intent.moods.push(md);
  for (const [re, era] of ERAS) if (re.test(t)) { intent.era = era; break; }
  for (const [k, v] of REGIONS) if (t.includes(' ' + k)) { intent.region = v; break; }

  if (intent.deep.length) intent.moods = [];
  if (!intent.genres.length && !intent.moods.length && !intent.artists.length && !intent.deep.length && !intent.deepTaste && !intent.shazam) {
    const stop = new Set('algo quiero dame ponme necesito busco musica music para que con sin una uno unos unas el la los las de del y o a en mi me por favor muy mas tipo cosas canciones artistas album albums playlist nuevo nueva nuevas nuevos'.split(' '));
    intent.keywords = t.trim().split(' ').filter(w => w.length > 2 && !stop.has(w)).slice(0, 4);
  }
  return intent;
}

function pickScenes(intent, novelty, rnd = Math.random) {
  const shuffle = a => a.map(v => [rnd(), v]).sort((x, y) => x[0] - y[0]).map(x => x[1]);
  const farShare = novelty / 100;
  const nbOf = g => {
    const own = NEIGHBORS[g], en = typeof enNear === 'function' ? enNear(g, 8, 0) : [];
    return own && (!en.length || rnd() < 0.5) ? { list: own, en: false } : en.length ? { list: en, en: true } : null;
  };
  const swap = (g, p) => { const nb = nbOf(g); return nb && rnd() < p ? { term: shuffle(nb.list)[0], from: g, far: true, en: nb.en } : { term: g, from: null, far: false }; };
  const max = intent.artists.length ? 3 : 4;
  const scenes = intent.genres.slice(0, max).map(g => ({ term: g, from: null, far: false }));
  if (intent.genres.length && novelty >= 60 && scenes.length < max) scenes.push(swap(shuffle(intent.genres)[0], 1));
  const moodGenres = [...new Set(intent.moods.flatMap(md => shuffle(md.genres).slice(0, intent.genres.length ? 1 : 3)))];
  for (const g of shuffle(moodGenres)) { if (scenes.length >= max) break; if (!scenes.some(s => s.term === g)) scenes.push(swap(g, farShare)); }
  if (!scenes.length && intent.keywords.length) scenes.push({ term: intent.keywords.join(' '), from: null, far: false });
  const seen = new Set();
  return scenes.filter(s => !seen.has(s.term) && seen.add(s.term));
}

if (typeof module !== 'undefined') module.exports = { parseIntent, pickScenes, MOODS, GENRES, NEIGHBORS };
