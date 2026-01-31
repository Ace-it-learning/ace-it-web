const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}
const db = admin.firestore();
const docId = process.argv[2];
if (!docId) { console.error("Missing docId"); process.exit(1); }

db.collection('writing_mocks').doc(docId).delete()
    .then(() => { console.log(`Deleted ${docId}`); process.exit(0); })
    .catch(err => { console.error(err); process.exit(1); });
