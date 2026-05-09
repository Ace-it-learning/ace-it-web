const { getContainer } = require('../db/cosmos');

/**
 * ServiceMonitor Utility
 * Provides resilience patterns like timeouts and health checks.
 */
class ServiceMonitor {
    /**
     * Executes a promise with a hard timeout.
     * @param {Promise} promise The promise to execute
     * @param {number} ms Timeout in milliseconds
     * @param {any} fallback Fullback value if timeout occurs
     * @returns {Promise}
     */
    async withTimeout(promise, ms = 5000, fallback = null) {
        let timeoutId;
        const timeoutPromise = new Promise((resolve) => {
            timeoutId = setTimeout(() => {
                console.warn(`[ServiceMonitor] Task timed out after ${ms}ms. Returning fallback.`);
                resolve(fallback);
            }, ms);
        });

        return Promise.race([
            promise.then((result) => {
                clearTimeout(timeoutId);
                return result;
            }),
            timeoutPromise
        ]);
    }

    /** Checks if Cosmos DB is responding. */
    async checkFirestore() {
        try {
            // Keep method name for compatibility with callers.
            const start = Date.now();
            const c = await getContainer('_health_check', '/pk');
            await c.items.upsert({
                id: 'heartbeat',
                pk: '_health_check',
                timestamp: new Date().toISOString()
            });
            console.log(`[ServiceMonitor] Cosmos Heartbeat OK (${Date.now() - start}ms)`);
            return true;
        } catch (error) {
            console.error('[ServiceMonitor] Cosmos Heartbeat FAILED:', error.message);
            return false;
        }
    }
}

module.exports = new ServiceMonitor();
