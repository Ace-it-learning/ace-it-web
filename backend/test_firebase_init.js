const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

if (!fs.existsSync(serviceAccountPath)) {
    console.error("serviceAccountKey.json not found.");
    process.exit(1);
}

try {
    admin.initializeApp({
        credential: admin.credential.cert(require(serviceAccountPath))
    });
    const db = admin.firestore();
    console.log("Firebase Admin initialized.");

    db.collection('users').limit(1).get()
        .then(snapshot => {
            console.log("Firestore connection successful. Found docs:", snapshot.size);
            if (snapshot.size > 0) {
                console.log("Found UID:", snapshot.docs[0].id);
            }
            process.exit(0);
        })
        .catch(err => {
            console.error("Firestore Error:", err);
            process.exit(1);
        });
} catch (error) {
    console.error("Init Error:", error);
    process.exit(1);
}
