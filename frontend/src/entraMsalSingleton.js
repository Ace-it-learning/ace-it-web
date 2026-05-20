import { PublicClientApplication } from '@azure/msal-browser';

/**
 * Serializes silent token work so loginRedirect/logoutRedirect never start while
 * acquireTokenSilent (or other async MSAL work tied here) is still running —
 * that overlap surfaces as interaction_in_progress.
 */
let silentChain = Promise.resolve();

/**
 * @param {() => Promise<unknown>} factory Run the MSAL call only after prior chained work
 */
export function tieEntraSilent(factory) {
    const next = silentChain.then(() => factory());
    silentChain = next.catch(() => undefined);
    return next;
}

export function waitForEntraSilentChain() {
    return silentChain;
}

/** Call immediately before any interactive redirect (login / logout). */
export async function prepareEntraInteractiveRedirect(client) {
    await waitForEntraSilentChain();
    await client.handleRedirectPromise();
}

/** Entra SPA config — shared by AuthContext and must stay in sync */
export const entraConfig = {
    auth: {
        clientId: import.meta.env.VITE_ENTRA_CLIENT_ID || '',
        authority: import.meta.env.VITE_ENTRA_AUTHORITY || '',
        redirectUri: import.meta.env.VITE_ENTRA_REDIRECT_URI || `${window.location.origin}/login`,
        postLogoutRedirectUri: import.meta.env.VITE_ENTRA_POST_LOGOUT_REDIRECT_URI || `${window.location.origin}/`
    },
    cache: {
        cacheLocation: 'localStorage'
    },
    /** Longer iframe waits reduce spurious timed_out on slow networks / strict browsers */
    system: {
        iframeHashTimeout: 20000,
        loadFrameTimeout: 20000
    }
};

/**
 * After loginRedirect, MSAL returns tokens once from handleRedirectPromise().
 * Using that ID token avoids an immediate acquireTokenSilent iframe round-trip
 * (common source of BrowserAuthError timed_out).
 */
let pendingRedirectAuthResult = null;

export function consumePostRedirectAuthResult() {
    const r = pendingRedirectAuthResult;
    pendingRedirectAuthResult = null;
    // DEBUG: console.log('[consumePostRedirectAuthResult] consumed=', !!r);
    return r;
}

/** Minimal static page — MSAL silent iframe must NOT load the SPA (router can strip the hash → timed_out). */
export function getMsalSilentRedirectUri() {
    if (typeof window === 'undefined') return '/msal-silent.html';
    return `${window.location.origin}/msal-silent.html`;
}

/**
 * One PublicClientApplication for the whole app.
 * React Strict Mode mounts effects twice in dev; a second instance races
 * initialize/handleRedirectPromise and triggers interaction_in_progress.
 */
let bootstrapPromise = null;

export function ensureEntraMsalClient() {
    if (!bootstrapPromise) {
        bootstrapPromise = (async () => {
            if (!entraConfig.auth.clientId || !entraConfig.auth.authority) {
                throw new Error('Missing Entra config: VITE_ENTRA_CLIENT_ID or VITE_ENTRA_AUTHORITY');
            }
            // DEBUG: console.log('[ensureEntraMsalClient] Creating new MSAL client, hash=', window.location.hash);
            const client = new PublicClientApplication(entraConfig);
            await client.initialize();
            const redirectResult = await client.handleRedirectPromise();
            // DEBUG: console.log('[ensureEntraMsalClient] handleRedirectPromise result has account=', !!redirectResult?.account, 'has idToken=', !!redirectResult?.idToken);
            if (redirectResult?.account) {
                client.setActiveAccount(redirectResult.account);
            }
            if (redirectResult?.idToken) {
                pendingRedirectAuthResult = redirectResult;
            }
            return client;
        })();
    } else {
        // DEBUG: console.log('[ensureEntraMsalClient] Returning cached promise');
    }
    return bootstrapPromise;
}

/** Reset the singleton so the next call re-initializes MSAL (e.g. after logout). */
export function resetEntraMsalClient() {
    // DEBUG: console.log('[resetEntraMsalClient] Resetting MSAL singleton');
    bootstrapPromise = null;
    pendingRedirectAuthResult = null;
}

/**
 * Starts login redirect after silent work and redirect-promise handling complete.
 * Retries once if MSAL still reports an interaction collision (e.g. double-click).
 */
export async function entraLoginRedirect(client, request) {
    const run = async () => {
        await prepareEntraInteractiveRedirect(client);
        return client.loginRedirect(request);
    };
    try {
        return await run();
    } catch (e) {
        const code = e?.errorCode || e?.name || '';
        const msg = String(e?.message || e || '');
        const busy =
            code === 'interaction_in_progress' ||
            msg.includes('interaction_in_progress');
        if (!busy) throw e;
        await new Promise((r) => setTimeout(r, 400));
        return await run();
    }
}

export async function entraLogoutRedirect(client, request) {
    // For logout we must NOT call handleRedirectPromise() first — if there is a
    // pending login redirect hash in the URL, handleRedirectPromise() would
    // process it and MSAL would subsequently send a login authorize request
    // instead of the logout endpoint.  We only need to wait for any silent
    // token work to finish so we don't collide with an in-flight iframe.
    await waitForEntraSilentChain();
    try {
        return await client.logoutRedirect(request);
    } catch (e) {
        const code = e?.errorCode || e?.name || '';
        const msg = String(e?.message || e || '');
        const busy =
            code === 'interaction_in_progress' ||
            msg.includes('interaction_in_progress');
        if (!busy) throw e;
        await new Promise((r) => setTimeout(r, 400));
        return await client.logoutRedirect(request);
    }
}
