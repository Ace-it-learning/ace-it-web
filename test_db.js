const admin = require('firebase-admin');
const path = require('path');

const serviceAccount = require('./backend/serviceAccountKey.json');

if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function testConnection() {
  console.log('Testing Firestore connection...');
  try {
    const snapshot = await db.collection('settings').limit(1).get();
    console.log('Connection successful! Found collection "settings".');
  } catch (error) {
    console.error('Connection failed:', error);
  }
}

testConnection().then(() => process.exit(0));
