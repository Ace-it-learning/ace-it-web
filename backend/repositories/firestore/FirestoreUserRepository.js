const admin = require("firebase-admin");
const UserRepository = require("../UserRepository");

class FirestoreUserRepository extends UserRepository {
    get db() {
        return admin.firestore();
    }

    async getProfile(uid) {
        const snap = await this.db.collection("users").doc(uid).get();
        return snap.exists ? snap.data() : null;
    }

    async upsertProfile(uid, patch) {
        await this.db.collection("users").doc(uid).set(patch, { merge: true });
    }

    async ensureStats(uid, defaults) {
        const ref = this.db.collection("users").doc(uid).collection("stats").doc("main");
        const snap = await ref.get();
        if (!snap.exists) {
            await ref.set(defaults);
            return defaults;
        }
        return snap.data();
    }

    async getStats(uid) {
        const ref = this.db.collection("users").doc(uid).collection("stats").doc("main");
        const snap = await ref.get();
        return snap.exists ? snap.data() : null;
    }

    async findUidByEmail(email) {
        const q = await this.db.collection("users").where("email", "==", email).limit(1).get();
        if (q.empty) return null;
        return q.docs[0].id;
    }

    async createIdentityUser(uid, data) {
        await this.db.collection("users").doc(uid).set({
            ...data,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
    }
}

module.exports = FirestoreUserRepository;
