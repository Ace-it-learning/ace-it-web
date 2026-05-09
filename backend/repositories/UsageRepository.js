class UsageRepository {
    async logUsage(uid, payload) {
        throw new Error("Not implemented");
    }

    async incrementUsageSummary(uid, summaryPatch) {
        throw new Error("Not implemented");
    }

    async getUsageSummary(uid) {
        throw new Error("Not implemented");
    }
}

module.exports = UsageRepository;
