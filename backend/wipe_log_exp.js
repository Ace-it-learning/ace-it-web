const admin = require('firebase-admin');
const path = require('path');

if (admin.apps.length === 0) {
    const serviceAccount = require(path.join(__dirname, 'serviceAccountKey.json'));
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function findUserAndWipe(email) {
    console.log(`Searching for user: ${email}...`);
    const users = await db.collection('users').where('email', '==', email).get();
    
    if (users.empty) {
        console.error("User not found.");
        return;
    }

    const userDoc = users.docs[0];
    const uid = userDoc.id;
    console.log(`Found UID: ${uid}`);

    // 1. Find all question IDs for Log & Exp
    console.log("Finding all question IDs for Log & Exp...");
    const topicIds = ['math_alg_log_exp', 'math_alg_logexp', 'math_alg_indices_log'];
    const qids = [];
    
    for (const tid of topicIds) {
        const qSnap = await db.collection('question_bank').where('topic_id', '==', tid).get();
        qSnap.forEach(doc => qids.push(doc.id));
    }
    console.log(`Found ${qids.length} questions in question_bank for these topics.`);

    // 2. Wipe Practice History for those QIDs
    const historyRef = db.collection('users').doc(uid).collection('practice_history');
    const batch = db.batch();
    let deleteCount = 0;

    for (const qid of qids) {
        const docRef = historyRef.doc(qid);
        const docSnap = await docRef.get();
        if (docSnap.exists) {
            batch.delete(docRef);
            deleteCount++;
        }
    }

    // Also delete any other related data in collections like 'timeline'
    const timelineRef = db.collection('users').doc(uid).collection('timeline');
    const timelineEvents = await timelineRef.get();
    timelineEvents.forEach(doc => {
        const data = doc.data();
        if (data.title && (data.title.includes('Log') || data.title.includes('Exp'))) {
            batch.delete(doc.ref);
            deleteCount++;
        }
    });

    if (deleteCount > 0) {
        await batch.commit();
        console.log(`Deleted ${deleteCount} records from history and timeline.`);
    }

    // 3. Reset Mastery Progress in 'progress/maths'
    const progressRef = db.collection('users').doc(uid).collection('progress').doc('maths');
    const progressDoc = await progressRef.get();
    if (progressDoc.exists) {
        const data = progressDoc.data();
        const updates = {};
        
        // Reset specific micro-skills
        if (data.microSkills) {
            topicIds.forEach(id => {
                if (data.microSkills[id]) {
                    updates[`microSkills.${id}`] = admin.firestore.FieldValue.delete();
                }
            });
        }
        
        // Remove from practicedSkills array
        if (data.practicedSkills) {
            const newPracticed = data.practicedSkills.filter(s => !topicIds.includes(s));
            updates.practicedSkills = newPracticed;
        }

        if (Object.keys(updates).length > 0) {
            console.log("Resetting Log & Exp skill levels and progress...");
            await progressRef.update(updates);
        }
    }

    console.log(`--- SUCCESS: Log & Exp history and progress wiped for ${email} ---`);
}

const targetEmail = 'fungtam@gmail.com';
findUserAndWipe(targetEmail).then(() => process.exit(0));
