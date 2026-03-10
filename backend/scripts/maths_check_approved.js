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
            console.log(`Found ${snapshot.size} questions for Formulas & Substitution.`);
            const stats = { approved: 0, unapproved: 0, levels: {} };

            snapshot.docs.forEach(doc => {
                const data = doc.data();
                if (data.is_approved) stats.approved++;
                else stats.unapproved++;

                stats.levels[data.level] = (stats.levels[data.level] || 0) + 1;
            });
            console.log("Stats:", JSON.stringify(stats, null, 2));

            const approvedEasy = snapshot.docs.filter(d => d.data().is_approved && d.data().level <= 3);
            if (approvedEasy.length > 0) {
                console.log(`Approved Easy Count: ${approvedEasy.length}`);
            } else {
                console.log("NO approved Easy questions found!");
            }
        }
    } catch (err) {
        console.error(err);
    } process.exit(0);
}

run();
