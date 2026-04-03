const admin = require('firebase-admin');
const path = require('path');

const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(require(serviceAccountPath))
    });
}

async function wipe() {
    try {
        const userEmail = 'fungtam@gmail.com';
        const user = await admin.auth().getUserByEmail(userEmail);
        const uid = user.uid;
        const topic = 'math_geo_rectilinear';
        
        console.log(`[Wipe] Found user ${userEmail} (UID: ${uid})`);
        
        const db = admin.firestore();
        const historyRef = db.collection('users').doc(uid).collection('practice_history');
        
        // Find all history for this topic
        const snapshot = await historyRef.where('topic_id', '==', topic).get();
        console.log(`[Wipe] Found ${snapshot.size} history records for topic: ${topic}`);
        
        if (snapshot.size === 0) {
            // Check if they are stored without topic_id (legacy)
            // If so, we might need to cross-reference with question_bank or just wipe all if the user insists
            console.log('[Wipe] No topic-specific records found. Searching for any records...');
            const allSnapshot = await historyRef.limit(100).get();
            console.log(`[Wipe] Found ${allSnapshot.size} total records in practice_history.`);
            
            // To be safe and thorough, let's find identifying info in the bank
            const bankSnap = await db.collection('question_bank').where('topic_id', '==', topic).get();
            const geoIds = new Set();
            bankSnap.forEach(d => geoIds.add(d.id));
            
            let deleteCount = 0;
            const batch = db.batch();
            allSnapshot.forEach(doc => {
                if (geoIds.has(doc.id)) {
                    batch.delete(doc.ref);
                    deleteCount++;
                }
            });
            
            if (deleteCount > 0) {
                await batch.commit();
                console.log(`✅ wiped ${deleteCount} records matching geometry questions.`);
            } else {
                console.log('No matching records found to wipe.');
            }
        } else {
            const batch = db.batch();
            snapshot.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
            console.log(`✅ Wiped ${snapshot.size} records for topic: ${topic}`);
        }
        
    } catch (err) {
        console.error('❌ Wipe failed:', err);
    }
    process.exit(0);
}

wipe();
