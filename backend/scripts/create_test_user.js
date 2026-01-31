const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');

if (!fs.existsSync(serviceAccountPath)) {
    console.error("serviceAccountKey.json not found. Cannot create test user.");
    process.exit(1);
}

admin.initializeApp({
    credential: admin.credential.cert(require(serviceAccountPath))
});

async function createTestUser() {
    const email = 'test@example.com';
    const password = 'password123';

    try {
        let user;
        try {
            user = await admin.auth().getUserByEmail(email);
            console.log(`User ${email} already exists. Updating password...`);
            await admin.auth().updateUser(user.uid, { password });
        } catch (e) {
            console.log(`Creating new user: ${email}`);
            user = await admin.auth().createUser({
                email,
                password,
                displayName: 'Test Student'
            });
        }

        // Ensure profile exists in Firestore
        const db = admin.firestore();
        await db.collection('users').doc(user.uid).set({
            email,
            displayName: 'Test Student',
            is_new_student: false,
            grade: 6,
            targetLevel: 'Level 5**',
            xp: 1500,
            level: 3,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        console.log(`✅ Test user created/updated: ${user.uid}`);
        process.exit(0);
    } catch (error) {
        console.error("Error creating test user:", error);
        process.exit(1);
    }
}

createTestUser();
