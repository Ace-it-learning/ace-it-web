const express = require('express');
const router = express.Router();
const path = require('path');
const admin = require('firebase-admin');
const moment = require('moment');
const crypto = require('crypto');
const LabService = require('../services/LabService');
const MathsLabService = require('../services/maths/MathsLabService');
const GenerativeAIService = require('../services/GenerativeAIService');
const QuestionBankStore = require('../services/QuestionBankStore');
const CosmosStore = require('../services/CosmosStore');
const ReportSchedulerService = require('../services/ReportSchedulerService');
const fs = require('fs');

const MOCK_TOPICS = [
    "School Open Day",
    "Environmental Conservation Campaign",
    "Student Council Election",
    "Sports Day Planning",
    "Cultural Festival Organization",
    "Career Fair Preparation"
];

// POST /api/admin/generate-listening-mock
router.post('/generate-listening-mock', async (req, res) => {
    const { topic } = req.body;

    if (!topic) {
        return res.status(400).json({ error: 'Topic is required' });
    }

    console.log(`[Admin] Generating listening mock for topic: ${topic}`);

    try {
        const blueprintPath = path.join(__dirname, '../blueprints/Eng_Listening_Blueprint.json');
        const blueprint = fs.readFileSync(blueprintPath, 'utf8');

        const prompt = `You are an expert HKDSE English Exam Designer. Generate a complete Paper 3 Listening Mock Exam on the topic: "${topic}".

        **CONTEXT**: This is for Hong Kong DSE students (Secondary 4-6). The exam must follow the official HKDSE format.

        **BLUEPRINT REFERENCE**:
        ${blueprint}

        **OUTPUT FORMAT (STRICT JSON)** - Generate 3-5 documents in data_file array with types: email, minutes, poster, webpage, note, memo

        **STRICT MCQ RULES**:
        1. For MCQ tasks, provided 'options' MUST start with 'A) ', 'B) ', 'C) ', 'D) '.
        2. The 'answer' for MCQ MUST be a single letter (e.g., "A").

        **CRITICAL**: Part_B.data_file MUST be an array of document objects, NOT a string.

        Generate the complete mock exam with multi-document Data File now.`;

        const result = await GenerativeAIService.generateContent(prompt, {
            model: 'gemini-2.0-flash',
            generationConfig: { responseMimeType: "application/json" }
        });

        const responseText = result.response.text();
        let cleanedText = responseText.trim();
        if (cleanedText.includes('```json')) {
            cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        }

        const mockData = JSON.parse(cleanedText);

        // Save to file
        const outputDir = path.join(__dirname, '../generated_mocks/listening');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const filename = `Listening_${topic.replace(/\s+/g, '_')}_${Date.now()}.json`;
        const filepath = path.join(outputDir, filename);

        fs.writeFileSync(filepath, JSON.stringify(mockData, null, 2));

        console.log(`[Admin] Successfully generated: ${filename}`);

        res.json({
            success: true,
            filename,
            stats: {
                partATasks: mockData.Part_A?.tasks?.length || 0,
                partBDocuments: mockData.Part_B?.data_file?.length || 0,
                partBTasks: mockData.Part_B?.tasks?.length || 0
            }
        });

    } catch (error) {
        console.error(`[Admin] Failed to generate listening mock:`, error);
        res.status(500).json({
            error: 'Failed to generate listening mock',
            message: error.message
        });
    }
});

// GET /api/admin/mock-topics
router.get('/mock-topics', (req, res) => {
    res.json({ topics: MOCK_TOPICS });
});
const { runPipeline } = require('../mockGenerator');

// Middleware: Simple Admin Secret Check
// In production, use Firebase Claims. For now/MVP, use a secret header/body param.
const requireAdmin = (req, res, next) => {
    const secret = req.headers['x-admin-secret'] || req.body.adminSecret;
    // Hardcoded for MVP, ideally in .env
    const VALID_SECRET = process.env.ADMIN_SECRET || "ace-it-admin-secret-123";

    if (secret === VALID_SECRET) {
        next();
    } else {
        res.status(403).json({ error: "Unauthorized. Admin access only." });
    }
};

// GET /api/admin/reports/weekly/status
router.get('/reports/weekly/status', requireAdmin, (req, res) => {
    res.json({
        success: true,
        scheduler: ReportSchedulerService.getStatus()
    });
});

