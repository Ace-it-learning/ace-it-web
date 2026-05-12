const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Load service account key
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

/**
 * Recursively fetches collection data including subcollections
 */
async function getCollectionData(collectionRef) {
  const snapshot = await collectionRef.get();
  const data = {};
  
  for (const doc of snapshot.docs) {
    const docData = doc.data();
    
    // Check for subcollections (server-side SDK only)
    const subCollections = await doc.ref.listCollections();
    if (subCollections.length > 0) {
      docData._subcollections = {};
      for (const subCol of subCollections) {
        docData._subcollections[subCol.id] = await getCollectionData(subCol);
      }
    }
    data[doc.id] = docData;
  }
  return data;
}

async function backupFirestore() {
  console.log('Starting Firestore backup...');
  const collections = await db.listCollections();
  
  // Format: YYYY-MM-DD_HH-mm
  const now = new Date();
  const backupDate = now.toISOString().split('T')[0] + '_' + 
                     now.getHours().toString().padStart(2, '0') + '-' + 
                     now.getMinutes().toString().padStart(2, '0');
  
  const backupDir = path.join(__dirname, '..', '..', 'backups', 'firestore', backupDate);

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  for (const collection of collections) {
    const colName = collection.id;
    console.log(`Backing up collection: ${colName}...`);
    const data = await getCollectionData(collection);

    fs.writeFileSync(
      path.join(backupDir, `${colName}.json`),
      JSON.stringify(data, null, 2)
    );
  }

  console.log(`\nSuccess! Firestore backup completed to:\n${backupDir}`);
  process.exit(0);
}

backupFirestore().catch(err => {
  console.error('Backup failed:', err);
  process.exit(1);
});
