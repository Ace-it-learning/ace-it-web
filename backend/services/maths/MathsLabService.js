const admin = require('firebase-admin');
const crypto = require('crypto');
const MathEngineBridge = require('./MathEngineBridge');
const GenerativeAIService = require('../GenerativeAIService');
const { MATHS_MICRO_SKILLS } = require('../../constants/mathsMicroSkills');
const { getSyllabusGuidance } = require('../../constants/mathsSyllabusRules');

// Helper: Generate Hash for Deduplication
const generateQuestionHash = (topic, type, questionText, level = '') => {
    // 1.3.3: Use longer substring (500 chars) and include level to prevent collisions on similar prose
    const str = `${topic.toLowerCase()}-${type}-${level}-${questionText.trim().substring(0, 500)}`;
    return crypto.createHash('md5').update(str).digest('hex');
};

/**
 * Deep clean an object for Firestore storage.
 * Strips undefined values, converts NaN/Infinity to null.
 */
const cleanForFirestore = (obj) => {
    if (obj === null || obj === undefined) return null;
    if (typeof obj !== 'object') {
        if (typeof obj === 'number') {
            if (isNaN(obj) || !isFinite(obj)) return null;
        }
        return obj;
    }
    if (Array.isArray(obj)) {
        return obj.map(item => cleanForFirestore(item));
    }
    const cleaned = {};
    Object.keys(obj).forEach(key => {
        const val = obj[key];
        const cleanedVal = cleanForFirestore(val);
        if (cleanedVal !== undefined) {
            cleaned[key] = cleanedVal;
        }
    });
    return cleaned;
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

const stripMetaComments = (text) => {
    if (typeof text !== 'string') return text;
    // Phrases reported by user + common AI meta-talk
    const metaPhrases = [
        /let me recalculate\.?/gi,
        /my apologies\.?/gi,
        /i made an error\.?/gi,
        /wait,?/gi,
        /actually,?/gi,
        /recalculating\.?/gi,
        /oh no,?/gi,
        /whoops,?/gi
    ];
    let result = text;
    metaPhrases.forEach(regex => {
        result = result.replace(regex, '').trim();
    });
    // Clean up double spaces or periods left behind
    return result.replace(/\s\s+/g, ' ').replace(/\.\./g, '.').trim();
};

// --- REFACTORED: Moved into class ---

/**
 * Post-process AI-generated text fields to ensure proper math delimiters.
 * This is a SAFETY NET that catches cases where the AI doesn't follow delimiter instructions.
 * It auto-wraps undelimited math expressions and fixes spacing around delimiters.
 */
const postProcessMathText = (text, isLogicField = false) => {
    if (!text || typeof text !== 'string') return text;

    let result = text;

    // Version 1.6.9: BACKSLASH NORMALIZATION (Skip if already single-escaped)
    if (result.includes('\\\\begin')) {
        result = result.replace(/\\\\+(begin|end|\[|\]|\(|\)|frac|sqrt|left|right|times|div|pm|mp|approx|neq|le|ge|triangle|sim|cong|angle|deg|parallel|circ|quad|propto|implies|qquad)/g, '\\$1');
    }

    // 0. NEWLINE NORMALIZATION: AI sometimes outputs literal \n in JSON
    // Only happens after backslashes are normalized to prevent string-escape collisions like \neq
    // Version 1.6.4: Added negative lookahead to ensure we don't shred LaTeX commands starting with 'n'
    result = result.replace(/\\n(?![a-zA-Z])/g, '\n');

    // Version 1.6.2: DELIMITER DE-NESTER
    result = result.replace(/\\begin\{([a-zA-Z*]+)\}\s*\\\[([\s\S]*?)\\\]\s*\\end\{\1\}/g, '\\[ \\begin{$1} $2 \\end{$1} \\]');
    result = result.replace(/\\begin\{([a-zA-Z*]+)\}\s*\\\(([\s\S]*?)\\\)\s*\\end\{\1\}/g, '\\[ \\begin{$1} $2 \\end{$1} \\]');

    // Version 1.6.2: ORPHAN CLEANUP (Disabled as it was stripping valid closing delimiters for block formulas)
    // result = result.replace(/\\\]\s*$/, '').replace(/\\\)\s*$/, '');

    // Version 1.6.3: DELIMITER BALANCER
    // Forcefully close unclosed display blocks at the end of the text
    const openDisplayCount = (result.match(/\\\[/g) || []).length;
    let closeDisplayCount = (result.match(/\\\]/g) || []).length;
    if (openDisplayCount > closeDisplayCount) {
        result += '\n\\]';
        console.warn('[MathsLabService] v1.6.3: Forcefully balanced unclosed display block \\[');
    }

    // Version 1.6.3: INTERNAL DELIMITER PURGE
    // Purge any illegal nested inline delimiters from inside display blocks
    result = result.replace(/\\\[([\s\S]*?)\\\]/g, (match, inner) => {
        if (!inner) return match;
        let cleanedInner = inner.replace(/\\\(/g, '').replace(/\\\)/g, '');
        return `\\[${cleanedInner}\\]`;
    });

    // 0.5 SURGICAL SELF-HEALING (v1.5.4)
    // If the AI generated \begin{aligned} but forgot \end{aligned} INSIDE math delimiters, 
    // we must inject the closer INSIDE the delimiters so KaTeX parsing matches.
    const envsToCheck = ['aligned', 'cases', 'array', 'matrix', 'pmatrix', 'bmatrix', 'vmatrix'];

    // Process content inside delimiters surgically
    result = result.replace(/(\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\))/g, (match) => {
        let content = match;
        const closingDelim = content.endsWith('\\]') ? '\\]' : '\\)';

        envsToCheck.forEach(env => {
            const begins = (content.match(new RegExp(`\\\\begin\\{${env}\\}`, 'g')) || []).length;
            const ends = (content.match(new RegExp(`\\\\end\\{${env}\\}`, 'g')) || []).length;
            if (begins > ends) {
                // Determine closing delimiter length (usually 2 for \[ or \)
                // Inject \end{env} right before the closing delimiter
                content = content.slice(0, -2) + ` \\end{${env}} ` + closingDelim;
                console.debug(`[MathsLabService] Surgically healed unclosed environment: \\begin{${env}} inside ${closingDelim}`);
            }
        });
        return content;
    });

    // Fallback: Global healing for unclosed environments outside of delimiters
    envsToCheck.forEach(env => {
        const begins = (result.match(new RegExp(`\\\\begin\\{${env}\\}`, 'g')) || []).length;
        const ends = (result.match(new RegExp(`\\\\end\\{${env}\\}`, 'g')) || []).length;
        if (begins > ends) {
            result += `\n\\end{${env}}`;
            console.debug(`[MathsLabService] Globally healed unclosed environment: \\begin{${env}}`);
        }
    });

    // 1. NORMALIZE DOUBLE BACKSLASHES (Duplicate removal already handled above)
    // result = result.replace(/\\\\+(...)/g, '\\$1');

    // 2. CONVERT ENVIRONMENTS TO DISPLAY MATH (Sync with v1.6.2 Frontend)
    // Wrap environments in \[ ... \] to prevent KaTeX inline ParseErrors.
    // [V1.6.9 FIX] SKIP if already wrapped in display delimiters to prevent nested errors like $$ \[ ... \] $$
    if (!result.includes('$$') && !result.includes('\\[')) {
        result = result.replace(/\\begin\{(align\*?|aligned|cases|array|matrix|pmatrix|bmatrix|vmatrix)\}([\s\S]*?)\\end\{\1\}/gi, (match, env, inner) => {
            const outputEnv = env.startsWith('align') ? 'aligned' : env;
            return `\\[ \\begin{${outputEnv}} ${inner} \\end{${outputEnv}} \\]`;
        });
    }

    // Version 1.6.3: SYMBOL HALLUCINATION FIX
    result = result.replace(/\^\{\\degree\}/g, '^\\circ');
    result = result.replace(/(?<!\\)x2220/g, ' ∠ ')
        .replace(/(?<!\\)x25EF/g, ' ○ ');

    // 3. SURGICAL AMPERSAND STRIPPING
    // Process line-by-line to strip naked ampersands from prose lines
    // Version 1.4.8: STATEFUL stripper that respects multiline environments
    let inEnv = false;
    result = result.split('\n').map(line => {
        const trimmed = line.trim();
        const envStart = trimmed.includes('\\begin{aligned}') || trimmed.includes('\\begin{cases}') ||
            trimmed.includes('\\begin{array}') || trimmed.includes('\\begin{matrix}');
        const envEnd = trimmed.includes('\\end{aligned}') || trimmed.includes('\\end{cases}') ||
            trimmed.includes('\\end{array}') || trimmed.includes('\\end{matrix}');

        if (envStart) inEnv = true;
        // Self-Healing
        if (/^(Step\s*\d*|Answer|Therefore|Hence|So|We|Substitute|Then|Assume|Let|Given|Since|Actually|If|Complete|Note|Using|By|From|Calculate|Determine)/i.test(trimmed)) inEnv = false;

        let processedLine = line;
        // Version 1.5.2: Intelligent Stripper (Escaped Ampersand Eradicator)
        if (!inEnv) {
            processedLine = processedLine.replace(/\\?&=\s*/g, ' = ').replace(/\\?&/g, ' ');
        } else {
            processedLine = processedLine.replace(/(?<=[a-z]{2,})\s*\\?&/gi, ' ').replace(/\\?&\s*(?=[a-z]{2,})/gi, ' ');
        }

        if (envEnd) inEnv = false;
        return processedLine;
    }).join('\n');

    // 4. NEUTRAL ZONE: Prevent nested delimiters like \[ \[ ... \] \]
    // Version 1.5.1: Added Display Wrapper for multiline environments
    result = result.replace(/\\begin\{(align\*?|aligned|cases|array|matrix|pmatrix|bmatrix|vmatrix)\}([\s\S]*?)\\end\{\1\}/g, (match, env, inner) => {
        const outputEnv = env.startsWith('align') ? 'aligned' : env;
        return `\\[ \\begin{${outputEnv}} ${inner} \\end{${outputEnv}} \\]`;
    });

    result = result.replace(/\\\[\s*\\\[/g, '\\[').replace(/\\\]\s*\\\]/g, '\\]');
    result = result.replace(/\\\(\s*\\\(/g, '\\(').replace(/\\\)\s*\\\)/g, '\\)');

    // Resolve conflicting nested delimiters
    result = result.replace(/\\\(\s*\\\[/g, '\\[').replace(/\\\]\s*\\\)/g, '\\]');

    // 5. Fix specific corrupted fragments observed in user reports
    result = result.replace(/\\?\s?aligned\s+([0-9,.]+)\}/g, ' $1');
    result = result.replace(/HK\s?[\$＄]/g, 'HK\\$');
    result = result.replace(/US\s?[\$＄]/g, 'US\\$');
    result = result.replace(/(?<![a-zA-Z])[\$＄](\d)/g, '\\$$1'); // Escape solo $ followed by digit

    // (Version 1.6.4: Legacy Redundant Collapser Removed to Preserve LaTeX Newlines)

    // 6. SPACE FIXES
    result = result.replace(/\.([A-Z])/g, '. $1');
    result = result.replace(/,([A-Z])/g, ', $1');
    result = result.replace(/\\?\)\.([A-Z])/g, '\\). $1');

    result = result.replace(/\\\\?\)([a-zA-Z\u4e00-\u9fff])/g, '\\) $1');
    result = result.replace(/([a-zA-Z\u4e00-\u9fff])\\\\?\(/g, '$1 \\(');
    result = result.replace(/\\\\?\]([a-zA-Z\u4e00-\u9fff])/g, '\\] $1');
    result = result.replace(/([a-zA-Z\u4e00-\u9fff])\\\\?\[/g, '$1 \\[');

    // 7. Auto-wrap undelimited math expressions (e.g. \frac{1}{2} -> \(\frac{1}{2}\))
    const delimiterRegex = /(\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\))/g;
    const parts = result.split(delimiterRegex);

    const processedParts = parts.map((part, index) => {
        if (index % 2 === 1) {
            // This is content inside delimiters. Apply Newline Neutralizer & Ampersand Purge (v1.5.6)
            let content = part;
            content = content.replace(/\n/g, ' ');

            // Nuclear Option (v1.5.6): Only preserve ampersands if a VALID and COMPLETE environment is present.
            const hasValidEnv = /\\begin\{(aligned|alignat|cases|array|matrix|pmatrix|bmatrix|vmatrix|align\*?|eqnarray|gather|split)\}/i.test(content);
            if (!hasValidEnv || (content.includes('&') && !content.includes('\\begin{'))) {
                content = content.replace(/\\?&/g, ' ');
            }

            return content;
        }

        // This is prose. Apply auto-wrapper and preserve original newlines.
        let processed = part;
        
        // [HARDENING] Bypass auto-wrap for sections with common English words
        if (/\b(this|that|month|was|were|been|have|has|the|and|for|from|with)\b/i.test(processed)) {
            return processed;
        }

        processed = processed.replace(/(?<![a-zA-Z])(?<!\\[(\[$])\\?\\?(log|ln|sin|cos|tan|triangle|sim|cong|angle|deg|parallel|perp|circ|odot|because|therefore|times|sqrt|frac|propto|implies|quad|neq|left|right)_?\{?[0-9a-z]*\}?\s*\(?[^)]*\)?(?:\s*[=<>\\sim\\approx\\neq\\parallel\\perp]+\s*[0-9a-z.]+)?(?![a-z0-9])(?!.*\\[)\]$])/gi, (match) => {
            // Extra safety: never wrap if it looks like it's already inside any kind of math delimiter
            if (match.includes('\\(') || match.includes('\\)') || match.includes('$') || match.includes('\\[') || match.includes('\\]')) return match;
            return ` \\(${match.trim()}\\) `;
        });
        return processed;
    });

    result = processedParts.join('');
    result = result.replace(/\s{2,}/g, ' ').trim();
    
    // Version 1.6.8: FINAL DELIMITER SAFETY (Collapse any nested delimiters)
    result = result.replace(/\\\[\s*\\\[/g, '\\[').replace(/\\\]\s*\\\]/g, '\\]');
    result = result.replace(/\\\(\s*\\\(/g, '\\(').replace(/\\\)\s*\\\)/g, '\\)');

    return result;
};

