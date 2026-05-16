function isProviderAuthEnabled() {
    return (process.env.AUTH_PROVIDER || '').toLowerCase() === 'entra';
}

function extractUid(req) {
    return req.uid || req.params?.uid || req.query?.uid || req.body?.uid || null;
}

function ensureUidInRequest(req, uid) {
    if (req.body) req.body.uid = uid;
    if (req.query) req.query.uid = uid;
    if (req.params && Object.prototype.hasOwnProperty.call(req.params, 'uid')) {
        req.params.uid = uid;
    }
}

function requireResolvedUid(req, res, next) {
    const clientUid = extractUid(req);
    // When Entra (or similar) resolved req.uid, always use it — client query uid may be stale.
    const uid = (isProviderAuthEnabled() && req.uid) ? req.uid : clientUid;
    if (!uid || uid === 'guest') {
        return res.status(401).json({ error: 'Unauthorized: Missing resolved uid' });
    }
    if (isProviderAuthEnabled() && req.uid && clientUid && clientUid !== req.uid) {
        console.warn(
            `[requireResolvedUid] Client uid ${clientUid} overridden by token uid ${req.uid}`
        );
    }
    ensureUidInRequest(req, uid);
    return next();
}

module.exports = {
    requireResolvedUid,
    extractUid
};
