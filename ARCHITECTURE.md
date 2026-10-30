# Órbita — arquitectura

```mermaid
flowchart LR
  subgraph Browser["Navegador (GitHub Pages, estático)"]
    UI["UI (index.html · app.js)"]
    INT["Intérprete de prompt (engine.js)"]
    GEN["Generadores de candidatos"]
    RANK["Filtro + ranking (novedad, ya conocido, diversidad)"]
    ENR["Enriquecimiento (géneros, país, año)"]
    PROF[("Perfil local · localStorage\nartistas, canciones, fuentes,\nplaylists, géneros")]
  end
  subgraph Sources["Fuentes (sources/)"]
    DZ["Deezer API\ncatálogo, relacionados, previews"]
    EN["Every Noise\nmapa de géneros + artistas por escena"]
    MB["MusicBrainz\nclasificación"]
    LB["ListenBrainz\nartistas afines por sesiones"]
    LF["Last.fm\nsimilares + tags (con key)"]
    IMP["Importadores\nlinks públicos · archivos CSV/TSV · Shazam"]
    SP["Spotify Web API (PKCE)\nleer playlists completas · exportar"]
    YT["YouTube Data API\n(opcional, con key)"]
  end
  GW["Nodo gateway (por defecto)\n(worker/ · Cloudflare Worker)\n/read · /mb · /lb · /lastfm · caché"]
  UI --> INT --> GEN --> RANK --> UI
  RANK --> ENR --> UI
  PROF <--> UI
  PROF --> GEN
  GEN --> DZ & EN & LB & LF
  ENR --> MB
  IMP --> PROF
  UI --> SP
  SP --> IMP
  YT --> IMP
  UI -. "feedback · stats anónimas" .-> FB["Formspree / GitHub Issues\nGoatCounter (opcional)"]
  EN -. "r.jina.ai o GW" .-> GW
  IMP -. "r.jina.ai o GW" .-> GW
  MB -. "opcional" .-> GW
  LF --> GW
```

## Flujo de una búsqueda
1. **Intención** (`parseIntent`): mood/actividad, géneros (diccionario + ~6,300 géneros de Every Noise), artistas semilla (`como X`), canciones nuevas de un artista (`más de X`, `de mis artistas`), `desde mis shazams`, formato, época y región.
2. **Escenas** (`pickScenes`): géneros del prompt, géneros de tu perfil cuando no escribes nada y, si subes “qué tan nuevo”, géneros vecinos según Every Noise.
3. **Candidatos**, en paralelo:
   - Deezer: playlists por escena y artistas relacionados, a 1 y 2 pasos.
   - Every Noise: artistas de la escena, más profundos en la lista cuanto más nuevo pidas.
   - ListenBrainz y Last.fm: artistas afines a tus semillas.
   - Perfil: tus artistas o tus Shazams.
   - Deep cuts: canciones de álbumes de un artista que no tienes registradas.
4. **Filtro y ranking** (`rank`): descarta lo que ya conoces (artistas, canciones e IDs), puntúa por popularidad según la novedad pedida y penaliza las escenas repetidas.
5. **Cola** (`nextItems`): entrega 9 resultados (25 en formato playlist) y rellena para que cada ♡ / ✓ / ↻ reemplace la tarjeta en su lugar.
6. **Enriquecimiento** (`enrichTiles`): MusicBrainz agrega a cada artista géneros, país y año, con un límite de 1 petición por segundo y caché de 30 días.
7. **Salida**: playlists locales, exportar a Spotify o copiar a TuneMyMusic / Soundiiz.

## Importar playlists grandes
Las páginas públicas (embed de Spotify, playlist de YouTube, Apple Music) solo muestran ~100 canciones; el importador lo detecta (`truncated`) y avisa. Para leer completas:
- **Spotify Web API** (`Spotify.readPlaylist`, `Spotify.myPlaylists`): pagina `/me/playlists` y `/playlists/{id}/items` de 50 en 50. Requiere los scopes `playlist-read-*`; si el token no los tiene, el link público sigue como respaldo.
- **Archivo** (`parseFileTracks`): CSV de Exportify / TuneMyMusic / Soundiiz o TSV UTF‑16 de Apple Music. Detecta columnas de título y artista por nombre.
- **YouTube Data API** (`importYouTubeApi`): si `config.js → youtubeKey` existe, pagina `playlistItems`.

## Perfil público de Spotify (sin login)
`readSpotifyProfile` lee con el mismo lector público `open.spotify.com/user/{id}`, `/playlists` y `/recently-played-artists`: nombre, playlists públicas y, si el usuario los muestra, ~25 artistas recientes (se registran con peso 3). Cada playlist se importa con `importSpotify`, así que sin OAuth sigue el tope de ~100 canciones. No es público: a quién sigue, top artistas, canciones guardadas, playlists privadas ni historial. No se usan las APIs internas del reproductor web.

## Feedback y medición
`feedback.js` agrega el formulario de feedback (POST JSON a `config.js → feedbackUrl`, p. ej. Formspree; sin él abre un issue de GitHub prellenado), la nota de privacidad y estadísticas anónimas con GoatCounter (`config.js → goatcounter`): vistas por sección y eventos `buscar`, `importar-*`, `exportar-spotify`, `feedback`, `error`. Sin cookies.

## Nodo gateway (camino por defecto)
Cuando `config.js → apiBase` tiene la URL del Worker, **todas** las llamadas a Every Noise, `r.jina.ai` (playlists y perfiles), MusicBrainz, ListenBrainz y Last.fm pasan por él (`sources/net.js → viaGateway`):

| Ruta | Upstream | Caché edge |
|---|---|---|
| `GET /read?url=` | `r.jina.ai` (solo hosts permitidos) | Every Noise 7 días · playlists 30 min |
| `GET /mb/<path>` | MusicBrainz WS/2 con User-Agent `Orbita/1.0 ( repo )` | 30 días |
| `GET /lb/similar-artists?…` | ListenBrainz labs | 7 días |
| `GET /lastfm?method=…` | Last.fm con el secret `LASTFM_KEY` (métodos permitidos) | 1 día |
| `GET /health` | — | — |

- **Keys:** solo como secrets de Wrangler (`LASTFM_KEY`, opcional `JINA_KEY`). El cliente únicamente conoce `apiBase`.
- **Modo degradado:** si `apiBase` está vacío o el gateway no responde (error de red o respuesta sin cabecera `X-Gateway`), el cliente lo salta 5 minutos y llama directo a Every Noise vía `r.jina.ai`, MusicBrainz y ListenBrainz. Last.fm no tiene fallback (necesita la key). Un 5xx del upstream que llega con `X-Gateway` no marca el gateway como caído.
- **Reintentos:** `fetchRetry` reintenta errores de red y 429/502/503/504 con backoff exponencial + jitter (respeta `Retry-After`). El Worker también reintenta una vez 429/503 del upstream.

Deploy:
```bash
cd worker
npx wrangler login
npx wrangler deploy                      # imprime https://descubre-gateway.<tu-subdominio>.workers.dev
npx wrangler secret put LASTFM_KEY       # opcional
npx wrangler secret put JINA_KEY         # opcional, sube el límite de r.jina.ai
```
Después pon esa URL en `config.js → apiBase` y agrega tu dominio a `ALLOWED_ORIGINS` en `wrangler.toml` si no es `isaachanono.github.io`.

## Siguiente paso natural
Para sincronizar el perfil entre dispositivos hay que guardarlo en una base del gateway (D1/KV) con login. Hoy vive en `localStorage`; el respaldo JSON es la forma de moverlo entre dispositivos.
