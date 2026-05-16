/**
 * Attach Entra ID token when available so requireResolvedUid can resolve req.uid.
 */
export async function getAuthHeaders(user) {
    const headers = {};
    if (user && typeof user.getIdToken === 'function') {
        try {
            const token = await user.getIdToken();
            if (token) headers.Authorization = `Bearer ${token}`;
        } catch (e) {
            console.warn('[apiAuth] getIdToken failed:', e?.message || e);
        }
    }
    return headers;
}

export async function fetchWithAuth(user, url, options = {}) {
    const authHeaders = await getAuthHeaders(user);
    return fetch(url, {
        ...options,
        headers: {
            ...authHeaders,
            ...(options.headers || {}),
        },
    });
}
