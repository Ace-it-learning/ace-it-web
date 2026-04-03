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
        title: "Technology Podcast: The Future of AI in Education",
        level: "7",
        levelLabel: "5**",
        topic: "Listening: Technology Podcast",
        type: "listening_mission",
        paper: "Listening",
        is_approved: true,
        reading_passage: "Speaker 1: Welcome to our podcast on the future of AI. Speaker 2: Thanks for having me. I think the impact on students will be profound...",
        questions: [
            { id: "q1", text: "What is the primary focus of the podcast?", type: "mc", options: ["AI in medicine", "AI in schools", "AI in art"], answer: "AI in schools" }
        ],
        audio_segments: [
            { speaker: "Speaker 1 (Standard-B)", text: "Welcome to our podcast on the future of AI.", audio: "MOCKED_AUDIO_B64" },
            { speaker: "Speaker 2 (Neural2-D)", text: "Thanks for having me. I think the impact on students will be profound...", audio: "MOCKED_AUDIO_B64" }
        ],
        created_at: admin.firestore.FieldValue.serverTimestamp()
    },
    {
        title: "Police Report: Witness Statement regarding a local theft",
        level: "4",
        levelLabel: "4",
        topic: "Listening: Police Report",
        type: "listening_mission",
        paper: "Listening",
        is_approved: true,
        reading_passage: "Officer: Can you describe what you saw? Witness: I was walking down Nathan Road when I saw a man taking a bag from the shop...",
        questions: [
            { id: "q1", text: "Where did the theft occur?", type: "mc", options: ["Mong Kok", "Nathan Road", "Central"], answer: "Nathan Road" }
        ],
        audio_segments: [
             { speaker: "Officer (Local/HK-Neural2)", text: "Can you describe what you saw?", audio: "MOCKED_AUDIO_B64" },
             { speaker: "Witness (Standard-A)", text: "I was walking down Nathan Road when I saw a man taking a bag from the shop...", audio: "MOCKED_AUDIO_B64" }
        ],
        created_at: admin.firestore.FieldValue.serverTimestamp()
    }
];

async function seed() {
    console.log("Seeding Listening Variety...");
    for (const t of tasks) {
        const docRef = await db.collection('question_bank').add(t);
        console.log("SAVED:", docRef.id, "| Topic:", t.title);
    }
    process.exit(0);
}

seed();
