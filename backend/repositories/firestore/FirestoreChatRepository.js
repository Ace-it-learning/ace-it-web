const admin = require("firebase-admin");
const ChatRepository = require("../ChatRepository");

class FirestoreChatRepository extends ChatRepository {
    get db() {
        return admin.firestore();
    }

    async saveMessage(uid, agentId, message) {
        const role = (message.role === "assistant" || message.role === "model") ? "model" : "user";
        const ref = await this.db.collection("users").doc(uid).collection("chat_history").add({
            ...message,
            role,
            agentId,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
        return ref.id;
    }

    async getHistory(uid, agentId) {
        const snapshot = await this.db.collection("users").doc(uid).collection("chat_history")
            .where("agentId", "==", agentId)
            .get();

        const history = [];
        snapshot.docs.forEach((doc) => {
            const d = doc.data();
            const ts = d.timestamp?.toDate?.() || new Date(0);
            if (d.message && d.response) {
                history.push({ role: "user", content: d.message, timestamp: ts });
                history.push({ role: "model", content: d.response, timestamp: new Date(ts.getTime() + 100) });
                return;
            }
            if (d.role && d.content !== undefined) {
                history.push({
                    role: (d.role === "assistant" || d.role === "model") ? "model" : d.role,
                    content: d.content || "",
                    timestamp: ts
                });
            }
        });
        return history.sort((a, b) => a.timestamp - b.timestamp);
    }
}

module.exports = FirestoreChatRepository;
