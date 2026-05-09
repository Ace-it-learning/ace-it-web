const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const QuestionBankStore = require('../services/QuestionBankStore');

const mission_002_data = {
    title: 'The Anti-Scam Shield',
    topic: 'Social Issues',
    level: 'B2',
    paper: 'Listening',
    subject: 'English',
    type: 'listening_mission',
    is_approved: true,
    is_factory: false,
    xp: 250,
    description: 'Protect the most vulnerable from the surge in digital fraud and phone scams.',
    
    // PART A: THE DATA SPRINT (Cyber-Crime Trends)
    sprint_data: {
        audio_transcript: `
            Mark (Host): Good morning! With digital payments becoming the norm, fraud is unfortunately on the rise. Today we have Inspector Sarah Chen from the Cyber-Security Bureau. Sarah, just how bad is the situation currently?
            Inspector Chen: Good morning, Mark. It’s a significant challenge. Last year, in 2025, total losses from fraud in Hong Kong reached a staggering 4.2 billion HK dollars. [PAUSE] The most prevalent type remains phishing—hacking into accounts via fake links—which accounts for 35% of all reported cases.
            Mark: 35%... that’s more than one in three. What are the specific red flags for these fake links?
            Inspector Chen: If an SMS asks you to ‘verify’ your account immediately or threatens to freeze your bank card, it’s likely a scam. [PAUSE] Official banks never ask for passwords via SMS. Also, always check the sender’s ID. If it’s a random mobile number instead of the official bank name, delete it.
            Mark: And for those who suspect they’ve already been targeted?
            Inspector Chen: They should immediately call the 18222 Anti-Deception Hotline. [PAUSE] It’s a 24-hour service operated by the ADCC. We also have a new "Cyber-Security Ambassador" program launching on October 12th for university students who want to help us educate the community.
        `,
        tasks: [
            {
                id: 'Task1_Stats',
                type: 'TABLE',
                label: 'Fraud Statistics 2025',
                rows: [
                    { label: 'Total Loss (HKD)', placeholder: 'Amount', answer: '$4.2 Billion' },
                    { label: 'Most Common Type', placeholder: 'Scam Type', answer: 'Phishing' },
                    { label: 'Phishing %', placeholder: 'Percentage', answer: '35%' },
                    { label: 'Hotline Number', placeholder: 'Number', answer: '18222' }
                ]
            },
            {
                id: 'Task2_Tips',
                type: 'LIST',
                label: 'SMS Safety Red Flags',
                items: [
                    { label: 'Bank Policy', placeholder: 'Rule', answer: 'Never ask for passwords via SMS' },
                    { label: 'Sender ID Check', placeholder: 'Action', answer: 'Verify official bank name' },
                    { label: 'Phone numbers', placeholder: 'Warning', answer: 'Random mobile numbers are suspicious' }
                ]
            },
            {
                id: 'Task3_MCQ',
                type: 'MCQ_BATCH',
                label: 'Action & Education',
                questions: [
                    {
                        question: 'What is the ADCC hotline status?',
                        options: ['A. Office hours only', 'B. Weekdays only', 'C. 24-hour service', 'D. Emergency only'],
                        answer: 'C'
                    },
                    {
                        question: 'When does the Ambassador program launch?',
                        options: ['A. September 1st', 'B. October 12th', 'C. End of year', 'D. Next summer'],
                        answer: 'B'
                    }
                ]
            }
        ]
    },

    // PART B: INTEGRATED SIMULATION (Elderly Outreach)
    integrated_data: {
        audio_transcript: `
            James (Coordinator): Okay Linda, we need to finalize the "Senior Security Outreach" report for the District Social Welfare Office. 
            Linda (Volunteer): I’ve been looking at the survey data, James. It turns out 70% of our elderly residents are most terrified of QR code scams at local wet markets. [PAUSE] They feel safe with cash, but very vulnerable with e-wallets.
            James: That aligns with what the office requested. They wanted us to focus on "Practical Digital Literacy." Now, the venue is confirmed as the Central Community Hall, but the date has changed to Saturday, November 14th to accommodate working family members.
            Linda: November 14th. Got it. And the workshops?
            James: We’re running three sessions. "Banking Without Fear" at 10 AM, "Identifying Fake News" at 1 PM, and a final Q&A at 3 PM. [PAUSE] "SafeBank HK" has agreed to sponsor the event with a $60,000 grant, which covers the printing of those large-font safety guides.
            Linda: That’s excellent. We should also mention the "Shield-App." It’s a free download we’ll be installing for them during the seminar. It automatically flags suspicious incoming calls.
            James: Perfect. The goal is to empower them with at least two concrete tools by the time they leave the hall.
        `,
        data_file: [
            { id: 'df1', type: 'letter', title: 'District Council Invite', content: '<b>To:</b> North District Residents<br>The District Council officially invites all seniors to participate in the upcoming safety initiative to combat the rising tide of digital crime.' },
            { id: 'df2', type: 'chart', title: 'Senior Fear Index', content: 'Survey Results (Aged 65+):<br>- QR Code Scams: 70%<br>- Identity Theft: 55%<br>- Technical Confusion: 40%' },
            { id: 'df3', type: 'email', title: 'Logistics Update', content: '<b>From:</b> Logistics Team<br>Confirmed: The Central Community Hall will be available from 9 AM to 6 PM on Nov 14. We need to set up the "Shield-App" station by the entrance.' },
            { id: 'df4', type: 'memo', title: 'Grant Approval', content: '<b>Subject:</b> Sponsorship for Outreach<br>SafeBank HK has approved a grant of $60,000 for the Senior Outreach project. Terms: Must include their logo on all "Shield-App" tutorials.' }
        ],
        writing_task: {
            title: 'Outreach Program Report',
            instruction: 'As the Community Outreach Coordinator, write a report to the District Social Welfare Office (DSWO) summarizing the planned "Senior Security Outreach" program. Include the objectives, key concerns from residents, event logistics, and financial support. (180-220 words)',
            persona: 'Community Outreach Coordinator',
            audience: 'District Social Welfare Office (DSWO)',
            word_count: '180-220 words'
        },
        notetaking_fields: [
            { id: 'nt1', label: 'Main Concerns', placeholder: 'Note the % of fear...' },
            { id: 'nt2', label: 'Event Specifics', placeholder: 'Note the date, workshops and apps...' }
        ],
        marking_key: [
            "Program Name: Senior Security Outreach",
            "Date: Saturday, November 14th",
            "Venue: Central Community Hall",
            "Objective: Practical Digital Literacy / Empowerment",
            "Top Concern: QR Code Scams (70% of residents)",
            "Workshop Session 1: 'Banking Without Fear' (10 AM)",
            "Workshop Session 2: 'Identifying Fake News' (1 PM)",
            "Financial Support: $60,000 grant from SafeBank HK",
            "Tool provided: Shield-App (Anti-scam call flagging)",
            "Target: Providing seniors with 'two concrete tools'"
        ]
    }
};

async function seed() {
    const targetId = 'listening_mission_2'; // Official ID
    try {
        await QuestionBankStore.upsertById(targetId, {
            ...mission_002_data,
            created_at: new Date().toISOString()
        }, { merge: true });
        console.log("✅ Success: Listening Mission #002 seeded to Cosmos.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error seeding mission:", error);
        process.exit(1);
    }
}

seed();
