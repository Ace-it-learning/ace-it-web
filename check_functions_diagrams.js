const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const serviceAccount = require('./backend/serviceAccountKey.json');

if (admin.apps.length === 0) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function checkFunctionsDiagrams() {
    const topicId = 'math_alg_functions';
    console.log(`Checking diagrams for topic: ${topicId}`);

    try {
        const snapshot = await db.collection('question_bank')
            .where('topic_id', '==', topicId)
            .get();

        console.log(`Total questions: ${snapshot.size}`);

        let withSvg = 0;
        let withoutSvg = 0;

        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.diagram_svg && data.diagram_svg.length > 50) {
                withSvg++;
            } else {
                withoutSvg++;
                console.log(`No diagram_svg for: ${data.id}`);
            }
        });

        console.log(`Questions with SVG diagrams: ${withSvg}`);
        console.log(`Questions without SVG diagrams: ${withoutSvg}`);

        if (withoutSvg === 0) {
            console.log('✅ All questions have SVG diagrams!');
        } else {
            console.log('❌ Some questions missing SVG diagrams.');
        }

        // Sample a few questions to show diagram_svg content
        const sampleDocs = snapshot.docs.slice(0, 3);
        sampleDocs.forEach(doc => {
            const data = doc.data();
            console.log(`\n--- Sample ${data.id} ---`);
            console.log(`Has diagram_svg: ${!!data.diagram_svg}`);
            if (data.diagram_svg) {
                console.log(`Length: ${data.diagram_svg.length}`);
                console.log(`Preview: ${data.diagram_svg.substring(0, 100)}...`);
            }
        });

    } catch (err) {
        console.error('Error:', err);
    }
}

checkFunctionsDiagrams().then(() => process.exit(0));