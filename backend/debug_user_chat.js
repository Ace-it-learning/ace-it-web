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

async function debugUser(uid) {
    console.log(`=== User ${uid} ===`);
    const chatHistoryRef = db.collection('users').doc(uid).collection('chat_history');
    const snapshot = await chatHistoryRef.get();
    if (snapshot.empty) {
        console.log('  No chat history documents.');
        return;
    }
    console.log(`  Found ${snapshot.size} chat history documents:`);
    snapshot.forEach(doc => {
        const data = doc.data();
        console.log(`    - ID: ${doc.id}`);
        console.log(`      agentId: ${data.agentId || 'N/A'}`);
        console.log(`      role: ${data.role || 'N/A'}`);
        console.log(`      timestamp: ${data.timestamp?.toDate() || 'N/A'}`);
        if (data.content) console.log(`      content: ${data.content.substring(0, 100)}...`);
        else if (data.message) console.log(`      message: ${data.message.substring(0, 100)}...`);
        else if (data.response) console.log(`      response: ${data.response.substring(0, 100)}...`);
    });
}

debugUser('HUJ6CtxNOAdWv7q7sTIwrlotF8B2').catch(console.error);