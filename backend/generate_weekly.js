const AIService = require('./services/GenerativeAIService');
const fs = require('fs');
const path = require('path');

const generateWeeklyQuest = async (type, topic) => {
    console.log(`[WeeklyGen] Starting ${type} generation for: ${topic}`);
    
    let prompt = "";
    if (type === 'READING') {
        prompt = `Generate a high-stakes HKDSE English Paper 1 Reading Lab JSON.
Topic: ${topic}
Target Level: Level 5**

JSON SCHEMA (MANDATORY):
{
  "type": "READING",
  "topic": "reading_weekly",
  "title": "${topic}",
  "reading_passage": "A 500-600 word sophisticated article about the topic, separated by \\n\\n.",
  "conceptual_explanation": "Brief context about the topic.",
  "key_points": ["Point 1", "Point 2"],
  "interactive_tasks": [
    // Generate exactly 10 tasks (MIX: MCQ, SHORT_ANSWER, ORDERING, CATEGORIZATION)
    {
      "id": "q1",
      "type": "MCQ",
      "instruction": "Choose the best option.",
      "question": "Full sentence question?",
      "options": ["A", "B", "C", "D"],
      "answer": "A",
      "explanation": "Why A is right and others are wrong."
    }
  ],
  "success_feedback": "Well done!",
  "suggested_next_steps": ["Try Writing challenge"]
}
Return JSON ONLY.`;
    } else if (type === 'WRITING') {
        prompt = `Generate a high-stakes HKDSE English Paper 2 Writing Lab JSON.
Topic: ${topic}
Task: Opinion Piece for School Magazine.
Target Level: Level 5**

JSON SCHEMA (MANDATORY):
{
  "type": "WRITING",
  "topic": "writing_weekly",
  "title": "${topic}",
  "reading_passage": "The Writing Situation: Context, Role, Audience, Purpose (150 words).",
  "conceptual_explanation": "Context on the topic.",
  "key_points": ["Developing arguments", "Using specific examples"],
  "interactive_tasks": [
    { "id": "lvl_4", "type": "MODEL_ANSWER", "question": "Model Answer (Level 4)", "answer": "400 word essay...", "explanation": "Detailed breakdown..." },
    { "id": "lvl_5", "type": "MODEL_ANSWER", "question": "Model Answer (Level 5)", "answer": "500 word essay...", "explanation": "Detailed breakdown..." },
    { "id": "lvl_5s", "type": "MODEL_ANSWER", "question": "Model Answer (Level 5*)", "answer": "500 word essay...", "explanation": "Detailed breakdown..." },
    { "id": "lvl_5ss", "type": "MODEL_ANSWER", "question": "Model Answer (Level 5**)", "answer": "600 word polished essay...", "explanation": "Detailed breakdown..." }
  ],
  "success_feedback": "Well done!",
  "suggested_next_steps": ["Try Reading challenge"]
}
Return JSON ONLY.`;
    } else if (type === 'LISTENING') {
        prompt = `Generate a high-stakes HKDSE English Paper 3 Listening Lab JSON.
Topic: ${topic}
Target Level: Level 5**

JSON SCHEMA (MANDATORY):
{
  "type": "LISTENING",
  "topic": "listening_weekly",
  "title": "${topic}",
  "prediction_metadata": { "topic_name": "${topic}", "sub_topics": [{ "id": "st1", "name": "...", "category": "Strategic Capture", "synonyms": ["...", "..."], "is_distractor": false, "hint": "..." }] },
  "reading_passage": "A 1000-word Podcast Transcript with [Stage Directions] for audio simulation.",
  "conceptual_explanation": "Context on the topic.",
  "key_points": ["Note-taking skills", "Identifying speaker attitude"],
  "interactive_tasks": [
     // Generate exactly 10 tasks (MCQ, GAP_FILL, FORM_FILLING, SHORT_RESPONSE)
  ],
  "success_feedback": "Well done!",
  "suggested_next_steps": ["Try Reading challenge"]
}
Return JSON ONLY.`;
    } else if (type === 'SPEAKING') {
        prompt = `Generate a high-stakes HKDSE English Paper 4 Speaking (Interaction) JSON.
Topic: ${topic}
Target Level: Level 5**

JSON SCHEMA (MANDATORY):
{
  "type": "SPEAKING",
  "topic": "speaking_weekly",
  "title": "${topic}",
  "topic_description": "Detailed background about the topic.",
  "instructions": "Full exam instructions for Part A Group Discussion.",
  "discussion_points": [
    "Point 1 to discuss (Specific and DSE-grade)",
    "Point 2 to discuss (Focus on HK context)",
    "Point 3 to discuss (Call to action or solution)"
  ],
  "individual_response_questions": [
    "Sophisticated IR Question 1",
    "Sophisticated IR Question 2"
  ],
  "success_feedback": "Well done!",
  "suggested_next_steps": ["Try Writing challenge"]
}
Return JSON ONLY.`;
    }

    try {
        const result = await AIService.generateJson(prompt, { 
            model: "gemini-1.5-pro", 
            highQuality: true 
        });
        return result.data;
    } catch (e) {
        console.error(`[WeeklyGen] Error for ${type}:`, e.message);
        return null;
    }
};

const run = async () => {
    const data = [
        { week: 13, topics: [
            { type: 'READING', topic: 'The Future of Heritage Conservation in Hong Kong' },
            { type: 'WRITING', topic: 'The Upcoming Plastic Bottle Ban: A Necessary Burden or Environmental Theater?' },
            { type: 'LISTENING', topic: 'Rise of Canto-pop Resurgence among Hong Kong Youth' },
            { type: 'SPEAKING', topic: 'Promoting Local Heritage Sites to International Tourists' }
        ]},
        { week: 14, topics: [
            { type: 'READING', topic: 'Sustainable Housing and the Subdivided Flat Crisis in Hong Kong' },
            { type: 'WRITING', topic: 'Should E-scooters be Legalized on Hong Kong Bike Paths?' },
            { type: 'LISTENING', topic: 'The Lantau Tomorrow Vision: Economic Engine or Environmental Drain?' },
            { type: 'SPEAKING', topic: 'The Ethics of Using AI in Local Secondary Schools' }
        ]},
        { week: 15, topics: [
            { type: 'READING', topic: 'The Impact of AI on Personalised Learning in Local HK Schools' },
            { type: 'WRITING', topic: 'The Rise of Digital Nomads: Is Hong Kong still Competitive?' },
            { type: 'LISTENING', topic: 'Rise of Specialty Coffee Culture in Central: A Social Phenomenon' },
            { type: 'SPEAKING', topic: 'Reducing Single-use Plastics in School Canteens' }
        ]}
    ];

    for (const weekData of data) {
        console.log(`\n--- Processing Week ${weekData.week} ---`);
        for (const q of weekData.topics) {
            const filename = `week_${weekData.week}_${q.type.toLowerCase()}.json`;
            const filepath = path.join(__dirname, 'data', 'weekly_quests', filename);
            
            if (fs.existsSync(filepath)) {
                console.log(`[WeeklyGen] Skipping existing: ${filename}`);
                continue;
            }

            const questJson = await generateWeeklyQuest(q.type, q.topic);
            if (questJson) {
                fs.writeFileSync(filepath, JSON.stringify(questJson, null, 2));
                console.log(`[WeeklyGen] Saved: ${filename}`);
            }
        }
    }
    console.log("\n[WeeklyGen] All batches complete.");
    process.exit(0);
};

run();
