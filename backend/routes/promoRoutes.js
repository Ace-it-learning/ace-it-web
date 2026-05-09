const express = require('express');
const router = express.Router();
const PromoCodeService = require('../services/PromoCodeService');

// POST /api/promo/validate
router.post('/validate', async (req, res) => {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: "Code is required" });

    try {
        const result = await PromoCodeService.validateCode(code);
        res.json(result);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

module.exports = router;
