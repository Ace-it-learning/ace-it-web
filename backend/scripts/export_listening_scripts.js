const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');
const serviceAccount = require(path.join(__dirname, '..', 'serviceAccountKey.json'));

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}
const db = admin.firestore();

async function exportScripts() {
    console.log("Fetching all 14 Listening Missions...");
    const snapshot = await db.collection('question_bank')
        .where('type', '==', 'listening_mission')
        .get();

    const missions = [];
    snapshot.forEach(doc => {
        const data = doc.data();
        const id = data.id || doc.id;
        if (id.startsWith('listening_mission_')) {
            missions.push({ ...data, id });
        }
    });

    // Sort by ID numerically
    missions.sort((a, b) => {
        const numA = parseInt(a.id.match(/\d+/)?.[0] || 0);
        const numB = parseInt(b.id.match(/\d+/)?.[0] || 0);
        return numA - numB;
    });

    let markdown = "# HKDSE Paper 3: Listening Quest Syllabus - Scripts Review\n\n";
    markdown += "This document contains the Part A (Data Sprint) and Part B (Integrated Task) scripts for all 14 official missions.\n\n";

    for (const m of missions) {
        markdown += `## Mission #${m.id.replace('listening_mission_', '').padStart(3, '0')}: ${m.title}\n`;
        markdown += `**Topic**: ${m.topic} | **Level**: ${m.level}\n\n`;
        
        markdown += "### Part A: Data Sprint (Standard Script)\n";
        markdown += "```text\n";
        markdown += (m.sprint_data?.audio_transcript || "N/A").trim();
        markdown += "\n```\n\n";

        markdown += "### Part B: Integrated Task (Multi-Speaker Script)\n";
        markdown += "```text\n";
        markdown += (m.integrated_data?.audio_transcript || "N/A").trim();
        markdown += "\n```\n\n";
        
        markdown += "---\n\n";
    }

    const outputPath = path.join(__dirname, 'listening_scripts_review.md');
    fs.writeFileSync(outputPath, markdown);
    console.log(`✅ Success! Exported ${missions.length} missions to ${outputPath}`);
    process.exit(0);
}

exportScripts();