// POST /api/admin/reports/weekly/run
router.post('/reports/weekly/run', requireAdmin, async (req, res) => {
    try {
        const dryRun = req.body?.dryRun === true || req.query?.dryRun === 'true';
        const result = await ReportSchedulerService.runWeeklyReports({
            dryRun,
            source: dryRun ? 'admin_dry_run' : 'admin_manual'
        });
        res.status(result?.skipped ? 409 : 200).json({
            success: !result?.skipped,
            result
        });
    } catch (error) {
        console.error('[AdminReports] Weekly report run failed:', error);
        res.status(500).json({ error: error.message || 'Failed to run weekly reports' });
    }
});

// POST /api/admin/generate-mock
router.post('/generate-mock', requireAdmin, async (req, res) => {
    const { topic, paperType } = req.body;

    if (!topic) return res.status(400).json({ error: "Topic is required" });

    console.log(`[Admin] Triggering Mock Generation: ${topic} (${paperType})`);

    // Run async (Fire and Forget) or Await?
    // Generation takes ~30s. Vercel/Cloud Run has 60s timeout. 
    // It's safer to "Fire and Forget" and return "Job Started".
    // However, for local dev, we can await.
    // Let's await for now to give immediate feedback, but catch timeout errors.

    try {
        // Note: runPipeline saves to disk. It doesn't return the JSON directly yet.
        await runPipeline(topic, paperType || "Reading");

        res.json({
            success: true,
            message: `Mock Exam (${paperType}) for '${topic}' generated successfully.`,
            note: "File saved to generated_mocks directory."
        });
    } catch (e) {
        console.error("Admin Generation Error:", e);
        res.status(500).json({ error: "Generation Failed", details: e.message });
    }
});

// --- QUEST FACTORY DIFFICULTY TIERS ---
const DIFFICULTY_TIERS = {
    'easy': { levels: ["3"], xp: 50 },
    'medium': { levels: ["4"], xp: 75 },
    'standard': { levels: ["5"], xp: 100 },
    'elite': { levels: ["7"], xp: 150 }
};

// --- QUEST FACTORY ROUTES ---

