const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
if (admin.apps.length === 0) {
  try {
    const serviceAccount = require(path.join(__dirname, '../serviceAccountKey.json'));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } catch (e) {
    console.error("❌ Service Account Key missing.");
    process.exit(1);
  }
}

const db = admin.firestore();

const stringLevelMap = {
  3: 'HKDSE Level 3 (Adequate)',
  4: 'HKDSE Level 4 (Good)',
  5: 'HKDSE Level 5 (Strong)',
  6: 'HKDSE Level 5** (Mastery)',
  7: 'HKDSE Level 5** (Mastery)',
  8: 'HKDSE Level 5** (Mastery)'
};

const recalibratedLevelMap = {
  4: 3, // Map Difficulty 4 to Level 3 (Entry)
  5: 4, // Map Difficulty 5 to Level 4
  6: 5, // Map Difficulty 6 to Level 5
  7: 6, // Map Difficulty 7 to Level 5**
  8: 6  // Map Difficulty 8 to Level 5**
};

async function fixLevels() {
  console.log("🛠️ Fixing levels for Percentages & Interest in question_bank...");
  
  const snapshot = await db.collection('question_bank')
    .where('topic_id', '==', 'math_num_percentages')
    .get();

  if (snapshot.empty) {
    console.log("❌ No questions found for math_num_percentages.");
    process.exit(0);
  }

  const batch = db.batch();
  let count = 0;

  snapshot.forEach(doc => {
    const data = doc.data();
    const difficulty = data.difficulty || 4; // Default to 4 if missing
    
    // RE-CALIBRATION LOGIC
    const level = recalibratedLevelMap[parseInt(difficulty)] || 4; 
    const stringLevel = stringLevelMap[level] || 'HKDSE Level 4 (Good)';

    console.log(`- [${doc.id}] diff: ${difficulty} -> level: ${level} (${stringLevel})`);

    // FINAL STATUS & PREREQ CLEANUP
    batch.set(doc.ref, {
      level: level, // Numeric level
      level_string: stringLevel, // Descriptive string
      is_approved: true,
      status: 'approved',
      prerequisite_topics: [], // Clear prerequisites to avoid Catch-22
      is_factory: false // Ensure they are treated as bank questions
    }, { merge: true });
    
    count++;
  });

  // [V1.0] Second pass: Ensure 'level' field itself is compatible with the "in" query
  // Since we can't have both numeric and string in the same field for the same doc,
  // we'll just set it to the numeric level, and the query will match on [numericLevel, stringLevel].
  // Wait, if the doc has level = 4, and query is where('level', 'in', [4, "HKDSE Level 4 (Good)"]), it MATCHES.
  
  await batch.commit();
  console.log(`✅ Updated ${count} questions with level field.`);

  // FINAL VERIFICATION QUERY
  const verifySnapshot = await db.collection('question_bank')
    .where('topic_id', '==', 'math_num_percentages')
    .where('level', 'in', [3, 4, 5, 6, 7])
    .get();
  
  console.log(`🔍 Verification Query returned ${verifySnapshot.size} results.`);
  
  process.exit(0);
}

fixLevels();
