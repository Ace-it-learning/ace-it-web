const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

if (!admin.apps.length) {
    const keyPath = path.join(__dirname, 'serviceAccountKey.json');
    const serviceAccount = require(keyPath);
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

async function dumpPending() {
    try {
        const db = admin.firestore();
        console.log("--- Dumping Pending Questions from question_bank ---");

        const snapshot = await db.collection('question_bank')
            .where('is_approved', '==', false)
            .get();

        const results = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            results.push({
                id: doc.id,
                topic: data.topic,
                topic_id: data.topic_id,
                answer_logic: data.answer_logic,
                solution_steps: data.solution_steps,
                explanation: data.explanation,
                question: data.question,
                diagram_json: data.diagram_json
            });
        });

        fs.writeFileSync('pending_dump.json', JSON.stringify(results, null, 2));
        console.log(`Dumped ${results.length} pending questions to pending_dump.json`);

    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

dumpPending();
