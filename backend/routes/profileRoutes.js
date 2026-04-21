const express = require('express');
const router = express.Router();
const UserProfileService = require('../services/UserProfileService');
const admin = require('firebase-admin');

// GET /api/profile
router.get('/profile', async (req, res) => {
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
router.post('/profile', async (req, res) => {
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
router.get('/skillmap/maths', async (req, res) => {
    const { uid } = req.query;
    if (!uid) return res.status(400).json({ error: "Missing uid" });
    try {
        const mathSkillMap = await UserProfileService.getMathSkillMap(uid);
        res.json(mathSkillMap || { microSkills: {}, weaknessPriority: [], practicedSkills: [] });
    } catch (e) {
        console.error("Math SkillMap Fetch Error:", e);
        res.status(500).json({ error: "Failed to fetch Math skill map" });
    }
});

// GET /api/profile/maths - Backwards-compat alias for /api/skillmap/maths
router.get('/profile/maths', async (req, res) => {
    const { uid } = req.query;
    if (!uid) return res.status(400).json({ error: "Missing uid" });
    try {
        const mathSkillMap = await UserProfileService.getMathSkillMap(uid);
        res.json(mathSkillMap || { microSkills: {}, weaknessPriority: [], practicedSkills: [] });
    } catch (e) {
        console.error("Profile/Maths Fetch Error:", e);
        res.status(500).json({ error: "Failed to fetch Math skill map" });
    }
});

// GET /api/skillmap/:subject/history - Generic skill history
router.get('/skillmap/:subject/history', async (req, res) => {
    const { subject } = req.params;
    const { uid, limit } = req.query;
    if (!uid) return res.status(400).json({ error: "Missing uid" });
    try {
        const history = await UserProfileService.getSkillHistory(uid, subject, parseInt(limit) || 5);
        res.json(history);
    } catch (e) {
        console.error(`${subject} History Fetch Error:`, e);
        res.status(500).json({ error: `Failed to fetch ${subject} history` });
    }
});

// GET /api/gamification
router.get('/profile/gamification', async (req, res) => {
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
    const { uid, tier } = req.body;
    if (!uid) return res.status(400).json({ error: "Missing uid" });

    try {
        const store = require('../data/../redemption_store.json');
        const cardPool = require('../data/card_pool.json');
        const boxTypes = {
            standard: 'blind_box_standard',
            tutor: 'blind_box_tutor',
            aesthetics: 'blind_box_aesthetics'
        };

        const config = store.redemption_items[boxTypes[tier || 'standard']];
        if (!config) return res.status(400).json({ error: "Invalid box tier" });

        // Logic to pick item from pool
        let pool = [];
        if (config.pool.includes('student_cards')) pool = cardPool.student_cards;
        else if (config.pool.includes('tutor_cards')) pool = cardPool.tutor_cards;
        else if (config.pool.includes('avatar_frames')) pool = cardPool.avatar_frames;

        if (pool.length === 0) return res.status(500).json({ error: "Pool is empty" });

        // Simple random draw (can be enhanced with rarity weights later)
        const drawnItem = pool[Math.floor(Math.random() * pool.length)];
        const newItem = { 
            id: drawnItem.id, 
            name: drawnItem.name, 
            type: tier === 'standard' ? 'student' : (tier === 'tutor' ? 'tutor' : 'frame'), 
            rarity: drawnItem.rarity, 
            image: drawnItem.image 
        };

        const GamificationService = require('../services/GamificationService');
        const result = await GamificationService.redeemItem(uid, newItem.id, config.cost, newItem);

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

// POST /api/redemption/equip
router.post('/redemption/equip', async (req, res) => {
    const { uid, itemId, slot } = req.body;
    if (!uid || !itemId || !slot) return res.status(400).json({ error: "Missing required fields" });
    try {
        const result = await UserProfileService.equipItem(uid, itemId, slot);
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

/**
 * GET /api/redemption/collection
 * Fetch full catalog with owned status
 */
router.get('/redemption/collection', async (req, res) => {
    const { uid } = req.query;
    if (!uid) return res.status(400).json({ error: "Missing uid" });
    try {
        const inventorySnap = await admin.firestore().collection('users').doc(uid).collection('inventory').get();
        const ownedCards = {};
        inventorySnap.docs.forEach(d => {
            const data = d.data();
            ownedCards[data.itemId] = { ...data, docId: d.id };
        });

        const userDoc = await admin.firestore().collection('users').doc(uid).get();
        const userData = userDoc.exists ? userDoc.data() : {};
        
        // Load all possible equipment slots
        const equippedStudent = userData.equipped_student_avatar || 's_aiden_v2';
        const equippedFrame = userData.equipped_frame || null;
        
        // Tutor slots per subject
        const equippedTutors = {
            english: userData.equipped_tutor_english || userData.equipped_tutor || 'default_janie',
            maths: userData.equipped_tutor_maths || userData.equipped_tutor || 'default_matt',
            ace: userData.equipped_tutor_ace || userData.equipped_tutor || 'default_ace',
            general: userData.equipped_tutor_ace || userData.equipped_tutor || 'default_ace'
        };

        const cardPool = require('../data/card_pool.json');

        const studentCards = cardPool.student_cards.map(c => ({
            ...c, type: 'student', owned: !!ownedCards[c.id], equipped: equippedStudent === c.id, acquiredAt: ownedCards[c.id]?.acquiredAt || null
        }));

        const isEquippedTutor = (card) => {
            const slotValue = equippedTutors[card.subject] || equippedTutors.ace;
            return slotValue === card.id;
        };

        const tutorCards = cardPool.tutor_cards.map(c => ({
            ...c, type: 'tutor', owned: !!ownedCards[c.id], equipped: isEquippedTutor(c), acquiredAt: ownedCards[c.id]?.acquiredAt || null
        }));

        const defaultTutors = cardPool.default_tutors.map(c => ({
            ...c, type: 'tutor', owned: true, equipped: isEquippedTutor(c)
        }));

        const avatarFrames = cardPool.avatar_frames.map(c => ({
            ...c, type: 'frame', owned: !!ownedCards[c.id], equipped: equippedFrame === c.id, acquiredAt: ownedCards[c.id]?.acquiredAt || null
        }));

        const allTutorCards = [...defaultTutors, ...tutorCards];
        const uniqueTutors = [];
        const seenTutors = new Set();
        
        allTutorCards.forEach(card => {
            const key = `${card.id}`; // Simple ID based unique check
            if (!seenTutors.has(key)) {
                uniqueTutors.push(card);
                seenTutors.add(key);
            } else if (card.equipped) {
                const existing = uniqueTutors.find(t => t.id === key);
                if (existing) existing.equipped = true;
            }
        });

        res.json({
            catalog: { studentCards, tutorCards: uniqueTutors, avatarFrames },
            stats: {
                totalStudentCards: cardPool.student_cards.length,
                ownedStudentCards: studentCards.filter(c => c.owned).length,
                totalTutorCards: uniqueTutors.length,
                ownedTutorCards: uniqueTutors.filter(c => c.owned).length,
                ownedFrames: avatarFrames.filter(c => c.owned).length
            }
        });
    } catch (e) {
        console.error("Collection Fetch Error:", e);
        res.status(500).json({ error: "Failed to fetch collection" });
    }
});

module.exports = router;
