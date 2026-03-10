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
        const email = 'fungtam@gmail.com';
        const userRef = await db.collection('users').where('email', '==', email).get();

        if (userRef.empty) {
            console.log(`No user found with email ${email}`);
            return;
        }

        for (const doc of userRef.docs) {
            const uid = doc.id;
            const data = doc.data();
            console.log(`\n--- User: ${data.nickname || data.profile?.name || 'Anonymous'} (${uid}) ---`);

            // Check usage summary
            const usageSnap = await db.collection('users').doc(uid).collection('usage_summary').get();
            if (usageSnap.empty) {
                console.log("No usage_summary collection found.");
            } else {
                usageSnap.forEach(uDoc => {
                    console.log(`Usage Summary (${uDoc.id}):`, JSON.stringify(uDoc.data(), null, 2));
                });
            }

            // Check if there are any specific quota fields
            console.log("Profile Data (Quota fields):", JSON.stringify({
                quotas: data.quotas,
                token_balance: data.token_balance,
                gemini_pro_tokens: data.gemini_pro_tokens,
                daily_tokens: data.daily_tokens
            }, null, 2));

            // Check usage_stats for recent Gemini 3.1 Pro calls
            const statsSnap = await db.collection('users').doc(uid).collection('usage_stats').orderBy('timestamp', 'desc').limit(5).get();
            if (!statsSnap.empty) {
                console.log("Recent Usage Stats:");
                statsSnap.forEach(sDoc => {
                    const sData = sDoc.data();
                    console.log(`- [${sData.timestamp?.toDate().toISOString()}] ${sData.model}: ${sData.total_tokens} tokens (${sData.task})`);
                });
            }
        }

        // Check global config if any
        const configSnap = await db.collection('system_config').doc('quotas').get();
        if (configSnap.exists) {
            console.log("\n--- Global Quota Config ---");
            console.log(JSON.stringify(configSnap.data(), null, 2));
        }

    } catch (e) {
        console.error("Error:", e);
    }
}

checkTokens();
