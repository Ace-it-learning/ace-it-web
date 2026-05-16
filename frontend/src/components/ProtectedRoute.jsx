import React, { useEffect, useState, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingPage } from './shared';
import { fetchWithAuth } from '../utils/apiAuth';
import { apiUrl } from '../utils/apiBase';

const USE_ENTRA = import.meta.env.VITE_USE_ENTRA === 'true';

const isLocalDevHost = () => {
    const h = typeof window !== 'undefined' ? window.location.hostname : '';
    return h === 'localhost' || h === '127.0.0.1' || h.endsWith('.localhost');
};

const isEmailVerificationSatisfied = (authUser) => {
    if (!authUser) return false;
    if (USE_ENTRA || authUser.authProvider === 'entra') return true;
    if (authUser.emailVerified === true) return true;
    return isLocalDevHost();
};

const profileIndicatesOnboarded = (profile) => {
    if (!profile || typeof profile !== 'object') return false;
    if (profile.is_new_student === false) return true;
    if (profile.status === 'active') return true;
    if (profile.onboarding_completed === true) return true;
    if (profile.school || profile.nickname) return true;
    return false;
};

const ProtectedRoute = ({ children }) => {
    const { user, loading, initialized, isProfileLoading, profile } = useAuth();
    const [isOnboarded, setIsOnboarded] = useState(null);
    const onboardedRef = useRef(null); // Ref for timeout closure safety
    const [checkedUid, setCheckedUid] = useState(null);
    const [showFallback, setShowFallback] = useState(false);
    const location = useLocation();

    // Reset state when user or UID changes to force a re-check
    useEffect(() => {
        setIsOnboarded(null);
        onboardedRef.current = null;
        setCheckedUid(null);
        setShowFallback(false);
    }, [user?.uid]);

    useEffect(() => {
        if (user?.uid && profileIndicatesOnboarded(profile)) {
            setIsOnboarded(true);
            onboardedRef.current = true;
            setCheckedUid(user.uid);
        }
    }, [user?.uid, profile]);

    useEffect(() => {
        console.log("ProtectedRoute useEffect: user =", user?.uid);

        // Emergency timeout if onboarding check hangs
        const timeout = setTimeout(() => {
            // Check the ref, not the state, to get the freshest value in the closure
            if (onboardedRef.current === null && user) {
                console.warn("ProtectedRoute: Onboarding check taking too long, showing fallback.");
                setShowFallback(true);
            }
        }, 5000); // Reduced from 8s for better UX

        if (user) {
            console.log(`ProtectedRoute: User is AUTHENTICATED (${user.uid})`);
            if (!user.uid) {
                console.error("ProtectedRoute: user found but uid is missing!");
                setIsOnboarded(true); // Don't block if something is weird
                clearTimeout(timeout);
                return;
            }
            // Fallback: Check if user has a profile/onboarding complete via API
            // We implement a retry mechanism here to handle Firestore eventual consistency
            const checkOnboarding = async (retries = 3) => {
                try {
                    console.log(`ProtectedRoute: Fetching onboarding status for ${user.uid} (Retries left: ${retries})`);

                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 10000);
                    const res = await fetchWithAuth(user, apiUrl(`/api/stats?uid=${user.uid}`), {
                        signal: controller.signal,
                    });
                    clearTimeout(timeoutId);
                    if (res.ok) {
                        const data = await res.json();
                        console.log(`ProtectedRoute: User ${user.uid} stats data:`, data);

                        // If user is explicitly flagged as NEW, they are NOT onboarded.
                        if (data.is_new_student === true) {
                            if (profileIndicatesOnboarded(profile)) {
                                console.log("ProtectedRoute: stats says NEW but profile shows returning — allow dashboard.");
                                setIsOnboarded(true);
                                onboardedRef.current = true;
                                setCheckedUid(user.uid);
                                return;
                            }
                            console.log("ProtectedRoute: User is flagged as NEW, setting isOnboarded to false");
                            localStorage.removeItem('justOnboarded'); // Clear stale flag
                            setIsOnboarded(false);
                            onboardedRef.current = false;
                            setCheckedUid(user.uid);
                            return;
                        }

                        // Also check if they just onboarded (state flag)
                        if (location.state?.justOnboarded || localStorage.getItem('justOnboarded') === 'true') {
                            console.log("ProtectedRoute: User just onboarded (flag detected), setting isOnboarded to true");
                            setIsOnboarded(true);
                            onboardedRef.current = true;
                            setCheckedUid(user.uid);
                            // Clear localStorage after verify
                            setTimeout(() => localStorage.removeItem('justOnboarded'), 5000);
                            return;
                        }

                        // Default behavior: if profile exists but not flagged as new, they are onboarded
                        console.log(`ProtectedRoute: User ${user.uid} verified onboarded.`);
                        setIsOnboarded(true);
                        onboardedRef.current = true;
                        setCheckedUid(user.uid);
                    } else if (res.status === 404) {
                        if (profileIndicatesOnboarded(profile)) {
                            console.log("ProtectedRoute: stats 404 but profile shows returning user — allow dashboard.");
                            setIsOnboarded(true);
                            onboardedRef.current = true;
                            setCheckedUid(user.uid);
                        } else if (retries > 0) {
                            console.log("ProtectedRoute: User profile 404, retrying...");
                            setTimeout(() => checkOnboarding(retries - 1), 500);
                        } else {
                            console.log("ProtectedRoute: User profile not found after retries. Assuming NEW.");
                            setIsOnboarded(false);
                            onboardedRef.current = false;
                            setCheckedUid(user.uid);
                        }
                    } else {
                        console.error(`ProtectedRoute: API error ${res.status}. Allowing access as fallback.`);
                        setIsOnboarded(true);
                        onboardedRef.current = true;
                        setCheckedUid(user.uid);
                    }
                } catch (err) {
                    console.error("ProtectedRoute check failed:", err);
                    if (retries > 0) {
                        setTimeout(() => checkOnboarding(retries - 1), 1000);
                    } else {
                        console.warn("ProtectedRoute: Max retries reached. Allowing access as emergency fallback.");
                        setIsOnboarded(true);
                        onboardedRef.current = true;
                        setCheckedUid(user.uid);
                    }
                }
            };

            // Re-check whenever onboarding state is unknown or UID changed
            if (checkedUid !== user.uid || isOnboarded === null) {
                console.log(`ProtectedRoute: UID mismatch (${checkedUid} vs ${user.uid}), triggering check...`);
                if (isOnboarded !== true) {
                    setIsOnboarded(null);
                    onboardedRef.current = null;
                }
                checkOnboarding();
            }
        } else {
            console.log("ProtectedRoute: User is GUEST (null)");
            setIsOnboarded(true);
            setCheckedUid('guest');
        }

        return () => clearTimeout(timeout);
    }, [user?.uid, location.pathname]); // Removed isOnboarded from deps to prevent loop, used user?.uid for stability

    const stillAwaitingUidCheck = user && checkedUid !== user.uid && isOnboarded !== true;
    const stillLoadingProfile = isProfileLoading && isOnboarded !== true;

    // 1. Wait for initialization before making any redirection decisions (include profile load
    // so Entra resolve-identity finishes before we treat missing user as "guest").
    if (!initialized || loading || stillLoadingProfile || stillAwaitingUidCheck) {
        return (
            <LoadingPage 
                title="Preparing your Ace-it experience..." 
                subtext="Syncing your progress and personalizing your dashboard."
            >
                {showFallback && (
                    <div className="mt-12 p-8 bg-white rounded-[2rem] border border-slate-100 shadow-2xl shadow-slate-200/50 max-w-sm w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Connection Notice</p>
                        <p className="text-slate-600 mb-8 leading-relaxed">It's taking a bit longer to fetch your data. You can try skipping the check if you're in a hurry.</p>
                        
                        <div className="flex flex-col gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsOnboarded(true);
                                    onboardedRef.current = true;
                                    if (user?.uid) setCheckedUid(user.uid);
                                }}
                                className="w-full py-4 bg-orange-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-orange-200 hover:scale-[1.02] transition-transform active:scale-[0.98]"
                            >
                                Skip & Continue
                            </button>
                            <button
                                onClick={() => window.location.href = '/dashboard'}
                                className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-colors"
                            >
                                Back to Dashboard
                            </button>
                        </div>
                    </div>
                )}
            </LoadingPage>
        );
    }

    // 2. Handle Unauthenticated (Guest) Users
    // Only redirect if we are CERTAIN there is no user AND auth has initialized
    if (!user && initialized && !loading && !isProfileLoading) {
        console.log("ProtectedRoute: User confirmed GUEST, checking redirect...");
        if (location.pathname === '/onboarding' || location.pathname === '/dashboard') {
            return <Navigate to="/login" />;
        }
        return children;
    }

    // 3. Handle Authenticated Users but loading onboarding status
    if (isOnboarded === null) {
        return (
            <LoadingPage 
                title="Verifying profile..." 
                subtext="Checking your enrollment status."
            />
        );
    }

    // 4. EMAIL VERIFICATION (Firebase only; Entra / local dev exempt)
    if (!isEmailVerificationSatisfied(user)) {
        console.log("ProtectedRoute: User NOT VERIFIED, redirecting to login with notice.");
        return <Navigate to="/login" state={{ message: "Please verify your email address to continue." }} />;
    }

    // Special case for onboarding page
    if (location.pathname === '/onboarding') {
        console.log("ProtectedRoute: Rendering Onboarding Page for Auth User");
        return children;
    }

    // Redirect to onboarding if profile not found
    // IMPORTANT: Only check this if we have actually verified the CURRENT user
    if (user && checkedUid === user.uid && isOnboarded === false) {
        if (isLocalDevHost() && import.meta.env.DEV) {
            console.warn(
                'ProtectedRoute: DEV localhost — allowing dashboard (complete onboarding from Account when ready).'
            );
            return children;
        }
        console.log("ProtectedRoute: User not onboarded, REDIRECTING to /onboarding");
        return <Navigate to="/onboarding" />;
    }

    console.log("ProtectedRoute: Access GRANTED for", user.uid, "on", location.pathname);
    return children;
};

export default ProtectedRoute;
