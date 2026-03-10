import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';

/**
 * Adds an item to the user's notebook.
 * @param {string} userId - User UID
 * @param {object} item - { term, context, note, type, source }
 * Types: 'vocabulary', 'mistake', 'golden_nugget', 'pattern'
 */
export const addToNotebook = async (userId, item) => {
    try {
        const colRef = collection(db, 'users', userId, 'notebook');
        const docRef = await addDoc(colRef, {
            ...item,
            reviewStatus: 'new', // new, learning, mastered
            timestamp: serverTimestamp()
        });
        return docRef.id;
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
        const colRef = collection(db, 'users', userId, 'notebook');
        const q = query(colRef, orderBy('timestamp', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
        console.error("Error fetching notebook:", error);
        return [];
    }
};

export const deleteNotebookItem = async (userId, itemId) => {
    try {
        await deleteDoc(doc(db, 'users', userId, 'notebook', itemId));
    } catch (error) {
        console.error("Error deleting item:", error);
        throw error;
    }
};

export const updateReviewStatus = async (userId, itemId, status) => {
    try {
        await updateDoc(doc(db, 'users', userId, 'notebook', itemId), {
            reviewStatus: status
        });
    } catch (error) {
        console.error("Error updating status:", error);
        throw error;
    }
};
