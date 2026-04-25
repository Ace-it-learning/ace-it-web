const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

async function deepDiagnose() {
    console.log('--- Deep Firestore Diagnostic Start ---');
    
    const NODE_ENV = process.env.NODE_ENV || 'development';
    const saFilename = NODE_ENV === 'production' ? 'config/antigravity-tutor-prod-key.json' : 'config/antigravity-tutor-dev-key.json';
    const serviceAccountPath = path.join(__dirname, '..', saFilename);

    if (!fs.existsSync(serviceAccountPath)) {
        console.error('❌ Service Account Key NOT FOUND at', serviceAccountPath);
        return;
    }

    try {
        const serviceAccount = require(serviceAccountPath);
        if (admin.apps.length === 0) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
        }

        const db = admin.firestore();
        console.log('✅ Firebase initialized. Project:', serviceAccount.project_id);

        const testUid = process.argv[2] || '5Odg5iXsS7P9tRm0NMkBMMlDYvD2';

        // Test 1: Fetching users
        console.log(`Test 1: Fetching user ${testUid}...`);
        const userDoc = await db.collection('users').doc(testUid).get();
        if (userDoc.exists) {
            console.log(`✅ User found: ${userDoc.data().displayName || 'No Name'}`);
        } else {
            console.log(`❌ User NOT found: ${testUid}`);
        }

        // Test 2: Fetching chat history
        console.log(`Test 2: Fetching chat_history for user ${testUid}...`);
        const chatSnapshot = await db.collection('users').doc(testUid).collection('chat_history').limit(5).get();
        console.log(`Found ${chatSnapshot.size} chat messages.`);
        if (chatSnapshot.size > 0) {
            console.log('Sample message:', chatSnapshot.docs[0].data());
        }

        // Test 3: Fetching question_bank
        console.log('Test 3: Fetching "question_bank"...');
        const qbSnapshot = await db.collection('question_bank').limit(5).get();
        console.log(`Found ${qbSnapshot.size} questions.`);

        // Test 4: Check for Index Errors
        console.log('Test 4: Testing complex query (potential index check)...');
        try {
            const indexTest = await db.collection('question_bank')
                .where('paper', '==', 'Listening')
                .orderBy('id') // This might need an index if we used multiple where/order
                .limit(1)
                .get();
            console.log('✅ Complex query worked.');
        } catch (e) {
            console.warn('⚠️ Complex query failed (might need index):', e.message);
        }

    } catch (error) {
        console.error('❌ Deep Diagnostic FAILED:', error);
    }
    
    console.log('--- Deep Firestore Diagnostic End ---');
}

deepDiagnose();
