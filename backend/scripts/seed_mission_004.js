const admin = require('firebase-admin');
const path = require('path');

const serviceAccount = require('../../backend/serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function updateMission3() {
    console.log("Updating Mission #003 title...");
    await db.collection('question_bank').doc('listening_mission_3').update({
        title: "Heritage Walk"
    });
    console.log("✅ Mission #003 updated.");
}

const mission_004 = {
    id: "listening_mission_4",
    type: "listening_mission",
    title: "The Smart City Hub",
    topic: "Sustainable Technology",
    level: "DSE Standard",
    subject: "English",
    paper: "Listening",
    
    // PART A: DATA SPRINT
    sprint_data: {
        audio_transcript: `
            Speaker: Welcome to the Kowloon East Smart District update for 2026. 
            Our pilot phase involves three major technology deployments near the new Smart City Hub.
            First, our Smart Waste Bin network. We've 250 sensor-enabled bins that notify municipal teams 
            when they are 80% full, reducing collection truck emissions by 35%. 
            Second, the Multi-purpose Smart Lampposts. These aren't just for lighting; they house 
            5G base stations, air quality sensors, and traffic cameras. 
            Third, the 'Auto-Shuttle' service. This autonomous bus route connects the Hub to the 
            MTR station every 6 minutes using zero-emission hydrogen fuel cells.
            The Smart City Hub itself will open for public tours starting January 15th. 
            Advance booking is required, and each tour session lasts 45 minutes, with a max capacity of 20 people.
        `,
        tasks: [
            {
                id: "tech_table",
                type: "TABLE",
                label: "Smart Technology Deployment",
                headers: ["Technology", "Quantity / Frequency", "Key Benefit"],
                rows: [
                    { label: "Smart Waste Bins", answer: "250", placeholder: "How many?" },
                    { label: "Bin Emission Reduction", answer: "35% reduction in emissions", placeholder: "Benefit?" },
                    { label: "Auto-Shuttle Frequency", answer: "Every 6 minutes", placeholder: "How often?" },
                    { label: "Auto-Shuttle Fuel", answer: "Hydrogen fuel cells", placeholder: "Fuel type?" }
                ]
            },
            {
                id: "hub_logistics",
                type: "LIST",
                label: "Visitor Hub Logistics",
                items: [
                    { label: "Opening Date", answer: "January 15th", placeholder: "When?" },
                    { label: "Tour Duration", answer: "45 minutes", placeholder: "Length?" },
                    { label: "Max Capacity per session", answer: "20 people", placeholder: "Capacity?" }
                ]
            }
        ]
    },

    // PART B: INTEGRATED SIMULATION
    integrated_data: {
        audio_transcript: `
            Alice (Lead Engineer): Team, we need to finalize the promotional article context for the Smart City Hub. 
            Our focus is on 'Human-Centric Technology.' 
            Bob (PR): Right. People are worried about surveillance. We must emphasize that the data 
            from the lamppost cameras is 'anonymized' at the edge—no facial recognition data is stored.
            Cathy (Designer): I've prepared Document 2 on energy savings. The Hub itself will be self-sufficient 
            using solar glass. We're expecting a 60% reduction in lighting costs DISTRICT-WIDE by 2028.
            Alice: Excellent. Bob, mention the 'Data Privacy Guarantee' prominently. 
            We also have a pilot program running from Jan 15 to Feb 15 where students can test 
            the 'Interactive Urban Planner' VR stations.
            Bob: Got it. I'll frame the Hub as a space not just for high-tech, but for high-trust.
        `,
        marking_key: [
            "Facility: Smart City Hub (Opening Jan 15th)",
            "Core Philosophy: Human-Centric Technology",
            "Data Privacy: Edge-anonymization for lamppost cameras (no facial recognition stored)",
            "Target Goal: 60% reduction in district-wide lighting costs by 2028",
            "Sustainability: Self-sufficient solar glass building",
            "Student Opportunity: Pilot program for VR Urban Planner (Jan 15 - Feb 15)",
            "Safety: Reduced collection truck emissions by 35% through smart waste bin monitoring",
            "Theme: High-Tech and High-Trust (Data Privacy Guarantee)"
        ],
        writing_task: {
            format: "Article",
            instruction: "Write an article for your school magazine about the upcoming opening of the 'Smart City Hub'. Discuss the innovative technologies involved, the district's environmental goals, and how the developers are addressing public concerns about data privacy.",
            word_count: "200-250",
            target_audience: "Secondary School Students & Teachers"
        },
        data_file: [
            {
                id: "doc1",
                type: "webpage",
                title: "Fact Sheet: Smart City Hub Features",
                content: "- Solar Glass Facade: Generates enough power for 200 nearby streetlights.<br/>- VR Lab: High-resolution 'Digital Twin' of Hong Kong for urban simulation.<br/>- Smart Kiosks: Multilingual support for tourists and emergency services."
            },
            {
                id: "doc2",
                type: "poster",
                title: "Infographic: Energy & Environment",
                content: "Current District Lighting Cost: $2M Monthly. Optimized Cost (2028): $0.8M. Emissions saved annually: Equivalent to planting 50,000 trees. Smart Bins prevent overflow and pests."
            },
            {
                id: "doc3",
                type: "minutes",
                title: "Public Consultation Summary",
                content: "- Resident Priority: Privacy and Security of personal data.<br/>- Main Concern: Unauthorized tracking through smart cameras.<br/>- Requested Solution: Clear legal framework and anonymization of all visual data."
            }
        ],
        notetaking_fields: [
            { id: "nt1", label: "Core Technology & Sustainability", placeholder: "Solar glass, energy savings, smart bins..." },
            { id: "nt2", label: "Data Privacy & Public Trust", placeholder: "Anonymization, edge processing, no facial recognition..." },
            { id: "nt3", label: "Upcoming Pilot Program", placeholder: "VR Planner, dates, student access..." }
        ]
    },
    created_at: admin.firestore.FieldValue.serverTimestamp()
};

async function run() {
    try {
        await updateMission3();
        console.log("Seeding Mission #004: The Smart City Hub...");
        await db.collection('question_bank').doc('listening_mission_4').set(mission_004);
        console.log("✅ Success: Mission #004 seeded.");
        process.exit(0);
    } catch (e) {
        console.error("❌ Error:", e);
        process.exit(1);
    }
}

run();
