const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const keyPath = path.join(__dirname, '../serviceAccountKey.json');
const serviceAccount = require(keyPath);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const searchQuest = async () => {
    console.log('Searching for American Accent quest...');
    const snap = await db.collection('question_bank').get();

    console.log(`Scanning ${snap.size} total documents...`);
    let found = false;

    for (const doc of snap.docs) {
        const d = doc.data();
        if (d.audio_segments && Array.isArray(d.audio_segments)) {
            const hasMatch = d.audio_segments.some(s => (s.text || '').includes('American Accent'));
            if (hasMatch) {
                found = true;
                console.log(`MATCH FOUND!`);
                console.log(`ID: ${doc.id}`);
                console.log(`Topic: ${d.topic}`);
                console.log(`Approved: ${d.is_approved}`);
                console.log(`Segments:`, d.audio_segments.map(s => ({
                    speaker: s.speaker,
                    text: s.text,
                    isStage: s.isStageDirection,
                    hasAudio: !!s.audio
                })));
            }
        }
    }

    if (!found) console.log('No matches found for "American Accent".');
    process.exit(0);
};

searchQuest().catch(err => {
    console.error('Search failed:', err);
    process.exit(1);
});
