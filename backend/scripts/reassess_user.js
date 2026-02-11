const admin = require('firebase-admin');
const path = require('path');
const MicroSkillAssessor = require('../services/MicroSkillAssessor');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const serviceAccount = require(path.join(__dirname, '..', 'serviceAccountKey.json'));

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function reAssessUser(uid) {
    console.log(`[Re-Assess] Fetching raw_results for ${uid}...`);
    const doc = await db.collection('users').doc(uid).collection('progress').doc('english').get();

    if (!doc.exists || !doc.data().raw_results) {
        console.error("No raw results found.");
        return;
    }

    const rawResults = doc.data().raw_results;
    console.log(`[Re-Assess] Raw results keys: ${Object.keys(rawResults)}`);

    console.log("[Re-Assess] Running MicroSkillAssessor.assessAllSkills...");
    try {
        const skills = await MicroSkillAssessor.assessAllSkills(rawResults);
        console.log("[Re-Assess] Done. Skills keys count:", Object.keys(skills).length);
        console.log("[Re-Assess] Writing keys:", Object.keys(skills).filter(k => k.startsWith('writing')));
        console.log("[Re-Assess] Speaking keys:", Object.keys(skills).filter(k => k.startsWith('speaking')));

        // If we got new skills, let's update the doc
        if (Object.keys(skills).filter(k => k.startsWith('writing')).length > 0) {
            console.log("[Re-Assess] Updating Firestore with new skills...");
            await db.collection('users').doc(uid).collection('progress').doc('english').update({
                microSkills: skills,
                lastUpdated: admin.firestore.FieldValue.serverTimestamp()
            });
            console.log("[Re-Assess] Firestore updated successfully.");
        } else {
            console.warn("[Re-Assess] No writing skills returned from assessor.");
            console.log("Full skill keys:", Object.keys(skills));
        }
    } catch (err) {
        console.error("[Re-Assess] Error during assessment:", err);
    }
}

const targetUid = 'MqNr6Kd7TeSsIvm50fIUJ91jeDf2';
reAssessUser(targetUid).then(() => process.exit());
