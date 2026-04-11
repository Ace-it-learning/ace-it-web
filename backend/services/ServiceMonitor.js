const admin = require('firebase-admin');

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

    /**
     * Checks if Firestore is responding.
     * @returns {Promise<boolean>}
     */
    async checkFirestore() {
        try {
            // Simple write/delete or just a small read to verify connectivity
            const start = Date.now();
            await admin.firestore().collection('_health_check').doc('heartbeat').set({
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            });
            console.log(`[ServiceMonitor] Firestore Heartbeat OK (${Date.now() - start}ms)`);
            return true;
        } catch (error) {
            console.error('[ServiceMonitor] Firestore Heartbeat FAILED:', error.message);
            return false;
        }
    }
}

module.exports = new ServiceMonitor();
