const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const serviceAccountPath = path.join(__dirname, '../serviceAccountKey.json');
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(require(serviceAccountPath))
    });
}

const db = admin.firestore();

async function checkUser(email) {
    try {
        console.log(`🔍 Checking Firestore for: ${email}`);

        let uid;
        try {
            const authUser = await admin.auth().getUserByEmail(email);
            uid = authUser.uid;
            console.log(`✅ Found in Auth: ${uid}`);
        } catch (e) {
            console.log(`❌ Not found in Auth.`);
            // Search Firestore for email field
            const snap = await db.collection('users').where('email', '==', email).get();
            if (!snap.empty) {
                uid = snap.docs[0].id;
                console.log(`✅ Found in Firestore by email: ${uid}`);
            } else {
                console.log(`❌ Not found in Firestore by email.`);
                return;
            }
        }

        const userRef = db.collection('users').doc(uid);
        const doc = await userRef.get();

        if (doc.exists) {
            console.log("📄 Document Data:", JSON.stringify(doc.data(), null, 2));
            const subcollections = await userRef.listCollections();
            console.log("📁 Subcollections:", subcollections.map(s => s.id));
        } else {
            console.log("📄 Document does NOT exist.");
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

const target = process.argv[2] || 'fungtam@gmail.com';
checkUser(target).then(() => process.exit(0));