// POST /api/admin/quests/generate-batch
router.post('/quests/generate-batch', requireAdmin, async (req, res) => {
    const { subject, topic, paper, totalCount = 10, tiers = ["easy"], questMode, weeklyTheme, clusterIds } = req.body;

    if (!subject || !topic || !tiers || tiers.length === 0) {
        return res.status(400).json({ error: "Missing subject, topic or tiers" });
    }

    // --- WEEKLY QUEST MODE ---
    if (questMode === 'weekly') {
        const { batchIndex = 0, existingPassage = null } = req.body;
        const isWriting = topic === 'writing_general';

        console.log(`[AdminFactory] 🚀 WEEKLY ${isWriting ? 'WRITING' : 'READING'} MODE. Theme: "${weeklyTheme}" | Batch: ${batchIndex + 1}/${isWriting ? 1 : 5}`);

        // Generate week ID from current date (consistent with Gamification Service)
        const weekId = moment().format('YYYY_WW');

        // Reading-specific logic
        const SKILL_CLUSTERS = [
            { skills: ['reading_literalComprehension', 'reading_inference', 'reading_mainIdea'], label: 'Comprehension Core' },
            { skills: ['reading_detailRecognition', 'reading_sequencing', 'reading_synthesis'], label: 'Analysis & Structure' },
            { skills: ['reading_factVsOpinion', 'reading_authorPurpose', 'reading_toneAttitude'], label: 'Critical Evaluation' },
            { skills: ['reading_registerStyle', 'reading_metaphoricalLanguage', 'reading_textOrganization'], label: 'Language & Style' },
            { skills: ['reading_paraphrasing', 'reading_cohesionReference', 'reading_skimmingScanning'], label: 'Applied Skills' }
        ];

        const cluster = isWriting ? { label: 'Generic Writing' } : SKILL_CLUSTERS[batchIndex];
        if (!cluster) {
            return res.status(400).json({ error: `Invalid batch index: ${batchIndex}` });
        }

        try {
            console.log(`[AdminFactory] Weekly Batch ${batchIndex + 1}/${isWriting ? 1 : 5}: ${cluster.label}`);

            const result = await LabService.generateLesson({
                topic: isWriting ? 'writing_general' : 'reading_weekly',
                level: '5',
                isFactory: true,
                isWeeklyQuest: true,
                targetCount: 20,
                weeklyTheme: weeklyTheme,
                weeklySkillCluster: isWriting ? null : cluster.skills,
                weeklyClusterLabel: cluster.label,
                existingPassage: existingPassage,
                weekId: weekId
            });

            // Capture passage — STRICT LOCK: prioritize existing over AI-revised
            const activePassage = existingPassage || result.reading_passage;

            if (result.interactive_tasks) {
                const decorated = result.interactive_tasks.map(t => ({
                    ...t,
                    level: '5',
                    quest_type: 'weekly',
                    week_id: weekId,
                    weekly_cluster: cluster.label
                }));

                console.log(`[AdminFactory] ✅ Weekly Batch ${batchIndex + 1} complete: ${decorated.length} questions.`);
                return res.json({
                    success: true,
                    count: decorated.length,
                    weekId: weekId,
                    passage: activePassage,
                    tasks: decorated
                });
            } else {
                throw new Error("No tasks returned from AI service");
            }
        } catch (e) {
            console.error("[AdminFactory] Weekly Quest Error:", e);
            return res.status(500).json({ error: "Weekly quest generation failed", details: e.message });
        }
    }

    // --- GENERAL QUEST MODE (existing logic) ---

    // Map tiers to specific levels
    let levels = [];
    tiers.forEach(t => {
        const mapping = DIFFICULTY_TIERS[t.toLowerCase()];
        if (mapping) levels.push(...mapping.levels);
    });
    levels = [...new Set(levels)]; // Deduplicate

    // Detection for Atomic Mode (Reading/Listening/Writing)
    const isPassageBased = (
        topic.startsWith('reading_') ||
        topic.startsWith('listening_') ||
        topic.startsWith('writing_') ||
        ['reading', 'listening', 'writing'].includes(paper?.toLowerCase())
    ) && subject.toLowerCase() === 'english';

    if (isPassageBased && levels.length > 1) {
        console.log(`[AdminFactory] Atomic Mode detected. Pinning to first level: ${levels[0]}`);
        levels = [levels[0]]; // Force single passage
    }

    console.log(`[AdminFactory] Batch: ${subject} | ${topic} | Total: ${totalCount} | Tiers: ${tiers.join(', ')} | Resolved Levels: ${levels.join(', ')}`);
    console.log(`[AdminFactory] Full Body:`, JSON.stringify(req.body));

    try {
        const results = [];
        const CHUNK_SIZE = subject.toLowerCase() === 'maths' ? 20 : 5;
        const clusters = (subject.toLowerCase() === 'maths' && Array.isArray(clusterIds) && clusterIds.length > 0) ? clusterIds : [req.body.clusterId || null];
        const totalUnits = levels.length * clusters.length;

        // Build all generation units (level × cluster combinations)
        const generationUnits = [];
        let remainingTargetCount = totalCount;
        let unitsProcessed = 0;

        for (const level of levels) {
            for (const cluster of clusters) {
                unitsProcessed++;
                const countPerUnit = unitsProcessed === totalUnits
                    ? remainingTargetCount
                    : Math.max(1, Math.floor(totalCount / totalUnits));
                remainingTargetCount -= countPerUnit;
                generationUnits.push({ level, cluster, countPerUnit });
            }
        }

        // 1. Process Generation Units with Concurrency Control
        const CONCURRENCY_LIMIT_UNITS = 2; // Process 2 level/cluster units at a time
        console.log(`[AdminFactory] Launching ${generationUnits.length} generation units (Concurrency: ${CONCURRENCY_LIMIT_UNITS})...`);

        for (let i = 0; i < generationUnits.length; i += CONCURRENCY_LIMIT_UNITS) {
            const batchUnits = generationUnits.slice(i, i + CONCURRENCY_LIMIT_UNITS);
            const batchPromises = batchUnits.map(async ({ level, cluster, countPerUnit }) => {
                const unitResults = [];
                let generatedForUnit = 0;
                console.log(`[AdminFactory] Processing Level: ${level}, Cluster: ${cluster} (Target: ${countPerUnit})`);

                while (generatedForUnit < countPerUnit) {
                    try {
                        const remainingForUnit = countPerUnit - generatedForUnit;
                        const batchSize = Math.min(remainingForUnit, CHUNK_SIZE);

                        const isWriting = topic.startsWith('writing_') || paper?.toLowerCase() === 'writing';
                        const effectiveTarget = isWriting ? 4 : (isPassageBased ? 20 : batchSize);

                        console.log(`[AdminFactory] Generating unit: ${effectiveTarget} questions for level ${level}, cluster ${cluster}`);

                        let result;
                        if (subject.toLowerCase() === 'maths') {
                            result = await MathsLabService.generateLesson({
                                topic,
                                level,
                                language: 'zh',
                                isFactory: true,
                                targetCount: effectiveTarget,
                                clusterId: cluster
                            });
                        } else {
                            result = await LabService.generateLesson({
                                topic,
                                level,
                                paperType: paper || 'Reading',
                                isFactory: true,
                                targetCount: effectiveTarget
                            });
                        }

                        if (result.interactive_tasks) {
                            const decorated = result.interactive_tasks.map(t => ({
                                ...t,
                                level,
                                passage: result.reading_passage || result.passage_text || (isWriting ? (result.interaction_context || "No writing situation provided.") : ""),
                                audio_segments: result.audio_segments || []
                            }));
                            unitResults.push(...decorated);
                            generatedForUnit += isPassageBased ? 1 : result.interactive_tasks.length;

                            if (result.interactive_tasks.length === 0) break;
                        } else {
                            break;
                        }
                    } catch (innerError) {
                        console.error(`[AdminFactory] Unit generation failed for level ${level}, cluster ${cluster}:`, innerError);
                        break;
                    }
                }
                return unitResults;
            });

            const batchResults = await Promise.allSettled(batchPromises);
            for (const result of batchResults) {
                if (result.status === 'fulfilled') {
                    results.push(...result.value);
                } else {
                    console.error(`[AdminFactory] A generation unit failed:`, result.reason?.message || result.reason);
                }
            }
            console.log(`[AdminFactory] Unit batch complete. Total in session: ${results.length}`);
        }

        console.log(`[AdminFactory] Generation Cycle Complete. Total items in batch: ${results.length}`);
        res.json({
            success: true,
            count: results.length,
            tasks: results
        });
    } catch (e) {
        console.error("Batch Generation Error:", e);
        res.status(500).json({ error: "Batch generation failed", details: e.message });
    }
});

