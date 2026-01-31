const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin (assuming serviceAccountKey.json is in backend)
const serviceAccount = require('../serviceAccountKey.json');
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}
const db = admin.firestore();

const cleanWritingMocks = async () => {
    console.log("🧹 Starting Writing Mock Cleanup...");

    // 1. Clear Firestore collection 'writing_mocks'
    const writingMocksSnap = await db.collection('writing_mocks').get();
    if (!writingMocksSnap.empty) {
        console.log(`🔥 Deleting ${writingMocksSnap.size} documents from Firestore...`);
        const batch = db.batch();
        writingMocksSnap.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();
        console.log("✅ Firestore 'writing_mocks' cleared.");
    } else {
        console.log("ℹ️ No documents found in Firestore 'writing_mocks'.");
    }

    // 2. Delete Local Mock files
    const localDir = path.join(__dirname, '..', 'generated_mocks', 'writing');
    if (fs.existsSync(localDir)) {
        const files = fs.readdirSync(localDir).filter(f => f.endsWith('.json'));
        console.log(`📂 Found ${files.length} local files in ${localDir}`);
        files.forEach(file => {
            fs.unlinkSync(path.join(localDir, file));
            console.log(`🗑️  Deleted local file: ${file}`);
        });
        console.log("✅ Local writing mocks cleared.");
    } else {
        console.log("ℹ️ Local directory not found or empty.");
    }

    console.log("✨ Cleanup complete.");
    process.exit(0);
};

cleanWritingMocks().catch(err => {
    console.error("❌ Cleanup failed:", err);
    process.exit(1);
});
