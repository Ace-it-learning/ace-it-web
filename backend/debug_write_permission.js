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

async function testWrite(uid) {
    console.log(`Testing write permissions for user ${uid}`);
    const userRef = db.collection('users').doc(uid);
    // Try to write to a test subcollection
    const testRef = userRef.collection('test_permission');
    try {
        await testRef.add({
            message: 'test',
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log('Write to test_permission succeeded.');
    } catch (error) {
        console.error('Write to test_permission failed:', error.message);
    }
    // Try to write to chat_history with agentId math
    const chatRef = userRef.collection('chat_history');
    try {
        await chatRef.add({
            agentId: 'math',
            role: 'user',
            content: 'test math',
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log('Write to chat_history with math succeeded.');
    } catch (error) {
        console.error('Write to chat_history math failed:', error.message);
    }
    // Try to write to chat_history with agentId english
    try {
        await chatRef.add({
            agentId: 'english',
            role: 'user',
            content: 'test english',
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log('Write to chat_history with english succeeded.');
    } catch (error) {
        console.error('Write to chat_history english failed:', error.message);
    }
    // Check existing chat_history counts
    const snapshot = await chatRef.get();
    console.log(`Total chat_history documents: ${snapshot.size}`);
    const mathSnapshot = await chatRef.where('agentId', '==', 'math').get();
    console.log(`Math documents: ${mathSnapshot.size}`);
    const englishSnapshot = await chatRef.where('agentId', '==', 'english').get();
    console.log(`English documents: ${englishSnapshot.size}`);
}

const uid = 'EDZNtvh1RIXSpboSkcBE3Y6D8c12';
testWrite(uid).catch(console.error);