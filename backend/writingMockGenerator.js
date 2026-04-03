const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const GenerativeAIService = require('./services/GenerativeAIService');
const admin = require('firebase-admin');

// --- FIREBASE INIT ---
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
let db = null;
if (fs.existsSync(serviceAccountPath)) {
    try {
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(require(serviceAccountPath))
            });
        }
        db = admin.firestore();
        console.log("✅ Firebase initialized for serialization.");
    } catch (e) {
        console.error("Firebase init failed:", e);
    }
} else {
    console.warn("⚠️ No serviceAccountKey.json found. Skipping Firebase sync.");
}

const BLUEPRINT_PATH = path.join(__dirname, 'blueprints', 'Eng_Writing_Blueprint.json');
const OUTPUT_DIR = path.join(__dirname, 'generated_mocks', 'writing');

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const uploadToFirebase = async (examData, filename) => {
    if (!db) return;
    try {
        const docId = filename.replace('.json', '');
        await db.collection('writing_mocks').doc(docId).set({
            ...examData,
            is_published: true,
            created_at: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`☁️  Synced to Firestore: writing_mocks/${docId}`);
    } catch (err) {
        console.error("❌ Firebase Upload Failed:", err);
    }
};

// --- PROMPTS ---
const PART_A_PROMPT_TEMPLATE = `
You are an expert HKDSE English Examiner.
Target Level: {{TARGET_LEVEL}}
Archetype: {{ARCHETYPE}}
Output Format: JSON ONLY.

Create a Part A (Short Task, ~200 words) question.
**CRITICAL**: You MUST randomly choose one of the following genres: 
- Proposal (to Principal/Manager)
- Letter of Complaint
- Letter of Advice
- Formal Email (Application/Enquiry)
- Feature Article

JSON Structure:
{
  "part": "Part A",
  "genre": "e.g. Proposal / Letter of Complaint",
  "title": "Short Writing Task",
  "instructions": "Write about 200 words. Pay attention to format/tone.",
  "situation": "Description of the situation...",
  "requirements": ["Point 1", "Point 2", "Point 3"],
  "format_guides": ["Must include Title/Headings", "Formal Tone"]
}
`;

const PART_B_PROMPT_TEMPLATE = `
You are an expert HKDSE English Examiner.
Target Level: {{TARGET_LEVEL}}
Output Format: JSON ONLY.

Create 8 distinct Part B (Long Task, ~400 words) questions, one for each Elective:
1. Sports Communication
2. Drama
3. Poems/Songs
4. Debating
5. Social Issues
6. Workplace Comms
7. Pop Culture
8. Short Stories

JSON Structure (Array of 8 objects):
[
  {
    "elective": "Sports Communication",
    "question": "Question text...",
    "type": "Report/Article/etc"
  }
  ...
]
`;

const loadBlueprint = () => {
    return JSON.parse(fs.readFileSync(BLUEPRINT_PATH, 'utf8'));
};

const generateWritingMock = async (topic) => {
    console.log(`=== Generating Writing Mock: ${topic} ===`);
    const blueprint = loadBlueprint();

    // 1. Generate Part A
    console.log("Generating Part A...");
    const promptA = PART_A_PROMPT_TEMPLATE
        .replace('{{TARGET_LEVEL}}', blueprint.sections.Part_A.target_level)
        .replace('{{ARCHETYPE}}', topic);

    const contentA = await GenerativeAIService.generateJson(promptA, {
        model: "gemini-2.5-pro"
    });
    console.log("Part A Generated.");

    // 2. Generate Part B
    console.log("Generating Part B (8 Electives)...");
    const promptB = PART_B_PROMPT_TEMPLATE
        .replace('{{TARGET_LEVEL}}', blueprint.sections.Part_B.target_level);

    const contentB = await GenerativeAIService.generateJson(promptB, {
        model: "gemini-2.5-pro"
    });
    console.log(`Part B Generated (${contentB.length} questions).`);

    // 3. Assemble and Save
    const finalExamp = {
        meta: {
            title: `Writing Mock: ${topic}`,
            topic: topic,
            generated_at: new Date().toISOString(),
            blueprint_version: blueprint.meta.version
        },
        Part_A: contentA,
        Part_B: contentB
    };

    const filename = `Writing_${topic.replace(/\s+/g, '_')}_${Date.now()}.json`;
    const filepath = path.join(OUTPUT_DIR, filename);
    fs.writeFileSync(filepath, JSON.stringify(finalExamp, null, 2));

    console.log(`✅ Writing Mock Saved: ${filename}`);

    // Auto-Sync
    await uploadToFirebase(finalExamp, filename);

    return filepath;
};

// CLI Support
if (require.main === module) {
    const topicArg = process.argv[2] || "School Open Day";
    generateWritingMock(topicArg).catch(console.error);
}

module.exports = { generateWritingMock };
