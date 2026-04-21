const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const serviceAccountPath = path.join(__dirname, '../config/antigravity-tutor-prod-key.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(require(serviceAccountPath))
    });
}

const db = admin.firestore();

async function deepAudit() {
    console.log('--- 🛡️ DEEP AUDIT: READING & MATH ---');

    const snapshot = await db.collection('question_bank').get();
    
    const literalCompClusters = {}; // passageHash -> { count, status, isPremium }
    let mathPercentagesCount = 0;
    const allMathTopicIds = new Set();
    const crypto = require('crypto');

    snapshot.forEach(doc => {
        const d = doc.data();
        const id = doc.id;
        const topicId = d.topic_id || '';
        const topicName = d.topic || '';
        
        // --- READING: Literal Comprehension ---
        if (topicId.includes('literal') || topicName.includes('Literal')) {
            const pHash = crypto.createHash('md5').update((d.passage || '').trim()).digest('hex');
            if (!literalCompClusters[pHash]) {
                literalCompClusters[pHash] = { count: 0, docs: [], isApproved: d.is_approved, isPremium: d.is_premium, level: d.level };
            }
            literalCompClusters[pHash].count++;
            literalCompClusters[pHash].docs.push(id);
        }

        // --- MATH: Percentages ---
        if (topicId.includes('percent') || topicName.includes('Percent') || topicId.includes('interest') || topicName.includes('Interest')) {
            mathPercentagesCount++;
            allMathTopicIds.add(topicId);
            if (mathPercentagesCount < 5) console.log(`[Math Sample] ID: ${id}, topic_id: ${topicId}, level: ${d.level}`);
        }

        if (topicId.startsWith('math_')) {
            allMathTopicIds.add(topicId);
        }
    });

    console.log('\n--- READING: Literal Comp Clusters ---');
    Object.entries(literalCompClusters).forEach(([hash, info]) => {
        console.log(`Hash: ${hash.substring(0,8)}... | Count: ${info.count} | Level: ${info.level} | Approved: ${info.isApproved} | Premium: ${info.isPremium}`);
        if (info.count < 8 && info.isApproved) {
            console.log(`  🚩 ALERT: Sub-standard cluster approved! Docs: ${info.docs.join(', ')}`);
        }
    });

    console.log(`\n--- MATH: Percentages Summary ---`);
    console.log(`Total Percentage questions: ${mathPercentagesCount}`);
    console.log(`Unique Math Topic IDs:`, Array.from(allMathTopicIds).sort());

    console.log('\n=== 🏁 DEEP AUDIT COMPLETE ===');
}

deepAudit().then(() => process.exit(0)).catch(console.error);
