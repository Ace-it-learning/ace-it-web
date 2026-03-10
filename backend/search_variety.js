const admin = require('firebase-admin');

if (admin.apps.length === 0) {
    const serviceAccount = require('./serviceAccountKey.json');
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function search() {
    console.log("Searching for narrative variety in Maths quests...");
    try {
        const snapshot = await db.collection('question_bank')
            .where('subject', '==', 'Maths')
            .where('is_factory', '==', true)
            .get();

        if (snapshot.empty) {
            console.log("No factory quests found.");
            return;
        }

        let found = 0;
        snapshot.forEach(doc => {
            const data = doc.data();
            const text = data.text || "";
            // Check for non-standard beginnings
            if (!text.includes("A sum of") && !text.includes("A principal of") && !text.includes("A dealer is selling")) {
                console.log(`\n--- FOUND VARIETY [ID: ${doc.id}] ---`);
                console.log(`Text: ${text}`);
                found++;
            }
        });

        console.log(`\nTotal variety questions found: ${found} out of ${snapshot.size}`);
    } catch (err) {
        console.error("Search failed:", err);
    } finally {
        process.exit(0);
    }
}

search();
