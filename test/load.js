// The app ships classic <script> files that share the global scope (no build step, GitHub Pages).
// Tests run them in one vm context, in index.html order, and read the top-level bindings back.
import fs from 'node:fs';
import vm from 'node:vm';

export function loadClassic(files, names, globals = {}) {
  const ctx = vm.createContext({ console, ...globals });
  for (const f of files) vm.runInContext(fs.readFileSync(new URL('../' + f, import.meta.url), 'utf8'), ctx, { filename: f });
  return Object.fromEntries(names.map(n => [n, vm.runInContext(n, ctx)]));
}
