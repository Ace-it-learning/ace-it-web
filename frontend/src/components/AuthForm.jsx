import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { trackEvent } from '../utils/analytics';
const USE_ENTRA = import.meta.env.VITE_USE_ENTRA === 'true';

const DISPOSABLE_DOMAINS = [
    "yopmail.com", "temp-mail.org", "guerrillamail.com", "10minutemail.com",
    "sharklasers.com", "mailinator.com", "throwawaymail.com", "getnada.com",
    "dispostable.com", "fakeinbox.com", "maildrop.cc"
];

const AuthForm = ({ onAuthSuccess }) => {
    const { loginWithGoogle, signupWithEmail, loginWithEmail, verifyEmail, resetPassword, authError, loading: authBusy } = useAuth();
    const [mode, setMode] = useState('signup'); // 'login', 'signup', or 'forgot'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState(null); // { type: 'error' | 'success', text: string }
    const [loading, setLoading] = useState(false);
    const [visitorId, setVisitorId] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    useEffect(() => {
        if (location.state?.message) {
            setMessage({ type: 'success', text: location.state.message });
            setMode('login');
        }
    }, [location]);

    // FingerprintJS disabled for debugging blank page

    const isDisposableEmail = (email) => {
        const domain = email.split('@')[1];
        return domain && DISPOSABLE_DOMAINS.includes(domain.toLowerCase());
    };

    const checkDeviceLimit = async () => {
        if (!visitorId) return true;
        try {
            const res = await fetch(`${API_URL}/api/data/device-trials/${encodeURIComponent(visitorId)}`);
            if (!res.ok) return true;
            const data = await res.json();
            if (data && typeof data.count === 'number') return data.count < 2;
            return true;
        } catch (error) {
            console.error("Device check error:", error);
            return true;
        }
    };

    const incrementDeviceCount = async (uid) => {
        if (!visitorId) return;
        try {
            await fetch(`${API_URL}/api/data/device-trials/${encodeURIComponent(visitorId)}/increment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid })
            });
        } catch (error) {
            console.error("Device increment error:", error);
        }
    };

    const handleGoogleLogin = async () => {
        setMessage(null);
        setLoading(true);
        try {
            if (USE_ENTRA) {
                setMessage({ type: 'success', text: "Redirecting to Google sign-in..." });
            }
            await loginWithGoogle();
            trackEvent('User', 'Login', 'Google');
            if (onAuthSuccess) onAuthSuccess();
        } catch (error) {
            console.error("Google Login Error:", error);
            setMessage({ type: 'error', text: `Login failed: ${error.message}` });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);
        setLoading(true);

        if (mode === 'signup') {
            if (isDisposableEmail(email)) {
                setMessage({ type: 'error', text: "Please use a valid, permanent email address. Disposable emails are not accepted." });
                setLoading(false);
                return;
            }

            if (!USE_ENTRA) {
                const allowed = await checkDeviceLimit();
                if (!allowed) {
                    setMessage({ type: 'error', text: "Device limit reached. You can only create 2 trial accounts on this device." });
                    setLoading(false);
                    return;
                }
            }
        }

        try {
            if (mode === 'signup') {
                const userCred = await signupWithEmail(email, password);
                if (!USE_ENTRA && userCred?.user?.uid) {
                    await incrementDeviceCount(userCred.user.uid);
                    await verifyEmail(userCred.user);
                }
                trackEvent('User', 'Signup', 'Email');
                if (USE_ENTRA) {
                    setMessage({ type: 'success', text: "Redirecting to secure email sign-up..." });
                } else {
                    setMessage({ type: 'success', text: "Verification email sent! Please check your inbox before logging in." });
                    setMode('login');
                }
            } else if (mode === 'login') {
                await loginWithEmail(email, password);
                trackEvent('User', 'Login', 'Email');
                if (onAuthSuccess) onAuthSuccess();
            } else if (mode === 'forgot') {
                if (USE_ENTRA) {
                    await resetPassword(email);
                    setMessage({ type: 'success', text: "Redirecting to secure password reset..." });
                    return;
                }
                const response = await fetch(`${API_URL}/api/user/check-methods/${encodeURIComponent(email)}`);
                const { providers } = await response.json();
                
                if (providers && providers.length > 0 && !providers.includes('password')) {
                    if (providers.includes('google.com')) {
                        throw new Error("This account is linked to Google. Please sign in with Google instead.");
                    } else {
                        throw new Error("This account uses a different sign-in method. Please use your original login method.");
                    }
                }
                
                await resetPassword(email);
                setMessage({ type: 'success', text: "Reset email sent! Check your inbox to set a new password." });
            }
        } catch (err) {
            console.error(err);
            let msg = err.message || "Authentication failed.";
            
            // Clean up Firebase specific error messages if they have codes
            if (err.code === 'auth/email-already-in-use') msg = "Email already in use.";
            if (err.code === 'auth/weak-password') msg = "Password should be at least 6 characters.";
            if (err.code === 'auth/invalid-credential') {
                navigate('/auth-error');
                return;
            }
            if (err.code === 'auth/user-not-found') msg = "No account found with this email.";
            
            setMessage({ type: 'error', text: msg });
        } finally {
            setLoading(false);
        }
    };

    if (mode === 'forgot') {
        return (
            <div className="w-full text-left">
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Reset Password</h2>
                    <p className="text-sm text-slate-500">Enter your email and we'll send you a link to reset your password.</p>
                </div>

                {message && (
                    <div className={`p-3 rounded-lg text-xs font-bold mb-4 ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                            placeholder="your@email.com"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-sm transition-all shadow-lg hover:shadow-primary/20 active:scale-95 disabled:opacity-50"
                    >
                        {loading ? "Sending..." : "Send Reset Link"}
                    </button>

                    <button
                        type="button"
                        onClick={() => { setMode('login'); setMessage(null); }}
                        className="w-full text-center text-sm font-bold text-primary hover:underline"
                    >
                        Back to Login
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="w-full text-left">
            <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700">
                <button
                    onClick={() => { setMode('signup'); setMessage(null); }}
                    className={`pb-2 text-sm font-bold transition-all ${mode === 'signup' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    Create Account
                </button>
                <button
                    onClick={() => { setMode('login'); setMessage(null); }}
                    className={`pb-2 text-sm font-bold transition-all ${mode === 'login' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    Log In
                </button>
            </div>

            {message && (
                <div className={`p-3 rounded-lg text-xs font-bold mb-4 ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message.text}
                </div>
            )}
            {authError && (
                <div className="p-3 rounded-lg text-xs font-bold mb-4 bg-red-100 text-red-700">
                    {authError}
                </div>
            )}

            {USE_ENTRA && (
                <div
                    className="mb-4 rounded-xl border border-slate-200/90 bg-slate-50/90 p-3 text-[11px] leading-relaxed text-slate-700 dark:border-slate-600 dark:bg-slate-800/60 dark:text-slate-200"
                    role="note"
                    aria-label="How Microsoft sign-in works"
                >
                    <p className="font-bold text-slate-800 dark:text-slate-100">How sign-up works (not an error)</p>
                    <p className="mt-1.5 text-slate-600 dark:text-slate-300">
                        You continue on <strong>Microsoft Entra’s</strong> pages to finish creating your account — that
                        redirect is normal.
                    </p>
                    <details className="mt-2 rounded-lg border border-slate-200/80 bg-white/60 p-2 dark:border-slate-600 dark:bg-slate-900/40">
                        <summary className="cursor-pointer select-none font-semibold text-slate-700 dark:text-slate-200">
                            More detail &amp; troubleshooting
                        </summary>
                        <ul className="mt-2 list-disc space-y-2 pl-4 text-slate-600 dark:text-slate-300">
                            <li>
                                <strong>Ace It cannot finish sign-up in this box.</strong> Identity is handled on{' '}
                                <strong>Microsoft’s secure pages</strong> (same idea as “Sign in with …” elsewhere). The
                                next screen is expected, not a bug.
                            </li>
                            <li>
                                The email field is only a <strong>hint</strong>. Password is <strong>not</strong> collected
                                here; Entra may use a one-time code or password on their screens, depending on tenant
                                settings.
                            </li>
                            <li>
                                If you see <strong>Google</strong> after typing @outlook / @hotmail, your Azure{' '}
                                <strong>user flow</strong> may list Google first. Try “Use another account” /{' '}
                                <strong>使用其他帳戶</strong>, Incognito, or ask your admin to put <strong>Email (local)</strong>{' '}
                                before Google in the flow.
                            </li>
                        </ul>
                    </details>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Email</label>
                    <input
                        type="email"
                        name="ace_it_email"
                        autoComplete="off"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                        placeholder="your@email.com"
                    />
                    {USE_ENTRA && (
                        <p className="mt-1 text-[10px] text-slate-500">
                            Used as a sign-in hint to Microsoft (your email in the box above).
                        </p>
                    )}
                </div>
                {!USE_ENTRA && (
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
                            {mode === 'login' && (
                                <button
                                    type="button"
                                    onClick={() => { setMode('forgot'); setMessage(null); }}
                                    className="text-[10px] font-bold text-primary hover:underline"
                                >
                                    Forgot Password?
                                </button>
                            )}
                        </div>
                        <input
                            type="password"
                            name="ace_it_password"
                            autoComplete="new-password"
                            required
                            minLength={6}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                            placeholder="Enter your password"
                        />
                    </div>
                )}
                {USE_ENTRA && mode === 'login' && (
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={() => { setMode('forgot'); setMessage(null); }}
                            className="text-[10px] font-bold text-primary hover:underline"
                        >
                            Forgot Password?
                        </button>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-sm transition-all shadow-lg hover:shadow-primary/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading
                        ? 'Redirecting...'
                        : (USE_ENTRA
                            ? (mode === 'signup' ? 'Continue to secure sign-up (Entra)' : 'Continue to secure sign-in (Entra)')
                            : (mode === 'signup' ? 'Continue with Email' : 'Continue with Email'))}
                </button>

                {USE_ENTRA && (
                    <p className="text-[11px] text-slate-500 text-center">
                        Powered by Microsoft Entra External ID — you will leave this page to finish sign-up or sign-in.
                    </p>
                )}
            </form>

            <div className="relative my-6 text-center">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-gray-700"></div></div>
                <span className="relative px-2 bg-white dark:bg-gray-800 text-xs text-gray-400 uppercase">Or continue with</span>
            </div>

            <button
                onClick={handleGoogleLogin}
                type="button"
                disabled={loading || authBusy}
                className="w-full py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <img src="https://www.google.com/favicon.ico" alt="G" className="w-4 h-4" />
                Continue with Google
            </button>

            <p className="text-[10px] text-gray-400 text-center">
                By entering, you agree to our Terms & Conditions.
            </p>
        </div>
    );
};

export default AuthForm;
