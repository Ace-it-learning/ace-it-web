const GenerativeAIService = require('./GenerativeAIService');

const ROUTER_PROMPT = `Analyze student message vs history to route intent. Output ONLY JSON.

RULES:
1. CHAT: 
   - General conversation, greetings, insults.
   - Teaching requests ("Explain past tense", "How do I use 'the'?").
   - CONSULTATION/ADVICE: "Should I practice grammar?", "What do you suggest?", "I'm bad at listening".
   - QUESTIONS & CORRECTION: "Is my sentence correct?", "Is this right?", "Correct this for me".
   - *CRITICAL*: If the user is *asking* a question or for feedback, it is ALWAYS CHAT. They must explicitly *confirm* a lab proposal with a short, affirmative response (e.g. "Yes", "Ok") to trigger a LAB.

2. LAB: 
   - EXPLICIT COMMANDS: "Start practice", "Give me a quiz", "I want to do grammar exercises", "Launch the lab".
   - CONFIRMATION: "Yes", "Sure", "Okay", "Ok", "Proceed", "好呀", "得呀", "好" (ONLY if the student is responding to a SPECIFIC PROPOSAL from the agent in the immediate history, e.g., "Would you like to try...?", "Shall we start...?", or mentioning a specific Lab/Exam). If there is no proposal in context, treat as CHAT.
   - Module: "LEARNING_LAB"
   - Params: { topic: string, level: string, focus: string[] }

3. EXAM: 
   - Mock exams, past papers, or specific paper tests.
   - *CRITICAL*: "Diagnostic", "Calibration", "Capability Test", "能力測試" belong to ONBOARDING.
   - Module: "EXAM_ROUTER"
   - Params: { type: "speaking"|"reading"|"writing"|"listening" }

4. ONBOARDING:
   - "Ready", "OK", "Sure", "Let's start", "I'm ready", "Go", "開始".
   - EXPLICIT REQUESTS: "Start diagnostic", "I want to do the calibration", "Take the test", "Start 15-mins calibration", "Diagnostic test".
   - Insistence on the diagnostic/calibration test even if the agent suggests something else.

SCHEMA:
- CHAT: {"intent":"CHAT","bridge_text":null,"ui_command":null}
- LAB: {"intent":"LAB","bridge_text":"(REQUIRED) A warm, encouraging sentence acknowledging the specific topic. E.g., 'Great idea! Let's sharpen your grammar skills in the Practice Lab.'", "ui_command":{"action":"LAUNCH_MODULE","module":"LEARNING_LAB","params":{...}}}
- ONBOARDING: {"intent":"ONBOARDING","bridge_text":null,"ui_command":null}

Student: "{{MESSAGE}}"
History: "{{HISTORY}}"
[STRICT]: If context shows diagnostic_completed is false, any request for LAB or EXAM MUST include a bridge_text that politely explains: "I'd love to help with that! However, I first need to assess your current level with a quick 15-minute Study Calibration to unlock your roadmap. How about we start there first?"
[STRICT]: If the student message contains "diagnostic" or "calibration", it is ALWAYS ONBOARDING, regardless of history.
[STRICT]: If the student asks for a specific SUBJECT (Speaking, Reading, Writing, Listening, Maths, Chinese) or "practice", route to LAB or EXAM_ROUTER. 
[STRICT]: If history shows a LAB proposal but student says "diagnostic" or "calibration", route to ONBOARDING.`;

class IntentRouter {
  static async classify(message, history = [], uid = null, context = {}) {
    try {
      // Flatten history last 3 turns for context
      const subHistory = history.slice(-3).map(m => {
        const content = m.content || (m.parts && m.parts[0]?.text) || "";
        return `${m.role}: ${content} `;
      }).join('\n');

      const prompt = ROUTER_PROMPT
        .replace('{{MESSAGE}}', message)
        .replace('{{HISTORY}}', subHistory)
        .replace('{{DIAG_COMPLETED}}', context.diagnostic_completed || false)
        .replace('{{IS_NEW}}', context.is_new_student || false)
        .replace('{{ACTIVE_EXAM}}', context.has_active_exam || false);

      const result = await GenerativeAIService.generateContent(prompt, {
        model: "gemini-2.0-flash",
        generationConfig: { responseMimeType: "application/json" }
      }, 1); // Only 1 attempt for router (fail fast)

      const response = result.response;
      const text = response.text();

      console.log(`[IntentRouter] Raw Response: ${text} `);

      // Log Token Usage
      if (response && response.usageMetadata) {
        const TokenService = require('./TokenService');
        TokenService.logUsage(uid || 'system', 'intent_router', response.usageMetadata);
      }

      try {
        const json = JSON.parse(text);
        return json;
      } catch (e) {
        console.error("Router JSON Parse Error:", e, text);
        return { intent: "CHAT" }; // Fail safe to chat
      }

    } catch (error) {
      console.error("Intent Router Failed:", error);
      return { intent: "CHAT" }; // Fail safe to chat
    }
  }
}

module.exports = IntentRouter;
