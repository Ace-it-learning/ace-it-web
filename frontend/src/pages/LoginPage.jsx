import React, { useEffect, useState } from 'react';
import AuthForm from '../components/AuthForm';
import { useAuth } from '../context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { ensureEntraMsalClient, resetEntraMsalClient } from '../entraMsalSingleton';

const USE_ENTRA = import.meta.env.VITE_USE_ENTRA === 'true';

function hasOAuthRedirectHash() {
    const raw = typeof window !== 'undefined' ? (window.location.hash || '') : '';
    if (!raw || raw.length < 2) return false;
    const q = new URLSearchParams(raw.startsWith('#') ? raw.slice(1) : raw);
    return q.has('code') || q.has('error') || q.has('access_token') || q.has('id_token');
}

const LoginPage = () => {
    const { user, beginSignInFlow, retryEntraSession, initialized, loading, authError } = useAuth();
    const navigate = useNavigate();
    const [entraFormFallback, setEntraFormFallback] = useState(false);
    const [showSlowSignInHint, setShowSlowSignInHint] = useState(false);

    useEffect(() => {
        if (!USE_ENTRA || entraFormFallback || user || authError) {
            setShowSlowSignInHint(false);
            return undefined;
        }
        const t = window.setTimeout(() => setShowSlowSignInHint(true), 14000);
        return () => window.clearTimeout(t);
    }, [user, authError, entraFormFallback]);

    useEffect(() => {
        if (!USE_ENTRA || user) return;
        // Wait for MSAL handleRedirectPromise + resolve-identity — otherwise we fire loginRedirect
        // while returning from Entra and create a stuck redirect loop (/dashboard ↔ /login).
        if (!initialized || loading) return;
        if (sessionStorage.getItem('aceit_post_logout_home') === 'true') {
            if (!hasOAuthRedirectHash()) {
                sessionStorage.removeItem('aceit_post_logout_home');
                navigate('/', { replace: true });
                return;
            }
            sessionStorage.removeItem('aceit_post_logout_home');
        }

        let cancelled = false;
        (async () => {
            try {
                const client = await ensureEntraMsalClient();
                if (cancelled) return;

                // AuthContext's initEntra effect already called ensureEntraMsalClient(),
                // which internally runs handleRedirectPromise().  Calling it again here
                // returns null because the hash was already consumed.  We skip the
                // redundant call and simply check whether MSAL already has an account.
                const hasMsalAccount = client.getAllAccounts().length > 0;
                if (hasMsalAccount) {
                    await retryEntraSession();
                    return;
                }
                // No MSAL account and no previous error — start fresh sign-in
                if (!authError) {
                    await beginSignInFlow();
                }
            } catch (e) {
                console.error('[LoginPage] Entra redirect failed:', e);
                // If MSAL reports interaction_in_progress, reset the singleton and retry once.
                const msg = String(e?.message || e || '');
                const code = e?.errorCode || e?.name || '';
                if (code === 'interaction_in_progress' || msg.includes('interaction_in_progress')) {
                    resetEntraMsalClient();
                    try {
                        const client = await ensureEntraMsalClient();
                        if (cancelled) return;
                        const hasMsalAccount = client.getAllAccounts().length > 0;
                        if (hasMsalAccount) {
                            await retryEntraSession();
                            return;
                        }
                        if (!authError) {
                            await beginSignInFlow();
                        }
                        return;
                    } catch (e2) {
                        console.error('[LoginPage] Entra retry failed:', e2);
                    }
                }
                if (!cancelled) setEntraFormFallback(true);
            }
        })();
        return () => { cancelled = true; };
    }, [user, beginSignInFlow, retryEntraSession, initialized, loading, authError]);

    const canEnterApp =
        user &&
        (user.emailVerified === true ||
            USE_ENTRA ||
            user.authProvider === 'entra' ||
            ['localhost', '127.0.0.1'].includes(window.location.hostname) ||
            window.location.hostname.endsWith('.localhost'));

    if (canEnterApp) {
        return <Navigate to="/dashboard" replace />;
    }

    if (USE_ENTRA && !entraFormFallback) {
        return (
            <div className="flex-1 flex min-h-[50vh] flex-col items-center justify-center gap-6 p-4 max-w-lg mx-auto text-center">
                <div
                    className="h-9 w-9 shrink-0 rounded-full border-2 border-primary border-t-transparent animate-spin"
                    aria-hidden
                />
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                    {!initialized || loading ? 'Completing sign-in…' : 'Continuing…'}
                </p>
                {showSlowSignInHint && !authError && (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-xs text-slate-700 dark:border-slate-600 dark:bg-slate-800/60 dark:text-slate-200">
                        <p className="font-semibold text-slate-800 dark:text-slate-100">Still here?</p>
                        <p className="mt-1 leading-relaxed">
                            Microsoft sign-in finished, but Ace It! is still talking to the server. Check your network,
                            confirm the API URL is correct for this environment, or try manual sign-in below.
                        </p>
                        <button
                            type="button"
                            onClick={() => setEntraFormFallback(true)}
                            className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 hover:bg-slate-50 dark:border-slate-500 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                        >
                            Use manual sign-in form
                        </button>
                    </div>
                )}
                {authError && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-4 text-left text-sm text-red-900 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-100">
                        <p className="font-bold mb-2">Could not finish sign-in</p>
                        <p className="whitespace-pre-wrap leading-snug">{authError}</p>
                        <p className="mt-3 text-xs text-red-800/90 dark:text-red-200">
                            Microsoft may show “signed in”, but Ace-it still needs your backend to accept the ID token (ENTRA_AUDIENCE = same SPA client id as VITE_ENTRA_CLIENT_ID). If you see “timed_out”, in Entra add this exact Redirect URI (SPA): your site origin + “/msal-silent.html” (e.g. http://localhost:3005/msal-silent.html) — silent sign-in uses a blank page so the main app router does not strip the hash.
                        </p>
                        <div className="mt-4 flex flex-col gap-2">
                            <button
                                type="button"
                                onClick={() => retryEntraSession()}
                                className="w-full rounded-xl bg-slate-900 px-4 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-black"
                            >
                                Retry linking to Ace-it
                            </button>
                            <button
                                type="button"
                                onClick={() => window.location.reload()}
                                className="w-full rounded-xl border border-red-300 bg-white px-4 py-3 text-xs font-black uppercase tracking-widest text-red-900 hover:bg-red-50"
                            >
                                Reload page
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="flex-1 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white dark:bg-[#1a110a] rounded-[3rem] shadow-2xl shadow-primary/5 p-10 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 border border-black/5 dark:border-white/10">
                <div className="flex flex-col items-center gap-6">
                    <div className="bg-[#fff5ee] dark:bg-primary/10 p-4 rounded-full">
                        <div className="bg-white dark:bg-[#1a110a] p-3 rounded-full shadow-sm">
                            <span className="text-3xl">🔒</span>
                        </div>
                    </div>
                </div>

                <AuthForm onAuthSuccess={() => navigate('/dashboard', { replace: true })} />
            </div>
        </div>
    );
};

export default LoginPage;
