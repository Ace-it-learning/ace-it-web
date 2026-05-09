const fs = require('fs');
const path = require('path');

const BANK_PATH = path.join(__dirname, '..', 'backups', 'firestore', 'question_bank.json');
const OUTPUT_PATH = path.join(__dirname, '..', 'backups', 'firestore', 'question_bank_repaired.json');

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

function repair() {
    console.log('🛠️ Mass Repairing Reading Bank...');
    const data = JSON.parse(fs.readFileSync(BANK_PATH, 'utf8'));
    const entries = Object.entries(data);
    
    let mcqRepaired = 0;
    let totalReading = 0;

    entries.forEach(([id, q]) => {
        // Only target reading topics
        if (!READING_TOPIC_IDS.includes(q.topic_id)) return;
        totalReading++;

        const type = (q.type || '').toUpperCase();
        
        // Repair MCQ
        if (type === 'MCQ' || type === 'MC') {
            if (q.answer && q.answer.length === 1 && /[A-D]/.test(q.answer)) {
                const index = q.answer.charCodeAt(0) - 65;
                if (q.options && q.options[index]) {
                    const originalAnswer = q.answer;
                    q.answer = q.options[index];
                    mcqRepaired++;
                    // console.log(`   [Fixed] ${id}: ${originalAnswer} -> ${q.answer.substring(0, 30)}...`);
                }
            }
        }

        // Add default marking_logic for Short Answers if missing but keywords exist
        if (type === 'SHORT_ANSWER' && !q.marking_logic && q.expected_keywords) {
            q.marking_logic = {
                full_marks_criteria: [`Must mention core concepts: ${q.expected_keywords.join(', ')}`],
                key_phrases: q.expected_keywords
            };
        }
    });

    console.log(`\nFinished!`);
    console.log(`Total Reading Questions Processed: ${totalReading}`);
    console.log(`MCQ Answers Repaired: ${mcqRepaired}`);
    
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(data, null, 2));
    console.log(`Repaired bank saved to: ${OUTPUT_PATH}`);
}

repair();
