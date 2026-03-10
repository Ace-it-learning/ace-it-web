const MATH_UTIL_VERSION = '1.6.3 - The Delimiter Balancer';
console.log(`[MathUtils] Initialized version: ${MATH_UTIL_VERSION}`);

/**
 * Universal character stripper to ensure KaTeX compatibility.
 * Keeps only safe ASCII, Greek, and common math symbols.
 */
const cleanStringForMath = (str) => {
    if (!str || typeof str !== 'string') return str;
    const result = str.split('').filter(char => {
        const code = char.charCodeAt(0);
        return (code >= 32 && code <= 126) || // Basic ASCII
            (code >= 0x00A0 && code <= 0x00FF) || // Latin-1 Supplement (degree, pm, times etc)
            (code >= 0x0370 && code <= 0x03FF) || // Greek
            (code >= 0x2000 && code <= 0x206F) || // General Punctuation
            (code >= 0x2100 && code <= 0x214F) || // Letterlike Symbols (\ell)
            (code >= 0x2200 && code <= 0x22FF) || // Math Operators
            (code >= 0x2700 && code <= 0x27BF) || // Dingbats
            (code >= 0x3000 && code <= 0x303F) || // CJK Punctuation
            (code >= 0x3400 && code <= 0x4DBF) || // CJK Extension A
            (code >= 0x4E00 && code <= 0x9FFF) || // CJK Unified Ideographs
            (code >= 0x25A0 && code <= 0x25FF) || // Geometric Shapes (triangle, circle, square)
            (code === 10 || code === 13 || code === 9); // \n, \r, \t
    }).join('').replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200D\uFEFF\u1680\u180E\u202F\u205F\u3000]/g, '');
    return result;
};

/**
 * Common prefixes that strongly indicate a line should be treated as text, not math.
 * Version 1.2.0: Extended with more conversational/explanatory prefixes.
 */
const TEXT_LIKE_PREFIXES = /^(Step\s*\d*\s*:?|Solution|Answer|Therefore|Hence|So\s*:?|We can rewrite|Substitute|Then|And|Assume|Let|Given|Since|Because|Actually|In this case|In general|If the|Complete|For\s|When|Note|Recall|Using|By\s|From|Apply|Consider|Now|Total|Profit|Loss|Markup|Discount|Price|Cost|Earnings|Revenue|Commission|Principal|Interest|Amount|Sum|Formula|The\s|This\s|That\s|Each\s|Find|Calculate|Determine|Evaluate|Simplify|Solve|Compare|Check|Verify|Area|Volume|Width|Length|Height|Radius|Diameter|At\s|Angle\s)/i;

/**
 * Centralized heuristic to determine if a string should be rendered as math.
 * Version 1.2.2: Distinguishes prose-with-math from pure math.
 */
