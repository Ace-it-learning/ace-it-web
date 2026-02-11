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

3. ONBOARDING:
   - "Start diagnostics", "Maths calibration", "Take the maths test".

SCHEMA:
- CHAT: {"intent":"CHAT"}
- LAB: {"intent":"LAB", "bridge_text":"(Required) Encouraging text.", "ui_command":{"action":"LAUNCH_MODULE", "module": "MATHS_LAB", "params":{...}}}
- ONBOARDING: {"intent":"ONBOARDING"}

[STRICT]: If context shows diagnostic_completed is false, any request for LAB or EXAM MUST include a bridge_text that politely explains: "I'd love to help with that! However, I first need to assess your current level with a quick 15-minute Study Calibration to unlock your roadmap. How about we start there first?"

Student: "{{MESSAGE}}"
History: "{{HISTORY}}"

[CONTEXT]:
- Diagnostic Completed: {{DIAG_COMPLETED}}
- Is New Student: {{IS_NEW}}
- Active Exam: {{ACTIVE_EXAM}}`;

class MathsIntentRouter {
    static async classify(message, history = [], uid = null, context = {}) {
        try {
            const subHistory = history.slice(-3).map(m => `${m.role}: ${m.content}`).join('\n');
            const prompt = ROUTER_PROMPT
                .replace('{{MESSAGE}}', message)
                .replace('{{HISTORY}}', subHistory)
                .replace('{{DIAG_COMPLETED}}', context.diagnostic_completed || false)
                .replace('{{IS_NEW}}', context.is_new_student || false)
                .replace('{{ACTIVE_EXAM}}', context.has_active_exam || false);

            const result = await GenerativeAIService.generateContent(prompt, {
                model: "gemini-2.0-flash",
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
