import { db } from '../firebase';
import {
    doc,
    getDoc,
    collection,
    query,
    orderBy,
    limit,
    getDocs
} from 'firebase/firestore';

/**
 * Fetches the user's micro-skill mastery levels.
 * @param {string} userId - User UID
 * @param {string} subject - Subject code (e.g., 'English')
 */
export const getUserMastery = async (userId, subject = 'english') => {
    try {
        const normalizedSubject = subject.toLowerCase();
        const docRef = doc(db, 'users', userId, 'progress', normalizedSubject);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data();
        }
        return {};
    } catch (error) {
        console.error("Error fetching user mastery:", error);
        return {};
    }
};

/**
 * Fetches the historical snapshots of user mastery.
 * @param {string} userId - User UID
 * @param {string} subject - Subject code (e.g., 'English')
 * @param {number} maxRecords - Maximum history records to fetch
 */
export const getMasteryHistory = async (userId, subject = 'english', maxRecords = 5) => {
    try {
        const normalizedSubject = subject.toLowerCase();
        const colRef = collection(db, 'users', userId, 'progress', normalizedSubject, 'history');
        const q = query(colRef, orderBy('timestamp', 'desc'), limit(maxRecords));
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error fetching mastery history:", error);
        return [];
    }
};
