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

async function checkUser(email) {
    console.log(`🔍 Checking status for: ${email}`);
    try {
        const user = await admin.auth().getUserByEmail(email);
        console.log("✅ User Found:");
        console.log(`   - UID: ${user.uid}`);
        console.log(`   - Email: ${user.email}`);
        console.log(`   - Verified: ${user.emailVerified ? 'YES ✅' : 'NO ❌'}`);
        console.log(`   - Creation Time: ${user.metadata.creationTime}`);
        console.log(`   - Last Sign-in: ${user.metadata.lastSignInTime}`);

        if (!user.emailVerified) {
            console.log("\n⚠️  User is NOT verified. Generating manual verification link...");
            try {
                const link = await admin.auth().generateEmailVerificationLink(email);
                console.log("\n🔗 MANUAL VERIFICATION LINK:");
                console.log("===============================================================");
                console.log(link);
                console.log("===============================================================");
                console.log("👉 You can copy/paste this link into your browser to verify directly.");
            } catch (linkErr) {
                console.error("❌ Failed to generate link:", linkErr.message);
            }
        } else {
            console.log("\n🎉 User is already verified!");
        }

    } catch (error) {
        if (error.code === 'auth/user-not-found') {
            console.error("❌ User not found in Firebase Auth. Did the signup complete?");
        } else {
            console.error("❌ Error fetching user:", error.message);
        }
    }
    process.exit(0);
}

checkUser(email);