export const looksLikeMath = (str) => {
    if (!str || typeof str !== 'string') return false;
    const trimmed = str.trim();
    if (!trimmed) return false;

    // Version 1.3.3: Recognize single letters (x, y, n, i, j) and short expressions as math
    if (/^[a-z]$|^[a-z]\s*[=><]\s*[\d.a-z]+$|^[a-z][\d_]$/i.test(trimmed)) return true;

    // Count English words (3+ letter words) to detect prose
    const englishWords = trimmed.match(/\b[a-zA-Z]{3,}\b/g) || [];
    const wordCount = englishWords.length;
    const spaceCount = (trimmed.match(/ /g) || []).length;
    const isTextPrefix = TEXT_LIKE_PREFIXES.test(trimmed);

    // Version 1.5.9: If it contains strong LaTeX commands for geometry, it's MATH.
    // Higher priority than word count to prevent misparsing \times, \angle, \degree
    const hasGeometryMath = /\\(angle|degree|times|odot|circ|parallel|perp|triangle|because|therefore)/i.test(trimmed);
    if (hasGeometryMath) return true;

    // If it starts with a text prefix and has 3+ English words, it's definitely prose.
    if (isTextPrefix && wordCount >= 3) return false;

    // High word count (4+) usually means prose unless math symbols are very dense.
    // Version 1.5.7: More aggressive prose detection for long geometry words.
    const longestAlpha = (trimmed.match(/[a-zA-Z]+/g) || ['']).reduce((a, b) => a.length > b.length ? a : b, '');
    if (wordCount >= 3 || longestAlpha.length >= 12) return false;

    // Additional check: If it has multiple spaces and NO strong math symbols, it's likely prose
    const hasStrongMath = /[\\|^_=<>±∓×÷≈≠≤≥∞∠°√{}]/.test(trimmed) || /\\begin\{cases\}/i.test(trimmed);

    // Version 1.4.0 CRITICAL FIX: Mixed-content detection
    // If a line has 3+ English words AND contains math commands, it's MIXED CONTENT (prose with embedded math)
    // These should be treated as PROSE, not math. The delimiters will handle the math parts.
    const hasMathCommands = /(?<![a-z])(log|ln|sin|cos|tan|frac|sqrt)(?![a-z])/i.test(trimmed) || /[_^{]/.test(trimmed);
    if (wordCount >= 3 && hasMathCommands) return false;
    if (wordCount >= 2 && spaceCount >= 3 && hasMathCommands) return false;

    if (spaceCount >= 3 && !hasStrongMath && wordCount >= 1) return false;

    // Updated to handle cases where variables follow commands without space (e.g. le64, ge100)
    // Version 1.3.0: Added more commands like text, mathbf, and check for _ and {
    const isRawMathCommand = /(?<![a-z])(frac|sqrt|alpha|beta|gamma|theta|pi|times|div|pm|mp|approx|neq|le|ge|infty|dots|cdots|Delta|Sigma|Phi|Omega|deg|degree|angle|log|sin|cos|tan|ln|text|mathbf|triangle|sim|cong|parallel|circ)(?![a-z])|([lg]e[0-9_\(\)]+)|\\begin\{cases\}|[_^{]/.test(trimmed) ||
        trimmed.includes('\\\\') ||
        /\^([0-9a-z]|\{)/i.test(trimmed) ||
        trimmed.includes('\\text');

    // Priority 1: If it contains raw math commands AND is not prose, IT IS MATH.
    // But ONLY if word count is low (not a prose sentence).
    // Version 1.5.2: If it has multiple naked or escaped ampersands without an env, it's NOT pure math.
    const ampersands = (trimmed.match(/\\?&/g) || []);
    const hasNakedAmp = ampersands.length > 0;
    const hasEnv = /\\begin\{(aligned|cases|array|matrix|pmatrix|bmatrix)\}/i.test(trimmed);

    // If it has 2+ ampersands on one line, it's almost certainly prose-separator hallucinations.
    if (ampersands.length >= 2) return false;
    if (hasNakedAmp && !hasEnv) return false;

    if (isRawMathCommand && wordCount < 3) return true;

    // Priority 2: Heuristics for mixed/plain lines
    const hasComparison = /[=><]/.test(trimmed) && !trimmed.includes('?');
    const hasOperators = /[+\-]/.test(trimmed) && /[0-9]/.test(trimmed);

    // Heuristic: If it has comparison operators and isn't a "Text" sentence
    if (!isTextPrefix && hasComparison && spaceCount < 10 && wordCount < 3) return true;

    // Heuristic: If it has digits + letters/operators and is short
    if (!isTextPrefix && spaceCount < 5 && wordCount < 3 && /[0-9]/.test(trimmed) && (/[a-z]{1,2}\s/i.test(trimmed) || hasOperators || hasComparison)) return true;

    // Explicit single variables like "x = 5" or "n = 300"
    if (/^[a-z]\s*=\s*[\d.a-z]+$/i.test(trimmed)) return true;

    // Reject if it has unbalanced or naked braces without other math indicators
    const openBraces = (trimmed.match(/{/g) || []).length;
    const closeBraces = (trimmed.match(/}/g) || []).length;

    if (openBraces !== closeBraces && !hasStrongMath && !isRawMathCommand) return false;
    if (openBraces > 0 && !isRawMathCommand && !/\\/.test(trimmed)) return false;

    return false;
};

/**
 * Wraps any sequence of CJK characters in \text{} for KaTeX compatibility.
 */
const wrapCJK = (str) => {
    if (!str) return str;
    return str.replace(/([\u3000-\u303F\u3400-\u4DBF\u4E00-\u9FFF]+)/g, (match) => {
        return `\\text{${match}}`;
    });
};

/**
 * Formats numbers with thousand separators.
 * Version 1.2.2: Added basic text-mode support for superscripts and square symbols.
 */
export const formatNumbers = (text, isMath = false) => {
    if (!text || typeof text !== 'string') return text;

    // Version 1.2.3: Use word boundary and negative lookbehind to avoid commas in decimals (e.g. 0.1234)
    let formatted = text.replace(/(?<!\.)\b\d{4,}(\.\d+)?\b/g, (match) => {
        const parts = match.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, isMath ? '{,}' : ',');
        return parts.join('.');
    });

    if (isMath) {
        formatted = formatted.replace(/\\+$/, '').trim();
    } else {
        // Text mode enhancements:
        // 1. Handle actual Unicode box symbols by rendering a clean HTML placeholder
        formatted = formatted.replace(/[□◻⬜▢]/g, '<span style="display:inline-block; width:0.8em; height:0.8em; border:1px solid currentColor; margin-bottom:-0.1em; opacity:0.7"></span>');

        // 2. Handle basic superscripts like ^2 or ^x in prose (using <sup>)
        formatted = formatted.replace(/\^([a-zA-Z0-9]+)/g, '<sup>$1</sup>');
    }

    return formatted;
};

/**
 * High-performance math sanitization for HKDSE requirements.
 * Version 1.1.3: Boundary-aware symbol repair logic for corrupted steps.
 */
export const sanitizeMath = (t) => {
    if (!t) return t;
    if (typeof t !== 'string') return String(t);

    let formatted = t;

    // Version 1.6.1: ABSOLUTE TEXT GUARDIAN
    // Mask all \text{} blocks at the VERY START to prevent symbol/map poisoning.
    const textBlocks = [];
    formatted = formatted.replace(/\\text\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g, (match) => {
        textBlocks.push(match);
        return `___TEXT_BLOCK_${textBlocks.length - 1}___`;
    });

    // Version 1.5.5 Final Safeguard: Newline Neutralizer
    formatted = formatted.replace(/\n/g, ' ');

    // Version 1.5.6: AGGRESSIVE AMPERSAND PURGE
    // We only preserve ampersands if a VALID and COMPLETE alignment environment is found.
    // If & exists but no \begin{env} exists, it MUST be stripped.
    const hasValidEnv = /\\begin\{(aligned|alignat|cases|array|matrix|pmatrix|bmatrix|vmatrix|align\*?|eqnarray|gather|split)\}/i.test(formatted);
    if (!hasValidEnv || (formatted.includes('&') && !formatted.includes('\\begin{'))) {
        formatted = formatted.replace(/\\?&/g, ' ');
    }

    // Version 1.5.9: Alignment Auto-Injector
    // If it contains \\ (line break) but NO alignment environment, KaTeX will crash in block mode.
    // We wrap it in 'aligned' automatically if it looks like a multiline derivation.
    if (!hasValidEnv && formatted.includes('\\\\')) {
        // Only wrap if it has some comparison/assignment to avoid wrapping simple text blocks
        if (/[=><]/.test(formatted)) {
            formatted = `\\begin{aligned} ${formatted} \\end{aligned}`;
        }
    }

    // 0.0 PROTECT INLINE CODE BLOCKS
    const codeBlocks = [];
    formatted = formatted.replace(/`([^`]+)`/g, (match) => {
        codeBlocks.push(match);
        return `___CODEBLOCK_${codeBlocks.length - 1}___`;
    });

    // VERSION 1.4.0: COMPREHENSIVE LATEX ENVIRONMENT SANITIZATION
    // KaTeX has limited environment support. Strip unsupported environments to prevent parse errors.
    // Supported by KaTeX: cases, pmatrix, bmatrix (in display mode only)
    // NOT supported: align*, aligned, eqnarray, gather, multline, split, enumerate, itemize

    // Strip align*/aligned — convert to simple joined lines IF we wanted them inline, 
    // BUT actually KaTeX supports aligned perfectly in display mode!
    // Since we now wrap display math properly, let's PRESERVE `aligned` but strip `align*` into `aligned`.
    formatted = formatted.replace(/\\begin\{align\*?\}([\s\S]*?)\\end\{align\*?\}/g, (m, inner) => {
        return `\\begin{aligned} ${inner} \\end{aligned}`;
    });
    // We do NOT strip \begin{aligned} anymore, KaTeX supports it!

    // Strip eqnarray
    formatted = formatted.replace(/\\begin\{eqnarray\*?\}([\s\S]*?)\\end\{eqnarray\*?\}/g, (m, inner) => {
        return inner.replace(/&/g, ' ').replace(/\\\\/g, ', ').replace(/\s+/g, ' ').trim();
    });

    // Strip gather
    formatted = formatted.replace(/\\begin\{gather\*?\}([\s\S]*?)\\end\{gather\*?\}/g, (m, inner) => {
        return inner.replace(/\\\\/g, ', ').replace(/\s+/g, ' ').trim();
    });

    // Strip multline
    formatted = formatted.replace(/\\begin\{multline\*?\}([\s\S]*?)\\end\{multline\*?\}/g, (m, inner) => {
        return inner.replace(/\\\\/g, ' ').replace(/\s+/g, ' ').trim();
    });

    // Strip split
    formatted = formatted.replace(/\\begin\{split\}([\s\S]*?)\\end\{split\}/g, (m, inner) => {
        return inner.replace(/&/g, ' ').replace(/\\\\/g, ', ').replace(/\s+/g, ' ').trim();
    });

    // Strip enumerate/itemize (AI sometimes uses these in explanations)
    formatted = formatted.replace(/\\begin\{(enumerate|itemize)\}([\s\S]*?)\\end\{\1\}/g, (m, env, inner) => {
        return inner.replace(/\\item\s*/g, '• ').trim();
    });

    // Preserve supported ones: cases, pmatrix, bmatrix, vmatrix, Bmatrix, matrix, array, aligned, gathered, alignedat
    const supportedEnvs = ['cases', 'pmatrix', 'bmatrix', 'vmatrix', 'Bmatrix', 'matrix', 'array', 'aligned', 'gathered', 'alignedat'];
    formatted = formatted.replace(/\\begin\{([^}]+)\}([\s\S]*?)\\end\{\1\}/g, (match, envName, inner) => {
        if (supportedEnvs.includes(envName)) return match; // Keep supported
        // Strip unsupported
        return inner.replace(/&/g, ' ').replace(/\\\\/g, ', ').replace(/\s+/g, ' ').trim();
    });

    // 0. NORMALIZE HYPHENS/MINUS SIGNS
    formatted = formatted.replace(/[\u2212\u2013\u2014\u2015]/g, '-');

    // 0.05 FIX AI DOUBLE-ESCAPING (e.g. \\log -> \log)
    // AI models often accidentally double-escape LaTeX commands in JSON.
    // KaTeX interprets \\log as a newline (\\) followed by "log", causing vertical stacking.
    formatted = formatted.replace(/\\\\+(log|ln|sin|cos|tan|frac|sqrt|text|alpha|beta|gamma|theta|pi|Delta|Sigma|Omega|mu|lambda|infty|pm|times|div|approx|neq|le|ge|cdot|Rightarrow|leftarrow|rightarrow|implies|iff|parallel|circ|degree)/g, '\\$1');

    // 0.1 CONVERT HTML TAGS TO LATEX (Prevention for fragmented AI output)
    formatted = formatted
        .replace(/<sup>(.*?)<\/sup>/gi, '^{$1}')
        .replace(/<sub>(.*?)<\/sub>/gi, '_{$1}');

    // 1. PRE-PROCESS: Strip backslashes before Unicode Greek/math characters
    const greekAndMathUnicode = 'αβγδεζηθικλμνξοπρστυφχψωΔΓΘΛΞΠΣΦΨΩ±∓×÷≈≠≤≥∞∠°√';
    formatted = formatted.replace(/\\+([\u0370-\u03FF\u2200-\u22FF\u2190-\u21FF])/g, '$1');

    // 2. Map Unicode literals to LaTeX commands
    // Shielding logic moved to top in v1.6.1

    // Version 1.6.3: Symbol Hallucination Fix
    // Prevent KaTeX error: Expected node of type textord, but got node of type text
    // AI sometimes hallucinates ^{\degree} or ^{\circ}
    formatted = formatted.replace(/\^\{\\degree\}/g, '^\\circ');

    const unicodeMap = {
        'α': 'alpha', 'β': 'beta', 'γ': 'gamma', 'δ': 'delta', 'ε': 'epsilon',
        'θ': 'theta', 'λ': 'lambda', 'μ': 'mu', 'π': 'pi', 'σ': 'sigma',
        'τ': 'tau', 'φ': 'phi', 'ω': 'omega', 'Δ': 'Delta', '±': 'pm',
        '×': 'times', '÷': 'div', '≈': 'approx', '≠': 'neq', '≤': 'le',
        '≥': 'ge', '∞': 'infty', '∠': 'angle', '°': '^\circ', '√': 'sqrt',
        '□': 'square', '◻': 'square', '⬜': 'square', '▢': 'square',
        '⨀': 'odot', '△': 'triangle', '∥': 'parallel', '⊥': 'perp',
        '∵': 'because', '∴': 'therefore'
    };
    Object.entries(unicodeMap).forEach(([char, cmd]) => {
        formatted = formatted.split(char).join(cmd.startsWith('^') ? cmd : `\\${cmd} `);
    });

    // Restore text blocks
    // MOVED TO END in v1.6.1

    // 2.2 SPECIAL PIECEWISE REPAIR (Pre-symbol loop)
    // Ensure cases has standard backslashes (Repairing AI mistakes like \begin {cases} or \cases)
    formatted = formatted.replace(/\\?begin\s*\{cases\}/g, '\\begin{cases}');
    formatted = formatted.replace(/\\?end\s*\{cases\}/g, '\\end{cases}');


    // 3. Fix AI artifacts: "textSellingPrice"
    formatted = formatted.replace(/text([A-Z][A-Za-z0-9]+)/g, (match, word) => {
        const spacedWord = word.replace(/([A-Z0-9])/g, ' $1').trim();
        return `\\text{${spacedWord}}`;
    });

    // 4. ROBUST FRACTION REPAIR
    // Version 1.2.6: Removed dangerous 'frac group' repair that was causing parse errors.
    // We only repair if it clearly looks like a brace-delimited fraction missing a backslash.
    formatted = formatted.replace(/frac\s*(\{.*?\}\s*\{.*?\})/gi, '\\frac$1');
    formatted = formatted.replace(/frac(?=\{)/gi, '\\frac');

    formatted = formatted.replace(/frac\s*(-?\s*[a-zA-Z0-9.]+)\s*(\(?\s*-?\s*[a-zA-Z0-9.]+\s*\)?|[a-zA-Z0-9\(\)\.]+)/g, (match, num, den) => {
        const cleanNum = num.replace(/\s+/g, '');
        const cleanDen = den.replace(/\s+/g, '');
        return `\\frac{${cleanNum}}{${cleanDen}}`;
    });
    // support for frac{num}{den} without backslash
    formatted = formatted.replace(/frac\s*(\{.*?\}\s*\{.*?\})/gi, '\\frac$1');
    formatted = formatted.replace(/frac(?=\{)/gi, '\\frac');

    // 5. Symbols Loop: Inject backslashes for remaining symbols
    // VERSION 1.1.3: More aggressive regex escaping and lookarounds
    // VERSION 1.2.1: Removed 'square' from auto-inject to prevent English prose collision
    const symbols = [
        'times', 'div', 'theta', 'alpha', 'beta', 'gamma', 'delta', 'Delta',
        'sigma', 'Sigma', 'phi', 'Phi', 'omega', 'Omega', 'degree', 'deg',
        'angle', 'sqrt', 'approx', 'neq', 'le', 'ge', 'pm', 'mp',
        'infty', 'dots', 'cdots', 'pi', 'rho', 'tau', 'lambda', 'epsilon', 'frac',
        'log', 'sin', 'cos', 'tan', 'ln', 'implies', 'Rightarrow', 'leftarrow', 'rightarrow', 'iff', 'forall', 'exists',
        'triangle', 'sim', 'cong', 'parallel', 'perp', 'circ', 'degree', 'odot',
        'because', 'therefore'
    ];
    symbols.forEach(sym => {
        // Find symbol if not preceded by backslash and not surrounded by letters
        // Version 1.3.4: Relaxed boundary to allow following vertex letters (ABC) for symbols
        const regex = new RegExp("(?<!\\\\)(?<![a-zA-Z])" + sym + "(?![a-z0-9])", "gi");
        formatted = formatted.replace(regex, "\\" + sym + " ");
    });

    // 6. Cleanup: Duplicate backslashes, spaces, and illegal patterns
    formatted = formatted.replace(/\\([a-zA-Z]+)\s+/g, '\\$1 ');
    formatted = formatted.replace(/\\+(\\frac)/g, '$1');

    // Final check for piecewise underscore artifacts
    formatted = formatted.replace(/&\s*_([a-zA-Z0-9])/g, '& $1');
    formatted = formatted.replace(/&_/g, '& ');

    // 6.5. Replace internal placeholders with valid LaTeX
    formatted = formatted
        .replace(/___HKD___/g, '\\text{HK}\\$')
        .replace(/___USD___/g, '\\$');

    // Normalize wrapCJK
    formatted = wrapCJK(formatted);

    // 7. Match leading labels safely - Support internal labels like ".Step 2:"
    // VERSION 1.2.1: Enhanced regex to support labels with parentheses and broader punctuation
    formatted = formatted.replace(/(?:^|[.!:?])\s*([A-Za-z][A-Za-z0-9\s/.\-'\(\)]{1,})(\s*[:=])/g, (match, label, op) => {
        if (label.includes('\\text{')) return match;
        // If it starts with a period (previous line artifact), preserve it
        const prefix = match.match(/^[.!:?]\s*/) ? match.match(/^[.!:?]\s*/)[0] : '';
        return `${prefix}\\text{${label.trim()}}${op}`;
    });

    // 8. STRIP UNBALANCED \left AND \right (Major cause of KaTeX ParseErrors)
    const leftCount = (formatted.match(/\\left/g) || []).length;
    const rightCount = (formatted.match(/\\right/g) || []).length;
    if (leftCount !== rightCount) {
        formatted = formatted.replace(/\\left/g, '').replace(/\\right/g, '');
    }

    // 9. NUCLEAR STRIPPER (KaTeX compatibility)
    formatted = cleanStringForMath(formatted);

    // 10. REMOVE DELIMITERS (KaTeX Parse Error Prevention)
    // Version 1.3.1: Explicitly strip orphaned delimiters that cause "Undefined control sequence: \[" errors
    formatted = formatted
        .replace(/\\\[/g, '')
        .replace(/\\\]/g, '')
        .replace(/\\\(/g, '')
        .replace(/\\\)/g, '')
        .replace(/(?<!\\)\$/g, '')
        .trim();

    // 11. NAKED MULTILINE WRAPPER
    // If the math contains \\ but is NOT inside a supported environment, KaTeX will throw an error.
    // Wrap it in \begin{aligned} ... \end{aligned} to save it.
    if (formatted.includes('\\\\') && !formatted.includes('\\begin{aligned}') && !formatted.includes('\\begin{cases}') && !formatted.includes('\\begin{array}') && !formatted.includes('\\begin{matrix}')) {
        // Convert single equations separated by \\ into aligned lines (safely prepending & to = for nice alignment if they exist)
        const lines = formatted.split('\\\\');
        const alignedLines = lines.map(l => {
            // Only add & if there isn't one already and there's an =
            if (l.includes('=') && !l.includes('&')) {
                return l.replace('=', '& =');
            }
            return l;
        });
        formatted = `\\begin{aligned} ${alignedLines.join(' \\\\ ')} \\end{aligned}`;
    }
    // Version 1.6.1: Final Restore for Absolute Text Guardian
    textBlocks.forEach((val, i) => {
        formatted = formatted.replace(`___TEXT_BLOCK_${i}___`, val);
    });

    return formatted;
};

/**
 * Repair logic for 'squashed' words (prose correctly or incorrectly in math blocks)
 */
const unsquashProse = (text) => {
    if (!text || typeof text !== 'string') return text;

    // Version 1.2.5: Increased threshold to 16+ to avoid shredding normal long words like 'Substituting' (12)
    const squashedMatch = text.match(/[a-zA-Z]{16,}/);
    if (!squashedMatch) return text;

    let restored = text;
    const commonWords = [
        'proportionally', 'proportionality', 'proportional', 'resistance', 'electrical',
        'inversely', 'calculate', 'directly', 'parameter', 'pendulum', 'material',
        'variable', 'constant', 'equation', 'straight', 'formula', 'express',
        'volume', 'radius', 'square', 'length', 'weight', 'varies', 'simple',
        'metal', 'value', 'given', 'where', 'find', 'what', 'when', 'line', 'root',
        'cube', 'area', 'wire', 'the', 'rod', 'its', 'of', 'in', 'is', 'as',
        'to', 'by', 'on', 'at', 'it', 'up', 'so', 'a'
    ];

    // Sort by length descending to ensure longer matches win (e.g. 'constant' before 'st')
    const sortedWords = [...commonWords].sort((a, b) => b.length - a.length);
    const wordRegex = new RegExp(sortedWords.join('|'), 'gi');

    // TARGETED replacement: only run on the long sequences to avoid shredding normal words elsewhere
    return text.replace(/[a-zA-Z]{16,}/g, (squashed) => {
        // If it looks like it might be a LaTeX command already (starts with \), skip
        if (text.charAt(text.indexOf(squashed) - 1) === '\\') return squashed;

        return squashed.replace(wordRegex, (match) => ` ${match} `).replace(/\s+/g, ' ').trim();
    });
};

/**
 * Safety net: Detects when \( ... \) or \[ ... \] blocks contain mostly English prose
 * (e.g., "of a metal rod varies directly as its length" or "ofawirevariesdirectly") 
 * and unwraps them back to plain text, while preserving genuine single-variable math like \( W \).
 */
const unwrapProseFromMathDelimiters = (text) => {
    if (!text) return text;
    // Regex proven by test: matches both \\( ... \\) and \\[ ... \\] forms
    // PLUS $ ... $ and $$ ... $$ forms
    return text.replace(/(?:\\)?\\[\(\[]([\s\S]+?)(?:\\)?\\[\)\]]|(?:\\)?\$\$?([\s\S]+?)(?:\\)?\$\$?/g, (fullMatch, innerParen, innerDollar) => {
        const inner = (innerParen || innerDollar);
        if (!inner) return fullMatch;
        const trimmed = inner.trim();

        // Count English words (3+ letters each) if spaces exist
        const englishWords = trimmed.match(/\b[a-zA-Z]{3,}\b/g) || [];

        // Also check if the AI hallucinated the phrase without spaces (e.g. "ofawirevariesdirectly")
        // A single continuous math variable usually isn't 12+ letters long.
        const longestAlphaSequence = (trimmed.match(/[a-zA-Z]+/g) || ['']).reduce((a, b) => a.length > b.length ? a : b);

        // If 3+ English words inside, OR suspiciously long unbroken letter sequence (>12)
        // Version 1.5.8: Lowered threshold to 12 to catch "circumference"
        const isVeryWordy = englishWords.length >= 6;
        if ((englishWords.length >= 3 || longestAlphaSequence.length >= 12) &&
            !trimmed.includes('\\frac') && (!trimmed.includes('=') || isVeryWordy) &&
            !trimmed.includes('^') && (!trimmed.includes('{') || isVeryWordy)) {
            return unsquashProse(trimmed);
        }
        return fullMatch; // Keep genuine math blocks
    });
};


/**
 * Auto-wraps orphaned LaTeX commands (like \text{...} or \frac{...}) in math delimiters
 * if they are found in plain text without them.
 */
const wrapOrphanedLaTeX = (text) => {
    if (!text) return text;

    // Split by existing math delimiters to avoid nesting
    // Handles \(\), \[\], $$, and $
    const delimiterRegex = /(\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|\$\$[\s\S]*?\$\$|\$[^$\n]+?\$)/g;
    const parts = text.split(delimiterRegex);

    const bracedCommands = ['text', 'frac', 'sqrt', 'binom', 'overline', 'mathbf', 'mathit'];
    const symbols = ['pm', 'approx', 'neq', 'le', 'ge', 'times', 'div', 'infty', 'mp', 'degree', 'triangle', 'sim', 'cong', 'parallel', 'circ', 'angle'];

    const processedParts = parts.map((part, index) => {
        // Even indices are text/prose, odd indices are the math blocks themselves
        if (index % 2 === 0) {
            let result = part;

            // 1. Braced commands: \text{...}, \frac{...}{...}, \sqrt{...}
            bracedCommands.forEach(cmd => {
                // Version 1.2.9: Support one level of nested braces in orphaned command detection
                // Matches \command{ [balanced_braces] } { [balanced_braces] }?
                const balancedBrace = '\\{(?:[^{}]|\\{[^{}]*\\})*\\}';
                const regex = new RegExp(`(?<!\\\\)\\\\${cmd}${balancedBrace}(${balancedBrace})?`, 'g');
                result = result.replace(regex, match => `\\(${match}\\)`);
            });

            // 2. Standalone symbols: \pm, \approx, \neq, \le, \ge, \times, \div
            symbols.forEach(sym => {
                const regex = new RegExp(`(?<!\\\\)\\\\${sym}(?![a-zA-Z])`, 'g');
                result = result.replace(regex, match => `\\(${match}\\)`);
            });

            // 3. Functions: \log, \sin, \cos, \tan, \ln with their arguments
            // We'll wrap the function and a basic argument up to the next space or boundary if simple, but it's safer to let the block-level logic handle complex ones. Basic standalone:
            const functions = ['log', 'sin', 'cos', 'tan', 'ln'];
            functions.forEach(func => {
                const regex = new RegExp(`(?<!\\\\)\\\\${func}(?![a-zA-Z])`, 'g');
                result = result.replace(regex, match => `\\(${match}\\)`);
            });

            // 4. New: Wrap internal placeholders if orphaned
            // Added '{' to lookbehind to prevent nesting in \text{___HKD___}
            result = result.replace(/(?<![\\${])(___(HKD|USD)___)/g, '\\($1\\)');

            return result;
        }
        return part;
    });

    return processedParts.join('');
};

export const prepareMathText = (displaySubtext) => {
    if (!displaySubtext) return '';
    if (typeof displaySubtext !== 'string') {
        if (typeof displaySubtext === 'number') {
            displaySubtext = String(displaySubtext);
        } else {
            console.warn('[MathUtils] prepareMathText received non-string:', displaySubtext);
            return String(displaySubtext || '');
        }
    }

    // Version 1.4.7: Surgical Stripping
    let text = displaySubtext;
    console.debug(`[MathUtils v${MATH_UTIL_VERSION}] Processing text starting with: ${text.substring(0, 50).replace(/\n/g, ' ')}...`);

    // 0. NORMALIZE NEWLINES EARLY
    // Convert literal \n sequences to real newlines so they can be processed line-by-line.
    text = text.replace(/\\n/g, '\n');

    // Version 1.6.2: BACKSLASH NORMALIZATION
    // Consolidate excessive backslashes on commands and delimiters (e.g. \\\\begin -> \begin)
    // VERSION 1.6.4: Expanded to common math commands used in learning content
    text = text.replace(/\\\\+(begin|end|\[|\]|\(|\)|text|frac|sqrt|angle|circ|degree|theta|alpha|beta|gamma|Delta|Sigma|Omega|mu|lambda|infty|pm|times|div|approx|neq|le|ge|cdot|Rightarrow|leftarrow|rightarrow|implies|iff|parallel|because|therefore)/g, '\\$1');

    // Version 1.6.2: DELIMITER DE-NESTER
    // Fix stranded environments where AI wraps math delimiters INSIDE the environment (e.g. \begin{aligned} \[ ... \] \end{aligned})
    // This causes splitContentByDelimiters to leave the \begin tags orphaned in text mode.
    text = text.replace(/\\begin\{([a-zA-Z*]+)\}\s*\\\[([\s\S]*?)\\\]\s*\\end\{\1\}/g, '\\[ \\begin{$1} $2 \\end{$1} \\]');
    text = text.replace(/\\begin\{([a-zA-Z*]+)\}\s*\\\(([\s\S]*?)\\\)\s*\\end\{\1\}/g, '\\[ \\begin{$1} $2 \\end{$1} \\]');

    // Version 1.6.2: ORPHAN CLEANUP
    // Remove stray \] or \) at the very end of the text
    text = text.replace(/\\\]\s*$/, '').replace(/\\\)\s*$/, '');

    // Version 1.6.3: DELIMITER BALANCER
    // If the AI opens a display block \[ but never closes it, KaTeX crashes instantly.
    // We count the occurrences and forcefully close the block at the absolute end of the text.
    const openDisplayCount = (text.match(/\\\[/g) || []).length;
    let closeDisplayCount = (text.match(/\\\]/g) || []).length;
    if (openDisplayCount > closeDisplayCount) {
        text += '\n\\]';
        console.warn('[MathUtils] v1.6.3: Forcefully balanced unclosed display block \\[');
    }

    // Version 1.6.3: INTERNAL DELIMITER PURGE
    // KaTeX forbids opening inline math mode \( while already inside display mode \[
    // We search inside all \[ ... \] blocks and absolutely PURGE any literal \( or \)
    text = text.replace(/\\\[([\s\S]*?)\\\]/g, (match, inner) => {
        if (!inner) return match;
        // Purge nested inline delimiters
        let cleanedInner = inner.replace(/\\\(/g, '').replace(/\\\)/g, '');
        // Note: We don't purge nested \[ \] here because the De-Nester handles exact nested environments,
        // and we want avoid stripping legitimate nested matrices, etc. But inline \( \) is strictly illegal.
        return `\\[${cleanedInner}\\]`;
    });

    // 0.5 SURGICAL SELF-HEALING (v1.5.4)
    // If the AI generated \begin{aligned} but forgot \end{aligned} INSIDE math delimiters, 
    // we must inject the closer INSIDE the delimiters so KaTeX parsing matches.
    const envsToCheck = ['aligned', 'cases', 'array', 'matrix', 'pmatrix', 'bmatrix', 'vmatrix'];

    // Process content inside delimiters surgically
    text = text.replace(/(\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\))/g, (match) => {
        let content = match;
        const closingDelim = content.endsWith('\\]') ? '\\]' : '\\)';

        envsToCheck.forEach(env => {
            const begins = (content.match(new RegExp(`\\\\begin\\{${env}\\}`, 'g')) || []).length;
            const ends = (content.match(new RegExp(`\\\\end\\{${env}\\}`, 'g')) || []).length;
            if (begins > ends) {
                // Determine closing delimiter length (usually 2 for \[ or \)
                // Inject \end{env} right before the closing delimiter
                content = content.slice(0, -2) + ` \\end{${env}} ` + closingDelim;
                console.debug(`[MathUtils] Surgically healed unclosed environment: \\begin{${env}} inside ${closingDelim}`);
            }
        });
        return content;
    });

    // Fallback: Global healing for unclosed environments outside of delimiters
    envsToCheck.forEach(env => {
        const begins = (text.match(new RegExp(`\\\\begin\\{${env}\\}`, 'g')) || []).length;
        const ends = (text.match(new RegExp(`\\\\end\\{${env}\\}`, 'g')) || []).length;
        if (begins > ends) {
            text += `\n\\end{${env}}`;
            console.debug(`[MathUtils] Globally healed unclosed environment: \\begin{${env}}`);
        }
    });

    // 1. NEUTRAL ZONE: Prevent nested delimiters like \[ \[ ... \] \]
    // Version 1.4.7: Apply to WHOLE string before split to handle newlines between delimiters
    text = text.replace(/\\\[\s*\\\[/g, '\\[').replace(/\\\]\s*\\\]/g, '\\]');
    text = text.replace(/\\\(\s*\\\(/g, '\\(').replace(/\\\)\s*\\\)/g, '\\)');

    // 2. PER-LINE SURGICAL STRIP
    // We split by newline and strip ampersands for PROSE lines.
    // Version 1.4.8: STATEFUL stripper that respects multiline environments
    let currentInEnv = false;
    text = text.split('\n').map(line => {
        const trimmed = line.trim();
        const envStart = /\\begin\{(aligned|cases|array|matrix|pmatrix|bmatrix|vmatrix|align\*?|eqnarray|gather|split)\}/i.test(trimmed);
        const envEnd = /\\end\{(aligned|cases|array|matrix|pmatrix|bmatrix|vmatrix|align\*?|eqnarray|gather|split)\}/i.test(trimmed);

        if (envStart) currentInEnv = true;

        // Version 1.5.6: Proactive reset. If we see prose text or a bullet points, we likely left the math environment.
        if (TEXT_LIKE_PREFIXES.test(trimmed) || /^[•\-*]\s/.test(trimmed)) currentInEnv = false;

        let result = line;
        // If we aren't explicitly inside a LaTeX environment, KILL ALL AMPERSANDS.
        if (!currentInEnv) {
            result = result.replace(/\\?&=\s*/g, ' = ').replace(/\\?&/g, ' ');
        } else {
            // Inside env, strip ampersands if they are preceded/followed by multiple letters (likely prose mistake)
            result = result.replace(/(?<=[a-z]{2,})\s*\\?&/gi, ' ').replace(/\\?&\s*(?=[a-z]{2,})/gi, ' ');
        }

        if (envEnd) currentInEnv = false;
        return result;
    }).join('\n');

    // Repair corrupted Unicode artifacts seen in some AI outputs (e.g. x2220 -> \angle)
    text = text.replace(/(?<!\\)x2220/g, ' ∠ ')
        .replace(/(?<!\\)x25EF/g, ' ○ ');

    // 0.0 PROTECT INLINE CODE BLOCKS
    const codeBlocks = [];
    text = text.replace(/`([^`]+)`/g, (match) => {
        codeBlocks.push(match);
        return `___CODEBLOCK_${codeBlocks.length - 1}___`;
    });

    // -1. ALIGN ENVIRONMENT FIX: Convert align*/aligned to display math
    // KaTeX cannot render {align*} or {aligned} in inline mode — they must be in display mode
    // We force all major environments into display block `\[ ... \]` to prevent KaTeX inline ParseErrors (which causes the amber text fallback).
    text = text.replace(/\\begin\{(align\*?|aligned|cases|array|matrix|pmatrix|bmatrix|vmatrix)\}([\s\S]*?)\\end\{\1\}/g, (match, env, inner) => {
        const outputEnv = env.startsWith('align') ? 'aligned' : env;
        return `\\[ \\begin{${outputEnv}} ${inner} \\end{${outputEnv}} \\]`;
    });

    // -0.5. SENTENCE SPACING FIX: Add space after fullstop/comma before capital letters
    // Catches AI output like "x > 8.When" → "x > 8. When" and "satisfied.Thus" → "satisfied. Thus"
    text = text.replace(/\.([A-Z])/g, '. $1');
    text = text.replace(/,([A-Z])/g, ', $1');
    // Catches AI output like "1 and 3The sum" -> "1 and 3. The sum" or "1 and 3 The sum"
    text = text.replace(/([0-9a-z])([A-Z][a-z]{2,})/g, (match, prev, word) => {
        // Exclude math parts like "xDelta"
        if (word === 'Delta' || word === 'Sigma' || word === 'Phi') return match;
        return `${prev} ${word}`;
    });

    // 0. DOLLAR DELIMITER HANDLING
    // We only treat $...$ or $$...$$ as math if they contain math-like content.
    // Otherwise, we protect them as currency.
    text = text.replace(/(\$\$?)([\s\S]+?)\1/g, (match, delim, inner) => {
        const trimmedInner = inner.trim();
        // If it looks like math, convert to standard LaTeX delimiters
        if (looksLikeMath(trimmedInner) || (delim === '$$' && trimmedInner.length < 50)) {
            return delim === '$$' ? `\\[ ${trimmedInner} \\]` : `\\( ${trimmedInner} \\)`;
        }
        // Otherwise, it might be currency or a false positive. We'll protect it below.
        return match;
    });

    // Protect HK$ and escaped \$
    text = text
        .replace(/HK\\*\$/gi, '___HKD___')
        .replace(/\\*\$/g, (match) => {
            // If it's part of an already converted delimiter, ignore
            return match === '$' ? '___USD___' : match;
        });

    // 0.5 FALLBACK REPAIR: AI sometimes uses [ ... ] instead of \[ ... \] for math blocks
    text = text.replace(/(?<!\\)\[([\s\S]+?)(?<!\\)\]/g, (match, inner) => {
        const trimmed = inner.trim();
        if (trimmed.startsWith('DIAGRAM REQUIRED') || trimmed.startsWith('TABLE REQUIRED')) return match;
        if (/[\\_^=><]/.test(trimmed) || /log|sin|cos|tan|frac|sqrt/.test(trimmed) || looksLikeMath(trimmed)) {
            return `\\[ ${trimmed} \\]`;
        }
        return match;
    });

    // 1. Auto-wrap orphaned LaTeX fragments
    text = wrapOrphanedLaTeX(text);

    // 2. UNWRAP logic: Strip delimiters from prose-heavy blocks
    text = unwrapProseFromMathDelimiters(text);

    // 3. GLOBAL UNSQUASH
    text = unsquashProse(text);

    text = cleanStringForMath(text);
    text = text.replace(/\\n/g, '\n');

    // 4. PRESERVE DELIMITERS & CLEAN NESTED/CONFLICTING ONES
    text = text
        .replace(/\\+(\[)/g, '\\[')
        .replace(/\\+(\])/g, '\\]')
        .replace(/\\+(\()/g, '\\(')
        .replace(/\\+(\))/g, '\\)');

    text = text
        .replace(/\\\(\s+/g, '\\(')
        .replace(/\s+\\\)/g, '\\)')
        .replace(/\\\[\s+/g, '\\[')
        .replace(/\s+\\\]/g, '\\]');

    // Remove nested same-type delimiters (e.g. \[ \[ ... \] \])
    text = text.replace(/\\\[\s*\\\[/g, '\\[').replace(/\\\]\s*\\\]/g, '\\]');
    text = text.replace(/\\\(\s*\\\(/g, '\\(').replace(/\\\)\s*\\\)/g, '\\)');

    // Resolve conflicting nested delimiters (e.g. \( \[ ... \] \) -> \[ ... \])
    // The inner Display block should take precedence to prevent inline ParseErrors
    text = text.replace(/\\\(\s*\\\[/g, '\\[').replace(/\\\]\s*\\\)/g, '\\]');

    // 5. Ensure spaces exist around inline math if they touch words (Fix for AI missing spaces)
    text = text
        .replace(/([a-zA-Z0-9])\\\(/g, '$1 \\\\(')
        .replace(/\\\)([a-zA-Z0-9])/g, '\\\\) $1');

    // 6. PROSE-IN-MATH REPAIR (v1.5.8 - Universal)
    // Re-engineered to catch all styles of delimiters
    text = text.replace(/(?:\\)?\\[\(\[]([\s\S]+?)(?:\\)?\\[\)\]]|(?:\$\$?)([\s\S]+?)\$\$?/g, (match, innerSlash, innerDollar) => {
        const inner = innerSlash || innerDollar;
        if (!inner) return match;

        // Version 1.6.0: Enhanced prose repair regex.
        // Now catches single words (e.g. \(Since\)) and allows trailing punctuation.
        // We've minimized exclusions to ensure prose words like 'therefore' are safely wrapped in \text{}
        let repaired = inner.replace(/(?<!\\)\b([a-zA-Z]{2,}(?:\s+(?:[a-zA-Z]{1,2}|[a-zA-Z]{3,}))*(?:\s+[a-zA-Z]{2,})*['",.)]?)/g, (m) => {
            const lower = m.toLowerCase().trim().replace(/['",.)]+$/, '');
            // Do NOT wrap standard alignment/math environments
            if (['aligned', 'alignat', 'alignedat', 'cases', 'matrix', 'pmatrix', 'bmatrix', 'vmatrix', 'Bmatrix', 'array', 'gather', 'split'].includes(lower)) return m;
            return `\\text{${m}}`;
        });

        // Re-wrap in original delimiters
        if (match.startsWith('\\[')) return `\\[ ${repaired} \\]`;
        if (match.startsWith('\\(')) return `\\( ${repaired} \\)`;
        if (match.startsWith('$$')) return `$$ ${repaired} $$`;
        return `$ ${repaired} $`;
    });

    // RESTORE INLINE CODE BLOCKS
    codeBlocks.forEach((block, i) => {
        text = text.replace(`___CODEBLOCK_${i}___`, block);
    });

    return text;
};

export const splitContentByDelimiters = (text) => {
    if (!text || typeof text !== 'string') return [text || ''];
    const delimiterRegex = /(\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|\$\$[\s\S]*?\$\$|\$[^$\n]+?\$)/g;
    return text.split(delimiterRegex);
};
