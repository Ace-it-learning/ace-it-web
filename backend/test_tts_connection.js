const textToSpeech = require('@google-cloud/text-to-speech');
const fs = require('fs');
const util = require('util');
const path = require('path');

async function testConnection() {
    console.log("🔍 Testing Google Cloud TTS Connection...");

    try {
        const keyFilename = path.join(__dirname, 'serviceAccountKey.json');
        const clientOptions = fs.existsSync(keyFilename) ? { keyFilename } : {};
        console.log(`🔑 Auth Strategy: ${fs.existsSync(keyFilename) ? 'Using serviceAccountKey.json' : 'Default Credentials'}`);

        const client = new textToSpeech.TextToSpeechClient(clientOptions);

        const request = {
            input: { text: "Testing connection." },
            voice: { languageCode: 'en-US', ssmlGender: 'NEUTRAL' },
            audioConfig: { audioEncoding: 'MP3' },
        };

        console.log("🚀 Sending request to Google Cloud...");
        const [response] = await client.synthesizeSpeech(request);

        console.log("✅ SUCCESS! logical connection established.");
        console.log(`📦 Received audio content: ${response.audioContent.length} bytes`);

    } catch (error) {
        console.error("\n❌ CONNECTION FAILED");
        console.error("---------------------------------------------------");
        console.error("Error Code:", error.code);
        console.error("Error Details:", error.details || error.message);
        console.error("---------------------------------------------------");

        if (error.message.includes("API has not been used")) {
            console.log("💡 HINT: You need to ENABLE the API in Cloud Console.");
            console.log("👉 https://console.cloud.google.com/apis/library/texttospeech.googleapis.com");
        }
        else if (error.message.includes("Could not load the default credentials")) {
            console.log("💡 HINT: Google Cloud keys are missing.");
        }
    }
}

testConnection();
