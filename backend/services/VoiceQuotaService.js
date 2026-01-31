const admin = require('firebase-admin');

/**
 * Check if user can record voice (tier-based quota)
 * @param {string} uid - User ID
 * @returns {Object} { allowed: boolean, tier: string, used?: number, limit?: number, message?: string }
 */
async function checkVoiceQuota(uid) {
    try {
        const userDoc = await admin.firestore().collection('users').doc(uid).get();
        const userData = userDoc.data();
        const tier = userData?.subscription_tier || 'free';

        // Free tier: No voice recording
        if (tier === 'free') {
            return {
                allowed: false,
                tier: 'free',
                message: 'Voice recording requires Normal or Premium plan. Upgrade to unlock pronunciation feedback!'
            };
        }

        // Premium tier: Unlimited
        if (tier === 'premium') {
            return {
                allowed: true,
                tier: 'premium',
                used: 0,
                limit: -1 // Unlimited
            };
        }

        // Normal tier: 10 recordings per day
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const usageRef = admin.firestore()
            .collection('users').doc(uid)
            .collection('usage').doc('voice_recordings');

        const usageDoc = await usageRef.get();
        const usageData = usageDoc.data() || {};
        const todayUsage = usageData[today] || 0;

        if (todayUsage >= 10) {
            return {
                allowed: false,
                tier: 'normal',
                used: todayUsage,
                limit: 10,
                message: 'Daily limit reached (10/10). Upgrade to Premium for unlimited pronunciation feedback!'
            };
        }

        return {
            allowed: true,
            tier: 'normal',
            used: todayUsage,
            limit: 10
        };
    } catch (error) {
        console.error('[VoiceQuota] Error checking quota:', error);
        return {
            allowed: false,
            tier: 'unknown',
            message: 'Error checking voice quota. Please try again.'
        };
    }
}

/**
 * Increment voice recording usage for a user
 * @param {string} uid - User ID
 */
async function incrementVoiceUsage(uid) {
    try {
        const today = new Date().toISOString().split('T')[0];
        const usageRef = admin.firestore()
            .collection('users').doc(uid)
            .collection('usage').doc('voice_recordings');

        await usageRef.set(
            { [today]: admin.firestore.FieldValue.increment(1) },
            { merge: true }
        );

        console.log(`[VoiceQuota] Incremented usage for ${uid} on ${today}`);
    } catch (error) {
        console.error('[VoiceQuota] Error incrementing usage:', error);
    }
}

module.exports = {
    checkVoiceQuota,
    incrementVoiceUsage
};
