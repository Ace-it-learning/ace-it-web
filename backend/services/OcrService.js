const sharp = require("sharp");
const { DocumentAnalysisClient } = require("@azure/ai-form-recognizer");
const { AzureKeyCredential } = require("@azure/core-auth");

class OcrService {
    static getAzureConfig() {
        const endpoint = (
            process.env.AZURE_DOC_INTELLIGENCE_ENDPOINT
            || process.env.MICROSOFT_DOCUMENT_INTELLIGENCE_ENDPOINT
            || ""
        ).trim();
        const apiKey = (
            process.env.AZURE_DOC_INTELLIGENCE_KEY
            || process.env.MICROSOFT_DOCUMENT_INTELLIGENCE_KEY
            || ""
        ).trim();
        const locale = (
            process.env.AZURE_DOC_INTELLIGENCE_LOCALE
            || process.env.MICROSOFT_DOCUMENT_INTELLIGENCE_LOCALE
            || "en"
        ).trim();
        return { endpoint, apiKey, locale };
    }

    static getAzureClient() {
        const { endpoint, apiKey } = this.getAzureConfig();
        if (!endpoint || !apiKey) return null;
        return new DocumentAnalysisClient(endpoint, new AzureKeyCredential(apiKey));
    }

    /**
     * Azure returns one line per visual row; paragraphs/content preserve real breaks only.
     */
    static formatAzureDocumentText(result) {
        const paragraphs = (result?.paragraphs || [])
            .map((p) => (p?.content || "").trim())
            .filter(Boolean);
        if (paragraphs.length > 0) {
            return paragraphs.join("\n\n");
        }

        const content = (result?.content || "").trim();
        if (content) {
            return content.replace(/\n{3,}/g, "\n\n");
        }

        const lines = (result?.pages || []).flatMap((p) => p.lines || []);
        return this.reflowLineWrappedText(
            lines.map((l) => (l.content || "").trim()).filter(Boolean)
        );
    }

    /**
     * Merge soft line wraps; keep breaks after sentence endings when the next line looks like a new thought.
     */
    static reflowLineWrappedText(lines) {
        if (!lines.length) return "";
        const paragraphs = [];
        let current = "";

        for (const line of lines) {
            if (!current) {
                current = line;
                continue;
            }

            const prevEndsSentence = /[.!?]["')\]]*\s*$/.test(current);
            const nextStartsLower = /^[a-z(]/.test(line);
            const isSoftWrap = !prevEndsSentence || nextStartsLower;

            current = isSoftWrap ? `${current} ${line}` : `${current}\n\n${line}`;
        }

        if (current) paragraphs.push(current);
        return paragraphs.join("\n\n").trim();
    }

    static async runAzureRead(buffer) {
        const client = this.getAzureClient();
        if (!client) return { text: "", confidence: 0 };

        try {
            const { locale } = this.getAzureConfig();
            const poller = await client.beginAnalyzeDocument("prebuilt-read", buffer, {
                locale
            });
            const result = await poller.pollUntilDone();
            const pages = result?.pages || [];
            const text = this.formatAzureDocumentText(result);

            const words = pages.flatMap((p) => p.words || []).filter((w) => w?.content);
            let confidence = 0;
            if (words.length > 0) {
                const wordScores = words
                    .map((w) => Number(w.confidence))
                    .filter((n) => Number.isFinite(n) && n > 0);
                if (wordScores.length > 0) {
                    confidence = (wordScores.reduce((a, b) => a + b, 0) / wordScores.length) * 100;
                }
            }
            if (!confidence && text.length > 0) {
                confidence = 92;
            }

            return { text, confidence };
        } catch (err) {
            console.warn("[OcrService] Azure Document Intelligence read failed:", err.message);
            return { text: "", confidence: 0 };
        }
    }

    static scoreText(text, confidence) {
        if (!text) return 0;
        const clean = text.replace(/\s+/g, " ").trim();
        const words = clean.split(" ").filter(Boolean);
        const alphaWords = words.filter((w) => /[A-Za-z]/.test(w)).length;
        const brokenFragments = (clean.match(/\b[A-Za-z]\b/g) || []).length;
        return (confidence * 1.5) + (alphaWords * 2) - (brokenFragments * 1.2) + Math.min(clean.length / 20, 20);
    }

    static pickBestAzureCandidate(...results) {
        return results
            .filter((r) => r?.text?.trim())
            .sort((a, b) => this.scoreText(b.text, b.confidence) - this.scoreText(a.text, a.confidence))[0] || null;
    }

    static async extractDetailedFromBase64(base64Image) {
        if (!base64Image || typeof base64Image !== "string") {
            return { text: "", confidence: 0, uncertainTokens: [], engine: "none" };
        }

        if (!this.getAzureClient()) {
            console.warn(
                "[OcrService] Azure Document Intelligence is not configured. Set AZURE_DOC_INTELLIGENCE_ENDPOINT/KEY or MICROSOFT_DOCUMENT_INTELLIGENCE_ENDPOINT/KEY."
            );
            return { text: "", confidence: 0, uncertainTokens: [], engine: "azure_unconfigured" };
        }

        const source = Buffer.from(base64Image, "base64");
        const enhanced = await sharp(source)
            .rotate()
            .grayscale()
            .normalize()
            .linear(1.15, -8)
            .sharpen({ sigma: 1.1, m1: 0.8, m2: 1.2 })
            .resize({ width: 2200, withoutEnlargement: true })
            .png()
            .toBuffer();

        const [fromSource, fromEnhanced] = await Promise.all([
            this.runAzureRead(source),
            this.runAzureRead(enhanced)
        ]);
        const best = this.pickBestAzureCandidate(fromSource, fromEnhanced);

        if (!best?.text?.trim()) {
            console.warn("[OcrService] engine=azure_read — no text extracted");
            return { text: "", confidence: 0, uncertainTokens: [], engine: "azure_read" };
        }

        console.log(
            `[OcrService] engine=azure_read confidence=${Math.round(best.confidence || 0)} chars=${best.text.length}`
        );
        return {
            text: best.text,
            confidence: Number(best.confidence || 0),
            uncertainTokens: [],
            engine: "azure_read"
        };
    }

    static async extractTextFromBase64(base64Image) {
        const detailed = await this.extractDetailedFromBase64(base64Image);
        return detailed.text || "";
    }
}

module.exports = OcrService;
