// Shared network helpers. If the optional gateway node is configured, page reads and keyed APIs go through it.
const CFG = window.DESCUBRE_CONFIG || {};
const apiBase = () => String(CFG.apiBase || '').replace(/\/+$/, '');
const readerUrl = url => apiBase() ? `${apiBase()}/read?url=${encodeURIComponent(url)}` : 'https://r.jina.ai/' + url;
