import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { auth, googleProvider } from '../firebase';
import {
    ensureEntraMsalClient,
    resetEntraMsalClient,
    entraConfig,
    tieEntraSilent,
    entraLoginRedirect,
    entraLogoutRedirect,
    consumePostRedirectAuthResult,
    getMsalSilentRedirectUri
} from '../entraMsalSingleton';
import { fetchWithAuth } from '../utils/apiAuth';
import { apiUrl, getApiBase } from '../utils/apiBase';
import {
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendEmailVerification,
    sendPasswordResetEmail,
    updatePassword,
    reauthenticateWithCredential,
    EmailAuthProvider,
    deleteUser
} from 'firebase/auth';

const AuthContext = createContext();
const USE_ENTRA = import.meta.env.VITE_USE_ENTRA === 'true';

/** ID token carries aud = SPA client id; access_token often targets Graph/other and fails ENTRA_AUDIENCE checks. */
function pickMsalIdToken(tokenResp) {
    const id = tokenResp?.idToken;
    if (typeof id === 'string' && id.length > 0) return id;
    throw new Error(
        'Microsoft returned no ID token. Ensure scopes include openid and that you complete sign-in in the popup/redirect.'
    );
}

/** Optional Graph identityProviders[].id — use when Microsoft docs / tenant require `idp` */
const ENTRA_GOOGLE_IDP = import.meta.env.VITE_ENTRA_GOOGLE_IDP?.trim();

/**
 * Optional `domain_hint` for issuer acceleration. This tenant returns AADSTS90023 for
 * domain_hint=google, so we do not set a default — user picks Google under Microsoft "Sign-in options".
 * Set VITE_ENTRA_GOOGLE_DOMAIN_HINT only if your Microsoft tenant documents a supported value.
 */
