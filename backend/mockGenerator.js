const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { JOURNALIST_PROMPT_TEMPLATE } = require('./prompts/journalistAgent');
const { EXAMINER_PROMPT_TEMPLATE } = require('./prompts/examinerAgent');
const { AUDITOR_PROMPT_TEMPLATE } = require('./prompts/auditorAgent');

const GEN_AI_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEN_AI_KEY);
const MODEL_NAME = "gemini-2.5-pro";

const OUTPUT_DIR = path.join(__dirname, 'generated_mocks');

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR);
}

// --- REUSABLE GENERATION FUNCTIONS ---
const generateSection = async (topic, sectionName, sectionConfig, previousContext = null, paperType = "Reading") => {
    console.log(`\n>>> STARTING ${sectionName} GENERATION <<<`);

    // Define Dynamic Defaults based on Paper Type
    let contentType = "Reading Passages";
    let taskDesc = "based on the provided text";

    if (paperType === "Writing") {
        contentType = "Background Scenario / Data File";
        taskDesc = "writing prompts/instructions";
    } else if (paperType === "Listening") {
        contentType = "Audio Script (Speaker Dialogue)";
        taskDesc = "listening comprehension tasks based on audio";
    } else if (paperType === "Speaking") {
        contentType = "Discussion Prompt / Individual Response";
        taskDesc = "speaking questions";
    }

    // 1. Journalist (Content Generation)
    const constraintsJournalist = `
    - Target Level: ${sectionConfig.target_level}
    - Total Word Count: ${sectionConfig.constraints.word_count_guideline || sectionConfig.constraints.total_word_count?.join('-') || "N/A"} words
    `;

    // Context Injection from Previous Sections
    let contextPrompt = "";
    if (previousContext) {
        contextPrompt = `
        IMPORTANT CONTEXT:
        - Previous Section Topics: ${previousContext.topics.join(', ')}
        - Overall Exam Theme: ${previousContext.theme}
        - INSTRUCTION: Ensure varied sub-topics. Do NOT repeat the exact content from previous sections (${previousContext.topics.join(', ')}).
        `;
    }

    const searchContext = `(Simulated Search Context: Recent real-world news about ${topic})`;
    const journalistPrompt = JOURNALIST_PROMPT_TEMPLATE
        .replace('{{PART_NAME}}', sectionName)
        .replace('{{CONTENT_TYPE}}', contentType)
        .replace('{{TOPIC}}', `${topic} ${searchContext}\n${contextPrompt}`)
        .replace('{{CONSTRAINTS}}', constraintsJournalist);

    console.log(`[Journalist] Writing ${contentType} for ${sectionName}...`);
    const jModel = genAI.getGenerativeModel({ model: MODEL_NAME, generationConfig: { responseMimeType: "application/json" } });
    const jResult = await jModel.generateContent(journalistPrompt);
    const texts = JSON.parse(jResult.response.text());
    console.log(`[Journalist] Created ${Object.keys(texts).length} resources.`);

    // 2. Examiner (Question Generation)
    // Convert mandatory types to bullet points
    let mandatoryConstraints = "";
    if (sectionConfig.mandatory_question_types) {
        mandatoryConstraints = sectionConfig.mandatory_question_types.map(m =>
            `- Must include ${m.count} x ${m.type} (${m.marks} marks each)`
        ).join('\n');
    }

    // Prepare Available Skills for Tagging
    const { getSkillsByPaper } = require('./constants/microSkills');
    const paperKeyMap = {
        "Reading": "reading",
        "Writing": "writing",
        "Listening": "listening",
        "Speaking": "speaking"
    };
    const paperKey = paperKeyMap[paperType] || "reading";
    const availableSkills = getSkillsByPaper(paperKey)
        .map(s => `- ${s.id} (${s.name}): ${s.description}`)
        .join('\n');

    // Writing Paper Special Case: "Questions" are "Prompts"
    let qCount = sectionConfig.constraints.total_questions || sectionConfig.constraints.choice_count || 1;
    let tMarks = sectionConfig.constraints.total_marks;

    const examinerConstraints = `
    - Target Marks: ${tMarks}
    - Question Count: ${qCount}
    - Mandatory Types:
    ${mandatoryConstraints}
    `;

    const examinerPrompt = EXAMINER_PROMPT_TEMPLATE
        .replace('{{PART_NAME}}', sectionName)
        .replace('{{QUESTION_COUNT}}', qCount)
        .replace('{{TASK_DESCRIPTION}}', taskDesc)
        .replace('{{CONSTRAINTS}}', examinerConstraints)
        .replace('{{TARGET_MARKS}}', tMarks)
        .replace('{{TEXTS_JSON}}', JSON.stringify(texts, null, 2))
        .replace('{{AVAILABLE_SKILLS}}', availableSkills);

    console.log(`[Examiner] Creating questions for ${sectionName}...`);
    const eModel = genAI.getGenerativeModel({ model: MODEL_NAME, generationConfig: { responseMimeType: "application/json" } });
    const eResult = await eModel.generateContent(examinerPrompt);
    let questions = JSON.parse(eResult.response.text());
    console.log(`[Examiner] Created ${questions.length} items.`);


    // 3. Auditor (Quality Control) - NEW INTELLIGENCE LAYER
    console.log(`[Auditor] Validating ${sectionName}...`);
    const auditorPrompt = AUDITOR_PROMPT_TEMPLATE
        .replace('{{PART_NAME}}', sectionName)
        .replace('{{TARGET_LEVEL}}', sectionConfig.target_level)
        .replace('{{QUESTIONS_JSON}}', JSON.stringify(questions, null, 2));

    // Note: Auditor can be expensive. We use a faster model or the same one.
    const aModel = genAI.getGenerativeModel({ model: MODEL_NAME, generationConfig: { responseMimeType: "application/json" } });
    const aResult = await aModel.generateContent(auditorPrompt);
    const auditedOutput = JSON.parse(aResult.response.text());

    if (auditedOutput.questions) {
        console.log(`[Auditor] Review Complete. ${(questions.length !== auditedOutput.questions.length) ? 'Adjusted question count.' : 'Count maintained.'}`);
        questions = auditedOutput.questions;
    } else {
        console.warn("[Auditor] Returned invalid format. Keeping Examiner output.");
    }

    // Extract Metadata for Context Passing
    // We assume 'texts' keys or content gives us sub-topic hints.
    const extractedTopics = Object.keys(texts);

    return {
        resources: texts,
        questions: questions,
        meta: {
            topics: extractedTopics
        }
    };
};


