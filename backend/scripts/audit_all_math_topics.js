const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const serviceAccount = require(path.join(__dirname, '..', 'serviceAccountKey.json'));

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function auditTopics() {
    console.log('--- Auditing All Math Topics in Question Bank ---');
    const snapshot = await db.collection('question_bank').get();
    const topics = {};
    
    snapshot.forEach(doc => {
        const tid = doc.data().topic_id || 'undefined';
        topics[tid] = (topics[tid] || 0) + 1;
    });
    
    console.log('Question Bank Topics:', topics);
    
    // Check for singular/plural inconsistencies
    const potentialIssues = [];
    const keys = Object.keys(topics);
    keys.forEach(k1 => {
        keys.forEach(k2 => {
            if (k1 !== k2 && (k1 + 's' === k2 || k2 + 's' === k1)) {
                potentialIssues.push({ singular: k1.length < k2.length ? k1 : k2, plural: k1.length > k2.length ? k1 : k2 });
            }
        });
    });
    
    // De-duplicate issues
    const uniqueIssues = potentialIssues.filter((v, i, a) => a.findIndex(t => t.singular === v.singular) === i);
    
    if (uniqueIssues.length > 0) {
        console.warn('Potential Singular/Plural Inconsistencies Found:', uniqueIssues);
    } else {
        console.log('✅ No obvious singular/plural duplicates found.');
    }

    process.exit(0);
}

auditTopics().catch(console.error);
