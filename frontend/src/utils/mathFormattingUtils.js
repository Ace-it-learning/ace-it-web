const MATH_UTIL_VERSION = '1.8.6 - Sanitize unicodeMap word collisions';
console.log(`[MathUtils] Initialized version: ${MATH_UTIL_VERSION}`);

/**
 * Universal character stripper to ensure KaTeX compatibility.
 */
const cleanStringForMath = (str) => {
    if (!str || typeof str !== 'string') return str;
    const result = str.split('').filter(char => {
        const code = char.charCodeAt(0);
        return (code >= 32 && code <= 126) || (code >= 0x00A0 && code <= 0x00FF) || (code >= 0x0370 && code <= 0x03FF) || (code >= 0x2000 && code <= 0x206F) || (code >= 0x2100 && code <= 0x214F) || (code >= 0x2200 && code <= 0x22FF) || (code >= 0x2700 && code <= 0x27BF) || (code >= 0x3000 && code <= 0x303F) || (code >= 0x3400 && code <= 0x4DBF) || (code >= 0x4E00 && code <= 0x9FFF) || (code >= 0x25A0 && code <= 0x25FF) || (code === 10 || code === 13 || code === 9);
    }).join('').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\u200B-\u200D\uFEFF\u1680\u180E\u202F\u205F\u3000]/g, '');
    return result;
};

const TEXT_LIKE_PREFIXES = /^(Step\s*\d*\s*:?|Solution|Answer|Therefore|Hence|So\s*:?|We can rewrite|Substitute|Then|And|Assume|Let|Given|Since|Because|Actually|In this case|In general|If the|Complete|For\s|When|Note|Recall|Using|By\s|From|Apply|Consider|Now|Total|Profit|Loss|Markup|Discount|Price|Cost|Earnings|Revenue|Commission|Principal|Interest|Amount|Sum|Formula|The\s|This\s|That\s|Each\s|Find|Calculate|Determine|Evaluate|Simplify|Solve|Compare|Check|Verify|Area|Volume|Width|Length|Height|Radius|Diameter|At\s|Angle\s)/i;

/**
 * v1.8.4: Hardened heuristics for AI hallucinations and common LaTeX triggers.
 * Now ignores single-character vertical fragments like d, i, v.
 */
export const looksLikeMath = (str) => {
    if (!str || typeof str !== 'string') return false;
    const trimmed = str.trim();
    if (trimmed.length < 1) return false;

    // Single character check: Ignore d, i, v, o, r
    if (/^[divor]$/i.test(trimmed)) return false;

    // v1.8.8 Hardened: Only treat as math if NO plain English words, OR has a math operator
    const words = trimmed.match(/\b[a-zA-Z]{3,}\b/g) || [];
    const hasPlainEnglish = words.some(w => {
        const idx = trimmed.indexOf(w);
        return idx === 0 || trimmed[idx - 1] !== '\\'; // word not part of a command
    });

    // v1.8.10: Variable Protection - Ignore underscores/carets if they are likely prose IDs (e.g. Q_1)
    if (hasPlainEnglish && words.length >= 2) {
        // Must have a "Hard" math marker to wrap a whole sentence
        const hasHardMath = /[\\[\]{}=><+\-]/.test(trimmed) || /\b(theta|pi|phi|sigma|mu|alpha|beta|delta|frac|sqrt|sum)\b/i.test(trimmed);
        if (!hasHardMath) return false;
    }

    return (
        trimmed.includes('\\') ||  // Still includes \sigma
        (/\$.*?\$/.test(trimmed)) || 
        (!hasPlainEnglish && (trimmed.includes('^') || trimmed.includes('_'))) || // Only trigger _/^ if NO English
        trimmed.includes('{') ||
        trimmed.includes('}') ||
        /\b(arrow|theta|pi|phi|infty|times|pm|mp|le|ge|ne|alpha|beta|gamma|delta|epsilon|zeta|eta|iota|kappa|lambda|mu|nu|xi|omicron|rho|sigma|tau|upsilon|chi|psi|omega)\b/i.test(trimmed) ||
        /[0-9][a-z0-9]+\^[a-z0-9]+/i.test(trimmed) || 
        /[0-9][a-z0-9]+\/[a-z0-9]+/i.test(trimmed) ||  
        /^[0-9\s.+*/%-]+[=><][=><]?/.test(trimmed) || 
        /^[A-Z][0-9]\s?=\s?.*/.test(trimmed)
    );
};

