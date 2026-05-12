const admin = require('firebase-admin');
const serviceAccount = require('./config/serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function wipeProgress(email) {
    try {
        const userRecord = await admin.auth().getUserByEmail(email);
        const uid = userRecord.uid;
        console.log(`Found user: ${email} (UID: ${uid})`);

        const topicId = 'math_stat_charts';

        // 1. Wipe from user_progress (Math Lab Sessions)
        const progressRef = db.collection('user_progress').doc(uid).collection('maths').doc(topicId);
        await progressRef.delete();
        console.log(`- Deleted ${topicId} from user_progress`);

        // 2. Clear from seen_questions
        const seenRef = db.collection('seen_questions').doc(uid);
        const seenDoc = await seenRef.get();
        if (seenDoc.exists) {
            const data = seenDoc.data();
            const filtered = Object.keys(data).reduce((acc, qid) => {
                // If it's a stat_ chart question, we want to remove it
                if (!qid.startsWith('stat_')) {
                    acc[qid] = data[qid];
                }
                return acc;
            }, {});
            await seenRef.set(filtered);
            console.log(`- Cleared 'stat_' questions from seen_questions`);
        }

        // 3. Reset Micro-Skill Mastery
        const profileRef = db.collection('users').doc(uid);
        const profileDoc = await profileRef.get();
        if (profileDoc.exists) {
            const profile = profileDoc.data();
            if (profile.math_skills && profile.math_skills[topicId]) {
                delete profile.math_skills[topicId];
                await profileRef.update({ math_skills: profile.math_skills });
                console.log(`- Reset ${topicId} in math_skills profile`);
            }
        }

        console.log('\n✅ Practice Session Wiped. User will see fresh content upon next load.');
    } catch (e) {
        console.error('Error wiping progress:', e.message);
    }
}

wipeProgress('fungtam@gmail.com');
