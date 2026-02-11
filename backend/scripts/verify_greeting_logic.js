const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const serviceAccountPath = path.join(__dirname, '../serviceAccountKey.json');
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(require(serviceAccountPath))
    });
}

const UserProfileService = require('../services/UserProfileService');
const GenerativeAIService = require('../services/GenerativeAIService');

async function testPersonalizedGreeting() {
    const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
    console.log(`Using API Key starting with: ${apiKey ? apiKey.substring(0, 8) : 'MISSING'}`);

    const testEmail = 'test_returning@ace-it.ai';
    let uid;

    try {
        console.log("Setting up test user...");
        try {
            const userRecord = await admin.auth().getUserByEmail(testEmail);
            uid = userRecord.uid;
        } catch (e) {
            const userRecord = await admin.auth().createUser({ email: testEmail });
            uid = userRecord.uid;
        }

        // 1. Setup Mock Data
        await admin.firestore().collection('users').doc(uid).set({
            nickname: 'Xiao Ming',
            grade: 'F5',
            is_new_student: false,
            status: 'active',
            diagnostic_completed: true
        });

        // Add some skill progress
        await admin.firestore().collection('users').doc(uid).collection('progress').doc('english').set({
            level: 3,
            microSkills: {
                'Speaking': { level: 2.1 },
                'Tenses': { level: 1.5 },
                'Vocabulary': { level: 4.0 }
            }
        });

        // Add some mistakes
        await UserProfileService.saveMistake(uid, {
            question: "Choose the correct tense: I ___ to the park yesterday.",
            userAnswer: "go",
            feedback: "Use past tense 'went' for yesterday.",
            subject: 'english'
        });

        console.log("Fetching personalized context...");
        const context = await UserProfileService.getPersonalizedContext(uid, 'english');
        console.log("Resulting Context:", JSON.stringify(context, null, 2));

        if (context.topWeaknesses.includes('Tenses') && context.recentMistakes.length > 0) {
            console.log("✅ getPersonalizedContext works correctly.");
        } else {
            console.log("❌ getPersonalizedContext failed to extract data correctly.");
        }

        // 2. Test AI Greeting Generation
        console.log("\nTesting AI Greeting Generation via GenerativeAIService...");
        const weaknessText = context.topWeaknesses.length > 0 ? `The student is currently struggling with: ${context.topWeaknesses.join(', ')}.` : '';
        const mistakeText = context.recentMistakes.length > 0 ? `Their recent mistakes include: "${context.recentMistakes.join('", "')}".` : '';

        const promptOverride = `SYSTEM INSTRUCTION: Returning student. 
        Context about Xiao Ming:
        - Level: ${context.level}
        - Grade: ${context.grade}
        - Weaknesses: ${weaknessText}
        - Recent Mistakes: ${mistakeText}

        TASK:
        1. Greet them warmly by their nickname: Xiao Ming.
        2. Briefly acknowledge their progress or one of their recent struggles/mistakes. 
        3. PROPOSE a specific next study step (e.g., "Ready to tackle some [Weak Topic] practice?" or "Shall we review the concept behind your recent mistake in [Mistake Topic]?").
        4. Output exactly 3 personalized suggestion chips at the end: [SUGGESTIONS: Action 1, Action 2, Action 3].`;

        const AGENT_PROMPTS = {
            english: `Role: You are Miss Janie, your dedicated HKDSE English Mentor and Support Partner...`
        };

        const fullPrompt = `${AGENT_PROMPTS.english} \n${promptOverride} \n\nUser: Hello!`;

        // This will trigger the retry/failover logic in GenerativeAIService
        console.log("Calling GenerativeAIService.generateContent...");
        const result = await GenerativeAIService.generateContent(fullPrompt, {
            model: "gemini-2.0-flash" // Intentional primary choice
        });

        const text = result.response.text();
        console.log("--- AI RESPONSE START ---");
        console.log(text);
        console.log("--- AI RESPONSE END ---");

        const hasName = text.includes('Xiao Ming');
        const hasTopic = text.toLowerCase().includes('tenses') || text.toLowerCase().includes('went');

        if (hasName && hasTopic) {
            console.log("\n✅ AI Personalized Greeting generated correctly.");
        } else {
            console.log("\n❌ AI Personalized Greeting missing context.");
            if (!hasName) console.log("- Nickname 'Xiao Ming' not found in response.");
            if (!hasTopic) console.log("- Topic 'Tenses' or 'went' not found in response.");
        }

    } catch (error) {
        console.error("Test failed:", error);
    } finally {
        console.log("Done. Waiting 1s before exit...");
        setTimeout(() => process.exit(0), 1000);
    }
}

testPersonalizedGreeting();
