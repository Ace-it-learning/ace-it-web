// --- ACE-IT BACKEND (MODULAR ARCHITECTURE v2.0) ---
// Global Error Handlers for Stability
process.on('uncaughtException', (err) => console.error('❌ UNCAUGHT EXCEPTION:', err));
process.on('unhandledRejection', (reason) => console.error('❌ UNHANDLED REJECTION:', reason));

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const isProduction = process.env.NODE_ENV === 'production';

// Trust Cloud Run Proxy
app.set('trust proxy', 1);

// --- INITIALIZE FIREBASE ADMIN ---
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
if (require('fs').existsSync(serviceAccountPath)) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert(require(serviceAccountPath))
        });
        global.db = admin.firestore();
        console.log("Firebase Admin initialized successfully.");
    } catch (error) {
        console.error("Firebase Admin initialization failed:", error);
    }
} else {
    console.warn("⚠️ Firebase Service Account NOT FOUND. Firestore features will be disabled.");
}

// --- MIDDLEWARE ---
app.use(helmet({ contentSecurityPolicy: false }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// CORS Implementation
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin) res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-secret');
    res.header('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

// Rate Limiting (Cost Control)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isProduction ? 150 : 10000,
    message: { error: "Too many requests. Please try again later." }
});
app.use('/api/', limiter);

// Request Tracing
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Static Asset Serving
app.use('/output', express.static(path.join(__dirname, 'output')));

// --- MODULAR ROUTE REGISTRY (BASE /api) ---
// Each router owns its sub-paths (e.g. /chat, /history, /stats)
const chatRoutes = require('./routes/chatRoutes');
const examRoutes = require('./routes/examRoutes');
const profileRoutes = require('./routes/profileRoutes');
const statsRoutes = require('./routes/statsRoutes');

// Re-register Specialized Legacy Routers
app.use('/api/reading', require('./routes/readingScaffoldRoutes'));
app.use('/api/speaking', require('./routes/speakingQuestRoutes'));
app.use('/api/writing', require('./routes/writingRoutes'));
app.use('/api/lab', require('./routes/english/labRoutes'));
app.use('/api/lab/writing', require('./routes/english/writingLabRoutes'));
app.use('/api/maths/lab', require('./routes/maths/mathsLabRoutes'));
app.use('/api/maths/exam', require('./routes/maths/mathsExamRoutes'));
app.use('/api/maths/diagnostic', require('./routes/maths/mathsDiagnosticRoutes'));
app.use('/api/english/mock', require('./routes/englishMockRoutes'));
app.use('/api/dictionary', require('./routes/dictionaryRoutes'));

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
app.use('/api/tutors', require('./routes/tutorRoutes'));
app.use('/api/debug', require('./routes/debugRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Usage & Costing endpoints moved to statsRoutes and userRoutes in modular build.
// Redundant handlers removed for architecture consistency.

// Legacy compatibility redirects (307 preserves POST body)
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

// --- SERVER ACTIVATION ---
const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
    console.log(`\n🚀 ACE-IT BACKEND v2.0 (MODULAR)`);
    console.log(`📡 Port: ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`✅ Router Health Check: OK\n`);
});

// Extend timeout for long AI response generation (10 mins)
server.timeout = 600000;

module.exports = app;
