const admin = require('firebase-admin');
const path = require('path');
const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(require(serviceAccountPath))
    });
}

const db = admin.firestore();

async function checkTokens() {
    try {
        const usersSnap = await db.collection('users').where('nickname', '==', 'Jack Tam').get();
        if (usersSnap.empty) {
            console.log("User 'Jack Tam' not found.");
            // Try searching by profile name
            const profilesSnap = await db.collection('users').get();
            let found = false;
            for (const doc of profilesSnap.docs) {
                const data = doc.data();
                if (data.profile?.name === 'Jack Tam' || data.nickname === 'Jack Tam' || data.email === 'fungtam@gmail.com') {
                    await printUsage(doc.id, data.profile?.name || data.nickname);
                    found = true;
                    break;
                }
            }
            if (!found) console.log("No user found with name Jack Tam");
            return;
        }

        for (const doc of usersSnap.docs) {
            await printUsage(doc.id, doc.data().nickname);
        }
    } catch (e) {
        console.error("Error:", e);
    }
}

async function printUsage(uid, name) {
    console.log(`Checking usage for ${name} (${uid})...`);
    const summary = await db.collection('users').doc(uid).collection('usage_summary').doc('overall').get();
    if (summary.exists) {
        console.log("Usage Summary:", JSON.stringify(summary.data(), null, 2));
    } else {
        console.log("No usage summary found for this user.");
    }

    // Check for any specific quotas
    const profile = await db.collection('users').doc(uid).get();
    const data = profile.data();
    if (data.quotas) {
        console.log("Quotas:", JSON.stringify(data.quotas, null, 2));
    } else {
        console.log("No specific quotas found in user profile.");
    }
}

checkTokens();
