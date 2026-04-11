const admin = require('firebase-admin');
const path = require('path');

const serviceAccount = require('../../backend/serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

const mission_005_v2 = {
    id: "listening_mission_5",
    type: "listening_mission",
    title: "Street Art Festival",
    topic: "District Revitalization",
    level: "DSE Standard",
    subject: "English",
    paper: "Listening",
    
    // PART A: DATA SPRINT (High Fidelity ~4.5 mins / 640 words)
    sprint_data: {
        audio_transcript: `
            Speaker: Welcome, everyone! It’s fantastic to see so many volunteers here today for the 'Vibrant Walls' Street Art Festival briefing. For those who don’t know me, I’m Sarah, the volunteer coordinator for this year’s Sham Shui Po revitalization project. 
            
            Now, let's dive straight into the numbers. Since our pilot program back in 2016, Sham Shui Po has transformed into a living gallery. We’ve seen the growth of over 40 distinct murals across the district. This year, our ambition is even higher. We’re aiming to complete 12 more large-scale pieces over a single intensive weekend. 
            
            Please mark your calendars: the festival dates are officially April 12th to 14th. This coincides with the regional Art Month, so we expect significant foot traffic. Regarding logistics, we have successfully coordinated with the District Council to pedestrianize three major blocks of Tai Nan Street. I repeat, only Tai Nan Street will be closed to vehicles. During the event, we are forecasting a crowd of over 5,000 visitors per day. To ensure a smooth experience, we require 30 'Art Guides' who will lead 20-minute heritage tours every hour. These tours will connect the new murals with the historical landmarks of the area.
            
            Safety is our absolute priority. Each artist will be provided with professional-grade scaffolding systems. Furthermore, we are strictly enforcing the use of environmentally-friendly spray paints. All paints supplied must be certified 100% low-VOC—that’s Volatile Organic Compounds. This is crucial for the health of both the artists and the residents living in the apartments above. 
            
            On that note, we must maintain a good relationship with the local community. All artistic work must stop promptly at 9:00 PM. No exceptions. This 'quiet hour' policy ensures that we don’t disturb children and seniors in the neighborhood. 
            
            For those of you assigned to the event stages, the live music platform will be located at the southern intersection of Pei Ho Street and Tai Nan Street. Make sure you know where that is. Finally, for families, the 'Mural Painting Workshop' for children under 12 starts at 2:00 PM on Sunday afternoon. It’s always a highlight, so we’ll need extra hands there to manage the supply of brushes and protective aprons. 
            
            Do we have any questions so far? No? Then let's move on to the equipment distribution list.
        `,
        tasks: [
            {
                id: "festival_table",
                type: "TABLE",
                label: "Vibrant Walls: Event Overview",
                headers: ["Category", "Requirement / Metric", "Goal"],
                rows: [
                    { label: "Mural Growth (since 2016)", answer: "40+", placeholder: "Previous count?" },
                    { label: "New Mural Goal", answer: "12", placeholder: "Target for this year?" },
                    { label: "Pedestrianized Area", answer: "Tai Nan Street", placeholder: "Which street?" },
                    { label: "Daily Crowd Forecast", answer: "5,000", placeholder: "Expected footer?" }
                ]
            },
            {
                id: "safety_logistics",
                type: "LIST",
                label: "Safety & Volunteer Details",
                items: [
                    { label: "Paint Standard", answer: "100% low-VOC", placeholder: "Chemical limit?" },
                    { label: "Daily Work Curfew", answer: "9:00 PM", placeholder: "Work stop time?" },
                    { label: "Child Workshop Time", answer: "2:00 PM (Sunday)", placeholder: "When?" },
                    { label: "Guide Tour Duration", answer: "20 minutes", placeholder: "How long?" }
                ]
            }
        ]
    },

    // PART B: INTEGRATED SIMULATION (High Fidelity ~5 mins / 730 words)
    integrated_data: {
        audio_transcript: `
            Alice (Festival Director): Thank you for staying, Bob and Cathy. We need to finalize the 'Vibrant Walls' program for the community engagement board. This part of the proposal is vital for winning over the resident association. 
            
            Bob (Creative Consultant): Thanks, Alice. I’ve been conducting interviews with the local shopkeepers along Tai Nan Street. While 80% are enthusiastic, about 15% expressed genuine worry about 'graffiti tagging'—specifically unauthorized scribbles on their storefronts after the festival ends.
            
            Cathy (Community Liaison): I’ve heard those concerns too. My solution is the 'Designated Tagging Zone' initiative. We’ll set up several managed 'free-walls' in the back alleys, overseen by senior art students. This gives amateur artists a legitimate space to express their energy without defacing the main murals or the shopfront bottles. This approach has worked wonders in London and Melbourne.
            
            Alice: I like it. It channels the energy productively. Now, let’s talk about the 'Heritage Integration'. If you look at the resident survey results in Document 3, there's a strong desire to see 'Traditional Icons' featured in the new works.
            
            Bob: Absolutely. I've drafted a brief for our international muralists. We're asking them to incorporate elements of the district's textile history—think traditional tailor shops, rolls of silk, and classic sewing machines—but reimagined in a contemporary street-art style. This bridges the gap between the neighborhood's industrial past and its creative future.
            
            Cathy: That leads perfectly into our theme. We've officially settled on 'Colors of Community.'
            Alice: Great. Now, let’s talk numbers. We’ve secured a $50,000 sponsorship from 'Art-Connect HK'. Bob, I’ve decided to split this right down the middle—$25,000 each.
            
            Bob: How will that be allocated?
            Alice: The first $25,000 will cover the 'International Artist Travel' and professional materials. That’s for the 12 major murals. The other $25,000 is for the 'Community Participation Walls'. We want local residents and students to actually pick up a brush and help paint under professional supervision. This 'ownership' of the art is proven to reduce vandalism.
            
            Cathy: Looking at Document 1, we also need to consider the economic impact. Street art scenes contribute to a 22% increase in local boutique sales. We should ensure our volunteers give out maps that highlight these small shops during their heritage tours. 
            
            Alice: Excellent addition. To recap: We address the graffiti concern with 'Tagging Zones', focus on textile heritage icons, use the 'Colors of Community' theme, and split the $50,000 sponsorship between the pros and the public.
            Bob: And the 9:00 PM curfew? 
            Alice: Yes, emphasize that in the first page of the proposal. Resident trust is everything. Let's get this draft completed by tomorrow evening.
        `,
        marking_key: [
            "Project Title: Vibrant Walls Street Art Festival (Sham Shui Po)",
            "Event Dates: April 12th to 14th (HK Art Month)",
            "History: Growth from 40 to 52 murals total (identifying 12 new pieces)",
            "Security Solution: 'Designated Tagging Zones' (managed by art students) to prevent vandalism",
            "Theme: 'Colors of Community' (Bridging industrial past with creative future)",
            "Artistic Concept: Integration of textile heritage icons (tailors, silk, sewing machines)",
            "Economic Rationale: 22% boost in local boutique foot traffic/sales (Document 1)",
            "Financial Plan: $50,000 total sponsorship from Art-Connect HK",
            "Budget Allocation A: $25,000 for International Artist Travel & Materials",
            "Budget Allocation B: $25,000 for 'Community Participation Walls' (Public painting)",
            "Resident Safety: Strictly enforced 9:00 PM work curfew and low-VOC paints",
            "Volunteer Role: 20-minute heritage tours mapping murals to landmarks",
            "Target Audience: Local residents, shopkeepers, and art enthusiasts"
        ],
        writing_task: {
            format: "Feature Article",
            instruction: "Write a feature article for the 'Sham Shui Po Chronicle' about the upcoming 'Vibrant Walls' Festival. Highlight the festival's goals, how it balances international talent with local heritage icons, and the specific measures taken to protect the community's interests and safety.",
            word_count: "220-270",
            target_audience: "Sham Shui Po Residents"
        },
        data_file: [
            {
                id: "doc1",
                type: "newsletter",
                title: "The Economic Ripple: Street Art & Local Business",
                content: "Recent data from the Tourism Board indicates that localized art festivals in dense districts like Sham Shui Po lead to a sustained 22% increase in foot traffic for small boutiques and cafes. This 'Murals-to-Main-Street' effect lasts for up to 6 months post-festival."
            },
            {
                id: "doc2",
                type: "internal_memo",
                title: "Safety Standard Revision: Paints & Chemicals",
                content: "To align with LEED green building standards, all festival artists must use 100% low-VOC spray paints. Additionally, no high-decibel music is permitted after 8:30 PM, and all painting activities must cease at 9:00 PM."
            },
            {
                id: "doc3",
                type: "minutes",
                title: "Excerpts: Local Merchant Association Meeting",
                content: "- 80% support the festival.<br/>- Concern: 15% 'High Concern' regarding unauthorized graffiti (tagging).<br/>- Preference: Depictions of local textiles and 'Nostalgic Sham Shui Po' icons."
            }
        ],
        notetaking_fields: [
            { id: "nt1", label: "Scale & Logistics", placeholder: "12 murals, April 12-14, Tai Nan Street, 5k visitors..." },
            { id: "nt2", label: "Artistic Theme & Safety", placeholder: "Colors of Community, textile icons, Tagging Zones, 9pm stop..." },
            { id: "nt3", label: "Funding & Impact", placeholder: "$50k sponsorship ($25k split), 22% sales boost..." }
        ]
    },
    created_at: admin.firestore.FieldValue.serverTimestamp()
};

async function seed() {
    try {
        console.log("Seeding Mission #005: Street Art Festival (High Fidelity)...");
        await db.collection('question_bank').doc('listening_mission_5').set(mission_005_v2);
        console.log("✅ Success: Mission #005 seeded with ~1,370 total word audio script.");
        process.exit(0);
    } catch (e) {
        console.error("❌ Error seeding mission:", e);
        process.exit(1);
    }
}

seed();
