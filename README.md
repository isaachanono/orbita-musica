# Órbita

Descubre música nueva fuera del algoritmo: escribe tu mood, actividad, género o “parecido a…”, y Órbita te recomienda artistas, canciones, álbumes o playlists que todavía no conoces, a partir de tus gustos. Sin cuenta ni servidor.

- **Descubrir**: 9 opciones por búsqueda (25 en formato playlist). ♡ guardar, ✓ ya la conozco y ↻ otra opción reemplazan la tarjeta.
- **Mis gustos**: pega el link de tu perfil público de Spotify (lee tus artistas recientes y tus playlists públicas, sin login), importa links de Spotify, Apple Music, YouTube y Deezer, tus playlists completas de Spotify (conectando tu cuenta) o un archivo CSV/TXT exportado de cualquier servicio. También Shazam (vía “My Shazam Tracks”).
- **Mapa**: tus artistas y géneros como grafo conectado.
- **Playlists**: crea, edita y pásalas a Spotify (o cópialas a TuneMyMusic / Soundiiz).
- Todo se guarda en el navegador (`localStorage`), con respaldo descargable y sincronización cifrada opcional entre dispositivos mediante un código de recuperación (requiere el Worker con KV).

Arquitectura y flujo: [ARCHITECTURE.md](ARCHITECTURE.md).

## Publicar (GitHub Pages)

1. **Settings → Pages** → Source: *Deploy from a branch* → Branch `main`, carpeta `/ (root)` → Save. Queda en `https://isaachanono.github.io/orbita-musica/`.
2. **Spotify** (para conectar cuentas): en [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard) crea una app con Web API, Redirect URI `https://isaachanono.github.io/orbita-musica/` (y `http://127.0.0.1:8765/` para pruebas locales), y pon el Client ID en `config.js → spotifyClientId`. Detalles y límites en [Spotify: modo desarrollo y Extended Quota](#spotify-modo-desarrollo-y-extended-quota).
3. **Feedback** (recomendado): crea un formulario en [formspree.io](https://formspree.io) y pon su URL en `config.js → feedbackUrl`. Sin eso, el botón de feedback abre un issue de GitHub (requiere cuenta de GitHub).
4. **Estadísticas** (opcional): crea un sitio gratis en [goatcounter.com](https://www.goatcounter.com) y pon el código en `config.js → goatcounter`. Sin cookies ni datos personales.
5. **YouTube completo** (opcional): API key de YouTube Data API v3 en Google Cloud, restringida a tu dominio, en `config.js → youtubeKey`.

Nada de `config.js` es secreto (son IDs públicos de navegador).

## Spotify: modo desarrollo y Extended Quota

Órbita usa **Authorization Code + PKCE**: todo ocurre en el navegador y **no existe client secret** (no lo pongas en `config.js` ni en el Worker). El token se guarda en `localStorage` (`descubre:sp`), se refresca 60 s antes de expirar (un solo refresh compartido, porque Spotify rota el refresh token) y, si el refresh ya no es válido, se borra y la app pide reconectar. «Desconectar» borra los tokens y el verificador PKCE del navegador. Spotify no tiene endpoint para revocar tokens, así que para quitar el permiso por completo hay que ir a [spotify.com/account/apps](https://www.spotify.com/account/apps/).

**Modo desarrollo (el estado inicial de toda app):**
- Solo pueden conectarse la cuenta dueña (necesita Premium) y las cuentas que agregues en *Dashboard → tu app → User Management* (nombre + correo de su cuenta de Spotify). Hay un límite de usuarios; revisa el número vigente en el dashboard.
- Cualquier otra cuenta sí puede autorizar, pero luego la API responde `403 … user may not be registered`. Órbita lo detecta: borra la sesión y le explica a la persona que su cuenta no está habilitada y que puede importar con links o archivos.

**Para abrirlo a todo el público, pide Extended Quota:**
1. En el dashboard: tu app → *Extended Quota Mode* (o *Request extension*).
2. Llena el formulario: descripción de la app, cómo usa cada scope (`playlist-read-private`, `playlist-read-collaborative`, `playlist-modify-private`, `playlist-modify-public`), URL pública, política de privacidad (la de Órbita está en la app) y capturas o video del flujo de conectar, importar y exportar.
3. Cumple las [Developer Terms](https://developer.spotify.com/terms) y las [Design Guidelines](https://developer.spotify.com/documentation/design): logo y atribución de Spotify y links de vuelta a Spotify.
4. Spotify revisa manualmente. Sus criterios han cambiado; en 2025 anunció que solo acepta solicitudes de organizaciones establecidas. Revisa los requisitos vigentes en [Quota modes](https://developer.spotify.com/documentation/web-api/concepts/quota-modes) antes de aplicar.

Mientras tanto, para el público funcionan sin Spotify API: el perfil público, los links de playlists y los archivos CSV.

## Correr local

```bash
python3 -m http.server 8000
```
