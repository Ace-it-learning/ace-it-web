const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

const db = admin.firestore();

async function inspectListeningMissions() {
    console.log('Inspecting Listening Missions...');

    try {
        // 1. Check for 'listening_mission' type
        const snapshot = await db.collection('question_bank')
            .where('type', '==', 'listening_mission')
            .get(); // Get all, we can filter in memory if needed

        console.log(`\nFound ${snapshot.size} documents with type 'listening_mission':`);
        snapshot.forEach(doc => {
            const data = doc.data();
            console.log(`- ID: ${doc.id}`);
            console.log(`  Title: ${data.title}`);
            console.log(`  Topic: ${data.topic}`);
            console.log(`  Level: ${data.level}`);
            console.log(`  Is Approved: ${data.is_approved}`);
            console.log(`  Created At: ${data.created_at ? data.created_at.toDate() : 'N/A'}`);
            console.log('---');
        });

        // 2. Check for recent documents that might be the missing ones (maybe type is wrong)
        // We'll look for documents created in the last 24 hours that mention "University" or "Interview"
        console.log('\nScanning recent documents for "University" or "Interview"...');
        const recentSnapshot = await db.collection('question_bank')
            // .orderBy('created_at', 'desc') // Requires index, might fail
            .limit(50)
            .get();

        let foundPotential = false;
        recentSnapshot.forEach(doc => {
            const data = doc.data();
            const content = JSON.stringify(data).toLowerCase();
            if (content.includes('university') || content.includes('interview')) {
                if (data.type !== 'listening_mission') {
                    console.log(`POTENTIAL MATCH (Wrong Type?):`);
                    console.log(`- ID: ${doc.id}`);
                    console.log(`  Type: ${data.type}`); // Check what type it was saved as
                    console.log(`  Title: ${data.title}`);
                    console.log(`  Topic: ${data.topic}`);
                    console.log('---');
                    foundPotential = true;
                }
            }
        });

        if (!foundPotential) {
            console.log("No other potential matches found in recent documents.");
        }

    } catch (error) {
        console.error('Error inspecting missions:', error);
    }
}

inspectListeningMissions();
