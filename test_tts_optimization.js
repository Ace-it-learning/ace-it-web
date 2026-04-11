const { generateMultiSpeakerSpeech } = require('./backend/services/TTSService');
const fs = require('fs');
const path = require('path');

async function testSmoothness() {
    console.log("--- Testing Audio Smoothness & Latency Optimization ---");
    
    const transcript = `
        Alice: Good morning, team. Are we ready for the big presentation?
        Bob: I think so, but I'm still a bit nervous about the technical demo.
        Cathy: Don't worry, Bob. We've practiced [PAUSE] at least ten times.
        Alice: Exactly. Now, let's look at the final budget numbers one more time.
    `;

    console.time("Latency");
    try {
        const audioBase64 = await generateMultiSpeakerSpeech(transcript);
        console.timeEnd("Latency");
        
        const buffer = Buffer.from(audioBase64, 'base64');
        const outputPath = path.join(__dirname, 'test_optimized_audio.mp3');
        fs.writeFileSync(outputPath, buffer);
        
        console.log(`✅ Success! Audio saved to ${outputPath}`);
        console.log("Please check the file. It should start with a 2-second silence following by smooth transitions.");
    } catch (err) {
        console.error("❌ Test failed:", err);
    }
}

testSmoothness();
