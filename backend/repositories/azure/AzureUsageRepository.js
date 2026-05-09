const UsageRepository = require("../UsageRepository");
const { getContainer } = require("../../db/cosmos");

class AzureUsageRepository extends UsageRepository {
    async getLogsContainer() {
        return getContainer("usage_logs", "/pk");
    }

    async getSummaryContainer() {
        return getContainer("usage_summary", "/pk");
    }

    async logUsage(uid, payload) {
        const container = await this.getLogsContainer();
        await container.items.upsert({
            id: `usage_${uid}_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            pk: uid,
            uid,
            payload: payload || {},
            createdAt: new Date().toISOString()
        });
    }

    async incrementUsageSummary(uid, summaryPatch) {
        const container = await this.getSummaryContainer();
        const prompt = Number(summaryPatch.prompt || 0);
        const completion = Number(summaryPatch.completion || 0);
        const cost = Number(summaryPatch.cost || 0);
        let current = await this.getUsageSummary(uid);
        current = current || {
            uid,
            total_prompt_tokens: 0,
            total_completion_tokens: 0,
            total_cost_usd: 0
        };
        await container.items.upsert({
            id: `usage_summary_${uid}`,
            pk: uid,
            uid,
            total_prompt_tokens: Number(current.total_prompt_tokens || 0) + prompt,
            total_completion_tokens: Number(current.total_completion_tokens || 0) + completion,
            total_cost_usd: Number(current.total_cost_usd || 0) + cost,
            last_updated: new Date().toISOString()
        });
    }

    async getUsageSummary(uid) {
        const container = await this.getSummaryContainer();
        try {
            const { resource } = await container.item(`usage_summary_${uid}`, uid).read();
            if (!resource) return null;
            return {
                uid: resource.uid,
                total_prompt_tokens: resource.total_prompt_tokens || 0,
                total_completion_tokens: resource.total_completion_tokens || 0,
                total_cost_usd: resource.total_cost_usd || 0,
                last_updated: resource.last_updated
            };
        } catch (error) {
            if (error.code === 404) return null;
            throw error;
        }
    }
}

module.exports = AzureUsageRepository;
