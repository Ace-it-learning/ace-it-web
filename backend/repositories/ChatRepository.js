class ChatRepository {
    async saveMessage(uid, agentId, message) {
        throw new Error("Not implemented");
    }

    async getHistory(uid, agentId) {
        throw new Error("Not implemented");
    }
}

module.exports = ChatRepository;
