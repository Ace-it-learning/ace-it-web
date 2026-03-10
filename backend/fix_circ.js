const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config();

const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(require(serviceAccountPath))
    });
}

const db = admin.firestore();

async function fixCirc() {
    console.log("Starting universal 'circ' fix in question_bank...");
    const snapshot = await db.collection('question_bank').get();

    let fixCount = 0;

    for (const doc of snapshot.docs) {
        const data = doc.data();
        let changed = false;

        // Function to repair circ patterns in a string
        const repairString = (str) => {
            if (typeof str !== 'string') return str;
            // 1. Repair ^{circ} or ^circ or {circ} where not escaped
            // Matches any 'circ' that follows ^ or { or just looks like an angle unit
            let newStr = str;

            // Regex for ^{circ} -> ^\circ
            newStr = newStr.replace(/\^\{\s*circ\s*\}/g, '^{\\circ}');
            // Regex for ^circ -> ^\circ
            newStr = newStr.replace(/\^circ(?![a-z])/g, '^\\circ');
            // Regex for {circ} -> {\circ}
            newStr = newStr.replace(/(?<!\\)\{circ\}/g, '{\\circ}');
            // Regex for 90circ -> 90^\circ
            newStr = newStr.replace(/(\d+)\s*circ(?![a-z])/g, '$1^{\\circ}');

            if (newStr !== str) changed = true;
            return newStr;
        };

        // Recursively walk and repair
        const repairObject = (obj) => {
            if (!obj) return obj;
            if (typeof obj === 'string') return repairString(obj);
            if (Array.isArray(obj)) return obj.map(item => repairObject(item));
            if (typeof obj === 'object') {
                const newObj = {};
                for (let key in obj) {
                    newObj[key] = repairObject(obj[key]);
                }
                return newObj;
            }
            return obj;
        };

        const newData = repairObject(data);

        if (changed) {
            console.log(`- Fixing question ID: ${doc.id} (${data.topic})`);
            await db.collection('question_bank').doc(doc.id).set(newData);
            fixCount++;
        }
    }

    console.log(`Successfully fixed ${fixCount} questions.`);
}

fixCirc().catch(console.error);
