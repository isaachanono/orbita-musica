// Optional profile sync through the gateway (worker /sync/<id>), without accounts: an anonymous recovery code the user keeps.
// The code never leaves the browser. The server only sees id = SHA-256("orbita-id:" + code) and an AES-GCM blob
// encrypted with SHA-256("orbita-key:" + code). Without gateway nothing changes: local profile + JSON backup.
window.Sync = (() => {
  const KEY = 'descubre:sync', BK = 'descubre:backupAt', NUDGE = 'descubre:nudgeAt', DAY = 864e5;
  const st = Object.assign({ code: '', at: 0, dirty: false, err: '' }, store.get(KEY, {}));
  const save = () => store.set(KEY, st);
  let applying = false, timer = null, nudgeT = null;
  const norm = c => String(c || '').toUpperCase().replace(/[^0-9A-Z]/g, '');
  const ALPH = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
  function newCode() {
    const b = crypto.getRandomValues(new Uint8Array(15)); let bits = '', out = '';
    b.forEach(x => bits += x.toString(2).padStart(8, '0'));
    for (let i = 0; i < bits.length; i += 5) out += ALPH[parseInt(bits.slice(i, i + 5), 2)];
    return out.match(/.{4}/g).join('-');
  }
  const sha = s => crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  const hex = buf => [...new Uint8Array(buf)].map(x => x.toString(16).padStart(2, '0')).join('');
  const b64 = buf => { const u = new Uint8Array(buf); let s = ''; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode(...u.subarray(i, i + 0x8000)); return btoa(s); };
  const unb64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
  async function keys(code) {
    const n = norm(code);
    return { id: hex(await sha('orbita-id:' + n)), key: await crypto.subtle.importKey('raw', await sha('orbita-key:' + n), 'AES-GCM', false, ['encrypt', 'decrypt']) };
  }
  const url = id => `${apiBase()}/sync/${id}`;
  const available = () => !!apiBase() && !!crypto?.subtle;

  async function push() {
    if (!st.code || !available()) return;
    clearTimeout(timer);
    const { id, key } = await keys(st.code), t = Date.now(), iv = crypto.getRandomValues(new Uint8Array(12));
    persistLocal();
    const data = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(JSON.stringify(db)));
    try {
      const r = await fetchRetry(url(id), { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ t, iv: b64(iv), data: b64(data) }) });
      if (!r.ok) throw new Error('http ' + r.status);
      Object.assign(st, { at: t, dirty: false, err: '' });
    } catch (e) { st.err = 'No se pudo sincronizar; se reintentará con el próximo cambio.'; }
    save(); render();
  }
  async function pull(code = st.code) {
    const { id, key } = await keys(code);
    const r = await fetchRetry(url(id));
    if (r.status === 404) return null;
    if (!r.ok) throw new Error('http ' + r.status);
    const o = await r.json();
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(o.iv) }, key, unb64(o.data));
    return { t: o.t, profile: JSON.parse(new TextDecoder().decode(plain)) };
  }
  function apply(remote) {
    applying = true;
    try { applyProfile(remote.profile); } finally { applying = false; }
    Object.assign(st, { at: remote.t, dirty: false, err: '' }); save();
  }
  // Local snapshot without triggering another push.
  function persistLocal() { applying = true; try { persist(); } finally { applying = false; } }

  async function start() {
    render(); nudge();
    if (!st.code || !available()) return;
    try {
      const remote = await pull();
      if (remote && remote.t > st.at) {
        if (!st.dirty || confirm('Tu perfil cambió en otro dispositivo y también en este. ¿Usar el del otro dispositivo?\n\nAceptar: usar el sincronizado · Cancelar: conservar el de aquí y subirlo')) { apply(remote); toast('Perfil sincronizado'); }
        else await push();
      } else if (!remote || st.dirty) await push();
    } catch { st.err = 'No se pudo conectar con el servidor; tu perfil local sigue intacto.'; save(); render(); }
  }
  function changed() {
    clearTimeout(nudgeT); nudgeT = setTimeout(nudge, 500);
    if (applying || !st.code) return;
    st.dirty = true; save();
    clearTimeout(timer); timer = setTimeout(push, 4000);
  }
  async function enable() {
    st.code = newCode(); st.at = 0; st.dirty = true; save();
    await push(); render(true);
  }
  async function link(code) {
    if (norm(code).length !== 24) return toast('Ese código no parece válido (son 24 letras y números)');
    try {
      const remote = await pull(code);
      if (!remote) return toast('No encontré un perfil con ese código');
      if (Object.keys(db.artists).length && !confirm('Esto reemplaza el perfil de este navegador por el sincronizado. ¿Seguir?')) return;
      st.code = norm(code).match(/.{4}/g).join('-'); apply(remote); render(); toast('Perfil sincronizado');
    } catch { toast('No se pudo leer el perfil (¿código correcto? ¿hay conexión?)'); }
  }
  async function disable() {
    if (!confirm('¿Dejar de sincronizar este navegador? Tu perfil local se queda aquí.')) return;
    if (confirm('¿Borrar también la copia cifrada del servidor?')) { try { const { id } = await keys(st.code); await fetch(url(id), { method: 'DELETE' }); } catch {} }
    Object.assign(st, { code: '', at: 0, dirty: false, err: '' }); save(); render();
  }

  // Backup reminder: shown in Mis gustos (and as a toast at most once a week) if the profile has data and no recent backup.
  const backupAge = () => Date.now() - (+localStorage.getItem(BK) || 0);
  const needsBackup = () => !st.code && Object.keys(db.artists).length >= 5 && backupAge() > 14 * DAY;
  function nudge() {
    const box = $('#backupNudge'); if (!box) return;
    const last = +localStorage.getItem(BK) || 0;
    box.hidden = !needsBackup();
    $('#backupInfo').textContent = st.code ? 'Se sincroniza cifrado con el servidor de Órbita. El respaldo JSON sigue disponible.' :
      `Tus datos viven solo en este navegador. ${last ? 'Último respaldo: ' + new Date(last).toLocaleDateString('es-MX') + '.' : 'Aún no descargas ningún respaldo.'} Descárgalo de vez en cuando para no perderlos.`;
    if (needsBackup() && Date.now() - (+localStorage.getItem(NUDGE) || 0) > 7 * DAY) {
      localStorage.setItem(NUDGE, Date.now());
      setTimeout(() => toast('Tip: descarga un respaldo de tus gustos en Mis gustos → Respaldo'), 1500);
    }
  }
  const backedUp = () => { localStorage.setItem(BK, Date.now()); nudge(); };

  function render(showCode = false) {
    const box = $('#syncBox'); if (!box) return;
    if (!available()) { box.innerHTML = '<p class="hint">Sincronizar entre dispositivos necesita el servidor de Órbita, que no está configurado. Usa el respaldo JSON para pasar tus datos.</p>'; return; }
    if (!st.code) {
      box.innerHTML = `<h4>Sincronizar entre dispositivos</h4><p class="hint">Sin cuenta ni correo: te doy un código de recuperación. Tu perfil se sube cifrado y solo ese código lo abre; guárdalo, si lo pierdes no se puede recuperar.</p>
        <div class="actions left"><button class="btn primary" type="button" data-s="on">Activar sincronización</button></div>
        <form class="row-form" data-s="link" style="margin-top:10px"><input name="code" placeholder="¿Ya tienes un código? XXXX-XXXX-XXXX-XXXX-XXXX-XXXX" autocomplete="off"><button class="btn">Usar código</button></form>`;
    } else {
      box.innerHTML = `<h4>Sincronización activa</h4><p class="hint">Tu código de recuperación (úsalo en otro dispositivo en Mis gustos → Respaldo):</p>
        <p><code class="sync-code">${showCode ? esc(st.code) : esc(st.code.slice(0, 4)) + '-••••-••••-••••-••••-••••'}</code></p>
        <div class="actions left"><button class="btn" type="button" data-s="show">${showCode ? 'Ocultar' : 'Mostrar'} código</button><button class="btn" type="button" data-s="copy">Copiar código</button><button class="btn" type="button" data-s="now">Sincronizar ahora</button><button class="btn danger" type="button" data-s="off">Desactivar</button></div>
        <p class="hint">${st.err ? esc(st.err) : st.at ? 'Última sincronización: ' + esc(new Date(st.at).toLocaleString('es-MX')) : 'Pendiente de subir.'}</p>`;
    }
    box.onclick = e => {
      const k = e.target.closest('button[data-s]')?.dataset.s;
      if (k === 'on') enable();
      if (k === 'off') disable();
      if (k === 'now') push().then(() => toast(st.err ? 'No se pudo sincronizar' : 'Sincronizado'));
      if (k === 'show') render(!box.querySelector('.sync-code').textContent.includes(st.code));
      if (k === 'copy') navigator.clipboard?.writeText(st.code).then(() => toast('Código copiado'), () => render(true));
    };
    const f = box.querySelector('form[data-s=link]');
    if (f) f.onsubmit = e => { e.preventDefault(); link(f.code.value); };
  }

  // Deletes the encrypted server copy, if a code is set. Local keys are the caller's job.
  // Returns true when the remote copy is gone (or never existed); false when the DELETE failed —
  // the caller must keep the code or warn the user instead of stranding a reachable blob.
  async function wipeRemote() {
    if (!st.code) return true;
    if (!available()) return false; // gateway unreachable: can't confirm the remote copy is gone
    try { const { id } = await keys(st.code); return (await fetch(url(id), { method: 'DELETE' })).ok; } catch { return false; }
  }

  $('#exportData')?.addEventListener('click', backedUp);
  $('#backupNudge [data-backup]')?.addEventListener('click', () => $('#exportData').click());
  $('#backupNudge [data-later]')?.addEventListener('click', () => { localStorage.setItem(BK, Date.now() - 7 * DAY); nudge(); });
  start();
  return { changed, push, wipeRemote, status: () => ({ ...st, code: st.code ? 'set' : '' }) };
})();
