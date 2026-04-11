const admin = require('firebase-admin');
const path = require('path');

if (admin.apps.length === 0) {
  const serviceAccount = require('./serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

async function getUid() {
  try {
    const user = await admin.auth().getUserByEmail('fungtam@gmail.com');
    console.log(`UID for fungtam@gmail.com: ${user.uid}`);
    
    const progressDoc = await admin.firestore()
      .collection('users').doc(user.uid)
      .collection('progress').doc('maths').get();
      
    if (progressDoc.exists) {
        const data = progressDoc.data();
        console.log('Maths Progress MicroSkills Keys:');
        console.log(Object.keys(data.microSkills || {}));
    } else {
        console.log('No Maths Progress found for this user.');
    }
  } catch (err) {
    console.error(err.message);
  }
}

getUid().then(() => process.exit(0));
