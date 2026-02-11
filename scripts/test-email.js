// scripts/test-email.js
const { sendWeeklyReport } = require('../backend/services/EmailService');
const moment = require('moment');

// Mock Data
const mockReportData = {
    studentName: 'Test Student',
    period: 'Feb 1st - Feb 7th',
    stats: {
        totalTimeFormatted: '5h 30m',
        sessionsCount: 8
    },
    mastery: {
        recentSkills: ['Passive Voice', 'Conditional Sentences', 'Vocabulary: Environment']
    },
    mathAbility: {
        recentTopics: ['Quadratic Equations', 'Statistics - Mean/Mode']
    },
    aceSir: {
        dreamPrograms: [
            { id: 'hku-law', code: 'JS6070', name: 'Bachelor of Laws', university: 'HKU', mean: 32 },
            { id: 'cuhk-bba', code: 'JS4202', name: 'BBA', university: 'CUHK', mean: 26 }
        ],
        estimatedBest5: 24,
        recommendation: "Concentrate on Mathematics Section B questions to secure that Level 5."
    }
};

async function runTest() {
    console.log('--- Starting Email Service Test ---');

    // Simulate Env Vars if needed (or rely on default mock in service)
    // process.env.EMAIL_USER = '...'; 

    try {
        const result = await sendWeeklyReport('parent@test.com', mockReportData);
        console.log('--- Test Result ---');
        console.log(JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('Test Failed:', error);
    }
}

runTest();
