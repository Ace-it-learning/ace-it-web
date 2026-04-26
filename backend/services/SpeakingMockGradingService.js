const admin = require('firebase-admin');
const UserProfileService = require('./UserProfileService');
const GenerativeAIService = require('./GenerativeAIService');
const speakingMockGradingAgent = require('../prompts/speakingMockGradingAgent');

class SpeakingMockGradingService {
    constructor() {
        this._db = null;
    }

    get db() {
        if (!this._db) {
            this._db = admin.firestore();
        }
        return this._db;
    }

    /**
     * MAIN ENTRY: Grade a full Speaking Mock
     */
    async gradeFullMock(uid, mockData, chatHistory, individualQuestion, individualResponse) {
        console.log(`[SpeakingMockGrading] Grading session for ${uid}...`);

        // 1. Prepare transcripts
        // We filter for 'Candidate_D' or 'You' which is the student
        const studentDiscussionHistory = chatHistory
            .filter(msg => msg.role === 'Candidate_D' || msg.role === 'user' || msg.name === 'Candidate_D')
            .map(msg => msg.content)
            .join("\n\n");

        const fullDiscussionHistory = chatHistory
            .map(msg => `${msg.role || msg.name}: ${msg.content}`)
            .join("\n\n");

        // 2. Prepare the AI prompt
        const prompt = speakingMockGradingAgent
            .replace("{TOPIC}", mockData.title || "Unknown Topic")
            .replace("{DISCUSSION_POINTS}", (mockData.discussion_points || []).join(", "))
            .replace("{DISCUSSION_HISTORY}", fullDiscussionHistory)
            .replace("{INDIVIDUAL_QUESTION}", individualQuestion || "No question asked.")
            .replace("{INDIVIDUAL_RESPONSE}", individualResponse || "No response recorded.");

        try {
            // 3. Call AI for grading
            const evaluation = await GenerativeAIService.generateJson(prompt, {
                model: "ace-it-pro", // Use Pro for grading integrity
                generationConfig: { temperature: 0.2 } // Keep it deterministic
            });

            // 4. Calculate Level Mapping (Double check AI's logic)
            const totalScore = evaluation.total_score || 0;
            const level = this.mapScoreToLevel(totalScore);
            evaluation.overall_level = level;

            // 5. Calculate XP
            const xpAwarded = this.calculateXP(totalScore);

            // 6. Save to Firestore
            const resultDoc = {
                uid,
                type: 'speaking',
                paperId: mockData.id,
                title: mockData.title,
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                score: totalScore,
                possibleScore: 28,
                percentage: (totalScore / 28) * 100,
                level: level,
                xpAwarded: xpAwarded,
                results: evaluation,
                metadata: {
                    discussion_length: chatHistory.length,
                    has_individual_response: !!individualResponse
                }
            };

            const docRef = await this.db.collection('results').add(resultDoc);
            
            // Update user stats
            await this.updateUserStats(uid, totalScore, xpAwarded);

            // --- UPDATE MASTERY ---
            if (evaluation.scores) {
                const skillMappings = {
                    'pronunciation': 'speaking_pronunciationClarity',
                    'language': 'speaking_language',
                    'organization': 'speaking_organization',
                    'ideas': 'speaking_logicalDevelopment'
                };
                
                const masteryPromises = Object.entries(skillMappings).map(([key, skillId]) => {
                    const score = evaluation.scores[key] || 0;
                    const masteryScore = (score / 7) * 100;
                    return UserProfileService.updateMicroSkillLevel(uid, 'english', skillId, masteryScore, {
                        type: 'Mock',
                        difficulty: 4
                    });
                });
                await Promise.all(masteryPromises);
                console.log(`[SpeakingMockGrading] Updated ${masteryPromises.length} micro-skills for ${uid}`);
            }

            return {
                id: docRef.id,
                ...resultDoc
            };

        } catch (error) {
            console.error("[SpeakingMockGrading] Evaluation failed:", error);
            throw new Error("Failed to evaluate Speaking Mock: " + error.message);
        }
    }

    /**
     * HKEAA 0-28 Score to Level Mapping
     */
    mapScoreToLevel(score) {
        if (score >= 26) return "5**";
        if (score >= 22) return "5";
        if (score >= 18) return "4";
        if (score >= 14) return "3";
        if (score >= 10) return "2";
        if (score >= 6) return "1";
        return "U";
    }

    calculateXP(score) {
        // Base 100 XP + 20 per point
        return 100 + (score * 20);
    }

    async updateUserStats(uid, score, xp) {
        if (!uid || uid === 'guest') return;
        try {
            const userRef = this.db.collection('users').doc(uid);
            await this.db.runTransaction(async (t) => {
                const doc = await t.get(userRef);
                if (!doc.exists) return;
                
                const data = doc.data();
                const newXP = (data.xp || 0) + xp;
                const newSpeakingPoints = (data.stats?.speaking_points || 0) + score;
                
                t.update(userRef, {
                    xp: newXP,
                    "stats.speaking_points": newSpeakingPoints,
                    "stats.last_speaking_level": this.mapScoreToLevel(score)
                });
            });
        } catch (e) {
            console.warn("[SpeakingMockGrading] Failed to update user stats:", e.message);
        }
    }
}

module.exports = new SpeakingMockGradingService();
