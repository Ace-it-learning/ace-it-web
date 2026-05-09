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
    const { loginWithGoogle, signupWithEmail, loginWithEmail, verifyEmail, resetPassword, authError } = useAuth();
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
                </div>
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

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-sm transition-all shadow-lg hover:shadow-primary/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? "Redirecting..." : (mode === 'signup' ? "Continue with Email" : "Continue with Email")}
                </button>

                {USE_ENTRA && (
                    <p className="text-[11px] text-slate-500 text-center">
                        You will continue on AceIt secure sign-in powered by Microsoft Entra.
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
                className="w-full py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white mb-4"
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
