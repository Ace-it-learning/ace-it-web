const MathsLabService = require('./services/maths/MathsLabService');
const path = require('path');
const fs = require('fs');
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

require('dotenv').config({ path: path.join(__dirname, '.env') });

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

async function dump() {
    console.log("Generating Maths Quest Sample...");
    try {
        const result = await MathsLabService.generateLesson({
            topic: 'math_geom_trigo',
            level: 4,
            language: 'zh'
        });

        fs.writeFileSync('maths_quest_dump.json', JSON.stringify(result, null, 2));
        console.log("Dump successful! See maths_quest_dump.json");

    } catch (error) {
        console.error("Dump Failed:", error);
    }
}

dump();
