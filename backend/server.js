// --- ACE-IT BACKEND (MODULAR ARCHITECTURE v2.0) ---
// Global Error Handlers for Stability
process.on('uncaughtException', (err) => console.error('❌ UNCAUGHT EXCEPTION:', err));
process.on('unhandledRejection', (reason) => console.error('❌ UNHANDLED REJECTION:', reason));

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// --- INITIALIZE FIREBASE ADMIN (Conditional) ---
const NODE_ENV = process.env.NODE_ENV || 'development';
const AUTH_PROVIDER = (process.env.AUTH_PROVIDER || 'firebase').toLowerCase();
const DATA_PROVIDER = (process.env.DATA_PROVIDER || 'firebase').toLowerCase();
const saFilename = NODE_ENV === 'production' ? 'config/antigravity-tutor-prod-key.json' : 'config/antigravity-tutor-dev-key.json';
const serviceAccountPath = path.join(__dirname, saFilename);

// Firebase initialization is now purely provider-driven.
// Remove hardcoded Cloud Run / GCP project detection.
const needsFirebase = AUTH_PROVIDER === 'firebase' || DATA_PROVIDER === 'firebase' || DATA_PROVIDER === 'dual';

if (needsFirebase) {
    const admin = require('firebase-admin');
    if (NODE_ENV === 'production') {
        try {
            const options = require('fs').existsSync(serviceAccountPath)
                ? { credential: admin.credential.cert(require(serviceAccountPath)) }
                : {}; // Fallback to ADC

            admin.initializeApp(options);
            global.db = admin.firestore();

            const projectId = admin.app().options.credential?.projectId || process.env.GOOGLE_CLOUD_PROJECT;
            console.log(`\n✅ PRODUCTION BACKEND ACTIVE (Firebase Stack)`);
            console.log(`🆔 Project ID: ${projectId}`);
        } catch (error) {
            console.error("❌ Firebase Admin Production initialization failed:", error);
            process.exit(1);
        }
    } else if (require('fs').existsSync(serviceAccountPath)) {
        // LOCAL DEVELOPMENT with Firebase
        try {
            admin.initializeApp({ credential: admin.credential.cert(require(serviceAccountPath)) });
            global.db = admin.firestore();
            console.log(`\n🛠️ DEVELOPMENT BACKEND ACTIVE (Firebase Stack)`);
            console.log(`🆔 Project ID: ${admin.app().options.credential.projectId}\n`);
        } catch (error) {
            console.error("❌ Firebase Admin Development initialization failed:", error);
        }
    } else {
        console.warn(`⚠️ Firebase requested but no service account found at ${saFilename}. Firestore features disabled.`);
    }
} else {
    const stackLabel = NODE_ENV === 'production' ? '✅ PRODUCTION BACKEND ACTIVE (Azure Stack)' : '🛠️ DEVELOPMENT BACKEND ACTIVE (Azure Stack)';
    console.log(`\n${stackLabel}`);
    console.log(`🔐 Auth Provider: ${AUTH_PROVIDER}`);
    console.log(`🗄️  Data Provider: ${DATA_PROVIDER}`);
    console.log(`🤖 AI Provider: ${process.env.AI_PROVIDER || 'deepseek'}\n`);
}

// --- INITIALIZE STRIPE ---
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

const app = express();
const isProduction = process.env.NODE_ENV === 'production';
app.set('trust proxy', 1);

