const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const keyPath = path.join(__dirname, '../serviceAccountKey.json');
const serviceAccount = require(keyPath);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const forceFix = async (docId) => {
    console.log(`Force fixing document: ${docId}`);
    const doc = await db.collection('question_bank').doc(docId).get();

    if (!doc.exists) {
        console.error('Doc not found');
        process.exit(1);
    }

    const d = doc.data();
    if (d.audio_segments && Array.isArray(d.audio_segments)) {
        const updatedSegments = d.audio_segments.map(s => {
            const speakableText = (s.text || '').replace(/\[.*?\]/g, '').trim();
            if (speakableText.length === 0) {
                console.log(`Setting isStageDirection for segment: ${s.text}`);
                return { ...s, isStageDirection: true, audio: null };
            }
            return s;
        });

        await doc.ref.update({ audio_segments: updatedSegments });
        console.log('Update committed.');
    } else {
        console.log('No audio_segments found.');
    }
    process.exit(0);
};

const targetId = 'd71fdc689f05787ac6dc13dbfc08ca5d';
forceFix(targetId).catch(err => {
    console.error('Fix failed:', err);
    process.exit(1);
});
