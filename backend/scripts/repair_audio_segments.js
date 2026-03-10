const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const keyPath = path.join(__dirname, '../serviceAccountKey.json');
const serviceAccount = require(keyPath);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const repair = async () => {
    console.log('Starting Repair of Audio Segments...');
    const snap = await db.collection('question_bank')
        .where('is_approved', '==', false)
        .get();

    console.log(`Checking ${snap.size} documents in pending queue...`);
    let count = 0;

    for (const doc of snap.docs) {
        const d = doc.data();
        if (d.audio_segments && Array.isArray(d.audio_segments)) {
            let changed = false;
            const updatedSegments = d.audio_segments.map(s => {
                // Check for bracketed text like [American Accent]
                const speakableText = (s.text || '').replace(/\[.*?\]/g, '').trim();

                // If it was meant to be a stage direction but didn't have the flag
                if (speakableText.length === 0 && !s.isStageDirection) {
                    changed = true;
                    return { ...s, isStageDirection: true, audio: null };
                }

                // If it has audio but should be a stage direction (shouldn't happen but for safety)
                if (speakableText.length === 0 && s.audio) {
                    changed = true;
                    return { ...s, isStageDirection: true, audio: null };
                }

                return s;
            });

            if (changed) {
                await doc.ref.update({ audio_segments: updatedSegments });
                count++;
                console.log(`Repaired: ${doc.id} (${d.topic})`);
            }
        }
    }

    console.log(`Repair Complete. Fixed ${count} documents.`);
    process.exit(0);
};

repair().catch(err => {
    console.error('Repair failed:', err);
    process.exit(1);
});
