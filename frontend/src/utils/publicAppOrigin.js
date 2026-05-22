/**
 * Origin used in QR links so phones can open the SPA (LAN IP or deployed URL).
 * Set VITE_PUBLIC_APP_ORIGIN when the API runs on a different host than the web app.
 */
export function getPublicAppOrigin() {
    const fromEnv = (import.meta.env.VITE_PUBLIC_APP_ORIGIN || '').trim().replace(/\/$/, '');
    if (typeof window !== 'undefined' && window.location?.origin) {
        if (fromEnv) return fromEnv;
        return window.location.origin;
    }
    return fromEnv || '';
}
