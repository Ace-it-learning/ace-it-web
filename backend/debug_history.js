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

async function debugHistory() {
    // Get a user ID from the users collection
    const usersSnapshot = await db.collection('users').limit(5).get();
    if (usersSnapshot.empty) {
        console.log('No users found.');
        return;
    }
    console.log('Users found:');
    usersSnapshot.forEach(doc => {
        console.log(`- ${doc.id}:`, doc.data().email || 'no email');
    });

    // Pick the first user
    const firstUser = usersSnapshot.docs[0];
    const uid = firstUser.id;
    console.log(`\nInspecting chat_history for user ${uid}`);
    const chatHistoryRef = db.collection('users').doc(uid).collection('chat_history');
    const snapshot = await chatHistoryRef.limit(10).get();
    if (snapshot.empty) {
        console.log('No chat history documents found.');
    } else {
        console.log(`Found ${snapshot.size} chat history documents:`);
        snapshot.forEach(doc => {
            const data = doc.data();
            console.log(`  - ID: ${doc.id}, agentId: ${data.agentId}, role: ${data.role}, content: ${data.content ? data.content.substring(0, 50) : 'N/A'}`);
        });
    }

    // Also test getChatHistory via UserProfileService
    console.log('\nTesting UserProfileService.getChatHistory...');
    const UserProfileService = require('./services/UserProfileService');
    const service = new UserProfileService();
    const history = await service.getChatHistory(uid, 'english');
    console.log(`History length: ${history.length}`);
    console.log(history);
}

debugHistory().catch(console.error);