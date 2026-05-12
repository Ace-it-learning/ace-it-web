import React, { useEffect, useState } from 'react';
import AuthForm from '../components/AuthForm';
import { useAuth } from '../context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { ensureEntraMsalClient } from '../entraMsalSingleton';

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
        // resolve-identity failed — do not bounce back to Microsoft (user stays on picker forever).
        if (authError) return;

        let cancelled = false;
        (async () => {
            try {
                const client = await ensureEntraMsalClient();
                if (cancelled) return;
                const hasMsalAccount = client.getAllAccounts().length > 0;
                if (hasMsalAccount) {
                    await retryEntraSession();
                    return;
                }
                await beginSignInFlow();
            } catch (e) {
                console.error('[LoginPage] Entra redirect failed:', e);
                if (!cancelled) setEntraFormFallback(true);
            }
        })();
        return () => { cancelled = true; };
    }, [user, beginSignInFlow, retryEntraSession, initialized, loading, authError]);

    if (user && user.emailVerified) {
        return <Navigate to="/dashboard" replace />;
    }

    if (USE_ENTRA && !entraFormFallback) {
        return (
            <div className="flex-1 flex min-h-[50vh] flex-col items-center justify-center gap-6 p-4 max-w-lg mx-auto text-center">
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                    {!initialized || loading ? 'Completing sign-in…' : 'Continuing…'}
                </p>
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
