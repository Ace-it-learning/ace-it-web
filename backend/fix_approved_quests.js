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

async function fixApprovedQuests() {
    console.log("Checking for approved questions missing topic_id...");

    // 1. Get all approved questions in the question_bank
    const snap = await db.collection('question_bank')
        .where('is_approved', '==', true)
        .get();

    console.log(`Found ${snap.size} approved questions total.`);

    let fixCount = 0;
    const batch = db.batch();

    snap.forEach(doc => {
        const data = doc.data();

        // If topic_id is missing and it's a Maths question
        if (!data.topic_id && data.subject === 'Maths' && data.topic) {
            const mappedId = MATH_MAPPING[data.topic];
            if (mappedId) {
                console.log(`- Fixing Quest ${doc.id}: Setting topic_id to ${mappedId} for topic "${data.topic}"`);
                batch.update(doc.ref, { topic_id: mappedId });
                fixCount++;
            } else {
                console.warn(`! No ID mapping found for math topic: "${data.topic}"`);
            }
        }
    });

    if (fixCount > 0) {
        await batch.commit();
        console.log(`Successfully "released" (backfilled topic_id for) ${fixCount} quests.`);
    } else {
        console.log("No missing topic_id fields found for approved math quests.");
    }

    process.exit(0);
}

fixApprovedQuests().catch(err => {
    console.error(err);
    process.exit(1);
});
