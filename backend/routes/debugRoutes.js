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

// GET /api/debug/test-ai (Vertex AI 2026 Architecture Test)
router.get('/test-ai', async (req, res) => {
    try {
        console.log('[DEBUG] Testing Vertex AI 2026 Architecture...');

        // Ensure AI service is initialized
        await GenerativeAIService.init();

        // Test with a simple prompt
        const model = GenerativeAIService.getModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent('Say "Hello from Ace‑It Vertex AI 2026 Test"');
        const response = await result.response;
        const text = response.text();

        res.json({
            success: true,
            status: 'Vertex AI operational',
            platform: GenerativeAIService.isVertex ? 'vertex' : 'ai-studio',
            region: GenerativeAIService.currentRegion,
            model: 'gemini-1.5-flash',
            response: text,
            environment: {
                GOOGLE_CLOUD_PROJECT: process.env.GOOGLE_CLOUD_PROJECT || 'missing',
                K_SERVICE: process.env.K_SERVICE || 'not-cloud-run',
                VERTEX_LOCATION: process.env.VERTEX_LOCATION || 'not-set',
                USE_AI_STUDIO_IN_PROD: process.env.USE_AI_STUDIO_IN_PROD || 'false'
            }
        });
    } catch (error) {
        console.error('[DEBUG] Vertex AI Test Failed:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            stack: process.env.NODE_ENV === 'production' ? undefined : error.stack,
            environment: {
                GOOGLE_CLOUD_PROJECT: process.env.GOOGLE_CLOUD_PROJECT || 'missing',
                K_SERVICE: process.env.K_SERVICE || 'not-cloud-run',
                VERTEX_LOCATION: process.env.VERTEX_LOCATION || 'not-set',
                USE_AI_STUDIO_IN_PROD: process.env.USE_AI_STUDIO_IN_PROD || 'false'
            }
        });
    }
});

// POST /api/debug/test-ai-advanced (Direct Vertex AI with explicit credentials)
router.post('/test-ai-advanced', async (req, res) => {
    // [2026] DEV HARDENING: Block direct Vertex AI tests in Dev
    if (process.env.NODE_ENV === 'development' && process.env.I_KNOW_THIS_COSTS_MONEY !== 'true') {
        return res.status(403).json({ 
            error: "ENDPOINT BLOCKED IN DEV", 
            message: "Direct Vertex AI testing is blocked to prevent accidental billing. Use AI Studio instead." 
        });
    }

    try {
        console.log('[DEBUG] Testing Vertex AI with explicit credentials...');

        // Load service account credentials
        const path = require('path');
        const fs = require('fs');
        const credentialsPath = path.join(__dirname, '../config/serviceAccountKey.json');

        if (!fs.existsSync(credentialsPath)) {
            return res.status(500).json({
                success: false,
                error: 'Service Account file not found',
                path: credentialsPath
            });
        }

        const credentials = require(credentialsPath);
        const { VertexAI } = require('@google-cloud/vertexai');

        // Initialize VertexAI with explicit credentials
        const vertexai = new VertexAI({
            project: 'ace-it-production-1e0a4',
            location: 'asia-east1',
            googleAuthOptions: { credentials }
        });

        // Try gemini-1.5-flash
        const model = vertexai.getGenerativeModel({
            model: 'gemini-1.5-flash',
            generationConfig: { maxOutputTokens: 50 }
        });

        const result = await model.generateContent('Say "Hello from explicit credentials test"');
        const response = await result.response;
        const text = response.text();

        res.json({
            success: true,
            message: 'Vertex AI with explicit credentials works',
            serviceAccount: credentials.client_email,
            region: 'asia-east1',
            response: text
        });
    } catch (error) {
        console.error('[DEBUG] Explicit Credentials Test Failed:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            serviceAccount: error.client_email || 'unknown'
        });
    }
});

module.exports = router;
