const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
if (!admin.apps.length) {
    const serviceAccount = require(path.join(__dirname, '..', 'serviceAccountKey.json'));
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}
const db = admin.firestore();

const scenario_001 = {
    id: 'listening_mission_1',
    title: 'Mega Event Economy: Neon-Nexus 2026',
    topic: 'Mega Event Economy',
    level: 'B2',
    paper: 'Listening',
    subject: 'English',
    is_approved: true,
    is_factory: false,
    
    // PART A: THE DATA SPRINT (Compulsory)
    sprint_data: {
        audio_transcript: `
            Brian (Host): Welcome to Hong Kong Today. Helena, when does "Neon-Nexus 2026" start?
            Helena (Guest): We moved it from June to the 17th of July. It runs for three weeks.
            Brian: The highlight?
            Helena: The 20-meter Inflatable Panda. The AI History Tour inside costs 85 dollars for adults.
            Brian: Recruitment?
            Helena: We need Festival Ambassadors, min age 16. Sign up at www.neon-nexus.hk.
            Brian: Drones?
            Helena: 1,200 drones nightly at 8:45 PM.
        `,
        // Tasks formatted for DataSprintBoard component
        tasks: [
            {
                id: 'Task1_Table',
                type: 'TABLE',
                label: 'Event Details',
                rows: [
                    { label: 'Start Date', placeholder: 'Date', answer: '17th July' },
                    { label: 'Duration', placeholder: 'Weeks', answer: '3 weeks' },
                    { label: 'Main Attraction', placeholder: 'Name', answer: 'Inflatable Panda' },
                    { label: 'Tech Feature', placeholder: 'Feature', answer: 'AI History Tour' },
                    { label: 'Adult Price', placeholder: 'HKD', answer: '$85' },
                    { label: 'Drone Time', placeholder: 'Time', answer: '8:45 PM' }
                ]
            },
            {
                id: 'Task2_Notes',
                type: 'LIST',
                label: 'Recruitment Info',
                items: [
                    { label: 'Position', placeholder: 'Role', answer: 'Festival Ambassadors' },
                    { label: 'Min Age', placeholder: 'Age', answer: '16' },
                    { label: 'Languages', placeholder: 'Languages', answer: 'English/Cantonese' },
                    { label: 'URL', placeholder: 'Website', answer: 'www.neon-nexus.hk' }
                ]
            },
            {
                id: 'Task3_MCQ',
                type: 'MCQ_BATCH',
                label: 'Selection Details',
                questions: [
                    {
                        question: 'Reason for date change?',
                        options: ['A. Weather', 'B. Venue availability', 'C. Funding', 'D. Staffing'],
                        answer: 'B'
                    },
                    {
                        question: 'Non-benefit mentioned?',
                        options: ['A. Spectacle', 'B. Cost', 'C. Transportation', 'D. Timing'],
                        answer: 'C'
                    }
                ]
            }
        ]
    },

    // PART B: INTEGRATED SIMULATION
    integrated_data: {
        audio_transcript: `
            Chair: Okay everyone, finalized consensus on the theme? 
            Speaker A: Yes, it's definitely going to be "Neon-Nexus 2026". 
            Chair: Excellent. Opening Ceremony? 
            Speaker B: Confirmed for July 17th at 7 PM sharp. 
            Chair: The educational hook? 
            Speaker A: The AI-guided history tour inside the holographic panda is ready. 
            Chair: And the green policy? 
            Speaker B: Strict "No Plastic" policy. We are enforcing the use of bamboo utensils for all vendors.
        `,
        data_file: [
            {
                id: 'df1',
                type: 'email',
                title: 'Strategic Objectives',
                content: '<b>From:</b> Marketing HQ<br>To ensure success, prioritize driving foot traffic to retail businesses and creating "Insta-worthy" spots to capture the youth market.'
            },
            {
                id: 'df2',
                type: 'minutes',
                title: 'Planning Minutes',
                content: 'Total Budget: $12M HKD. Venue: Central Harbourfront. Target: 500,000 visitors. Stakeholders: Local Dai Pai Dongs and street vendors.'
            },
            {
                id: 'df3',
                type: 'survey',
                title: 'Youth Interest Poll',
                content: 'Survey of 1,000 students:<br>- Live Music: 80% interest<br>- Interactive Workshops: 65% interest<br>- Static Art: 30% interest'
            },
            {
                id: 'df4',
                type: 'news',
                title: 'Panda-mania Success',
                content: 'The 2024 "Panda-mania" initiative resulted in a 20% increase in foot traffic in surrounding districts. We aim to replicate this with the Inflatable Panda.'
            }
        ],
        writing_task: {
            title: 'Proposal for HKTB',
            instruction: 'As Project Coordinator for HK Vision, write a formal proposal to the HK Tourism Board (HKTB) outlining the objectives, key attractions, and programming for Neon-Nexus 2026. (180-220 words)',
            persona: 'Project Coordinator, HK Vision',
            audience: 'HKTB',
            word_count: '180-220 words'
        },
        notetaking_fields: [
            { id: 'nt1', label: 'Theme & Opening', placeholder: 'Note the name and exact time...' },
            { id: 'nt2', label: 'Attraction & Sustainability', placeholder: 'Note the Panda hook and utensil rules...' }
        ],
        // 8 Content Points for Marking Agent
        marking_key: [
            "Official name: Neon-Nexus 2026",
            "Opening: 17th July, 7 PM",
            "Attraction: Inflatable Panda + AI History Tour",
            "Sustainability: No plastic / Bamboo utensils",
            "Objective: $12M budget / 500k target visitors",
            "Vendor Focus: Local Dai Pai Dongs",
            "Programming: Interactive Workshops (65% demand)",
            "Programming: Live Music (80% demand)"
        ]
    }
};

async function patch() {
    console.log(`Patching Scenario #001: ${scenario_001.title}`);
    try {
        await db.collection('question_bank').doc(scenario_001.id).set(scenario_001);
        console.log("✅ Success: Scenario #001 updated.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error patching scenario:", error);
        process.exit(1);
    }
}

patch();
