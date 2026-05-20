const UserProfileService = require('./UserProfileService');
const GenerativeAIService = require('./GenerativeAIService');
const speakingMockGradingAgent = require('../prompts/speakingMockGradingAgent');
const CosmosStore = require('./CosmosStore');

class SpeakingMockGradingService {
    /**
     * MAIN ENTRY: Grade a full Speaking Mock
     */
    async gradeFullMock(uid, mockData, chatHistory, individualQuestion, individualResponse, tier = 'free') {
        console.log(`[SpeakingMockGrading] Grading session for ${uid} (Tier: ${tier})...`);

        // ... (Transcripts omitted for brevity in replace call, but I will include them)
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
            // TIER-BASED MODEL SELECTION
            const model = (tier && tier.toLowerCase() === 'premium') ? 'ace-it-pro' : 'ace-it-flash';

            // 3. Call AI for grading
            const { data: evaluation } = await GenerativeAIService.generateJson(prompt, {
                model: model, 
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
                timestamp: new Date().toISOString(),
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

            const saved = await CosmosStore.addResult(uid, 'speaking', resultDoc);
            
            // Update user stats
            await this.updateUserStats(uid, totalScore, xpAwarded);

            // --- UPDATE MASTERY ---
            if (evaluation.domains) {
                const skillMappings = {
                    'pronunciation_delivery': 'speaking_pronunciationClarity',
                    'vocabulary_language': 'speaking_language',
                    'ideas_organisation': 'speaking_organization',
                    'communication_strategies': 'speaking_logicalDevelopment'
                };
                
                const masteryPromises = Object.entries(skillMappings).map(([key, skillId]) => {
                    const domainData = evaluation.domains[key] || {};
                    const score = domainData.score || 0;
                    const masteryScore = (score / 7) * 100;
                    return UserProfileService.updateMicroSkillLevel(uid, 'english', skillId, masteryScore, {
                        type: 'Mock',
                        difficulty: 4
                    });
                });
                await Promise.all(masteryPromises);
                await UserProfileService.saveProgressSnapshot(uid, 'english');
                console.log(`[SpeakingMockGrading] Updated ${masteryPromises.length} micro-skills for ${uid}`);
            }

            return {
                id: saved.id,
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
        if (score >= 24) return "5*";
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
            const profile = await UserProfileService.getProfile(uid);
            if (!profile) return;
            const newXP = Number(profile.xp || 0) + xp;
            const newSpeakingPoints = Number(profile.stats?.speaking_points || 0) + score;
            await UserProfileService.createOrUpdateProfile(uid, {
                xp: newXP,
                stats: {
                    ...(profile.stats || {}),
                    speaking_points: newSpeakingPoints,
                    last_speaking_level: this.mapScoreToLevel(score)
                }
            });
        } catch (e) {
            console.warn("[SpeakingMockGrading] Failed to update user stats:", e.message);
        }
    }
}

module.exports = new SpeakingMockGradingService();