const runPipeline = async (topic, paperType = "Reading") => {
    console.log(`=== STARTING FULL MOCK GENERATION (${paperType}) ===`);
    console.log(`Topic: ${topic}`);

    const blueprintPath = path.join(__dirname, 'blueprints', `Eng_${paperType}_Blueprint.json`);
    if (!fs.existsSync(blueprintPath)) {
        console.error(`Blueprint not found: ${blueprintPath}`);
        return;
    }
    const blueprint = JSON.parse(fs.readFileSync(blueprintPath, 'utf8'));

    try {
        const fullExamData = {
            meta: {
                topic: topic,
                generated_at: new Date().toISOString(),
                module: `Module 3 (${paperType} Pipeline)`,
                blueprint_version: blueprint.meta.version,
                paper_type: paperType
            }
        };

        const context = { theme: topic, topics: [] };

        // Iterate dynamically over sections defined in blueprint
        for (const [sectionKey, sectionConfig] of Object.entries(blueprint.sections)) {
            const result = await generateSection(topic, sectionConfig.name, sectionConfig, context, paperType);
            fullExamData[sectionKey] = result;
            if (result.meta?.topics) context.topics.push(...result.meta.topics);
        }

        // Save Full Mock
        const filename = `${paperType}_${topic.replace(/\s+/g, '_')}_FullMock.json`;

        // Ensure subdirectory exists
        const subDir = paperType.toLowerCase();
        const typeDir = path.join(OUTPUT_DIR, subDir);
        if (!fs.existsSync(typeDir)) {
            fs.mkdirSync(typeDir, { recursive: true });
        }

        fs.writeFileSync(path.join(typeDir, filename), JSON.stringify(fullExamData, null, 2));
        console.log(`\n✅ FULL PIPELINE COMPLETE. Saved to ${path.join(subDir, filename)}`);

    } catch (error) {
        console.error("Pipeline Failed:", error);
    }
};

// Allow CLI execution: node mockGenerator.js "Artificial Intelligence" "Writing"
if (require.main === module) {
    const topicArg = process.argv[2] || "Hong Kong Neon Signs";
    const paperArg = process.argv[3] || "Reading"; // Default to Reading
    runPipeline(topicArg, paperArg);
}

module.exports = { runPipeline };
