const admin = require("firebase-admin");
const UsageRepository = require("../UsageRepository");

class FirestoreUsageRepository extends UsageRepository {
    get db() {
        return admin.firestore();
    }

    async logUsage(uid, payload) {
        const ref = this.db.collection("users").doc(uid).collection("usage_stats").doc();
        await ref.set({
            ...payload,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
    }

    async incrementUsageSummary(uid, summaryPatch) {
        await this.db.collection("users").doc(uid).collection("usage_summary").doc("overall").set({
            total_prompt_tokens: admin.firestore.FieldValue.increment(summaryPatch.prompt || 0),
            total_completion_tokens: admin.firestore.FieldValue.increment(summaryPatch.completion || 0),
            total_cost_usd: admin.firestore.FieldValue.increment(summaryPatch.cost || 0),
            last_updated: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
    }

    async getUsageSummary(uid) {
        const doc = await this.db.collection("users").doc(uid).collection("usage_summary").doc("overall").get();
        return doc.exists ? doc.data() : null;
    }
}

module.exports = FirestoreUsageRepository;
