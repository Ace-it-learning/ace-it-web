require('dotenv').config();
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase Admin initialized successfully.');
}

const db = admin.firestore();

async function resetUser(email) {
    try {
        console.log(`🔍 Looking for user: ${email}`);

        // Find user by email
        const usersSnapshot = await db.collection('users')
            .where('email', '==', email)
            .get();

        if (usersSnapshot.empty) {
            console.log('❌ User not found');
            return;
        }

        const userDoc = usersSnapshot.docs[0];
        const uid = userDoc.id;

        console.log(`✅ Found user: ${uid}`);
        console.log(`📊 Current data:`, userDoc.data());

        // Reset user profile to initial state
        await db.collection('users').doc(uid).update({
            diagnosticCompleted: false,
            currentLevel: 1,
            xp: 0,
            streak: 0,
            lastActive: admin.firestore.FieldValue.serverTimestamp(),
            // Clear diagnostic results
            diagnosticProfile: admin.firestore.FieldValue.delete(),
            criticalAreas: admin.firestore.FieldValue.delete(),
            archetype: admin.firestore.FieldValue.delete(),
            // Keep basic info
            // email, displayName, photoURL remain unchanged
        });

        console.log('✅ User profile reset to initial state');

        // Delete all progress data
        const progressSnapshot = await db.collection('progress')
            .where('uid', '==', uid)
            .get();

        if (!progressSnapshot.empty) {
            const batch = db.batch();
            progressSnapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });
            await batch.commit();
            console.log(`✅ Deleted ${progressSnapshot.size} progress records`);
        }

        // Delete all submissions
        const submissionsSnapshot = await db.collection('submissions')
            .where('uid', '==', uid)
            .get();

        if (!submissionsSnapshot.empty) {
            const batch = db.batch();
            submissionsSnapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });
            await batch.commit();
            console.log(`✅ Deleted ${submissionsSnapshot.size} submission records`);
        }

        console.log('\n🎉 User reset complete! User can now restart from diagnostic.');

    } catch (error) {
        console.error('❌ Error resetting user:', error);
    } finally {
        process.exit(0);
    }
}

// Get email from command line argument
const email = process.argv[2] || 'fungtam@gmail.com';
resetUser(email);
