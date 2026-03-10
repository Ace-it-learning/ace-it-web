const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config();

const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

// Initialize Firebase
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(require(serviceAccountPath))
    });
}

const db = admin.firestore();

async function searchCirc() {
    console.log("Searching for 'circ' and geometry fragments in math topics...");
    const collections = ['question_bank', 'pending_audit', 'diagnostic_questions', 'lesson_content'];

    let totalCount = 0;

    for (const colName of collections) {
        console.log(`Checking collection: ${colName}`);
        const snapshot = await db.collection(colName).get();
        let count = 0;

        snapshot.forEach(doc => {
            const data = doc.data();
            const str = JSON.stringify(data);

            // Search for the specific fragments
            if (str.includes("quadrilateral") && str.includes("BC = CD")) {
                console.log(`[FOUND TARGET] Collection: ${colName}, ID: ${doc.id}`);
                console.log(JSON.stringify(data, null, 2));
            }

            // Only look at math topics for 'circ' check
            if (data.topic && !data.topic.startsWith('math_')) return;

            // Look for any '^circ' or '{circ}' or standalone 'circ' (riskier but we are filtering by math)
            // But we should exclude words like 'circuit'
            const mathStr = (data.question || "") + " " + (data.explanation || "");
            if (/\^circ|\{circ\}|(?<![a-z])circ(?![a-z])/i.test(mathStr) && !mathStr.includes('\\circ') && !mathStr.includes('\\degree')) {
                count++;
                totalCount++;
                console.log(`- [${colName}] [${data.topic}, L${data.level}] ID: ${doc.id} | ${data.question?.substring(0, 100)}...`);
            }
        });
        console.log(`Found ${count} in ${colName}`);
    }

    console.log(`Total suspected questions: ${totalCount}`);
}

searchCirc().catch(console.error);
