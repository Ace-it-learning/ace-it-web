const CosmosStore = require('./CosmosStore');

class PromoCodeService {
    /**
     * Validate a promo code and return the discount info.
     * @param {string} code 
     */
    async validateCode(code) {
        if (!code) throw new Error('Code is required');

        const data = await CosmosStore.getPromoCode(code);
        if (!data) {
            throw new Error('Invalid promo code');
        }
        if (!data.isActive) {
            throw new Error('Promo code is no longer active');
        }

        // Check expiration if needed
        const expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;
        if (expiresAt && expiresAt < new Date()) {
            throw new Error('Promo code has expired');
        }

        // Check usage limit
        if (data.maxUses && data.usedCount >= data.maxUses) {
            throw new Error('Promo code has reached its usage limit');
        }

        return {
            code: data.code,
            discount: data.discount,
            type: data.type
        };
    }

    /**
     * Mark a code as used (optional, if we want to track usage)
     * @param {string} code 
     */
    async useCode(code) {
        await CosmosStore.incrementPromoCodeUsage(code);
    }
}

module.exports = new PromoCodeService();
