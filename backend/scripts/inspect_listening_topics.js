const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

const db = admin.firestore();

async function inspectTopics() {
    const topics = ['Complaint Hotline', 'University Interview'];
    console.log(`Inspecting topics: ${topics.join(', ')}`);

    for (const topic of topics) {
        console.log(`\n--- Topic: ${topic} ---`);
        const snapshot = await db.collection('question_bank')
            .where('topic', '==', topic)
            .limit(5)
            .get();

        if (snapshot.empty) {
            console.log('No documents found.');
        } else {
            snapshot.forEach(doc => {
                const data = doc.data();
                console.log(`ID: ${doc.id}`);
                console.log(`Type: ${data.type}`);
                console.log(`Title: ${data.title}`);
                console.log(`Is Approved: ${data.is_approved}`);
                console.log(`Interactive Tasks: ${data.interactive_tasks ? data.interactive_tasks.length : 'N/A'}`);
                console.log('---');
            });
        }
    }
}

inspectTopics();
