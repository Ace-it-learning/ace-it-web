const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const serviceAccount = require(path.join(__dirname, 'serviceAccountKey.json'));

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function purgeBadQuestions() {
    const topic = "Literal Comprehension";
    console.log(`Scanning for bad questions in topic: ${topic}`);

    // We can't filter by 'passage' == null in Firestore easily in one query without an index on 'passage' potentially?
    // Actually we can just query by topic and client-side filter for delete.

    const snapshot = await db.collection('question_bank')
        .where('topic', '==', topic)
        .get();

    if (snapshot.empty) {
        console.log("No questions found.");
        return;
    }

    console.log(`Found ${snapshot.size} candidates. Checking for missing passages...`);

    const batch = db.batch();
    let deleteCount = 0;

    snapshot.forEach(doc => {
        const data = doc.data();
        if (!data.passage || data.passage.trim() === "") {
            console.log(`Deleting invalid question: ${doc.id}`);
            batch.delete(doc.ref);
            deleteCount++;
        }
    });

    if (deleteCount > 0) {
        await batch.commit();
        console.log(`✅ Successfully deleted ${deleteCount} questions missing passages.`);
    } else {
        console.log("No invalid questions found.");
    }
}

purgeBadQuestions().catch(err => console.error(err));
