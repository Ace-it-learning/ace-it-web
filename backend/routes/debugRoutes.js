const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const UserProfileService = require('../services/UserProfileService');

/**
 * Debugging & Developer Tools
 */

// POST /api/debug/reset_user
router.post('/reset_user', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: "Email required" });

        console.log(`[DEBUG] Reset requested for email: ${email}`);

        // 1. Find UID
        const userRecord = await admin.auth().getUserByEmail(email);
        const uid = userRecord.uid;
        console.log(`[DEBUG] Found UID: ${uid}`);

        // 2. Call Service Reset (Deletes Profile, Stats, Chat, Roadmap, Inventory)
        await UserProfileService.resetUser(uid);

        // 3. Delete Root Collections checks (Just in case)
        const deleteQuery = async (collection, field) => {
            const snap = await admin.firestore().collection(collection).where(field, '==', uid).get();
            if (snap.empty) return;
            const batch = admin.firestore().batch();
            snap.docs.forEach(d => batch.delete(d.ref));
            await batch.commit();
            console.log(`[DEBUG] Deleted ${snap.size} docs from ${collection}`);
        };

        await deleteQuery('exam_attempts', 'userId');
        await deleteQuery('writings', 'userId');

        res.json({ success: true, message: `User ${email} (${uid}) fully reset.` });
    } catch (e) {
        console.error("Reset Failed:", e);
        res.status(500).json({ error: e.message });
    }
});

// GET /api/debug/check-user/:email
router.get('/check-user/:email', async (req, res) => {
    const { email } = req.params;
    try {
        const userRecord = await admin.auth().getUserByEmail(email);
        const uid = userRecord.uid;
        const userDoc = await admin.firestore().collection('users').doc(uid).get();
        const userData = userDoc.exists ? userDoc.data() : null;

        res.json({
            success: true,
            uid,
            data: {
                onboarding_completed: userData?.onboarding_completed,
                diagnostic_completed: userData?.diagnostic_completed,
                has_profile: !!userData?.profile
            },
            full_data: userData
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;
