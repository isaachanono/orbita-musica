import { describe, it, expect } from 'vitest';
import { loadClassic } from './load.js';

const { parseIntent, pickScenes } = loadClassic(['sources/everynoise.js', 'engine.js'], ['parseIntent', 'pickScenes']);
const moods = p => parseIntent(p).moods.map(m => m.label);

describe('mood y actividad', () => {
  it.each([
    ['algo para estudiar', 'concentración'],
    ['music to study', 'concentración'],
    ['para el gym', 'ejercicio'],
    ['workout playlist', 'ejercicio'],
    ['road trip', 'manejar'],
    ['para dormir', 'dormir'],
    ['something to sleep to', 'dormir'],
    ['canciones tristes de desamor', 'triste'],
    ['sad songs', 'triste'],
    ['para una fiesta en casa', 'fiesta'],
  ])('%s → %s', (p, label) => expect(moods(p)).toContain(label));

  it('combina actividad y momento', () => {
    expect(moods('algo melancólico con groove para manejar de noche')).toEqual(expect.arrayContaining(['manejar', 'noche', 'triste']));
  });
});

describe('géneros', () => {
  it('diccionario propio', () => {
    expect(parseIntent('shoegaze con voz femenina').genres).toContain('shoegaze');
    expect(parseIntent('some dream pop and trip hop').genres).toEqual(expect.arrayContaining(['dream pop', 'trip hop']));
  });
  it('prefiere el género más largo', () => {
    const g = parseIntent('deep house para cocinar').genres;
    expect(g).toContain('deep house');
    expect(g).not.toContain('house');
  });
  it('géneros de Every Noise fuera del diccionario', () => {
    expect(parseIntent('chicago house clásico').genres).toContain('chicago house');
  });
});

describe('"como X" (artistas semilla)', () => {
  it.each([
    ['algo como Khruangbin', ['Khruangbin']],
    ['parecido a Bad Bunny para el gym', ['Bad Bunny']],
    ['del estilo de Natalia Lafourcade, pero más electrónico', ['Natalia Lafourcade']],
    ['like Radiohead but sadder', ['Radiohead']],
    ['similar to Tame Impala for driving', ['Tame Impala']],
  ])('%s', (p, artists) => expect(parseIntent(p).artists).toEqual(artists));

  it('no confunde un género o un mood con un artista', () => {
    expect(parseIntent('algo como jazz').artists).toEqual([]);
    expect(parseIntent('algo tipo relajado').artists).toEqual([]);
  });
});

describe('"más de X" (canciones nuevas de un artista)', () => {
  it.each([
    ['más de Pop Smoke', ['Pop Smoke']],
    ['mas canciones de Mon Laferte', ['Mon Laferte']],
    ['lo menos conocido de Radiohead', ['Radiohead']],
    ['deep cuts de Fleetwood Mac', ['Fleetwood Mac']],
    ['canciones de Sin Bandera', ['Sin Bandera']],
    ['canciones de Mexico 68', ['Mexico 68']],
  ])('%s', (p, deep) => {
    const i = parseIntent(p);
    expect(i.deep).toEqual(deep);
    expect(i.artists).toEqual([]);
    expect(i.moods).toEqual([]);
  });

  it('"canciones de <género o país>" busca por escena, no por artista', () => {
    expect(parseIntent('canciones de shoegaze con voz femenina')).toMatchObject({ deep: [], genres: expect.arrayContaining(['shoegaze']) });
    expect(parseIntent('canciones de México')).toMatchObject({ deep: [], region: 'mexico' });
    expect(parseIntent('canciones de chicago house').deep).toEqual([]);
  });

  it('"de mis artistas" activa el modo de tus artistas', () => {
    for (const p of ['canciones que no conozco de mis artistas', 'más de mis artistas', 'rolas de artistas que ya conozco']) {
      expect(parseIntent(p).deepTaste, p).toBe(true);
    }
  });
});

describe('desde mis shazams', () => {
  it.each(['desde mis shazams', 'algo nuevo basado en mi shazam', 'from my shazams'])('%s', p => expect(parseIntent(p).shazam).toBe(true));
  it('no se activa sin la palabra', () => expect(parseIntent('algo para estudiar').shazam).toBe(false));
});

describe('época', () => {
  it.each([
    ['rock de los 80s', '80s'],
    ['baladas de los ochentas', '80s'],
    ['90s hip hop', '90s'],
    ['pop y2k', '2000s'],
    ['algo de los setentas', '70s'],
    ['música nueva', '2026'],
  ])('%s → %s', (p, era) => expect(parseIntent(p).era).toBe(era));
  it('sin época', () => expect(parseIntent('jazz para cocinar').era).toBeNull());
});

describe('región', () => {
  it.each([
    ['rock mexicano', 'mexico'],
    ['cumbia colombiana', 'colombia'],
    ['japanese city pop', 'japan'],
    ['funk brasileño', 'brasil'],
    ['brazilian jazz', 'brasil'],
    ['indie argentino', 'argentina'],
    ['k-pop coreano', 'korean'],
  ])('%s → %s', (p, region) => expect(parseIntent(p).region).toBe(region));
});

describe('formato', () => {
  it.each([
    ['un album de jazz para leer', 'album'],
    ['artistas como Khruangbin', 'artist'],
    ['a playlist for running', 'playlist'],
    ['una canción triste', 'track'],
  ])('%s → %s', (p, format) => expect(parseIntent(p).format).toBe(format));
});

describe('palabras clave de respaldo', () => {
  it('sin género, mood ni artista usa palabras sueltas', () => {
    const i = parseIntent('algo con saxofón');
    expect(i.genres).toEqual([]);
    expect(i.keywords).toContain('saxofon');
  });
});

describe('pickScenes', () => {
  it('usa los géneros del prompt y, con novedad alta, sus vecinos', () => {
    const i = parseIntent('dream pop');
    const low = pickScenes(i, 0, () => 0).map(s => s.term);
    const high = pickScenes(i, 100, () => 0).map(s => s.term);
    expect(low).toContain('dream pop');
    expect(high.some(t => ['shoegaze', 'ethereal wave', 'slowcore'].includes(t))).toBe(true);
  });
});
