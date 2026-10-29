# Descubre

Web app estática para descubrir música nueva a partir de un prompt (mood, actividad, género o "como <artista>"). No requiere login ni backend: usa la API pública de Deezer (JSONP) para el catálogo, artistas relacionados y previews de 30 s, y genera links de búsqueda para Spotify, Apple Music, YouTube Music y Amazon Music.

- `engine.js`: parser de intención (moods/actividades → géneros, detección de artistas, formato, época, región) y mapa de géneros vecinos para el control de novedad.
- `app.js`: consultas a Deezer, ranking por novedad/diversidad, UI y guardados en `localStorage`.

Correr local: `python3 -m http.server 8000` y abrir http://localhost:8000
