const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

function log(msg) {
    fs.appendFileSync('deploy_log.txt', msg + '\n');
    console.log(msg);
}

log('--- Starting Deployment Script ---');

// Initialize Firebase Admin
try {
    const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');
    log('Loading service account from: ' + serviceAccountPath);
    const serviceAccount = require(serviceAccountPath);

    if (!admin.apps.length) {
        log('Initializing Firebase App...');
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    }
} catch (e) {
    log('CRITICAL ERROR INITIALIZING FIREBASE: ' + e.message);
    process.exit(1);
}

const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true });

const deployMock = async (mockFilePath) => {
    try {
        log(`Reading mock file: ${mockFilePath}`);
        const rawData = fs.readFileSync(mockFilePath, 'utf8');
        const mockData = JSON.parse(rawData);
        const topic = mockData.meta.topic;
        const examId = `mock_${topic.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}`;

        log(`🚀 Deploying Mock Exam: ${topic} (ID: ${examId})`);

        const batch = db.batch();

        // 1. Create Exam Metadata Document
        const examRef = db.collection('mock_exams').doc(examId);

        // Handle potentially missing parts (backward compatibility or partial generation)
        const parts = ['Part_A', 'Part_B1', 'Part_B2'];
        const allResources = {};
        let allQuestions = [];

        parts.forEach(partKey => {
            if (mockData[partKey]) {
                allResources[partKey] = mockData[partKey].resources;
                if (mockData[partKey].questions) {
                    allQuestions = allQuestions.concat(mockData[partKey].questions);
                }
            }
        });

        const metadata = {
            id: examId,
            title: mockData.meta.topic || "Untitled Exam", // Use topic as title fallback
            topic_category: "Technology", // Could be dynamic
            reading_time_minutes: 90, // Full paper time
            passage_image_url: "https://via.placeholder.com/800x400?text=" + encodeURIComponent(topic),
            is_published: true,
            blueprint_version: mockData.meta.blueprint_version || "1.0",
            created_at: admin.firestore.FieldValue.serverTimestamp(),
            // Store resources nested by part
            resources: allResources
        };

        log('Setting metadata...');
        batch.set(examRef, metadata);

        // 2. Create Questions & Marking Keys
        log(`Processing ${allQuestions.length} questions from [${parts.map(p => mockData[p] ? p : '').filter(Boolean).join(', ')}]...`);

        allQuestions.forEach((q, index) => {
            const qId = q.id;
            // Public Question Data
            // Ensure unique ID across parts
            const uniqueQId = `${q.part}_${qId}`;

            const questionDoc = {
                id: uniqueQId, // Store the prefixed ID
                original_id: qId, // Keep original if needed
                exam_id: examId,
                order_index: index + 1, // Global index (1 to ~60)
                type: q.type,
                segment_ref: q.segment_ref || null,
                question_text: q.question,
                marks: q.marks || 1,
                part: q.part, // "Part A", "Part B1", etc.
                sub_questions: q.sub_questions || null // Ensure sub-questions are passed
            };

            if (q.options) {
                questionDoc.options = q.options;
            }

            // Private Marking Key Data
            const keyDoc = {
                id: qId,
                exam_id: examId,
                question_id: qId,
                answer: q.answer,
                logic: q.logic,
                segment_ref: q.segment_ref || null
            };

            const qRef = db.collection('mock_exams').doc(examId).collection('questions').doc(uniqueQId);
            const keyRef = db.collection('mock_exams').doc(examId).collection('marking_keys').doc(uniqueQId);

            // Update keyDoc IDs as well
            keyDoc.id = uniqueQId;
            keyDoc.question_id = uniqueQId;

            batch.set(qRef, questionDoc);
            batch.set(keyRef, keyDoc);
        });

        log('Committing batch...');
        await batch.commit();
        log(`✅ Deployment Complete! Exam ID: ${examId}`);
        log(`   - Added ${allQuestions.length} questions.`);
        log(`   - Added ${allQuestions.length} marking keys.`);

    } catch (error) {
        log("❌ Deployment Failed: " + error.message);
        if (error.stack) log(error.stack);
    }
};

// Run with CLI arg
const filePath = process.argv[2];
if (!filePath) {
    log("Usage: node deploy_mock.js <path_to_json>");
    process.exit(1);
}

deployMock(filePath);
