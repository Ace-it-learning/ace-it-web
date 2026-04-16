const GenerativeAIService = require('./GenerativeAIService');
const CacheService = require('./CacheService');

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
   - Module: "EXAM_ROUTER"
   - Params: { type: "speaking"|"reading"|"writing"|"listening" }

4. ONBOARDING:
   - "Ready", "OK", "Sure", "Let's start", "I'm ready", "Go", "開始".

SCHEMA:
- CHAT: {"intent":"CHAT","bridge_text":null,"ui_command":null}
- LAB: {"intent":"LAB","bridge_text":"(REQUIRED) Warm bridge text...", "ui_command":{"action":"LAUNCH_MODULE","module":"LEARNING_LAB","params":{...}}}
- ONBOARDING: {"intent":"ONBOARDING","bridge_text":null,"ui_command":null}
- TUTOR_ACTION: {"intent":"TUTOR_ACTION", "action_type": "POLISH" | "DECODE" | "VOCAB", "params": { "text": string, "has_image": boolean }}

Student: "{{MESSAGE}}"
History: "{{HISTORY}}"
Image Attached: {{HAS_IMAGE}}

[STRICT RULES]:
1. **WRITING POLISHER (TUTOR_ACTION: POLISH)**:
   - Trigger: Student sends a paragraph/essay OR asks to "polish", "improve", "upgrade", "refine" a sentence.
   - Example: "Can you polish this?", "Make this sound better: [Sentence]", "Here is my essay...".
   - Params: { "text": "Extracted text to polish" }

2. **READING DECODER (TUTOR_ACTION: DECODE)**:
   - Trigger: Student uploads an image of a text (Image Attached: true) OR asks to "explain structure", "decode this", "break down".
   - Params: { "has_image": true/false }

3. **VOCABULARY (TUTOR_ACTION: VOCAB)**:
   - Trigger: Student asks for "vocab for [Topic]", "words for [Topic]", "golden sentences".
   - Params: { "topic": "Topic Name" }

4. **WRITING_EXEMPLAR (LAB)**:
   - Trigger: Student asks for "model answers", "5** essays", "exemplars", "how to write a proposal/essay", "masterclass samples".
   - Action: "LAUNCH_MODULE"
   - Module: "WRITING_LAB"

[STRICT]: If the student asks for a specific SUBJECT (Speaking, Reading, Writing, Listening, Maths, Chinese) or "practice", route to LAB or EXAM_ROUTER. 
[STRICT]: LAB requests take precedence over CHAT.

[CONTEXT]:
- Is New Student: {{IS_NEW}}
- Active Exam: {{ACTIVE_EXAM}}
- Already Completed Topics: {{COMPLETED_TOPICS}}

[STRICT RULE]: NEVER suggest or route to a topic that is present in the "Already Completed Topics" list. If the user asks for more practice, pick a new topic not in the list.`;

class IntentRouter {
  static async classify(message, history = [], uid = null, context = {}) {
    try {
      // Semantic Cache Check for Generic Navigational Commands
      const isUniversal = CacheService.isUniversalRoutingCommand(message);
      if (isUniversal) {
         const cacheKey = `intent_${message.toLowerCase().trim()}_${context.diagnostic_completed}`;
         const cachedIntent = CacheService.getIntentCache(cacheKey);
         if (cachedIntent) {
             console.log(`[IntentRouter] ⚡ Semantic Cache Hit for: "${message}" ->`, cachedIntent.intent);
             return cachedIntent;
         }
      }

      // Flatten history last 3 turns for context
      const subHistory = history.slice(-3).map(m => {
        const content = m.content || (m.parts && m.parts[0]?.text) || "";
        return `${m.role}: ${content} `;
      }).join('\n');

      const prompt = ROUTER_PROMPT
        .replace('{{MESSAGE}}', message)
        .replace('{{HISTORY}}', subHistory)
        .replace('{{HAS_IMAGE}}', context.has_image || false)
        .replace('{{DIAG_COMPLETED}}', context.diagnostic_completed || false)
        .replace('{{IS_NEW}}', context.is_new_student || false)
        .replace('{{ACTIVE_EXAM}}', context.has_active_exam || false)
        .replace('{{COMPLETED_TOPICS}}', context.completed_topics || "None");

      const finalResult = await GenerativeAIService.generateContent(prompt, {
        model: "ace-it-flash",
        generationConfig: { responseMimeType: "application/json" }
      }, 1); 

      if (!finalResult || !finalResult.response) {
        console.warn("[IntentRouter] AI returned empty response. Falling back to CHAT.");
        return { intent: "CHAT" };
      }

      const response = finalResult.response;
      const text = response.text();

      console.log(`[IntentRouter] Raw Response: ${text} `);

      // Log Token Usage
      if (response && response.usageMetadata) {
        const TokenService = require('./TokenService');
        TokenService.logUsage(uid || 'system', 'intent_router', response.usageMetadata);
      }

      try {
        if (!text || text.trim() === "") return { intent: "CHAT" };
        const json = JSON.parse(text);
        
        // Save to Semantic Cache if eligible
        const isUniversal = CacheService.isUniversalRoutingCommand(message);
        if (isUniversal) {
            const cacheKey = `intent_${message.toLowerCase().trim()}_${context.diagnostic_completed}`;
            CacheService.setIntentCache(cacheKey, json);
        }

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