/**
 * Post-process an entire question object, applying math text fixes to all text fields.
 */
const postProcessQuestion = (qResult) => {
    if (!qResult) return qResult;

    const textFields = [
        'question', 'question_zh',
        'explanation', 'explanation_zh',
        'answer_logic', 'answer_logic_zh'
    ];

    textFields.forEach(field => {
        if (qResult[field] && typeof qResult[field] === 'string') {
            qResult[field] = postProcessMathText(qResult[field]);
        }
    });

    // Process arrays
    const arrayFields = ['solution_steps', 'solution_steps_zh', 'hints', 'hints_zh'];
    arrayFields.forEach(field => {
        if (qResult[field] && Array.isArray(qResult[field])) {
            qResult[field] = qResult[field].map(item =>
                typeof item === 'string' ? postProcessMathText(item) : item
            );
        }
    });

    // Process options
    ['options', 'options_zh'].forEach(field => {
        if (qResult[field] && Array.isArray(qResult[field])) {
            qResult[field] = qResult[field].map(item =>
                typeof item === 'string' ? postProcessMathText(item) : item
            );
        }
    });

    return qResult;
};

/**
 * Generic recursive post-processor for any object containing math text strings.
 */
const postProcessModularContent = (data, key = null) => {
    if (!data) return data;
    
    // Version 1.7.0: NARRATIVE BYPASS
    // Skip aggressive math post-processing for narrative/prose fields in briefing content.
    // This prevents 'Quad' in 'Quadratic' or 'from' in 'Progress from' from triggering auto-wrapping.
    const narrativeFields = [
        'name', 'name_zh', 'roadmap', 'roadmap_zh', 
        'key_takeaway', 'key_takeaway_zh', 'description', 'description_zh',
        'hero_image', 'visual_aid', 'visual'
    ];
    
    if (narrativeFields.includes(key)) return data;

    // Version 1.6.5: Force-wrap formula fields to prevent flaky partial auto-wrapping
    if (key === 'formula' && typeof data === 'string' && 
        !data.includes('\\(') && !data.includes('\\[') && !data.trim().startsWith('\\begin')) {
        return postProcessMathText(`\\[ ${data.trim()} \\]`);
    }

    // Version 1.6.6: PROTECTIVE SHIELD (Exclude raw visuals/diagrams/variables from math post-processing)
    if (key === 'visual' || key === 'diagram_json' || key === 'visual_aid' || key === 'variables') return data;

    if (typeof data === 'string') {
        return postProcessMathText(data);
    }
    if (Array.isArray(data)) {
        return data.map(item => postProcessModularContent(item));
    }
    if (typeof data === 'object') {
        const cleaned = {};
        Object.keys(data).forEach(k => {
            cleaned[k] = postProcessModularContent(data[k], k);
        });
        return cleaned;
    }
    return data;
};

