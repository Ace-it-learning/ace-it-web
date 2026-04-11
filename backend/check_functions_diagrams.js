const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const serviceAccount = require('./serviceAccountKey.json');

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

        // Save detailed report
        const report = {
            total: snapshot.size,
            withSvg,
            withoutSvg,
            timestamp: new Date().toISOString()
        };
        fs.writeFileSync('functions_diagrams_report.json', JSON.stringify(report, null, 2));
        console.log('Report saved to functions_diagrams_report.json');

    } catch (err) {
        console.error('Error:', err);
    }
}

checkFunctionsDiagrams().then(() => process.exit(0));