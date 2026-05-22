const express = require("express");
const multer = require("multer");
const rateLimit = require("express-rate-limit");
const sharp = require("sharp");
const { requireResolvedUid } = require("../middleware/requireResolvedUid");
const HandoffSessionService = require("../services/HandoffSessionService");
const OcrService = require("../services/OcrService");
const { isAzureStorage } = require("../config/runtime");
const { ensureContainer, createBlobReadSasUrl } = require("../storage/blobStorage");

const router = express.Router();

const mobileLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 60,
    message: { error: "Too many handoff requests from this device. Try again later." },
    standardHeaders: true,
    legacyHeaders: false
});

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 12 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        const ok = /^image\/(jpeg|jpg|png|webp|heic|heif)$/i.test(file.mimetype || "");
        if (ok) cb(null, true);
        else cb(new Error("Only image uploads are allowed"));
    }
});

const ACCEPT_MIME = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp", "image/heic", "image/heif"]);

async function prepareImageBufferForHandoff(buffer) {
    const meta = await sharp(buffer).metadata();
    const maxEdge = 2200;
    let pipe = sharp(buffer).rotate();
    if (meta.width && meta.height && (meta.width > maxEdge || meta.height > maxEdge)) {
        pipe = pipe.resize({
            width: meta.width >= meta.height ? maxEdge : undefined,
            height: meta.height > meta.width ? maxEdge : undefined,
            withoutEnlargement: true
        });
    }
    const out = await pipe.jpeg({ quality: 92 }).toBuffer();
    return { jpegBuffer: out, mimeType: "image/jpeg" };
}

async function uploadHandoffBlob(uid, sessionId, buffer, contentType, originalName) {
    if (!isAzureStorage()) {
        throw new Error("Azure blob storage is not enabled");
    }
    const containerName = process.env.AZURE_BLOB_CONTAINER || "aceit-assets";
    const safeName = (originalName || "photo.jpg").replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
    const blobName = `handoff/${uid}/${sessionId}/${Date.now()}_${safeName}`;
    const container = await ensureContainer(containerName);
    const client = container.getBlockBlobClient(blobName);
    await client.uploadData(buffer, {
        blobHTTPHeaders: { blobContentType: contentType || "image/jpeg" }
    });
    return createBlobReadSasUrl({ containerName, blobName });
}

/**
 * POST /api/handoff/sessions
 */
router.post("/sessions", requireResolvedUid, (req, res) => {
    try {
        const uid = req.uid || req.body?.uid;
        const { surface, meta } = req.body || {};
        if (!surface) {
            return res.status(400).json({ error: "Missing surface" });
        }
        const rec = HandoffSessionService.createSession({ uid, surface, meta });
        return res.json({
            sessionId: rec.sessionId,
            mobileToken: rec.mobileToken,
            streamTicket: rec.streamTicket,
            expiresAt: rec.expiresAt,
            maxUploads: rec.maxUploads,
            surface: rec.surface,
            meta: rec.meta
        });
    } catch (e) {
        console.error("[handoffRoutes] create session:", e.message);
        return res.status(400).json({ error: e.message || "Failed to create session" });
    }
});

/**
 * GET /api/handoff/sessions/:sessionId/stream?ticket=...
 */
router.get("/sessions/:sessionId/stream", (req, res) => {
    const { sessionId } = req.params;
    const ticket = (req.query.ticket || "").toString();
    if (!ticket) {
        return res.status(400).json({ error: "Missing ticket" });
    }

    const rec = HandoffSessionService.getSessionByStreamTicket(ticket);
    if (!rec || rec.sessionId !== sessionId) {
        return res.status(404).json({ error: "Invalid or expired session" });
    }
    if (!HandoffSessionService.assertSessionFresh(rec)) {
        return res.status(410).json({ error: "Session expired" });
    }

    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    if (typeof res.flushHeaders === "function") res.flushHeaders();

    HandoffSessionService.addSseClient(sessionId, res);
    HandoffSessionService.sseWrite(res, "connected", { sessionId, surface: rec.surface });

    const heartbeat = setInterval(() => {
        try {
            HandoffSessionService.sseWrite(res, "heartbeat", { t: Date.now() });
        } catch (_e) {
            clearInterval(heartbeat);
        }
    }, 25000);

    req.on("close", () => {
        clearInterval(heartbeat);
        HandoffSessionService.removeSseClient(sessionId, res);
    });
});

