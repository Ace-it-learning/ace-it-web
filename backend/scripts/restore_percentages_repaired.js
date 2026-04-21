const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin (service account logic usually handles this if not already initialized)
if (admin.apps.length === 0) {
    admin.initializeApp({
        credential: admin.credential.applicationDefault()
    });
}

const db = admin.firestore();

const files = [
    'backend/data/maths/integrated_batch_26.json',
    'backend/data/maths/integrated_batch_27.json',
    'backend/data/maths/integrated_batch_28.json'
];

async function restore() {
    console.log('[Restore] Starting import of 30 questions...');
    const batch = db.batch();
    const collection = db.collection('question_bank');
    
    let count = 0;
    
    for (const file of files) {
        const fullPath = path.join(process.cwd(), file);
        const questions = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
        
        for (const q of questions) {
            const docId = q.id || `rep_${Date.now()}_${count}`;
            const docRef = collection.doc(docId);
            
            const firestoreData = {
                ...q,
                topic_id: 'math_num_percentages',
                topic_name: 'Percentages & Interest',
                subject: 'maths',
                category: 'num',
                level: q.level || 3,
                created_at: admin.firestore.FieldValue.serverTimestamp(),
                v: '1.2.8'
            };
            
            batch.set(docRef, firestoreData);
            count++;
        }
    }
    
    await batch.commit();
    console.log(`[Restore] Successfully imported ${count} questions to question_bank.`);
}

restore().catch(err => {
    console.error('[Restore] Failed:', err);
    process.exit(1);
});