function _adminQuestDate(q) {
    const v = q.created_at;
    if (v == null) return new Date(0);
    if (typeof v.toDate === 'function') return v.toDate();
    if (typeof v === 'string' || typeof v === 'number') return new Date(v);
    return new Date(0);
}

// GET /api/admin/quests/search
router.get('/quests/search', requireAdmin, async (req, res) => {
    const { subject, topic, status, level, limit = 200 } = req.query;
    try {
        let topic_id = null;
        let topicParam = null;
        if (topic && topic !== 'All') {
            if (topic.includes('_')) {
                topic_id = topic;
            } else {
                topicParam = topic;
            }
        }

        let results = await QuestionBankStore.queryQuestSearch({
            subject: subject || undefined,
            topic: topicParam,
            topic_id,
            level,
            limit: Number(limit)
        });
        results = results.map((q) => ({ id: q.id, ...q }));

        // Refine "Released" status and apply bilingual field mapping for math
        results = results.map(q => {
            let currentStatus = 'Pending';
            if (q.is_approved) {
                currentStatus = q.topic_id ? 'Approved and Released' : 'Approved';
            }

            // Universal Bilingual Mapping for Math
            if (q.subject?.toLowerCase() === 'maths') {
                q.text = q.text || q.question || q.question_en;
                q.text_zh = q.text_zh || q.question_zh;
            }

            return { ...q, currentStatus };
        });

        if (status === 'Released') {
            results = results.filter(q => q.currentStatus === 'Approved and Released');
        } else if (status === 'ApprovedOnly') {
            results = results.filter(q => q.currentStatus === 'Approved');
        } else if (status === 'Pending') {
            results = results.filter(q => q.currentStatus === 'Pending');
        }

        results.sort((a, b) => _adminQuestDate(b) - _adminQuestDate(a));

        res.json(results);
    } catch (e) {
        console.error("Search Quests Error:", e);
        res.status(500).json({ error: e.message });
    }
});

