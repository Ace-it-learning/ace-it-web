import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, increment } from 'firebase/firestore';
import { getAdditionalUserInfo, deleteUser } from 'firebase/auth';
import { db } from '../firebase';
import { Lock } from 'lucide-react';

const DISPOSABLE_DOMAINS = [
    "yopmail.com", "temp-mail.org", "guerrillamail.com", "10minutemail.com",
    "sharklasers.com", "mailinator.com", "throwawaymail.com", "getnada.com",
    "dispostable.com", "fakeinbox.com", "maildrop.cc"
];

const AuthForm = ({ onAuthSuccess }) => {
    const { loginWithGoogle, signupWithEmail, loginWithEmail, verifyEmail } = useAuth();
    const [mode, setMode] = useState('signup'); // 'login' or 'signup'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState(null); // { type: 'error' | 'success', text: string }
    const [loading, setLoading] = useState(false);
    const [visitorId, setVisitorId] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();

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
            const docRef = doc(db, 'device_trials', visitorId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                return data.count < 2;
            }
            return true;
        } catch (error) {
            console.error("Device check error:", error);
            return true;
        }
    };

    const incrementDeviceCount = async (uid) => {
        if (!visitorId) return;
        try {
            const docRef = doc(db, 'device_trials', visitorId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                await updateDoc(docRef, {
                    count: increment(1),
                    uids: arrayUnion(uid),
                    last_signup: new Date()
                });
            } else {
                await setDoc(docRef, {
                    count: 1,
                    uids: [uid],
                    last_signup: new Date()
                });
            }
        } catch (error) {
            console.error("Device increment error:", error);
        }
    };

    const handleGoogleLogin = async () => {
        setMessage(null);
        setLoading(true);
        try {
            const userCred = await loginWithGoogle();
            const { isNewUser } = getAdditionalUserInfo(userCred);

            if (isNewUser) {
                const allowed = await checkDeviceLimit();
                if (!allowed) {
                    await deleteUser(userCred.user);
                    setMessage({ type: 'error', text: "Device limit reached. You can only create 2 trial accounts on this device." });
                    setLoading(false);
                    return;
                }
                await incrementDeviceCount(userCred.user.uid);
            }
            if (onAuthSuccess) onAuthSuccess();
        } catch (error) {
            console.error("Google Login Error:", error);
            setMessage({ type: 'error', text: `Login failed: ${error.message}` });
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

            const allowed = await checkDeviceLimit();
            if (!allowed) {
                setMessage({ type: 'error', text: "Device limit reached. You can only create 2 trial accounts on this device." });
                setLoading(false);
                return;
            }
        }

        try {
            if (mode === 'signup') {
                const userCred = await signupWithEmail(email, password);
                await incrementDeviceCount(userCred.user.uid);
                await verifyEmail(userCred.user);
                setMessage({ type: 'success', text: "Verification email sent! Please check your inbox before logging in." });
                setMode('login');
            } else {
                await loginWithEmail(email, password);
                if (onAuthSuccess) onAuthSuccess();
            }
        } catch (err) {
            console.error(err);
            let msg = "Authentication failed.";
            if (err.code === 'auth/email-already-in-use') msg = "Email already in use.";
            if (err.code === 'auth/weak-password') msg = "Password should be at least 6 characters.";
            if (err.code === 'auth/invalid-credential') {
                navigate('/auth-error');
                return;
            }
            setMessage({ type: 'error', text: msg });
        } finally {
            setLoading(false);
        }
    };

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
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Password</label>
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
                    {loading ? "Processing..." : (mode === 'signup' ? "Sign Up & Verify" : "Sign In")}
                </button>
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
                Google
            </button>

            <p className="text-[10px] text-gray-400 text-center">
                By entering, you agree to our Terms & Conditions.
            </p>
        </div>
    );
};

export default AuthForm;
