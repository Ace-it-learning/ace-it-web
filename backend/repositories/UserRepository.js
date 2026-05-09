class UserRepository {
    async getProfile(uid) {
        throw new Error("Not implemented");
    }

    async upsertProfile(uid, patch) {
        throw new Error("Not implemented");
    }

    async ensureStats(uid, defaults) {
        throw new Error("Not implemented");
    }

    async getStats(uid) {
        throw new Error("Not implemented");
    }

    async findUidByEmail(email) {
        throw new Error("Not implemented");
    }

    async createIdentityUser(uid, data) {
        throw new Error("Not implemented");
    }
}

module.exports = UserRepository;
