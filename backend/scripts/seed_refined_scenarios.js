const admin = require('firebase-admin');
const path = require('path');

if (!admin.apps.length) {
    const serviceAccount = require(path.join(__dirname, '..', 'serviceAccountKey.json'));
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}
const db = admin.firestore();

const scenarios = [
    { title: "The Mega Event Economy", description: "Hosting 'Mega Events' (Pandas, Doraemon).", topic: "Mega Events", writingTask: "Proposal for 'District-themed Festival.'" },
    { title: "The Waste Charging Dilemma", description: "Plastic reduction & waste management.", topic: "Environment", writingTask: "Formal letter on school 'Zero-Waste' rules." },
    { title: "The Silver Economy", description: "Aging population & gerontechnology.", topic: "Social Issues", writingTask: "Report on smart gadgets for elderly centers." },
    { title: "AI Personalization in Schools", description: "ChatGPT/Gemini in DSE preparation.", topic: "Technology", writingTask: "Article: 'AI: Tutor or Cheating Tool?'" },
    { title: "The 'Night Vibes' Revival", description: "Night markets (Temple Street).", topic: "Tourism", writingTask: "Feature story on local hawkers & Gen Z." },
    { title: "Talent Integration Program", description: "Welcoming new residents (Top Talent Pass).", topic: "Education", writingTask: "Welcome guide/speech for new students." },
    { title: "Low-Altitude Economy", description: "Drone delivery & logistics in HK.", topic: "Technology", writingTask: "Safety memo regarding drone delivery zones." },
    { title: "Sports Excellence", description: "Post-Olympics success infrastructure.", topic: "Sports", writingTask: "Budget proposal for school sports facilities." },
    { title: "The 'Slasher' Career Path", description: "Youth freelance culture in HK.", topic: "Careers", writingTask: "Career-day speech on 'Slasher' pros/cons." },
    { title: "Mental Health 'Chill Zones'", description: "Well-being spaces in school campuses.", topic: "Health", writingTask: "Proposal for a school 'Quiet Room.'" },
    { title: "Modernizing the 'Cha Chaan Teng'", description: "Digital marketing for traditional food.", topic: "Culture", writingTask: "Marketing plan for traditional tea houses." },
    { title: "Cyber-Security Awareness", description: "Deepfake scams & WhatsApp hacking.", topic: "Technology", writingTask: "Guide for seniors: 'How to Spot a Deepfake.'" },
    { title: "Pet-Friendly Hong Kong", description: "Park/mall access for pets.", topic: "Social Issues", writingTask: "Letter to MTR/LCSD for 'Pet-Friendly' hours." },
    { title: "Vanishing Neon Signs", description: "Preserving iconic neon heritage.", topic: "Heritage", writingTask: "Proposal for a 'Neon Sign Heritage Museum.'" },
    { title: "The E-Sports High School", description: "Gaming in the HK curriculum.", topic: "Education", writingTask: "Debate: 'Should Gaming be a DSE Subject?'" },
    { title: "Eco-Tourism in Sai Kung", description: "GeoPark conservation vs. tourism.", topic: "Tourism", writingTask: "Visitor code of conduct for Sea Caves." },
    { title: "Work-Life Balance Reform", description: "4.5-day work week discussions.", topic: "Social Issues", writingTask: "Survey analysis report on staff productivity." },
    { title: "Urban Farming in Central", description: "Rooftop agriculture in skyscrapers.", topic: "Sustainability", writingTask: "Business pitch for 'Roof-to-Table' dining." },
    { title: "Cinema Culture vs. Streaming", description: "Closing of traditional HK cinemas.", topic: "Culture", writingTask: "Proposal to turn a cinema into a community hub." },
    { title: "Youth Volunteering (ESG)", description: "Student contribution to local ESG goals.", topic: "Social Issues", writingTask: "Report on Beach Cleanup/Meal Delivery." }
];

const seedData = scenarios.map((s, idx) => ({
    title: s.title,
    description: s.description,
    topic: s.topic,
    type: "listening_mission",
    paper: "Listening",
    is_approved: true,
    factory_template: true,
    level: "5", // Default to DSE Standard
    sprint_data: {
        audio_transcript: "Placeholder for Part A audio content...",
        tasks: []
    },
    integrated_data: {
        audio_transcript: "Placeholder for Part B audio content...",
        notetaking_fields: [
            { id: "notes_1", label: "Context & Background", placeholder: "Capture event details..." },
            { id: "notes_2", label: "Stakeholder Opinions", placeholder: "Capture speaker viewpoints..." },
            { id: "notes_3", label: "Proposed Solutions", placeholder: "Capture recommendations..." }
        ],
        writing_task: {
            instruction: s.writingTask,
            word_count: "200-250",
            marking_criteria: "Content, Language, Organization, Appropriacy"
        },
        data_file: [
            { id: "doc_1", title: "Instruction Memo", type: "email", content: `<h3>Memo: ${s.writingTask}</h3><p>Please review the recording and attached documents to complete the task.</p>` }
        ]
    },
    created_at: admin.firestore.FieldValue.serverTimestamp()
}));

async function seed() {
    console.log("Seeding 20 Refined HKDSE Listening Scenarios...");
    
    // First, optional: Clear old ones if needed (keeping separate for safety)
    // const snapshot = await db.collection('question_bank').where('type', '==', 'listening_mission').get();
    // const batch = db.batch();
    // snapshot.docs.forEach(doc => batch.delete(doc.ref));
    // await batch.commit();

    for (const data of seedData) {
        const docRef = await db.collection('question_bank').add(data);
        console.log("SUCCESS:", data.title, "(ID:", docRef.id, ")");
    }
    console.log("Seeding Complete.");
    process.exit(0);
}

seed();
