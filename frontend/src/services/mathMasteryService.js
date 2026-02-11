/**
 * Math Mastery Service - API calls for Math Ability tracking
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const getMathMastery = async (uid) => {
    try {
        const res = await fetch(`${API_URL}/api/skillmap/maths?uid=${uid}`);
        if (!res.ok) throw new Error('Failed to fetch Math mastery');
        return await res.json();
    } catch (error) {
        console.error('[mathMasteryService] Error fetching Math mastery:', error);
        return null;
    }
};

export const getMathHistory = async (uid, limit = 5) => {
    try {
        const res = await fetch(`${API_URL}/api/skillmap/maths/history?uid=${uid}&limit=${limit}`);
        if (!res.ok) throw new Error('Failed to fetch Math history');
        return await res.json();
    } catch (error) {
        console.error('[mathMasteryService] Error fetching Math history:', error);
        return [];
    }
};
