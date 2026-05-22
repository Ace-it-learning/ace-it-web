const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

// Services
const UserProfileService = require('../services/UserProfileService');
const GamificationService = require('../services/GamificationService');
const DeviceService = require('../services/DeviceService');
const { checkVoiceQuota } = require('../services/VoiceQuotaService');
const CacheService = require('../services/CacheService');
const { requireResolvedUid } = require('../middleware/requireResolvedUid');
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
router.post('/onboarding', requireResolvedUid, async (req, res) => {
    const { uid, marketing_opt_in, ...profileBody } = req.body;
    if (!uid) return res.status(400).json({ error: "Missing uid" });
    try {
        const updatedUser = await UserProfileService.createOrUpdateProfile(uid, profileBody);
        let commsResult = null;
        if (marketing_opt_in === true) {
            commsResult = await UserProfileService.setMarketingOptIn(uid, true);
        } else if (marketing_opt_in === false) {
            commsResult = await UserProfileService.setMarketingOptIn(uid, false);
        }
        res.json({ ...updatedUser, communication: commsResult });
    } catch (e) {
        res.status(500).json({ error: "Failed to create profile" });
    }
});

// POST /api/user/communication-preferences
router.post('/communication-preferences', requireResolvedUid, async (req, res) => {
    const { uid, opt_in } = req.body;
    if (!uid) return res.status(400).json({ error: 'Missing uid' });
    if (typeof opt_in !== 'boolean') {
        return res.status(400).json({ error: 'opt_in must be a boolean' });
    }
    try {
        const result = await UserProfileService.setMarketingOptIn(uid, opt_in);
        res.json({ success: true, ...result });
    } catch (e) {
        console.error('[CommunicationPreferences] Update error:', e);
        res.status(500).json({ error: 'Failed to update communication preferences' });
    }
});

// GET /api/user/profile/:uid
router.get('/profile/:uid', requireResolvedUid, async (req, res) => {
    const { uid } = req.params;
    const bypassCache = req.query?.bypass === 'true' || req.headers['x-bypass-cache'] === 'true';
    try {
        if (bypassCache) {
            CacheService.invalidateUserDbCache(uid);
        }
        const profile = await UserProfileService.getProfile(uid);
        res.json(profile);
    } catch (e) {
        res.status(500).json({ error: "Failed to fetch profile" });
    }
});

// GET /api/user/tutor-events/pending-summary
router.get('/tutor-events/pending-summary', requireResolvedUid, async (req, res) => {
    const { uid, limit } = req.query;
    if (!uid) return res.status(400).json({ error: "Missing uid" });
    try {
        const events = await UserProfileService.getPendingTutorCompletionEvents(uid, limit || 10);
        res.json({ events });
    } catch (e) {
        console.error("Pending tutor events error:", e);
        res.status(500).json({ error: "Failed to fetch pending tutor events" });
    }
});

// POST /api/user/tutor-events/mark-summarized
router.post('/tutor-events/mark-summarized', requireResolvedUid, async (req, res) => {
    const { uid, eventIds } = req.body || {};
    if (!uid || !Array.isArray(eventIds)) {
        return res.status(400).json({ error: "Missing uid or eventIds" });
    }
    try {
        const result = await UserProfileService.markTutorCompletionEventsSummarized(uid, eventIds);
        res.json({ success: true, ...result });
    } catch (e) {
        console.error("Mark tutor events summarized error:", e);
        res.status(500).json({ error: "Failed to mark tutor events summarized" });
    }
});

// GET /api/user/check-methods/:email
router.get('/check-methods/:email', async (req, res) => {
    const { email } = req.params;
    try {
        const userRecord = await admin.auth().getUserByEmail(email);
        const providers = userRecord.providerData.map(p => p.providerId);
        res.json({ providers });
    } catch (e) {
        if (e.code === 'auth/user-not-found') {
            return res.json({ providers: [] });
        }
        console.error("Check Methods Error:", e);
        res.status(500).json({ error: "Internal error" });
    }
});

// GET /api/user/resolve-identity
// Used by Auth0 frontend to map authenticated email -> app uid.
router.get('/resolve-identity', async (req, res) => {
    try {
        const uid = req.uid || null;
        const email = req.authUser?.email || null;
        if (!uid || !email) {
            return res.status(401).json({ error: "Identity not resolved" });
        }
        return res.json({ uid, email });
    } catch (e) {
        console.error("Resolve identity error:", e);
        return res.status(500).json({ error: "Failed to resolve identity" });
    }
});

