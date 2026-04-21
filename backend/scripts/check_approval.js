const admin = require('firebase-admin');
const path = require('path');
const serviceAccountPath = path.join(__dirname, '../config/antigravity-tutor-prod-key.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(require(serviceAccountPath))
    });
}

const db = admin.firestore();

async function checkApproval() {
    const searchString = 'burgeoning zero-waste movement';
    console.log(`Auditing approval status for passage: "${searchString}"...`);
    
    const snapshot = await db.collection('question_bank').get();
    let matches = [];
    
    snapshot.forEach(doc => {
        const data = doc.data();
        const content = data.passage || data.reading_passage || "";
        if (content.toLowerCase().includes(searchString.toLowerCase())) {
            matches.push({ id: doc.id, ...data });
        }
    });

    console.log(`Total Matches Found: ${matches.length}`);
    
    const summary = matches.reduce((acc, doc) => {
        const status = doc.is_approved ? 'APPROVED' : 'UNAPPROVED';
        const level = doc.level || 'NO_LEVEL';
        const key = `${status} | ${level}`;
        if (!acc[key]) acc[key] = 0;
        acc[key]++;
        return acc;
    }, {});

    console.log('--- APPROVAL SUMMARY ---');
    console.log(JSON.stringify(summary, null, 2));

    if (matches.length > 0) {
        console.log('\n--- DETAILED LIST ---');
        matches.forEach(m => {
            console.log(`ID: ${m.id} | Status: ${m.is_approved ? '✅' : '❌'} | Level: ${m.level} | Topic: ${m.topic}`);
        });
    }
    
    process.exit(0);
}

checkApproval().catch(console.error);
