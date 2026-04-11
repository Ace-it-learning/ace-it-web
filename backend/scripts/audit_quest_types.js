const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}
const db = admin.firestore();

async function auditQuestTypes() {
    console.log("Starting mission type audit...");
    const snapshot = await db.collection('question_bank').get();
    let updatedCount = 0;

    for (const doc of snapshot.docs) {
        const data = doc.data();
        const id = doc.id;
        let shouldFix = false;

        // Logic 1: If title/topic contains writing keywords but type is listening
        const writingKeywords = ['letter', 'editor', 'article', 'essay', 'proposal', 'report', 'speech', 'writing'];
        const title = (data.title || '').toLowerCase();
        const topic = (data.topic || '').toLowerCase();
        const content = (data.passage || data.prompt || '').toLowerCase();

        const hasWritingKeywords = writingKeywords.some(kw => title.includes(kw) || topic.includes(kw));
        
        if (hasWritingKeywords && data.type === 'listening_mission') {
            shouldFix = true;
            console.log(`[FIX] Mission "${data.title}" (${id}) has type 'listening_mission' but appears to be Writing. Fixing...`);
        }

        // Logic 2: If it has a 'genre' field but type is listening
        if (data.genre && data.type === 'listening_mission') {
             shouldFix = true;
             console.log(`[FIX] Mission "${data.title}" (${id}) has a 'genre' field but type 'listening_mission'. Fixing...`);
        }

        if (shouldFix) {
            await db.collection('question_bank').doc(id).update({
                type: 'writing_quest'
            });
            updatedCount++;
        }
    }

    console.log(`Audit complete. Fixed ${updatedCount} missions.`);
    process.exit(0);
}

auditQuestTypes().catch(err => {
    console.error(err);
    process.exit(1);
});
