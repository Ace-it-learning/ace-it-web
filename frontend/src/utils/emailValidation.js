/** Loose RFC-style check for contact / reply fields (ASCII-ish addresses). */
export function isValidContactEmail(s) {
    const t = String(s || '').trim();
    if (!t || t.length > 254) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t);
}
