const fs = require('fs');

const READING_TOPIC_IDS = [
    'reading_literalComprehension',
    'reading_inference',
    'reading_mainIdea',
    'reading_detailRecognition',
    'reading_sequencing',
    'reading_synthesis',
    'reading_factVsOpinion',
    'reading_authorPurpose',
    'reading_toneAttitude',
    'reading_registerStyle',
    'reading_metaphoricalLanguage',
    'reading_textOrganization',
    'reading_skimmingScanning',
    'reading_paraphrasing',
    'reading_cohesionReference'
];

async function runAudit() {
    console.log('--- 🛡️ Deep Audit: Reading General Quests (Bank) ---');
    const data = JSON.parse(fs.readFileSync('backend/backups/firestore/question_bank.json', 'utf8'));
    
    const stats = {};
    READING_TOPIC_IDS.forEach(id => {
        stats[id] = { count: 0, mcq: 0, short_answer: 0, ordering: 0, categorization: 0, issues: [] };
    });

    let totalChecked = 0;
    const questions = Object.values(data);

    questions.forEach(q => {
        const topicId = q.topic_id;
        if (!READING_TOPIC_IDS.includes(topicId)) return;

        totalChecked++;
        const s = stats[topicId];
        s.count++;

        const type = (q.type || '').toUpperCase();
        if (type === 'MCQ' || type === 'MC') s.mcq++;
        else if (type === 'SHORT_ANSWER') s.short_answer++;
        else if (type === 'ORDERING') s.ordering++;
        else if (type === 'CATEGORIZATION') s.categorization++;

        // --- VALIDATION RULES ---

        // 1. MCQ Answer Format
        if (type === 'MCQ' || type === 'MC') {
            if (q.answer && q.answer.length === 1 && /[A-D]/.test(q.answer)) {
                s.issues.push(`[${q.id}] MCQ Answer is single letter '${q.answer}'. Expected full text.`);
            }
            if (q.options && q.answer && !q.options.includes(q.answer)) {
                // Check if it's "A: text" format
                const match = q.options.find(o => o.includes(q.answer));
                if (!match) {
                     s.issues.push(`[${q.id}] MCQ Answer '${q.answer}' not found in options.`);
                }
            }
        }

        // 2. Short Answer Metadata
        if (type === 'SHORT_ANSWER') {
            if (!q.expected_keywords || q.expected_keywords.length === 0) {
                s.issues.push(`[${q.id}] Short Answer missing 'expected_keywords'. AI grading might be less accurate.`);
            }
            if (!q.answer_logic) {
                s.issues.push(`[${q.id}] Short Answer missing 'answer_logic'.`);
            }
        }

        // 3. Ordering Format (Expected "0-1-2" or similar)
        if (type === 'ORDERING') {
            if (Array.isArray(q.answer)) {
                s.issues.push(`[${q.id}] Ordering Answer is Array. Expected hyphenated string of indices.`);
            }
        }

        // 4. Grammar / Non-sense Check (Basic)
        if (q.passage && q.passage.length < 50) {
            s.issues.push(`[${q.id}] Passage is too short (${q.passage.length} chars). Possible non-sense or placeholder.`);
        }
        if (q.passage && q.passage.includes('Lorem ipsum')) {
            s.issues.push(`[${q.id}] Passage contains Lorem Ipsum.`);
        }
    });

    // --- REPORT ---
    console.log(`Total Reading Questions Audited: ${totalChecked}\n`);
    console.log(`${'Topic ID'.padEnd(30)} | Total | MCQ | SA | ORD | CAT | Issues`);
    console.log('-'.repeat(85));
    
    READING_TOPIC_IDS.forEach(id => {
        const s = stats[id];
        const issueCount = s.issues.length;
        console.log(`${id.padEnd(30)} | ${String(s.count).padEnd(5)} | ${String(s.mcq).padEnd(3)} | ${String(s.short_answer).padEnd(2)} | ${String(s.ordering).padEnd(3)} | ${String(s.categorization).padEnd(3)} | ${issueCount > 0 ? '❌ ' + issueCount : '✅'}`);
        if (issueCount > 0) {
            s.issues.slice(0, 3).forEach(iss => console.log(`   - ${iss}`));
            if (issueCount > 3) console.log(`   - ... and ${issueCount - 3} more`);
        }
    });

    console.log('\n--- End of Audit ---');
}

runAudit();
