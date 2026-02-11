const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

// Mappings from Name -> ID
const ENG_NAME_TO_ID = {
    'Literal Comprehension': 'reading_literalComprehension',
    'Inference': 'reading_inference',
    'Main Idea Identification': 'reading_mainIdea',
    'Detail Recognition': 'reading_detailRecognition',
    'Sequencing': 'reading_sequencing',
    'Synthesis': 'reading_synthesis',
    'Fact vs Opinion': 'reading_factVsOpinion',
    "Author's Purpose": 'reading_authorPurpose',
    'Tone & Attitude': 'reading_toneAttitude',
    'Register & Style': 'reading_registerStyle',
    'Metaphorical Language': 'reading_metaphoricalLanguage',
    'Text Organization': 'reading_textOrganization',
    'Relevance': 'writing_relevance',
    'Development': 'writing_development',
    'Originality': 'writing_originality',
    'Vocabulary Range': 'writing_vocabularyRange',
    'Collocations': 'writing_collocations',
    'Idiomatic Expressions': 'writing_idiomaticExpressions',
    'Register Appropriateness': 'writing_registerAppropriate',
    'Word Choice Precision': 'writing_wordChoicePrecision',
    'Sentence Variety': 'writing_sentenceVariety',
    'Advanced Structures': 'writing_advancedStructures',
    'Grammatical Accuracy': 'writing_grammaticalAccuracy',
    'Punctuation': 'writing_punctuation',
    'Paragraph Structure': 'writing_paragraphStructure',
    'Transitions': 'writing_transitions',
    'Overall Coherence': 'writing_overallCoherence',
    'Main Idea Listening': 'listening_mainIdea',
    'Detail Listening': 'listening_detailListening',
    'Note-Taking': 'listening_noteTaking',
    'Prediction': 'listening_prediction',
    'Listening for Gist': 'listening_gist',
    'Accent Recognition': 'listening_accentRecognition',
    'Speed Processing': 'listening_speedProcessing',
    'Speaker Attitude': 'listening_speakerAttitude',
    'Integrated Tasks': 'listening_integratedTasks',
    'Ambiguity Handling': 'listening_ambiguityHandling',
    'Pronunciation Clarity': 'speaking_pronunciationClarity',
    'Intonation': 'speaking_intonation',
    'Pace & Rhythm': 'speaking_paceRhythm',
    'Confidence & Naturalness': 'speaking_confidence',
    'Turn-Taking': 'speaking_turnTaking',
    'Active Listening': 'speaking_activeListening',
    'Facilitation': 'speaking_facilitation',
    'Spontaneity': 'speaking_spontaneity',
    'Vocabulary in Speech': 'speaking_vocabularyInSpeech',
    'Grammatical Accuracy in Speech': 'speaking_grammaticalAccuracyInSpeech',
    'Group Discussion (Part A)': 'speaking_groupDiscussion',
    'Individual Response (Part B)': 'speaking_individualResponse'
};

const MATH_NAME_TO_ID = {
    'Percentages & Interest': 'math_num_percentages',
    'Number Systems': 'math_num_num_systems',
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
    'Rectilinear Figures': 'math_geo_properties_rect',
    'Mensuration': 'math_geo_mensuration',
    'Trigonometry Ratios': 'math_trig_ratios',
    '3D Trigonometry': 'math_trig_3d',
    'Trig Functions & Graphs': 'math_trig_graphs',
    'Measures of Dispersion': 'math_stat_measures',
    'Probability Basics': 'math_stat_probability',
    'Permutations & Combinations': 'math_stat_counting'
};

async function repairUser(uid) {
    console.log(`\nRepairing user: ${uid}`);

    // 1. Detect Practice from Questions
    const historySnap = await db.collection('users').doc(uid).collection('practice_history').get();
    const practicedIDs = new Set();

    if (!historySnap.empty) {
        for (const doc of historySnap.docs) {
            const qDoc = await db.collection('question_bank').doc(doc.id).get();
            if (qDoc.exists) {
                const topic = qDoc.data().topic;
                if (topic) {
                    const id = ENG_NAME_TO_ID[topic] || MATH_NAME_TO_ID[topic] || topic;
                    practicedIDs.add(id);
                }
            }
        }
    }

    // 2. Detect Practice from Timeline
    const timelineSnap = await db.collection('users').doc(uid).collection('timeline').get();
    timelineSnap.forEach(doc => {
        const d = doc.data();
        if (d.topic) {
            const id = ENG_NAME_TO_ID[d.topic] || MATH_NAME_TO_ID[d.topic] || d.topic;
            practicedIDs.add(id);
        }
    });

    console.log(`- Detected practiced skills: ${Array.from(practicedIDs).join(', ')}`);

    // 3. Update English
    const engRef = db.collection('users').doc(uid).collection('progress').doc('english');
    const engDoc = await engRef.get();
    if (engDoc.exists) {
        const engPracticed = Array.from(practicedIDs).filter(id => !id.startsWith('math_'));
        await engRef.update({ practicedSkills: engPracticed });
        console.log(`- English practicedSkills updated to: ${engPracticed.length} items`);
    }

    // 4. Update Maths
    const mathRef = db.collection('users').doc(uid).collection('progress').doc('maths');
    const mathDoc = await mathRef.get();
    if (mathDoc.exists) {
        const mathPracticed = Array.from(practicedIDs).filter(id => id.startsWith('math_'));
        await mathRef.update({ practicedSkills: mathPracticed });
        console.log(`- Maths practicedSkills updated to: ${mathPracticed.length} items`);
    }
}

async function repairAll() {
    const usersSnapshot = await db.collection('users').get();
    console.log(`Total users found: ${usersSnapshot.size}`);

    for (const doc of usersSnapshot.docs) {
        try {
            await repairUser(doc.id);
        } catch (e) {
            console.error(`Failed to repair user ${doc.id}:`, e.message);
        }
    }

    console.log('\nRobust Repair complete!');
    process.exit(0);
}

repairAll();
