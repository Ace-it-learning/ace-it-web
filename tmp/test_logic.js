
const isChinese = true; // Simulating Chinese mode

const getLocalizedValue = (data, field) => {
    if (!data) return '';
    const val = data[field];
    const valZh = data[`${field}_zh` ];
    
    // Priority 1: Legacy explicit _zh field
    if (isChinese && valZh) return valZh;
    
    // Priority 2: Standard bilingual object {en, zh}
    if (val && typeof val === 'object') { // Fixed: added val check to avoid null
        if (isChinese) return val.zh || val.en || '';
        return val.en || val.zh || '';
    }
    
    // Priority 3: Flat string fallback
    return val || '';
};

// Test cases
console.log("Test 1 (New Structure):", getLocalizedValue({ g: { en: "E", zh: "Z" } }, 'g') === "Z" ? "PASS" : "FAIL");
console.log("Test 2 (Old Structure _zh):", getLocalizedValue({ g: "E", g_zh: "Z" }, 'g') === "Z" ? "PASS" : "FAIL");
console.log("Test 3 (Old Structure English only):", getLocalizedValue({ g: "E" }, 'g') === "E" ? "PASS" : "FAIL");
console.log("Test 4 (Null data):", getLocalizedValue(null, 'g') === "" ? "PASS" : "FAIL");
console.log("Test 5 (Null field):", getLocalizedValue({ g: null }, 'g') === "" ? "PASS" : "FAIL");

// Test regex
const sanitize = str => str?.replace(/[^a-z0-9\u4e00-\u9fa5]/gi, '').toLowerCase().trim() || '';
const buildFuzzy = (phrase) => {
    // Current logic
    const words = phrase.split(/\s+/).filter(w => w.length > 0);
    return words
        .map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        .join('[^a-z0-9\u4e00-\u9fa5]*');
}

const p1 = "Hello world";
const e1 = "Hello, world!";
console.log("Regex Test 1 (English with punct):", new RegExp(buildFuzzy(p1), 'gi').test(e1) ? "PASS" : "FAIL");

const p2 = "你好世界";
const e2 = "你好，世界";
console.log("Regex Test 2 (Chinese with punct):", new RegExp(buildFuzzy(p2), 'gi').test(e2) ? "PASS" : "FAIL (Expected failure due to current BUG)");

const buildFuzzyBetter = (phrase) => {
    // Better logic: treat every character as potentially separated by punct if it's Chinese-heavy
    // or just always split by character if no spaces found.
    const hasSpaces = /\s/.test(phrase);
    if (!hasSpaces) {
        return phrase.split('')
            .map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
            .join('[^a-z0-9\u4e00-\u9fa5]*');
    }
    const words = phrase.split(/\s+/).filter(w => w.length > 0);
    return words
        .map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        .join('[^a-z0-9\u4e00-\u9fa5]*');
}
console.log("Regex Test 3 (Chinese with punct - Better):", new RegExp(buildFuzzyBetter(p2), 'gi').test(e2) ? "PASS" : "FAIL");
