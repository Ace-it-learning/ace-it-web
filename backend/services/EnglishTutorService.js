const GenerativeAIService = require('./GenerativeAIService');
const TokenService = require('./TokenService');
const admin = require('firebase-admin');

/**
 * EnglishTutorService
 * Handles specialized "Money Maker" AI features:
 * 1. AI Writing Polisher (Triple-Tier)
 * 2. Reading Decoder (Structural Deconstruction)
 * 3. Contextual Vocabulary (Ace Chips)
 */
class EnglishTutorService {

    /**
     * Feature A: AI Writing Polisher ("The Money Maker")
     * Transitions functional English to sophisticated English with a Triple-Tier Polish.
     * @param {string} text - The student's input text (sentence or paragraph).
     * @param {string} uid - User ID for token logging.
     * @param {string} context - Optional context (e.g. "Essay on Technology").
     */
    static async polishWriting(text, uid, context = 'General Writing') {
        const prompt = `Act as an HKEAA Senior Examiner. Perform a **Triple-Tier Polish** on the following student writing.

        CONTEXT: ${context}
        STUDENT TEXT: "${text}"

        ### INSTRUCTIONS:
        1. **Original**: Keep the student's input exactly as is.
        2. **Level Up (Target L4/5)**: Improve vocabulary and sentence variety while keeping the original meaning. Focus on clarity and accuracy.
        3. **Ace Level (Target 5**)**: Rewrite using sophisticated syntax (e.g., inversion, nominalization, cleft sentences) and precise 'show-not-tell' vocabulary. This must be DSE 5** standard.
        4. **The 'Why'**: Explain the improvements using DSE criteria: *Content, Language, and Organization*. Compare the Original vs Ace versions.

        ### JSON OUTPUT FORMAT:
        {
            "original": "...",
            "level_up": "...",
            "ace_level": "...",
            "rationale": {
                "summary": "Brief explanation...",
                "key_improvements": ["Point 1", "Point 2"]
            }
        }
        Return ONLY the JSON.`;

        try {
            const result = await GenerativeAIService.generateContent(prompt, {
                generationConfig: { responseMimeType: "application/json" }
            });

            if (result.response.usageMetadata) {
                TokenService.logUsage(uid || 'system', 'tutor_polish', result.response.usageMetadata);
            }

            const responseText = result.response.text();
            return JSON.parse(this.cleanJsonResponse(responseText));

        } catch (error) {
            console.error("Writing Polish Failed:", error);
            throw new Error("Failed to polish writing.");
        }
    }

    /**
     * Feature B: Reading Decoder ("The Logic Engine")
     * Structural Deconstruction of text or image.
     * @param {string} text - The reading passage text (optional if image provided).
     * @param {Buffer} imageBuffer - Image buffer of the reading passage (optional).
     * @param {string} mimeType - Mime type of the image (e.g. image/jpeg).
     * @param {string} uid - User ID.
     */
    static async decodeReading(text, imageBuffer, mimeType, uid) {
        let contentParts = [];

        const corePrompt = `Act as an Expert English Tutor. Perform a **Structural Deconstruction** on the provided reading passage/text.
        
        ### ANALYSIS GOALS:
        1. **Syntactic Breakdown**: Identify the main Subject-Verb-Object. Highlight subordinate clauses, complex structures, or 'distractors'.
        2. **Author’s Logic**: Explain *why* the author wrote this. Is it a counter-argument? Irony? Transition?
        3. **DSE Shortcut**: Point out 'Clue Words' (connectives, tonal shifts) that are critical for comprehension.

        ### JSON OUTPUT FORMAT:
        {
            "syntax_breakdown": {
                "main_clause": "...",
                "complexity_analysis": "..."
            },
            "author_logic": "...",
            "dse_shortcut": {
                "clue_word": "...",
                "explanation": "..."
            },
            "extracted_text": "..." // If image was provided, return the OCR text here
        }
        Return ONLY the JSON.`;

        contentParts.push(corePrompt);

        if (text) {
            contentParts.push(`\nTARGET TEXT: "${text}"`);
        }

        if (imageBuffer) {
            contentParts.push({
                inlineData: {
                    data: imageBuffer.toString('base64'),
                    mimeType: mimeType || 'image/jpeg'
                }
            });
            contentParts.push("\nAnalyze the text visible in this image.");
        }

        try {
            const result = await GenerativeAIService.generateContent(contentParts, {
                generationConfig: { responseMimeType: "application/json" }
            });

            if (result.response.usageMetadata) {
                TokenService.logUsage(uid || 'system', 'tutor_decode', result.response.usageMetadata);
            }

            const responseText = result.response.text();
            return JSON.parse(this.cleanJsonResponse(responseText));

        } catch (error) {
            console.error("Reading Decode Failed:", error);
            throw new Error("Failed to decode reading.");
        }
    }

