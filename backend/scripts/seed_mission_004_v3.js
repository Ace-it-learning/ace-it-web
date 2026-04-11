const admin = require('firebase-admin');
const path = require('path');

const serviceAccount = require('../../backend/serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

const mission_004_v3 = {
    id: "listening_mission_4",
    type: "listening_mission",
    title: "Redefining the Canteen",
    topic: "Healthy School Dining",
    level: "DSE Standard",
    subject: "English",
    paper: "Listening",
    
    // PART A: DATA SPRINT (High Fidelity ~4 mins / 620 words)
    sprint_data: {
        audio_transcript: `
            Speaker: Good morning/afternoon, Student Union members and faculty representatives. Thank you all for joining this briefing on such short notice. As we approach the final term, our primary focus is the 'Fresh-Start' canteen initiative. This project isn't just about changing the menu; it's about shifting the entire culture of health and sustainability in our school.
            
            Last month, we conducted a comprehensive 'Dining Habits' survey. I want to thank the 500 students across all forms who took the time to provide feedback—that's nearly 80% of our student body. Now, let’s look at the results. When asked about current food quality, 65% of respondents expressed 'Dissatisfaction' with the heavy reliance on deep-fried items. Interestingly, we originally expected a 50-50 split, but the demand for change is much higher than anticipated. Only about 15% said they were 'Satisfied' with the current fry-heavy menu.
            
            Regarding the budget, students were surprisingly realistic. 72% stated they would be willing to pay slightly more—specifically in the $35 to $45 range—if it meant receiving a balanced, farm-to-table salad or a high-protein bowl. This gives us a strong mandate to negotiate with the catering company. 
            
            Now, please take note of the 'Vending Machine Phase-out'. Currently, we have three carbonated drink machines across the campus—two in the main hall and one by the gymnasium. We have officially scheduled their removal for March 1st. I repeat, March 1st. They will be replaced by two 'Fresh Juice Kiosks' that will offer cold-pressed options at a subsidized rate.
            
            Regarding our 'Green Footprint', we are partnering with 'Green-HK farms' to source exactly 20% of our daily vegetables locally. This direct-sourcing model is projected to reduce the school's carbon footprint by a solid 25% due to reduced long-haul logistics. 
            
            Finally, the 'Canteen Rep' volunteer program. We are looking for 5 enthusiastic students to join our monitoring team. These reps will be responsible for gathering real-time feedback during lunch hours and ensuring food quality meets our new standards. The mandatory introductory workshop for these reps is scheduled for next Tuesday. Note the time: it was originally 4:30 PM, but due to the basketball final, we've pushed it back to 5:00 PM. It will still be held in the Multi-Purpose Hall. Please update your calendars accordingly.
        `,
        tasks: [
            {
                id: "survey_table",
                type: "TABLE",
                label: "Student Dining Survey Data",
                headers: ["Category", "Metric / Date", "Key Finding"],
                rows: [
                    { label: "Food Dissatisfaction", answer: "65%", placeholder: "Percentage?" },
                    { label: "Price Willingness", answer: "$35 to $45", placeholder: "Cost range?" },
                    { label: "Soda Machine Removal", answer: "March 1st", placeholder: "Exact date?" },
                    { label: "Local Source Target", answer: "20%", placeholder: "Sourcing %?" }
                ]
            },
            {
                id: "program_logistics",
                type: "LIST",
                label: "Implementation Details",
                items: [
                    { label: "Project Title", answer: "Fresh-Start", placeholder: "Official name?" },
                    { label: "Projected Carbon Reduction", answer: "25%", placeholder: "Impact?" },
                    { label: "Rep Training Start Time", answer: "5:00 PM", placeholder: "Updated time?" },
                    { label: "Training Location", answer: "Multi-Purpose Hall", placeholder: "Where?" }
                ]
            }
        ]
    },

    // PART B: INTEGRATED SIMULATION (High Fidelity ~5 mins / 710 words)
    integrated_data: {
        audio_transcript: `
            Alice (Chair): Alright team, settle down please. We've got a lot to cover before we present the 'Redefining the Canteen' proposal to the School Management Committee next Thursday. 
            
            Bob (SU Vice-President): Thanks, Alice. I've been refining the 'Sustainability' section. Using the 20% local sourcing target from Green-HK Farms is a huge win for us. Not only does it reduce our logistics emissions by 25%, as mentioned in Document 2, but it also gives our canteen a 'Farm-to-School' identity which matches the District Council's current push for green living.
            
            Cathy (Health & Nutrition Lead): That's good, Bob, but we also need to hammer home the 'Science' side of things. If you look at Document 1—the nutrition report—it clearly shows that a diet high in fried foods leads to a 15% drop in student concentration during the afternoon periods. We should use this data to justify why we’re removing the soda machines on March 1st.
            
            Alice: Exactly. Now, let's discuss the 'Green Rewards' scheme. Cathy, you had some thoughts on incentives?
            Cathy: Yes. According to the Health Committee feedback in Document 3, students are more likely to recycle if there’s a game element involved. So, we're proposing a 'Tray-Return Bounty'. For every tray returned and properly sorted at the waste station, students get a digital stamp on their school app. Once they collect 10 stamps, they get a free juice from the new kiosks. We think this will significantly reduce the cleaning staff's workload.
            
            Bob: That sounds great, but what about the funding? The Student Activity Fund is quite tight this year. 
            Alice: Good point, Bob. We've calculated that we need exactly $15,000 for the initial pilot phase. I know some of you wanted $18,000 for extra signage, but we have to be realistic. This $15,000 will be split: $9,000 will go toward the rental and maintenance of the two juice kiosks, and the remaining $6,000 will be used to print the 'Calorie-Aware' menus and the 'Green Rewards' promotional posters.
            
            Cathy: Alice, speaking of the menus, can we ensure they include the 'Intergenerational synergy' aspect? I saw in the district minutes that seniors in the neighborhood are actually quite good at fermentation and traditional preserve-making. Maybe we can invite them for a guest chef session?
            Alice: That’s a fantastic idea for a later stage, but let’s stick to the core 'Fresh-Start' pillars for this proposal: The $15,000 budget, the March 1st launch, the 'Meatless Monday' pilot, and the 20% local sourcing. 
            
            Bob: Understood. So, the final summary for the proposal: We tackle the 65% dissatisfaction with a professional 'Fresh-Start' menu, incentivize cleanup via 'Green Rewards', and utilize the $15,000 grant specifically for kiosks and educational menus.
            Alice: Perfect. Please have the first draft of the proposal letter on my desk by Friday afternoon. We need to be airtight on the numbers—especially the 25% carbon reduction and the $15,000 split. Let's make this happen. 
        `,
        marking_key: [
            "Facility Update: Redefining the Canteen (Initiative: 'Fresh-Start')",
            "Problem Background: 65% student dissatisfaction with deep-fried food menu (Document 3)",
            "Nutritional Rationale: Fried food linked to 15% drop in afternoon concentration (Document 1)",
            "Sustainability Target: 20% local sourcing goal with Green-HK Farms (Document 2)",
            "Environmental Impact: Reduction of school carbon footprint by 25%",
            "Policy Change: Removal of all soda machines and carbonated drink stations",
            "Innovative Incentive: 'Green Rewards' scheme (Digital stamps for tray-returns/sorting)",
            "Student Reward: 10 stamps = one free cold-pressed juice",
            "Financial Request: $15,000 from the Student Activity Fund",
            "Budget Allocation A: $9,000 for Juice Kiosk rental and maintenance",
            "Budget Allocation B: $6,000 for 'Calorie-Aware' menus and promotional materials",
            "Key Implementation Dates: Launch of 'Meatless Monday' and machine removal on March 1st",
            "Themes: Sustainability, Student Health, and Resource Resilience"
        ],
        writing_task: {
            format: "Proposal",
            instruction: "Write a proposal to the School Management Committee outlining the 'Fresh-Start' canteen initiative. Explain why the changes are needed based on the survey results, the details of the 'Green Rewards' scheme, and how the requested $15,000 fund will be utilized.",
            word_count: "200-250",
            target_audience: "School Management Committee Members"
        },
        data_file: [
            {
                id: "doc1",
                type: "report",
                title: "Academic Focus vs. Nutrition (Internal Study)",
                content: "Recent studies in Form 3 and Form 5 classes show a direct correlation between high-glucose, fried lunches and a 15% decline in focus scores during Lesson 7 and 8. Conversely, 'clean' lunches (salads/proteins) correlate with sustained energy levels until 4:00 PM."
            },
            {
                id: "doc2",
                type: "email",
                title: "Email: Partnership with Green-HK Farms",
                content: "We've confirmed that our local farm network in the New Territories can supply 20% of your daily vegetable needs. Moving to this model eliminates 3 major delivery truck routes, reducing the school's food-related carbon emissions by 25% annually."
            },
            {
                id: "doc3",
                type: "minutes",
                title: "Excerpts: Student Union Feedback Session",
                content: "- 65% of students want the 'Fri-Day Fry-Up' tradition replaced.<br/>- 72% support a price increase to $35-45 for higher quality ingredients.<br/>- Demand: More visible recycling bins and clear tray-return rules."
            }
        ],
        notetaking_fields: [
            { id: "nt1", label: "Rationale & Survey Data", placeholder: "65% dissatisfaction, 15% focus drop, price range..." },
            { id: "nt2", label: "Sustainability & Incentives", placeholder: "25% footprint reduction, Green Rewards, stamps..." },
            { id: "nt3", label: "Finances & Timeline", placeholder: "$15,000 total ($9k kiosks, $6k menus), March 1st..." }
        ]
    },
    created_at: admin.firestore.FieldValue.serverTimestamp()
};

async function seed() {
    try {
        console.log("Seeding Mission #004: Redefining the Canteen (High Fidelity)...");
        await db.collection('question_bank').doc('listening_mission_4').set(mission_004_v3);
        console.log("✅ Success: Mission #004 seeded with ~1,300 total word audio script.");
        process.exit(0);
    } catch (e) {
        console.error("❌ Error seeding mission:", e);
        process.exit(1);
    }
}

seed();
