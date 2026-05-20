const express = require('express');
const router = express.Router();
const EnglishMockService = require('../services/EnglishMockService');
const MockAssessmentService = require('../services/MockAssessmentService');

/**
 * GET /api/english/mock/headers/:paperCode
 * Get headers for Paper 1, 2, 3, or 4
 */
router.get('/headers/:paperCode', async (req, res) => {
    try {
        const headers = await EnglishMockService.getLibraryHeaders(req.params.paperCode);
        res.json(headers);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

/**
 * POST /api/english/mock/submit
 * Submit mock answers for assessment
 */
router.post('/submit', async (req, res) => {
    try {
        const { paperId, userAnswers, analytics } = req.body;
        const resolvedUid = req.uid || req.body?.uid || req.query?.uid || null;
        if (!paperId || !userAnswers) {
            return res.status(400).json({ error: "Missing paperId or userAnswers" });
        }

        const mockData = await EnglishMockService.getMockPaper(paperId);
        if (!mockData) return res.status(404).json({ error: "Paper not found" });

        // FETCH USER TIER
        let tier = 'free';
        if (resolvedUid && resolvedUid !== 'guest') {
            const UserProfileService = require('../services/UserProfileService');
            const profile = await UserProfileService.getProfile(resolvedUid);
            tier = profile?.subscription_tier || 'free';
        }

        const assessment = await MockAssessmentService.evaluatePaper(mockData, userAnswers, analytics, tier);
        
        // Award XP based on marks result (Standard: 250 XP max for Reading Mock)
        const baseMaxXP = 250;
        const awardedXP = Math.round(baseMaxXP * (assessment.percentage / 100));
        
        // Attempt to award XP if user is logged in
        if (resolvedUid && resolvedUid !== 'guest') {
            try {
                const GamificationService = require('../services/GamificationService');
                const xpResult = await GamificationService.awardXP(resolvedUid, awardedXP, 'reading', {
                    title: `Mock Exam: ${mockData.meta?.topic || 'Paper 1'}`,
                    score: `${Math.round(assessment.percentage)}%`,
                    topic: mockData.meta?.topic,
                    paper: 'Paper 1'
                });
                assessment.xpAwarded = xpResult?.earned || awardedXP;
            } catch (e) {
                console.error("XP Award failed:", e);
                assessment.xpAwarded = awardedXP; // Fallback for UI display
            }
        } else {
            assessment.xpAwarded = awardedXP;
        }

        // 3. Sync to Mastery Radar
        if (resolvedUid && resolvedUid !== 'guest') {
            const UserProfileService = require('../services/UserProfileService');
            try {
                await UserProfileService.syncMockResultsToMastery(resolvedUid, 'english', assessment);
                await UserProfileService.saveProgressSnapshot(resolvedUid, 'english');
            } catch (e) {
                console.warn("[Mock] syncMockResultsToMastery failed:", e.message);
            }
            try {
                // Build minimal mock snapshot for standalone review
                const mockSnapshot = {
                    meta: mockData.meta,
                    Part_A: mockData.Part_A ? {
                        questions: mockData.Part_A.questions?.map(q => ({
                            id: q.id, text: q.text, type: q.type, marks: q.marks,
                            marking_scheme: q.marking_scheme, marking_logic: q.marking_logic
                        }))
                    } : null,
                    Part_B1: mockData.Part_B1 ? {
                        questions: mockData.Part_B1.questions?.map(q => ({
                            id: q.id, text: q.text, type: q.type, marks: q.marks,
                            marking_scheme: q.marking_scheme, marking_logic: q.marking_logic
                        }))
                    } : null,
                    Part_B2: mockData.Part_B2 ? {
                        questions: mockData.Part_B2.questions?.map(q => ({
                            id: q.id, text: q.text, type: q.type, marks: q.marks,
                            marking_scheme: q.marking_scheme, marking_logic: q.marking_logic
                        }))
                    } : null
                };
                const resultId = await UserProfileService.saveQuestResult(resolvedUid, {
                    ...assessment,
                    paperId,
                    type: 'READING',
                    topic: mockData.meta?.topic || 'Reading Mock',
                    userAnswers: req.body.userAnswers,
                    selectedSection: req.body.analytics?.selectedSection,
                    mockSnapshot
                });
                if (resultId) assessment.resultId = resultId;
            } catch (e) {
                console.warn('[Mock] saveQuestResult (reading) failed:', e.message);
            }
            try {
                await UserProfileService.saveMockSummary(resolvedUid, {
                    paper: 'Paper 1',
                    topic: mockData.meta?.topic || 'Reading Mock',
                    score: assessment.totalScore,
                    total: assessment.possibleScore,
                    percentage: assessment.percentage,
                    level: assessment.level,
                    topMistakes: extractTopMistakeSkills(assessment.skillScores),
                    achievedSkills: extractAchievedSkills(assessment.skillScores)
                });
            } catch (e) {
                console.warn("[Mock] saveMockSummary failed:", e.message);
            }
        }

        res.json(assessment);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

/**
 * Helper: pick up to 3 weakest skills from a skillScores object
 * (skill -> { score, possible }). Used to populate the tutor's
 * RECENT_ACTIVITY hint in `progress/mock_summary`.
 */
function extractTopMistakeSkills(skillScores) {
    if (!skillScores || typeof skillScores !== 'object') return [];
    return Object.entries(skillScores)
        .map(([skill, data]) => {
            const score = typeof data === 'number' ? data : (data?.score || 0);
            const total = typeof data === 'number' ? 100 : Number(data?.possible || 0);
            if (total <= 0) return null;
            const pct = total > 0 ? score / total : 0;
            return { skill, pct, score, total };
        })
        .filter(Boolean)
        .filter(({ score, total, pct }) => score < total && pct < 0.85)
        .sort((a, b) => a.pct - b.pct)
        .slice(0, 3)
        .map(s => s.skill);
}

function extractAchievedSkills(skillScores) {
    if (!skillScores || typeof skillScores !== 'object') return [];
    return Object.entries(skillScores)
        .map(([skill, data]) => {
            const score = typeof data === 'number' ? data : (data?.score || 0);
            const total = typeof data === 'number' ? 100 : Number(data?.possible || 0);
            if (total <= 0) return null;
            return { skill, pct: score / total };
        })
        .filter(Boolean)
        .filter(({ pct }) => pct >= 0.7)
        .sort((a, b) => b.pct - a.pct)
        .slice(0, 6)
        .map((s) => s.skill);
}

/**
 * POST /api/english/mock/submit-listening
 * Dedicated endpoint for Paper 3 (Listening & Integrated Skills)
 */
router.post('/submit-listening', async (req, res) => {
    try {
        const { paperId, userAnswers, analytics } = req.body;
        const resolvedUid = req.uid || req.body?.uid || req.query?.uid || null;
        const MockAssessmentService = require('../services/MockAssessmentService');
        const EnglishMockService = require('../services/EnglishMockService');
        
        const mockData = await EnglishMockService.getMockPaper(paperId);
        if (!mockData) return res.status(404).json({ error: "Paper not found" });

        // FETCH USER TIER
        let tier = 'free';
        if (resolvedUid && resolvedUid !== 'guest') {
            const UserProfileService = require('../services/UserProfileService');
            const profile = await UserProfileService.getProfile(resolvedUid);
            tier = profile?.subscription_tier || 'free';
        }

        const assessment = await MockAssessmentService.evaluatePaper(mockData, userAnswers, {
            ...analytics,
            paperType: 'LISTENING'
        }, tier);
        
        // Award XP (Standard: 500 XP max for Paper 3)
        const baseMaxXP = 500;
        const awardedXP = Math.round(baseMaxXP * (assessment.percentage / 100));
        
        if (resolvedUid && resolvedUid !== 'guest') {
            try {
                const GamificationService = require('../services/GamificationService');
                await GamificationService.awardXP(resolvedUid, awardedXP, 'listening', {
                    title: `Mock Exam: ${mockData.meta?.topic || 'Paper 3'}`,
                    score: `${Math.round(assessment.percentage)}%`,
                    topic: mockData.meta?.topic,
                    paper: 'Paper 3'
                });
            } catch (e) { console.error("XP Award failed:", e); }
        }
        assessment.xpAwarded = awardedXP;

        // 3. Sync to Mastery Radar & Persistent Storage
        if (resolvedUid && resolvedUid !== 'guest') {
            try {
                const UserProfileService = require('../services/UserProfileService');
                await UserProfileService.syncMockResultsToMastery(resolvedUid, 'english', assessment);
                await UserProfileService.saveProgressSnapshot(resolvedUid, 'english');

                // Save for persistent review
                const resultId = await UserProfileService.saveQuestResult(resolvedUid, {
                    ...assessment,
                    paperId,
                    type: 'LISTENING',
                    topic: mockData.meta?.topic || 'Listening Mock',
                    userAnswers: req.body.userAnswers,
                    selectedSection: req.body.analytics?.selectedSection
                });
                if (resultId) assessment.resultId = resultId;

                await UserProfileService.saveMockSummary(resolvedUid, {
                    paper: 'Paper 3',
                    topic: mockData.meta?.topic || 'Listening Mock',
                    score: assessment.totalScore,
                    total: assessment.possibleScore,
                    percentage: assessment.percentage,
                    level: assessment.level,
                    topMistakes: extractTopMistakeSkills(assessment.skillScores),
                    achievedSkills: extractAchievedSkills(assessment.skillScores)
                });
            } catch (err) {
                console.error("Mastery sync/Save failed:", err);
            }
        }

        res.json(assessment);
    } catch (e) {
        console.error("Listening Assessment error:", e);
        res.status(500).json({ error: e.message });
    }
});

/**
 * POST /api/english/mock/writing/submit
 * Submit a writing paper for evaluation
 */
router.post('/writing/submit', async (req, res) => {
    try {
        const { paperId, uid, email, responses } = req.body;
        const MockAssessmentService = require('../services/MockAssessmentService');
        const EnglishMockService = require('../services/EnglishMockService');
        
        // 1. Get mock data
        const mockData = await EnglishMockService.getMockPaper(paperId);
        if (!mockData) {
            return res.status(404).json({ error: 'Paper not found' });
        }

        const responseRows = Array.isArray(responses) ? responses : [];
        
        // 2. Prepare userAnswers format for MockAssessmentService
        const userAnswers = {
            partA_draft: responseRows.find(r => r.part === 'A')?.text || '',
            partB_draft: responseRows.find(r => r.part === 'B')?.text || '',
            selectedPartB: responseRows.find(r => r.part === 'B')
        };
        
        // FETCH USER TIER
        let tier = 'free';
        const targetUid = uid || req.uid || req.body?.uid || req.query?.uid;
        if (targetUid && targetUid !== 'guest') {
            try {
                const UserProfileService = require('../services/UserProfileService');
                const profile = await UserProfileService.getProfile(targetUid);
                tier = profile?.subscription_tier || 'free';
            } catch (profileErr) {
                console.warn('[Mock] getProfile failed for writing submit; using free tier:', profileErr.message);
            }
        }

        // 3. Evaluate
        const results = await MockAssessmentService.evaluatePaper(mockData, userAnswers, {
            paperType: 'WRITING',
            selectedPartB: userAnswers.selectedPartB
        }, tier);

        const topicLabel = mockData.meta?.topic || 'Writing Mock';
        const baseMaxXP = 400;
        const awardedXP = Math.round(baseMaxXP * ((results.percentage || 0) / 100));

        // 4. Persist to Cosmos + achievements timeline (same pattern as reading/listening mocks)
        if (targetUid && targetUid !== 'guest') {
            const UserProfileService = require('../services/UserProfileService');
            const targetWriteUid = targetUid;
            let resultId = null;
            try {
                // Extract student drafts from responses for standalone review
                const partA = responseRows.find(r => r.part === 'A') || {};
                const partB = responseRows.find(r => r.part === 'B') || {};
                resultId = await UserProfileService.saveQuestResult(targetWriteUid, {
                    ...results,
                    paperId,
                    type: 'WRITING',
                    topic: topicLabel,
                    draftA: partA.text || '',
                    titleA: partA.title || '',
                    draftB: partB.text || '',
                    titleB: partB.title || '',
                    selectedPartB: userAnswers.selectedPartB
                });
                if (resultId) results.resultId = resultId;
            } catch (e) {
                console.warn('[Mock] saveQuestResult (writing) failed:', e.message);
            }
            const scoreLabel = `${Math.round(results.percentage || 0)}%`;
            const timelineEntry = {
                type: 'practice',
                title: `Mock Exam: ${topicLabel}`,
                xp: awardedXP,
                score: scoreLabel,
                subject: 'english',
                topic: topicLabel,
                paper: 'writing',
                resultId: resultId || null
            };
            try {
                const GamificationService = require('../services/GamificationService');
                const xpResult = await GamificationService.awardXP(targetWriteUid, awardedXP, 'writing', {
                    title: timelineEntry.title,
                    score: scoreLabel,
                    topic: topicLabel,
                    paper: 'writing',
                    subject: 'english',
                    resultId: resultId || null,
                    alwaysRecordTimeline: true
                });
                results.xpAwarded = xpResult?.earned ?? awardedXP;
                timelineEntry.xp = results.xpAwarded;
                if (xpResult?.reason === 'daily_cap_reached' || xpResult?.success === false) {
                    await UserProfileService.recordTimelineEvent(targetWriteUid, {
                        ...timelineEntry,
                        xp: 0,
                        score: `${scoreLabel} (daily XP cap)`
                    });
                }
            } catch (e) {
                console.error('[Mock] Writing XP award failed:', e);
                results.xpAwarded = awardedXP;
                try {
                    await UserProfileService.recordTimelineEvent(targetWriteUid, timelineEntry);
                } catch (timelineErr) {
                    console.warn('[Mock] Writing timeline fallback failed:', timelineErr.message);
                }
            }
            await UserProfileService.syncMockResultsToMastery(targetWriteUid, 'english', results);
            try {
                await UserProfileService.saveProgressSnapshot(targetWriteUid, 'english');
            } catch (e) {
                console.warn("[Mock] saveProgressSnapshot (writing) failed:", e.message);
            }
            try {
                await UserProfileService.saveMockSummary(targetWriteUid, {
                    paper: 'Paper 2',
                    paperId,
                    mockId: paperId,
                    topic: topicLabel,
                    score: results.totalScore,
                    total: results.possibleScore,
                    percentage: results.percentage,
                    level: results.level || results.predicted_level,
                    topMistakes: extractTopMistakeSkills(results.skillScores),
                    achievedSkills: extractAchievedSkills(results.skillScores),
                    completedAt: new Date().toISOString()
                });
            } catch (e) {
                console.warn("[Mock] saveMockSummary (writing) failed:", e.message);
            }
        } else {
            results.xpAwarded = awardedXP;
        }

        res.json(results);
    } catch (e) {
        console.error("Writing submission error:", e);
        res.status(500).json({ error: e.message });
    }
});

/**
 * POST /api/english/mock/cheat/writing
 * Generate a model answer for a specific level
 */
router.post('/cheat/writing', async (req, res) => {
    try {
        const { level, part, type, situation, wordLimit, dataContext } = req.body;
        const WritingCheatService = require('../services/WritingCheatService');
        const response = await WritingCheatService.generateCheatResponse(level, part, type, situation, wordLimit, dataContext);
        res.json(response);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

/**
 * POST /api/english/mock/cheat/:paperId
 * Generate paper-specific cheat answers for dev/QA testing.
 * Requires dev access (isCheatEnabled check).
 */
router.post('/cheat/:paperId', async (req, res) => {
    try {
        const { paperId } = req.params;
        const { section, targetLevel } = req.body;
        const resolvedUid = req.uid || req.body?.uid || req.query?.uid || null;

        // Dev access check
        const normalizedEmail = (resolvedUid || '').toString().trim().toLowerCase();
        const isDev = normalizedEmail === 'fungtam@gmail.com' || normalizedEmail.startsWith('fungtam@');
        if (!isDev) {
            return res.status(403).json({ error: 'Dev access required' });
        }

        const mockData = await EnglishMockService.getMockPaper(paperId);
        if (!mockData) return res.status(404).json({ error: 'Paper not found' });

        const cheatAnswers = await MockAssessmentService.generateCheatAnswers(
            mockData,
            section || 'B1',
            targetLevel || '5'
        );

        res.json(cheatAnswers);
    } catch (e) {
        console.error('[Cheat] Error generating cheat answers:', e);
        res.status(500).json({ error: e.message });
    }
});

router.get('/:paperId', async (req, res) => {
    const { uid } = req.query;
    const { paperId } = req.params;

    // 1. Quota Check for Pro users
    if (uid && uid !== 'guest') {
        try {
            const UserProfileService = require('../services/UserProfileService');
            const quota = await UserProfileService.checkMockQuota(uid, paperId);
            if (!quota.allowed) {
                return res.status(403).json({ 
                    error: quota.message, 
                    code: 'QUOTA_REACHED' 
                });
            }
            
            // 2. Record Attempt (Counts as starting the exam)
            await UserProfileService.recordMockAttempt(uid, paperId);
        } catch (err) {
            console.error("Quota check failed:", err);
            // Fail open but log it
        }
    }

    try {
        const paper = await EnglishMockService.getMockPaper(paperId);
        if (!paper) return res.status(404).json({ error: "Paper not found" });
        res.json(paper);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;

