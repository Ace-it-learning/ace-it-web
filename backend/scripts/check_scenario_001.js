const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
if (!admin.apps.length) {
    const serviceAccount = require(path.join(__dirname, '..', 'serviceAccountKey.json'));
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}
const db = admin.firestore();

async function check() {
    const docId = 'listening_mission_1';
    console.log(`Checking Firestore for Document ID: ${docId}`);
    const doc = await db.collection('question_bank').doc(docId).get();
    
    if (!doc.exists) {
        console.error("❌ Document NOT FOUND in question_bank!");
    } else {
        const data = doc.data();
        console.log("✅ Document FOUND!");
        console.log("Title:", data.title);
        console.log("Sprint Data Tasks Count:", data.sprint_data?.tasks?.length || 0);
        console.log("Integrated Data Tabs Count:", data.integrated_data?.data_file?.length || 0);
        
        if (data.sprint_data?.tasks) {
            console.log("First Task Type:", data.sprint_data.tasks[0]?.type);
        }
    }
    process.exit(0);
}

check();
