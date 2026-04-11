const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Fetches the user's micro-skill mastery levels.
 * @param {string} userId - User UID
 * @param {string} subject - Subject code (e.g., 'english')
 */
export const getUserMastery = async (userId, subject = 'english') => {
    if (!userId || userId === 'guest') return {};
    try {
        const normalizedSubject = subject.toLowerCase();
        const res = await fetch(`${API_URL}/api/skillmap?uid=${userId}&subject=${normalizedSubject}`);
        if (!res.ok) throw new Error(`Failed to fetch ${subject} mastery`);
        return await res.json();
    } catch (error) {
        console.error(`[masteryService] Error fetching ${subject} mastery:`, error);
        return {};
    }
};

/**
 * Fetches the historical snapshots of user mastery.
 * @param {string} userId - User UID
 * @param {string} subject - Subject code (e.g., 'english')
 * @param {number} maxRecords - Maximum history records to fetch
 */
export const getMasteryHistory = async (userId, subject = 'english', maxRecords = 5) => {
    if (!userId || userId === 'guest') return [];
    try {
        const normalizedSubject = subject.toLowerCase();
        const res = await fetch(`${API_URL}/api/skillmap/${normalizedSubject}/history?uid=${userId}&limit=${maxRecords}`);
        if (!res.ok) throw new Error(`Failed to fetch ${subject} history`);
        return await res.json();
    } catch (error) {
        console.error(`[masteryService] Error fetching ${subject} history:`, error);
        return [];
    }
};
