const GenerativeAIService = require('../GenerativeAIService');
const admin = require('firebase-admin');
const crypto = require('crypto');
const { MATHS_MICRO_SKILLS } = require('../../constants/mathsMicroSkills');

// Helper: Generate Hash for Deduplication
const generateQuestionHash = (topic, type, questionText) => {
    const str = `${topic.toLowerCase()}-${type}-${questionText.trim().substring(0, 50)}`;
    return crypto.createHash('md5').update(str).digest('hex');
};

const cleanJsonResponse = (text) => {
    let cleaned = text.trim();
    // Remove markdown code blocks if present
    cleaned = cleaned.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    // Sometimes AI adds text before or after JSON
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        cleaned = jsonMatch[0];
    }
    return cleaned;
};

const MATHS_LAB_PROMPT = `You are an expert HKDSE Mathematics tutor. Generate a comprehensive practice session for topic '{{TOPIC_NAME}}' (ID: {{TOPIC_ID}}) at difficulty level {{LEVEL}}.

### CRITICAL REQUIREMENTS:

1. **HK DSE SYLLABUS ALIGNMENT**:
   - ALL questions MUST align with the official HKDSE Mathematics Compulsory Part syllabus (Form 4-6 level).
   - Use terminology and notation consistent with HK DSE past papers.
   - Question difficulty should match DSE Paper 1 (Conventional) and Paper 2 (MC) standards.
   - For Level 3: Foundation tier (Grade 3-4 DSE).
   - For Level 4: Core tier (Grade 4-5 DSE).
   - For Level 5+: Advanced tier (Grade 5*-5** DSE).
   - **STRICTNESS**: Ensure questions are not too simple. Avoid Form 1-3 level content unless as a lead-in to a more complex problem.

2. **LATEX FORMATTING** (CRITICAL):
   - Use LaTeX for ALL mathematical expressions.
   - MUST use DOUBLE backslashes in JSON: "\\\\frac{1}{2}" NOT "\\frac{1}{2}".
   - Inline math: Wrap in single $ signs: "$x^2 + 2x + 1 = 0$".
   - Block math: Wrap in \\\\[ \\\\]: "\\\\[x = \\\\frac{-b \\\\pm \\\\sqrt{b^2-4ac}}{2a}\\\\]".
   - Common symbols: \\\\pi, \\\\theta, \\\\alpha, \\\\le, \\\\ge, ^\\\\circ (degree).
   - Fractions: \\\\frac{numerator}{denominator}.
   - Roots: \\\\sqrt{expression} or \\\\sqrt[n]{expression}.

3. **QUESTION MIX**:
   - Generate EXACTLY 8 questions total.
   - 5 questions: type "mc" (Multiple Choice, 4 options each).
   - 3 questions: type "short_answer" (Requires working steps).
   - Mix question types throughout (don't group all MC together).

4. **VISUALS (DIAGRAMS, FIGURES, TABLES)**:
   - **MANDATORY**: If the question involves Geometry, Trigonometry, Shapes (圖形), Statistics (Charts/Graphs), or Probability (Tree diagrams/Venn diagrams), OR if a figure would better illustrate the scenario, you MUST:
     1. Include "imageURL": null.
     2. Provide a descriptive label at the START of the question text: e.g., "[DIAGRAM REQUIRED: Brief description]" or "[TABLE REQUIRED: Brief description]".
     3. Provide detailed text description of the figure in the question body.
     4. **Generate a "diagram_svg" field**: This MUST be a valid SVG string (minified, single line) that visualizes the problem. 
        - Use a responsive viewBox (e.g., "0 0 400 300").
        - Use clean black lines (stroke="#000000") and white background.
        - Label points, angles, and lengths clearly using <text> elements.
        - For Bearings: Draw the North arrow and the lines from the origin.
        - For Functions: Draw the axes and the curve/line.

5. **LANGUAGE**: 
   - Generate ALL content in {{LANGUAGE}}.
   - Use proper mathematical terminology for the language.
   - For Chinese: You MUST use Traditional Chinese (繁體中文) with proper mathematical terms. NEVER use Simplified Chinese (简体中文). Use formal written style with natural HK-style context.

6. **ANSWER FORMATS**:
   - MC: "answer" must be one of the 4 options (exact match).
   - Short answer: Provide the final answer (e.g., "$x = 3$" or "$\\\\frac{5}{2}$").
   - Include detailed solution_steps for learning.

JSON SCHEMA (STRICT):
{
  "type": "MATHS",
  "topic": "{{TOPIC_NAME}}",
  "level": {{LEVEL}},
  "conceptual_explanation": "Brief overview of the concept (2-3 sentences)",
  "key_formulas": ["$formula_1$", "$formula_2$"],
  "examples": [
      { 
        "text": "Example question with LaTeX: $x^2 + 5x + 6 = 0$", 
        "solution": "Step 1: Factor... Step 2: Solve..." 
      }
  ],
  "interactive_tasks": [
    { 
      "id": "q1", 
      "type": "mc",
      "topic": "{{TOPIC_NAME}}",
      "skills": ["{{TOPIC_ID}}"],
      "text": "Question text with LaTeX: Find $x$ if $2x + 3 = 7$",
      "options": ["$x = 1$", "$x = 2$", "$x = 3$", "$x = 4$"],
      "answer": "$x = 2$",
      "solution_steps": ["Step 1: Subtract 3 from both sides: $2x = 4$", "Step 2: Divide by 2: $x = 2$"],
      "imageURL": null,
      "diagram_svg": "<svg ...>...</svg>",
      "marks": 1
    }
  ],
  "success_feedback": "Excellent work! You've mastered {{TOPIC_NAME}}!"
}

IMPORTANT REMINDERS:
- Generate EXACTLY 8 questions.
- DOUBLE backslashes for LaTeX: \\\\frac, \\\\sqrt, \\\\pi.
- All math expressions in $ signs or \\\\[ \\\\] (Note: triple backslash for block math delimiters in prompt to be safe with replace).
- Align with HK DSE syllabus standards (Form 4-6).
- Provide AT LEAST 3 lines of logic for short_answer.
- **OUTPUT MUST BE SINGLE-LINE VALID JSON. NO MARKDOWN. NO CODE BLOCKS.**
`;

