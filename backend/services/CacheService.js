const NodeCache = require("node-cache");

/**
 * Global Memory Cache Service
 * Configured with standard TTLs for different data types.
 */
class CacheService {
    constructor() {
        // Default TTL of 60 seconds for general DB queries
        this.dbCache = new NodeCache({ stdTTL: 60, checkperiod: 30 });
        
        // Default TTL of 1 hour for semantic AI routing
        this.intentCache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });
        
        console.log("[CacheService] NodeCache instances initialized.");
    }

    /** --- DB EXPOSED METHODS --- */

    getDbCache(key) {
        return this.dbCache.get(key);
    }

    setDbCache(key, value, ttl = 60) {
        return this.dbCache.set(key, value, ttl);
    }

    invalidateUserDbCache(uid) {
        if (!uid) return;
        const keys = this.dbCache.keys();
        const userKeys = keys.filter(k => k.includes(uid));
        if (userKeys.length > 0) {
            this.dbCache.del(userKeys);
            console.log(`[CacheService] Invalidated ${userKeys.length} keys for user ${uid}`);
        }
    }

    /** --- AI SEMANTIC EXPOSED METHODS --- */

    getIntentCache(key) {
        return this.intentCache.get(key);
    }

    setIntentCache(key, value) {
        return this.intentCache.set(key, value);
    }
    
    /**
     * Determines if a message is a universal navigational command
     * that is safe to bypass AI router.
     */
    isUniversalRoutingCommand(message) {
        const msg = message.toLowerCase().trim();
        // Regex rules for exact match whitelist
        const rules = [
            /^start\s+(reading\s+mock|writing\s+mock|listening\s+mock|speaking\s+mock)$/,
            /^(start|launch|take|do)\s+(reading|writing|listening|speaking|maths?)\s+(quiz|test|mock|exam|lab|practice)$/,
            /^reading$/,
            /^writing$/,
            /^listening$/,
            /^speaking$/,
            /^diagnostic$/,
            /^start\s+diagnostic$/
        ];
        
        return rules.some(r => r.test(msg));
    }
}

module.exports = new CacheService();
