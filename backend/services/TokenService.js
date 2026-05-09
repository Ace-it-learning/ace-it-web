const { createRepositories } = require('../repositories');
const ParityLogService = require('./ParityLogService');

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
     * @param {Object} [extra] - Optional fields to merge into the log entry
     *   (e.g. { prompt_tier, agent_id, history_msgs }). Used to attribute
     *   savings from the chat optimization passes.
     */
    static async logUsage(uid, taskName, metadata, extra = {}) {
        if (!uid || !metadata) return;
        const { usageRepo, fallback } = createRepositories();

        const { promptTokenCount, candidatesTokenCount, totalTokenCount } = metadata;

        const cost = (promptTokenCount * this.RATES.INPUT) + (candidatesTokenCount * this.RATES.OUTPUT);

        const logEntry = {
            task: taskName,
            prompt_tokens: promptTokenCount,
            completion_tokens: candidatesTokenCount || 0,
            total_tokens: totalTokenCount,
            estimated_cost_usd: parseFloat(cost.toFixed(6)),
            model: "gemini-2.0-flash",
            ...(extra && typeof extra === 'object' ? extra : {})
        };

        try {
            await usageRepo.logUsage(uid, logEntry);
            console.log(`[TokenService] Logged ${totalTokenCount} tokens for ${uid} (Task: ${taskName}, Cost: $${logEntry.estimated_cost_usd})`);

            await usageRepo.incrementUsageSummary(uid, {
                prompt: promptTokenCount,
                completion: candidatesTokenCount || 0,
                cost: logEntry.estimated_cost_usd
            });

            if (fallback?.usageRepo) {
                const legacy = await fallback.usageRepo.getUsageSummary(uid);
                const modern = await usageRepo.getUsageSummary(uid);
                ParityLogService.compare("token_usage_summary", modern, legacy);
            }

        } catch (e) {
            console.error("[TokenService] Logging failed:", e);
        }
    }

    /**
     * Retrieve usage summary for a user
     */
    static async getUsageSummary(uid) {
        const { usageRepo, fallback } = createRepositories();
        const primary = await usageRepo.getUsageSummary(uid);
        if (fallback?.usageRepo) {
            const secondary = await fallback.usageRepo.getUsageSummary(uid);
            ParityLogService.compare("token_get_usage_summary", primary, secondary);
        }
        return primary;
    }
}

module.exports = TokenService;
