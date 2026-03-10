const TTSService = require('../services/TTSService');
const fs = require('fs');
const path = require('path');

async function testTTS() {
    try {
        console.log("Testing TTS Service...");
        const audioContent = await TTSService.generateSpeech("Hello, this is a test of the emergency broadcast system.", "en-US");

        if (audioContent) {
            console.log("TTS Generation Successful! Length:", audioContent.length);
            // Optional: Write to file to verify
            // fs.writeFileSync('test_output.mp3', Buffer.from(audioContent, 'base64'));
        } else {
            console.error("TTS returned empty content.");
        }
    } catch (error) {
        console.error("TTS Test Failed:", error);
    }
}

testTTS();
