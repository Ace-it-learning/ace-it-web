/**
 * Reading Scaffold Routes
 * Provides AI-powered reading comprehension scaffolding:
 * - Level 1: Vocabulary extraction and definitions
 * - Level 2: Paragraph purpose classification
 * - Level 3: Logic flow connector extraction
 */

const express = require('express');
const router = express.Router();
const GenerativeAIService = require('../services/GenerativeAIService');

// --- LEVEL 1: VOCABULARY EXTRACTION ---
router.post('/extract-vocab', async (req, res) => {
  try {
    const { passage, difficulty_level = 3 } = req.body;

    if (!passage) {
      return res.status(400).json({ error: 'Passage is required' });
    }

    const prompt = `You are a DSE English vocabulary expert. Analyze this passage and identify 5-10 difficult words that a Hong Kong secondary student (F.4-F.6) might struggle with.

PASSAGE:
"""
${passage}
"""

For each difficult word, provide:
1. The exact word as it appears in the text
2. Part of speech (noun, verb, adj, adv)
3. A simple English definition (1 sentence)
4. Traditional Chinese translation
5. The character position where it first appears (approximate)

Return ONLY valid JSON in this format:
{
  "vocab": [
    {
      "word": "draconian",
      "pos": "adj",
      "definition": "extremely harsh or severe",
      "translation": "嚴厲的",
      "position": 45
    }
  ]
}`;

    const vocabData = await GenerativeAIService.generateJson(prompt, {
      model: 'gemini-2.0-flash'
    });
    res.json(vocabData);

  } catch (error) {
    console.error('[ReadingScaffold] Vocab extraction error:', error);
    res.status(500).json({ error: 'Failed to extract vocabulary', details: error.message });
  }
});

// --- LEVEL 2: PARAGRAPH PURPOSE CLASSIFICATION ---
router.post('/classify-paragraphs', async (req, res) => {
  try {
    const { paragraphs } = req.body;

    if (!paragraphs || !Array.isArray(paragraphs)) {
      return res.status(400).json({ error: 'Paragraphs array is required' });
    }

    const prompt = `You are a DSE English reading comprehension expert. Classify the purpose of each paragraph in this passage.

PARAGRAPHS:
${paragraphs.map((p, i) => `[${i}] ${p}`).join('\n\n')}

For each paragraph, assign ONE of these tags:
- MAIN_CLAIM: The central argument or thesis
- EVIDENCE: Statistics, quotes, examples supporting a claim
- COUNTERPOINT: Opposing view, "However..." type arguments
- REBUTTAL: Author's response to counterpoint
- CONTEXT: Background information, setting the scene
- CONCLUSION: Summary, final position, recommendations

Return ONLY valid JSON:
{
  "tags": [
    {
      "index": 0,
      "tag": "MAIN_CLAIM",
      "explanation": "Introduces the central argument about technology in education"
    }
  ]
}`;

    const tagData = await GenerativeAIService.generateJson(prompt, {
      model: 'gemini-2.0-flash'
    });
    res.json(tagData);

  } catch (error) {
    console.error('[ReadingScaffold] Paragraph classification error:', error);
    res.status(500).json({ error: 'Failed to classify paragraphs', details: error.message });
  }
});

// --- LEVEL 3: LOGIC CONNECTOR EXTRACTION ---
router.post('/extract-connectors', async (req, res) => {
  try {
    const { paragraphs } = req.body;

    if (!paragraphs || !Array.isArray(paragraphs) || paragraphs.length < 1) {
      return res.status(400).json({ error: 'At least 1 paragraph required' });
    }

    const prompt = `You are a DSE English reading comprehension expert. Analyze the logical relationships in this passage.

PARAGRAPHS:
${paragraphs.map((p, i) => `[${i}] ${p}`).join('\n\n')}

${paragraphs.length > 1 ?
        `For each transition between paragraphs, identify:
1. The type of logical connection
2. The signal word or phrase (if any)` :
        `For this single paragraph, identify the internal logical flow between key sentences or ideas:
1. How the main claim connects to supporting evidence
2. Transitions between ideas within the paragraph
3. Signal words showing logical relationships
Use "from": 0, "to": 0 to indicate internal paragraph logic.`}

Connection types:
- LEADS_TO: Cause-effect (therefore, consequently, as a result)
- HOWEVER: Contrast (however, nevertheless, on the other hand)
- FOR_EXAMPLE: Illustration (for instance, such as, including)
- IN_ADDITION: Expansion (moreover, furthermore, additionally)
- THEREFORE: Conclusion (thus, hence, in conclusion)
- ELABORATES: Explains previous point in more detail

Return ONLY valid JSON:
{
  "connectors": [
    {
      "from": 0,
      "to": ${paragraphs.length > 1 ? '1' : '0'},
      "type": "LEADS_TO",
      "signal_word": "therefore"
    }
  ]
}`;

    const connectorData = await GenerativeAIService.generateJson(prompt, {
      model: 'gemini-2.0-flash'
    });
    res.json(connectorData);

  } catch (error) {
    console.error('[ReadingScaffold] Connector extraction error:', error);
    res.status(500).json({ error: 'Failed to extract connectors', details: error.message });
  }
});

