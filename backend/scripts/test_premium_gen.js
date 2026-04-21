const LabService = require('../services/LabService');
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const saPath = path.join(__dirname, '../config/antigravity-tutor-prod-key.json');
const serviceAccount = require(saPath);

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

async function testPremium() {
    console.log("--- 💎 TESTING PREMIUM READING GEN (GEMINI 1.5 PRO) ---");
    
    // Testing Literal Comprehension at Easy Level (Requirement: 8 Qs)
    const params = {
        topic: "reading_literalComprehension",
        level: "3", // Easy
        targetCount: 8,
        themeOverride: "The Evolution of Hong Kong's Smart City Infrastructure",
        mcqRatio: 0.7, // 70% MCQ
        uid: "DIAGNOSTIC_TEST",
        isFactory: true,
        forceHighQuality: true
    };

    try {
        const quest = await LabService.generateLesson(params);
        console.log("SUCCESS!");
        console.log(`Mission Title: ${quest.title}`);
        console.log(`Theme Used: ${params.themeOverride}`);
        console.log(`Questions Generated: ${quest.interactive_tasks.length}`);
        
        const mcqs = quest.interactive_tasks.filter(t => t.type === 'mcq').length;
        const sas = quest.interactive_tasks.filter(t => t.type === 'short_answer' || t.type === 'fill_in').length;
        
        console.log(`Question Breakdown: MCQs: ${mcqs}, Short Answers: ${sas}`);
        
        if (quest.interactive_tasks.length >= 8) {
            console.log("✅ HEALTH CHECK: PASSED (Question Count)");
        } else {
            console.log("❌ HEALTH CHECK: FAILED (Too few questions)");
        }
    } catch (err) {
        console.error("DIAGNOSTIC FAILED:", err.message);
    }
}

testPremium();
