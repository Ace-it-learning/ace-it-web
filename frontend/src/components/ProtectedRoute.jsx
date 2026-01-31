import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const [isOnboarded, setIsOnboarded] = useState(null);
    const [showFallback, setShowFallback] = useState(false);
    const location = useLocation();

    useEffect(() => {
        console.log("ProtectedRoute useEffect: user =", user);
        if (user) {
            console.log(`ProtectedRoute: User is AUTHENTICATED (${user.uid})`);
            if (!user.uid) {
                console.error("ProtectedRoute: user found but uid is missing!");
                setIsOnboarded(true); // Don't block if something is weird
                return;
            }
            // Optimization: If user just finished onboarding (passed via navigation state OR localStorage), trust it immediately
            const justOnboardedLocal = localStorage.getItem('justOnboarded');
            if (location.state?.justOnboarded || justOnboardedLocal === 'true') {
                console.log("ProtectedRoute: User just onboarded (state/local flag), assuming onboarded.");
                setIsOnboarded(true);
                // Clear the flag after a short delay so next session checks properly
                if (justOnboardedLocal) setTimeout(() => localStorage.removeItem('justOnboarded'), 5000);
                return;
            }

            // Fallback: Check if user has a profile/onboarding complete via API
            // We implement a retry mechanism here to handle Firestore eventual consistency
            // (e.g., when a user just finished onboarding and redirects immediately)
            const checkOnboarding = async (retries = 3) => {
                try {
                    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                    console.log(`ProtectedRoute: Fetching onboarding status for ${user.uid} (Retries left: ${retries})`);

                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

                    const res = await fetch(`${API_URL}/api/stats?uid=${user.uid}`, {
                        signal: controller.signal
                    });
                    clearTimeout(timeoutId);

                    if (res.status === 404) {
                        if (retries > 0) {
                            console.log("ProtectedRoute: User not found yet, retrying in 500ms...");
                            setTimeout(() => checkOnboarding(retries - 1), 500);
                            return;
                        }
                        console.log(`ProtectedRoute: User ${user.uid} not found after retries, setting isOnboarded to false`);
                        setIsOnboarded(false);
                    } else if (res.ok) {
                        const data = await res.json();
                        console.log(`ProtectedRoute: User ${user.uid} data:`, data);

                        // If user is explicitly flagged as NEW, they are NOT onboarded.
                        if (data.is_new_student === true) {
                            console.log("ProtectedRoute: User is flagged as NEW, setting isOnboarded to false");
                            setIsOnboarded(false);
                        } else {
                            console.log(`ProtectedRoute: User ${user.uid} found and onboarded, setting isOnboarded to true`);
                            setIsOnboarded(true);
                        }
                    } else {
                        console.error(`ProtectedRoute: API returned error status ${res.status}`);
                        setIsOnboarded(true); // Don't block user if API fails unexpectedly
                    }
                } catch (err) {
                    console.error("ProtectedRoute onboarding check failed", err);
                    if (err.name === 'AbortError') {
                        console.log("ProtectedRoute: Fetch TIMEOUT. Assuming onboarded for fallback.");
                        setIsOnboarded(true);
                        return;
                    }
                    if (retries > 0) {
                        setTimeout(() => checkOnboarding(retries - 1), 500);
                    } else {
                        console.log("ProtectedRoute: Onboarding check failed after retries, assuming onboarded for safety.");
                        setIsOnboarded(true);
                    }
                }
            };
            checkOnboarding();
        } else {
            console.log("ProtectedRoute: User is GUEST (null)");
            setIsOnboarded(true); // Guests are "onboarded" by definition of being able to see public area
        }

        // Emergency timeout if onboarding check hangs
        const timeout = setTimeout(() => {
            if (isOnboarded === null) {
                console.warn("ProtectedRoute: Onboarding check taking too long, showing fallback.");
                setShowFallback(true);
            }
        }, 8000);

        return () => clearTimeout(timeout);
    }, [user, location.pathname, isOnboarded]); // Added location.pathname to re-check when moving pages

    // --- PRIVACY MODE GUARDIAN ---
    // PRIVATE on Production (aceit-learning.com), OPEN on Localhost
    const IS_PRIVATE_MODE = window.location.hostname !== 'localhost';
    const { loginWithGoogle } = useAuth(); // Destructure login method

    if (loading) {
        console.log("ProtectedRoute: Still loading auth state...");
        return (
            <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-[9999]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                <p className="text-gray-500 font-medium">Authenticating...</p>
            </div>
        );
    }

    // PRIVACY CHECK
    if (IS_PRIVATE_MODE) {
        if (!user) {
            // Render a "Under Construction" screen for guests
            return (
                <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-50 text-center p-4">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">🚧 Work In Progress 🚧</h1>
                    <p className="text-gray-600 mb-8">Ace It Learning is currently in private beta.</p>
                    <p className="text-sm text-gray-400">Please check back later!</p>

                    {/* Admin Login Button */}
                    <button
                        onClick={loginWithGoogle}
                        className="mt-8 px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full text-xs font-bold transition-all"
                    >
                        Admin Login
                    </button>
                </div>
            );
        }

        // If logged in but not in allowlist (Optional: remove this if you want ANY logged in user to see it)
        // For now, let's just assume if they managed to log in, they are "internal" enough, 
        // OR enforce the email check strictly. Let's enforce strictly if you want it PRIVATE.
        /*
        if (!ALLOWED_EMAILS.includes(user.email)) {
             return <div>Access Denied. Your email ({user.email}) is not on the private beta list.</div>;
        }
        */
    }

    if (!user) {
        console.log("ProtectedRoute: Rendering children for GUEST on", location.pathname);
        if (location.pathname === '/onboarding' || location.pathname === '/dashboard') {
            return <Navigate to="/login" />;
        }
        return children;
    }

    // CHECK EMAIL VERIFICATION
    if (!user.emailVerified) {
        console.log("ProtectedRoute: User NOT VERIFIED, redirecting to login with notice.");
        return <Navigate to="/login" state={{ message: "Please verify your email address to continue." }} />;
    }

    // Special case for onboarding page
    if (location.pathname === '/onboarding') {
        console.log("ProtectedRoute: Rendering Onboarding Page for Auth User");
        return children;
    }

    // Redirect to onboarding if profile not found
    if (isOnboarded === false) {
        console.log("ProtectedRoute: User not onboarded, REDIRECTING to /onboarding");
        return <Navigate to="/onboarding" />;
    }

    if (isOnboarded === null) {
        console.log("ProtectedRoute: Waiting for onboarding check");
        return (
            <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-[9999]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                <p className="text-gray-500 font-medium">Loading your profile...</p>
                {showFallback && (
                    <div className="mt-8 flex flex-col items-center gap-4 animate-in fade-in duration-500">
                        <p className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-lg">Taking longer than usual...</p>
                        <button
                            onClick={() => setIsOnboarded(true)}
                            className="text-primary font-bold hover:underline"
                        >
                            Skip Check & Enter Dashboard
                        </button>
                    </div>
                )}
            </div>
        );
    }

    console.log("ProtectedRoute: Access GRANTED for", user.uid, "on", location.pathname);
    return children;
};

export default ProtectedRoute;
