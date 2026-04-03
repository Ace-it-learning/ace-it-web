const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');
if (!fs.existsSync(serviceAccountPath)) {
    console.error('❌ Service account key not found at:', serviceAccountPath);
    process.exit(1);
}

admin.initializeApp({
    credential: admin.credential.cert(require(serviceAccountPath))
});

const db = admin.firestore();

async function seedPolynomials() {
    console.log('--- Starting Polynomials Seeding ---');
    
    const filePath = path.join(__dirname, '../../tmp/polynomials_questions_final.json');
    if (!fs.existsSync(filePath)) {
        console.error('Error: polynomials_questions_final.json not found in tmp/');
        return;
    }

    const questions = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    console.log(`Loaded ${questions.length} questions from JSON.`);

    const batch = db.batch();
    const collectionRef = db.collection('question_bank');

    for (const q of questions) {
        // Use the ID from JSON or a generated one
        const docRef = collectionRef.doc(q.id);
        batch.set(docRef, {
            ...q,
            topic: 'Polynomials',
            topic_id: 'math_alg_polynomials',
            subject: 'Maths',
            type: 'conventional',
            is_approved: true,
            is_factory: true,
            created_at: admin.firestore.FieldValue.serverTimestamp(),
            updated_at: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        console.log(`Prepared: ${q.id} (Gold Standard)`);
    }

    try {
        await batch.commit();
        console.log('--- Success: 30 Polynomials Questions Seeded ---');
    } catch (error) {
        console.error('Error committing batch:', error);
    }
}

seedPolynomials().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
});
