const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Initialize Firebase Admin (reuse project config)
if (!admin.apps.length) {
    const serviceAccount = require('./serviceAccountKey.json');
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}
const db = admin.firestore();

const scenario_001 = {
    id: 'listening_simulator_001',
    title: 'Mega Event Economy: Neon-Nexus 2026',
    topic: 'Mega Event Economy',
    level: 'B2',
    paper: 'Listening',
    subject: 'English',
    is_approved: true,
    is_factory: false,
    
    // PART A: THE DATA SPRINT
    sprint_data: {
        audio_transcript: `
            Brian: Welcome to "Hong Kong Today". I'm Brian, and today we're discussing the city's next big event. Joining me is Helena, the lead coordinator. Helena, the public is buzzing about "Neon-Nexus 2026". When does it actually kick off?
            Helena: Well Brian, we're excited! We actually had to shift the date slightly due to venue logistics at the Central Harbourfront. It's now officially starting on the 17th of July.
            Brian: July 17th. And how long do we have to enjoy it?
            Helena: It's a three-week festival, so it runs right through early August.
            Brian: I hear there's a centerpiece attraction that everyone's waiting for?
            Helena: That's right. The star of the show is the 20-meter Inflatable Panda. But it's not just a statue—there's a high-tech AI History Tour located inside the panda itself. 
            Brian: An AI History Tour? Sounds pricey.
            Helena: Actually, we've kept it accessible. It's 85 dollars for adults, and there are discounts for students and seniors.
            Brian: Now, for those looking to get involved, I understand you're still recruiting?
            Helena: Yes! We are looking for Festival Ambassadors. The minimum age is 16, and we're looking for people who can speak both English and Cantonese.
            Brian: Where can they sign up?
            Helena: Visit our official portal at www.neon-nexus.hk. Everything is there.
            Brian: And the evening highlight?
            Helena: Don't miss the drone show. We'll have 1,200 drones in the air every single night, starting promptly at 8:45 PM.
            Brian: 8:45 PM. Helena, thank you for the update.
        `,
        interactive_tasks: [
            {
                id: 'Task1_Table',
                type: 'TABLE_COMPLETION',
                label: 'Event Quick Facts',
                headers: ['Category', 'Details'],
                rows: [
                    { category: 'Start Date', placeholder: 'dd/mm', answer: '17th July' },
                    { category: 'Duration', placeholder: 'No. of weeks', answer: '3 weeks' },
                    { category: 'Main Attraction', placeholder: 'Name of animal', answer: 'Inflatable Panda' },
                    { category: 'Tech Feature', placeholder: 'Type of tour', answer: 'AI History Tour' },
                    { category: 'Adult Price', placeholder: 'HKD Amount', answer: '$85' },
                    { category: 'Drone Show Time', placeholder: 'Morning/Evening', answer: '8:45 PM' }
                ]
            },
            {
                id: 'Task2_Notes',
                type: 'NOTE_TAKING',
                label: 'Recruitment Notes',
                fields: [
                    { label: 'Position Name', placeholder: 'Role title', answer: 'Festival Ambassadors' },
                    { label: 'Minimum Age', placeholder: 'Years', answer: '16' },
                    { label: 'Languages Req.', placeholder: 'List two', answer: 'English and Cantonese' },
                    { label: 'Official URL', placeholder: 'Website address', answer: 'www.neon-nexus.hk' }
                ]
            },
            {
                id: 'Task3_MCQ',
                type: 'MCQ_BATCH',
                label: 'Additional Details',
                questions: [
                    {
                        question: 'What was the reason for the date change?',
                        options: ['A. Weather concerns', 'B. Venue availability', 'C. Funding delay', 'D. Celebrity schedule'],
                        answer: 'B'
                    },
                    {
                        question: 'Which of the following was NOT mentioned as a benefit of the drone show?',
                        options: ['A. Nightly visibility', 'B. High quantity of drones', 'C. Free transportation', 'D. Consistent timing'],
                        answer: 'C'
                    }
                ]
            }
        ]
    },

    // PART B: INTEGRATED SIMULATION
    integrated_data: {
        audio_transcript: `
            Chair: Okay everyone, let's finalize the programming for "Neon-Nexus 2026". 
            Member A: First, we have consensus on the official name—it's definitely Neon-Nexus 2026. 
            Chair: Good. Now, the Opening Ceremony is confirmed for July 17th. We should start at 7 PM to catch the sunset vibe before the drones.
            Member B: Agreed. I've also finalized the details for the Inflatable Panda. The AI-guided history tour inside is the "educational" hook we needed for schools.
            Chair: Excellent. One more thing on sustainability—we need to be strict. No plastic. We're providing custom bamboo utensils for all food zones. No exceptions.
        `,
        data_file: [
            {
                id: 'DOC1',
                type: 'email',
                title: 'Email: Strategic Objectives',
                content: `
                    <p>From: Marketing Director, HK Vision</p>
                    <p>To: Project Coordinator</p>
                    <p>Subject: Re: Mega Event Objectives</p>
                    <p>To ensure "Neon-Nexus 2026" is a success, we must prioritize two things:</p>
                    <ul>
                        <li><b>Retail Boost:</b> Drive foot traffic to local businesses around Central Harbourfront.</li>
                        <li><b>Insta-worthy Moments:</b> Every installation must be highly photogenic to capture the youth market on social media.</li>
                    </ul>
                `
            },
            {
                id: 'DOC2',
                type: 'minutes',
                title: 'Minutes: Budget & Planning',
                content: `
                    <p><b>Event:</b> Neon-Nexus 2026 Internal Meeting</p>
                    <p><b>Venue:</b> Central Harbourfront Event Space</p>
                    <p><b>Financials:</b> Total budget allocated is <b>$12M HKD</b>.</p>
                    <p><b>Targets:</b> We expect to attract at least <b>500,000 visitors</b> over the 21 days.</p>
                    <p><b>Stakeholder Engagement:</b> We have secured 40 local <b>Dai Pai Dongs</b> to host a "Night Vibes Food Street" within the venue.</p>
                `
            },
            {
                id: 'DOC3',
                type: 'survey',
                title: 'Survey: Youth Interest Poll',
                content: `
                    <p>A recent poll of 1,000 students aged 16-22 revealed the following preferences for the 2026 festival:</p>
                    <ul>
                        <li><b>Live Music Performances:</b> 80% expressed high interest.</li>
                        <li><b>Interactive Workshops:</b> 65% want hands-on experiences.</li>
                        <li><b>Static Art Displays:</b> 30% interest.</li>
                    </ul>
                `
            },
            {
                id: 'DOC4',
                type: 'news',
                title: 'News: Panda-mania 2024 Retrospective',
                content: `
                    <p><b>A Proven Format:</b> The predecessor to Neon-Nexus, the "Panda-mania" exhibit of 2024, was a resounding success. Statistics released by the Tourism Board showed a <b>20% increase in local foot traffic</b> in the surrounding districts. Organizers hope to build on this success with the larger-scale Inflatable Panda in 2026.</p>
                `
            }
        ],
        writing_task: {
            title: 'Proposal for HK Tourism Board',
            instruction: 'As the Project Coordinator for HK Vision, write a formal proposal to the HK Tourism Board (HKTB) outlining the objectives, key attractions, and programming of Neon-Nexus 2026.',
            persona: 'Project Coordinator, HK Vision',
            audience: 'Hong Kong Tourism Board (HKTB)',
            word_count: '180–220 words',
            style: 'Formal and Professional'
        },
        notetaking_fields: [
            { id: 'opening_details', label: 'Opening Ceremony Details', placeholder: 'Date and exact time...' },
            { id: 'attractions', label: 'Main Attractions', placeholder: 'What are the tech hooks?' },
            { id: 'sustainability', label: 'Sustainability Rules', placeholder: 'Specific materials mentioned...' }
        ]
    },

    // EVALUATION MARKING SCHEME (Hidden from student)
    marking_scheme: {
        content_points: [
            { label: 'Official name: Neon-Nexus 2026', weight: 1 },
            { label: 'Opening: 17th July, 7 PM', weight: 1 },
            { label: 'Attraction: Inflatable Panda + AI History Tour', weight: 1 },
            { label: 'Sustainability: No plastic / Bamboo utensils', weight: 1 },
            { label: 'Objective: $12M budget / 500k target visitors', weight: 1 },
            { label: 'Vendor Focus: Local Dai Pai Dongs', weight: 1 },
            { label: 'Programming: Interactive Workshops (65% demand)', weight: 1 },
            { label: 'Programming: Live Music (80% demand)', weight: 1 }
        ],
        rubric: {
            content: { max: 5, criteria: 'Completeness of the 8 specific content points.' },
            language: { max: 5, criteria: 'S-V agreement, formal vocabulary, grammar.' },
            organization: { max: 5, criteria: 'Headings, cohesive devices (Furthermore, Consequently).' },
            appropriacy: { max: 3, criteria: 'Formal proposal tone correct for HKTB.' }
        }
    }
};

async function patchScenario() {
    console.log("--- Patching Scenario #001: Mega Event Economy ---");
    try {
        await db.collection('question_bank').doc(scenario_001.id).set(scenario_001);
        console.log("✅ Success: Scenario #001 updated in question_bank.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error patching scenario:", error);
        process.exit(1);
    }
}

patchScenario();
