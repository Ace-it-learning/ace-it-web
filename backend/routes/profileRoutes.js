const express = require('express');
const router = express.Router();
const UserProfileService = require('../services/UserProfileService');
const admin = require('firebase-admin');

// GET /api/profile
router.get('/', async (req, res) => {
    const { uid } = req.query;
    if (!uid) return res.status(400).json({ error: "Missing uid" });
    try {
        const profile = await UserProfileService.getProfile(uid);
        res.json(profile || {});
    } catch (e) {
        console.error("Profile Fetch Error:", e);
        res.status(500).json({ error: "Failed to fetch profile" });
    }
});

// POST /api/profile
router.post('/', async (req, res) => {
    const { uid, ...profileData } = req.body;
    if (!uid) return res.status(400).json({ error: "Missing uid" });
    try {
        await UserProfileService.createOrUpdateProfile(uid, profileData);
        res.json({ success: true });
    } catch (e) {
        console.error("Profile Update Error:", e);
        res.status(500).json({ error: "Failed to update profile" });
    }
});

// GET /api/skillmap
router.get('/skillmap', async (req, res) => {
    const { uid, subject } = req.query;
    if (!uid) return res.status(400).json({ error: "Missing uid" });
    try {
        const skillMap = await UserProfileService.getSkillMap(uid, subject || 'english');
        res.json(skillMap || {});
    } catch (e) {
        console.error("SkillMap Fetch Error:", e);
        res.status(500).json({ error: "Failed to fetch skill map" });
    }
});

// GET /api/skillmap/maths - Dedicated Math endpoint
router.get('/maths', async (req, res) => {
    const { uid } = req.query;
    if (!uid) return res.status(400).json({ error: "Missing uid" });
    try {
        const mathSkillMap = await UserProfileService.getMathSkillMap(uid);
        res.json(mathSkillMap || {});
    } catch (e) {
        console.error("Math SkillMap Fetch Error:", e);
        res.status(500).json({ error: "Failed to fetch Math skill map" });
    }
});

// GET /api/skillmap/maths/history - Math skill history
router.get('/maths/history', async (req, res) => {
    const { uid, limit } = req.query;
    if (!uid) return res.status(400).json({ error: "Missing uid" });
    try {
        const history = await UserProfileService.getMathSkillHistory(uid, parseInt(limit) || 5);
        res.json(history);
    } catch (e) {
        console.error("Math History Fetch Error:", e);
        res.status(500).json({ error: "Failed to fetch Math history" });
    }
});

// GET /api/gamification
router.get('/gamification', async (req, res) => {
    const { uid } = req.query;
    if (!uid) return res.status(400).json({ error: "Missing uid" });
    try {
        const GamificationService = require('../services/GamificationService');
        const stats = await GamificationService.getStats(uid);
        res.json(stats);
    } catch (e) {
        console.error("Gamification Fetch Error:", e);
        res.status(500).json({ error: "Failed to fetch gamification stats" });
    }
});

// POST /api/redemption/blindbox
router.post('/redemption/blindbox', async (req, res) => {
    const { uid } = req.body;
    if (!uid) return res.status(400).json({ error: "Missing uid" });

    const BOX_COST = 500;
    const roll = Math.random();
    const newItem = roll > 0.8
        ? { id: 'tutor_janice', name: 'Miss Janie (Star Tutor)', type: 'tutor', rarity: 'legendary', icon: '👩‍🏫' }
        : { id: `avatar_${Math.floor(Math.random() * 5)}`, name: 'Cool Avatar Frame', type: 'avatar', rarity: 'common', icon: '🖼️' };

    try {
        const GamificationService = require('../services/GamificationService');
        const result = await GamificationService.redeemItem(uid, newItem.id, BOX_COST, newItem);

        if (result.success) {
            res.json({ success: true, newItem, newBalance: result.newBalance });
        } else {
            res.status(400).json({ error: result.error });
        }
    } catch (e) {
        console.error("Redemption Error:", e);
        res.status(500).json({ error: "Transaction failed" });
    }
});

module.exports = router;
