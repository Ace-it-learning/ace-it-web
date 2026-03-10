const admin = require('firebase-admin');
const path = require('path');
const serviceAccount = require('./serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function run() {
    process.stdout.write("Fetching approved quests...");
    try {
        const snapshot = await db.collection('question_bank')
            .where('is_approved', '==', true)
            .get();

        const counts = {};
        snapshot.forEach(doc => {
            const data = doc.data();
            const subject = data.subject || 'unknown';
            const topic = data.topic || 'unknown';
            const level = data.level || 'unknown';
            const key = `${subject} | ${topic} | Level ${level}`;
            counts[key] = (counts[key] || 0) + 1;
        });

        console.log("\n--- APPROVED QUEST COUNTS ---");
        if (Object.keys(counts).length === 0) {
            console.log("No approved quests found in the database.");
        } else {
            Object.entries(counts).forEach(([key, count]) => {
                console.log(`${key}: ${count} questions`);
            });
        }
        console.log("-----------------------------\n");
    } catch (e) {
        console.error("Error:", e);
    } finally {
        process.exit(0);
    }
}

run();
