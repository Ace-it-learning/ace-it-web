const fs = require('fs');
const path = require('path');

const filePath = 'backend/data/math_content/math_stat_charts_questions.json';
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const hardenQuestionText = (text) => {
    if (!text || typeof text !== 'string') return text;
    
    // 1. Ensure display math for arrays
    let result = text.replace(/(\\\[|\$|\\\()?\s*(\\+begin\{array\}[\s\S]*?\\+end\{array\})\s*(\\\]|\$|\\\))?/g, (match, open, inner, close) => {
        // Clean inner math
        let clean = inner
            // Normalize all backslashes to single ones first
            .replace(/\\\\+/g, '\\')
            // Then force double backslashes for newlines (\\\\ in JSON file)
            .replace(/\\\\?\s*\\\\?/g, '\\\\')
            // Ensure hline has a backslash
            .replace(/hline/g, '\\hline')
            // Ensure & is preserved
            .replace(/&/g, ' & ')
            .replace(/\s+/g, ' ');
            
        return `\n\n$$\n${clean}\n$$\n`;
    });
    
    return result;
};

const fixed = data.map(q => {
    // 1. Harden EN
    q.question_en = hardenQuestionText(q.question_en);
    
    // 2. Bilingual Sync: if ZH is missing the diagram, copy from EN
    if (q.question_zh && q.question_en.includes('$$')) {
        const diagramMatch = q.question_en.match(/\$\$[\s\S]*?\$\$/);
        if (diagramMatch && !q.question_zh.includes('$$')) {
            q.question_zh = q.question_zh.trim() + '\n\n' + diagramMatch[0];
        }
    }
    
    // 3. Harden ZH
    q.question_zh = hardenQuestionText(q.question_zh);
    
    return q;
});

fs.writeFileSync(filePath, JSON.stringify(fixed, null, 2), 'utf8');
console.log('✅ Global LaTeX Hardening v6 Complete.');
