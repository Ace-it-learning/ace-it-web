const Tesseract = require("tesseract.js");
const sharp = require("sharp");
const { DocumentAnalysisClient } = require("@azure/ai-form-recognizer");
const { AzureKeyCredential } = require("@azure/core-auth");

class OcrService {
    static getAzureClient() {
        const endpoint = process.env.AZURE_DOC_INTELLIGENCE_ENDPOINT;
        const apiKey = process.env.AZURE_DOC_INTELLIGENCE_KEY;
        if (!endpoint || !apiKey) return null;
        return new DocumentAnalysisClient(endpoint, new AzureKeyCredential(apiKey));
    }

    static async runAzureRead(buffer) {
        const client = this.getAzureClient();
        if (!client) return { text: "", confidence: 0 };

        const poller = await client.beginAnalyzeDocument("prebuilt-read", buffer, {
            locale: process.env.AZURE_DOC_INTELLIGENCE_LOCALE || "en-US"
        });
        const result = await poller.pollUntilDone();
        const lines = result?.pages?.flatMap((p) => p.lines || []) || [];
        const text = lines.map((l) => l.content || "").join("\n").trim();

        const avgConfidence = lines.length
            ? lines.reduce((acc, l) => acc + Number(l.confidence || 0), 0) / lines.length
            : 0;

        return { text, confidence: avgConfidence * 100 };
    }

    static async runTesseract(buffer, lang = "eng") {
        const result = await Tesseract.recognize(buffer, lang, {
            logger: () => {}
        });
        const text = (result?.data?.text || "").trim();
        const confidence = Number(result?.data?.confidence || 0);
        const words = (result?.data?.words || []).map((w) => ({
            text: (w?.text || "").trim(),
            confidence: Number(w?.confidence || 0)
        })).filter((w) => w.text);
        const lines = (result?.data?.lines || []).map((l) => ({
            text: (l?.text || "").trim(),
            confidence: Number(l?.confidence || 0),
            bbox: l?.bbox || null
        })).filter((l) => l.text);
        return { text, confidence, words, lines };
    }

    static scoreText(text, confidence) {
        if (!text) return 0;
        const clean = text.replace(/\s+/g, " ").trim();
        const words = clean.split(" ").filter(Boolean);
        const alphaWords = words.filter((w) => /[A-Za-z]/.test(w)).length;
        const brokenFragments = (clean.match(/\b[A-Za-z]\b/g) || []).length;
        const score = (confidence * 1.5) + (alphaWords * 2) - (brokenFragments * 1.2) + Math.min(clean.length / 20, 20);
        return score;
    }

    static async runLineByLineRefinement(buffer, lang = "eng") {
        const base = await this.runTesseract(buffer, lang);
        if (!base?.lines?.length) return base;

        const meta = await sharp(buffer).metadata();
        const width = meta?.width || 0;
        const height = meta?.height || 0;
        if (!width || !height) return base;

        const refinedLines = [];
        const maxLines = 30;
        for (const line of base.lines.slice(0, maxLines)) {
            if (!Array.isArray(line.bbox) || line.bbox.length < 8) {
                refinedLines.push(line);
                continue;
            }
            const xs = [line.bbox[0], line.bbox[2], line.bbox[4], line.bbox[6]].map(Number);
            const ys = [line.bbox[1], line.bbox[3], line.bbox[5], line.bbox[7]].map(Number);
            const minX = Math.max(0, Math.min(...xs) - 10);
            const minY = Math.max(0, Math.min(...ys) - 8);
            const maxX = Math.min(width, Math.max(...xs) + 10);
            const maxY = Math.min(height, Math.max(...ys) + 8);
            const cropW = Math.max(1, Math.floor(maxX - minX));
            const cropH = Math.max(1, Math.floor(maxY - minY));

            try {
                const lineImg = await sharp(buffer)
                    .extract({ left: Math.floor(minX), top: Math.floor(minY), width: cropW, height: cropH })
                    .grayscale()
                    .normalize()
                    .linear(1.18, -7)
                    .sharpen()
                    .png()
                    .toBuffer();
                const reread = await this.runTesseract(lineImg, lang);
                if (reread?.text && reread.text.length >= Math.max(3, line.text.length * 0.45)) {
                    refinedLines.push({ text: reread.text, confidence: reread.confidence });
                } else {
                    refinedLines.push(line);
                }
            } catch {
                refinedLines.push(line);
            }
        }

        const text = refinedLines.map((l) => l.text).join("\n").trim();
        const confidence = refinedLines.length
            ? refinedLines.reduce((acc, l) => acc + Number(l.confidence || 0), 0) / refinedLines.length
            : base.confidence;
        return { text, confidence, lines: refinedLines, words: base.words || [] };
    }

    static extractUncertainTokens(words = []) {
        const uncertain = words
            .filter((w) => w.text && w.confidence > 0 && w.confidence < 70)
            .map((w) => w.text)
            .filter((t) => /^[A-Za-z][A-Za-z_-]{1,}$/.test(t));
        return [...new Set(uncertain)].slice(0, 25);
    }

    static async extractDetailedFromBase64(base64Image, lang = "eng") {
        if (!base64Image || typeof base64Image !== "string") {
            return { text: "", confidence: 0, uncertainTokens: [], engine: "none" };
        }
        const source = Buffer.from(base64Image, "base64");

        // Multi-pass OCR with different preprocessing to improve handwriting robustness.
        const enhanced = await sharp(source)
            .rotate() // auto-orient from EXIF
            .grayscale()
            .normalize()
            .linear(1.15, -8) // mild contrast lift
            .sharpen({ sigma: 1.1, m1: 0.8, m2: 1.2 })
            .resize({ width: 2200, withoutEnlargement: true })
            .png()
            .toBuffer();

        const binarized = await sharp(enhanced)
            .threshold(170)
            .png()
            .toBuffer();

        const [azureRes, rawRes, enhancedRes, binaryRes, lineRefinedRes] = await Promise.all([
            this.runAzureRead(enhanced),
            this.runTesseract(source, lang),
            this.runTesseract(enhanced, lang),
            this.runTesseract(binarized, lang),
            this.runLineByLineRefinement(enhanced, lang)
        ]);

        const candidates = [azureRes, rawRes, enhancedRes, binaryRes, lineRefinedRes].filter((c) => c.text && c.text.length > 0);
        if (candidates.length === 0) return { text: "", confidence: 0, uncertainTokens: [], engine: "none" };

        candidates.sort((a, b) => this.scoreText(b.text, b.confidence) - this.scoreText(a.text, a.confidence));
        const best = candidates[0];
        const uncertainTokens = this.extractUncertainTokens(best.words || []);
        return {
            text: best.text,
            confidence: Number(best.confidence || 0),
            uncertainTokens,
            engine: best === azureRes ? "azure_read" : "tesseract"
        };
    }

    static async extractTextFromBase64(base64Image, lang = "eng") {
        const detailed = await this.extractDetailedFromBase64(base64Image, lang);
        return detailed.text || "";
    }
}

module.exports = OcrService;
