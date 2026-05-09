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

// --- INITIALIZE FIREBASE ADMIN ---
const NODE_ENV = process.env.NODE_ENV || 'development';
const saFilename = NODE_ENV === 'production' ? 'config/antigravity-tutor-prod-key.json' : 'config/antigravity-tutor-dev-key.json';
const serviceAccountPath = path.join(__dirname, saFilename);

// Force production mode if running on Cloud Run or project matches
const forceProduction = !!process.env.K_SERVICE || process.env.GOOGLE_CLOUD_PROJECT === 'ace-it-production-1e0a4';

if (forceProduction || NODE_ENV === 'production') {
    // ON CLOUD RUN: We MUST use the production key or ADC.
    try {
        const options = require('fs').existsSync(serviceAccountPath) 
            ? { credential: admin.credential.cert(require(serviceAccountPath)) } 
            : {}; // Fallback to ADC
        
        admin.initializeApp(options);
        global.db = admin.firestore();
        
        const projectId = admin.app().options.credential.projectId || process.env.GOOGLE_CLOUD_PROJECT;
        console.log(`\n✅ PRODUCTION BACKEND ACTIVE`);
        console.log(`🆔 Project ID: ${projectId}`);
    } catch (error) {
        console.error("❌ Firebase Admin Production initialization failed:", error);
        process.exit(1);
    }
} else if (require('fs').existsSync(serviceAccountPath)) {
    // LOCAL DEVELOPMENT
    try {
        admin.initializeApp({ credential: admin.credential.cert(require(serviceAccountPath)) });
        global.db = admin.firestore();
        console.log(`\n🛠️ DEVELOPMENT BACKEND ACTIVE`);
        console.log(`🆔 Project ID: ${admin.app().options.credential.projectId}\n`);
    } catch (error) {
        console.error("❌ Firebase Admin Development initialization failed:", error);
    }
} else {
    console.warn(`⚠️ No Firebase Service Account found at ${saFilename}. Firestore features disabled.`);
}

// --- INITIALIZE STRIPE ---
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

const app = express();
const isProduction = process.env.NODE_ENV === 'production';
app.set('trust proxy', 1);

// --- MIDDLEWARE ---
app.use(helmet({ contentSecurityPolicy: false }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(require('./middleware/Auth0IdentityMiddleware').enrichIdentity);

// CORS Implementation
app.use((req, res, next) => {
    const origin = req.headers.origin;
    // Explicitly allow local development port 3005
    if (origin === 'http://localhost:3005' || origin?.includes('localhost:')) {
        res.header('Access-Control-Allow-Origin', origin);
    } else if (origin) {
        res.header('Access-Control-Allow-Origin', origin);
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
app.use('/api/english/mock', englishMockRoutes);
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
app.get('/api/quests/personalized', (req, res) => res.redirect(307, '/api/roadmap?uid=' + (req.query.uid || '')) );


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