class MathsLabService {

    static async generateLesson(params) {
        const db = admin.firestore();
        const { topic, level, uid, language = 'en' } = params;

        // Resolve Topic by language
        const skill = MATHS_MICRO_SKILLS[topic];
        const resolvedTopic = skill ? skill.name : (topic || 'General Maths');
        const resolvedId = skill ? skill.id : (topic || 'math_general');
        const languageName = language === 'zh' ? 'Traditional Chinese (廣東話口語化/書面語)' : 'English';
        const TARGET_COUNT = 8;

        console.log(`[MathsLabService] Generating session for: ${resolvedTopic} (Level ${level}) in ${language}`);

        try {
            // 1. Fetch Seen Question IDs for this user to ensure variety
            let seenQuestionIds = new Set();
            if (uid) {
                try {
                    const historySnapshot = await db.collection('users').doc(uid).collection('practice_history').get();
                    historySnapshot.forEach(doc => seenQuestionIds.add(doc.id));
                } catch (err) {
                    console.warn("[MathsLabService] Could not fetch user history:", err);
                }
            }

            // 2. Hybrid Strategy: Check Question Bank first
            let questions = [];
            try {
                const bankSnapshot = await db.collection('question_bank')
                    .where('topic', '==', resolvedTopic)
                    .where('level', '==', parseInt(level))
                    .limit(20)
                    .get();

                bankSnapshot.forEach(doc => {
                    if (!seenQuestionIds.has(doc.id)) {
                        questions.push({ ...doc.data(), id: doc.id });
                    }
                });

                // Shuffle and pick up to TARGET_COUNT
                questions = questions.sort(() => 0.5 - Math.random()).slice(0, TARGET_COUNT);
                console.log(`[MathsLabService] Found ${questions.length} existing questions in bank.`);
            } catch (e) {
                console.warn("[MathsLabService] Bank fetch failed:", e);
            }

            // 3. Generate remainder via AI if needed
            if (questions.length < TARGET_COUNT) {
                const neededCount = TARGET_COUNT - questions.length;
                console.log(`[MathsLabService] Need ${neededCount} more questions. Calling AI...`);

                const prompt = MATHS_LAB_PROMPT
                    .replace(/{{TOPIC_NAME}}/g, resolvedTopic)
                    .replace(/{{TOPIC_ID}}/g, resolvedId)
                    .replace('{{LEVEL}}', level)
                    .replace('{{LANGUAGE}}', languageName)
                    .replace('EXACTLY 5 questions', `EXACTLY ${neededCount} questions`);

                try {
                    let data = await GenerativeAIService.generateJson(prompt, {
                        model: "gemini-2.0-flash"
                    });

                    // Unwrapping logic (simplified here as we handle parts)
                    let newTasks = data.interactive_tasks || data.tasks || (Array.isArray(data) ? data : []);

                    const batch = db.batch();
                    newTasks.forEach(task => {
                        if (!task.text && task.question) task.text = task.question;
                        const qHash = generateQuestionHash(resolvedTopic, 'maths', task.text || task.id);
                        task.id = qHash;

                        // Save to Bank
                        const docRef = db.collection('question_bank').doc(qHash);
                        batch.set(docRef, {
                            ...task,
                            topic: resolvedTopic,
                            level: parseInt(level),
                            created_at: admin.firestore.FieldValue.serverTimestamp()
                        }, { merge: true });

                        questions.push(task);
                    });
                    await batch.commit();

                } catch (error) {
                    console.error("[MathsLabService] AI Gen failed:", error);
                    if (questions.length === 0) throw error; // Re-throw only if we have nothing
                }
            }

            return {
                type: "MATHS",
                topic: topic, // Use technical ID
                topicName: resolvedTopic, // Human-readable name
                level: parseInt(level),
                interactive_tasks: questions.slice(0, TARGET_COUNT)
            };

        } catch (error) {
            console.error("=== Maths Lab Generation Failed ===");
            console.error("Error Type:", error.constructor.name);
            console.error("Error Message:", error.message);
            console.error("Error Stack:", error.stack);
            console.error("Topic:", topic);
            console.error("Level:", level);
            console.error("Language:", language);
            console.error("===================================");
            throw error;
        }
    }

