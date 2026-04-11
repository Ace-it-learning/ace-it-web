const admin = require('firebase-admin');
const path = require('path');

const serviceAccount = require('../../backend/serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

const mission_005 = {
    id: "listening_mission_5",
    type: "listening_mission",
    title: "The Sustainable Kitchen",
    topic: "Eco-Friendly Dining",
    level: "DSE Standard",
    subject: "English",
    paper: "Listening",
    
    // PART A: DATA SPRINT (Half-Standard Fidelity ~2.5 mins)
    sprint_data: {
        audio_transcript: `
            Speaker: Good morning, everyone. Today we're reviewing the pilot for the 'Zero-Waste Cafe' launch in Sham Shui Po. 
            Before we head out to the site visit, I need to go over some updated operational data. 
            First, our sourcing strategy. We originally expected to partner with 5 local organic farms, 
            but we've successfully expanded that to 8 partners across the New Territories. 
            By sourcing directly, we've reduced our 'Fruit and Veg' carbon footprint by 40%.
            
            Now, let's talk about the 'Ugly Vegetable' initiative. This is where we buy produce with minor 
            aesthetic blemishes for half the price. Last month, we rescued over 120 kilograms of seasonal vegetables 
            that would have otherwise ended up in the landfill. Note that for the upcoming trial week, we will focus 
            on 'root vegetables'—carrots, radishes, and potatoes—as they store longer without refrigeration.
            
            Logistically, the Cafe's student volunteer program is starting soon. We have 3 daily shifts: Morning, Lunch, 
            and Afternoon. The Lunch shift is our busiest and requires at least 4 volunteers from 11:30 AM to 2:00 PM. 
            Oh, and please remind the students—all volunteers must wear a hairnet and bring their own reusable water bottle. 
            We do NOT provide disposable cups in the kitchen area. 
            The first workshop for the kitchen crew is scheduled for February 20th. It lasts 90 minutes. 
            Each session is limited to 12 people to ensure safety around the high-speed composters.
        `,
        tasks: [
            {
                id: "sourcing_table",
                type: "TABLE",
                label: "Operational Strategies",
                headers: ["Focus Area", "Updated Figure", "Primary Goal"],
                rows: [
                    { label: "Partner Farms", answer: "8 farms", placeholder: "How many farms?" },
                    { label: "Carbon Reduction", answer: "40% reduction", placeholder: "Impact?" },
                    { label: "Ugly Veg (Rescued)", answer: "120 kilograms", placeholder: "Quantity?" },
                    { label: "Target Trial Items", answer: "Root vegetables", placeholder: "Focus produce?" }
                ]
            },
            {
                id: "volunteer_logistics",
                type: "LIST",
                label: "Volunteer & Workshop Details",
                items: [
                    { label: "Main Shift Time", answer: "11:30 AM to 2:00 PM", placeholder: "Lunch shift?" },
                    { label: "First Workshop Date", answer: "February 20th", placeholder: "When?" },
                    { label: "Workshop Capacity Limit", answer: "12 people", placeholder: "Max per session?" },
                    { label: "Required Gear", answer: "Hairnet and reusable bottle", placeholder: "Mandatory items?" }
                ]
            }
        ]
    },

    // PART B: INTEGRATED SIMULATION (Half-Standard Fidelity ~3 mins)
    integrated_data: {
        audio_transcript: `
            Alice (Coordinator): Let's dive in. We need to finalize the proposal letter for the 'Community Kitchen Day' to the District Council. 
            Our primary objective is 'Reducing Domestic Stigma'—that is, showing people that 'food waste' can actually be 'food resources'.
            
            Bob (Operations): Right. I've looked at Document 1. Hong Kong still dumps over 3,000 tonnes of food waste daily. 
            I want our proposal to emphasize 'Composting on Site'.
            Cathy (Nutritionist): Don't forget Document 3, Bob. The student survey shows that seniors in the district are 
            actually quite lonely. I suggest the Kitchen Day shouldn't just be about cooking. 
            It should be a 'Shared Meal' event. For every student volunteer, we pair them with one local senior. 
            They cook a healthy 'Farm-to-Table' meal together using our partner farm produce.
            
            Alice: That’s a brilliant crossover, Cathy. We'll call it the 'Bridging the Gap' initiative. 
            Bob, for the funding part, we're applying for the 'Green Community Grant'. It's $30,000 HKD. 
            We must mention that the funds will be used for two things: the purchase of industrial-grade dehydrators 
            and the creation of a 'Sustainable Cookbook' to be distributed for free to the neighborhood. 
            
            Cathy: Perfect. And make sure the letter mentions the dates: the main event will be on March 15th, 
            to coincide with 'Global Recycling Day'. 
            Alice: Got it. So the proposal covers: the 3,000-tonne problem, the Senior Pairing program, 
            the $30,000 grant for dehydrators and cookbooks, and the March 15th launch. 
            Bob, can you finish the draft by Friday?
            Bob: I'm on it. I'll make sure the tone is professional but emotionally engaging.
        `,
        marking_key: [
            "Project Title: Community Kitchen Day (Launch: March 15th)",
            "Problem identified: 3,000 tonnes of food waste daily in HK (Document 1)",
            "Objective 1: Reduce Domestic Stigma (food waste as a resource)",
            "Innovative Program: 'Bridging the Gap' initiative (Pairing students with seniors)",
            "Activity: Cooking 'Farm-to-Table' meals using local organic produce",
            "Funding: Green Community Grant ($30,000 HKD)",
            "Fund Use 1: Industrial-grade dehydrators (waste processing)",
            "Fund Use 2: Sustainable Cookbook (community education)",
            "Logistics: Sourcing from 8 local farms; 40% carbon footprint reduction",
            "Theme: Sustainable Nutrition and Social Inclusion"
        ],
        writing_task: {
            format: "Letter",
            instruction: "Write a formal letter to the District Council proposing the 'Community Kitchen Day'. Outline the objectives, the specific 'Bridging the Gap' senior pairing program, and how the requested grant of $30,000 will be spent to benefit the neighborhood.",
            word_count: "200-250",
            target_audience: "District Council Representatives"
        },
        data_file: [
            {
                id: "doc1",
                type: "webpage",
                title: "Report: Food Waste Trends in HK",
                content: "Hong Kong produces over 3,000 tonnes of food waste daily, which accounts for 30% of total municipal solid waste. 65% of this originates from domestic households, not restaurants."
            },
            {
                id: "doc2",
                type: "email",
                title: "Email: Local Farming Outreach",
                content: "Hi Team, we've secured 8 farm partners. They are happy to provide 'seasonal root vegetables' (potatoes/carrots) at a discounted rate. Direct transit from Fanling reduces carbon footprint by 40% compared to imported goods."
            },
            {
                id: "doc3",
                type: "minutes",
                title: "Feedback: Senior Welfare Committee",
                content: "- Concern: Elderly isolation is increasing in Sham Shui Po.<br/>- Opportunity: Seniors possess valuable traditional cooking skills.<br/>- Goal: Foster 'intergenerational synergy' through shared activities."
            }
        ],
        notetaking_fields: [
            { id: "nt1", label: "Environmental Goals & Background", placeholder: "3,000 tonnes, reduction, local farms..." },
            { id: "nt2", label: "Social Inclusion: 'Bridging the Gap'", placeholder: "Student-senior pairing, shared meals..." },
            { id: "nt3", label: "Grant & Project Logistics", placeholder: "$30,000, dehydrators, cookbook, March 15..." }
        ]
    },
    created_at: admin.firestore.FieldValue.serverTimestamp()
};

async function seed() {
    try {
        console.log("Seeding Mission #005: The Sustainable Kitchen...");
        await db.collection('question_bank').doc('listening_mission_5').set(mission_005);
        console.log("✅ Success: Mission #005 seeded.");
        process.exit(0);
    } catch (e) {
        console.error("❌ Error seeding mission:", e);
        process.exit(1);
    }
}

seed();
