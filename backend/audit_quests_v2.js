const admin = require('firebase-admin');
const path = require('path');
const serviceAccount = require('./serviceAccountKey.json');
const { MICRO_SKILLS } = require('./constants/microSkills');
const { MATHS_MICRO_SKILLS } = require('./constants/mathsMicroSkills');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function run() {
    process.stdout.write("🔍 Auditing Question Bank...\n");
    try {
        const snapshot = await db.collection('question_bank')
            .where('is_approved', '==', true)
            .get();

        if (snapshot.empty) {
            console.log("❌ No approved quests found.");
            return;
        }

        const stats = {};

        snapshot.forEach(doc => {
            const data = doc.data();
            const subject = data.subject || 'Unknown';
            const topicId = data.topic || 'unknown_topic';
            const level = data.level || 'Unknown Level';

            // Resolve Paper & Topic Name
            let paper = 'General';
            let topicName = topicId;

            if (subject.toLowerCase() === 'english') {
                // Try to find by ID first, then by name
                let skill = MICRO_SKILLS[topicId];
                if (!skill) {
                    skill = Object.values(MICRO_SKILLS).find(s => s.name === topicId);
                }

                if (skill) {
                    paper = skill.paper ? `Paper ${skill.paper.charAt(0).toUpperCase() + skill.paper.slice(1)}` : 'General';
                    topicName = skill.name;
                }
            } else if (subject.toLowerCase() === 'maths' || subject.toLowerCase() === 'mathematics') {
                const skill = MATHS_MICRO_SKILLS[topicId];
                if (skill) {
                    paper = skill.paper || 'Paper 1/2';
                    topicName = skill.name;
                }
            }

            // Standardize Level
            let displayLevel = String(level);
            const match = displayLevel.match(/Level\s*([\d\*]+)/i);
            if (match) displayLevel = `Level ${match[1]}`;

            // Quest Identifier (Passage for Reading, otherwise ID)
            const questId = data.passage || doc.id;

            // Grouping
            if (!stats[subject]) stats[subject] = {};
            if (!stats[subject][paper]) stats[subject][paper] = {};
            if (!stats[subject][paper][topicName]) stats[subject][paper][topicName] = {};
            if (!stats[subject][paper][topicName][displayLevel]) {
                stats[subject][paper][topicName][displayLevel] = {
                    questions: 0,
                    quests: new Set()
                };
            }

            stats[subject][paper][topicName][displayLevel].questions++;
            stats[subject][paper][topicName][displayLevel].quests.add(questId);
        });

        // Print Results
        let output = "";
        output += "\n==================================================\n";
        output += "           ACE IT - QUEST BANK AUDIT            \n";
        output += "==================================================\n\n";

        let totalQuestions = 0;
        let totalQuests = 0;

        Object.keys(stats).sort().forEach(sub => {
            output += `[SUBJECT: ${sub.toUpperCase()}]\n`;
            let subQuestions = 0;
            let subQuests = 0;

            Object.keys(stats[sub]).sort().forEach(ppr => {
                output += `  └─ ${ppr}\n`;

                Object.keys(stats[sub][ppr]).sort().forEach(tpc => {
                    const levels = stats[sub][ppr][tpc];

                    let tpcQuestions = 0;
                    let tpcQuests = 0;

                    const levelStrings = Object.keys(levels).sort().map(lvl => {
                        const qCount = levels[lvl].questions;
                        const kCount = levels[lvl].quests.size;
                        tpcQuestions += qCount;
                        tpcQuests += kCount;
                        return `${lvl}: ${kCount} Quests (${qCount} Qs)`;
                    }).join(' | ');

                    output += `      ├─ ${tpc.padEnd(30)} [Total: ${tpcQuests} Quests / ${tpcQuestions} Qs]\n`;
                    output += `      │   └─ ${levelStrings}\n`;

                    subQuestions += tpcQuestions;
                    subQuests += tpcQuests;
                });
            });
            output += `  ------------------------------------------------\n`;
            output += `  SUBTOTAL (${sub}): ${subQuests} Quests | ${subQuestions} Questions\n\n`;
            totalQuestions += subQuestions;
            totalQuests += subQuests;
        });

        output += "==================================================\n";
        output += `TOTAL APPROVED QUESTS:    ${totalQuests}\n`;
        output += `TOTAL APPROVED QUESTIONS: ${totalQuestions}\n`;
        output += "==================================================\n";

        console.log(output);
        const fs = require('fs');

        // Prepare JSON stats (convert Sets to Arrays)
        const jsonStats = JSON.parse(JSON.stringify(stats, (key, value) =>
            value instanceof Set ? Array.from(value) : value
        ));

        fs.writeFileSync('audit_report_final.txt', output);
        fs.writeFileSync('audit_stats.json', JSON.stringify(jsonStats, null, 2));
        console.log("\n✅ Reports saved to audit_report_final.txt and audit_stats.json");

    } catch (e) {
        console.error("Critical Error during audit:", e);
    } finally {
        process.exit(0);
    }
}

run();
