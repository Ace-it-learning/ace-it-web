const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const MathsLabService = require('../services/maths/MathsLabService');

const serviceAccount = require(path.join(__dirname, '..', 'serviceAccountKey.json'));

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const params = {
    uid: '3OqcVxoXxmWuEIw5VmctjIm7Wzi2',
    topic: 'math_mensuration', // 求積法
    level: 5, // CHANGED: Test DSE Level 5 difficulty
    language: 'zh-HK' // CHANGED: Test Formal Cantonese rule
};

console.log("Running reproduction script...");

MathsLabService.generateLesson(params)
    .then(data => {
        console.log("Success! Data returned.");
        const q1 = data.interactive_tasks[0];
        console.log("---------------------------------------------------");
        console.log("QUESTION TEXT:", q1.text);
        if (q1.options) console.log("bOptions:", q1.options);
        console.log("---------------------------------------------------");

        if (q1.diagram_json) {
            console.log("✅ diagram_json found!");
            console.log(JSON.stringify(q1.diagram_json, null, 2));
        } else if (q1.diagram_svg) {
            console.log("⚠️ diagram_svg found (Legacy)");
        } else {
            console.log("❌ No diagram found");
        }
    })
    .catch(err => {
        console.error("=== CAUGHT REPRODUCTION ERROR ===");
        console.error(err);
        process.exit(1);
    });
