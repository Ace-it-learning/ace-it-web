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

const getFirstSentence = (text = '') => {
  const trimmed = text.replace(/\s+/g, ' ').trim();
  const match = trimmed.match(/^(.{40,220}?[.!?])\s/);
  return match ? match[1] : `${trimmed.slice(0, 180)}${trimmed.length > 180 ? '...' : ''}`;
};

const inferTag = (paragraph = '', index, total) => {
  const lower = paragraph.toLowerCase();
  if (index === 0) return 'CONTEXT';
  if (index === total - 1) return 'CONCLUSION';
  if (/\b(however|nevertheless|although|despite|on the other hand|critics|whereas)\b/.test(lower)) return 'COUNTERPOINT';
  if (/\b\d+%|\bhk\$|\baccording to\b|\bstudy\b|\bresearch\b|\bdata\b|\bexperts?\b/.test(lower)) return 'EVIDENCE';
  return 'ELABORATES';
};

const inferConnectorType = (paragraph = '') => {
  const lower = paragraph.toLowerCase();
  if (/\b(however|nevertheless|although|despite|on the other hand|whereas)\b/.test(lower)) return 'HOWEVER';
  if (/\b(for example|for instance|such as|including)\b/.test(lower)) return 'FOR_EXAMPLE';
  if (/\b(moreover|furthermore|in addition|also)\b/.test(lower)) return 'IN_ADDITION';
  if (/\b(therefore|thus|hence|as a result|consequently)\b/.test(lower)) return 'THEREFORE';
  return 'ELABORATES';
};

const extractSignals = (paragraph = '') => {
  const signals = ['however', 'nevertheless', 'although', 'despite', 'for example', 'for instance', 'such as', 'including', 'moreover', 'furthermore', 'in addition', 'therefore', 'thus', 'as a result', 'consequently'];
  const lower = paragraph.toLowerCase();
  return signals.filter(signal => lower.includes(signal)).slice(0, 3);
};

const buildFallbackScaffold = (paras) => {
  const stopWords = new Set(['because', 'through', 'between', 'students', 'education', 'academic', 'paragraph', 'school', 'schools']);
  const vocabMap = new Map();

  paras.forEach((paragraph, paragraphIndex) => {
    const words = paragraph.match(/\b[A-Za-z][A-Za-z'-]{7,}\b/g) || [];
    words.forEach((word) => {
      const key = word.toLowerCase();
      if (!stopWords.has(key) && !vocabMap.has(key) && vocabMap.size < 10) {
        vocabMap.set(key, {
          word,
          pos: 'word',
          definition: 'A useful higher-level word from this passage. Use the sentence around it to infer the exact meaning.',
          translation: '按上下文推斷',
          position: paragraphIndex
        });
      }
    });
  });

  return {
    fallback: true,
    vocab: Array.from(vocabMap.values()),
    tags: paras.map((paragraph, index) => {
      const tag = inferTag(paragraph, index, paras.length);
      return {
        index,
        tag,
        summary: {
          en: getFirstSentence(paragraph),
          zh: '本段重點可先從主題句、數據和轉折詞判斷。'
        },
        key_phrases: (paragraph.match(/\b[A-Za-z][A-Za-z'-]{5,}\b/g) || []).slice(0, 4),
        dse_tip: {
          en: 'Use the first and last sentence to decide the paragraph purpose before answering detail questions.',
          zh: '先看首句和尾句判斷段落作用，再回答細節題。'
        }
      };
    }),
    connectors: paras.slice(1).map((paragraph, offset) => {
      const to = offset + 1;
      const type = inferConnectorType(paragraph);
      return {
        from: to - 1,
        to,
        type,
        bridge_sentence: {
          en: `Paragraph ${to + 1} develops the idea from paragraph ${to}.`,
          zh: `第 ${to + 1} 段延續或發展第 ${to} 段的意思。`
        },
        signal_words: extractSignals(paragraph),
        exam_insight: {
          en: 'A DSE question may ask how this paragraph links to the previous one.',
          zh: 'DSE 可能會問本段如何承接上一段。'
        }
      };
    })
  };
};

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
    // Flatten result for frontend
    res.json(vocabData.data || vocabData);

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
    // Flatten result for frontend
    res.json(tagData.data || tagData);

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
    // Flatten result for frontend
    res.json(connectorData.data || connectorData);

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

PARAGRAPHS (Use these indices for the JSON response):
${paras.map((p, i) => `[Paragraph ${i}] ${p}`).join('\n\n')}

Provide a comprehensive analysis with THREE layers. **IMPORTANT**: For all explanatory fields (summary, dse_tip, bridge_sentence, exam_insight), provide BOTH English and Traditional Chinese versions.

1. **VOCABULARY** (5-10 difficult words):
   - word, part of speech, simple definition, Traditional Chinese translation, approximate character position

2. **PARAGRAPH X-RAY** (one per paragraph):
   - "index": The paragraph number (0, 1, 2...) from the list above.
   - "tag": Purpose label (MAIN_CLAIM, EVIDENCE, COUNTERPOINT, REBUTTAL, CONTEXT, CONCLUSION)
   - "summary": { "en": "English 1-sentence summary", "zh": "繁體中文一句總結" }
   - "key_phrases": Array of 2-4 important phrases from the paragraph (in English, as they appear in the text)
   - "dse_tip": { "en": "English exam strategy tip", "zh": "繁體中文考試策略提示" }

3. **ARGUMENT MAP** (logical connections BETWEEN paragraphs):
   - "from": The source paragraph index (e.g., 0).
   - "to": The destination paragraph index (e.g., 1).
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
      model: 'ace-it-flash',
      generationConfig: {
        maxOutputTokens: 8192,
        temperature: 0.2
      }
    });

    // Flatten result: merge AI data with our paragraph mapping
    const finalData = scaffoldData.data || scaffoldData;

    res.json({
      ...finalData,
      paragraphs: paras
    });

  } catch (error) {
    console.error('[ReadingScaffold] Scaffold error:', error);
    const { passage, paragraphs } = req.body;
    let fallbackParas = paragraphs || (passage ? passage.split(/\n\n+/).filter(p => p.trim()) : []);

    if (fallbackParas.length === 1 && fallbackParas[0].length > 200) {
      const sentences = fallbackParas[0].match(/[^.!?]+[.!?]+/g) || [fallbackParas[0]];
      const targetParaCount = Math.min(5, Math.max(3, Math.floor(sentences.length / 3)));
      const sentencesPerPara = Math.ceil(sentences.length / targetParaCount);
      fallbackParas = [];
      for (let i = 0; i < sentences.length; i += sentencesPerPara) {
        fallbackParas.push(sentences.slice(i, i + sentencesPerPara).join(' ').trim());
      }
    }

    res.json({
      ...buildFallbackScaffold(fallbackParas),
      paragraphs: fallbackParas
    });
  }
});

module.exports = router;