// --- MIDDLEWARE ---
app.use(helmet({ contentSecurityPolicy: false }));
app.use('/api/payment/webhook', express.raw({ type: 'application/json' }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(require('./middleware/Auth0IdentityMiddleware').enrichIdentity);

// CORS Implementation
// Add extra origins via CORS_ORIGINS env var (comma-separated)
const EXTRA_CORS_ORIGINS = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);
const ALLOWED_ORIGINS = [
    'http://localhost:3005',
    'https://localhost:3005',
    'http://127.0.0.1:3005',
    'https://ace-it-web.azurewebsites.net',
    'https://ace-it-web-prod.azurewebsites.net',
    'https://orange-sand-0995bf300.7.azurestaticapps.net',
    // Add your Azure Static Web Apps PROD URL and custom domain below:
    // 'https://ace-it-prod.azurestaticapps.net',
    // 'https://app.aceit-learning.com',
    ...EXTRA_CORS_ORIGINS,
];

app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
        const isAllowed = ALLOWED_ORIGINS.some((o) => origin.toLowerCase() === o.toLowerCase());
        const isLocalDev = origin === 'http://localhost:3005' || origin?.includes('localhost:');
        if (isAllowed || isLocalDev || !isProduction) {
            res.header('Access-Control-Allow-Origin', origin);
        }
    }

    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-secret');
    res.header('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

const chatRoutes = require('./routes/chatRoutes');
const examRoutes = require('./routes/examRoutes');
const profileRoutes = require('./routes/profileRoutes');
const statsRoutes = require('./routes/statsRoutes');
const englishMockRoutes = require('./routes/englishMockRoutes');

// Rate Limiting (Cost Control)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isProduction ? 150 : 10000,
    message: { error: "Too many requests. Please try again later." }
});
const contactLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: isProduction ? 10 : 200,
    message: { error: 'Too many contact submissions. Please try again later.' }
});
app.use('/api/english/mock', englishMockRoutes);
app.use('/api/contact', contactLimiter, require('./routes/contactRoutes'));
// Handoff (QR mobile upload + SSE) — mounted before global /api limiter to avoid throttling long-lived streams
app.use('/api/handoff', require('./routes/handoffRoutes'));
app.use('/api/', limiter);

// Request Tracing
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Static Asset Serving
app.use('/output', express.static(path.join(__dirname, 'output')));

// Re-register Specialized Legacy Routers
app.use('/api/reading', require('./routes/readingScaffoldRoutes'));
app.use('/api/speaking', require('./routes/speakingQuestRoutes'));
app.use('/api/writing', require('./routes/writingRoutes'));
app.use('/api/lab', require('./routes/english/labRoutes'));
app.use('/api/lab/writing', require('./routes/english/writingLabRoutes'));
app.use('/api/maths/lab', require('./routes/maths/mathsLabRoutes'));
app.use('/api/maths/exam', require('./routes/maths/mathsExamRoutes'));
app.use('/api/maths/diagnostic', require('./routes/maths/mathsDiagnosticRoutes'));
app.use('/api/dictionary', require('./routes/dictionaryRoutes'));
app.use('/api/results', require('./routes/resultRoutes'));

// User & Platform Specifics
app.use('/api', chatRoutes);
app.use('/api', require('./routes/utilRoutes'));
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/stats', require('./routes/statsRoutes'));
app.use('/api/roadmap', require('./routes/roadmapRoutes'));
app.use('/api/exams', require('./routes/examRoutes'));
app.use('/api', profileRoutes);
app.use('/api/gamification', profileRoutes);
app.use('/api/skillmap', profileRoutes);
app.use('/api/redemption', profileRoutes);
app.use('/api/diagnostic', require('./routes/diagnosticRoutes'));
app.use('/api/jupas', require('./routes/jupasRoutes'));
app.use('/api/tutor', require('./routes/tutorRoutes'));
app.post(/^\/api\/tutors\/(.*)/, (req, res) => res.redirect(307, req.url.replace('/api/tutors', '/api/tutor')));

