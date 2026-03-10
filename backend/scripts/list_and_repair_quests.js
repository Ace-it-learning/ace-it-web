const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const keyPath = path.join(__dirname, '../serviceAccountKey.json');
const serviceAccount = require(keyPath);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const listAndRepair = async () => {
    console.log('Listing and Repairing ALL unapproved quests...');
    const snap = await db.collection('question_bank').where('is_approved', '==', false).get();

    console.log(`Found ${snap.size} unapproved documents.`);
    let repairedCount = 0;

    for (const doc of snap.docs) {
        const d = doc.data();
        console.log(`Checking DocID: ${doc.id} | Topic: ${d.topic}`);

        if (d.audio_segments && Array.isArray(d.audio_segments)) {
            let changed = false;
            const updatedSegments = d.audio_segments.map(s => {
                const speakableText = (s.text || '').replace(/\[.*?\]/g, '').trim();

                // Case 1: Pure stage direction (e.g. [Sighs]) that wasn't flagged
                if (speakableText.length === 0 && !s.isStageDirection) {
                    changed = true;
                    return { ...s, isStageDirection: true, audio: null };
                }

                // Case 2: Broken/Empty audio that isn't a stage direction (actual error)
                if (speakableText.length > 0 && !s.audio && !s.isError) {
                    changed = true;
                    return { ...s, isError: true };
                }

                return s;
            });

            if (changed) {
                await doc.ref.update({ audio_segments: updatedSegments });
                repairedCount++;
                console.log(`-> Repaired DocID: ${doc.id}`);
            }
        }
    }

    console.log(`Done. Total Repaired: ${repairedCount}`);
    process.exit(0);
};

listAndRepair().catch(err => {
    console.error('List and Repair failed:', err);
    process.exit(1);
});
