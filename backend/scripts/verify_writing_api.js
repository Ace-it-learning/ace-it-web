const axios = require('axios');

const API_URL = 'http://127.0.0.1:3001/api/writing';
const HEALTH_URL = 'http://127.0.0.1:3001/api/health';
axios.defaults.timeout = 5000;

async function testEndpoints() {
    console.log(`🚀 Starting Writing Quest API Verification against ${API_URL}...\n`);

    try {
        // 0. Health Check
        console.log("0. Testing /health...");
        const healthRes = await axios.get(HEALTH_URL);
        console.log("✅ Server Health:", healthRes.data.status);
        // 1. Syllabus
        console.log("1. Testing /syllabus...");
        const sysRes = await axios.get(`${API_URL}/syllabus`);
        console.log("✅ Syllabus OK:", sysRes.data.project === 'Ace it Project');

        // 2. Brainstorm
        console.log("\n2. Testing /brainstorm...");
        const brainRes = await axios.post(`${API_URL}/brainstorm`, {
            topic: "Social Media",
            weakSkills: ["Development"]
        });
        console.log("✅ Brainstorm OK:", !!brainRes.data.intro_message);

        // 3. PowerUp
        console.log("\n3. Testing /draft/powerup...");
        const powerRes = await axios.post(`${API_URL}/draft/powerup`, {
            text: "This is a good essay. It is very big.",
            textType: "Essay"
        });
        console.log("✅ PowerUp OK:", powerRes.data.suggestions.length > 0);

        // 4. Connect
        console.log("\n4. Testing /draft/connect...");
        const connRes = await axios.post(`${API_URL}/draft/connect`, {
            prevParagraph: "First pargraph ending.",
            currentParagraph: "However, the second paragraph starts."
        });
        console.log("✅ Connect OK:", !!connRes.data.rating);

        // 5. Grade
        console.log("\n5. Testing /grade...");
        const gradeRes = await axios.post(`${API_URL}/grade`, {
            topic: "Social Media",
            textType: "Essay",
            content: "This is a meaningful essay about social media. It has pros and cons."
        });
        console.log("✅ Grade OK:", typeof gradeRes.data.overall_score === 'number');

        console.log("\n✨ All systems operational!");

    } catch (error) {
        console.error("❌ Test Failed:", error.message);
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", error.response.data);
        } else if (error.request) {
            console.error("No response received. Is the server running?");
        }
    }
}

testEndpoints();
