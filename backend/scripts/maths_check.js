const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

if (!admin.apps.length) {
    const keyPath = path.join(__dirname, '..', 'serviceAccountKey.json');
    if (!fs.existsSync(keyPath)) {
        console.error("Service account key not found at:", keyPath);
        process.exit(1);
    }
    const serviceAccount = require(keyPath);
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}
const db = admin.firestore();

async function run() {
    try {
        const snapshot = await db.collection('question_bank')
            .where('subject', '==', 'Maths')
            .where('topic', '==', 'math_alg_formulas')
            .get();

        if (snapshot.empty) {
            console.log("No questions found.");
        } else {
            // Manual sort
            const sortedDocs = snapshot.docs.sort((a, b) => {
                const aTime = a.data().created_at?.toMillis() || 0;
                const bTime = b.data().created_at?.toMillis() || 0;
                return bTime - aTime;
            });
            const doc = sortedDocs[0];
            const data = doc.data();
            console.log("----- QUESTION DATA -----");
            console.log(`Topic: ${data.topic}`);
            console.log(`Text:\n${data.text}`);
            console.log(`Answer:\n${data.answer}`);
            console.log(`Solution Steps:\n${JSON.stringify(data.solution_steps, null, 2)}`);
            console.log(`Explanation:\n${data.explanation}`);
            console.log("-----------------------");
        }
    } catch (err) {
        console.error(err);
    } process.exit(0);
}

run();
