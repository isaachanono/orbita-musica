// Feedback form, privacy note and optional anonymous usage stats (GoatCounter: no cookies, no personal data).
// Stats and the form endpoint stay off until they are set in config.js.
const Telemetry = (() => {
  const C = window.DESCUBRE_CONFIG || {};
  const REPO = 'https://github.com/isaachanono/orbita-musica';
  const q = s => document.querySelector(s);
  const gc = o => { try { window.goatcounter?.count?.(o); } catch { /* stats are best-effort */ } };
  const view = () => gc({ path: location.pathname + (location.hash.split('/')[0] || '#descubrir') });
  const ev = (name, title) => gc({ path: 'evento-' + name, title: title || name, event: true });
  if (/^[a-z0-9-]+$/i.test(C.goatcounter || '') && !/^(localhost|127\.|0\.0\.0\.0)/.test(location.hostname)) {
    const s = document.createElement('script');
    s.async = true; s.src = 'https://gc.zgo.at/count.js';
    s.dataset.goatcounter = `https://${C.goatcounter}.goatcounter.com/count`;
    s.dataset.goatcounterSettings = JSON.stringify({ no_onload: true });
    s.onload = view;
    document.head.appendChild(s);
    addEventListener('hashchange', view);
  }
  // Source failures (see reportFail in sources/net.js): one event per source+kind per visit, max 15.
  const failed = new Set();
  addEventListener('source-fail', e => {
    const { source, kind } = e.detail || {}, k = `${source}:${kind}`;
    if (!/^[a-z-]+$/.test(source || '') || !/^[a-z0-9-]+$/.test(kind || '') || failed.has(k) || failed.size >= 15) return;
    failed.add(k); ev('fuente-fallo-' + source, kind);
  });
  let errs = 0;
  // Only the error type: messages can contain playlist names or URLs.
  const err = m => { if (errs++ < 5) ev('error', /^[A-Za-z]*Error$/.test(m) ? m : 'Error'); };
  addEventListener('error', e => err(e.error?.name));
  addEventListener('unhandledrejection', e => err(e.reason?.name));

  document.addEventListener('click', e => {
    const o = e.target.closest('[data-open]');
    if (!o) return;
    e.preventDefault();
    q(o.dataset.open)?.showModal();
  });
  document.querySelectorAll('dialog.dlg').forEach(d => d.addEventListener('click', e => { if (e.target === d) d.close(); }));

  const form = q('#fbForm');
  const context = () => {
    let db = {};
    try { db = JSON.parse(localStorage.getItem('descubre:v2')) || {}; } catch { /* empty profile */ }
    return {
      seccion: location.hash || '#descubrir',
      artistas: Object.keys(db.artists || {}).length,
      fuentes: (db.sources || []).length,
      playlists: (db.playlists || []).length,
      pantalla: `${innerWidth}x${innerHeight}`,
      navegador: navigator.userAgent,
    };
  };
  form.onsubmit = async e => {
    if (e.submitter?.value === 'cancel') return;
    e.preventDefault();
    const data = {
      calificacion: form.querySelector('input[name=fbRate]:checked')?.value || '',
      mensaje: q('#fbMsg').value.trim(),
      email: q('#fbEmail').value.trim(),
      ...(q('#fbCtx').checked ? context() : {}),
    };
    if (!data.mensaje) return;
    const stat = q('#fbStatus'), send = q('#fbSend');
    const done = () => { ev('feedback', data.calificacion); form.reset(); stat.textContent = ''; q('#fbDialog').close(); window.toast?.('¡Gracias por tu feedback!'); };
    if (!C.feedbackUrl) {
      const body = Object.entries(data).map(([k, v]) => `**${k}:** ${v}`).join('\n');
      open(`${REPO}/issues/new?` + new URLSearchParams({ title: `Feedback: ${data.calificacion || 'sin calificación'}`, body }), '_blank', 'noopener');
      return done();
    }
    send.disabled = true; stat.textContent = 'Enviando…';
    try {
      const r = await fetch(C.feedbackUrl, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) });
      if (!r.ok) throw new Error(r.status);
      done();
    } catch { stat.textContent = 'No se pudo enviar. Revisa tu conexión e intenta otra vez.'; }
    finally { send.disabled = false; }
  };
  return { ev };
})();
