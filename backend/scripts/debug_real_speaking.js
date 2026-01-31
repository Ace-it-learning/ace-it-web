const fetch = require('node-fetch');

async function testRealSpeakingResponse() {
    const API_URL = 'http://localhost:3001/api/speaking/chat';

    const payload = {
        history: [
            { role: "Examiner", text: "Good afternoon. We are here to discuss whether social media is good for teenagers. Candidate A, please begin." }
        ],
        currentSpeaker: "Candidate_A",
        topic: "Social Media and Teenagers",
        context: {
            title: "Social Media and Teenagers",
            discussion_points: ["Mental health", "Connectivity", "Addiction"]
        },
        uid: "test_user_123",
        userStatus: "Listening"
    };

    console.log("Simulating Candidate A response...");

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        console.log("Response JSON:", JSON.stringify(data, null, 2));

        if (!data.text || data.text.length < 5) {
            console.error("❌ ERROR: Response text is suspicious (empty or too short)");
        } else {
            console.log("✅ Response text looks healthy:", data.text);
        }

    } catch (e) {
        console.error("Fetch failed:", e);
    }
}

testRealSpeakingResponse();
