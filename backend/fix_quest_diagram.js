const admin = require('firebase-admin');
const path = require('path');

if (!admin.apps.length) {
    const keyPath = path.join(__dirname, 'serviceAccountKey.json');
    const serviceAccount = require(keyPath);
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

async function fixBuggyQuestion() {
    const db = admin.firestore();
    const qid = 'fc142c5761ec4c3500dcb8972ae06f55';
    const docRef = db.collection('question_bank').doc(qid);
    const doc = await docRef.get();

    if (!doc.exists) {
        console.log("Question not found");
        process.exit(1);
    }

    const data = doc.data();
    let diagram = JSON.parse(data.diagram_json);

    // 1. Add missing chord BC
    if (!diagram.lines.some(l => l.pts.includes('B') && l.pts.includes('C'))) {
        diagram.lines.push({ pts: ["B", "C"], style: "-" });
    }

    // 2. Add target angle indicator for BAC
    if (!diagram.angles.some(a => a.pts.includes('B') && a.pts.includes('A') && a.pts.includes('C'))) {
        diagram.angles.push({ pts: ["B", "A", "C"], label: "?", radius: 0.8 });
    }

    await docRef.update({
        diagram_json: JSON.stringify(diagram)
    });

    console.log("Successfully fixed diagram_json for", qid);
    process.exit(0);
}

fixBuggyQuestion();
