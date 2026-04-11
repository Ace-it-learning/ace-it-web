const admin = require('firebase-admin');
const path = require('path');

const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');
if (admin.apps.length === 0) {
    admin.initializeApp({
        credential: admin.credential.cert(require(serviceAccountPath))
    });
}

const db = admin.firestore();

async function verify() {
    console.log('--- DB VERIFICATION ---');
    
    // Check briefing
    const briefDoc = await db.collection('learning_content').doc('math_trig_ratios').get();
    if (briefDoc.exists) {
        console.log('✅ learning_content/math_trig_ratios exists');
        console.log('   Modules count:', briefDoc.data().learning_modules?.length);
    } else {
        console.log('❌ learning_content/math_trig_ratios NOT FOUND');
    }

    // Check questions
    const questionsSnapshot = await db.collection('question_bank')
        .where('topic_id', '==', 'math_trig_ratios')
        .where('is_approved', '==', true)
        .get();
    
    console.log(`✅ Total questions found for math_trig_ratios: ${questionsSnapshot.size}`);
    
    if (questionsSnapshot.size > 0) {
        const sample = questionsSnapshot.docs[0].data();
        console.log('--- SAMPLE QUESTION ---');
        console.log('ID:', questionsSnapshot.docs[0].id);
        console.log('Level:', sample.level);
        console.log('Question snippets:', sample.question.substring(0, 50));
        console.log('Has SVG:', !!sample.diagram_svg);
    }

    process.exit(0);
}

verify();
