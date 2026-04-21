const admin = require('firebase-admin');
const LabService = require('../services/LabService');
const GenerativeAIService = require('../services/GenerativeAIService');
const { MICRO_SKILLS } = require('../constants/microSkills');
const path = require('path');
const fs = require('fs');

// Note: Ensure the path to your service account key is correct
const saPath = path.join(__dirname, '../config/antigravity-tutor-prod-key.json');
if (!fs.existsSync(saPath)) {
    console.error(`ERROR: Service account key not found at ${saPath}`);
    process.exit(1);
}
const serviceAccount = require(saPath);

// Initialize Firebase
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}
const db = admin.firestore();

/**
 * 4 Pillars of HKDSE Topics
 */
const PILLARS = [
    {
        name: "Technology & The Future",
        themes: [
            "AI Personalization in Education", "The Ethics of Smart City Surveillance",
            "Vertical Farming & Urban Agriculture", "The Psychology of Digital Minimalism",
            "Blockchain in Supply Chain Transparency", "Genetic Engineering & Biodiversity",
            "Virtual Reality in Surgical Training", "The Gig Economy & Work Security",
            "Renewable Energy Storage Solutions", "Cybersecurity in the IoT Era",
            "Automation in Manufacturing", "The Future of Space Tourism",
            "Quantum Computing for Climate Modeling", "Autonomous Vehicles & Urban Planning",
            "E-waste Management Strategies"
        ]
    },
    {
        name: "Hong Kong Heritage & Society",
        themes: [
            "Revitalization of Public Housing Estates", "Preserving Cantonese Opera for Youth",
            "Historical Significance of the Star Ferry", "Evolution of Cha Chaan Teng Culture",
            "The History of Tai Kwun & Urban Conservation", "Banyan Trees & Local Ecology in HK",
            "Traditional Festivals (e.g. Cheung Chau Bun Festival)", "Modernizing Neon Sign Arts in HK",
            "The Demolition of Kowloon Walled City (Retrospective)", "Youth Volunteerism in HK Charities",
            "Cantopop vs. Global Music Trends", "HK's Role as a Global Logistics Hub",
            "The Changing Face of HK Markets (Hawkers)", "Public Art in MTR Stations",
            "Heritage Preservation in Sham Shui Po"
        ]
    },
    {
        name: "Environment & Global Citizenship",
        themes: [
            "Microplastics in Marine Ecosystems", "The Carbon Footprint of Global E-commerce",
            "Zero-Waste Lifestyles in Modern Cities", "Fast Fashion Impact on Global Water",
            "Coral Bleaching in Tropical Waters", "Sustainable Tourism in National Parks",
            "Wildlife Conservation in Biodiversity Hotspots", "Ethical Consumerism & Fair Trade",
            "Ocean Cleanup Technologies", "Impact of Melting Polar Ice Caps",
            "Urban Green Spaces & Mental Health", "The Global Water Crisis & Desalination",
            "Renewable Energy Adoption in Developing Nations", "Reforestation & Carbon Sequestration",
            "Environmental Policies of Global Corporations"
        ]
    },
    {
        name: "Modern Life & Human Well-being",
        themes: [
            "Mindfulness in Secondary School Curriculum", "Intergenerational Communication Gaps",
            "The Impact of Remote Work on Productivity", "Defining Work-Life Balance in 2026",
            "Psychological Benefits of Pet Ownership", "The Evolution of Modern Hobbies (e.g. E-sports)",
            "Cultural Identity in a Globalized World", "The Philosophy of Minimalism",
            "Loneliness vs. Solitude in Urban Life", "Impact of Influencer Marketing on Youth",
            "Modern Nutrition Trends (e.g. Plant-based diets)", "The Importance of Sleep Hygiene",
            "Financial Literacy for Young Adults", "The History of Storytelling & Human Connection",
            "Ethics of Personalized Healthcare"
        ]
    }
];

// Difficulty Mapping
const DIFFICULTIES = [
    { level: "3", label: "Easy", count: 8, mcq: 0.7 },
    { level: "4", label: "Medium", count: 10, mcq: 0.5 },
    { level: "5", label: "DSE Standard", count: 12, mcq: 0.3 },
    { level: "7", label: "Elite", count: 12, mcq: 0.1 }
];

