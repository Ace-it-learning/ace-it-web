const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const UserProfileService = require('../services/UserProfileService');
const GenerativeAIService = require('../services/GenerativeAIService');
const { getContainer } = require('../db/cosmos');

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
            const c = await getContainer(collection, '/pk');
            const result = await c.items.query({
                query: `SELECT * FROM c WHERE c.${field} = @uid`,
                parameters: [{ name: "@uid", value: uid }]
            }).fetchAll();
            const docs = result.resources || [];
            await Promise.all(docs.map((d) => c.item(d.id, d.pk || uid).delete().catch(() => null)));
            console.log(`[DEBUG] Deleted ${docs.length} docs from ${collection}`);
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
        const userData = await UserProfileService.getProfile(uid);

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

// GET /api/debug/test-ai (DeepSeek DEV Architecture Test)
router.get('/test-ai', async (req, res) => {
    try {
        console.log('[DEBUG] Testing DeepSeek DEV Architecture...');

        // Ensure AI service is initialized
        await GenerativeAIService.init();

        // Test with a simple prompt via the unified generateContent API
        const result = await GenerativeAIService.generateContent('Say "Hello from Ace‑It DeepSeek DEV Test"');
        const text = result.response.text();

        res.json({
            success: true,
            status: 'DeepSeek operational',
            platform: GenerativeAIService.getActiveProvider(),
            model: result.usedModel,
            response: text,
            environment: {
                NODE_ENV: process.env.NODE_ENV || 'development',
                AI_PROVIDER: process.env.AI_PROVIDER || 'not-set'
            }
        });
    } catch (error) {
        console.error('[DEBUG] DeepSeek Test Failed:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            stack: process.env.NODE_ENV === 'production' ? undefined : error.stack,
            environment: {
                NODE_ENV: process.env.NODE_ENV || 'development',
                AI_PROVIDER: process.env.AI_PROVIDER || 'not-set'
            }
        });
    }
});

module.exports = router;
