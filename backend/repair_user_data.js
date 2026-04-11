const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function repairUserData(email) {
    try {
        const userRecord = await admin.auth().getUserByEmail(email);
        const uid = userRecord.uid;
        console.log(`Found user: ${email} with UID: ${uid}`);

        const mathProgressRef = db.collection('users').doc(uid).collection('progress').doc('maths');
        const doc = await mathProgressRef.get();

        if (!doc.exists) {
            console.log('No math progress document found for this user.');
            return;
        }

        const data = doc.data();
        const microSkills = data.microSkills || {};
        
        let updated = false;

        // DATA HANDLING: Old keys mapping to NEW granular keys
        // OLD: math_stat_prob -> NEW: math_stat_probability & math_stat_counting
        if (microSkills['math_stat_prob'] && microSkills['math_stat_prob'].level > 0) {
            const level = microSkills['math_stat_prob'].level;
            console.log(`Migrating math_stat_prob (level ${level}) to math_stat_probability & math_stat_counting...`);
            microSkills['math_stat_probability'] = { level, xp: (microSkills['math_stat_probability']?.xp || 0) };
            microSkills['math_stat_counting'] = { level, xp: (microSkills['math_stat_counting']?.xp || 0) };
            updated = true;
        }

        // OLD: math_stat_charts -> NEW: math_stat_charts & math_stat_measures
        if (microSkills['math_stat_charts'] && microSkills['math_stat_charts'].level > 0) {
            const level = microSkills['math_stat_charts'].level;
            console.log(`Migrating math_stat_charts (level ${level}) to math_stat_charts & math_stat_measures...`);
            microSkills['math_stat_charts'] = { level, xp: (microSkills['math_stat_charts']?.xp || 0) };
            microSkills['math_stat_measures'] = { level, xp: (microSkills['math_stat_measures']?.xp || 0) };
            updated = true;
        }

        // ALGEBRA: Equations Consolidated to Granular
        // Check if user has legacy algebra keys (if any) or if we need to seed the basics
        const algebraBasics = ['math_alg_linear', 'math_alg_quadratic', 'math_alg_simultaneous'];
        let algebraLevel = 0;
        if (microSkills['math_alg_quadratics']) algebraLevel = 7; // Use his high level for basic alg too
        
        if (algebraLevel > 0) {
            algebraBasics.forEach(id => {
                if (!microSkills[id] || microSkills[id].level === 0) {
                    microSkills[id] = { level: algebraLevel, xp: 100 };
                    updated = true;
                }
            });
        }

        if (updated) {
            await mathProgressRef.update({ microSkills });
            console.log('SUCCESS: Firestore updated.');
        } else {
            console.log('No updates needed.');
        }

    } catch (error) {
        console.error('Error repairing user data:', error);
    }
}

repairUserData('fungtam@gmail.com');
