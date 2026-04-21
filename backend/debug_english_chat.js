const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const serviceAccountPath = path.join(__dirname, 'config/antigravity-tutor-dev-key.json');
if (require('fs').existsSync(serviceAccountPath)) {
    admin.initializeApp({ credential: admin.credential.cert(require(serviceAccountPath)) });
} else {
    console.warn('No service account key found. Using default credentials.');
    admin.initializeApp();
}
const db = admin.firestore();

async function checkUser(uid) {
    console.log(`=== Checking chat history for ${uid} ===`);
    const chatHistoryRef = db.collection('users').doc(uid).collection('chat_history');
    const snapshot = await chatHistoryRef.where('agentId', '==', 'english').get();
    console.log(`English chat history documents: ${snapshot.size}`);
    snapshot.forEach(doc => {
        const data = doc.data();
        console.log(`  ID: ${doc.id}, role: ${data.role}, timestamp: ${data.timestamp?.toDate() || 'N/A'}`);
        if (data.content) console.log(`    content: ${data.content.substring(0, 100)}...`);
    });
    // Also try to write a test message
    console.log('--- Attempting to write a test message ---');
    try {
        await chatHistoryRef.add({
            agentId: 'english',
            role: 'user',
            content: 'Test message from debug script',
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log('Write succeeded.');
    } catch (error) {
        console.error('Write failed:', error.message);
        console.error(error);
    }
}

const uid = 'EDZNtvh1RIXSpboSkcBE3Y6D8c12';
checkUser(uid).catch(console.error);