class MathsLabService {
    // --- Matplotlib Helpers ---
    static needsMatplotlibGraph(topic, isFactory = false) {
        // Version 2.1: Respect user request to skip high-effort visual aids in Factory mode for specific topics
        if (isFactory && topic === 'math_geo_rectilinear') return false;

        const graphTopics = [
            'math_alg_functions',      // Linear, Quadratic, Exponential Graphs
            'math_geo_circle_eq',      // Circle equations (Coordinate Geo)
            'math_geo_circles',        // Circle properties (Geometry) -- NEW
            'math_trig_identities',    // Trig curves
            'math_stat_dispersion',    // Box plots, Cumulative Frequency
            'math_alg_variations',     // Variation curves (Direct/Inverse)
            'math_geo_rectilinear',     // Triangles, Polygons
            'math_alg_complex_numbers' // Argand diagrams, etc.
        ];
        return graphTopics.includes(topic);
    }

    static async renderGraphWithMatplotlib(spec, id, topic) {
        if (!spec) return null;

        return new Promise((resolve) => {
            const { spawn } = require('child_process');
            const path = require('path');
            const fs = require('fs');

            // Ensure output directory exists in backend for web access via /output static route
            const outputDir = path.join(__dirname, '..', '..', 'output');
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }

            const fileName = `${topic}_${id}.png`;
            const specFile = `${topic}_${id}.json`;
            const outputPath = path.join(outputDir, fileName);
            const specPath = path.join(outputDir, specFile);
            const webPath = `output/${fileName}`;

            // Write spec to file for safe transfer to Python
            fs.writeFileSync(specPath, JSON.stringify(spec));

            // Select script based on topic
            let scriptName = 'render_math_graph.py';
            if (topic === 'math_geo_circles') {
                scriptName = 'render_circle_geometry.py';
            }

            const scriptPath = path.join(__dirname, '..', '..', 'scripts', scriptName);
            console.log(`[MathsLabService] Matplotlib Render: Topic=${topic}, Script=${scriptName}`);

            const pythonProcess = spawn('python', [scriptPath, specPath, outputPath]);

            pythonProcess.on('close', (code) => {
                // Cleanup spec file
                try { if (fs.existsSync(specPath)) fs.unlinkSync(specPath); } catch (e) { }

                if (code === 0) {
                    console.log(`[MathsLabService] ✅ Graph generated: ${webPath}`);
                    resolve(webPath);
                } else {
                    console.error(`[MathsLabService] ❌ Matplotlib Render Failed (code ${code}) for ${id}`);
                    resolve(null);
                }
            });

            pythonProcess.stderr.on('data', (data) => {
                console.error(`[MathsLabService] Python Error: ${data}`);
            });
        });
    }


    // New method to mark question IDs as seen for a user
    static async markQuestionsSeen(uid, questionIds) {
        const db = admin.firestore();
        if (!uid || !questionIds || questionIds.length === 0 || uid === 'placeholder') return;

        const batch = db.batch();
        questionIds.forEach(qid => {
            const ref = db.collection('users').doc(uid).collection('practice_history').doc(qid);
            batch.set(ref, {
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                completed: true
            });
        });
        await batch.commit();
        console.log(`[MathsLabService] Marked ${questionIds.length} questions as seen for ${uid}`);
    }

    static DIFFICULTY_TIERS = {
        'easy': { levels: ["3"], xp: 50 },
        'medium': { levels: ["4"], xp: 75 },
        'standard': { levels: ["5"], xp: 100 },
        'elite': { levels: ["7"], xp: 150 }
    };

    static MATHS_FACTORY_CONFIG = {
        'math_num_percentages': { name: 'Percentages & Interest', engine: 'AI_Generator' },
        'math_alg_formulas': { name: 'Formulas & Substitution', engine: 'AI_Generator' },
        'math_alg_polynomials': { name: 'Polynomials', engine: 'AI_Generator' },
        'math_alg_quadratics': { name: 'Quadratic Equations', engine: 'AI_Generator' },
        'math_alg_functions': { name: 'Functions & Graphs', engine: 'AI_Generator' },
        'math_alg_variations': { name: 'Variations', engine: 'AI_Generator' },
        'math_alg_apgp': { name: 'AP & GP', engine: 'AI_Generator' },
        'math_alg_log_exp': { name: 'Log & Exp Functions', engine: 'AI_Generator' },
        'math_num_inequalities': {
            name: 'Inequalities',
            engine: 'hybrid-v1'
        },
        'math_num_ratio': { name: 'Ratio & Proportion', engine: 'AI_Generator' },
        'math_alg_complex_numbers': { name: 'Complex Numbers', engine: 'AI_Generator' },
        'math_geo_rectilinear': { name: 'Rectilinear Figures', engine: 'AI_Generator' },
        'math_geo_circles': { name: 'Circle Properties', engine: 'AI_Generator' },
        'math_alg_indices': { name: 'Laws of Indices', engine: 'AI_Generator' }
    };

    static DIFFICULTY_GUIDES = {
        '3': {
            label: 'Easy',
            guide: `- Target: HKDSE Level 3 students (weakest tier).
- Question complexity: Simple, direct application of ONE formula or definition.
- Steps to solve: 2-3 short arithmetic steps MAX.
- Example types: Find the next term, find common difference/ratio, apply T(n) = a + (n-1)d directly.
- Explanation length: 2-3 sentences. answer_logic: 3-4 lines of working MAX.
- NO multi-part questions. NO simultaneous equations. NO proofs.`
        },
        '4': {
            label: 'Medium',
            guide: `- Target: HKDSE Level 4 students.
- Question complexity: Standard application requiring 2 formulas or a small system.
- Steps to solve: 3-5 steps.
- Example types: Find sum of first n terms, find number of terms given sum, simple word problems.
- Explanation length: 3-5 sentences. answer_logic: 5-8 lines of working.`
        },
        '5': {
            label: 'DSE Standard',
            guide: `- Target: HKDSE Level 5 students.
- Question complexity: Multi-step problem requiring linking concepts.
- Steps to solve: 4-6 steps.
- Example types: AP/GP word problems, converting between sum and term formulas, finding unknowns.
- Explanation length: 4-6 sentences. answer_logic: 6-10 lines.`
        },
        '7': {
            label: 'Elite',
            guide: `- Target: HKDSE Level 5**/5* students (top tier).
- Question complexity: Challenging multi-concept problem, possibly involving proof or unusual setup.
- Steps to solve: 6+ steps.
- Example types: Convergence of infinite GP, compound AP/GP problems, optimization, proof-style.
- Explanation length: Full rigorous explanation. answer_logic: complete derivation.`
        }
    };

    static MATHS_LAB_PROMPT_TEMPLATE = `You are an expert HKDSE Mathematics tutor. Generate EXACTLY 1 practice question.

### TOPIC (STRICT — DO NOT DEVIATE):
- Topic Name: '{{TOPIC_NAME}}'
- Topic ID: {{TOPIC_ID}}
- You MUST generate a question ONLY about '{{TOPIC_NAME}}'. Do NOT generate about any other topic.

### HKDSE SYLLABUS CONSTRAINTS (CRITICAL — MUST FOLLOW):
{{SYLLABUS_GUIDANCE}}

### DIFFICULTY (CRITICAL):
Tier: {{DIFFICULTY_LABEL}} (Level {{LEVEL}})
{{DIFFICULTY_GUIDE}}

### WORKFLOW:
1. **SOLVE_SCRATCHPAD**: Use the "scratchpad" JSON field for internal reasoning, step-by-step solving, and corrections. If you make a mistake, fix it HERE.
2. **FINAL_OUTPUT**: student-facing fields ("explanation", "explanation_zh", "answer_logic", "answer_logic_zh", "solution_steps") MUST be polished, textbook-quality, and completely free of meta-comments.
3. **Tone**: Rigorous, senior DSE Math Columnist.

### STRICT CLEANLINESS RULES:
- NEVER include phrases like "Let me recalculate", "My apologies", "I made an error", "Wait", "Actually", "Oh", "Recalculating".
- The final fields must look like they were written by an expert who got it right the first time.
- If you find an error during your internal process, SILENTLY correct it and only output the correct version.
- DO NOT explain your thought process or corrections outside the "scratchpad".

### GEOMETRIC CORRECTNESS (CRITICAL — READ CAREFULLY):
1. **Geometric Integrity**: Ensure the described geometry is physically possible. Distinct points on a circle circumference cannot be collinear.
2. **Exterior Points**: For points outside a circle (e.g., tangents meet at P), calculate or estimate their absolute "pos": [x, y] coordinates. Do NOT use "angle" for non-circumference points.
3. **Consistency**: Ensure the coordinates in "diagram_json" match the mathematical values in your "question" and "answer_logic".

### MATH FORMATTING (CRITICAL — READ CAREFULLY):
1. **Delimiters are MANDATORY**: Every math expression MUST be wrapped in \\\\( ... \\\\) for inline or \\\\[ ... \\\\] for block display.
2. **Prose words MUST NEVER be inside delimiters**. Only math symbols, numbers, and variables go inside.
3. **Spaces around delimiters**: Always put a space before \\\\( and after \\\\), and before \\\\[ and after \\\\].
4. **LaTeX commands**: Use single backslash (e.g. \\\\log, \\\\frac, \\\\sqrt, \\\\parallel, \\\\degree). Always use \\\\log not just "log", and \\\\parallel for parallel lines. Use \\\\degree for angles.
5. **Currency**: Use \\\\text{HK\\$} inside math. NEVER use bare $ anywhere.
6. **Bilingual**: English + Traditional Chinese (繁體中文).

#### CORRECT EXAMPLES:
- "Given that \\\\( \\\\log_2 3 = a \\\\) and \\\\( \\\\log_3 5 = b \\\\), express \\\\( \\\\log_6 45 \\\\) in terms of \\\\( a \\\\) and \\\\( b \\\\)."
- "If \\\\( x = 3 \\\\), find the value of \\\\( 2x^2 + 5 \\\\)."
- "Step 1: Substitute \\\\( x = 2 \\\\) into the equation."
- "Therefore, \\\\( y = 3^3 = 27 \\\\)."
- "The sum to \\\\( n \\\\) terms is \\\\( S_n = \\\\frac{n}{2}(a + l) \\\\)."
- "Since \\\\( AB \\\\parallel DC \\\\) and \\\\( \\\\triangle ABE \\\\sim \\\\triangle DCE \\\\), we have \\\\( \\\\frac{AB}{DC} = \\\\frac{BE}{CE} \\\\)."

#### WRONG EXAMPLES (NEVER DO THIS):
- "Given that \\\\( \\\\log_2 3 = a and \\\\log_3 5 = b, express \\\\log_6 45 in terms of a and b \\\\)." ← WRONG: prose inside delimiters
- "log_2(3) = a and log_3(5) = b" ← WRONG: no delimiters at all
- "\\\\( \\\\log_2 3 = a \\\\)and\\\\( \\\\log_3 5 = b \\\\)" ← WRONG: no space around delimiters

### JSON SCHEMA:
{
  "type": "mc | short_answer",
  "scratchpad": "Internal reasoning & corrections. Put your mistakes and self-corrections here ONLY.",
  "question": "English question with LaTeX (every math expression wrapped in delimiters)",
  "question_zh": "繁體中文 question with LaTeX (every math expression wrapped in delimiters)",
  "options": ["A: ...", "B: ...", "C: ...", "D: ..."],
  "options_zh": ["A: ...", "B: ...", "C: ...", "D: ..."],
  "answer": "Exact string from options (for MC) OR the numeric/expression value (for short_answer)",
  "answer_letter": "A|B|C|D (MC only, null for short_answer)",
  "solution_steps": ["Step 1 derivation", "Step 2 derivation", "Step 3 derivation"],
  "solution_steps_zh": ["繁體中文 Step 1 derivation", "繁體中文 Step 2 derivation", "繁體中文 Step 3 derivation"],
  "hints": ["Hint 1: Conceptual nudge", "Hint 2: Relevant formula", "Hint 3: Specific strategy"],
  "hints_zh": ["提示 1: 概念引導", "提示 2: 相關公式", "提示 3: 具體解題策略"],
  "explanation": "Confident textbook answer key with proper delimiters. NO self-corrections.",
  "explanation_zh": "繁體中文 explanation with proper delimiters. NO self-corrections.",
  "answer_logic": "Rigorous, clean derivation with proper delimiters. NO meta-reasoning.",
  "answer_logic_zh": "繁體中文 derivation with proper delimiters. NO meta-reasoning.",
  "diagram_json": "null OR a valid JSON object matching the requested specification for geometric/graphical topics."
}

### SCENARIO SEED:
{{ SEED }}

### RECENTLY GENERATED QUESTIONS (DO NOT DUPLICATE):
The following questions already exist in the bank for this specific topic and level.
You MUST generate a NEW question that is LOGICALLY DISTINCT from these.
- DO NOT use the same scenario or identical parameters.
- DO NOT just change numeric values.
- If existing questions are all "direct calculation", try a "word problem" or "find unknown variable" type.
- Ensure the complexity is appropriate for Level {{LEVEL}}.

Existing questions:
{{RECENT_QUESTIONS_CONTEXT}}

### FINAL RULES:
1. NO meta-comments ("Wait", "Error", "Recalculate", "Apologies").
2. SILENTLY ADAPT if the seed is impossible. NEVER complain in output.
3. For Level 4+, prefer 'short_answer' type unless it is a multi-step logic problem better suited for MC.
4. If type is 'short_answer', the 'answer' field MUST NOT include any 'A:', 'B:' prefixes.
5. 'solution_steps' must be a list of 2-5 bite-sized mathematical steps WITH PROPER DELIMITERS.
6. Every math expression in EVERY field must use \\\\( ... \\\\) or \\\\[ ... \\\\] delimiters. No exceptions.
7. Prose and English/Chinese words must ALWAYS be OUTSIDE delimiters with proper spacing.
8. Valid JSON only.
9. FOR GEOMETRY TOPICS: You MUST provide a detailed "diagram_json" field as specified in the SYLLABUS_GUIDANCE. This is NOT optional.
`;

    static async generateScenarioSeeds(topicName, count, topicId) {
        console.log(`[MathsLabService] Generating ${count} scenario seeds for variety(Topic: ${topicName})...`);
        const syllabusGuidance = getSyllabusGuidance(topicId || '');
        const prompt = `Generate ${count} HIGHLY DIVERSE and UNIQUE scenario seeds for HKDSE math practice questions STRICTLY about '${topicName}'.
Each seed MUST describe a COMPLETELY DIFFERENT geometric configuration, algebraic structure, or numeric setup.
For Geometry topics, explicitly dictate DIFFERENT diagram setups in each seed (e.g., Seed 1: A cyclic quadrilateral with diagonals. Seed 2: A tangent meeting a secant outside the circle. Seed 3: Intersecting chords forming 'bowtie' triangles. Seed 4: A semicircle with an inscribed triangle). AVOID generating the exact same basic shape twice.
The seeds must ONLY be about '${topicName}'. Do NOT include seeds about other math topics.

### HKDSE SYLLABUS SCOPE (seeds MUST stay within this scope):
${syllabusGuidance}

Return as a JSON array of strings.`;

        try {
            const result = await GenerativeAIService.generateJson(prompt, { model: "gemini-1.5-pro" });
            const data = result.data;
            return Array.isArray(data) ? data : (data.seeds || []);
        } catch (err) {
            console.error("[MathsLabService] Error generating scenario seeds:", err);
            return [];
        }
    }

    static async generateLesson(params) {
        const db = admin.firestore();
        const { topic, level, uid, language = 'en', targetCount, isFactory, clusterId, batchId } = params;
        const numericLevel = parseInt(level);
        const isIntegrated = (topic === 'integrated_challenge');

        // VERSION 2.2: Mock Paper Batching
        if (isIntegrated && batchId) {
            const MathsMockService = require('./MathsMockService');
            try {
                return await MathsMockService.getMockPaper(batchId, language);
            } catch (e) {
                console.error("[MathsLabService] Mock batch fetch failed:", e);
                // Fallback to normal integrated logic below
            }
        }

        const TARGET_COUNT = isIntegrated ? 8 : (targetCount || 5);

        // 1. Fetch seen questions to avoid duplication
        let seenQuestionIds = new Set();
        if (uid && uid !== 'placeholder') {
            try {
                const historySnapshot = await db.collection('users').doc(uid).collection('practice_history').get();
                historySnapshot.forEach(doc => seenQuestionIds.add(doc.id));
                console.log(`[MathsLabService] User ${uid} has seen ${seenQuestionIds.size} questions.`);
            } catch (historyErr) {
                console.warn(`[MathsLabService] Failed to fetch practice history for ${uid}:`, historyErr);
            }
        }

        // 2. FETCH-FIRST: Check Bank for Approved & Released questions
        // Version 1.3.1: Bypass bank fetch in factory mode to ensure NEW questions are generated for audit.
        try {
            if (!isFactory) {
                const isIntegrated = topic === 'integrated_challenge'; // Quest Mission
                const collectionName = isIntegrated ? 'integrated_challenges' : 'question_bank';
                
                console.log(`[MathsLabService] Fetch-First (Strict) check for ${topic} (Level ${level}) from ${collectionName}`);
                
                let query = db.collection(collectionName);
                
                if (isIntegrated) {
                    // Quest missions use 'status' instead of 'is_approved' as per schema
                    query = query.where('status', '==', 'approved');
                } else {
                    query = query.where('topic_id', '==', topic)
                                 .where('level', '==', numericLevel)
                                 .where('is_approved', '==', true);
                }

                let bankSnapshot = await query.limit(50).get();

                // Version 1.3.5: Level Fallback Logic (Only for standard bank)
                if (!isIntegrated && bankSnapshot.empty && numericLevel < 3) {
                    console.log(`[MathsLabService] Bank empty for Level ${numericLevel}. Falling back to Level 3 starter questions.`);
                    bankSnapshot = await db.collection('question_bank')
                        .where('topic_id', '==', topic)
                        .where('level', '==', 3)
                        .where('is_approved', '==', true)
                        .limit(50)
                        .get();
                }

                let unseenQuestions = [];
                let seenQuestions = [];
                
                // Fetch user mastery to check prerequisites for quests
                let userMasteryValues = {};
                if (isIntegrated && uid && uid !== 'placeholder') {
                    try {
                        // FIX: Progress is stored in subcollection users/{uid}/progress/maths
                        const progressDoc = await db.collection('users').doc(uid).collection('progress').doc('maths').get();
                        if (progressDoc.exists) {
                            const mathSkills = progressDoc.data()?.microSkills || {};
                            Object.keys(mathSkills).forEach(tid => {
                                userMasteryValues[tid] = mathSkills[tid].level || 0;
                            });
                        }
                    } catch (mErr) {
                        console.error("[MathsLabService] Failed to fetch mastery for prerequisites:", mErr);
                    }
                }

                let eligibleQuestions = [];
                let backfillPool = [];

                bankSnapshot.forEach(doc => {
                    let data = doc.data();
                    
                    data = {
                        ...data,
                        id: doc.id,
                        text: data.question_en || data.text,
                        text_zh: data.question_zh || data.text_zh,
                        solution_steps: data.solution_steps_en || data.solution_steps,
                        solution_steps_zh: data.solution_steps_zh || data.answer_logic_zh || data.solution_steps_zh,
                        explanation: data.explanation_en || data.explanation,
                        explanation_zh: data.explanation_zh || data.explanation_zh
                    };

                    // Check prerequisites
                    const prerequisites = data.prerequisite_topics || [];
                    const isEligible = prerequisites.every(pt => (userMasteryValues[pt] || 0) >= 3);
                    
                    if (isEligible) {
                        eligibleQuestions.push(data);
                    } else {
                        backfillPool.push(data);
                    }
                });

                // Shuffle pools for randomness
                eligibleQuestions.sort(() => 0.5 - Math.random());
                backfillPool.sort(() => 0.5 - Math.random());

                if (eligibleQuestions.length > 0 || backfillPool.length > 0) {
                    let finalQuestions = [];
                    
                    if (isIntegrated) {
                        // Option B: Prioritize 4 SA + 4 MC from ELIGIBLE pool
                        const saEligible = eligibleQuestions.filter(q => !['mc', 'mcq'].includes(q.type));
                        const mcEligible = eligibleQuestions.filter(q => ['mc', 'mcq'].includes(q.type));
                        
                        const saSelected = saEligible.slice(0, 4);
                        const mcSelected = mcEligible.slice(0, 4);
                        
                        finalQuestions = [...saSelected, ...mcSelected];

                        // Backfill if needed to reach exactly 8 questions
                        if (finalQuestions.length < 8) {
                            // 1. Try extra eligible questions (of any type)
                            const extraEligible = eligibleQuestions.filter(q => !finalQuestions.some(fq => fq.id === q.id));
                            finalQuestions = [...finalQuestions, ...extraEligible.slice(0, 8 - finalQuestions.length)];
                        }

                        if (finalQuestions.length < 8) {
                            // 2. Backfill with "Stretch" questions (Ineligible) to ensure student hits the 8-question target
                            finalQuestions = [...finalQuestions, ...backfillPool.slice(0, 8 - finalQuestions.length)];
                        }
                    } else {
                        // Standard practice logic
                        const finalPool = [
                            ...eligibleQuestions.filter(q => !seenQuestionIds.has(q.id)),
                            ...eligibleQuestions.filter(q => seenQuestionIds.has(q.id))
                        ];
                        finalQuestions = finalPool.slice(0, TARGET_COUNT);
                    }

                    console.log(`[MathsLabService] SUCCESS: Served ${finalQuestions.length} questions from bank (Topic: ${topic}, Count: ${finalQuestions.length}).`);
                    return {
                        type: "MATHS",
                        topic: topic,
                        level: numericLevel,
                        interactive_tasks: finalQuestions,
                        source: 'bank'
                    };
                }
            }

            // 2.5 LOCKDOWN: If not in factory mode and bank is truly empty (0 approved questions),
            // or if the pooled results were somehow 0 despite non-isFactory mode,
            // then we refuse slow AI generation for standard students.
            if (!isFactory) {
                console.log(`[MathsLabService] LOCKDOWN: No approved/released questions for ${topic}. Refusing slow generation for student.`);
                return {
                    type: "MATHS",
                    topic: topic,
                    level: numericLevel,
                    interactive_tasks: [],
                    error: "BANK_EMPTY",
                    message: "Our AI tutors are still preparing questions for this specific topic and level. Please try another topic or check back later!"
                };
            }

            console.log(`[MathsLabService] Bank empty. User is admin/factory: Proceeding to AI Generation...`);
        } catch (bankErr) {
            console.error("[MathsLabService] Bank fetch failed:", bankErr);
        }

        // 2.6 RECENT CONTEXT: Fetch a small pool of existing questions to avoid AI-duplication
        let recentQuestionsContext = "None yet.";
        try {
            const recentSnapshot = await db.collection('question_bank')
                .where('topic_id', '==', topic)
                .where('level', '==', numericLevel)
                .where('is_approved', '==', true)
                .orderBy('created_at', 'desc')
                .limit(10)
                .get();

            if (!recentSnapshot.empty) {
                const contextPool = [];
                recentSnapshot.forEach(doc => {
                    const q = doc.data().question;
                    if (q) contextPool.push(`- ${q.substring(0, 200)}...`);
                });
                recentQuestionsContext = contextPool.join('\n');
            }
        } catch (ctxErr) {
            console.warn("[MathsLabService] Failed to fetch recent context (ignoring):", ctxErr.message);
        }

        // 3. HYBRID GENERATION (FALLBACK)
        if (MathsLabService.MATHS_FACTORY_CONFIG[topic]) {
            const config = MathsLabService.MATHS_FACTORY_CONFIG[topic];
            console.log(`[MathsLabService] Hybrid Engine Mode: ${config.engine} for ${topic}.`);

            const seeds = await this.generateScenarioSeeds(config.name, TARGET_COUNT, topic);
            const questions = [];

            // Version 2.0: Sequential generation with gemini-1.5-pro for highest quality
            // Generate one question at a time to avoid rate limits on Pro model
            for (let i = 0; i < TARGET_COUNT; i++) {
                const seed = seeds[i] || "General numeric example";
                try {
                    const diffInfo = MathsLabService.DIFFICULTY_GUIDES[String(numericLevel)] || MathsLabService.DIFFICULTY_GUIDES['5'];
                    let syllabusGuidance = getSyllabusGuidance(topic);

                    // Version 2.1: If visual aids are disabled for this topic/mode, remove "MANDATORY diagram" requirements from prompt
                    if (!MathsLabService.needsMatplotlibGraph(topic, isFactory)) {
                        syllabusGuidance = syllabusGuidance.replace(/- MANDATORY REQUIREMENT: Provide a "diagram_json" for ALL geometric configurations\./g, '');
                        syllabusGuidance = syllabusGuidance.replace(/- MANDATORY: Provide a highly detailed "diagram_json" featuring dashed lines (strokeDasharray: "5,5") for hidden interior lines in 3D\./g, '');
                    }

                    const prompt = MathsLabService.MATHS_LAB_PROMPT_TEMPLATE
                        .replace(/\{\{TOPIC_NAME\}\}/g, config.name)
                        .replace('{{TOPIC_ID}}', topic)
                        .replace('{{LEVEL}}', level)
                        .replace('{{DIFFICULTY_LABEL}}', diffInfo.label)
                        .replace('{{DIFFICULTY_GUIDE}}', diffInfo.guide)
                        .replace('{{SYLLABUS_GUIDANCE}}', syllabusGuidance)
                        .replace('{{ SEED }}', seed)
                        .replace('{{RECENT_QUESTIONS_CONTEXT}}', recentQuestionsContext);

                    console.log(`[MathsLabService] 🔬 Generating question ${i + 1}/${TARGET_COUNT} with gemini-1.5-pro...`);
                    const result = await GenerativeAIService.generateJson(prompt, { model: "gemini-1.5-pro" });
                    let qResult = Array.isArray(result) ? result[0] : result;

                    if (qResult && qResult.question) {
                        // Sanitization: Strip meta-comments from AI-generated text fields
                        const fieldsToSanitize = ['explanation', 'explanation_zh', 'answer_logic', 'answer_logic_zh'];
                        fieldsToSanitize.forEach(field => {
                            if (qResult[field]) qResult[field] = stripMetaComments(qResult[field]);
                        });
                        if (qResult.solution_steps && Array.isArray(qResult.solution_steps)) {
                            qResult.solution_steps = qResult.solution_steps.map(step => stripMetaComments(step));
                        }

                        // Post-process: Fix math delimiters and spacing
                        qResult = postProcessQuestion(qResult);

                        const qHash = generateQuestionHash(topic, 'factory', qResult.question, numericLevel);

                        // 1.3.3 SAFETY: Check if quest already exists and is APPROVED. 
                        // If so, DO NOT overwrite it with a pending version (avoids "rollbacks").
                        try {
                            const existingDoc = await db.collection('question_bank').doc(qHash).get();
                            if (existingDoc.exists && existingDoc.data().is_approved) {
                                console.log(`[MathsLabService] 🛡️ Question collision: "${qHash}" already approved. Skipping overwrite.`);
                                questions.push({ ...existingDoc.data(), id: qHash });
                                continue;
                            }
                        } catch (collisionErr) {
                            console.warn(`[MathsLabService] Collision check failed for ${qHash}:`, collisionErr.message);
                        }

                        const diagramUrl = MathsLabService.needsMatplotlibGraph(topic, isFactory) ?
                            await MathsLabService.renderGraphWithMatplotlib(qResult.diagram_json || qResult.graph_spec, qHash, topic) :
                            null;

                        const quest = {
                            ...qResult,
                            diagram_json: qResult.diagram_json ? JSON.stringify(qResult.diagram_json) : null,
                            id: qHash,
                            topic: config.name,
                            topic_id: topic,
                            level: numericLevel,
                            subject: 'Maths',
                            diagram_url: diagramUrl,
                            created_at: new Date().toISOString(),
                            is_approved: !isFactory,
                            is_factory: true
                        };

                        // FINAL SAFETY: Clean for Firestore to prevent "invalid nested entity" or undefined errors
                        const cleanedQuest = cleanForFirestore(quest);

                        await db.collection('question_bank').doc(qHash).set(cleanedQuest);
                        questions.push(cleanedQuest);
                        console.log(`[MathsLabService] ✅ Question ${i + 1}/${TARGET_COUNT} generated successfully.`);
                    } else {
                        console.warn(`[MathsLabService] ⚠️ Question ${i + 1}/${TARGET_COUNT} returned empty result.`);
                    }
                } catch (err) {
                    console.error(`[MathsLabService] ❌ Question ${i + 1}/${TARGET_COUNT} failed:`, err.message);
                }

                // Rate-limit protection: Wait 3 seconds between requests for Pro model
                if (i < TARGET_COUNT - 1) {
                    console.log(`[MathsLabService] ⏳ Waiting 3s before next generation (rate-limit protection)...`);
                    await new Promise(resolve => setTimeout(resolve, 3000));
                }
            }

            return {
                type: "MATHS",
                topic: topic,
                level: numericLevel,
                interactive_tasks: questions,
                source: 'ai_hybrid'
            };
        }

        return {
            type: "MATHS",
            topic: topic,
            level: numericLevel,
            interactive_tasks: [],
            error: "Topic not configured for generation and bank empty."
        };
    }

    static async getLearningContent(topicId, language = 'en') {
        const admin = require('firebase-admin');
        const db = admin.firestore();

        try {
            // Check Firestore for modular content
            const docRef = db.collection('learning_content').doc(topicId);
            const docSnap = await docRef.get();

            if (docSnap.exists) {
                console.log(`[MathsLabService] Loaded modular content for ${topicId} from Firestore (Applying Post-Processor)`);
                return postProcessModularContent(docSnap.data());
            }
        } catch (error) {
            console.error(`[MathsLabService] Error fetching learning content for ${topicId}:`, error);
        }

        // Generic fallback if not in Firestore
        const isChinese = language === 'zh' || language === 'zh-HK';

        return {
            name: "Learning Brief",
            name_zh: "學習簡報",
            roadmap: isChinese ? "此主題的學習路徑即將推出。" : "Mastery roadmap for this topic is coming soon.",
            content_en: {
                concept: "Learning content for this topic is being prepared by our AI tutors.",
                methodology: "Step-by-step methodology will be available shortly.",
                tips: "Expert tips are being curated.",
                traps: "DSE traps are being analyzed."
            },
            content_zh: {
                concept: "AI 導師正在準備此主題的學習內容。",
                methodology: "詳細的解題步驟即將推出。",
                tips: "專家提示正在編寫中。",
                traps: "DSE 考試陷阱正在分析中。"
            }
        };
    }

    static async getHint(params) {
        const { question, question_zh, topic, level } = params;
        console.log(`[MathsLabService] Generating 3 progressive structured hints for: ${topic} (Level ${level})`);

        const prompt = `[CONTEXT]
You are an elite HKDSE Mathematics AI Tutor. Your task is to generate 3 progressive, highly specific, and pedagogically RICH hints for a given math problem. The hints are tied to an XP gamification system and an interactive WYSIWYG editor.

### THE PROBLEM:
EN: ${question}
ZH: ${question_zh || question}

[STRICT RULES FOR HINTS]
1. ABSOLUTELY NO GENERIC ADVICE. You MUST use the exact numbers and variables from the user's specific problem.
2. All math in "content_en" and "content_zh" must be wrapped in $ ... $ for inline display.
3. HINTS 2 AND 3 MUST BE HIGHLY DETAILED. Do not just give a brief description. You MUST include the specific formula/equation you are about to insert into the editor in the text description as well.

- HINT 1 (Cost: 0 XP - "The Strategy"):
  Tell the student exactly what mathematical operation to perform first using the specific variables.
  CRITICAL: The \`editor_insert_latex\` MUST be a MULTI-LINE string showing the very first step (e.g., substitution or division).
  Example Text: "Let $y = 5^x$ to rewrite the equation $5^{2x} - 6(5^x) + 5 = 0$ in simpler terms."
  Example \`editor_insert_latex\`: "\\\\text{Let } y = 5^x"

- HINT 2 (Cost: 5 XP - "The Setup Template"):
  Provide a DETAILED explanation of the setup. Include the specific equation in the text.
  CRITICAL: The \`editor_insert_latex\` MUST be a MULTI-LINE string showing the full progression of the setup, separated by \`\\\\newline\`. Use \`\\\\square\` or \`\\\\dots\` for the blanks.
  Example Text: "Substitute $y = 2^x$ into the equation $2^{2x} - 5(2^x) + 4 = 0$ to form the quadratic equation $y^2 - 5y + 4 = 0$, then prepare to factorize it."
  Example \`editor_insert_latex\`: "y^2 - 5y + 4 = 0 \\\\newline (y - 4)(y - 1) = 0 \\\\newline y = \\\\square \\\\text{ or } y = \\\\square"

- HINT 3 (Cost: 10 XP - "The Execution Template"):
  Provide a DETAILED explanation of the continued working and back-substitution. Include the intermediate steps in the text.
  CRITICAL: The \`editor_insert_latex\` MUST be a MULTI-LINE string continuing the math from Hint 2, leading up to the final answer blank.
  Example Text: "Now substitute $2^x$ back in for $y$, leading to $2^x = 4$ or $2^x = 1$. Use logarithms or power-comparison to solve for $x$."
  Example \`editor_insert_latex\`: "2^x = 4 \\\\text{ or } 2^x = 1 \\\\newline x = \\\\log_2 4 \\\\text{ or } x = \\\\log_2 1 \\\\newline x = 2 \\\\text{ or } x = \\\\dots"

[REQUIRED JSON SCHEMA]
Output ONLY a valid JSON object matching this schema. Double-escape all LaTeX backslashes (e.g., \\\\newline, \\\\log, \\\\square).

{
  "hints": [
    {
      "level": 1,
      "cost_xp": 0,
      "content_en": "string",
      "content_zh": "string (Traditional Chinese - HK Style)",
      "editor_insert_latex": "string (Multi-line KaTeX using \\\\newline)"
    },
    {
      "level": 2,
      "cost_xp": 5,
      "content_en": "string",
      "content_zh": "string (Traditional Chinese - HK Style)",
      "editor_insert_latex": "string (Multi-line KaTeX using \\\\newline)"
    },
    {
      "level": 3,
      "cost_xp": 10,
      "content_en": "string",
      "content_zh": "string (Traditional Chinese - HK Style)",
      "editor_insert_latex": "string (Multi-line KaTeX using \\\\newline)"
    }
  ]
}
Return valid JSON only. NO EXPLANATORY TEXT.`;

        try {
            const result = await GenerativeAIService.generateJson(prompt, { model: "gemini-2.0-flash" });
            const data = result.data;

            // Validate the new schema shape
            if (data && data.hints && Array.isArray(data.hints)) {
                // Harden the data: ensure levels are numbers, costs are numbers
                const hardenedHints = data.hints.map((h, i) => ({
                    level: Number(h.level) || i + 1,
                    cost_xp: i === 0 ? 0 : i === 1 ? 5 : 10,
                    content_en: h.content_en || "No English hint provided.",
                    content_zh: h.content_zh || h.content_en || "未提供中文提示。",
                    editor_insert_latex: h.editor_insert_latex || null
                }));
                return { hints: hardenedHints };
            }

            // Fallback if data structure is slightly off
            const rawHints = data.hints || [];
            return {
                hints: rawHints.map((h, i) => ({
                    level: i + 1,
                    cost_xp: i === 0 ? 0 : i === 1 ? 5 : 10,
                    content_en: typeof h === 'string' ? h : (h?.content_en || "Study the formula."),
                    content_zh: h?.content_zh || h?.content_en || "請研究公式。",
                    editor_insert_latex: h?.editor_insert_latex || null
                }))
            };
        } catch (err) {
            console.error("[MathsLabService] Error generating structured hints:", err);
            const isAPGP = (topic || '').includes('apgp');
            return {
                hints: [
                    { level: 1, cost_xp: 0, content_en: isAPGP ? "Identify the first term $a$ and common difference $d$ (or ratio $r$) from the question." : "Review the question's core values.", content_zh: isAPGP ? "從題目中找出首項 $a$ 及公差 $d$（或公比 $r$）。" : "查看題目的核心數值。", editor_insert_latex: null },
                    { level: 2, cost_xp: 5, content_en: isAPGP ? "Apply the formula for terms ($T_n$) or sum ($S_n$) using the identified values." : "Identify the correct formula to use.", content_zh: isAPGP ? "使用所選的各項 ($T_n$) 或求和 ($S_n$) 公式並代入數值。" : "找出並應用正確的公式。", editor_insert_latex: isAPGP ? "S_n = \\frac{n}{2}[2a+(n-1)d]" : null },
                    { level: 3, cost_xp: 10, content_en: isAPGP ? "Solve the resulting equation or inequality to find the final answer." : "Solve for the target variable.", content_zh: isAPGP ? "解出所得的方程式或不等式以求得最終答案。" : "解出目標變數。", editor_insert_latex: null }
                ]
            };
        }
    }

    static async explainStep(params) {
        const { question, fullSolution, targetStep, language = 'en' } = params;
        console.log(`[MathsLabService] Explaining step...`);

        const prompt = `You are an expert HKDSE Mathematics tutor. A student has asked you to explain a specific step in a math solution.

### ORIGINAL QUESTION:
${question}

### FULL SOLUTION:
${fullSolution}

### THE STEP THE STUDENT WANTS EXPLAINED:
${targetStep}

### INSTRUCTIONS:
1. Explain exactly how this specific step is derived from the previous steps, or what mathematical rule/formula is being applied.
2. Provide 1 to 3 "prerequisites" (short phrases) that are needed to understand this step (e.g., "Laws of Indices", "Factor Theorem").
3. Provide a short "pro_tip" or common pitfall to watch out for.
4. If there is math in your explanation, YOU MUST format it for LaTeX using single $ ... $ for inline math and double $$ ... $$ for blocks. Do NOT use \\( or \\[.
5. Provide the output strictly in ${language === 'zh' ? 'Traditional Chinese (繁體中文 - HK style)' : 'English'}.
6. CRITICAL: Because you are generating JSON, you MUST double-escape all LaTeX backslashes (e.g. use \\\\delta instead of \\delta, \\\\frac instead of \\frac). Failure to do so will break JSON parsing and math symbols!

Return ONLY valid JSON matching this schema:
{
  "prerequisites": ["Concept 1", "Concept 2"],
  "explanation": "Detailed explanation of exactly what is happening in this step.",
  "pro_tip": "A brief helpful tip or common DSE trap."
}`;

        try {
            const result = await GenerativeAIService.generateJson(prompt, { model: "gemini-2.0-flash" });
            const data = result.data;
            return {
                prerequisites: data.prerequisites || [],
                explanation: data.explanation || "This step follows from the previous mathematical logic.",
                pro_tip: data.pro_tip || ""
            };
        } catch (err) {
            console.error("[MathsLabService] Error explaining step:", err);
            return {
                prerequisites: [],
                explanation: "Sorry, I encountered an error trying to explain this step.",
                pro_tip: ""
            };
        }
    }

    static async gradeShortAnswers(questions, answers, language = 'en', imageAnswers = {}) {
        const admin = require('firebase-admin');
        console.log(`[MathsLabService] AI Grading ${questions.length} answers in ${language}...`);

        // Filter out MC questions as they are graded exactly by frontend/backend logic
        const shortAnswerQuestions = questions.filter(q => q.type !== 'mc' && q.type !== 'mcq');
        if (shortAnswerQuestions.length === 0) return [];

        const gradingPromises = shortAnswerQuestions.map(async (q) => {
            const userAnswer = answers[q.id] || "No answer provided";
            const hasImage = !!imageAnswers[q.id];
            const maxScore = q.marks || 3;
            const officialAnswer = String(q.correct_answer || q.answer || '').trim();

            const clean = (str) => String(str || '')
                .replace(/²/g, '2').replace(/³/g, '3') // Normalize superscripts
                .replace(/\\text\{|\\\}|[\$\\\(\)\s,;°\^\[\]\{\}=\*²³]|deg|degree|cm|units|area|angle/gi, '')
                .toLowerCase();

            // [PASSPORT CHECK] If generated by Audit Mode, force full marks
            const isPassport = String(userAnswer || '').includes('[PASSPORT: AUDIT_VERIFIED]');
            
            const cu = clean(userAnswer);
            const co = clean(officialAnswer);

            // [HARDENING] Segment Matcher: Split by /[;,]/ and check each part
            const segments = officialAnswer.split(/[;,]/).map(s => clean(s)).filter(s => s.length > 2);
            const allSegmentsFound = segments.length > 0 && segments.every(seg => cu.includes(seg));

            // If the user's answer is exactly the answer string, includes the passport, or no image, skip AI
            if (isPassport || (!hasImage && (cu === co || allSegmentsFound || (co.length > 3 && cu.includes(co))))) {
                return {
                    id: q.id,
                    isCorrect: true,
                    score: maxScore,
                    maxScore: maxScore,
                    feedback: language === 'zh' ? "完全正確！" : "Perfect match!"
                };
            }

            const promptText = `You are an expert HKDSE Mathematics scorer. Grade the student's answer against the official key.
            
### QUESTION:
${q.text || q.question}

### OFFICIAL ANSWER KEY:
Final Answer: ${officialAnswer}
Working/Steps: ${q.solution_steps ? q.solution_steps.join('\n') : "N/A"}

### STUDENT'S ANSWER:
${hasImage ? `[The student has uploaded a handwritten image of their working steps and answer. Please read the handwriting carefully from the attached image.]` : ''}
${userAnswer && userAnswer !== "No answer provided" ? `Text answer: ${userAnswer}` : ''}

### SCORING GUIDELINES:
1.  **Flexibility and Fairness (CRITICAL):** The official Working/Steps is just ONE model. If the student uses a different, mathematically valid approach or consolidates 5 steps into 3, award FULL MARKS if the logic is correct and the final answer is reached.
2.  **Max Score:** ${maxScore}.
3.  **Accuracy over Verbatim:** Do NOT penalize for different notation ($1/2$ vs $0.5$) or formatting.
4.  **Full Credit:** If final answer is mathematically equivalent and supporting work is logically sound (even if brief), award ${maxScore} and set isCorrect to true.
5.  **Partial Credit:** Award partial marks (1 to ${maxScore - 1}) if the final answer is wrong but some intermediate steps or formulas are correct.
6.  **Zero Credit:** Award 0 only if the work is completely unrelated or factually incorrect.
7.  **Feedback:** Provide brief, encouraging feedback in ${language === 'zh' ? 'Traditional Chinese (繁體中文)' : 'English'}.

Return ONLY valid JSON in this format:
{
    "score": [number from 0 to ${maxScore}],
    "isCorrect": [boolean, true ONLY if score == ${maxScore}],
    "feedback": "[Brief feedback]"
}`;

            try {
                let result;

                if (hasImage) {
                    // Multimodal grading: fetch image and send as inline data
                    console.log(`[MathsLabService] Multimodal grading for Q ${q.id} with image`);
                    try {
                        const imageUrl = imageAnswers[q.id];
                        const imageResponse = await fetch(imageUrl);
                        const imageArrayBuffer = await imageResponse.arrayBuffer();
                        const base64Image = Buffer.from(imageArrayBuffer).toString('base64');
                        const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';

                        // Use multimodal prompt with image
                        const multimodalPrompt = [
                            { text: promptText },
                            {
                                inlineData: {
                                    mimeType: contentType,
                                    data: base64Image
                                }
                            }
                        ];

                        result = await GenerativeAIService.generateJson(multimodalPrompt, { model: "gemini-2.0-flash" });
                    } catch (imgErr) {
                        console.warn(`[MathsLabService] Image fetch failed for Q ${q.id}, falling back to text-only:`, imgErr.message);
                        // Fallback to text-only grading
                        result = await GenerativeAIService.generateJson(promptText, { model: "gemini-2.0-flash" });
                    }
                } else {
                    result = await GenerativeAIService.generateJson(promptText, { model: "gemini-2.0-flash" });
                }

                const gradings = result.data;
                console.log(`[MathsLabService] AI Grader Result for Q ${q.id}:`, JSON.stringify(gradings));

                return {
                    id: q.id,
                    isCorrect: gradings.isCorrect === true || gradings.score >= maxScore - 0.1, // Float safety
                    score: gradings.score || 0,
                    maxScore: maxScore,
                    feedback: gradings.feedback || "Checked."
                };
            } catch (err) {
                console.error("[MathsLabService] AI Grader error for question", q.id, err);
                return {
                    id: q.id,
                    isCorrect: false,
                    score: 0,
                    maxScore: maxScore,
                    feedback: "Failed to grade automatically over network."
                };
            }
        });

        return await Promise.all(gradingPromises);

    }

    /**
     * Specialized OCR & Assessment for handwritten math problems.
     * Uses Gemini Vision to analyze student work from a photo.
     */
    static async assessHandwriting(imageBuffer, mimeType, uid) {
        console.log(`[MathsLabService] 🎨 Starting Handwriting Assessment for ${uid}...`);

        const prompt = `You are Matt sir, the expert HKDSE Mathematics tutor. 
        The student has uploaded a photo of math work or a question.
        
        TASK & PEDAGOGY:
        1. **IDENTITY VERIFICATION**: First, check if the content relates to Mathematics. If it does not (e.g., an English essay, a photo of a pet), politely clarify that you are Matt sir and you only handle Mathematics.
        
        2. **SCENARIO A: QUESTION ONLY**: If the image contains ONLY a math question (no student work), DO NOT provide the direct answer. Instead:
           - Analyze the question.
           - Guide the student by explaining the core concept.
           - Provide 1-2 hints or strategies to help them start solving it.
           - Maintain a mentor tone that encourages thinking.
        
        3. **SCENARIO B: QUESTION + STUDENT SOLUTION**: If the student has provided their own solution/working:
           - **TRANSCRIPTION**: Transcribe the problem and their work.
           - **FORMULA CHECK**: Verify if the formulas and logical steps are mathematically sound.
           - **HKDSE MARKING SCHEME ANALYSIS**: Evaluate their work based on HKEA (HKDSE) standards.
             - Identify where they would get "M" (Method) marks.
             - Point out where they might lose marks (e.g., missing units, poor notation, algebraic slips).
             - Provide specific advice on how to improve their presentation to secure higher marks in Section A2/B.
        
        FORMATTING RULES:
        - Use Traditional Chinese (Cantonese tone: e.g. "呢題我想你試下...", "其實你可以...") for prose.
        - Use LaTeX for all math expressions (MANDATORY). Wrap in \\( ... \\) or \\[ ... \\].
        - Support for both English and Chinese users (bilingual if necessary).
        - Keep it conversational, supportive, yet rigorous for DSE preparation.`;

        try {
            console.log(`[MathsLabService] Calling Gemini Vision (flash) for assessment...`);
            const result = await GenerativeAIService.executeWithRetry(async (model) => {
                return await model.generateContent([
                    prompt,
                    {
                        inlineData: {
                            data: imageBuffer.toString('base64'),
                            mimeType: mimeType || 'image/jpeg'
                        }
                    }
                ]);
            }, prompt, { model: "gemini-1.5-flash" });

            const text = result.response.text();
            console.log(`[MathsLabService] Raw AI Assessment Length: ${text.length}`);
            
            // Post-process the final text to fix delimiters/spacing
            const cleanedText = postProcessMathText(text);

            return {
                text: cleanedText,
                role: 'model'
            };
        } catch (error) {
            console.error("[MathsLabService] Handwriting Assessment Error:", error);
            throw new Error("I couldn't analyze the image clearly. Please make sure the photo is well-lit and the handwriting is legible!");
        }
    }

}

module.exports = MathsLabService;
