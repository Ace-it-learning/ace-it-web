const admin = require('firebase-admin');
const path = require('path');

if (admin.apps.length === 0) {
    const serviceAccount = require(path.join(__dirname, '..', 'serviceAccountKey.json'));
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function findUserAndWipe(email) {
    console.log(`🔍 Searching for user: ${email}...`);
    const users = await db.collection('users').where('email', '==', email).get();
    
    if (users.empty) {
        console.error("❌ User not found.");
        return;
    }

    const userDoc = users.docs[0];
    const uid = userDoc.id;
    console.log(`✅ Found UID: ${uid}`);

    // 1. Identify Topic IDs for Trig Ratios
    const topicId = 'math_trig_ratios';
    const oldTopicId = 'math_geo_trig'; // Clear old mistakenly used ID too
    const relevantTopicIds = [topicId, oldTopicId];

    // 2. Find all question IDs for these topics
    console.log("📍 Finding all question IDs to wipe history...");
    const qids = [];
    for (const tid of relevantTopicIds) {
        const qSnap = await db.collection('question_bank').where('topic_id', '==', tid).get();
        qSnap.forEach(doc => qids.push(doc.id));
    }
    // Also include the specific trig_v3 subset just in case
    const qv3Snap = await db.collection('question_bank').get();
    qv3Snap.forEach(doc => {
        if (doc.id.startsWith('trig_v3_')) qids.push(doc.id);
    });

    const uniqueQids = Array.from(new Set(qids));
    console.log(`Found ${uniqueQids.length} potential questions to clear history for.`);

    // 3. Wipe Practice History
    const historyRef = db.collection('users').doc(uid).collection('practice_history');
    const batch = db.batch();
    let deleteCount = 0;

    for (const qid of uniqueQids) {
        const docRef = historyRef.doc(qid);
        const docSnap = await docRef.get();
        if (docSnap.exists) {
            batch.delete(docRef);
            deleteCount++;
        }
    }

    // 4. Wipe Timeline Entries
    const timelineRef = db.collection('users').doc(uid).collection('timeline');
    const timelineEvents = await timelineRef.get();
    timelineEvents.forEach(doc => {
        const data = doc.data();
        if (data.title && (data.title.includes('Trig') || data.title.includes('Trigonometry'))) {
            batch.delete(doc.ref);
            deleteCount++;
        }
    });

    if (deleteCount > 0) {
        await batch.commit();
        console.log(`✅ Deleted ${deleteCount} records from history and timeline.`);
    }

    // 5. Reset Mastery Progress in 'progress/maths'
    const progressRef = db.collection('users').doc(uid).collection('progress').doc('maths');
    const progressDoc = await progressRef.get();
    if (progressDoc.exists) {
        const data = progressDoc.data();
        const updates = {};
        
        // Reset specific micro-skills
        if (data.microSkills) {
            relevantTopicIds.forEach(id => {
                if (data.microSkills[id]) {
                    updates[`microSkills.${id}`] = admin.firestore.FieldValue.delete();
                }
            });
        }
        
        // Remove from practicedSkills array
        if (data.practicedSkills) {
            const newPracticed = data.practicedSkills.filter(s => !relevantTopicIds.includes(s));
            updates.practicedSkills = newPracticed;
        }

        if (Object.keys(updates).length > 0) {
            console.log("📍 Resetting Trig skill levels and progress...");
            await progressRef.update(updates);
        }
    }

    // 6. Reset Top-Level microSkills if they exist
    if (userDoc.data().microSkills && userDoc.data().microSkills.maths) {
        const topUpdates = {};
        relevantTopicIds.forEach(id => {
             if (userDoc.data().microSkills.maths[id]) {
                topUpdates[`microSkills.maths.${id}`] = admin.firestore.FieldValue.delete();
             }
        });
        if (Object.keys(topUpdates).length > 0) {
            await db.collection('users').doc(uid).update(topUpdates);
        }
    }

    console.log(`--- 🎉 SUCCESS: Trig history and progress wiped for ${email} ---`);
}

const targetEmail = 'fungtam@gmail.com';
findUserAndWipe(targetEmail).then(() => process.exit(0));
