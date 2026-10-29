# Descubre

App web para descubrir música nueva con un prompt (mood, actividad, género o “parecido a…”), basada en tus gustos.

- **Descubrir**: 9 opciones por búsqueda (canciones, artistas, álbumes) o un borrador de playlist de 25. Si guardas (♡) o marcas “ya la conozco” (✓), esa opción se reemplaza por otra; ↻ pide otra sin marcar nada.
- **Mis gustos**: importa links públicos de Spotify, Apple Music, YouTube / YouTube Music y Deezer (playlists, álbumes, artistas), pega una lista o agrega artistas. Lo importado no se vuelve a recomendar y guía las recomendaciones (“Usar mis gustos”).
- **Playlists**: crea, renombra, reordena y quita canciones; “Sugerir canciones” propone temas que van con la playlist. Exporta/copia para pasarla a tu servicio con TuneMyMusic o Soundiiz.
- Todo se guarda en `localStorage`; hay respaldo descargable en Mis gustos.

## Cómo funciona

- Sitio estático, sin login ni backend.
- Catálogo, artistas relacionados y previews de 30 s: API pública de Deezer vía JSONP (`app.js`).
- Interpretación del prompt: diccionarios de moods/actividades/géneros (`engine.js`).
- Importación de links: Deezer por API; Spotify (página embed), Apple Music y YouTube se leen como página pública a través de `r.jina.ai` (`import.js`). Si ese lector falla o limita, usa “Pegar lista”.

## Correr local

```bash
python3 -m http.server 8000
```
