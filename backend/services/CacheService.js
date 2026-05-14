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

    /** Drop cached merged profile so the next getProfile hits Cosmos (chat / account sync). */
    invalidateProfileCache(uid) {
        if (!uid) return;
        this.dbCache.del(`profile_${uid}`);
    }

    /** --- AI SEMANTIC EXPOSED METHODS --- */

    getIntentCache(key) {
        return this.intentCache.get(key);
    }

    setIntentCache(key, value, ttl) {
        if (typeof ttl === 'number' && ttl > 0) {
            return this.intentCache.set(key, value, ttl);
        }
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

    /**
     * Detects pure greetings / acknowledgements that can safely skip the AI
     * intent router when no lab proposal is pending in the recent history.
     * Keep this list conservative: anything that *might* be a confirmation
     * (e.g. "yes", "proceed") is intentionally NOT included so the router
     * can still classify them as LAB when appropriate.
     */
    isGreetingOrAck(message) {
        if (!message) return false;
        const msg = message.toLowerCase().trim();
        if (msg.length === 0) return false;
        const rules = [
            /^(hi|hello|hey|yo|sup|hiya|howdy)[\s!.?]*$/,
            /^(thanks|thank you|thx|tysm|cheers|ty)[\s!.?]*$/,
            /^(cool|nice|great|awesome|got it|alright|fine|kk)[\s!.?]*$/,
            /^(你好|哈囉|嗨)[\s!.?]*$/,
            /^(多謝|唔該|唔該晒|多謝晒)[\s!.?]*$/
        ];
        return rules.some(r => r.test(msg));
    }

    /**
     * Detects whether the recent assistant turns contain an open proposal
     * (e.g. "would you like to start the lab?"). When true, ack words like
     * "yes" or "ok" must NOT be routed to CHAT — let the AI router decide.
     */
    hasRecentLabProposal(history = []) {
        if (!Array.isArray(history) || history.length === 0) return false;
        const modelTurns = history
            .filter(m => (m.role === 'model' || m.role === 'assistant'))
            .slice(-2);
        const proposalPatterns = [
            /would you like to (start|try|practice|do|launch|begin)/i,
            /shall we (start|try|launch|begin|do)/i,
            /ready to (start|try|begin|launch)/i,
            /let'?s (start|try|do|launch|begin)/i,
            /launch (the )?lab/i,
            /start (the )?(lab|exam|mock|quiz|practice)/i,
            /want to (try|do) (the )?(lab|exam|mock|quiz|practice)/i,
            /要唔要(試下|開始|練習)/i,
            /(試下|開始)\s*(lab|練習|測驗|mock)/i
        ];
        return modelTurns.some(m => {
            const text = (m.content || m.parts?.[0]?.text || '').toString();
            return proposalPatterns.some(p => p.test(text));
        });
    }
}

module.exports = new CacheService();
