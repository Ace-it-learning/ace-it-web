const admin = require('firebase-admin');
const path = require('path');

const keyPath = path.join(__dirname, '../serviceAccountKey.json');
const serviceAccount = require(keyPath);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const wipePercentages = async () => {
    console.log('Starting wipe of math_num_percentages questions...');
    const snapshot = await db.collection('question_bank')
        .where('topic_id', '==', 'math_num_percentages')
        .get();

    if (snapshot.empty) {
        console.log('No matching questions found.');
        process.exit(0);
    }

    console.log(`Found ${snapshot.size} questions to delete.`);
    const batchSize = 100;
    let count = 0;

    for (let i = 0; i < snapshot.docs.length; i += batchSize) {
        const batch = db.batch();
        const chunk = snapshot.docs.slice(i, i + batchSize);
        chunk.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
        count += chunk.length;
        console.log(`Deleted ${count} questions...`);
    }

    console.log('Wipe complete.');
    process.exit(0);
};

wipePercentages().catch(err => {
    console.error('Wipe failed:', err);
    process.exit(1);
});
