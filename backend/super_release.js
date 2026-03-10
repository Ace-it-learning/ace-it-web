const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

const MATH_MAPPING = {
    'Percentages & Interest': 'math_num_percentages',
    'Number Systems': 'math_num_num_systems',
    'Formulas & Substitution': 'math_alg_formulas',
    'Quadratic Equations': 'math_alg_quadratics',
    'Functions & Graphs': 'math_alg_functions',
    'Polynomials': 'math_alg_polynomials',
    'Indices & Logarithms': 'math_alg_indices_log',
    'Variations': 'math_alg_variations',
    'AS & GS Sequences': 'math_alg_sequences',
    'Linear & Quadratic Inequalities': 'math_alg_inequalities',
    'Coordinate Geometry': 'math_geo_coord',
    'Equation of Circle': 'math_geo_circle_eq',
    'Properties of Circle': 'math_geo_properties_circle',
    'Locus': 'math_geo_locus',
    'Trigonometry (Basic)': 'math_trig_basic',
    'Trigonometry (DSE Core)': 'math_trig_core',
    'Trig Identities & Eq.': 'math_trig_identities',
    '3D Trigonometry': 'math_trig_3d',
    'Mensuration (2D)': 'math_mens_2d',
    'Mensuration (3D)': 'math_mens_3d',
    'Probability (Basic)': 'math_stat_prob_basic',
    'Permutation & Combination': 'math_stat_pnc',
    'Probability (Conditional)': 'math_stat_prob_cond',
    'Statistics (Central Tendency)': 'math_stat_central',
    'Statistics (Dispersion)': 'math_stat_dispersion'
};

const DIFFICULTY_TIERS = {
    'easy': { levels: ["3"], xp: 50 },
    'medium': { levels: ["4"], xp: 75 },
    'standard': { levels: ["5"], xp: 100 },
    'elite': { levels: ["7"], xp: 150 }
};

async function superRelease() {
    console.log("Starting Super Release (Bulk Approve & Map Topic IDs)...");

    const snap = await db.collection('question_bank')
        .where('is_approved', '==', false)
        .where('subject', '==', 'Maths')
        .get();

    console.log(`Found ${snap.size} pending Maths questions to release.`);

    let approveCount = 0;
    const batch = db.batch();

    snap.docs.forEach(doc => {
        const data = doc.data();
        const levelStr = String(data.level);

        let xpReward = 50;
        for (const tier in DIFFICULTY_TIERS) {
            if (DIFFICULTY_TIERS[tier].levels.includes(levelStr)) {
                xpReward = DIFFICULTY_TIERS[tier].xp;
                break;
            }
        }

        const updates = {
            is_approved: true,
            xp_reward: xpReward,
            approved_at: admin.firestore.FieldValue.serverTimestamp()
        };

        // Map topic_id
        if (data.topic) {
            const mappedId = MATH_MAPPING[data.topic];
            if (mappedId) {
                updates.topic_id = mappedId;
            }
        }

        batch.update(doc.ref, updates);
        approveCount++;
    });

    if (approveCount > 0) {
        await batch.commit();
        console.log(`✅ Successfully Approved and Released ${approveCount} Maths questions.`);
    } else {
        console.log("No questions needed processing.");
    }

    process.exit(0);
}

superRelease();