/**
 * Quotas & Entitlements
 */

/**
 * Strategy/Ace Sir Profile
 */

// GET /api/user/dream-programs
router.get('/dream-programs', requireResolvedUid, async (req, res) => {
    const { uid } = req.query;
    if (!uid) return res.status(400).json({ error: 'Missing uid' });
    try {
        const userData = await UserProfileService.getProfile(uid);
        if (!userData || userData.uid === 'guest') return res.json({ programs: [] });
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

// POST /api/user/dream-programs
router.post('/dream-programs', requireResolvedUid, async (req, res) => {
    const { uid, programs } = req.body;
    if (!uid) return res.status(400).json({ error: 'Missing uid' });
    if (!Array.isArray(programs)) return res.status(400).json({ error: 'Invalid programs format' });
    try {
        // Always sync dreamSubject from first dream program (JUPAS programmes are source of truth)
        const updates = { dreamPrograms: programs };
        if (programs.length > 0) {
            const first = programs[0];
            updates.dreamSubject = first.name || first.title || first.label || first.programmeName || '';
        } else {
            updates.dreamSubject = '';
        }
        await UserProfileService.createOrUpdateProfile(uid, updates);
        res.json({ success: true });
    } catch (error) {
        console.error('[DreamPrograms] Save error:', error);
        res.status(500).json({ error: 'Failed to save dream programs' });
    }
});

/**
 * Parent Oversight Settings
 */
const ParentReportService = require('../services/ParentReportService');

// POST /api/user/parent-settings
router.post('/parent-settings', requireResolvedUid, async (req, res) => {
    const { uid, parent_email, parent_report_enabled, send_copy_to_self } = req.body;
    if (!uid) return res.status(400).json({ error: 'Missing uid' });

    try {
        const patch = {};
        if (parent_email !== undefined) patch.parent_email = parent_email;
        if (parent_report_enabled !== undefined) patch.parent_report_enabled = parent_report_enabled;
        if (send_copy_to_self !== undefined) patch.send_copy_to_self = send_copy_to_self;

        await UserProfileService.createOrUpdateProfile(uid, patch);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: 'Failed to update parent settings' });
    }
});

// POST /api/user/parent-test-report
router.post('/parent-test-report', requireResolvedUid, async (req, res) => {
    const { uid, parent_email, send_copy_to_self } = req.body;
    if (!uid || !parent_email) return res.status(400).json({ error: 'Missing parameters' });

    try {
        const profile = await UserProfileService.getProfile(uid);
        const selfEmail = send_copy_to_self ? (profile?.email || null) : null;
        const result = await ParentReportService.generateAndSendReport(uid, parent_email, selfEmail);
        res.json(result);
    } catch (e) {
        console.error("Test report error", e);
        res.status(500).json({ error: 'Failed to send test report' });
    }
});

// POST /api/user/send-weekly-report — manual trigger
router.post('/send-weekly-report', requireResolvedUid, async (req, res) => {
    const { uid } = req.body;
    if (!uid) return res.status(400).json({ error: 'Missing uid' });

    try {
        const profile = await UserProfileService.getProfile(uid);
        if (!profile?.parent_email) {
            return res.status(400).json({ error: 'No parent email configured' });
        }
        if (!profile?.parent_report_enabled) {
            return res.status(400).json({ error: 'Parent reports not enabled' });
        }

        const selfEmail = profile?.send_copy_to_self ? (profile?.email || null) : null;
        const result = await ParentReportService.generateAndSendReport(uid, profile.parent_email, selfEmail);
        res.json(result);
    } catch (e) {
        console.error("Send weekly report error", e);
        res.status(500).json({ error: 'Failed to send report' });
    }
});

// POST /api/user/profile (Updates profile fields)
router.post('/profile/update', requireResolvedUid, async (req, res) => {
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
router.post('/subscription/cancel', requireResolvedUid, async (req, res) => {
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
router.post('/device/forget', requireResolvedUid, async (req, res) => {
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
router.post('/device/register', requireResolvedUid, async (req, res) => {
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
router.delete('/', requireResolvedUid, async (req, res) => {
    const { uid } = req.body; // or req.query.uid
    if (!uid) return res.status(400).json({ error: "Missing uid" });
    try {
        await UserProfileService.deleteUserProfile(uid);
        res.json({ success: true });
    } catch (e) {
        console.error("Delete account error", e);
        res.status(500).json({ error: "Failed to delete account" });
    }
});

module.exports = router;
