# Órbita

Descubre música nueva fuera del algoritmo: escribe tu mood, actividad, género o “parecido a…”, y Órbita te recomienda artistas, canciones, álbumes o playlists que todavía no conoces, a partir de tus gustos. Sin cuenta ni servidor.

- **Descubrir**: 9 opciones por búsqueda (25 en formato playlist). ♡ guardar, ✓ ya la conozco y ↻ otra opción reemplazan la tarjeta.
- **Mis gustos**: pega el link de tu perfil público de Spotify (lee tus artistas recientes y tus playlists públicas, sin login), importa links de Spotify, Apple Music, YouTube y Deezer, tus playlists completas de Spotify (conectando tu cuenta) o un archivo CSV/TXT exportado de cualquier servicio. También Shazam (vía “My Shazam Tracks”).
- **Mapa**: tus artistas y géneros como grafo conectado.
- **Playlists**: crea, edita y pásalas a Spotify (o cópialas a TuneMyMusic / Soundiiz).
- Todo se guarda en el navegador (`localStorage`), con respaldo descargable y sincronización cifrada opcional entre dispositivos mediante un código de recuperación (requiere el Worker con KV).

Arquitectura y flujo: [ARCHITECTURE.md](ARCHITECTURE.md).

## Publicar (GitHub Pages)

1. **Settings → Pages** → Source: *Deploy from a branch* → Branch `main`, carpeta `/ (root)` → Save. Queda en `https://isaachanono.github.io/descubre-musica/`.
2. **Spotify** (para conectar cuentas): en [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard) crea una app con Web API, Redirect URI `https://isaachanono.github.io/descubre-musica/`, y pon el Client ID en `config.js → spotifyClientId`. En modo desarrollo solo funciona para la cuenta dueña (con Premium) y los usuarios que agregues en *User Management*; para abrirlo a todos hay que pedir *Extended Quota* a Spotify. Mientras, el público puede usar links y archivos.
3. **Feedback** (recomendado): crea un formulario en [formspree.io](https://formspree.io) y pon su URL en `config.js → feedbackUrl`. Sin eso, el botón de feedback abre un issue de GitHub (requiere cuenta de GitHub).
4. **Estadísticas** (opcional): crea un sitio gratis en [goatcounter.com](https://www.goatcounter.com) y pon el código en `config.js → goatcounter`. Sin cookies ni datos personales.
5. **YouTube completo** (opcional): API key de YouTube Data API v3 en Google Cloud, restringida a tu dominio, en `config.js → youtubeKey`.

Nada de `config.js` es secreto (son IDs públicos de navegador).

## Correr local

```bash
python3 -m http.server 8000
```
