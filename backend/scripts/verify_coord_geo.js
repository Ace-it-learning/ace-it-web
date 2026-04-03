const admin = require('firebase-admin');
const path = require('path');
const serviceAccount = require(path.join(__dirname, '../serviceAccountKey.json'));

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function verifySync() {
    console.log('--- Verifying Coordinate Geometry Sync ---');
    
    // 1. Check Questions
    const questionsSnapshot = await db.collection('question_bank')
        .where('topic_id', '==', 'math_geo_coord')
        .get();
    
    console.log(`Questions found: ${questionsSnapshot.size}`);
    if (questionsSnapshot.size > 0) {
        const firstDoc = questionsSnapshot.docs[0].data();
        console.log(`Sample Question ID: ${questionsSnapshot.docs[0].id}`);
        console.log(`Sample Question Difficulty: ${firstDoc.difficulty}`);
        console.log(`Sample Question Has SVG: ${!!firstDoc.diagram_svg}`);
    }

    // 2. Check Briefing
    const briefingDoc = await db.collection('learning_content').doc('math_geo_coord').get();
    if (briefingDoc.exists) {
        console.log('Briefing document exists.');
        const data = briefingDoc.data();
        console.log(`Bilingual Title: ${data.name} / ${data.name_zh}`);
        console.log(`Modules count: ${data.learning_modules ? data.learning_modules.length : 0}`);
        console.log(`Roadmap present: ${!!data.roadmap}`);
    } else {
        console.log('Briefing document NOT found.');
    }

    process.exit(0);
}

verifySync().catch((err) => {
    console.error(err);
    process.exit(1);
});
