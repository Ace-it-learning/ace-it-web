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
    { title: "Anti-Scam Campaign", description: "Educating the elderly about phone and online scams.", topic: "Social Issues" },
    { title: "Green Roof Project", description: "Installing a sustainable garden on a school building.", topic: "Environment" },
    { title: "Heritage Walk", description: "Organizing a guided tour of historic Kowloon monuments.", topic: "Culture" },
    { title: "Youth Mental Health Week", description: "Planning a series of stress-relief workshops for students.", topic: "Health" },
    { title: "Campus Diversity Expo", description: "A festival celebrating international students' cultures.", topic: "Campus Life" },
    { title: "Smart City Innovation", description: "Proposing IoT solutions for local neighborhood parking.", topic: "Technology" },
    { title: "Social Media Ethics", description: "A seminar on cyberbullying and digital footprint management.", topic: "Technology" },
    { title: "E-Sports Tournament", description: "Organizing a inter-school gaming competition.", topic: "Recreation" },
    { title: "Eco-Tourism in Sai Kung", description: "Promoting sustainable travel to the GeoPark.", topic: "Tourism" },
    { title: "Redefining the Canteen", description: "Student Union proposal for healthier menu options.", topic: "Campus Life" },
    { title: "Street Art Festival", description: "Revitalizing an old district with murals and music.", topic: "Arts" },
    { title: "Startup Weekend", description: "A competition for young entrepreneurs to pitch business ideas.", topic: "Career" },
    { title: "Ocean Cleanup Initiative", description: "Addressing plastic pollution on Hong Kong beaches.", topic: "Environment" },
    { title: "Heritage Walk (Tai Kwun)", description: "Reviving local history through modern arts.", topic: "Culture" },
    { title: "AI in Education", description: "A podcast discussion on the pros/cons of ChatGPT in school.", topic: "Education" },
    { title: "Homelessness Awareness", description: "Coordinating a charity drive for the city's vulnerable.", topic: "Social Issues" },
    { title: "Future of Public Transport", description: "Debating autonomous buses vs. new MTR lines.", topic: "Transportation" },
    { title: "Wildlife Conservation", description: "Protecting local pink dolphins and marine life.", topic: "Environment" },
    { title: "Literature & Coffee", description: "A \"Book Café\" proposal for the local community center.", topic: "Culture" },
    { title: "Dim Sum Heritage", description: "Documenting the vanishing trade of traditional tea houses.", topic: "Culture" }
];

async function seed() {
    console.log("Seeding 20 HKDSE Listening Scenarios...");
    const batch = db.batch();
    
    scenarios.forEach((s, index) => {
        const docRef = db.collection('question_bank').doc(`listening_mission_${index + 1}`);
        const data = {
            ...s,
            id: `listening_mission_${index + 1}`,
            type: 'listening_mission',
            paper: 'Listening',
            level: (index % 3 + 3).toString(), // Levels 3, 4, 5 rotation
            is_approved: true,
            created_at: admin.firestore.FieldValue.serverTimestamp(),
            // Factory Metadata for dynamic generation
            factory_template: true,
            // Placeholder content to satisfy initial fetch requirements if any
            sprint_data: {
                audio_transcript: "This is a placeholder transcript for the Data Sprint.",
                tasks: [
                    { id: "s1", type: "MCQ", question: "Placeholder Question?", options: ["Option A", "Option B", "Option C"], answer: "Option A" }
                ]
            },
            integrated_data: {
                audio_transcript: "This is a placeholder transcript for the Integrated Simulation.",
                notetaking_fields: [
                    { id: "n1", label: "Key Points", placeholder: "Note down the main arguments..." }
                ],
                data_file: [
                    { id: "df1", title: "Background Info", type: "TEXT", content: "Placeholder background information for the task." }
                ],
                writing_task: {
                    instruction: "Write a short summary based on the information provided.",
                    word_count: "150-200",
                    marking_criteria: "Content, Language, Organization, Appropriacy"
                }
            }
        };
        batch.set(docRef, data);
    });

    await batch.commit();
    console.log("Successfully seeded 20 scenarios.");
    process.exit(0);
}

seed();
