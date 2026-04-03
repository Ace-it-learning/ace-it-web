const admin = require('firebase-admin');
const path = require('path');

if (!admin.apps.length) {
    const serviceAccount = require(path.join(__dirname, '..', 'serviceAccountKey.json'));
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}
const db = admin.firestore();

const tasks = [
    {
        title: "Campus Radio Proposal: Enhancing School Life",
        level: "5",
        levelLabel: "5",
        topic: "Listening: Campus Radio",
        type: "listening_mission",
        paper: "Listening",
        is_approved: true,
        reading_passage: "Principal: Welcome everyone. To improve our campus communication, we are launching a radio station. Chairperson: Thank you Principal. We've surveyed students and they want more music and news...",
        questions: [
            { id: "q1", text: "What is the primary reason for the radio station?", type: "mc", options: ["Music practice", "Improve communication", "News broadcast"], answer: "Improve communication" }
        ],
        audio_segments: [
             { speaker: "Principal (Neural2-D)", text: "Welcome everyone. To improve our campus communication, we are launching a radio station.", audio: "MOCKED_AUDIO_B64" },
             { speaker: "Chairperson (Standard-A)", text: "Thank you Principal. We've surveyed students and they want more music and news...", audio: "MOCKED_AUDIO_B64" }
        ],
        created_at: admin.firestore.FieldValue.serverTimestamp()
    },
    {
        title: "Student Union Election Campaign: Policy Analysis",
        level: "7",
        levelLabel: "5**",
        topic: "Listening: Student Union",
        type: "listening_mission",
        paper: "Listening",
        is_approved: true,
        reading_passage: "Student Candidate: Our team, Action Point, believes in better student welfare. We propose a new lounge and better vending machines. Opponent: How can we afford such extravagant changes?",
        questions: [
            { id: "q1", text: "What is the name of the candidate's team?", type: "mc", options: ["Action Point", "Student Voice", "New Era"], answer: "Action Point" }
        ],
        audio_segments: [
             { speaker: "Candidate (Neural2-A)", text: "Our team, Action Point, believes in better student welfare.", audio: "MOCKED_AUDIO_B64" },
             { speaker: "Opponent (Neural2-D)", text: "How can we afford such extravagant changes?", audio: "MOCKED_AUDIO_B64" }
        ],
        created_at: admin.firestore.FieldValue.serverTimestamp()
    }
];

async function seed() {
    console.log("Seeding more variety...");
    for (const t of tasks) {
        await db.collection('question_bank').add(t);
        console.log("SAVED:", t.title);
    }
    process.exit(0);
}

seed();
