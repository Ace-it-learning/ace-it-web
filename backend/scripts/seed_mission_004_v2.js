const admin = require('firebase-admin');
const path = require('path');

const serviceAccount = require('../../backend/serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

const mission_004_v2 = {
    id: "listening_mission_4",
    type: "listening_mission",
    title: "The Smart City Hub",
    topic: "Sustainable Technology",
    level: "DSE Standard",
    subject: "English",
    paper: "Listening",
    
    // PART A: DATA SPRINT (Expanded to ~2.5 mins / 400 words)
    sprint_data: {
        audio_transcript: `
            Speaker: Good morning/afternoon, staff. Today we're looking at the tech deployment for the Kowloon East Smart District project. 
            Dr. Chen, our urban planner, will be leading the tours later this month. 
            Before we head down to the basement monitoring room, I need to update the data on our three core pilot programs.
            
            First, our Smart Waste Bin network. Initially, we planned for 210 sensor-enabled bins to cover the central plazas. 
            However, due to the high foot traffic during the weekend test, we've increased that to a total of 250 units. 
            These bins notify the hygiene teams when they reach exactly 80% capacity. 
            Our early data suggests this will reduce garbage truck emissions by a significant 35% compared to the old fixed-route collection.
            
            Moving on to the Multi-purpose Smart Lampposts. These are the backbone of our smart grid. 
            Each lamp houses air quality sensors, local 5G base stations, and traffic-flow cameras. 
            Now, please note the 'Auto-Shuttle' frequency. Bob, you mentioned 10 minutes earlier, but the traffic 
            department has instructed us to maintain a shuttle frequency of every 6 minutes during the trial month. 
            These shuttles are entirely zero-emission, powered by hydrogen fuel cells, not lithium-ion batteries.
            
            Finally, the Hub's public tours. The Smart City Hub will open officially for public tours on January 15th. 
            Each guided session will take exactly 45 minutes. 
            Oh, I should mention—due to the narrow corridors in the server room, we've had to reduce the max 
            capacity per session from 25 people down to 20. Please double-check the booking system for this change.
        `,
        tasks: [
            {
                id: "tech_table",
                type: "TABLE",
                label: "Smart Technology Deployment",
                headers: ["Technology", "Quantity / Frequency", "Key Benefit / Detail"],
                rows: [
                    { label: "Smart Waste Bins", answer: "250", placeholder: "Updated quantity?" },
                    { label: "Bin Notification Threshold", answer: "80% full", placeholder: "Sensor trigger?" },
                    { label: "Auto-Shuttle Frequency", answer: "Every 6 minutes", placeholder: "Trial frequency?" },
                    { label: "Auto-Shuttle Power Source", answer: "Hydrogen fuel cells", placeholder: "Fuel type?" }
                ]
            },
            {
                id: "hub_logistics",
                type: "LIST",
                label: "Visitor Hub Logistics",
                items: [
                    { label: "Official Opening Date", answer: "January 15th", placeholder: "When?" },
                    { label: "Tour Duration", answer: "45 minutes", placeholder: "Length?" },
                    { label: "Max Capacity (Updated)", answer: "20 people", placeholder: "New capacity?" }
                ]
            }
        ]
    },

    // PART B: INTEGRATED SIMULATION (Expanded to ~3 mins / 450 words)
    integrated_data: {
        audio_transcript: `
            Alice (Chair): Okay team, let's settle down. We need to finalize the context for the school magazine article about the 'Smart City Hub'. 
            The chief editor wants a focus on 'Human-Centric Technology'.
            
            Bob (PR): Right, Alice. I've been monitoring the public forums, and the number one concern is definitely data privacy. 
            Students and teachers are worried that the smart lampposts are essentially surveillance tools.
            Cathy (Engineer): I can address that. Bob, make sure the article explicitly states that we use 'edge-anonymization'. 
            This means the video data is processed locally inside the lamppost itself and immediately deleted. No facial recognition 
            data is ever uploaded to the central server. It’s purely for traffic counting and crowd safety. Use the phrase 
            'no data storage' in the article—that should build some trust.
            
            Alice: Good. Now, about the environmental goals. Cathy, you prepared the infographic for Document 2, right?
            Cathy: Yes. By switching to the smart lighting grid and using solar-glass facades on our main buildings, 
            we expect to slash lighting costs district-wide by 60% by the year 2028. Currently, we're at about $2 million 
            HKD monthly, so the savings are massive.
            
            Bob: Excellent. I'll also mention the 'VR Urban Planner' station. That’s very popular with younger visitors.
            Alice: Yes, precisely. We're launching a student pilot program from January 15th to February 15th. 
            Students can use the VR gear to 're-design' their own neighborhood in Kowloon East. It’s a great way to 
            show them that tech isn't just about sensors, it's about empowerment. 
            
            Bob: Got it. So the core message is 'High-Tech and High-Trust'. No facial storage, 60% energy savings, and the VR pilot starts in January.
            Alice: Exactly. Please ensure the 'Data Privacy Guarantee' is the headline of the second paragraph.
        `,
        marking_key: [
            "Facility: Smart City Hub (Opening January 15th)",
            "Philosophy: 'Human-Centric Technology' (Empowerment vs Surveillance)",
            "Primary Concern: Data Privacy & Public Trust",
            "Technical Solution: Edge-anonymization (video processed locally and deleted)",
            "Privacy Standard: No facial recognition data or storage on central servers",
            "Environmental Milestone: 60% reduction in district-wide lighting costs by 2028",
            "Sustainability Feature: Hub uses solar-glass facades to generate power",
            "Student Experience: VR Urban Planner pilot program (Jan 15 - Feb 15)",
            "Community Reward: Reduced collection emissions by 35% through smart bin network",
            "Theme: 'High-Tech and High-Trust' (Synergy of innovation and privacy)"
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
                title: "Public Consultation Summary (Excerpts)",
                content: "- Resident Priority: Privacy and Security of personal data.<br/>- Main Concern: Unauthorized tracking through smart cameras.<br/>- Requested Solution: Clear legal framework and anonymization of all visual data."
            }
        ],
        notetaking_fields: [
            { id: "nt1", label: "Core Technology & Sustainability", placeholder: "Solar glass, energy savings, smart bins..." },
            { id: "nt2", label: "Data Privacy & Public Trust", placeholder: "Edge-anonymization, no storage, no facial recognition..." },
            { id: "nt3", label: "Upcoming Student Pilot", placeholder: "VR Planner, dates, empowerment..." }
        ]
    },
    created_at: admin.firestore.FieldValue.serverTimestamp()
};

async function seed() {
    try {
        console.log("Updating Mission #004 to Half-Standard DSE fidelity...");
        await db.collection('question_bank').doc('listening_mission_4').set(mission_004_v2);
        console.log("✅ Success: Mission #004 (High Fidelity) seeded.");
        process.exit(0);
    } catch (e) {
        console.error("❌ Error seeding mission:", e);
        process.exit(1);
    }
}

seed();
