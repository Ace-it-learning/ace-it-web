require('dotenv').config();
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(require(serviceAccountPath))
    });
}

const db = admin.firestore();

async function auditComplexNumbers() {
    console.log("=== AUDIT: Complex Numbers Questions in Bank ===\n");

    try {
        const snapshot = await db.collection('question_bank')
            .where('topic_id', '==', 'math_alg_complex_numbers')
            .get();

        if (snapshot.empty) {
            console.log("No Complex Numbers questions found in bank.");
            process.exit(0);
        }

        console.log(`Total questions found: ${snapshot.size}\n`);

        const results = [];

        snapshot.forEach(doc => {
            const d = doc.data();
            results.push({
                id: doc.id,
                level: d.level,
                type: d.type,
                is_approved: d.is_approved,
                question_en: d.question,
                question_zh: d.question_zh,
                answer: d.answer,
                answer_letter: d.answer_letter || null,
                options: d.options || null,
                solution_steps: d.solution_steps || null,
                explanation: d.explanation,
            });
        });

        // Sort by level then by id
        results.sort((a, b) => (a.level || 0) - (b.level || 0));

        results.forEach((q, i) => {
            console.log(`--- Question ${i + 1} ---`);
            console.log(`ID: ${q.id}`);
            console.log(`Level: ${q.level} | Type: ${q.type} | Approved: ${q.is_approved}`);
            console.log(`Q (EN): ${q.question_en}`);
            console.log(`Q (ZH): ${q.question_zh}`);
            if (q.options) console.log(`Options: ${JSON.stringify(q.options)}`);
            console.log(`Answer: ${q.answer}`);
            if (q.solution_steps) console.log(`Steps: ${JSON.stringify(q.solution_steps)}`);
            console.log(`Explanation: ${q.explanation}`);
            console.log('');
        });

        // Save full dump to file for review
        fs.writeFileSync(
            path.join(__dirname, 'audit_complex_numbers_dump.json'),
            JSON.stringify(results, null, 2),
            'utf-8'
        );
        console.log("Full dump saved to audit_complex_numbers_dump.json");

    } catch (e) {
        console.error("Error:", e);
    }
    process.exit(0);
}

auditComplexNumbers();
