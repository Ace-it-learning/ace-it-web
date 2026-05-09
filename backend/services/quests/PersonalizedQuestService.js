const QuestionBankStore = require('../QuestionBankStore');
const UserProfileService = require('../UserProfileService');

class PersonalizedQuestService {
    /**
     * Get personalized quests for a student.
     * Logic: 4 English Cards, 2 Maths Cards.
     * Priority: Weakest topics (tags/mastery) + Adaptive Level.
     */
    async getPersonalizedBatch(uid) {
        try {
            const english = await UserProfileService.getSkillMap(uid, 'english');
            const maths = await UserProfileService.getSkillMap(uid, 'maths');
            const skillData = {
                microSkills: {
                    ...(english?.microSkills || {}),
                    ...(maths?.microSkills || {})
                },
                weaknesses: []
            };

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
        const syllabusLayer = level <= 3 ? 'Foundational' : 'DSE Level';

        let row = await QuestionBankStore.queryPersonalizedByMetaTopic(subject, topic, syllabusLayer);
        if (!row) {
            row = await QuestionBankStore.queryPersonalizedByMetaTopicLoose(subject, topic);
        }
        if (!row) {
            row = await QuestionBankStore.queryPersonalizedByRootTopic(subject, topic);
        }
        if (!row) return null;
        return { id: row.id, ...row };
    }
}

module.exports = new PersonalizedQuestService();
