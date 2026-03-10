const admin = require('firebase-admin');

/**
 * TokenService
 * Handles logging and cost estimation for Gemini API usage.
 */
class TokenService {
    // Current rates for gemini-2.0-flash (estimated)
    static RATES = {
        INPUT: 0.10 / 1000000,   // $0.10 per 1M tokens
        OUTPUT: 0.40 / 1000000,  // $0.40 per 1M tokens
    };

    /**
     * Log token usage to Firestore
     * @param {string} uid - User ID
     * @param {string} taskName - e.g. "chat", "intent_router", "lab_gen"
     * @param {Object} metadata - usageMetadata from Gemini response
     */
    static async logUsage(uid, taskName, metadata) {
        if (!uid || !metadata) return;

        // Safety check: if no firebase app, skip logging (for tests)
        if (!admin.apps?.length) {
            // console.warn("[TokenService] No Firebase app initialized. Skipping log.");
            return;
        }

        const { promptTokenCount, candidatesTokenCount, totalTokenCount } = metadata;

        const cost = (promptTokenCount * this.RATES.INPUT) + (candidatesTokenCount * this.RATES.OUTPUT);

        const db = admin.firestore();
        const usageRef = db.collection('users').doc(uid).collection('usage_stats').doc();

        const logEntry = {
            task: taskName,
            prompt_tokens: promptTokenCount,
            completion_tokens: candidatesTokenCount || 0,
            total_tokens: totalTokenCount,
            estimated_cost_usd: parseFloat(cost.toFixed(6)),
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            model: "gemini-2.0-flash"
        };

        try {
            await usageRef.set(logEntry);
            console.log(`[TokenService] Logged ${totalTokenCount} tokens for ${uid} (Task: ${taskName}, Cost: $${logEntry.estimated_cost_usd})`);

            // Increment total counter for user summary
            const summaryRef = db.collection('users').doc(uid).collection('usage_summary').doc('overall');
            await summaryRef.set({
                total_prompt_tokens: admin.firestore.FieldValue.increment(promptTokenCount),
                total_completion_tokens: admin.firestore.FieldValue.increment(candidatesTokenCount || 0),
                total_cost_usd: admin.firestore.FieldValue.increment(logEntry.estimated_cost_usd),
                last_updated: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

        } catch (e) {
            console.error("[TokenService] Logging failed:", e);
        }
    }

    /**
     * Retrieve usage summary for a user
     */
    static async getUsageSummary(uid) {
        const db = admin.firestore();
        const doc = await db.collection('users').doc(uid).collection('usage_summary').doc('overall').get();
        return doc.exists ? doc.data() : null;
    }
}

module.exports = TokenService;