async function runFactory() {
    console.log("=== 🚀 ELITE READING QUEST FACTORY START ===");
    
    const readingSkills = Object.keys(MICRO_SKILLS).filter(s => s.startsWith('reading_'));
    let totalGenerated = 0;

    // We cycle through skills and difficulties
    for (let sIdx = 0; sIdx < readingSkills.length; sIdx++) {
        const skillId = readingSkills[sIdx];
        const skillInfo = MICRO_SKILLS[skillId];

        for (let dIdx = 0; dIdx < DIFFICULTIES.length; dIdx++) {
            const diff = DIFFICULTIES[dIdx];
            
            // Logic to pick a unique theme from our pillars
            // We have 60 missions (15 skills * 4 diffs) and 60 unique themes (4 pillars * 15 themes)
            const pillarIdx = (sIdx + dIdx) % PILLARS.length;
            const themeIdx = (sIdx + dIdx) % PILLARS[pillarIdx].themes.length;
            const theme = PILLARS[pillarIdx].themes[themeIdx];

            console.log(`\n[${totalGenerated + 1}/60] Target: ${skillInfo.name} (${diff.label})`);
            console.log(`Theme: ${theme} [Pillar: ${PILLARS[pillarIdx].name}]`);

            try {
                // --- SMArt RESUmpTION CHECK ---
                // LabService saves topic as the human name and level as the full resolved name
                const resolvedLevelName = DIFFICULTIES[dIdx].label === "Easy" ? "HKDSE Level 3 (Adequate)" :
                                          DIFFICULTIES[dIdx].label === "Medium" ? "HKDSE Level 4 (Good)" :
                                          DIFFICULTIES[dIdx].label === "DSE Standard" ? "HKDSE Level 5 (Strong)" :
                                          "HKDSE Level 5** (Mastery)";

                const existing = await db.collection('question_bank')
                    .where('topic', '==', skillInfo.name)
                    .where('level', '==', resolvedLevelName)
                    .where('is_premium', '==', true)
                    .get();

                if (existing.size >= 8) {
                    console.log(`      ⏩ SKipping: ${skillInfo.name} (${diff.label}) already has ${existing.size} premium questions.`);
                    totalGenerated++;
                    continue;
                } else if (!existing.empty) {
                    console.log(`      ⚠️  Found ${existing.size} premium questions for ${skillInfo.name} (${diff.label}), but need 8. RE-GENERATING...`);
                }

                // Construct the "Premium Command" for LabService
                const params = {
                    topic: skillId,
                    level: diff.level,
                    targetCount: diff.count,
                    themeOverride: theme,
                    mcqRatio: diff.mcq,
                    uid: "FACTORY_ADMIN",
                    isFactory: true,
                    forceHighQuality: true
                };

                const questData = await LabService.generateLesson(params, "ace-it-pro");

                if (!questData || questData.interactive_tasks.length < diff.count) {
                    console.warn(`      ⚠️ WARNING: Insufficient questions generated (${questData?.interactive_tasks?.length || 0}/${diff.count}).`);
                } else {
                    console.log(`      ✅ SUCCESS: Generated ${questData.interactive_tasks.length} questions.`);
                    
                    const qIds = questData.interactive_tasks.map(t => t.id);
                    const batch = db.batch();
                    
                    for (const qId of qIds) {
                        const qRef = db.collection('question_bank').doc(qId);
                        batch.update(qRef, {
                            is_approved: true,
                            is_factory: true,
                            is_premium: true,
                            pillar: PILLARS[pillarIdx].name,
                            theme: theme,
                            mcq_ratio_target: diff.mcq
                        });
                    }
                    await batch.commit();
                    console.log(`      💎 MISSION SAVED & APPROVED.`);
                }
                
                totalGenerated++;
            } catch (err) {
                console.error(`      ❌ FAILED: ${err.message}`);
                // Continue to next to avoid stopping the whole factory
            }

            // Brief pause between missions to avoid quota limits
            await new Promise(r => setTimeout(r, 2000));
        }
    }

    console.log(`\n=== 🏁 FACTORY COMPLETE: ${totalGenerated} missions processed. ===`);
}

runFactory();
