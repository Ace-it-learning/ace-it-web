export function isCheatEnabled(user, profile) {
    const normalize = (v) => (v || '').toString().trim().toLowerCase();
    const emails = [
        normalize(user?.email),
        normalize(user?.username),
        normalize(profile?.email)
    ].filter(Boolean);

    // Primary allowlist identity for internal QA.
    if (emails.includes('fungtam@gmail.com')) return true;

    // Defensive fallback for identity-provider variations.
    if (emails.some((e) => e.startsWith('fungtam@'))) return true;

    return false;
}