    /**
     * Feature C: Contextual Vocabulary ("Ace Chips")
     * Generates "Golden Sentences" based on topic.
     * @param {string} topic - Current topic (e.g. "Environment", "Technology").
     * @param {string} uid - User ID.
     */
    static async generateVocabularyChips(topic, uid) {
        const prompt = `Generate 5 'Ace Vocabulary Chips' for the HKDSE English topic: '${topic}'.
        
        Each chip must include:
        1. **Target Word**: High-level vocabulary (Level 5+).
        2. **Golden Sentence**: A versatile, complex sentence using the word.
        3. **Transferability**: Which other topics this can apply to.

        ### JSON OUTPUT FORMAT:
        {
            "chips": [
                {
                    "word": "Ubiquitous",
                    "sentence": "In this digital era...",
                    "transferability": "Technology, Media, Culture"
                }
            ]
        }
        Return ONLY the JSON.`;

        try {
            const result = await GenerativeAIService.generateContent(prompt, {
                generationConfig: { responseMimeType: "application/json" }
            });

            if (result.response.usageMetadata) {
                TokenService.logUsage(uid || 'system', 'tutor_vocab', result.response.usageMetadata);
            }

            const responseText = result.response.text();
            return JSON.parse(this.cleanJsonResponse(responseText));

        } catch (error) {
            console.error("Vocabulary Generation Failed:", error);
            // Fallback
            return { chips: [] };
        }
    }

    /**
     * Feature D: Vocabulary Sentence Generator
     * Generate a DSE-level example sentence using a specific vocabulary word.
     * @param {string} word - The vocabulary word to use.
     * @param {string} level - Target DSE level (default: '5**').
     * @param {string} uid - User ID for token logging.
     */
    static async generateVocabularySentence(word, level = '5**', uid) {
        const prompt = `Act as an HKEAA Senior Examiner. Generate a **Golden Sentence** for HKDSE English students.

        VOCABULARY WORD: "${word}"
        TARGET LEVEL: ${level}

        ### INSTRUCTIONS:
        1. Create a sophisticated, natural-sounding sentence that demonstrates the word's usage at DSE Level ${level} standard.
        2. The sentence should:
           - Use advanced syntax (e.g., subordinate clauses, inversion, or nominalization if appropriate)
           - Be contextually relevant to common DSE topics (technology, education, society, environment, etc.)
           - Be 15-30 words long
           - Sound natural and not forced
        3. Return ONLY the sentence as plain text, no JSON, no quotes, no explanation.`;

        try {
            const result = await GenerativeAIService.generateContent(prompt);

            if (result.response.usageMetadata) {
                TokenService.logUsage(uid || 'system', 'tutor_vocab_sentence', result.response.usageMetadata);
            }

            const sentence = result.response.text().trim();
            return { sentence };

        } catch (error) {
            console.error("Sentence Generation Failed:", error);
            return { sentence: `Example: The ${word} demonstrates advanced usage in context.` };
        }
    }

    static cleanJsonResponse(text) {
        let cleaned = text.trim();
        if (cleaned.includes('```json')) {
            cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        } else if (cleaned.startsWith('```')) {
            cleaned = cleaned.replace(/```[\w]*\n?/g, '').replace(/```\n?/g, '').trim();
        }
        return cleaned;
    }
}

module.exports = EnglishTutorService;
