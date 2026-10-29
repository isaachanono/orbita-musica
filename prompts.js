// Prompt suggestions: a fresh random set on every render, specialised by search type and filled with your own artists/genres.
const PROMPTS = {
  auto: ['algo melancólico con groove para manejar de noche', 'para estudiar sin letra pero que no sea lofi típico', 'fiesta en casa, cumbia y cosas raras', 'parecido a {artist} pero menos conocido', 'triste pero bonito, para un día de lluvia', '{genre} para cocinar el domingo', 'algo que nunca habría buscado yo', 'música de {region} para empezar el día', 'como {artist} pero más experimental', 'city pop japonés 80s', 'algo raro y bailable para la madrugada', 'más de {artist}'],
  track: ['canciones de {genre} para concentrarme', 'más de {artist}', 'canciones que no conozco de mis artistas', 'rolas tristes pero bailables', 'canciones instrumentales para leer de noche', 'canciones parecidas a {artist} con más guitarra', 'temas de {region} de los 70s con mucho groove', 'canciones cortas y con energía para correr', 'canciones de {genre} con voz femenina', 'rolas para manejar en carretera al atardecer', 'canciones para bailar lento en la cocina', 'canciones raras de {genre} que casi nadie conoce'],
  artist: ['artistas nuevos parecidos a {artist}', 'bandas de {genre} que casi nadie conoce', 'cantautoras latinoamericanas íntimas', 'productores de electrónica orgánica', 'bandas de {region} con sonido psicodélico', 'artistas como {artist} pero de otro país', 'raperos en español con beats de jazz', 'grupos de {genre} formados después de 2015', 'dúos de dream pop', 'artistas de {genre} para descubrir esta semana', 'bandas instrumentales para concentrarme', 'artistas de jazz moderno de Londres'],
  album: ['un álbum de jazz para el domingo en la mañana', 'discos completos para escuchar de corrido en carretera', 'álbumes de {genre} sin canciones de relleno', 'un disco como {artist} para un día de lluvia', 'álbumes conceptuales de rock psicodélico', 'un álbum de {region} para cocinar', 'discos de {genre} de los 90s que se perdieron', 'un álbum tranquilo para trabajar toda la tarde', 'álbumes debut de bandas parecidas a {artist}', 'un disco para escuchar con audífonos de noche', 'álbumes de ambient para dormir', 'un álbum de salsa dura para el sábado'],
  playlist: ['playlist para el gym con energía', 'playlist para una cena con amigos', 'playlist de {genre} para trabajar', 'playlist para un road trip por la costa', 'playlist para una fiesta en casa que empiece tranquila', 'playlist desde mis shazams', 'playlist como {artist} pero sin repetir artistas', 'playlist para estudiar de madrugada', 'playlist de {region} para el verano', 'playlist para correr 5 km', 'playlist triste pero esperanzadora', 'playlist de {genre} para descubrir'],
};
const PROMPT_FALLBACK = { artists: ['Khruangbin', 'Natalia Lafourcade', 'Portishead', 'Bad Bunny', 'Tame Impala', 'Rosalía', 'Bonobo', 'Café Tacvba', 'Frank Ocean', 'Mon Laferte'], genres: ['shoegaze', 'nu jazz', 'cumbia', 'afrobeat', 'trip hop', 'bossa nova', 'city pop', 'neo soul', 'post-rock', 'synthwave'], regions: ['México', 'Brasil', 'Japón', 'Nigeria', 'Colombia', 'Turquía', 'Argentina', 'Corea', 'Francia', 'Cuba'] };
let lastPrompts = new Set();
function suggestPrompts(fmt, ctx = {}, n = 6) {
  const rnd = a => a[Math.floor(Math.random() * a.length)];
  const artists = ctx.artists?.length ? ctx.artists : PROMPT_FALLBACK.artists;
  const genres = ctx.genres?.length ? ctx.genres : PROMPT_FALLBACK.genres;
  let pool = [...(PROMPTS[fmt] || PROMPTS.auto)];
  if (!ctx.shazam) pool = pool.filter(t => !/shazam/.test(t));
  if (!ctx.artists?.length) pool = pool.filter(t => !/mis artistas/.test(t));
  if (ctx.shazam && fmt !== 'artist' && !pool.some(t => /shazam/.test(t))) pool.push('algo distinto desde mis shazams');
  const fresh = pool.filter(t => !lastPrompts.has(t));
  const pick = (fresh.length >= n ? fresh : pool).map(t => [Math.random(), t]).sort((a, b) => a[0] - b[0]).slice(0, n).map(x => x[1]);
  lastPrompts = new Set(pick);
  const used = new Set();
  const fill = (t, key, list) => t.replace(key, () => { let v = rnd(list); for (let i = 0; i < 5 && used.has(v); i++) v = rnd(list); used.add(v); return v; });
  return pick.map(t => fill(fill(fill(t, '{artist}', artists), '{genre}', genres), '{region}', PROMPT_FALLBACK.regions));
}
