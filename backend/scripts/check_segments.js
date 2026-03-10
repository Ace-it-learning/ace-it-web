const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const keyPath = path.join(__dirname, '../serviceAccountKey.json');
const serviceAccount = require(keyPath);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const checkSegments = async (docId) => {
    console.log(`Checking doc: ${docId}`);
    const doc = await db.collection('question_bank').doc(docId).get();
    const d = doc.data();

    if (!d || !d.audio_segments) {
        console.log('No audio_segments');
        process.exit(0);
    }

    d.audio_segments.forEach((s, i) => {
        console.log(`--- Segment ${i} ---`);
        console.log(`Speaker: ${s.speaker}`);
        console.log(`Text: ${JSON.stringify(s.text)}`);
        console.log(`IsStageDirection: ${s.isStageDirection}`);
        console.log(`Audio length: ${s.audio ? s.audio.length : 'null'}`);

        const speakableText = (s.text || '').replace(/\[.*?\]/g, '').trim();
        console.log(`Calculated Speakable: "${speakableText}" (len: ${speakableText.length})`);
    });

    process.exit(0);
};

const targetId = 'd71fdc689f05787ac6dc13dbfc08ca5d';
checkSegments(targetId).catch(console.error);
