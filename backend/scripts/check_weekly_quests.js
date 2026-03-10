const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin (assuming local service account or environment vars)
if (admin.apps.length === 0) {
    admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        databaseURL: "https://ace-it-web.firebaseio.com"
    });
}

const db = admin.firestore();

async function checkUserStats() {
    // You'll need to provide the actual UID if possible, or iterate a few recent ones
    // For now, let's try to find users who have weekly_quests_completed
    const usersSnap = await db.collectionGroup('stats').where('weekly_quests_completed', '!=', []).get();

    console.log(`Found ${usersSnap.size} users with completed weekly quests.`);

    usersSnap.forEach(doc => {
        const data = doc.data();
        console.log(`User: ${doc.ref.parent.parent.id}`);
        console.log(`Weekly Quests Completed:`, data.weekly_quests_completed);
    });

    process.exit(0);
}

checkUserStats().catch(err => {
    console.error(err);
    process.exit(1);
});
