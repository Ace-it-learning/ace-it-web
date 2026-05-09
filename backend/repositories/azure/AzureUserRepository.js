const UserRepository = require("../UserRepository");
const { getContainer } = require("../../db/cosmos");

class AzureUserRepository extends UserRepository {
    async getUsersContainer() {
        return getContainer("users", "/pk");
    }

    async getStatsContainer() {
        return getContainer("user_stats", "/pk");
    }

    async getProfile(uid) {
        const container = await this.getUsersContainer();
        try {
            const { resource } = await container.item(`user_${uid}`, uid).read();
            return resource?.profile || null;
        } catch (error) {
            if (error.code === 404) return null;
            throw error;
        }
    }

    async upsertProfile(uid, patch) {
        const container = await this.getUsersContainer();
        const current = await this.getProfile(uid);
        const profile = { ...(current || {}), ...(patch || {}) };
        await container.items.upsert({
            id: `user_${uid}`,
            pk: uid,
            uid,
            profile,
            updatedAt: new Date().toISOString()
        });
    }

    async ensureStats(uid, defaults) {
        const container = await this.getStatsContainer();
        const existing = await this.getStats(uid);
        if (existing) return existing;
        const stats = defaults || {};
        await container.items.upsert({
            id: `stats_${uid}`,
            pk: uid,
            uid,
            stats,
            updatedAt: new Date().toISOString()
        });
        return stats;
    }

    async getStats(uid) {
        const container = await this.getStatsContainer();
        try {
            const { resource } = await container.item(`stats_${uid}`, uid).read();
            return resource?.stats || null;
        } catch (error) {
            if (error.code === 404) return null;
            throw error;
        }
    }

    async findUidByEmail(email) {
        const container = await this.getUsersContainer();
        const q = await container.items.query({
            query: "SELECT TOP 1 c.uid FROM c WHERE c.profile.email = @email",
            parameters: [{ name: "@email", value: email }]
        }).fetchAll();
        return q.resources?.[0]?.uid || null;
    }

    async createIdentityUser(uid, data) {
        await this.upsertProfile(uid, data);
    }
}

module.exports = AzureUserRepository;
