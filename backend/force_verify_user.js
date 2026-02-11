const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

if (!fs.existsSync(serviceAccountPath)) {
    console.error("❌ serviceAccountKey.json not found.");
    process.exit(1);
}

// Initialize Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(require(serviceAccountPath))
    });
}

const email = process.argv[2] || 'fungtam@gmail.com';

async function forceVerify(email) {
    console.log(`🔍 Finding user: ${email}`);
    try {
        const user = await admin.auth().getUserByEmail(email);
        console.log(`✅ User found: ${user.uid}`);

        if (user.emailVerified) {
            console.log("🎉 User is already verified.");
        } else {
            console.log("⚠️  User not verified. Forcing verification now...");
            await admin.auth().updateUser(user.uid, {
                emailVerified: true
            });
            console.log("✅ SUCCESS: User email has been manually verified.");
        }
    } catch (error) {
        console.error("❌ Error:", error.message);
    }
    process.exit(0);
}

forceVerify(email);
