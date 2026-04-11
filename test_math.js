const looksLikeMath = (str) => {
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
    
    if (hasPlainEnglish && !/[=><+\-]/.test(trimmed) && !/\\[a-z]+\{/i.test(trimmed)) return false;

    // Fast-fail if it starts with a text prefix and has 3+ words
    const TEXT_LIKE_PREFIXES = /^(Step\s*\d*\s*:?|Solution|Answer|Therefore|Hence|So\s*:?|We can rewrite|Substitute|Then|And|Assume|Let|Given|Since|Because|Actually|In this case|In general|If the|Complete|For\s|When|Note|Recall|Using|By\s|From|Apply|Consider|Now|Total|Profit|Loss|Markup|Discount|Price|Cost|Earnings|Revenue|Commission|Principal|Interest|Amount|Sum|Formula|The\s|This\s|That\s|Each\s|Find|Calculate|Determine|Evaluate|Simplify|Solve|Compare|Check|Verify|Area|Volume|Width|Length|Height|Radius|Diameter|At\s|Angle\s)/i;
    if (words.length >= 3 && TEXT_LIKE_PREFIXES.test(trimmed)) return false;

    return (
        trimmed.includes('\\') ||
        trimmed.includes('$') ||
        trimmed.includes('^') ||
        trimmed.includes('_') ||
        trimmed.includes('{') ||
        trimmed.includes('}') ||
        /\b(arrow|theta|pi|phi|infty|times|pm|mp|le|ge|ne|alpha|beta|gamma|delta|epsilon|zeta|eta|iota|kappa|lambda|mu|nu|xi|omicron|rho|sigma|tau|upsilon|chi|psi|omega)\b/i.test(trimmed) ||
        /[0-9][a-z0-9]+\^[a-z0-9]+/i.test(trimmed) || 
        /[0-9][a-z0-9]+\/[a-z0-9]+/i.test(trimmed) ||  
        /^[0-9\s.+*/%-]+[=><][=><]?/.test(trimmed) || 
        /^[A-Z][0-9]\s?=\s?.*/.test(trimmed)
    );
};

const roadmapWithNote = "Note: Master the 'Golden Rules' of sign reversal first. Progress from simple linear inequalities to compound conditions (AND / OR). Finally, master quadratic inequalities and graphical systems for Section B optimization.";
console.log("Result for Roadmap with Note:", looksLikeMath(roadmapWithNote));

const roadmapBare = "Master the 'Golden Rules' of sign reversal first. Progress from simple linear inequalities to compound conditions (AND / OR). Finally, master quadratic inequalities and graphical systems for Section B optimization.";
console.log("Result for Roadmap Bare:", looksLikeMath(roadmapBare));

const zhText = "首先掌握等號變向的「黃金律」。從簡單的一元一次不等式進階到複合條件（「且」與「或」）。最後，精通一元二次不等式及平面圖像系統，以應對乙部的最合化題目。";
console.log("Result for Roadmap ZH:", looksLikeMath(zhText));

const conceptText = "AND requires BOTH conditions to be true (Overlap). OR requires AT LEAST one to be true (Union).";
console.log("Result for Concept MOD_02:", looksLikeMath(conceptText));
