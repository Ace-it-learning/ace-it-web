export function isCheatEnabled(user, profile) {
    const normalize = (v) => (v || '').toString().trim().toLowerCase();
    const emails = [
        normalize(user?.email),
        normalize(user?.username),
        normalize(profile?.email)
    ].filter(Boolean);

    const allowedEmails = [
        'fungtam@gmail.com',
        'projectace2026@gmail.com'
    ];

    // Primary allowlist identity for internal QA.
    for (const allowed of allowedEmails) {
        if (emails.includes(allowed)) return true;
    }

    // Defensive fallback for identity-provider variations.
    for (const allowed of allowedEmails) {
        const prefix = allowed.split('@')[0] + '@';
        if (emails.some((e) => e.startsWith(prefix))) return true;
    }

    return false;
}
