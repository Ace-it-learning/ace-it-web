const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Fetches all JUPAS programmes (optionally filtered by university).
 * @param {string} university - Optional university name filter
 */
export const getJupasProgrammes = async (university = null) => {
    try {
        const url = university
            ? `${API_URL}/api/jupas/programmes?university=${encodeURIComponent(university)}`
            : `${API_URL}/api/jupas/programmes`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch JUPAS programmes');
        const data = await res.json();
        return data.programmes || [];
    } catch (error) {
        console.error('[jupasService] Error fetching programmes:', error);
        return [];
    }
};

/**
 * Fetches a single JUPAS programme by code.
 * @param {string} code - JUPAS programme code (e.g., 'JS6456')
 */
export const getJupasProgramme = async (code) => {
    try {
        const res = await fetch(`${API_URL}/api/jupas/programmes/${code}`);
        if (!res.ok) throw new Error(`Failed to fetch programme ${code}`);
        const data = await res.json();
        return data.programme || null;
    } catch (error) {
        console.error(`[jupasService] Error fetching programme ${code}:`, error);
        return null;
    }
};

/**
 * Fetches detailed content for a JUPAS programme.
 * @param {string} code - JUPAS programme code
 */
export const getJupasProgrammeDetails = async (code) => {
    try {
        const res = await fetch(`${API_URL}/api/jupas/programmes/${code}/details`);
        if (!res.ok) throw new Error(`Failed to fetch details for ${code}`);
        const data = await res.json();
        return {
            programme: data.programme || null,
            details: data.details || null
        };
    } catch (error) {
        console.error(`[jupasService] Error fetching details for ${code}:`, error);
        return { programme: null, details: null };
    }
};
