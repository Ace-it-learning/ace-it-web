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
    const uid = extractUid(req);
    if (!uid || uid === 'guest') {
        return res.status(401).json({ error: 'Unauthorized: Missing resolved uid' });
    }
    if (isProviderAuthEnabled() && req.uid && uid !== req.uid) {
        return res.status(403).json({ error: 'Forbidden: uid mismatch' });
    }
    ensureUidInRequest(req, req.uid || uid);
    return next();
}

module.exports = {
    requireResolvedUid,
    extractUid
};
