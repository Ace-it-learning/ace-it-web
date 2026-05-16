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
 * Transform Cosmos DB detail document into nested sections format for frontend.
 * Supports TWO formats:
 * 1. NEW flat format: overviewEn, admissionEn, ... overviewZh, admissionZh, ...
 * 2. OLD nested format: details.en.sections, details.zh.sections
 */
function transformDetailsToSections(details) {
    if (!details) return null;

    // Check if already in nested format (old programmes like JS6456)
    if (details.en?.sections || details.zh?.sections) {
        const result = { en: { sections: {} }, zh: { sections: {} } };
        
        // Convert old format content arrays to strings then back to arrays
        // to ensure consistent formatting
        const sectionKeys = [
            'overview', 'admission', 'curriculum', 'career',
            'campus', 'competitiveness', 'alumni', 'scholarships', 'tips'
        ];
        
        for (const key of sectionKeys) {
            if (details.en?.sections?.[key]) {
                const section = details.en.sections[key];
                result.en.sections[key] = {
                    title: key,
                    content: Array.isArray(section.content) 
                        ? section.content 
                        : (section.content || '').split('\n').filter(line => line.trim())
                };
            }
            if (details.zh?.sections?.[key]) {
                const section = details.zh.sections[key];
                result.zh.sections[key] = {
                    title: key,
                    content: Array.isArray(section.content) 
                        ? section.content 
                        : (section.content || '').split('\n').filter(line => line.trim())
                };
            }
        }
        return result;
    }

    // NEW flat format (programmes seeded with flat fields)
    const sectionKeys = [
        'overview', 'admission', 'curriculum', 'career',
        'campus', 'competitiveness', 'alumni', 'scholarships', 'tips'
    ];

    const result = { en: { sections: {} }, zh: { sections: {} } };

    for (const key of sectionKeys) {
        const enContent = details[`${key}En`];
        const zhContent = details[`${key}Zh`];

        if (enContent) {
            result.en.sections[key] = {
                title: key,
                content: enContent.split('\n').filter(line => line.trim())
            };
        }
        if (zhContent) {
            result.zh.sections[key] = {
                title: key,
                content: zhContent.split('\n').filter(line => line.trim())
            };
        }
    }

    return result;
}

/**
 * GET /api/jupas/programmes/:code/details
 * Get detailed content for a programme
 */
router.get('/programmes/:code/details', async (req, res) => {
    try {
        const { code } = req.params;
        const [programme, details] = await Promise.all([
            JupasProgrammeService.getProgrammeByCodeFresh(code),
            JupasProgrammeService.getProgrammeDetails(code)
        ]);
        
        if (!programme) {
            return res.status(404).json({ error: 'Programme not found' });
        }
        
        res.json({ 
            success: true, 
            programme,
            details: transformDetailsToSections(details)
        });
    } catch (error) {
        console.error('[JUPAS] Failed to fetch programme details:', error);
        res.status(500).json({ error: 'Failed to fetch programme details' });
    }
});

module.exports = router;