export const rescueMangledLatex = (str) => {
    if (!str || typeof str !== 'string') return str;
    return str
        .replace(/\t(imes|ext|heta|an)/g, '\\t$1')
        .replace(/\r(ho|ight)/g, '\\r$1')
        .replace(/\f(rac)/g, '\\f$1')
        .replace(/\n(ewpage|eq|ot)/g, '\\n$1')
        .replace(/\\imes/g, '\\times')
        .replace(/\\ext/g, '\\text')
        .replace(/\\mathrm/g, '\\mathrm')
        .replace(/\\+dots(?![a-z])/gi, '...')
        .replace(/(?<!\\)cdots(?![a-z])/gi, '\\cdots')
        .replace(/(?<!\\)times(?![a-z])/gi, '\\times')
        .replace(/(?<!\\)div(?![a-z])/gi, '\\div')
        .replace(/\\+arrow/g, "\\rightarrow")
        .replace(/(?<!\\)mathrm(?![a-z])/gi, '\\mathrm');
};

export const isTipTapJSON = (str) => {
    if (!str || typeof str !== 'string') return false;
    const trimmed = str.trim();
    return (trimmed.startsWith('{') && trimmed.endsWith('}') && (trimmed.includes('"type":"doc"') || trimmed.includes("'type':'doc'")) && (trimmed.includes('"content"') || trimmed.includes("'content'")));
};

export const convertTipTapToElite = (jsonStr) => {
    if (!jsonStr) return "";
    if (!isTipTapJSON(jsonStr)) return jsonStr;
    try {
        const doc = JSON.parse(jsonStr);
        if (!doc || doc.type !== 'doc' || !doc.content) return jsonStr;
        let eliteString = "";
        const processNode = (node) => {
            if (node.type === 'text') eliteString += node.text;
            else if (node.type === 'math') eliteString += ` $${node.attrs?.latex || ""}$ `;
            else if (node.content) {
                node.content.forEach(processNode);
                if (node.type === 'paragraph') eliteString += "\n";
            }
        };
        doc.content.forEach(processNode);
        return eliteString.trim();
    } catch (e) {
        return jsonStr;
    }
};

const wrapCJK = (str) => {
    if (!str) return str;
    return str.replace(/([\u3000-\u303F\u3400-\u4DBF\u4E00-\u9FFF]+)/g, (match) => `\\text{${match}}`);
};

export const formatNumbers = (text, isMath = false) => {
    if (!text || typeof text !== 'string') return text;
    let formatted = text.replace(/(?<!\.)\b\d{4,}(\.\d+)?\b/g, (match) => {
        const parts = match.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, isMath ? '{,}' : ',');
        return parts.join('.');
    });
    if (isMath) formatted = formatted.replace(/\\+$/, '').trim();
    else {
        formatted = formatted.replace(/[□◻⬜▢]/g, '<span style="display:inline-block; width:0.8em; height:0.8em; border:1px solid currentColor; margin-bottom:-0.1em; opacity:0.7"></span>');
        formatted = formatted.replace(/\^([a-zA-Z0-9]+)/g, '<sup>$1</sup>');
    }
    return formatted;
};

