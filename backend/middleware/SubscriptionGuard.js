const UserProfileService = require('../services/UserProfileService');
const DeviceService = require('../services/DeviceService');

/**
 * Middleware to gate access based on subscription tiers and usage limits.
 */
class SubscriptionGuard {
    /**
     * Protects premium routes from free users.
     */
    async protectPremium(req, res, next) {
        try {
            const uid = req.uid || req.query.uid || req.body.uid;
            if (!uid || uid === 'guest') {
                return res.status(403).json({ 
                    error: 'Premium feature', 
                    code: 'PREMIUM_REQUIRED',
                    message: 'Please log in and upgrade to Pro/Premium to access this feature.' 
                });
            }

            const profile = await UserProfileService.getProfile(uid);
            const isFree = !profile || profile.subscription_tier === 'free';
            
            // Check if subscription has expired
            let isExpired = false;
            if (profile?.subscription_expiry) {
                const expiryDate = profile.subscription_expiry.toDate ? profile.subscription_expiry.toDate() : new Date(profile.subscription_expiry);
                isExpired = expiryDate < new Date();
            }

            if (isFree || isExpired) {
                return res.status(403).json({ 
                    error: 'Premium feature', 
                    code: 'PREMIUM_REQUIRED',
                    message: isExpired ? 'Your subscription has expired. Please renew to continue accessing premium features.' : 'This feature is only available for Pro or Premium members.' 
                });
            }

            next();
        } catch (error) {
            console.error('[SubscriptionGuard] Error in protectPremium:', error);
            res.status(500).json({ error: 'Internal server error during subscription check.' });
        }
    }

    /**
     * Enforces usage limits for Pro users.
     * Use this for Quest questions and Mock Exams.
     */
    async enforceLimits(req, res, next) {
        try {
            const uid = req.uid || req.query.uid || req.body.uid;
            const { type, subject, questId } = req.body; // Expecting type: 'quest' | 'mock'

            if (!uid || uid === 'guest') return next(); // Guest limits handled elsewhere or blocked

            const profile = await UserProfileService.getProfile(uid);
            if (!profile) return next();

            const tier = profile.subscription_tier || 'free';
            
            // Check if subscription has expired (Treat expired as Free)
            let isExpired = false;
            if (profile?.subscription_expiry) {
                const expiryDate = profile.subscription_expiry.toDate ? profile.subscription_expiry.toDate() : new Date(profile.subscription_expiry);
                isExpired = expiryDate < new Date();
            }

            const activeTier = isExpired ? 'free' : tier;
            if (activeTier === 'premium') return next(); // Premium has no limits

            const usage = profile.usage_stats || { month: '', quests: {}, mocks: {} };
            const currentMonth = new Date().toISOString().substring(0, 7);

            // 1. FREE USER GATING (Including Expired)
            if (activeTier === 'free') {
                if (type === 'mock') {
                    return res.status(403).json({ 
                        error: 'Mock Exam Locked', 
                        code: 'UPGRADE_PRO',
                        message: isExpired ? 'Your subscription has expired. Renew to access Mock Exams!' : 'Mock exams are available for Pro and Premium members only.' 
                    });
                }
                return next();
            }

            // 2. PRO USER LIMITS
            if (activeTier === 'pro') {
                // ... (rest of logic)
                // Mock Exam Check
                if (type === 'mock' && subject) {
                    const mockCount = usage.mocks?.[subject] || 0;
                    if (mockCount >= 4) {
                        return res.status(403).json({ 
                            error: 'Mock Limit Reached', 
                            code: 'LIMIT_REACHED',
                            message: `You have reached the monthly limit of 4 Mock Exams for ${subject}. Upgrade to Premium for unlimited attempts!` 
                        });
                    }
                }

                // Quest Question Check
                if (type === 'quest' && questId) {
                    const questUsage = usage.quests?.[questId];
                    // If usage month doesn't match, we'll reset it later, but check current month
                    if (usage.month === currentMonth && questUsage?.questions >= 10) {
                        return res.status(403).json({ 
                            error: 'Quest Limit Reached', 
                            code: 'LIMIT_REACHED',
                            message: 'You have reached the monthly limit of 10 questions for this micro-skill Quest. Upgrade to Premium for more!' 
                        });
                    }
                }
            }

            next();
        } catch (error) {
            console.error('[SubscriptionGuard] Error in enforceLimits:', error);
            next(); // Fail open for UX, but log error
        }
    }

    /**
     * Middleware to check device fingerprint.
     */
    async checkDevice(req, res, next) {
        try {
            const uid = req.uid || req.query.uid || req.body.uid;
            const fingerprint = req.headers['x-device-fingerprint'];

            if (!uid || uid === 'guest') return next();
            if (!fingerprint) return next(); // For now, fail open if header missing

            const result = await DeviceService.checkDeviceAccess(uid, fingerprint);
            if (!result.allowed) {
                return res.status(403).json({
                    error: 'Device limit reached',
                    code: 'DEVICE_LIMIT',
                    message: result.error
                });
            }

            next();
        } catch (error) {
            console.error('[SubscriptionGuard] Error in checkDevice:', error);
            next();
        }
    }
}

module.exports = new SubscriptionGuard();
