const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const serviceAccount = require(path.join(__dirname, '..', 'serviceAccountKey.json'));

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function debugQuestions() {
    console.log("🔍 INSPECTING FIRESTORE QUESTIONS...");

    // Get all exams first
    const examsSnap = await db.collection('mock_exams').get();
    if (examsSnap.empty) {
        console.log("No exams found.");
        return;
    }

    const examId = examsSnap.docs[0].id;
    console.log(`Checking Exam: ${examId} (${examsSnap.docs[0].data().title})`);

    const qRef = db.collection('mock_exams').doc(examId).collection('questions');
    const qSnap = await qRef.orderBy('order_index').get();

    if (qSnap.empty) {
        console.log("No questions found in this exam.");
        return;
    }

    console.log(`Found ${qSnap.size} questions.`);
    console.log("-----------------------------------------");
    console.log("| ID | Order | Part (Raw) | Type | Preview");
    console.log("-----------------------------------------");

    qSnap.forEach(doc => {
        const d = doc.data();
        const prev = (d.question_text || d.question || "").substring(0, 20);
        console.log(`| ${doc.id} | ${d.order_index} | "${d.part}" | ${d.type} | ${prev}...`);
    });
    console.log("-----------------------------------------");
}

debugQuestions().catch(console.error);