// GET /api/admin/quests/pending
router.get('/quests/pending', requireAdmin, async (req, res) => {
    try {
        const rows = await QuestionBankStore.queryPending(50);
        const pending = rows.map((row) => ({ id: row.id, ...row }));
        res.json(pending);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// POST /api/admin/quests/approve
router.post('/quests/approve', requireAdmin, async (req, res) => {
    const { questId } = req.body;
    if (!questId) return res.status(400).json({ error: "Quest ID required" });

    try {
        const data = await QuestionBankStore.getById(questId);
        if (!data) return res.status(404).json({ error: "Quest not found" });

        const levelStr = String(data.level);

        let xpReward = 50;
        for (const tier in DIFFICULTY_TIERS) {
            if (DIFFICULTY_TIERS[tier].levels.includes(levelStr)) {
                xpReward = DIFFICULTY_TIERS[tier].xp;
                break;
            }
        }

        await QuestionBankStore.upsertById(
            questId,
            {
                is_approved: true,
                xp_reward: xpReward,
                approved_at: new Date().toISOString()
            },
            { merge: true }
        );
        res.json({ success: true, xp_reward: xpReward });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// DELETE /api/admin/quests/delete
router.delete('/quests/delete', requireAdmin, async (req, res) => {
    const { questId } = req.body;
    if (!questId) return res.status(400).json({ error: "Quest ID required" });

    try {
        await QuestionBankStore.deleteById(questId);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// POST /api/admin/quests/delete-batch (handles groups)
router.post('/quests/delete-batch', requireAdmin, async (req, res) => {
    const { questIds } = req.body;
    if (!questIds || !Array.isArray(questIds)) {
        return res.status(400).json({ error: "Array of questIds required" });
    }

    try {
        const count = await QuestionBankStore.deleteByIds(questIds);
        res.json({ success: true, count });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// POST /api/admin/quests/reject-batch
router.post('/quests/reject-batch', requireAdmin, async (req, res) => {
    const { questIds } = req.body;
    if (!questIds || !Array.isArray(questIds)) {
        return res.status(400).json({ error: "Array of questIds required" });
    }

    try {
        const count = await QuestionBankStore.deleteByIds(questIds);
        res.json({ success: true, count });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});
router.post('/quests/approve-batch', requireAdmin, async (req, res) => {
    const { questIds } = req.body;
    if (!questIds || !Array.isArray(questIds)) {
        return res.status(400).json({ error: "Array of questIds required" });
    }

    const results = [];

    try {
        for (const questId of questIds) {
            const data = await QuestionBankStore.getById(questId);
            if (!data) continue;

            const levelStr = String(data.level);

            let xpReward = 50;
            for (const tier in DIFFICULTY_TIERS) {
                if (DIFFICULTY_TIERS[tier].levels.includes(levelStr)) {
                    xpReward = DIFFICULTY_TIERS[tier].xp;
                    break;
                }
            }

            await QuestionBankStore.upsertById(
                questId,
                {
                    is_approved: true,
                    xp_reward: xpReward,
                    approved_at: new Date().toISOString()
                },
                { merge: true }
            );
            results.push({ id: questId, xp_reward: xpReward });
        }

        res.json({ success: true, count: results.length, approved: results });
    } catch (e) {
        console.error("[AdminBatch] Approval Failed:", e);
        res.status(500).json({ error: e.message });
    }
});

// DELETE /api/admin/quests/wipe-pending
router.delete('/quests/wipe-pending', requireAdmin, async (req, res) => {
    try {
        const pending = await QuestionBankStore.queryPending(500);
        if (!pending.length) {
            return res.json({ success: true, count: 0, message: "No pending quests to wipe." });
        }

        const ids = pending.map((p) => p.id).filter(Boolean);
        const count = await QuestionBankStore.deleteByIds(ids);

        res.json({
            success: true,
            count,
            message: `Successfully wiped ${count} pending quests.`
        });
    } catch (e) {
        console.error("[AdminBatch] Wipe Failed:", e);
        res.status(500).json({ error: e.message });
    }
});

// GET /api/admin/maths/topic-audit (Super Audit Mode for specific topic)
router.get('/maths/topic-audit', requireAdmin, async (req, res) => {
    const { topicId } = req.query;
    if (!topicId) return res.status(400).json({ error: "Topic ID required" });

    try {
        console.log(`[AdminAudit] Fetching all questions for topic: ${topicId}`);
        
        let questions;
        if (topicId === 'integrated_challenge') {
            const rows = await CosmosStore.getIntegratedChallenges(3000);
            questions = rows.map((data) => {
                let text = data.text || data.question || data.question_en || data.content_en;
                let text_zh = data.text_zh || data.question_zh || data.content_zh;
                return {
                    id: data.id,
                    ...data,
                    text,
                    text_zh
                };
            });
        } else {
            const rows = await QuestionBankStore.queryByTopicId(topicId, 2000);
            questions = rows.map((data) => {
                let text = data.text || data.question || data.question_en || data.content_en;
                let text_zh = data.text_zh || data.question_zh || data.content_zh;
                return {
                    id: data.id,
                    ...data,
                    text,
                    text_zh
                };
            });
        }

        questions.sort((a, b) => {
            if (a.level !== b.level) return (a.level || 0) - (b.level || 0);
            return _adminQuestDate(b) - _adminQuestDate(a);
        });

        res.json(questions);
    } catch (e) {
        console.error("Topic Audit Error:", e);
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;
