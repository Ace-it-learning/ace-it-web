const admin = require('firebase-admin');
const path = require('path');
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(require(serviceAccountPath))
    });
}

const db = admin.firestore();

async function listCollections() {
    const cols = await db.listCollections();
    cols.forEach(c => console.log(c.id));
}

listCollections().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
