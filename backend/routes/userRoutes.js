const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

// Services
const UserProfileService = require('../services/UserProfileService');
const GamificationService = require('../services/GamificationService');
const DeviceService = require('../services/DeviceService');
const { checkVoiceQuota } = require('../services/VoiceQuotaService');
const db = admin.firestore();
const cardPool = require('../data/card_pool.json');

// --- UTILS ---
function pickCardByRarity(cards) {
    const rarityWeights = { common: 60, rare: 25, epic: 10, legendary: 5 };
    const weighted = cards.map(c => ({ card: c, weight: rarityWeights[c.rarity] || 10 }));
    const totalWeight = weighted.reduce((sum, w) => sum + w.weight, 0);
    let roll = Math.random() * totalWeight;
    for (const w of weighted) {
        roll -= w.weight;
        if (roll <= 0) return w.card;
    }
    return weighted[weighted.length - 1].card;
}

/**
 * User Profile & Onboarding
 */

// POST /api/user/onboarding
router.post('/onboarding', async (req, res) => {
    const { uid } = req.body;
    if (!uid) return res.status(400).json({ error: "Missing uid" });
    try {
        const updatedUser = await UserProfileService.createOrUpdateProfile(uid, req.body);
        res.json(updatedUser);
    } catch (e) {
        res.status(500).json({ error: "Failed to create profile" });
    }
});

// GET /api/user/profile/:uid
router.get('/profile/:uid', async (req, res) => {
    const { uid } = req.params;
    try {
        const profile = await UserProfileService.getProfile(uid);
        res.json(profile);
    } catch (e) {
        res.status(500).json({ error: "Failed to fetch profile" });
    }
});

/**
 * Quotas & Entitlements
 */

/**
 * Strategy/Ace Sir Profile
 */

// GET /api/user/dream-programs
router.get('/dream-programs', async (req, res) => {
    // ... (existing code for dream-programs)
    const { uid } = req.query;
    if (!uid) return res.status(400).json({ error: 'Missing uid' });
    try {
        const db = admin.firestore();
        const userDoc = await db.collection('users').doc(uid).get();
        if (!userDoc.exists) return res.json({ programs: [] });
        const userData = userDoc.data();
        res.json({
            programs: userData.dreamPrograms || [],
            targets: {
                eng: userData.targetGradeEng,
                chi: userData.targetGradeChi,
                math: userData.targetGradeMath,
                electives: userData.electives || []
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch dream programs' });
    }
});

/**
 * Parent Oversight Settings
 */
const ParentReportService = require('../services/ParentReportService');

// POST /api/user/parent-settings
router.post('/parent-settings', async (req, res) => {
    const { uid, parent_email, parent_report_enabled } = req.body;
    if (!uid) return res.status(400).json({ error: 'Missing uid' });

    try {
        await UserProfileService.createOrUpdateProfile(uid, {
            parent_email,
            parent_report_enabled
        });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: 'Failed to update parent settings' });
    }
});

// POST /api/user/parent-test-report
router.post('/parent-test-report', async (req, res) => {
    const { uid, parent_email } = req.body;
    if (!uid || !parent_email) return res.status(400).json({ error: 'Missing parameters' });

    try {
        const result = await ParentReportService.generateAndSendReport(uid, parent_email);
        res.json(result);
    } catch (e) {
        console.error("Test report error", e);
        res.status(500).json({ error: 'Failed to send test report' });
    }
});

// POST /api/user/profile (Updates profile fields)
router.post('/profile/update', async (req, res) => {
    const { uid, ...profileData } = req.body;
    if (!uid) return res.status(400).json({ error: "Missing uid" });
    try {
        const updated = await UserProfileService.createOrUpdateProfile(uid, profileData);
        res.json(updated);
    } catch (e) {
        res.status(500).json({ error: "Failed to update profile" });
    }
});

// POST /api/user/subscription/cancel
router.post('/subscription/cancel', async (req, res) => {
    const { uid } = req.body;
    if (!uid) return res.status(400).json({ error: "Missing uid" });
    try {
        const result = await UserProfileService.cancelSubscription(uid);
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: "Failed to cancel subscription" });
    }
});

// POST /api/user/device/forget
router.post('/device/forget', async (req, res) => {
    const { uid, fingerprint } = req.body;
    if (!uid || !fingerprint) return res.status(400).json({ error: "Missing parameters" });
    try {
        await DeviceService.forgetDevice(uid, fingerprint);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: "Failed to forget device" });
    }
});

// POST /api/user/device/register
router.post('/device/register', async (req, res) => {
    const { uid, fingerprint, metadata } = req.body;
    if (!uid || !fingerprint) return res.status(400).json({ error: "Missing parameters" });
    try {
        await DeviceService.registerDevice(uid, fingerprint, metadata || {});
        res.json({ success: true });
    } catch (e) {
        process.stdout.write(`[DEBUG] Registration Error: ${e.message}\n`);
        require('fs').writeFileSync('debug_err.txt', e.stack || e.message);
        res.status(500).json({ error: "Failed to register device" });
    }
});

// DELETE /api/user
router.delete('/', async (req, res) => {
    const { uid } = req.body; // or req.query.uid
    if (!uid) return res.status(400).json({ error: "Missing uid" });
    try {
        const profile = await UserProfileService.getProfile(uid);
        if (profile && profile.subscription_tier !== 'free' && profile.subscription_status !== 'cancelled') {
            return res.status(400).json({ 
                error: "Subscription active", 
                message: "Please cancel your active subscription before deleting your account." 
            });
        }
        await UserProfileService.deleteUserProfile(uid);
        res.json({ success: true });
    } catch (e) {
        console.error("Delete account error", e);
        res.status(500).json({ error: "Failed to delete account" });
    }
});

module.exports = router;