function googleEntraRedirectExtras() {
    const extra = {};
    const raw = import.meta.env.VITE_ENTRA_GOOGLE_DOMAIN_HINT?.trim();
    if (raw && !/^(off|none|false|0)$/i.test(raw)) {
        extra.domain_hint = raw;
    }
    if (ENTRA_GOOGLE_IDP) extra.idp = ENTRA_GOOGLE_IDP;
    return extra;
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isProfileLoading, setIsProfileLoading] = useState(false);
    const [initialized, setInitialized] = useState(false); // New state to track if onAuthStateChanged fired
    const [authError, setAuthError] = useState(null);

    const API_URL = getApiBase() || 'http://localhost:3001';

    /** Bumps on StrictMode remount cleanup so stale Entra bootstrap runs skip setState */
    const entraInitGeneration = useRef(0);

    const fetchProfile = async (uid, authUser = null) => {
        if (!uid || uid === 'guest') {
            setProfile(null);
            return;
        }
        setIsProfileLoading(true);
        try {
            const subject = authUser || user;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000);
            const res = await fetchWithAuth(subject, apiUrl(`/api/user/profile/${uid}`), {
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
            if (res.ok) {
                const data = await res.json();
                console.log('[AuthContext] Profile fetched, tier:', data?.subscription_tier);
                setProfile(data);
            } else {
                console.error('[AuthContext] Profile fetch failed:', res.status, await res.text());
            }
        } catch (error) {
            console.error("[AuthContext] Failed to fetch profile:", error);
        } finally {
            setIsProfileLoading(false);
            // Do not set initialized here — it runs during Entra bootstrap and would mark
            // auth "ready" before resolveIdentity attaches user (LoginPage → redirect loop).
        }
    };

    const refreshProfile = async () => {
        if (user?.uid) {
            await fetchProfile(user.uid);
        }
    };

    useEffect(() => {
        if (USE_ENTRA) return;
        if (!auth) {
            console.warn("[AuthContext] Firebase auth not initialized (Entra mode). Skipping onAuthStateChanged.");
            setLoading(false);
            setInitialized(true);
            return;
        }
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            console.log("[AuthContext] onAuthStateChanged:", currentUser?.uid || 'guest');
            setUser(currentUser);
            try {
                if (currentUser) {
                    await fetchProfile(currentUser.uid);
                } else {
                    setProfile(null);
                }
            } finally {
                // Single place: Firebase session is settled (guest or signed-in profile fetch attempted).
                setInitialized(true);
                setLoading(false);
            }
        });
        return unsubscribe;
    }, []);

    const resolveIdentityWithToken = async (token, msUser) => {
        const controller = new AbortController();
        const resolveTimeoutMs = 25000;
        const idTimeout = setTimeout(() => controller.abort(), resolveTimeoutMs);
        let identityRes;
        try {
            identityRes = await fetch(apiUrl('/api/user/resolve-identity'), {
                headers: { Authorization: `Bearer ${token}` },
                signal: controller.signal
            });
        } catch (e) {
            clearTimeout(idTimeout);
            if (e?.name === 'AbortError') {
                const err = new Error(
                    `Signing in timed out after ${Math.round(resolveTimeoutMs / 1000)}s waiting for the server. Check the API is reachable (VITE_API_URL) and try again.`
                );
                err.status = 504;
                throw err;
            }
            throw e;
        }
        clearTimeout(idTimeout);
        if (!identityRes.ok) {
            let detail = '';
            try {
                detail = await identityRes.clone().text();
            } catch (_) { /* ignore */ }
            if (import.meta.env.DEV) {
                console.error(
                    '[AuthContext] resolve-identity failed',
                    identityRes.status,
                    detail || identityRes.statusText
                );
            }
            const hint =
                identityRes.status === 401
                    ? 'Backend rejected the JWT. Use the ID token only (openid). On the server set AUTH_PROVIDER=entra and set ENTRA_AUDIENCE to your SPA Application (client) ID (same as MSAL/VITE_ENTRA_CLIENT_ID unless you use a custom API scope).'
                    : 'Check that the API is reachable (VITE_API_URL).';
            const err = new Error(`Failed to resolve user identity (${identityRes.status}). ${hint}`);
            err.status = identityRes.status;
            throw err;
        }
        const identity = await identityRes.json();
        const claims = msUser?.idTokenClaims || {};
        const claimEmail = claims.email || claims.preferred_username || null;
        /** Prefer server + ID-token mailbox; MSAL `username` is often a tenant UPN, not the Gmail you signed in with. */
        const resolvedMailbox = identity.email || claimEmail || msUser?.username || null;
        const entraIdp =
            claims.idp ||
            claims.idp_access_token ||
            claims.identity_provider ||
            claims.acr ||
            null;
        const mappedUser = {
            uid: identity.uid,
            email: resolvedMailbox,
            displayName: msUser?.name || (msUser?.username ? msUser.username.split('@')[0] : 'Student'),
            emailVerified: true,
            photoURL: null,
            /** Entra-only hints for UI (Firebase uses providerData instead) */
            authProvider: 'entra',
            entraIdp,
            getIdToken: async () => token
        };
        setUser(mappedUser);
        await fetchProfile(mappedUser.uid, mappedUser);
    };

    const retryEntraSession = useCallback(async () => {
        if (!USE_ENTRA) return { ok: false };
        // DEBUG: console.log('[AuthContext] retryEntraSession starting');
        setAuthError(null);
        setLoading(true);
        try {
            const client = await ensureEntraMsalClient();
            const activeAccount = client.getActiveAccount() || client.getAllAccounts()[0];
            // DEBUG: console.log('[AuthContext] retryEntraSession activeAccount=', activeAccount?.username || 'none');
            if (!activeAccount) {
                setLoading(false);
                setAuthError('No Microsoft session in this browser. Use Sign in below.');
                return { ok: false };
            }
            client.setActiveAccount(activeAccount);
            const tokenResp = await tieEntraSilent(() =>
                client.acquireTokenSilent({
                    account: activeAccount,
                    scopes: ['openid', 'profile', 'email'],
                    redirectUri: getMsalSilentRedirectUri()
                })
            );
            const idTok = pickMsalIdToken(tokenResp);
            // DEBUG: console.log('[AuthContext] retryEntraSession resolving identity...');
            await resolveIdentityWithToken(idTok, activeAccount);
            // DEBUG: console.log('[AuthContext] retryEntraSession success');
            setLoading(false);
            return { ok: true };
        } catch (err) {
            console.error('[AuthContext] retryEntraSession:', err);

            // If backend rejected the token (401), the cached token is stale.
            // Clear MSAL cache and force interactive re-login.
            if (err?.status === 401) {
                try {
                    const client = await ensureEntraMsalClient();
                    const accounts = client.getAllAccounts();
                    for (const acct of accounts) {
                        client.removeAccount(acct);
                    }
                } catch (clearErr) {
                    console.warn('[AuthContext] Failed to clear MSAL accounts:', clearErr);
                }
                // Reset singleton so the next page load re-runs handleRedirectPromise
                resetEntraMsalClient();
                setAuthError(
                    'Your sign-in session expired. Click "Retry linking to Ace-it" to sign in again.'
                );
            } else {
                setAuthError(err?.message || 'Could not sync with the server.');
            }
            setUser(null);
            setProfile(null);
            setLoading(false);
            return { ok: false };
        }
    }, [API_URL]);

    useEffect(() => {
        if (!USE_ENTRA) return;
        const mine = ++entraInitGeneration.current;

        /** Always clears the auth “booting” flags — used after identity succeeds even if Strict Mode superseded this effect (mine no longer matches). */
        const releaseLoadingGate = () => {
            setInitialized(true);
            setLoading(false);
        };

        const done = () => {
            if (entraInitGeneration.current !== mine) return;
            releaseLoadingGate();
        };

        const timeoutId = setTimeout(() => {
            if (entraInitGeneration.current !== mine) return;
            console.error('[AuthContext] Entra bootstrap timed out');
            setAuthError(
                `Sign-in timed out. Confirm the backend is running at ${API_URL} and GET /api/user/resolve-identity accepts your Microsoft token (AUTH_PROVIDER=entra, ENTRA_* env).`
            );
            setUser(null);
            setProfile(null);
            done();
        }, 45000);

        const initEntra = async () => {
            // DEBUG: console.log('[AuthContext] initEntra starting, mine=', mine, 'hash=', window.location.hash);
            try {
                const client = await ensureEntraMsalClient();
                // DEBUG: console.log('[AuthContext] ensureEntraMsalClient resolved, mine=', mine, 'accounts=', client.getAllAccounts().map(a => a.username));
                if (entraInitGeneration.current !== mine) {
                    // DEBUG: console.log('[AuthContext] initEntra aborted (stale generation), mine=', mine, 'current=', entraInitGeneration.current);
                    return;
                }

                setAuthError(null);

                const activeAccount = client.getActiveAccount() || client.getAllAccounts()[0];
                // DEBUG: console.log('[AuthContext] activeAccount=', activeAccount?.username || 'none');
                if (!activeAccount) {
                    if (entraInitGeneration.current !== mine) return;
                    // DEBUG: console.log('[AuthContext] No active account, clearing user state');
                    setUser(null);
                    setProfile(null);
                    clearTimeout(timeoutId);
                    done();
                    return;
                }

                client.setActiveAccount(activeAccount);

                const postRedirect = consumePostRedirectAuthResult();
                // DEBUG: console.log('[AuthContext] postRedirect has idToken=', !!postRedirect?.idToken);
                let idTok;
                if (postRedirect?.idToken) {
                    idTok = pickMsalIdToken(postRedirect);
                    // DEBUG: console.log('[AuthContext] Resolving identity with redirect token...');
                    await resolveIdentityWithToken(idTok, postRedirect.account || activeAccount);
                } else {
                    // DEBUG: console.log('[AuthContext] No redirect token, falling back to acquireTokenSilent');
                    const tokenResp = await tieEntraSilent(() =>
                        client.acquireTokenSilent({
                            account: activeAccount,
                            scopes: ['openid', 'profile', 'email'],
                            redirectUri: getMsalSilentRedirectUri()
                        })
                    );
                    if (entraInitGeneration.current !== mine) return;
                    idTok = pickMsalIdToken(tokenResp);
                    // DEBUG: console.log('[AuthContext] Resolving identity with silent token...');
                    await resolveIdentityWithToken(idTok, activeAccount);
                }
                // DEBUG: console.log('[AuthContext] initEntra success, releasing gate');
                // Always release the loading gate after identity resolves. `done()` alone is not
                // enough: it no-ops when Strict Mode bumped `entraInitGeneration` so `mine` is stale,
                // which left the UI on "Completing sign-in…" forever even though sign-in succeeded.
                clearTimeout(timeoutId);
                releaseLoadingGate();
            } catch (err) {
                if (entraInitGeneration.current !== mine) {
                    // DEBUG: console.log('[AuthContext] initEntra error handler aborted (stale generation), mine=', mine);
                    return;
                }
                console.error('[AuthContext] Entra init error:', err);

                // If backend rejected the token (401), the cached token is stale (key rotated or expired).
                // Clear MSAL cache and force interactive re-login instead of getting stuck.
                if (err?.status === 401) {
                    // DEBUG: console.log('[AuthContext] Clearing MSAL cache due to 401');
                    try {
                        const client = await ensureEntraMsalClient();
                        const accounts = client.getAllAccounts();
                        for (const acct of accounts) {
                            client.removeAccount(acct);
                        }
                    } catch (clearErr) {
                        console.warn('[AuthContext] Failed to clear MSAL accounts:', clearErr);
                    }
                    // Reset singleton so the next page load re-runs handleRedirectPromise
                    resetEntraMsalClient();
                    setAuthError(
                        'Your sign-in session expired. Click "Retry linking to Ace-it" to sign in again.'
                    );
                } else {
                    setAuthError(err?.message || 'Sign-in could not be completed. Please try again.');
                }
                setUser(null);
                setProfile(null);
                clearTimeout(timeoutId);
                // Always release the loading gate on error, even if StrictMode bumped the
                // generation. Using done() alone can leave the UI stuck on "Completing sign-in…"
                // forever when the error handler belongs to a superseded effect run.
                // DEBUG: console.log('[AuthContext] initEntra error, releasing gate');
                releaseLoadingGate();
            }
        };

        initEntra();
        return () => {
            clearTimeout(timeoutId);
            entraInitGeneration.current += 1;
        };
    }, [API_URL]);

    const reloadUser = async () => {
        if (USE_ENTRA) {
            const client = await ensureEntraMsalClient();
            const account = client.getActiveAccount() || client.getAllAccounts()[0];
            if (!account) return null;
            const tokenResp = await tieEntraSilent(() =>
                client.acquireTokenSilent({
                    account,
                    scopes: ['openid', 'profile', 'email'],
                    redirectUri: getMsalSilentRedirectUri()
                })
            );
            try {
                const token = pickMsalIdToken(tokenResp);
                const nextUser = { ...(user || {}), getIdToken: async () => token };
                setUser(nextUser);
                return nextUser;
            } catch {
                return null;
            }
        }
        if (auth?.currentUser) {
            await auth.currentUser.reload();
            setUser({ ...auth.currentUser }); // Spread to trigger state update
            return auth.currentUser;
        }
        return null;
    };

    // Also update loading state once profile and auth are handled
    useEffect(() => {
        if (initialized && !isProfileLoading) {
            setLoading(false);
        }
    }, [initialized, isProfileLoading]);

    const loginWithGoogle = async () => {
        if (USE_ENTRA) {
            setAuthError(null);
            const client = await ensureEntraMsalClient();
            return entraLoginRedirect(client, {
                scopes: ['openid', 'profile', 'email'],
                prompt: 'select_account',
                extraQueryParameters: googleEntraRedirectExtras()
            });
        }
        console.log("Initiating Google Sign-In Popup inside AuthContext...");
        if (!auth || !googleProvider) {
            throw new Error("Firebase auth is not initialized. Check VITE_USE_ENTRA setting.");
        }
        return signInWithPopup(auth, googleProvider);
    };

    /** Entra: password is unused — credentials are collected on Microsoft-hosted pages only. */
    const signupWithEmail = async (email, password) => {
        if (USE_ENTRA) {
            setAuthError(null);
            const client = await ensureEntraMsalClient();
            return entraLoginRedirect(client, {
                scopes: ['openid', 'profile', 'email'],
                loginHint: email || undefined
            });
        }
        if (!auth) {
            throw new Error("Firebase auth is not initialized. Check VITE_USE_ENTRA setting.");
        }
        return createUserWithEmailAndPassword(auth, email, password);
    };

    /** Entra: password is unused — sign-in continues on Microsoft-hosted pages. */
    const loginWithEmail = async (email, password) => {
        if (USE_ENTRA) {
            setAuthError(null);
            const client = await ensureEntraMsalClient();
            return entraLoginRedirect(client, {
                scopes: ['openid', 'profile', 'email'],
                loginHint: email || undefined
            });
        }
        if (!auth) {
            throw new Error("Firebase auth is not initialized. Check VITE_USE_ENTRA setting.");
        }
        return signInWithEmailAndPassword(auth, email, password);
    };

    const verifyEmail = (user) => {
        if (USE_ENTRA) return Promise.resolve();
        const API_URL = window.location.origin;
        const actionCodeSettings = {
            url: `${API_URL}/verify-success`,
            handleCodeInApp: true,
        };
        return sendEmailVerification(user, actionCodeSettings);
    };

    /**
     * Start sign-in: Entra → MSAL redirect to Microsoft-hosted page (same entry for sign-in / sign-up).
     * Non-Entra → returns false so caller can navigate to /login.
     */
    const beginSignInFlow = useCallback(async () => {
        if (!USE_ENTRA) return false;
        setAuthError(null);
        const client = await ensureEntraMsalClient();
        await entraLoginRedirect(client, {
            scopes: ['openid', 'profile', 'email'],
            prompt: 'select_account'
        });
        return true;
    }, []);

    const resetPassword = async (email) => {
        if (USE_ENTRA) {
            setAuthError(null);
            const client = await ensureEntraMsalClient();
            return entraLoginRedirect(client, {
                scopes: ['openid', 'profile', 'email'],
                prompt: 'login',
                loginHint: email || undefined
            });
        }
        const API_URL = window.location.origin;
        const actionCodeSettings = {
            url: `${API_URL}/login?tab=login`, // Redirect back to login after reset
            handleCodeInApp: true,
        };
        if (!auth) {
            throw new Error("Firebase auth is not initialized. Check VITE_USE_ENTRA setting.");
        }
        return sendPasswordResetEmail(auth, email, actionCodeSettings);
    };

    const changePassword = async (currentPassword, newPassword) => {
        if (USE_ENTRA) {
            /**
             * Entra / External ID: passwords are not updated via Firebase APIs.
             * We keep the in-app entry point, but the actual credential change happens on Microsoft-hosted pages.
             */
            setAuthError(null);
            const client = await ensureEntraMsalClient();
            return entraLoginRedirect(client, {
                scopes: ['openid', 'profile', 'email'],
                prompt: 'login',
                loginHint: user?.email || undefined
            });
        }
        if (!user || !user.email) throw new Error("User not authenticated");
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);
        return updatePassword(user, newPassword);
    };

    const setPasswordForSocialUser = async (newPassword) => {
        if (USE_ENTRA) {
            /**
             * Social-only accounts in Entra do not get a Firebase-style "set password" path.
             * Send the user to Microsoft sign-in options instead.
             */
            setAuthError(null);
            const client = await ensureEntraMsalClient();
            return entraLoginRedirect(client, {
                scopes: ['openid', 'profile', 'email'],
                prompt: 'select_account'
            });
        }
        if (!user) throw new Error("User not authenticated");
        return updatePassword(user, newPassword);
    };

    const cancelSubscription = async () => {
        if (!user) return;
        const res = await fetch(`${API_URL}/api/user/subscription/cancel`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid: user.uid })
        });
        if (res.ok) {
            refreshProfile();
            return { success: true };
        } else {
            const err = await res.json();
            throw new Error(err.error || "Failed to cancel subscription");
        }
    };

    const deleteUserAccount = async () => {
        if (!user) return;
        // 1. Delete from backend first (checks if subscription is cancelled)
        const res = await fetch(`${API_URL}/api/user`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid: user.uid })
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || err.error || "Failed to delete account from backend");
        }

        // 2. Delete from Firebase
        if (!USE_ENTRA) await deleteUser(user);
        return { success: true };
    };

    const logout = async () => {
        if (USE_ENTRA) {
            setUser(null);
            setProfile(null);
            sessionStorage.setItem('aceit_post_logout_home', 'true');
            const client = await ensureEntraMsalClient();
            // Reset the singleton so the next visit re-initializes MSAL cleanly.
            // MSAL's logoutRedirect() will clear cached accounts automatically.
            resetEntraMsalClient();
            return entraLogoutRedirect(client, {
                postLogoutRedirectUri: `${window.location.origin}/`
            });
        }
        if (!auth) {
            console.warn("[AuthContext] Firebase auth not initialized. Skipping signOut.");
            return Promise.resolve();
        }
        return signOut(auth);
    };

    return (
        <AuthContext.Provider value={{
            user,
            profile,
            refreshProfile,
            loading,
            isProfileLoading,
            authError,
            initialized,
            beginSignInFlow,
            retryEntraSession,
            loginWithGoogle,
            signupWithEmail,
            loginWithEmail,
            verifyEmail,
            resetPassword,
            changePassword,
            setPasswordForSocialUser,
            cancelSubscription,
            deleteUserAccount,
            reloadUser,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
