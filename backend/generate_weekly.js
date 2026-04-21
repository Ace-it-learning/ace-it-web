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
    // UPDATED: One topic per week for all skills
    const data = [
        { 
            week: 13, 
            theme: "Heritage Conservation",
            topic: "The Future of Heritage Conservation in Hong Kong" 
        },
        { 
            week: 14, 
            theme: "Sustainable Housing",
            topic: "Sustainable Housing and the Subdivided Flat Crisis in Hong Kong" 
        },
        { 
            week: 15, 
            theme: "AI in Education",
            topic: "The Impact of AI on Personalised Learning in Local HK Schools" 
        },
        { 
            week: 16, 
            theme: "Vertical Farming",
            topic: "The Rise of Vertical Farming as a Solution to Urban Food Security" 
        },
        { 
            week: 17, 
            theme: "AI in Education",
            topic: "Navigating the Ethics and Opportunities of AI in the HKDSE Classroom" 
        }
    ];

    const metaPath = path.join(__dirname, 'data', 'weekly_quests', 'weekly_meta.json');
    let meta = {};
    if (fs.existsSync(metaPath)) {
        meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
    }

    for (const weekData of data) {
        console.log(`\n--- Processing Week ${weekData.week}: ${weekData.theme} ---`);
        
        // Update metadata
        const weekKey = `2026_${weekData.week}`;
        meta[weekKey] = {
            theme: weekData.theme,
            topic: weekData.topic
        };

        const types = ['READING', 'WRITING', 'LISTENING', 'SPEAKING'];
        
        for (const type of types) {
            const filename = `week_${weekData.week}_${type.toLowerCase()}.json`;
            const filepath = path.join(__dirname, 'data', 'weekly_quests', filename);
            
            if (fs.existsSync(filepath)) {
                console.log(`[WeeklyGen] Skipping existing: ${filename}`);
                continue;
            }

            const questJson = await generateWeeklyQuest(type, weekData.topic);
            if (questJson) {
                // Save the individual quest
                fs.writeFileSync(filepath, JSON.stringify(questJson, null, 2));
                console.log(`[WeeklyGen] Saved: ${filename}`);
            }
        }
    }

    // Save final metadata
    fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));
    console.log(`[WeeklyGen] Metadata updated at: ${metaPath}`);
    
    console.log("\n[WeeklyGen] All batches complete.");
    process.exit(0);
};

run();
