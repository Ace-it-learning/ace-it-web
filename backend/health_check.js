const axios = require('axios');
const UID = 'EDZNtvh1RIXSpboSkcBE3Y6D8c12';
const BASE = 'http://localhost:3001/api';

const endpoints = [
    '/chat/history/english',
    '/history/english',
    '/stats',
    '/stats/unlocks',
    '/microskills/' + UID,
    '/profile',
    '/skillmap',
    '/redemption/collection',
    '/quests/personalized',
    '/writing/exams'
];

async function check() {
    for (const ep of endpoints) {
        try {
            const res = await axios.get(`${BASE}${ep}?uid=${UID}`);
            console.log(`✅ [${res.status}] ${ep}`);
        } catch (e) {
            console.log(`❌ [${e.response?.status || 'ERR'}] ${ep}`);
            if (e.response?.data) console.log('   ->', JSON.stringify(e.response.data));
        }
    }
}

check();
