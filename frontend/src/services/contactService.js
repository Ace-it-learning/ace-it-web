const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * @param {{ enquiryType: string, message: string, language: string, replyEmail: string }} payload
 * @param {(() => Promise<string|undefined>)|null|undefined} getToken
 */
export async function submitContactEnquiry(payload, getToken) {
    const headers = { 'Content-Type': 'application/json' };
    if (typeof getToken === 'function') {
        try {
            const token = await getToken();
            if (token) headers.Authorization = `Bearer ${token}`;
        } catch {
            /* optional auth */
        }
    }
    const res = await fetch(`${API_URL}/api/contact`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
    });
    let data = {};
    try {
        data = await res.json();
    } catch {
        /* ignore */
    }
    if (!res.ok) {
        const err = new Error(data.error || 'Request failed');
        err.status = res.status;
        throw err;
    }
    return data;
}
