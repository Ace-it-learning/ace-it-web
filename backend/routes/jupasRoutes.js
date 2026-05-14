const express = require('express');
const router = express.Router();
const JupasProgrammeService = require('../services/JupasProgrammeService');

/**
 * GET /api/jupas/programmes
 * Get all JUPAS programmes (optionally filtered by university)
 * Query params: university (optional)
 */
router.get('/programmes', async (req, res) => {
    try {
        const { university } = req.query;
        const programmes = university 
            ? await JupasProgrammeService.getProgrammesByUniversity(university)
            : await JupasProgrammeService.getAllProgrammes();
        
        res.json({ 
            success: true, 
            count: programmes.length,
            programmes 
        });
    } catch (error) {
        console.error('[JUPAS] Failed to fetch programmes:', error);
        res.status(500).json({ error: 'Failed to fetch programmes' });
    }
});

/**
 * GET /api/jupas/programmes/:code
 * Get a single programme by code
 */
router.get('/programmes/:code', async (req, res) => {
    try {
        const { code } = req.params;
        const programme = await JupasProgrammeService.getProgrammeByCode(code);
        if (!programme) {
            return res.status(404).json({ error: 'Programme not found' });
        }
        res.json({ success: true, programme });
    } catch (error) {
        console.error('[JUPAS] Failed to fetch programme:', error);
        res.status(500).json({ error: 'Failed to fetch programme' });
    }
});

/**
 * GET /api/jupas/programmes/:code/details
 * Get detailed content for a programme
 */
router.get('/programmes/:code/details', async (req, res) => {
    try {
        const { code } = req.params;
        const [programme, details] = await Promise.all([
            JupasProgrammeService.getProgrammeByCode(code),
            JupasProgrammeService.getProgrammeDetails(code)
        ]);
        
        if (!programme) {
            return res.status(404).json({ error: 'Programme not found' });
        }
        
        res.json({ 
            success: true, 
            programme,
            details: details || null
        });
    } catch (error) {
        console.error('[JUPAS] Failed to fetch programme details:', error);
        res.status(500).json({ error: 'Failed to fetch programme details' });
    }
});

module.exports = router;
