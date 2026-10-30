// map.js and sync.js are classic/separate scripts that use these names as globals. ui.js imports this
// module first so they exist before its startup code renders a view (e.g. #mapa).
import { $, $$, K, esc, flag, icon, links, store, toast } from './util.js';
import { db, persist, applyProfile, tasteList } from './session.js';
import { resolveArtistId } from './ranking.js';
import { openDetail, discover, deepSearch } from './ui.js';

Object.assign(window, { $, $$, K, esc, flag, icon, links, store, toast, db, persist, applyProfile, tasteList, resolveArtistId, openDetail, discover, deepSearch });
