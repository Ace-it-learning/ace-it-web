const admin = require('firebase-admin');
const path = require('path');

const serviceAccount = require(path.join(__dirname, '..', 'serviceAccountKey.json'));

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function auditMissions() {
    console.log("--- Starting Fidelity Audit (Part A vs Part B Independence) ---");
    
    for (let i = 1; i <= 4; i++) {
        const questId = `listening_mission_${i}`;
        const doc = await db.collection('question_bank').doc(questId).get();
        if (!doc.exists) {
            console.log(`[${questId}] Not Found.`);
            continue;
        }
        
        const q = doc.data();
        const markingKey = q.integrated_data?.marking_key || [];
        const partBTranscript = q.integrated_data?.audio_transcript || "";
        const partBDataFiles = JSON.stringify(q.integrated_data?.data_file || []);
        const partBContext = (partBTranscript + " " + partBDataFiles).toLowerCase();
        
        const partATranscript = (q.sprint_data?.audio_transcript || "").toLowerCase();
        
        console.log(`\nAudit [${questId}]: ${q.title}`);
        
        markingKey.forEach(point => {
            // Match numbers, dates (like "March 1st"), or CamelCase words
            const keywords = point.match(/\d+(?:st|nd|rd|th)?|\d+|[A-Z][a-z]+|[A-Z]{2,}/g) || [];
            
            let foundInB = false;
            let foundInA = false;
            
            keywords.forEach(kw => {
                if (partBContext.includes(kw.toLowerCase())) foundInB = true;
                if (partATranscript.includes(kw.toLowerCase())) foundInA = true;
            });
            
            if (!foundInB && foundInA && keywords.length > 0) {
                console.warn(`  ⚠️  POINT POTENTIALLY STUCK IN PART A: "${point}"`);
                console.log(`     (Keywords detected in A but not in B context: ${keywords.join(', ')})`);
            }
        });
    }
    process.exit(0);
}

auditMissions();
