const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

const KEY_MAPPING = {
    'math_alg_quadratic': 'math_alg_quadratics',
    'math_alg_polynomial': 'math_alg_polynomials',
    'math_alg_variation': 'math_alg_variations',
    'math_data_counting': 'math_stat_counting',
    'math_data_charts': 'math_stat_charts',
    'math_data_dispersion': 'math_stat_measures',
    'math_data_probability': 'math_stat_probability',
    'math_alg_linear': 'math_alg_formulas',
    'math_alg_simultaneous': 'math_alg_formulas'
};

async function migrateUserMathData(email) {
    console.log(`Starting Math data migration for ${email}...`);
    
    const userSnap = await db.collection('users').where('email', '==', email).limit(1).get();
    if (userSnap.empty) {
        console.error('User not found');
        return;
    }
    
    const uid = userSnap.docs[0].id;
    const progressRef = db.collection('users').doc(uid).collection('progress').doc('maths');
    const doc = await progressRef.get();
    
    if (!doc.exists) {
        console.log('No maths progress document found for user.');
        return;
    }
    
    const data = doc.data();
    const microSkills = data.microSkills || {};
    const newMicroSkills = {};
    let migratedCount = 0;
    
    Object.keys(microSkills).forEach(oldKey => {
        let value = microSkills[oldKey];
        let newKey = KEY_MAPPING[oldKey] || oldKey;
        
        // If we are merging into an existing newKey, pick the higher level
        const existingInNew = newMicroSkills[newKey];
        
        let level = 1;
        let history = [];
        
        if (typeof value === 'object' && value !== null) {
            level = value.level || 1;
            history = value.history || [];
        } else if (typeof value === 'number') {
            level = value;
            history = [{
                level: level,
                grade: Math.round(level),
                activityType: 'legacy',
                date: new Date().toISOString()
            }];
        }
        
        if (existingInNew) {
            // Merge: take highest level
            if (level > existingInNew.level) {
                existingInNew.level = level;
                existingInNew.history = [...history, ...existingInNew.history].slice(0, 10);
            }
        } else {
            newMicroSkills[newKey] = {
                level: level,
                history: history.length > 0 ? history : [{
                    level: level,
                    grade: Math.round(level),
                    activityType: 'auto-init',
                    date: new Date().toISOString()
                }],
                lastUpdated: admin.firestore.FieldValue.serverTimestamp()
            };
        }
        
        if (newKey !== oldKey || (typeof value !== 'object') || !value.history) {
            migratedCount++;
        }
    });
    
    if (migratedCount > 0) {
        await progressRef.update({
            microSkills: newMicroSkills,
            migratedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`Successfully migrated/aligned ${migratedCount} micro-skills for ${email}.`);
    } else {
        console.log('No skills needing migration or alignment found.');
    }
}

migrateUserMathData('fungtam@gmail.com').catch(console.error);
