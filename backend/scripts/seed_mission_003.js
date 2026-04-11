const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Initialize Firebase Admin (assuming serviceAccountKey.json is in the same directory as this script)
// In a real environment, you'd want to point to the correct path
const serviceAccount = require('../../backend/serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

const mission_003 = {
    id: "listening_mission_3",
    type: "listening_mission",
    title: "Mission #003: Heritage Walk",
    topic: "Heritage Preservation",
    level: "DSE Standard",
    subject: "English",
    paper: "Listening",
    
    // PART A: DATA SPRINT (Factual Extraction)
    sprint_data: {
        audio_transcript: `
            Speaker: Welcome to the Heritage Conservation Briefing for the Wan Chai District revitalization project. 
            I'm Dr. Lam, the lead architectural historian. Today we focus on three major clusters.
            First, the 'Blue House' cluster on Stone Nullah Lane. This cluster was built in 1922 and is iconic for its traditional 
            four-storey balconied tenements. It received a UNESCO Award of Excellence in 2017.
            Second, the 'Woo Cheong Pawn Shop' on Johnston Road. This was built in 1888 and represents the early 
            colonial shophouse style. It was revitalized in 2007 into a dining and retail complex.
            Third, the 'Old Wan Chai Post Office', the oldest surviving post office in Hong Kong, built in 1913. 
            It is now an Environmental Resource Centre.
            During the Heritage Walk, we must limit groups to 15 participants for safety and preservation reasons. 
            The full walk takes exactly 110 minutes, including a 15-minute tea break in the Blue House courtyard.
        `,
        tasks: [
            {
                id: "cluster_table",
                type: "TABLE",
                label: "Heritage Site Details",
                headers: ["Site Name", "Year Built", "Current Use / Award"],
                rows: [
                    { label: "Blue House", answer: "1922", placeholder: "Year?" },
                    { label: "Blue House Status", answer: "UNESCO Award of Excellence 2017", placeholder: "Award/Status?" },
                    { label: "Woo Cheong Pawn Shop", answer: "1888", placeholder: "Year?" },
                    { label: "Old Wan Chai Post Office", answer: "Environmental Resource Centre", placeholder: "Current Use?" }
                ]
            },
            {
                id: "logistics_list",
                type: "LIST",
                label: "Tour Logistics",
                items: [
                    { label: "Max Participants per group", answer: "15", placeholder: "Number?" },
                    { label: "Total Duration (including break)", answer: "110 minutes", placeholder: "Duration?" },
                    { label: "Tea Break Location", answer: "Blue House courtyard", placeholder: "Where?" }
                ]
            }
        ]
    },

    // PART B: INTEGRATED SIMULATION (Synthesis & Writing)
    integrated_data: {
        audio_transcript: `
            Alice (Chair): Okay, let's finalize the proposal for the 'Heritage Discovery Week'. 
            We have a budget of $45,000 HKD from the Revitalization 2.0 Grant.
            Bob (Marketing): Our target is specifically local tertiary students. 
            Survey data shows they want 'Instagrammable' locations but also deep historical context.
            Alice: Right. We should focus on the 'Augmented Reality (AR)' layer for the Blue House. 
            We can hire student ambassadors from the local history departments to act as guides.
            Cathy (Logistics): The tour will run from October 5th to October 12th. 
            We need to include a 'Stamp Collection' game where students get a free souvenir if they visit all 5 secondary sites on the map.
            Alice: Excellent. Bob, please ensure the proposal clarifies that the $45,000 covers 
            both the guide stipends and the AR equipment rental. No additional funding will be requested.
            Bob: Understood. I'll include the 'Heritage & High-Tech' theme as the core selling point.
        `,
        marking_key: [
            "Project Name: Heritage Discovery Week (Targeting tertiary students)",
            "Funding Source: Revitalization 2.0 Grant ($45,000 HKD)",
            "Dates: October 5th to October 12th",
            "Key Feature 1: Augmented Reality (AR) integration at Blue House",
            "Key Feature 2: Student Ambassadors from history departments as guides",
            "Incentive: Stamp Collection game with free souvenirs for 5 sites",
            "Budget Allocation: Covers guide stipends and AR equipment rental",
            "Theme: Heritage & High-Tech (Synergy of history and modern technology)"
        ],
        writing_task: {
            format: "Proposal",
            instruction: "Write a proposal to the Wan Chai District Council outlining the plan for the 'Heritage Discovery Week'. Explain the logistical details, the innovative features, and how the grant will be utilized.",
            word_count: "200-250",
            target_audience: "District Council Members"
        },
        data_file: [
            {
                id: "doc1",
                type: "email",
                title: "Email: Revitalization 2.0 Grant Approval",
                content: "Dear Organizers, I am pleased to confirm that your application for the Heritage Grant has been approved. The sum of $45,000 HKD will be disbursed upon receipt of a detailed proposal. Please ensure the project promotes local culture while engaging the youth demographic."
            },
            {
                id: "doc2",
                type: "poster",
                title: "Heritage Map: Wan Chai Route",
                content: "Main Site: Blue House. Secondary Sites: Pak Tai Temple, Tai Yuen Street (Toy Street), Old Wan Chai Post Office, Blue House Courtyard, Pawn Shop. Special Note: The 'Stamp Collection' game requires visiting all 5 secondary sites to qualify for the 'Miniature Balcony' souvenir."
            },
            {
                id: "doc3",
                type: "minutes",
                title: "Excerpts: Youth Focus Group",
                content: "- 85% of students prefer digital interaction (AR/VR) over traditional posters.<br/>- 72% want authentic local stories rather than generic history.<br/>- Preferred souvenir: Collectible physical miniatures."
            }
        ],
        notetaking_fields: [
            { id: "nt1", label: "Project Logistics & Funding", placeholder: "Grant amount, dates, target..." },
            { id: "nt2", label: "Core Innovative Features", placeholder: "AR, student guides, theme..." },
            { id: "nt3", label: "Incentives & Souvenirs", placeholder: "Game details, miniature..." }
        ]
    },
    created_at: admin.firestore.FieldValue.serverTimestamp()
};

async function seed() {
    try {
        console.log("Seeding Mission #003: Heritage Walk...");
        await db.collection('question_bank').doc('listening_mission_3').set(mission_003);
        console.log("✅ Success: Mission #003 seeded to question_bank.");
        process.exit(0);
    } catch (e) {
        console.error("❌ Error seeding mission:", e);
        process.exit(1);
    }
}

seed();