export const sanitizeMath = (t) => {
    if (!t) return t;
    let formatted = String(t);
    
    // --- ABSOLUTE ROW-BREAK STANDARDIZER: Final Rendering Guarantee ---
    // [V1.8.8 FIX] Removed automatic $$ wrapping of environments.
    // Environments should be explicitly delimited with $$ or \[ in the source data
    // to avoid the "magic" fallback path which causes double-wrapping.
    
    // 1. Global Slash Normalization: Reduce all 3+ backslash clusters to 2 backslashes
    formatted = formatted.replace(/\\{3,}/g, '\\\\');
    
    // 3. Command Normalization: Ensure common commands have exactly one slash
    formatted = formatted.replace(/\\+(begin|end|text|sigma|mu|implies|frac|sqrt|mathrm|times|div|sum|prod)/g, '\\$1');
    
    // 4. Diagram Standardizer: Repair "starved" row breaks in arrays
    if (formatted.includes('array')) {
        // Step A: Force row breaks to have exactly two backslashes (KaTeX row-break)
        // Functional replacement bypassing JS string-escape logic
        formatted = formatted.replace(/\\{2,}/g, () => '\\\\'); 
        
        // [V1.8.7 FIX] Removed aggressive single-backslash doubling that was mangling commands like \text
        // and \hline into invalid KaTeX sequences.
        
        // Step B: Ensure \hline has exactly one valid row break (\\ \hline)
        // [V1.9.0 SAFE FIX] Use a temporary token instead of lookbehind for cross-browser safety
        // 1. Protect the array preamble
        formatted = formatted.replace(/(\\begin\{array\}\{.*?\})/g, '$1##HLINE_PREAMBLE##');
        
        // 2. Format ALL hlines with a row-break
        formatted = formatted.replace(/(?:\\\\)?\s*\\?hline/g, ' \\\\ \\hline');
        
        // 3. Cleanup the one right after the preamble (it shouldn't have a break)
        formatted = formatted.replace(/##HLINE_PREAMBLE##\s*\\\\/g, '##HLINE_PREAMBLE##');
        formatted = formatted.replace(/##HLINE_PREAMBLE##/g, '');
        
        // Step C: Normalizing the start/end to avoid over-injection
        formatted = formatted.replace(/\\\\ \\\\/g, () => '\\\\');
        formatted = formatted.replace(/(\\begin\{array\}\{.*?\})\s*\\\\/g, '$1');
    }

    const textBlocks = [];
    formatted = formatted.replace(/\\text\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g, (match) => {
        textBlocks.push(match);
        return `___MTS_TB_${textBlocks.length - 1}___`;
    });
    formatted = formatted.replace(/\n/g, ' ');

    // === CRITICAL: Strip KaTeX manual line-breaks (\\) before bare math words ===
    // e.g. "25 \\ div2" => "25 \div 2" before the aligned-env detector fires
    formatted = formatted.replace(/\\\\\s*(div|times|frac|mathrm|rightarrow|leftarrow|cdot|pm)(?![a-zA-Z])/g, '\\$1 ');

    const hasValidEnv = /\\begin\{(aligned|alignat|cases|array|matrix|pmatrix|bmatrix|vmatrix|align\*?|eqnarray|gather|split)\}/i.test(formatted);
    if (!hasValidEnv || (formatted.includes('&') && !formatted.includes('\\begin{'))) formatted = formatted.replace(/\\?&/g, ' ');
    formatted = formatted.replace(/\\*%/g, '\\%');
    // Only wrap in aligned when there is a genuine multi-line alignment marker (&)
    if (!hasValidEnv && formatted.includes('\\\\') && formatted.includes('&')) {
        formatted = `\\begin{aligned} ${formatted} \\end{aligned}`;
    }
    const codeBlocks = [];
    formatted = formatted.replace(/`([^`]+)`/g, (match) => {
        codeBlocks.push(match);
        return `___CODEBLOCK_${codeBlocks.length - 1}___`;
    });
    formatted = formatted.replace(/\\begin\{align\*?\}([\s\S]*?)\\end\{align\*?\}/g, (m, inner) => `\\begin{aligned} ${inner} \\end{aligned}`);
    const supportedEnvs = ['cases', 'pmatrix', 'bmatrix', 'vmatrix', 'Bmatrix', 'matrix', 'array', 'aligned', 'gathered', 'alignedat'];
    formatted = formatted.replace(/\\begin\{([^}]+)\}(\{[^}]*\})?([\s\S]*?)\\end\{\1\}/g, (match, envName, args, inner) => {
        if (supportedEnvs.includes(envName)) return match;
        // If not supported, we "gracefully" degrade but preserve any arguments provided
        return (args || '') + inner.replace(/&/g, ' ').replace(/\\\\/g, ', ').replace(/\s+/g, ' ').trim();
    });
    formatted = formatted.replace(/[\u2212\u2013\u2014\u2015]/g, '-');
    formatted = formatted.replace(/\\\\+(log|ln|sin|cos|tan|frac|sqrt|text|alpha|beta|gamma|theta|pi|Delta|Sigma|Omega|mu|lambda|sigma|sum|prod|int|partial|nabla|cup|cap|subset|subseteq|in|notin|exists|forall|infty|pm|times|div|approx|neq|le|ge|cdot|mathrm|Rightarrow|leftarrow|rightarrow|implies|iff|parallel|circ|degree)/g, '\\$1');
    formatted = formatted.replace(/\\\\(div|times|mathrm|rightarrow)/g, '\\$1'); // User-requested specific reduction logic

    formatted = formatted.replace(/<sup>(.*?)<\/sup>/gi, '^{$1}').replace(/<sub>(.*?)<\/sub>/gi, '_{$1}');
    const unicodeMap = {'α': 'alpha', 'β': 'beta', 'γ': 'gamma', 'δ': 'delta', 'ε': 'epsilon', 'θ': 'theta', 'λ': 'lambda', 'μ': 'mu', 'π': 'pi', 'σ': 'sigma', 'τ': 'tau', 'φ': 'phi', 'ω': 'omega', 'Δ': 'Delta', '±': 'pm', '×': 'times', '÷': 'div', '≈': 'approx', '≠': 'neq', '≤': 'le', '≥': 'ge', '∞': 'infty', '∠': 'angle', '°': '^\circ', '√': 'sqrt', '□': 'square', '⨀': 'odot', '△': 'triangle', '∥': 'parallel', '⊥': 'perp', '∵': 'because', '∴': 'therefore'};
    Object.entries(unicodeMap).forEach(([char, cmd]) => { formatted = formatted.split(char).join(cmd.startsWith('^') ? cmd : `\\${cmd} `); });
    formatted = formatted.replace(/\\?begin\s*\{cases\}/g, '\\begin{cases}').replace(/\\?end\s*\{cases\}/g, '\\end{cases}');
    const symbols = ['times', 'theta', 'alpha', 'beta', 'gamma', 'delta', 'Delta', 'sigma', 'Sigma', 'phi', 'Phi', 'omega', 'Omega', 'degree', 'deg', 'angle', 'sqrt', 'approx', 'neq', 'le', 'ge', 'arrow', 'infty', 'dots', 'cdots', 'pi', 'rho', 'tau', 'lambda', 'epsilon', 'mathrm', 'mathbf', 'log', 'sin', 'cos', 'tan', 'ln', 'implies', 'Rightarrow', 'leftarrow', 'rightarrow', 'iff', 'forall', 'exists', 'triangle', 'sim', 'cong', 'parallel', 'perp', 'circ', 'degree', 'odot', 'because', 'therefore'];
    symbols.forEach(sym => {
        let regex = new RegExp("(?<!\\\\)(?<![a-zA-Z])" + sym + "(?![a-zA-Z])", "gi");
        const replacement = sym === 'arrow' ? "\\rightarrow " : "\\" + sym + " ";
        formatted = formatted.replace(regex, replacement);
    });
    formatted = wrapCJK(formatted);
    formatted = cleanStringForMath(formatted);
    textBlocks.forEach((val, i) => { formatted = formatted.split(`___MTS_TB_${i}___`).join(val); });
    codeBlocks.forEach((block, i) => { formatted = formatted.replace(`___CODEBLOCK_${i}___`, block); });
    return formatted;
};

/**
 * v1.8.5: Strips leading/trailing orphaned standalone numbers (e.g. the
 * dividend context line "25\n" the AI inserts before each step in base
 * conversion problems). Also collapses vertical division artifacts like
 * \n d \n i \n v \n → div.
 */
export const prepareMathText = (displaySubtext) => {
    if (!displaySubtext) return '';
    let text = String(displaySubtext)
        .replace(/___HKD___/g, 'HK$')
        .replace(/___USD___/g, '$');

    // v1.8.5: Strip leading orphaned numbers/short tokens.
    // The AI often inserts the current dividend value (e.g. "25\n") as a
    // visual "above-the-line" context before the step description.
    // These lone numbers cause a floating artifact above the step text
    // because renderMath converts \n → <br />.
    // Pattern: one or more lines at the START that contain ONLY a number
    // (possibly surrounded by spaces), followed by a newline.
    text = text.replace(/^(\s*\d+\.?\d*\s*\r?\n)+/, '');

    // Similarly strip a lone trailing number at the very END of the string
    // (some steps have the *next* dividend appended after the step text).
    text = text.replace(/(\r?\n\s*\d+\.?\d*\s*)+$/, '');

    // Collapse vertical artifacts: Sequence of single characters with newlines
    // Specifically targeting base conversion layouts: \n 2 \n 5 \n d \n i \n v \n 2 \n
    text = text.replace(/(\r?\n\s*[a-zA-Z0-9+=.]{1}\s*){3,}/g, (match) => {
        return match.replace(/\r?\n\s*/g, ' ').trim();
    });

    text = text
        .replace(/([0-9])arrow/gi, "$1 \\rightarrow ")
        .replace(/arrow([0-9a-zA-Z])/gi, " \\rightarrow $1")
        .replace(/([a-zA-Z0-9])\s+arrow\s+([a-zA-Z0-9])/gi, "$1 \\rightarrow $2")
        .replace(/\\+arrow/g, "\\rightarrow")
        .replace(/\$\s*([\s\S]*?)\s*\$/g, (m, inner) => `$${inner.trim()}$`)
        .replace(/\\\(\s*([\s\S]*?)\s*\\\)/gi, (m, inner) => `\\(${inner.trim()}\\)`)
        .replace(/\\\[\s*([\s\S]*?)\s*\\\]/gi, (m, inner) => `\\[${inner.trim()}\\]`)
        .replace(/(\$\$?|\\\(|\\\[)\s*([\s\S]+?)\s*(\$\$?|\\\)|\\\])/g, "$1$2$3")
        .replace(/\\n/g, '\n');
    return text;
};

export const splitContentByDelimiters = (text) => {
    if (!text || typeof text !== 'string') return [text || ''];
    const delimiterRegex = /(\[HTML\][\s\S]*?\[\/HTML\]|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/g;
    return text.split(delimiterRegex);
};
