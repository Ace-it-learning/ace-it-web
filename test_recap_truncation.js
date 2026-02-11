const http = require('http');

async function testRecap() {
    const uid = 'fQO24oXqTcSWLiJJagQd5s1IpEZ2'; // fungtam@gmail.com
    console.log("🚀 Testing Intelligent Recap for:", uid);

    const postData = JSON.stringify({
        uid: uid,
        message: '[SYSTEM: DIAGNOSTIC_JUST_COMPLETED] Please provide an extremely detailed, multi-paragraph recap of at least 1500 words if possible, covering every aspect of my performance and a very comprehensive roadmap.',
        agentId: 'english',
        history: [],
        outputLanguage: 'zh-HK'
    });

    const options = {
        hostname: 'localhost',
        port: 3001,
        path: '/api/chat',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
            try {
                const parsed = JSON.parse(data);
                console.log("✅ Response Received!");
                console.log("-------------------");
                console.log(parsed.text);
                console.log("-------------------");
                console.log("Length:", parsed.text.length);

                if (parsed.text.includes('[SUGGESTIONS:')) {
                    console.log("✨ Suggestions found at end.");
                } else {
                    console.log("⚠️ Suggestions MISSING or truncated?");
                }
            } catch (e) {
                console.error("❌ Parse Error:", e.message);
                console.log("Raw Data:", data);
            }
        });
    });

    req.on('error', (e) => {
        console.error("❌ Request Error:", e.message);
    });

    req.write(postData);
    req.end();
}

testRecap();
