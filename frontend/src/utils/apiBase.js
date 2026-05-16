/**
 * API base for fetch URLs. In Vite dev with no VITE_API_URL, use '' so `/api/*` hits the dev proxy.
 */
export function getApiBase() {
    const raw = import.meta.env.VITE_API_URL;
    const trimmed = raw && String(raw).trim() ? String(raw).replace(/\/$/, '') : '';
    if (import.meta.env.DEV && !trimmed) {
        return '';
    }
    return trimmed || 'http://localhost:3001';
}

export function apiUrl(path) {
    const base = getApiBase();
    const p = path.startsWith('/') ? path : `/${path}`;
    return base ? `${base}${p}` : p;
}
