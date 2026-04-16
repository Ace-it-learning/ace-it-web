const GenerativeAIService = require('../GenerativeAIService');

const ROUTER_PROMPT = `Analyze student message vs history to route intent for the MATHS Tutor. Output ONLY JSON.

ROUTING RULES:
1. CHAT:
   - General conversation ("Hi", "Thanks").
   - Conceptual questions ("What is the formula for area of a circle?", "Explain Pythagoras theorem").
   - Homework help ("Solve this for me: x^2 = 4").
   - Advice ("How do I study for Paper 1?").

2. LAB (Practice):
   - EXPLICIT requests for quiz/practice ("Give me a quiz on probability", "I want to practice algebra", "Start a test").
   - CONFIRMATION to a proposal ("Yes", "Ok" after agent asks "Do you want to practice?").
   - Params: { topic: string (mapped to Maths topic), difficulty: "Foundation"|"Non-Foundation" }

3. ASSESS:
   - Request to solve or explain a specific math problem, especially when an image is provided.
   - "Solve this", "What is the answer to this photo?", "Assess my handwriting".

SCHEMA:
- CHAT: {"intent":"CHAT"}
- LAB: {"intent":"LAB", "bridge_text":"(Required) Encouraging text.", "ui_command":{"action":"LAUNCH_MODULE", "module": "MATHS_LAB", "params":{...}}}
- ASSESS: {"intent":"ASSESS"}

Student: "{{MESSAGE}}"
History: "{{HISTORY}}"
Has Image: {{HAS_IMAGE}}

[CONTEXT]:
- Is New Student: {{IS_NEW}}
- Active Exam: {{ACTIVE_EXAM}}
- Already Completed Topics: {{COMPLETED_TOPICS}}

[STRICT RULE]: NEVER suggest or route to a topic that is present in the "Already Completed Topics" list.`;

class MathsIntentRouter {
    static async classify(message, history = [], uid = null, context = {}, hasImage = false) {
        try {
            const subHistory = history.slice(-3).map(m => `${m.role}: ${m.content}`).join('\n');
            const prompt = ROUTER_PROMPT
                .replace('{{MESSAGE}}', message)
                .replace('{{HISTORY}}', subHistory)
                .replace('{{DIAG_COMPLETED}}', context.diagnostic_completed || false)
                .replace('{{IS_NEW}}', context.is_new_student || false)
                .replace('{{ACTIVE_EXAM}}', context.has_active_exam || false)
                .replace('{{HAS_IMAGE}}', hasImage ? 'YES' : 'NO')
                .replace('{{COMPLETED_TOPICS}}', context.completed_topics || "None");

            const result = await GenerativeAIService.generateContent(prompt, {
                model: "ace-it-flash",
                generationConfig: { responseMimeType: "application/json" }
            });

            return JSON.parse(result.response.text());
        } catch (error) {
            console.error("MathsIntentRouter Error:", error);
            return { intent: "CHAT" };
        }
    }
}

module.exports = MathsIntentRouter;
