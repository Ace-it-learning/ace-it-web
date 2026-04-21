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

async function debugChatHistory() {
    // List all users
    const usersSnapshot = await db.collection('users').limit(10).get();
    console.log(`Total users: ${usersSnapshot.size}`);

    for (const userDoc of usersSnapshot.docs) {
        const uid = userDoc.id;
        console.log(`\n=== User ${uid} ===`);
        const chatHistoryRef = db.collection('users').doc(uid).collection('chat_history');
        const snapshot = await chatHistoryRef.limit(20).get();
        if (snapshot.empty) {
            console.log('  No chat history documents.');
            continue;
        }
        console.log(`  Found ${snapshot.size} chat history documents:`);
        snapshot.forEach(doc => {
            const data = doc.data();
            console.log(`    - ID: ${doc.id}, agentId: ${data.agentId || 'N/A'}, role: ${data.role || 'N/A'}, timestamp: ${data.timestamp?.toDate() || 'N/A'}`);
            if (data.content) console.log(`      content: ${data.content.substring(0, 80)}...`);
        });
    }

    // Also check if there are any chat_history documents at all across all users
    const allChatSnapshot = await db.collectionGroup('chat_history').limit(50).get();
    console.log(`\n=== All chat_history documents across all users (${allChatSnapshot.size}) ===`);
    allChatSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`  User: ${doc.ref.parent.parent.id}, agentId: ${data.agentId}, role: ${data.role}`);
    });
}

debugChatHistory().catch(console.error);