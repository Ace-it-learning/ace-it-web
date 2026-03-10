const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Initialise Firebase
const serviceAccountPath = path.join(__dirname, '../serviceAccountKey.json');
if (!fs.existsSync(serviceAccountPath)) {
    console.error('❌ Service account key not found at:', serviceAccountPath);
    process.exit(1);
}

admin.initializeApp({
    credential: admin.credential.cert(require(serviceAccountPath))
});

const db = admin.firestore();

// Known Maths Topics (IDs and Names) from constants
const MATHS_TOPICS = [
    'Percentages & Interest', 'Number Systems', 'Quadratic Equations', 'Functions & Graphs',
    'Polynomials', 'Indices & Logarithms', 'Variations', 'AS & GS Sequences',
    'Linear & Quadratic Inequalities', 'Coordinate Geometry', 'Equation of Circle',
    'Properties of Circle', 'Rectilinear Figures', 'Mensuration', 'Trigonometry Ratios',
    '3D Trigonometry', 'Trig Functions & Graphs', 'Measures of Dispersion',
    'Probability Basics', 'Permutations & Combinations', 'Trig Applications',
    'Ratio & Proportion', 'Inequalities', 'Log & Exp Functions', 'Complex Numbers',
    'Advanced Probability', 'Circle Properties', 'AP & GP', 'Statistical Charts', 'Basic Probability'
];

async function cleanMathsBank() {
    console.log('--- Maths Quest Bank Cleanup ---');
    const collectionRef = db.collection('question_bank');

    // Fetch all quests
    const snapshot = await collectionRef.get();
    console.log(`Total documents in question_bank: ${snapshot.size}`);

    let deletedCount = 0;
    const batchSize = 400;
    let batch = db.batch();
    let countInBatch = 0;

    for (const doc of snapshot.docs) {
        const data = doc.data();
        const topic = data.topic;

        // Match by topic name or ID prefix
        const isMaths = MATHS_TOPICS.includes(topic) ||
            (typeof topic === 'string' && topic.startsWith('math_')) ||
            (typeof doc.id === 'string' && doc.id.includes('math'));

        if (isMaths) {
            batch.delete(doc.ref);
            deletedCount++;
            countInBatch++;

            if (countInBatch >= batchSize) {
                await batch.commit();
                batch = db.batch();
                countInBatch = 0;
                console.log(`- Committed batch of ${batchSize} deletions...`);
            }
        }
    }

    if (countInBatch > 0) {
        await batch.commit();
    }

    console.log(`✅ Cleanup Complete! Deleted ${deletedCount} Maths Quests.`);
    process.exit(0);
}

cleanMathsBank().catch(err => {
    console.error('❌ Error during cleanup:', err);
    process.exit(1);
});