/**
 * GET /api/handoff/m/:token — public metadata for mobile page
 */
router.get("/m/:token", mobileLimiter, (req, res) => {
    const { token } = req.params;
    const rec = HandoffSessionService.getSessionByMobileToken(token);
    if (!rec || !HandoffSessionService.assertSessionFresh(rec)) {
        return res.status(404).json({ error: "Invalid or expired link" });
    }
    return res.json({
        surface: rec.surface,
        label: HandoffSessionService.surfaceLabel(rec.surface),
        expiresAt: rec.expiresAt,
        maxUploads: rec.maxUploads,
        uploadsSoFar: rec.uploadCount
    });
});

/**
 * POST /api/handoff/m/:token/upload — public mobile upload
 */
router.post("/m/:token/upload", mobileLimiter, (req, res, next) => {
    upload.single("photo")(req, res, (err) => {
        if (err) {
            const msg = err.message || "Upload failed";
            const code = err.code === "LIMIT_FILE_SIZE" ? 413 : 400;
            return res.status(code).json({ error: msg });
        }
        next();
    });
}, async (req, res) => {
    const { token } = req.params;
    const file = req.file;
    if (!file || !file.buffer) {
        return res.status(400).json({ error: "Missing photo file (field name: photo)" });
    }

    const mime = (file.mimetype || "").toLowerCase();
    if (!ACCEPT_MIME.has(mime)) {
        return res.status(400).json({ error: "Unsupported image type" });
    }

    const rec = HandoffSessionService.getSessionByMobileToken(token);
    if (!rec || !HandoffSessionService.assertSessionFresh(rec)) {
        return res.status(404).json({ error: "Invalid or expired link" });
    }

    if (rec.uploadCount >= rec.maxUploads) {
        return res.status(429).json({ error: "Maximum uploads for this session reached" });
    }

    try {
        let payload;

        if (rec.surface === "chat_essay_ocr") {
            const { jpegBuffer, mimeType } = await prepareImageBufferForHandoff(file.buffer);
            const base64Data = jpegBuffer.toString("base64");
            const detailed = await OcrService.extractDetailedFromBase64(base64Data);
            const text = (detailed?.text || "").trim();

            if (detailed.engine === "azure_unconfigured") {
                return res.status(503).json({
                    error: "OCR unavailable",
                    details: "Document Intelligence is not configured on the server."
                });
            }

            payload = {
                image: { data: base64Data, mimeType },
                transcription: text,
                engine: detailed.engine || "unknown",
                confidence: detailed.confidence ?? null
            };
        } else if (rec.surface === "chat_tutor_image") {
            const { jpegBuffer, mimeType } = await prepareImageBufferForHandoff(file.buffer);
            const base64Data = jpegBuffer.toString("base64");
            payload = {
                image: { data: base64Data, mimeType }
            };
        } else if (rec.surface === "writing_mock" || rec.surface === "writing_quest") {
            const { jpegBuffer, mimeType } = await prepareImageBufferForHandoff(file.buffer);
            const base64Data = jpegBuffer.toString("base64");
            const publicUrl = await uploadHandoffBlob(rec.uid, rec.sessionId, jpegBuffer, mimeType, file.originalname);

            // Run Azure OCR on handwritten uploads so the desktop can insert text into the editor
            const detailed = await OcrService.extractDetailedFromBase64(base64Data);
            const transcription = (detailed?.text || "").trim();

            if (rec.surface === "writing_mock") {
                const part = rec.meta && (rec.meta.part === "B" || rec.meta.part === "A") ? rec.meta.part : "A";
                payload = { publicUrl, part, transcription };
            } else {
                payload = { publicUrl, transcription };
            }
        } else {
            return res.status(400).json({ error: "Unknown surface" });
        }

        HandoffSessionService.incrementUpload(rec);

        HandoffSessionService.broadcast(rec.sessionId, "uploaded", {
            surface: rec.surface,
            payload
        });

        return res.json({ ok: true, uploadsRemaining: rec.maxUploads - rec.uploadCount });
    } catch (e) {
        console.error("[handoffRoutes] upload:", e.message);
        return res.status(500).json({ error: e.message || "Upload processing failed" });
    }
});

module.exports = router;
