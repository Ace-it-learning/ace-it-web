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
    title: 'The Mega Event Economy',
    topic: 'Mega Event Economy',
    level: 'B2',
    paper: 'Listening',
    subject: 'English',
    type: 'listening_mission',
    is_approved: true,
    is_factory: false,
    
    // PART A: THE DATA SPRINT (Reinforced)
    sprint_data: {
        audio_transcript: `
            Brian (Host): Welcome to "Hong Kong Today." I'm Brian and today we're joined by Helena from the HK Vision organizing committee. Helena, there's been quite a lot of buzz surrounding the "Neon-Nexus 2026" event. Some people are saying it was supposed to start in June, is that right?
            Helena (Guest): Well, that was the initial plan, Brian. But due to venue scheduling at the Central Harbourfront, we actually had to move it back slightly. [PAUSE] The official start date is now the 17th of July. It will run for exactly three weeks, encompassing both local student holidays and the international tourist surge.
            Brian: I see. And the centerpiece of the festival? Everyone’s talking about the panda.
            Helena: Oh, absolutely! The 20-meter Inflatable Panda is our flagship attraction. But it’s not just a statue—there’s a high-tech AI History Tour located right inside the base of the structure. [PAUSE] It’s quite sophisticated, so we do have a small fee for the tour—85 HK dollars for adults, though students and seniors get a 50% discount.
            Brian: That sounds reasonable for such an experience. Now, I understand you're still looking for staff?
            Helena: Yes, we are actively recruiting what we call "Festival Ambassadors." We’re looking for energetic individuals with a minimum age of 16. [PAUSE] The deadline for applications is next Friday, and interested candidates can find the application portal at www.neon-nexus.hk.
            Brian: And for those coming for the spectacle, when do the nightly shows begin?
            Helena: The main attraction is the drone light show—1,200 drones synchronized to music every single night at 8:45 PM sharp. It’s a sight you won't want to miss.
        `,
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

    // PART B: INTEGRATED SIMULATION (Reinforced)
    integrated_data: {
        audio_transcript: `
            Chair: Okay everyone, can we get a finalized consensus on the branding for the mega event?
            Speaker A: Yes, of course. After considering multiple options, the committee has definitely settled on "Neon-Nexus 2026." [PAUSE] We feel it captures the high-tech, futuristic vibe we're going for at the Central Harbourfront.
            Chair: Excellent. And what about the Opening Ceremony? We need a clear timeline for the VIP invites.
            Speaker B: Confirmed with the logistics team—the ceremony kicks off on Friday, July 17th, at 7 PM sharp. [PAUSE] We’re expecting a full turnout, so we need the security detail on site at least three hours early.
            Chair: Right. Now, we’ve talked about the "educational hook." Is the Panda idea still on the table?
            Speaker A: More than ever! The AI-guided history tour inside the holographic panda is ready for testing. [PAUSE] It walks visitors through Hong Kong’s maritime history using augmented reality. It’s a major selling point for youth engagement.
            Chair: Good. Finally, the environmental concerns. HKTB was very clear about the green policy.
            Speaker B: We’ve enforced a strict "No Plastic" policy across the entire site. [PAUSE] This means no plastic bottles and, most importantly, we are mandating the use of inclusive, biodegradable bamboo utensils for all food vendors. No exceptions.
        `,
        data_file: [
            { id: 'df1', type: 'email', title: 'Strategic Objectives', content: '<b>From:</b> Marketing HQ<br>To ensure success, prioritize driving foot traffic to retail businesses and creating "Insta-worthy" spots to capture the youth market.' },
            { id: 'df2', type: 'minutes', title: 'Planning Minutes', content: 'Total Budget: $12M HKD. Venue: Central Harbourfront. Target: 500,000 visitors. Stakeholders: Local Dai Pai Dongs and street vendors.' },
            { id: 'df3', type: 'survey', title: 'Youth Interest Poll', content: 'Survey of 1,000 students:<br>- Live Music: 80% interest<br>- Interactive Workshops: 65% interest<br>- Static Art: 30% interest' },
            { id: 'df4', type: 'news', title: 'Panda-mania Success', content: 'The 2024 "Panda-mania" initiative resulted in a 20% increase in foot traffic in surrounding districts. We aim to replicate this with the Inflatable Panda.' }
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
        marking_key: [
            "Official name: Neon-Nexus 2026", "Opening: 17th July, 7 PM", "Attraction: Inflatable Panda + AI History Tour", "Sustainability: No plastic / Bamboo utensils", "Objective: $12M budget / 500k target visitors", "Vendor Focus: Local Dai Pai Dongs", "Programming: Interactive Workshops (65% demand)", "Programming: Live Music (80% demand)"
        ]
    }
};

async function patch() {
    const targetId = 'Y6nZkRfwYLTCboRgV3P4';
    try {
        await db.collection('question_bank').doc(targetId).set(scenario_001, { merge: true });
        console.log("✅ Success: Scenario #001 updated with Reinforced Script.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error patching scenario:", error);
        process.exit(1);
    }
}

patch();
