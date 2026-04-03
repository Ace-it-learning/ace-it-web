const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase
const serviceAccount = require(path.join(__dirname, '../serviceAccountKey.json'));

if (admin.apps.length === 0) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();
const UIDS = ['HUJ6CtxNOAdWv7q7sTIwrlotF8B2', 'xnPN9Id77ZM7YQS0rcESgDDz7yN2']; // All Jack Tam IDs
const TOPIC_ID = 'math_num_percentages';

async function deepReset() {
    console.log(`[DeepReset] Starting comprehensive multi-user reset for: ${TOPIC_ID}...`);

    for (const uid of UIDS) {
        console.log(`[DeepReset] Deep-cleaning user: ${uid}...`);
        const batch = db.batch();

        // 1. Wipe the skills sub-collection
        const skillRef = db.collection('users').doc(uid).collection('skills').doc(TOPIC_ID);
        batch.delete(skillRef);

        // 2. Wipe the practice_history sub-collection
        const historySnapshot = await db.collection('users').doc(uid).collection('practice_history')
            .where('topic_id', '==', TOPIC_ID)
            .get();
        historySnapshot.forEach(doc => batch.delete(doc.ref));

        // 3. Wipe the 'progress/maths' micro-skill level entry (The Mastery Bar)
        const progressRef = db.collection('users').doc(uid).collection('progress').doc('maths');
        const progressDoc = await progressRef.get();
        if (progressDoc.exists) {
            const data = progressDoc.data();
            const microSkills = data.microSkills || {};
            const practicedSkills = data.practicedSkills || [];
            
            if (microSkills[TOPIC_ID]) {
                delete microSkills[TOPIC_ID];
                console.log(`[DeepReset] Removed ${TOPIC_ID} from microSkills for ${uid}.`);
            }
            
            const updatedPracticedSkills = practicedSkills.filter(s => s !== TOPIC_ID);
            
            batch.update(progressRef, {
                microSkills,
                practicedSkills: updatedPracticedSkills,
                last_updated: admin.firestore.FieldValue.serverTimestamp()
            });
        }

        // 4. Wipe 'maths_history' snapshots for this topic
        const histSnapshots = await db.collection('users').doc(uid).collection('progress').doc('maths_history').collection('snapshots').get();
        histSnapshots.forEach(doc => {
            const d = doc.data();
            if (d.microSkills && d.microSkills[TOPIC_ID]) {
                batch.delete(doc.ref);
            }
        });

        // 5. Delete specific "Matt Sir" congratulations for Percentages in chat_history
        const chatSnapshot = await db.collection('users').doc(uid).collection('chat_history')
            .where('agentId', '==', 'matt')
            .get();
        chatSnapshot.forEach(doc => {
            const content = doc.data().content || '';
            if (content.toLowerCase().includes('percentage') || content.toLowerCase().includes('congratulations')) {
                batch.delete(doc.ref);
            }
        });

        // 6. Remove completion event from timeline
        const timelineSnapshot = await db.collection('users').doc(uid).collection('timeline').get();
        timelineSnapshot.forEach(doc => {
            const d = doc.data();
            if (d.title?.toLowerCase().includes('percentage') || d.id?.includes(TOPIC_ID)) {
                batch.delete(doc.ref);
            }
        });

        // 7. Clear quest_stats and milestones in the main user document
        const userRef = db.collection('users').doc(uid);
        batch.set(userRef, {
            quest_stats: { [TOPIC_ID]: admin.firestore.FieldValue.delete() },
            milestones: { [TOPIC_ID]: admin.firestore.FieldValue.delete() }
        }, { merge: true });

        await batch.commit();
        console.log(`[DeepReset] User ${uid} deep-cleaning complete.`);
    }

    console.log(`[DeepReset] SUCCESS: Jack Tam is now starting with a completely blank slate for Percentages.`);
}

deepReset().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
});
