class ParityLogService {
    static compare(tag, primaryValue, fallbackValue) {
        try {
            const a = JSON.stringify(primaryValue ?? null);
            const b = JSON.stringify(fallbackValue ?? null);
            if (a !== b) {
                console.warn(`[parity:${tag}] MISMATCH`, {
                    primaryPreview: a?.slice(0, 300),
                    fallbackPreview: b?.slice(0, 300)
                });
            }
        } catch (err) {
            console.warn(`[parity:${tag}] compare failed:`, err.message);
        }
    }
}

module.exports = ParityLogService;
