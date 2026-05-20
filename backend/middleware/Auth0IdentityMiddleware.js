const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const { createRepositories } = require('../repositories');

function getBearerToken(req) {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) return null;
    return authHeader.slice('Bearer '.length).trim();
}

function getStableUidFromSub(sub, prefix = 'idp') {
    if (!sub) return null;
    return `${prefix}_${sub.replace(/[|/]/g, '_')}`;
}

const jwksClientCache = new Map();
const JWKS_REQUEST_TIMEOUT_MS = 10000;

function getCachedJwksClient(jwksUri) {
    if (!jwksClientCache.has(jwksUri)) {
        jwksClientCache.set(
            jwksUri,
            jwksClient({ jwksUri, cache: true, cacheMaxEntries: 5, cacheMaxAge: 600000 })
        );
    }
    return jwksClientCache.get(jwksUri);
}

async function verifyEntraToken(token) {
    const tenantId = process.env.ENTRA_TENANT_ID;
    const audience = process.env.ENTRA_AUDIENCE;
    if (!tenantId || !audience) {
        throw new Error("Missing Entra config: ENTRA_TENANT_ID or ENTRA_AUDIENCE");
    }

    const decoded = jwt.decode(token, { complete: true }) || {};
    const tokenIss = decoded?.payload?.iss || null;

    const fallbackIssuer = process.env.ENTRA_ISSUER || `https://login.microsoftonline.com/${tenantId}/v2.0`;
    const fallbackJwks = process.env.ENTRA_JWKS_URI || `https://login.microsoftonline.com/${tenantId}/discovery/v2.0/keys`;

    let inferredJwks = fallbackJwks;
    if (tokenIss && tokenIss.includes('ciamlogin.com')) {
        inferredJwks = tokenIss.replace(/\/v2\.0\/?$/, '') + '/discovery/v2.0/keys';
    } else if (tokenIss && tokenIss.includes('login.microsoftonline.com')) {
        const noV2 = tokenIss.replace(/\/v2\.0\/?$/, '');
        inferredJwks = `${noV2}/discovery/v2.0/keys`;
    }

    const issuersToTry = [...new Set([tokenIss, fallbackIssuer].filter(Boolean))];
    const jwksToTry = [...new Set([inferredJwks, fallbackJwks].filter(Boolean))];
    let lastError = null;

    for (const issuer of issuersToTry) {
        for (const jwksUri of jwksToTry) {
            const client = getCachedJwksClient(jwksUri);
            const getKey = (header, callback) => {
                const timeoutId = setTimeout(() => {
                    callback(new Error(`JWKS signing key request timed out after ${JWKS_REQUEST_TIMEOUT_MS}ms`));
                }, JWKS_REQUEST_TIMEOUT_MS);
                client.getSigningKey(header.kid, (err, key) => {
                    clearTimeout(timeoutId);
                    if (err) return callback(err);
                    callback(null, key.getPublicKey());
                });
            };
            try {
                const verified = await new Promise((resolve, reject) => {
                    jwt.verify(token, getKey, { algorithms: ['RS256'], issuer, audience }, (err, claims) => {
                        if (err) return reject(err);
                        resolve(claims);
                    });
                });
                return verified;
            } catch (err) {
                lastError = err;
            }
        }
    }

    throw lastError || new Error('Failed to verify Entra token');
}

class IdentityMiddleware {
    constructor() {
        this.enrichIdentity = this.enrichIdentity.bind(this);
    }

    async mapEmailToUid(profile, prefix = 'idp', autoProvision = true) {
        const email = profile?.email || profile?.preferred_username || null;
        let uid = null;
        if (email) {
            const { userRepo } = createRepositories();
            uid = await userRepo.findUidByEmail(email);
            if (!uid && autoProvision) {
                uid = getStableUidFromSub(profile?.sub, prefix) || `${prefix}_${Date.now()}`;
                await userRepo.createIdentityUser(uid, {
                    email,
                    nickname: (profile?.name || email.split('@')[0] || 'Student').slice(0, 64),
                    role: 'student',
                    status: 'pending',
                    is_new_student: true,
                    onboarding_completed: false,
                    subscription_tier: 'free'
                });
            }
        }
        return { uid, email };
    }

    async enrichIdentity(req, res, next) {
        try {
            const provider = (process.env.AUTH_PROVIDER || '').toLowerCase();
            if (!provider) return next();

            const token = getBearerToken(req);
            if (!token) return next();

            let profile = null;
            let uid = null;
            let email = null;
            if (provider === 'entra') {
                const claims = await verifyEntraToken(token);
                profile = {
                    sub: claims?.sub || claims?.oid || null,
                    email: claims?.email || claims?.preferred_username || null,
                    preferred_username: claims?.preferred_username || null,
                    name: claims?.name || null
                };
                const mapped = await this.mapEmailToUid(profile, 'entra', process.env.ENTRA_AUTO_PROVISION !== 'false');
                uid = mapped.uid;
                email = mapped.email;
            } else {
                return next();
            }

            req.authUser = {
                sub: profile?.sub || null,
                email,
                name: profile?.name || null
            };

            if (uid) {
                req.uid = uid;
                // Server-resolved uid is authoritative (prevents stale client uid → 403 on Entra).
                if (req.body) req.body.uid = uid;
                if (req.query) req.query.uid = uid;
                if (req.params && Object.prototype.hasOwnProperty.call(req.params, 'uid')) {
                    req.params.uid = uid;
                }
            }

            next();
        } catch (error) {
            console.warn('[IdentityMiddleware] Identity enrichment skipped:', error.message);
            next();
        }
    }
}

module.exports = new IdentityMiddleware();
