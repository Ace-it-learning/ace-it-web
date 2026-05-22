/**
 * API base for fetch URLs. In Vite dev with no VITE_API_URL, use '' so `/api/*` hits the dev proxy.
 *
 * When you open the app via a LAN IP (e.g. http://192.168.x.x:3005 for phone testing), forcing
 * requests to `VITE_API_URL=http://localhost:3001` is cross-origin and often breaks (EventSource + fetch).
 * In that case we prefer same-origin `/api` so the Vite proxy reaches the backend.
 */
export function getApiBase() {
    const raw = import.meta.env.VITE_API_URL;
    const trimmed = raw && String(raw).trim() ? String(raw).replace(/\/$/, '') : '';
    if (import.meta.env.DEV && typeof window !== 'undefined' && window.location?.hostname) {
        const h = window.location.hostname;
        if (h !== '127.0.0.1' && h !== 'localhost') {
            return '';
        }
    }
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
