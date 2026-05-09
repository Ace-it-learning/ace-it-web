const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Adds an item to the user's notebook.
 * @param {string} userId - User UID
 * @param {object} item - { term, context, note, type, source }
 * Types: 'vocabulary', 'mistake', 'golden_nugget', 'pattern'
 */
export const addToNotebook = async (userId, item) => {
    try {
        const response = await fetch(`${API_URL}/api/data/notebook/${encodeURIComponent(userId)}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...item,
                reviewStatus: 'new'
            })
        });
        if (!response.ok) throw new Error('Failed to add notebook item');
        const data = await response.json();
        return data.id;
    } catch (error) {
        console.error("Error adding to notebook:", error);
        throw error;
    }
};

/**
 * Fetches notebook items for a user.
 */
export const getNotebookItems = async (userId) => {
    try {
        const response = await fetch(`${API_URL}/api/data/notebook/${encodeURIComponent(userId)}`);
        if (!response.ok) throw new Error('Failed to fetch notebook');
        return await response.json();
    } catch (error) {
        console.error("Error fetching notebook:", error);
        return [];
    }
};

export const deleteNotebookItem = async (userId, itemId) => {
    try {
        const response = await fetch(`${API_URL}/api/data/notebook/${encodeURIComponent(userId)}/${encodeURIComponent(itemId)}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete notebook item');
    } catch (error) {
        console.error("Error deleting item:", error);
        throw error;
    }
};

export const updateReviewStatus = async (userId, itemId, status) => {
    try {
        const response = await fetch(`${API_URL}/api/data/notebook/${encodeURIComponent(userId)}/${encodeURIComponent(itemId)}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reviewStatus: status })
        });
        if (!response.ok) throw new Error('Failed to update notebook item');
    } catch (error) {
        console.error("Error updating status:", error);
        throw error;
    }
};
