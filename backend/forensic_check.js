const fetch = require('node-fetch');

const UID = 'EDZNtvh1RIXSpboSkcBE3Y6D8c12';
const API = 'http://localhost:3001/api';

async function run() {
    console.log("--- FORENSIC RESTORATION AUDIT ---");
    
    // 1. Check Stats Nesting
    try {
        const statsRes = await fetch(`${API}/stats?uid=${UID}`);
        const data = await statsRes.json();
        console.log("DEBUG [STATS] Full Response:", JSON.stringify(data, null, 2));
        if (data.stats && typeof data.stats.xp !== 'undefined') {
            console.log(`✅ [STATS] Nesting restored (xp: ${data.stats.xp})`);
        } else {
            console.error("❌ [STATS] Nesting FAILED (stats.xp missing)");
        }
        if (stats.weaknessPriority && stats.weaknessPriority.length > 0) {
            console.log("✅ [STATS] Growth logic restored (weaknesses found)");
        } else {
            console.warn("⚠️ [STATS] No weaknesses found (might be user specific)");
        }
    } catch (e) {
        console.error("❌ [STATS] Check failed:", e.message);
    }

    // 2. Check Timeline Array
    try {
        const timeRes = await fetch(`${API}/timeline?uid=${UID}`);
        const timeline = await timeRes.json();
        if (Array.isArray(timeline)) {
            console.log(`✅ [TIMELINE] Array restored (Length: ${timeline.length})`);
        } else {
            console.error("❌ [TIMELINE] Format FAIL: Not an array", timeline);
        }
    } catch (e) {
        console.error("❌ [TIMELINE] Check failed:", e.message);
    }

    // 3. Check Specialized Routers
    const routesToTest = [
        { name: 'Reading Scenarios', path: '/reading/exams' },
        { name: 'Writing Scenarios', path: '/writing/scenarios' },
        { name: 'Speaking Exams', path: '/speaking/exams' }
    ];

    for (const r of routesToTest) {
        try {
            const res = await fetch(`${API}${r.path}`);
            if (res.status === 200) {
                console.log(`✅ [ROUTER] ${r.name} restored (${r.path})`);
            } else {
                console.error(`❌ [ROUTER] ${r.name} FAIL: ${res.status} (${r.path})`);
            }
        } catch (e) {
            console.error(`❌ [ROUTER] ${r.name} unreachable:`, e.message);
        }
    }
}

run();
