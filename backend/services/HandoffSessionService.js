const crypto = require("crypto");
const NodeCache = require("node-cache");

const TTL_SEC = 20 * 60; // 20 minutes

const sessions = new NodeCache({ stdTTL: TTL_SEC, checkperiod: 120 });
const mobileIndex = new NodeCache({ stdTTL: TTL_SEC, checkperiod: 120 });
const streamIndex = new NodeCache({ stdTTL: TTL_SEC, checkperiod: 120 });

/** @type {Map<string, Set<import('express').Response>>} */
const sseClients = new Map();

function randomToken(bytes = 24) {
    return crypto.randomBytes(bytes).toString("base64url");
}

function randomSessionId() {
    return crypto.randomBytes(16).toString("hex");
}

function getMaxUploads(surface) {
    if (surface === "writing_mock") return 4;
    return 1;
}

const ALLOWED_SURFACES = ["chat_essay_ocr", "chat_tutor_image", "writing_mock", "writing_quest"];

function surfaceLabel(surface) {
    switch (surface) {
        case "chat_essay_ocr":
            return "English tutor — handwriting to text";
        case "chat_tutor_image":
            return "Tutor chat — photo for this conversation";
        case "writing_mock":
            return "Writing mock — photo of answer";
        case "writing_quest":
            return "Writing quest — photo of answer";
        default:
            return "Ace It — photo upload";
    }
}

function addSseClient(sessionId, res) {
    if (!sseClients.has(sessionId)) sseClients.set(sessionId, new Set());
    sseClients.get(sessionId).add(res);
}

function removeSseClient(sessionId, res) {
    const set = sseClients.get(sessionId);
    if (!set) return;
    set.delete(res);
    if (set.size === 0) sseClients.delete(sessionId);
}

function sseWrite(res, event, dataObj) {
    if (res.writableEnded) return;
    const payload = typeof dataObj === "string" ? dataObj : JSON.stringify(dataObj);
    res.write(`event: ${event}\n`);
    res.write(`data: ${payload}\n\n`);
}

function broadcast(sessionId, event, dataObj) {
    const set = sseClients.get(sessionId);
    if (!set) return;
    for (const res of set) {
        try {
            sseWrite(res, event, dataObj);
        } catch (e) {
            console.warn("[HandoffSessionService] SSE write failed:", e.message);
        }
    }
}

/**
 * @param {{ uid: string, surface: string, meta?: object }} opts
 */
function createSession(opts) {
    const { uid, surface, meta = {} } = opts;
    if (!uid || uid === "guest") throw new Error("Invalid uid");
    if (!ALLOWED_SURFACES.includes(surface)) throw new Error("Invalid surface");

    const sessionId = randomSessionId();
    const mobileToken = randomToken(24);
    const streamTicket = randomToken(32);

    const rec = {
        sessionId,
        uid,
        surface,
        meta: typeof meta === "object" && meta ? meta : {},
        mobileToken,
        streamTicket,
        uploadCount: 0,
        maxUploads: getMaxUploads(surface),
        createdAt: Date.now(),
        expiresAt: Date.now() + TTL_SEC * 1000
    };

    sessions.set(sessionId, rec);
    mobileIndex.set(mobileToken, sessionId);
    streamIndex.set(streamTicket, sessionId);

    return rec;
}

function getSession(sessionId) {
    return sessions.get(sessionId) || null;
}

function getSessionByMobileToken(token) {
    const sid = mobileIndex.get(token);
    if (!sid) return null;
    return getSession(sid);
}

function getSessionByStreamTicket(ticket) {
    const sid = streamIndex.get(ticket);
    if (!sid) return null;
    return getSession(sid);
}

function assertSessionFresh(rec) {
    if (!rec) return false;
    if (Date.now() > rec.expiresAt) return false;
    return true;
}

function incrementUpload(rec) {
    rec.uploadCount += 1;
    sessions.set(rec.sessionId, rec);
}

module.exports = {
    createSession,
    getSession,
    getSessionByMobileToken,
    getSessionByStreamTicket,
    assertSessionFresh,
    surfaceLabel,
    addSseClient,
    removeSseClient,
    sseWrite,
    broadcast,
    incrementUpload,
    TTL_SEC
};
