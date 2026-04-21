const admin = require('firebase-admin');
const fs = require('fs');
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

/**
 * Fixes KaTeX formatting in a string.
 * - Replaces $...$ with \( ... \)
 * - Ensures % is escaped as \%
 * - Ensures currency is handled
 */
function fixFormatting(text) {
  if (!text || typeof text !== 'string') return text;

  let fixed = text;

  // 1. Replace $ ... $ with \( ... \) (non-greedy)
  // We use a regex that matches $...$ but avoids matching escaped dollars \$
  fixed = fixed.replace(/(?<!\\)\$([\s\S]+?)(?<!\\)\$/g, (match, inner) => {
    let math = inner.trim();
    
    // 2. Fix currency inside math: \$600 -> \text{HK\$}600 (or just \$ if it works)
    // The project standard is \text{HK\$}
    math = math.replace(/\\?\$(\d+)/g, '\\text{HK\\$}$1');
    
    // 3. Ensure % is escaped inside math
    math = math.replace(/(?<!\\)%/g, '\\%');
    
    return ` \( ${math} \) `;
  });

  // 4. Cleanup trailing % outside of math if any (often the case in options)
  fixed = fixed.replace(/(?<!\\)%/g, '\\%');

  // 5. Cleanup double spaces
  fixed = fixed.replace(/\s+/g, ' ').trim();

  return fixed;
}

function fixQuestion(q) {
  const newQ = { ...q };
  
  // Fields to fix
  const fields = ['question_en', 'question_zh', 'explanation', 'explanation_zh', 'answer_logic', 'answer_logic_zh'];
  fields.forEach(f => {
    if (newQ[f]) newQ[f] = fixFormatting(newQ[f]);
  });

  // Fix arrays
  ['solution_steps_en', 'solution_steps_zh', 'hints', 'hints_zh', 'options', 'options_zh'].forEach(f => {
    if (Array.isArray(newQ[f])) {
      newQ[f] = newQ[f].map(item => fixFormatting(item));
    }
  });

  // Ensure topic_id is correct for General Quest
  newQ.topic_id = 'math_num_percentages';
  newQ.is_approved = true;
  newQ.status = 'approved';
  newQ.updated_at = new Date();

  return newQ;
}

async function run() {
  console.log("🚀 Starting Move & Fix Operation for Percentages & Interest...");

  // 1. Collect questions from batches 26, 27, 28
  const batches = [26, 27, 28];
  let allQuestions = [];
  const myAddedIds = [];

  batches.forEach(b => {
    const fileName = `integrated_batch_${b}.json`;
    const dataPath = path.join(__dirname, `../data/maths/${fileName}`);
    if (fs.existsSync(dataPath)) {
      const questions = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
      allQuestions = allQuestions.concat(questions.map(fixQuestion));
      questions.forEach(q => myAddedIds.push(q.id));
    }
  });

  console.log(`✅ Loaded and fixed ${allQuestions.length} questions.`);

  // 2. Wipe legacy math_num_percentages from question_bank
  console.log("🧹 Wiping legacy questions from question_bank...");
  const bankSnapshot = await db.collection('question_bank')
    .where('topic_id', '==', 'math_num_percentages')
    .get();
  
  const bankBatch = db.batch();
  bankSnapshot.forEach(doc => {
    bankBatch.delete(doc.ref);
  });
  await bankBatch.commit();
  console.log(`   Deleted ${bankSnapshot.size} legacy questions.`);

  // 3. Seed fixed questions into question_bank
  console.log("🌱 Seeding fixed questions into question_bank...");
  for (const q of allQuestions) {
    await db.collection('question_bank').doc(q.id).set(q);
  }
  console.log(`   Synced ${allQuestions.length} questions.`);

  // 4. Delete 30 questions from integrated_challenges
  console.log("🗑️ Deleting 30 questions from integrated_challenges...");
  const integratedBatch = db.batch();
  myAddedIds.forEach(id => {
    integratedBatch.delete(db.collection('integrated_challenges').doc(id));
  });
  await integratedBatch.commit();
  console.log(`   Deleted ${myAddedIds.length} questions from Weekly Quest.`);

  console.log("\n--- ✨ Operation Complete ---");
  process.exit(0);
}

run();
