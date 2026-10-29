// "Mapa": your personal music map. Nodes are your artists and their genres. Edges mean something:
// artist → genre (MusicBrainz), genre ↔ genre (Every Noise "sounds similar" or shared artists),
// artist ↔ artist (Deezer related, or "discovered via"). New artists/genres appear as you discover them.
const MapView = (() => {
  const REL_KEY = 'descubre:rel';
  let svg, gAll, gLinks, gNodes, zoom, sim, nodes = [], links = [], mode = 'both', selId = null, open_ = false, enriching = false, seenAt = 0;
  const hue = s => { let h = 7; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) % 360; return h; };
  const gColor = g => `hsl(${hue(g)} 72% 62%)`;
  const genresOf = e => (e.genres?.length ? e.genres : MB.peek(e.name)?.genres || []).slice(0, 3);
  const radius = n => n.type === 'genre' ? 11 + Math.sqrt(n.w) * 2.6 : 4 + Math.min(14, Math.sqrt(n.w) * 2);
  const linkKey = l => [l.source.id || l.source, l.target.id || l.target].sort().join('|');

  function build() {
    const arts = tasteList().slice(0, 70);
    const N = new Map(), L = new Map();
    const add = (id, o) => N.get(id) || N.set(id, { id, ...o }).get(id);
    const link = (a, b, kind, why) => { if (a === b || !N.has(a) || !N.has(b)) return; const k = [a, b].sort().join('|'); if (!L.has(k)) L.set(k, { source: a, target: b, kind, why }); };
    const gw = {}, members = {};
    for (const e of arts) genresOf(e).forEach((g, i) => { gw[g] = (gw[g] || 0) + Math.min(8, e.n) * (i ? 0.5 : 1); (members[g] = members[g] || []).push(e.name); });
    const genres = Object.keys(gw).sort((a, b) => gw[b] - gw[a]).slice(0, mode === 'genres' ? 60 : 30);
    const gset = new Set(genres);
    const fresh = e => e.first && Date.now() - e.first < 7 * 864e5;
    if (mode !== 'genres') for (const e of arts) {
      const g0 = genresOf(e).find(g => gset.has(g)) || genresOf(e)[0];
      add('a:' + K(e.name), { type: 'artist', label: e.name, w: e.n, e, g0, color: g0 ? gColor(g0) : 'var(--mut)', fresh: fresh(e), born: seenAt && e.first > seenAt });
    }
    if (mode !== 'artists') for (const g of genres) {
      const firstSeen = Math.min(...arts.filter(e => genresOf(e).includes(g)).map(e => e.first || 0));
      add('g:' + g, { type: 'genre', label: g, w: gw[g], color: gColor(g), members: members[g], born: seenAt && firstSeen > seenAt });
    }
    if (mode === 'both') for (const e of arts) genresOf(e).filter(g => gset.has(g)).slice(0, 2).forEach(g => link('a:' + K(e.name), 'g:' + g, 'genre', `${e.name} se clasifica como ${g}`));
    if (mode !== 'artists') {
      for (const g of genres) (EN_SIMILAR[enFind(g)?.g] || []).forEach(h => gset.has(h) && link('g:' + g, 'g:' + h, 'en', `Every Noise: ${g} suena parecido a ${h}`));
      for (let i = 0; i < genres.length; i++) for (let j = i + 1; j < genres.length; j++) {
        const a = genres[i], b = genres[j], shared = members[a].filter(x => members[b].includes(x));
        if (shared.length >= 2) link('g:' + a, 'g:' + b, 'share', `${shared.length} de tus artistas son ${a} y ${b} (${shared.slice(0, 3).join(', ')})`);
      }
    }
    if (mode !== 'genres') {
      const R = store.get(REL_KEY, {}), byId = new Map(arts.filter(e => e.id > 0).map(e => [String(e.id), e]));
      for (const e of arts) {
        (R[e.id] || []).forEach(id => { const o = byId.get(String(id)); if (o) link('a:' + K(e.name), 'a:' + K(o.name), 'rel', `Deezer: ${e.name} y ${o.name} son artistas relacionados`); });
        if (e.via) link('a:' + K(e.name), 'a:' + K(e.via), 'via', `Descubriste a ${e.name} a partir de ${e.via}`);
      }
      if (mode === 'artists') {
        const hub = {};
        for (const n of [...N.values()].filter(n => n.g0).sort((a, b) => b.w - a.w)) hub[n.g0] ? link(n.id, hub[n.g0], 'share', `Ambos son ${n.g0}`) : (hub[n.g0] = n.id);
      }
    }
    return { nodes: [...N.values()], links: [...L.values()] };
  }

  function setup() {
    svg = d3.select('#mapSvg');
    gAll = svg.append('g'); gLinks = gAll.append('g'); gNodes = gAll.append('g');
    zoom = d3.zoom().scaleExtent([0.25, 4]).on('zoom', ev => gAll.attr('transform', ev.transform));
    svg.call(zoom).on('dblclick.zoom', null);
    svg.on('click', ev => { if (ev.target === svg.node()) select(null); });
    sim = d3.forceSimulation()
      .force('link', d3.forceLink().id(d => d.id).distance(l => l.kind === 'genre' ? 60 : l.kind === 'via' ? 50 : l.kind === 'rel' ? 70 : 110).strength(l => l.kind === 'genre' ? 0.7 : l.kind === 'share' ? 0.15 : 0.35))
      .force('charge', d3.forceManyBody().strength(n => n.type === 'genre' ? -380 : -90))
      .force('collide', d3.forceCollide().radius(n => radius(n) + 5))
      .force('x', d3.forceX().strength(0.04)).force('y', d3.forceY().strength(0.06))
      .on('tick', () => {
        gLinks.selectAll('line').attr('x1', d => d.source.x).attr('y1', d => d.source.y).attr('x2', d => d.target.x).attr('y2', d => d.target.y);
        gNodes.selectAll('g.mn').attr('transform', d => `translate(${d.x},${d.y})`);
      });
    $$('input[name=mapMode]').forEach(r => r.onchange = () => { mode = r.value; select(null); render(true); fitSoon(); });
    $('#mapFit').onclick = fit;
    addEventListener('resize', () => open_ && size());
  }
  const size = () => { const r = $('#mapSvg').getBoundingClientRect(); svg.attr('viewBox', [-r.width / 2, -r.height / 2, r.width, r.height]); };

  function render(reset = false) {
    const g = build(), old = new Map(nodes.map(n => [n.id, n]));
    $('#mapEmpty').hidden = g.nodes.length > 0;
    let added = 0;
    nodes = g.nodes.map(n => { const o = old.get(n.id); if (o && !reset) Object.assign(n, { x: o.x, y: o.y, vx: o.vx, vy: o.vy }); else if (old.size && !reset) { added++; n.born = true; const nb = g.links.find(l => l.source === n.id || l.target === n.id); const p = nb && old.get(nb.source === n.id ? nb.target : nb.source); if (p) Object.assign(n, { x: p.x + (Math.random() - 0.5) * 30, y: p.y + (Math.random() - 0.5) * 30 }); } return n; });
    links = g.links;
    gLinks.selectAll('line').data(links, linkKey).join('line').attr('class', d => 'ml ' + d.kind).selectAll('title').data(d => [d]).join('title').text(d => d.why);
    const sel = gNodes.selectAll('g.mn').data(nodes, d => d.id).join(enter => {
      const el = enter.append('g');
      el.append('circle').attr('class', 'ring');
      el.append('circle').attr('class', 'core');
      el.append('text').attr('text-anchor', 'middle');
      el.call(d3.drag().on('start', (ev, d) => { if (!ev.active) sim.alphaTarget(0.25).restart(); d.fx = d.x; d.fy = d.y; })
        .on('drag', (ev, d) => { d.fx = ev.x; d.fy = ev.y; }).on('end', (ev, d) => { if (!ev.active) sim.alphaTarget(0); d.fx = d.fy = null; }));
      el.on('click', (ev, d) => { ev.stopPropagation(); select(d.id); });
      return el;
    });
    sel.attr('class', d => `mn ${d.type}${d.fresh ? ' fresh' : ''}${d.born ? ' born' : ''}${d.type === 'artist' && radius(d) > 9 ? ' big' : ''}`);
    sel.select('circle.core').attr('r', radius).attr('fill', d => d.color);
    sel.select('circle.ring').attr('r', d => d.fresh ? radius(d) + 5 : 0);
    sel.select('text').attr('dy', d => radius(d) + 13).text(d => d.label);
    sim.nodes(nodes); sim.force('link').links(links);
    sim.alpha(reset || !old.size ? 1 : added ? 0.5 : 0.15).restart();
    $('#mapStatus').textContent = `${nodes.filter(n => n.type === 'genre').length} géneros · ${nodes.filter(n => n.type === 'artist').length} artistas · ${links.length} conexiones`;
    if (selId) select(selId);
  }

  function select(id) {
    selId = id && nodes.some(n => n.id === id) ? id : null;
    const nb = new Set(), hl = new Set();
    if (selId) links.forEach(l => { const a = l.source.id, b = l.target.id; if (a === selId || b === selId) { nb.add(a); nb.add(b); hl.add(l); } });
    $('#mapSvg').classList.toggle('dim', !!selId);
    gNodes.selectAll('g.mn').classed('sel', d => d.id === selId).classed('nb', d => nb.has(d.id) && d.id !== selId);
    gLinks.selectAll('line').classed('hl', d => hl.has(d));
    info(selId ? nodes.find(n => n.id === selId) : null, [...hl]);
  }

  function info(n, ls) {
    const box = $('#mapInfo');
    if (!n) { box.hidden = true; return; }
    const other = l => (l.source.id === n.id ? l.target : l.source);
    const list = (kind, label) => { const xs = ls.filter(l => kind.includes(l.kind)).map(other); return xs.length ? `<p><b>${label}:</b> ${xs.slice(0, 8).map(o => `<a href="#mapa" data-go="${esc(o.id)}">${esc(o.label)}</a>`).join(', ')}</p>` : ''; };
    if (n.type === 'artist') {
      const e = n.e, mb = MB.peek(e.name) || {};
      box.innerHTML = `<button class="icon-btn x" data-x title="Cerrar">${icon('x')}</button><div class="kind">Artista${n.fresh ? ' · nuevo' : ''}</div><h3>${esc(e.name)}</h3>
        <div class="facts">${genresOf(e).map(g => `<span class="chip g">${esc(g)}</span>`).join('')}${mb.country ? `<span class="chip">${flag(mb.country)} ${esc(mb.area || mb.country)}</span>` : ''}${mb.begin ? `<span class="chip">desde ${esc(mb.begin)}</span>` : ''}</div>
        <p><b>Peso en tus gustos:</b> ${Math.round(e.n)} · <b>fuentes:</b> ${e.srcs.length}${e.first ? ` · <b>agregado:</b> ${new Date(e.first).toLocaleDateString()}` : ''}</p>
        ${e.via ? `<p><b>Lo descubriste por:</b> ${esc(e.via)}</p>` : ''}${list(['rel'], 'Relacionado con')}${list(['genre'], 'Géneros')}
        <div class="actions"><button class="btn primary" data-q="más de ${esc(e.name)}">Canciones que no conozco</button><button class="btn" data-q="artistas nuevos como ${esc(e.name)}">Artistas parecidos</button></div>`;
    } else {
      box.innerHTML = `<button class="icon-btn x" data-x title="Cerrar">${icon('x')}</button><div class="kind">Género</div><h3>${esc(n.label)}</h3>
        <p><b>${n.members.length} de tus artistas:</b> ${n.members.slice(0, 10).map(esc).join(', ')}${n.members.length > 10 ? '…' : ''}</p>
        ${list(['en'], 'Suena parecido a (Every Noise)')}${list(['share'], 'Comparte artistas con')}
        ${(() => { const near = (EN_SIMILAR[enFind(n.label)?.g] || []).filter(h => !nodes.some(o => o.id === 'g:' + h)).slice(0, 5); return near.length ? `<p><b>Vecinos por descubrir:</b> ${near.map(h => `<a href="#descubrir" data-q="${esc(h)}">${esc(h)}</a>`).join(', ')}</p>` : ''; })()}
        <div class="actions"><button class="btn primary" data-q="${esc(n.label)}">Explorar ${esc(n.label)}</button></div>`;
    }
    box.hidden = false;
    box.querySelector('[data-x]').onclick = () => select(null);
    box.querySelectorAll('[data-go]').forEach(a => a.onclick = ev => { ev.preventDefault(); select(a.dataset.go); });
    box.querySelectorAll('[data-q]').forEach(b => b.onclick = ev => { ev.preventDefault(); deepSearch(b.dataset.q); });
  }

  function fit() {
    if (!nodes.length) return;
    const r = $('#mapSvg').getBoundingClientRect(), xs = nodes.map(n => n.x), ys = nodes.map(n => n.y);
    const w = Math.max(...xs) - Math.min(...xs) + 120, h = Math.max(...ys) - Math.min(...ys) + 120;
    const k = Math.min(2, Math.max(0.3, Math.min(r.width / w, r.height / h)));
    const cx = (Math.max(...xs) + Math.min(...xs)) / 2, cy = (Math.max(...ys) + Math.min(...ys)) / 2;
    svg.transition().duration(500).call(zoom.transform, d3.zoomIdentity.scale(k).translate(-cx, -cy));
  }
  const fitSoon = () => setTimeout(() => open_ && fit(), 1600);

  // Fill in genres (MusicBrainz) and related artists (Deezer) in the background; the map grows as data arrives.
  async function enrich() {
    if (enriching) return; enriching = true;
    try {
      const todo = tasteList().slice(0, 60).filter(e => !e.genres && MB.peek(e.name) === undefined);
      let i = 0;
      for (const e of todo) {
        if (!open_) break;
        $('#mapStatus').textContent = `Clasificando artistas con MusicBrainz… ${++i}/${todo.length}`;
        const mb = await MB.artist(e.name).catch(() => undefined);
        if (mb === undefined) continue;
        e.genres = mb?.genres || [];
        if (i % 3 === 0 || i === todo.length) { persist(); render(); }
      }
      const R = store.get(REL_KEY, {});
      for (const e of tasteList().slice(0, 40)) {
        if (!open_) break;
        if (!(e.id > 0)) await resolveArtistId(e).catch(() => null);
        if (!(e.id > 0) || R[e.id]) continue;
        const d = await dz(`/artist/${e.id}/related`, { limit: 30 }).catch(() => null);
        if (!d) continue;
        R[e.id] = (d.data || []).map(a => a.id);
        try { store.set(REL_KEY, R); } catch {}
      }
      persist(); if (open_) render();
    } finally { enriching = false; }
  }

  return {
    open() {
      if (!svg) setup();
      open_ = true; size();
      seenAt = db.prefs.mapSeen || 0;
      render(!nodes.length); fitSoon();
      db.prefs.mapSeen = Date.now(); persist();
      enrich();
    },
    close() { open_ = false; },
    refresh() { if (open_) render(); },
  };
})();