    static async explainStep(params) {
        const { question, fullSolution, targetStep, language = 'en' } = params;
        const languageName = language === 'zh' ? 'Traditional Chinese (廣東話口語化/書面語)' : 'English';

        const prompt = `You are Mr. Wong, an elite HKDSE Mathematics tutor. A student is struggling to understand a specific step in a mathematical solution.

### CONTEXT:
**Question**: 
${question}

**Full Solution Provided**:
${fullSolution}

**Target Step Needing Clarification**:
${targetStep}

### YOUR MISSION:
Explain this specific step tactically and effectively. Break down the pain points for a DSE student.

### GUIDELINES:
1. **Persona**: Speak as Mr. Wong. Be encouraging but precise. Use "DSE tactics" (e.g., "examiners often look for...", "common trap here is...").
2. **Breakdown**: 
   - Identify any underlying identities, theorems, or algebraic rules used in this step (e.g., Change of Base, Sine Rule, Completing the Square).
   - Explain the logical bridge from the PREVIOUS line to this line.
   - Mention why this step is necessary for the final answer.
3. **Clarity**: Keep it concise but deep. Use LaTeX for math.
4. **Language**: Use {{LANGUAGE}}.
   - For Chinese: Use Traditional Chinese (繁體中文). Use HK-style DSE terminology.

### OUTPUT FORMAT:
Return a JSON object:
{
  "explanation": "Your detailed explanation here with LaTeX.",
  "prerequisites": ["List of skills/concepts needed"],
  "pro_tip": "A quick DSE examiner tip related to this concept."
}

**OUTPUT MUST BE SINGLE-LINE VALID JSON. NO MARKDOWN. NO CODE BLOCKS.**`
            .replace('{{LANGUAGE}}', languageName);

        try {
            const data = await GenerativeAIService.generateJson(prompt, {
                model: "gemini-2.0-flash"
            });
            return data;
        } catch (error) {
            console.error("[MathsLabService] explainStep failed:", error);
            throw error;
        }
    }
}

module.exports = MathsLabService;