// --- COMBINED SCAFFOLD ENDPOINT (All levels at once) ---
router.post('/scaffold', async (req, res) => {
  try {
    const { passage, paragraphs, level = 3 } = req.body;

    if (!passage && !paragraphs) {
      return res.status(400).json({ error: 'Passage or paragraphs required' });
    }

    // Split passage into paragraphs if not provided
    let paras = paragraphs || passage.split(/\n\n+/).filter(p => p.trim());

    // Fallback: If no paragraph breaks found (entire passage is one block), intelligently split by sentences
    if (paras.length === 1 && paras[0].length > 200) {
      console.log('[ReadingScaffold] No paragraph breaks detected. Splitting by sentence groups...');
      const sentences = paras[0].match(/[^.!?]+[.!?]+/g) || [paras[0]];
      const targetParaCount = Math.min(5, Math.max(3, Math.floor(sentences.length / 3)));
      const sentencesPerPara = Math.ceil(sentences.length / targetParaCount);

      paras = [];
      for (let i = 0; i < sentences.length; i += sentencesPerPara) {
        paras.push(sentences.slice(i, i + sentencesPerPara).join(' ').trim());
      }
      console.log(`[ReadingScaffold] Split into ${paras.length} paragraphs`);
    }

    const prompt = `You are a senior DSE English reading comprehension tutor. Analyze this passage and provide deep scaffolding data that helps a Hong Kong F.4-F.6 student truly understand the text's structure and argumentation.

PASSAGE (${paras.length} paragraphs):
"""
${passage || paras.join('\n\n')}
"""

Provide a comprehensive analysis with THREE layers. **IMPORTANT**: For all explanatory fields (summary, dse_tip, bridge_sentence, exam_insight), provide BOTH English and Traditional Chinese versions.

1. **VOCABULARY** (5-10 difficult words):
   - word, part of speech, simple definition, Traditional Chinese translation, approximate character position

2. **PARAGRAPH X-RAY** (one per paragraph):
   - "tag": Purpose label (MAIN_CLAIM, EVIDENCE, COUNTERPOINT, REBUTTAL, CONTEXT, CONCLUSION)
   - "summary": { "en": "English 1-sentence summary", "zh": "繁體中文一句總結" }
   - "key_phrases": Array of 2-4 important phrases from the paragraph (in English, as they appear in the text)
   - "dse_tip": { "en": "English exam strategy tip", "zh": "繁體中文考試策略提示" }

3. **ARGUMENT MAP** (connections between consecutive paragraphs):
   - "type": Relationship type (LEADS_TO, HOWEVER, FOR_EXAMPLE, IN_ADDITION, THEREFORE, ELABORATES)
   - "bridge_sentence": { "en": "English explanation of why paragraph B follows A", "zh": "繁體中文解釋為何段落B跟隨段落A" }
   - "signal_words": Array of actual linking words/phrases found in the text (in English)
   - "exam_insight": { "en": "English sample DSE question", "zh": "繁體中文DSE樣本問題" }

Return ONLY valid JSON:
{
  "vocab": [
    { "word": "...", "pos": "adj", "definition": "...", "translation": "...", "position": 0 }
  ],
  "tags": [
    { 
      "index": 0, 
      "tag": "MAIN_CLAIM", 
      "summary": { "en": "...", "zh": "..." }, 
      "key_phrases": ["...", "..."], 
      "dse_tip": { "en": "...", "zh": "..." } 
    }
  ],
  "connectors": [
    { 
      "from": 0, 
      "to": 1, 
      "type": "LEADS_TO", 
      "bridge_sentence": { "en": "...", "zh": "..." }, 
      "signal_words": ["..."], 
      "exam_insight": { "en": "...", "zh": "..." } 
    }
  ]
}`;

    const scaffoldData = await GenerativeAIService.generateJson(prompt, {
      model: 'gemini-2.0-flash'
    });

    // Include the paragraphs we used for analysis so frontend stays in sync
    res.json({
      ...scaffoldData,
      paragraphs: paras
    });

  } catch (error) {
    console.error('[ReadingScaffold] Scaffold error:', error);
    res.status(500).json({ error: 'Failed to generate scaffold', details: error.message });
  }
});

module.exports = router;
