const admin = require('firebase-admin');
const path = require('path');

const serviceAccount = require('./backend/serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function inspect(questId) {
    console.log(`--- Inspecting Quest: ${questId} ---`);
    const doc = await db.collection('question_bank').doc(questId).get();

    if (!doc.exists) {
        console.log(`❌ Quest ${questId} not found!`);
    } else {
        const data = doc.data();
        console.log("Title:", data.title);
        console.log("Sprint Data Tasks Length:", data.sprint_data?.tasks?.length);
        if (data.sprint_data?.tasks) {
            data.sprint_data.tasks.forEach((t, i) => {
                console.log(`Task ${i}: ID=${t.id}, Type=${t.type}, Label=${t.label || t.question}`);
            });
        } else {
            console.log("❌ sprint_data.tasks is missing or not an array!");
        }
    }
    console.log('--- End ---');
    process.exit(0);
}

const target = process.argv[2] || 'listening_mission_4';
inspect(target);