app.use('/api/debug', require('./routes/debugRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/promo', require('./routes/promoRoutes'));
app.use('/api', require('./routes/ttsRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api', require('./routes/dataRoutes'));

// --- COMPATIBILITY ALIASES (Frontend Support) ---
app.get('/api/microskills/:uid', (req, res) => res.redirect(307, '/api/stats/microskills/' + req.params.uid));
// Quest hub / roadmap modals expect a weekly plan (tasks[]), not the legacy personalized batch array.
app.get('/api/quests/personalized', require('./middleware/requireResolvedUid').requireResolvedUid, async (req, res) => {
    const { uid, subject } = req.query;
    if (!uid) return res.status(400).json({ error: 'Missing uid' });
    try {
        const RoadmapService = require('./services/RoadmapService');
        const plan = await RoadmapService.getCurrentPlan(uid, subject || 'english');
        res.json(plan);
    } catch (e) {
        console.error('[server] /api/quests/personalized error:', e);
        res.status(500).json({ error: 'Failed to fetch personalized quests' });
    }
});


// Usage & Costing endpoints moved to statsRoutes and userRoutes in modular build.
// Redundant handlers removed for architecture consistency.

// Legacy compatibility redirects (307 preserves POST body)
app.post('/api/onboarding', (req, res) => res.redirect(307, '/api/user/onboarding'));
app.post('/api/onboarding/submit', (req, res) => res.redirect(307, '/api/user/onboarding'));
app.post('/api/submit-exam', (req, res) => res.redirect(307, '/api/exams/submit-exam'));
app.post('/api/ocr', (req, res) => res.redirect(307, '/api/ocr'));
app.post('/api/dictionary', (req, res) => res.redirect(307, '/api/dictionary'));

// --- GLOBAL ERROR HANDLING ---
app.use((err, req, res, next) => {
    console.error(`[CRITICAL ERROR] ${new Date().toISOString()}: ${err.stack}`);
    if (!res.headersSent) {
        res.status(500).json({ 
            error: "Internal Server Error",
            message: isProduction ? 'An unexpected error occurred.' : err.message
        });
    }
});

// 404 Handler
app.use((req, res) => {
    if (req.url.startsWith('/api/')) {
        res.status(404).json({ error: "Route not found", path: req.url });
    } else {
        res.status(404).send("Not Found");
    }
});

// --- WEBSOCKET: Azure OpenAI Real-Time STT ---
const WebSocket = require('ws');
const AzureSpeechService = require('./services/AzureSpeechService');

function setupWebSocketServer(httpServer) {
    const wss = new WebSocket.Server({
        noServer: true,
        // Only allow connections from our frontend origins
        verifyClient: (info, done) => {
            const origin = info.origin || '';
            const allowed = [
                'http://localhost:3005',
                'https://localhost:3005',
                'http://127.0.0.1:3005',
                'https://ace-it-web.azurewebsites.net',
                'https://ace-it-web-prod.azurewebsites.net',
                // Add your Azure Static Web Apps PROD URL and custom domain below:
                // 'https://ace-it-prod.azurestaticapps.net',
                // 'https://app.aceit-learning.com',
            ];
            // In dev, be permissive; in prod, strict
            if (!isProduction) {
                done(true);
                return;
            }
            done(allowed.some(a => origin.startsWith(a)));
        }
    });

    // Handle upgrade manually to avoid conflicts with Express
    httpServer.on('upgrade', (request, socket, head) => {
        console.log(`[WS] Upgrade request for: ${request.url}`);
        if (request.url === '/api/speaking/stream/transcribe') {
            wss.handleUpgrade(request, socket, head, (ws) => {
                wss.emit('connection', ws, request);
            });
        } else {
            console.log(`[WS] Ignoring upgrade for non-matching path: ${request.url}`);
            socket.destroy();
        }
    });

    wss.on('connection', (clientWs, req) => {
        const clientId = `${req.socket.remoteAddress}-${Date.now()}`;
        console.log(`[WS:${clientId}] Client connected for real-time STT.`);

        let azureSession = null;
        let isClosing = false;

        // Create Azure real-time session
        try {
            azureSession = AzureSpeechService.createSession();
        } catch (err) {
            console.error(`[WS:${clientId}] Failed to create Azure session:`, err.message);
            clientWs.close(1011, 'Azure STT not configured');
            return;
        }

        // Forward Azure transcripts to frontend
        azureSession.onPartial = (text) => {
            console.log(`[WS:${clientId}] 📤 PARTIAL -> frontend: "${text.substring(0, 60)}..."`);
            if (clientWs.readyState === WebSocket.OPEN) {
                clientWs.send(JSON.stringify({ type: 'partial', text }));
            }
        };

        azureSession.onFinal = (text) => {
            console.log(`[WS:${clientId}] 📤 FINAL -> frontend: "${text.substring(0, 60)}..."`);
            if (clientWs.readyState === WebSocket.OPEN) {
                clientWs.send(JSON.stringify({ type: 'final', text }));
            }
        };

        azureSession.onError = (err) => {
            console.error(`[WS:${clientId}] Azure error:`, err.message);
            if (clientWs.readyState === WebSocket.OPEN) {
                clientWs.send(JSON.stringify({ type: 'error', message: err.message }));
            }
        };

        azureSession.onDisconnect = () => {
            if (!isClosing && clientWs.readyState === WebSocket.OPEN) {
                clientWs.close(1000, 'Azure session ended');
            }
        };

        // Connect to Azure
        azureSession.connect().then(() => {
            if (clientWs.readyState === WebSocket.OPEN) {
                clientWs.send(JSON.stringify({ type: 'connected', sessionId: azureSession.sessionId }));
            }
        }).catch((err) => {
            console.error(`[WS:${clientId}] Azure connect failed:`, err.message);
            if (clientWs.readyState === WebSocket.OPEN) {
                clientWs.send(JSON.stringify({ type: 'error', message: 'Failed to connect to Azure STT' }));
            }
            clientWs.close(1011, 'Azure connect failed');
        });

        // Handle messages from frontend (audio chunks)
        clientWs.on('message', (data) => {
            try {
                const msg = JSON.parse(data.toString());

                if (msg.type === 'audio' && msg.data) {
                    // Frontend sends base64 PCM16 audio chunks
                    console.log(`[WS:${clientId}] 📥 Audio chunk: ${msg.data.length} chars base64`);
                    azureSession.sendAudio(msg.data);
                } else if (msg.type === 'commit') {
                    // Frontend signals end of audio input
                    console.log(`[WS:${clientId}] 📥 Commit signal received`);
                    azureSession.commitAudio();
                } else if (msg.type === 'ping') {
                    clientWs.send(JSON.stringify({ type: 'pong' }));
                }
            } catch (e) {
                // Binary data or non-JSON — ignore or log
                console.warn(`[WS:${clientId}] Invalid message:`, e.message);
            }
        });

        clientWs.on('close', (code, reason) => {
            isClosing = true;
            console.log(`[WS:${clientId}] Client disconnected. Code: ${code}`);
            if (azureSession) {
                azureSession.disconnect();
                azureSession = null;
            }
        });

        clientWs.on('error', (err) => {
            console.error(`[WS:${clientId}] Client WebSocket error:`, err.message);
            isClosing = true;
            if (azureSession) {
                azureSession.disconnect();
                azureSession = null;
            }
        });
    });

    console.log(`🔌 WebSocket server mounted at /api/speaking/stream/transcribe`);
}

// --- SERVER ACTIVATION ---
const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
    console.log(`\n🚀 ACE-IT BACKEND v2.0 (MODULAR)`);
    console.log(`📡 Port: ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`✅ Router Health Check: OK\n`);

    if ((process.env.ENABLE_PARENT_REPORT_SCHEDULER || '').toLowerCase() === 'true') {
        try {
            require('./services/ReportSchedulerService').start();
        } catch (error) {
            console.error('[ReportScheduler] Failed to start:', error);
        }
    }
});

// Setup WebSocket server on same HTTP server
setupWebSocketServer(server);

// Extend timeout for long AI response generation (10 mins)
server.timeout = 600000;

module.exports = app;
