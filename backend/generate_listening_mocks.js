require('dotenv').config({ path: './backend/.env' });
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const MOCK_TOPICS = [
    "School Open Day",
    "Environmental Conservation Campaign",
    "Student Council Election",
    "Sports Day Planning",
    "Cultural Festival Organization",
    "Career Fair Preparation"
];

async function generateListeningMock(topic) {
    console.log(`\n🎧 Generating Listening Mock for topic: ${topic}...`);

    try {
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash',
            generationConfig: { responseMimeType: "application/json" }
        });

        const blueprintPath = path.join(__dirname, 'blueprints', 'Eng_Listening_Blueprint.json');
        const blueprint = fs.readFileSync(blueprintPath, 'utf8');

        const prompt = `You are an expert HKDSE English Listening Exam Designer. Generate a complete Paper 3 Listening Mock Exam on the topic: "${topic}".

        **CONTEXT**: This is for Hong Kong DSE students (Secondary 4-6). The exam must follow the official HKDSE format.

        **BLUEPRINT REFERENCE**:
        ${blueprint}

        **OUTPUT FORMAT (STRICT JSON)**
        Return a single JSON object with this structure:
        {
            "metadata": {
                "title": "Mock Exam: ${topic}",
                "generated_at": "${new Date().toISOString()}",
                "difficulty": "Level 4"
            },
            "Part_A": {
                "tasks": [
                    {
                        "id": "Task_1", 
                        "instructions": "Write the information in the spaces provided.",
                        "questions": [
                            { "id": "Q1", "type": "fill_in_blank", "label": "Venue:", "answer": "City Hall" },
                            { "id": "Q2", "type": "multiple_choice", "label": "Date:", "options": ["Monday", "Friday", "Sunday"], "answer": "Friday" }
                        ]
                    },
                    // ... Generate 3-4 Tasks total for Part A
                ],
                "script": [
                    { "speaker": "Announcer", "text": "Hong Kong Diploma of Secondary Education Examination. English Language Paper 3. Listening and Integrated Skills." },
                    { "speaker": "Announcer", "text": "Part A. Task 1. Please look at page 1 of your Question Papers. Write your answers in the spaces provided." },
                    { "speaker": "Announcer", "text": "(5-second pause)" },
                    { "speaker": "Chris", "text": "Hi Sarah, have you booked the venue yet?" },
                    { "speaker": "Sarah", "text": "Yes, Chris. We are going to City Hall this year." },
                    // ... Full script for ALL Tasks in Part A
                    { "speaker": "Announcer", "text": "That is the end of Part A." }
                ]
            },
            "Part_B": {
                "data_file": [
                    {
                        "id": "doc1",
                        "title": "Email from Chris Wong",
                        "type": "email",
                        "content": "<div class='email'><p><strong>From:</strong> Chris Wong</p><p><strong>To:</strong> Sarah Lee</p><p><strong>Subject:</strong> Venue Booking Confirmation</p><p>Dear Sarah,</p><p>I am writing to confirm...</p></div>"
                    },
                    {
                        "id": "doc2",
                        "title": "Meeting Minutes",
                        "type": "minutes",
                        "content": "<div class='minutes'><h3>Planning Committee Meeting</h3><p><strong>Date:</strong> 15 Jan 2026</p><ul><li>Venue confirmed: City Hall</li><li>Budget approved: $5000</li></ul></div>"
                    },
                    {
                        "id": "doc3",
                        "title": "Event Poster",
                        "type": "poster",
                        "content": "<div class='poster' style='border: 2px solid #333; padding: 20px; text-align: center;'><h2>Annual Cultural Festival</h2><p>Date: 20 March 2026</p><p>Venue: City Hall</p></div>"
                    }
                ],
                "tasks": [
                    {
                        "id": "Task_5",
                        "type": "email",
                        "instructions": "Write an email to the club president...",
                        "requirements": ["Mention the date", "Explain usage"]
                    }
                    // ... Generate 3 Tasks for Part B
                ],
                "script": [
                    { "speaker": "Announcer", "text": "Part B. Please look at the Data File." },
                    { "speaker": "Boss", "text": "Make sure you read the email from the council..." }
                    // ... Script regarding Part B instructions or meeting recording
                ]
            }
        }

        **CRITICAL REQUIREMENTS FOR DATA FILE:**
        - Generate 3-5 distinct documents in the data_file array
        - Document types MUST vary: email, minutes, poster, webpage, note, memo
        - Each document must have realistic, detailed HTML content (150-300 words each)
        - Documents should be interconnected (e.g., email references the meeting, poster shows event details)
        - Use proper HTML formatting with semantic tags
        - Make the content relevant to Hong Kong secondary school context

        **PART A REQUIREMENTS:**
        - Generate 3-4 tasks covering different question types (fill_in_blank, multiple_choice, table_completion)
        - Script must be complete and realistic (include pauses, natural dialogue)
        - Questions must be answerable from the audio script
        - Use Hong Kong names and contexts

        **PART B REQUIREMENTS:**
        - Generate 3 writing tasks (email, article, letter/proposal)
        - Each task should require information from MULTIPLE documents in the data file
        - Requirements should be specific and DSE-appropriate
        - Script should provide additional context or instructions

        Generate the complete mock exam now.`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Clean JSON response
        let cleanedText = responseText.trim();
        if (cleanedText.includes('```json')) {
            cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        }

        const mockData = JSON.parse(cleanedText);

        // Save to file
        const outputDir = path.join(__dirname, 'generated_mocks', 'listening');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const filename = `Listening_${topic.replace(/\s+/g, '_')}_${Date.now()}.json`;
        const filepath = path.join(outputDir, filename);

        fs.writeFileSync(filepath, JSON.stringify(mockData, null, 2));

        console.log(`✅ Successfully generated: ${filename}`);
        console.log(`   - Part A Tasks: ${mockData.Part_A?.tasks?.length || 0}`);
        console.log(`   - Part B Documents: ${mockData.Part_B?.data_file?.length || 0}`);
        console.log(`   - Part B Tasks: ${mockData.Part_B?.tasks?.length || 0}`);

        return mockData;

    } catch (error) {
        console.error(`❌ Failed to generate listening mock for "${topic}":`, error.message);
        return null;
    }
}

async function generateAllMocks() {
    console.log('🚀 Starting batch generation of Listening Mock Exams...\n');
    console.log(`📋 Topics to generate: ${MOCK_TOPICS.length}`);
    console.log('⏱️  Estimated time: ~2-3 minutes\n');

    const results = [];

    for (let i = 0; i < MOCK_TOPICS.length; i++) {
        const topic = MOCK_TOPICS[i];
        console.log(`\n[${i + 1}/${MOCK_TOPICS.length}] Processing: ${topic}`);

        const result = await generateListeningMock(topic);
        results.push({ topic, success: result !== null });

        // Rate limiting: wait 5 seconds between requests
        if (i < MOCK_TOPICS.length - 1) {
            console.log('   ⏳ Waiting 5 seconds before next generation...');
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }

    console.log('\n\n📊 GENERATION SUMMARY');
    console.log('='.repeat(50));
    const successful = results.filter(r => r.success).length;
    console.log(`✅ Successful: ${successful}/${MOCK_TOPICS.length}`);
    console.log(`❌ Failed: ${MOCK_TOPICS.length - successful}/${MOCK_TOPICS.length}`);

    console.log('\n📁 Generated files saved to:');
    console.log(`   backend/generated_mocks/listening/`);

    console.log('\n✨ Batch generation complete!');
}

// Run the batch generation
generateAllMocks().catch(console.error);
