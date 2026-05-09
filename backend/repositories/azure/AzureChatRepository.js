const ChatRepository = require("../ChatRepository");
const { getContainer } = require("../../db/cosmos");

class AzureChatRepository extends ChatRepository {
    async getContainer() {
        return getContainer("chat_messages", "/pk");
    }

    async saveMessage(uid, agentId, message) {
        const container = await this.getContainer();
        const role = (message.role === "assistant" || message.role === "model") ? "model" : "user";
        const content = (message.content || message.parts?.[0]?.text || "").toString();
        const metadata = { ...message };
        delete metadata.content;
        const doc = {
            id: `chat_${uid}_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            pk: uid,
            uid,
            agentId,
            role,
            content,
            metadata,
            createdAt: new Date().toISOString()
        };
        await container.items.upsert(doc);
        return doc.id;
    }

    async getHistory(uid, agentId) {
        const container = await this.getContainer();
        const result = await container.items.query({
            query: "SELECT c.role, c.content, c.createdAt FROM c WHERE c.pk = @uid AND c.agentId = @agentId ORDER BY c.createdAt ASC",
            parameters: [
                { name: "@uid", value: uid },
                { name: "@agentId", value: agentId }
            ]
        }).fetchAll();

        return (result.resources || []).map((r) => ({
            role: (r.role === "assistant" || r.role === "model") ? "model" : r.role,
            content: r.content || "",
            timestamp: r.createdAt ? new Date(r.createdAt) : new Date(0)
        }));
    }
}

module.exports = AzureChatRepository;
