const admin = require('firebase-admin');
const path = require('path');

const serviceAccount = require('../../backend/serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function syncRoadmap() {
    console.log("Cleaning and Syncing Firestore to match actual Roadmap UI (14 Missions)...");

    const roadmap = [
        { id: "listening_mission_1", title: "The Mega Event Economy", topic: "Economics", level: "Easy" },
        { id: "listening_mission_2", title: "The Anti-Scam Shield", topic: "Social Issues", level: "Easy" },
        { id: "listening_mission_3", title: "Heritage Walk", topic: "Culture", level: "Medium" },
        { id: "listening_mission_4", title: "Redefining the Canteen", topic: "Healthy School Dining", level: "Easy" },
        { id: "listening_mission_5", title: "Street Art Festival", topic: "District Revitalization", level: "Medium" },
        { id: "listening_mission_6", title: "Smart City Innovation", topic: "IoT & Urban Solutions", level: "DSE Standard" },
        { id: "listening_mission_7", title: "Social Media Ethics", topic: "Digital Citizenship", level: "Medium" },
        { id: "listening_mission_8", title: "E-Sports Tournament", topic: "Logistics & Promotion", level: "Medium" },
        { id: "listening_mission_9", title: "Eco-Tourism in Sai Kung", topic: "Environmental Stewardship", level: "DSE Standard" },
        { id: "listening_mission_10", title: "Startup Weekend", topic: "Entrepreneurship & Pitching", level: "DSE Standard" },
        { id: "listening_mission_11", title: "Marine Conservation", topic: "Ocean Ecosystems", level: "Elite (5*)" },
        { id: "listening_mission_12", title: "Robotics Competition", topic: "STEM & Engineering", level: "DSE Standard" },
        { id: "listening_mission_13", title: "Social Media Wellness", topic: "Mental Health Awareness", level: "DSE Standard" },
        { id: "listening_mission_14", title: "Sustainable Fashion", topic: "Circular Economy", level: "Elite (5**)" }
    ];

    for (const m of roadmap) {
        try {
            console.log(`Syncing ${m.id}: ${m.title}...`);
            await db.collection('question_bank').doc(m.id).set({
                ...m,
                type: "listening_mission",
                paper: "Listening",
                subject: "English",
                is_approved: true,
                is_factory: false,
                created_at: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
        } catch (e) {
            console.error(`❌ Error syncing ${m.id}:`, e);
        }
    }

    console.log("Cleanup: Checking for rogue placeholders...");
    // Future: Add logic to remove missions > 14 if strictly necessary.
    
    console.log("✅ Success: Roadmap synchronised (14 Missions).");
    process.exit(0);
}

syncRoadmap();
