const admin = require('firebase-admin');
const db = admin.firestore();

class PersonalizedQuestService {
    /**
     * Get personalized quests for a student.
     * Logic: 4 English Cards, 2 Maths Cards.
     * Priority: Weakest topics (tags/mastery) + Adaptive Level.
     */
    async getPersonalizedBatch(uid) {
        try {
            // 1. Get Student Progress
            const skillmapRef = db.collection('skillmap').doc(uid);
            const doc = await skillmapRef.get();
            const skillData = doc.exists ? doc.data() : { microSkills: {}, weaknesses: [] };

            // 2. Identify Target Topics (Simplistic for now: lowest levels)
            const englishTargets = this._getTargetTopics(skillData.microSkills, 'english', 4);
            const mathTargets = this._getTargetTopics(skillData.microSkills, 'maths', 2);

            // 3. Fetch from Question Bank
            const quests = [];

            // English Quests
            for (const topic of englishTargets) {
                const q = await this._fetchBestQuestion('English', topic, skillData.microSkills[topic]?.level || 0);
                if (q) quests.push({ ...q, category: 'Personalized' });
            }

            // Math Quests
            for (const topic of mathTargets) {
                const q = await this._fetchBestQuestion('Maths', topic, skillData.microSkills[topic]?.level || 0);
                if (q) quests.push({ ...q, category: 'Personalized' });
            }

            return quests;
        } catch (error) {
            console.error('Error in PersonalizedQuestService:', error);
            throw error;
        }
    }

    _getTargetTopics(skills, subject, count) {
        // Filter skills by subject and sort by level (ascending)
        const candidates = Object.entries(skills)
            .filter(([id]) => id.startsWith(subject))
            .sort((a, b) => (a[1].level || 0) - (b[1].level || 0));

        return candidates.slice(0, count).map(c => c[0]);
    }

    async _fetchBestQuestion(subject, topic, level) {
        // Simple adaptive level selection
        const syllabusLayer = level <= 3 ? 'Foundational' : 'DSE Level';

        // Query question_bank
        const snap = await db.collection('question_bank')
            .where('subject', '==', subject)
            .where('meta.topic', '==', topic)
            .where('meta.syllabus_layer', '==', syllabusLayer)
            .limit(1) // Placeholder for deduplication logic
            .get();

        if (snap.empty) {
            // Fallback: any question in topic
            const fallbackSnap = await db.collection('question_bank')
                .where('subject', '==', subject)
                .where('meta.topic', '==', topic)
                .limit(1)
                .get();
            return fallbackSnap.empty ? null : { id: fallbackSnap.docs[0].id, ...fallbackSnap.docs[0].data() };
        }

        return { id: snap.docs[0].id, ...snap.docs[0].data() };
    }
}

module.exports = new PersonalizedQuestService();
