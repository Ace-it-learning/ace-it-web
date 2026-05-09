import React, { createContext, useContext, useEffect, useState } from 'react';
import { PublicClientApplication } from '@azure/msal-browser';
import { auth, googleProvider } from '../firebase';
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

const entraConfig = {
    auth: {
        clientId: import.meta.env.VITE_ENTRA_CLIENT_ID || '',
        authority: import.meta.env.VITE_ENTRA_AUTHORITY || '',
        redirectUri: import.meta.env.VITE_ENTRA_REDIRECT_URI || `${window.location.origin}/login`,
        postLogoutRedirectUri: import.meta.env.VITE_ENTRA_POST_LOGOUT_REDIRECT_URI || `${window.location.origin}/login`
    },
    cache: {
        cacheLocation: 'localStorage'
    }
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isProfileLoading, setIsProfileLoading] = useState(false);
    const [initialized, setInitialized] = useState(false); // New state to track if onAuthStateChanged fired
    const [msalClient, setMsalClient] = useState(null);
    const [authError, setAuthError] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    const fetchProfile = async (uid) => {
        if (!uid || uid === 'guest') {
            setProfile(null);
            return;
        }
        setIsProfileLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/user/profile/${uid}`);
            if (res.ok) {
                const data = await res.json();
                setProfile(data);
            }
        } catch (error) {
            console.error("[AuthContext] Failed to fetch profile:", error);
        } finally {
            setIsProfileLoading(false);
            setInitialized(true); // Initialized after profile fetch attempt
        }
    };

    const refreshProfile = () => {
        if (user?.uid) fetchProfile(user.uid);
    };

    useEffect(() => {
        if (USE_ENTRA) return;
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            console.log("[AuthContext] onAuthStateChanged:", currentUser?.uid || 'guest');
            setUser(currentUser);
            if (currentUser) {
                await fetchProfile(currentUser.uid);
            } else {
                setProfile(null);
                setLoading(false);
                setInitialized(true); // Definitive guest state
            }
        });
        return unsubscribe;
    }, []);

    const resolveIdentityWithToken = async (token, msUser) => {
        const identityRes = await fetch(`${API_URL}/api/user/resolve-identity`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!identityRes.ok) throw new Error("Failed to resolve user identity");
        const identity = await identityRes.json();
        const mappedUser = {
            uid: identity.uid,
            email: msUser?.username || identity.email,
            displayName: msUser?.name || (msUser?.username ? msUser.username.split('@')[0] : 'Student'),
            emailVerified: true,
            photoURL: null,
            getIdToken: async () => token
        };
        setUser(mappedUser);
        await fetchProfile(mappedUser.uid);
    };

    useEffect(() => {
        if (!USE_ENTRA) return;
        let mounted = true;
        const initEntra = async () => {
            try {
                if (!entraConfig.auth.clientId || !entraConfig.auth.authority) {
                    throw new Error("Missing Entra config: VITE_ENTRA_CLIENT_ID or VITE_ENTRA_AUTHORITY");
                }
                setAuthError(null);

                const client = new PublicClientApplication(entraConfig);
                await client.initialize();
                if (!mounted) return;
                setMsalClient(client);

                const redirectResult = await client.handleRedirectPromise();
                if (redirectResult?.account) client.setActiveAccount(redirectResult.account);

                const activeAccount = client.getActiveAccount() || client.getAllAccounts()[0];
                if (!activeAccount) {
                    setUser(null);
                    setProfile(null);
                    setInitialized(true);
                    setLoading(false);
                    return;
                }

                client.setActiveAccount(activeAccount);
                const tokenResp = await client.acquireTokenSilent({
                    account: activeAccount,
                    scopes: ['openid', 'profile', 'email']
                });
                const token = tokenResp?.idToken || tokenResp?.accessToken;
                if (!token) throw new Error("No Entra token available");
                await resolveIdentityWithToken(token, activeAccount);
                setInitialized(true);
                setLoading(false);
            } catch (err) {
                console.error('[AuthContext] Entra init error:', err);
                setAuthError("Sign-in could not be completed. Please try again.");
                setUser(null);
                setProfile(null);
                setInitialized(true);
                setLoading(false);
            }
        };

        initEntra();
        return () => { mounted = false; };
    }, []);

    const reloadUser = async () => {
        if (USE_ENTRA && msalClient) {
            const account = msalClient.getActiveAccount() || msalClient.getAllAccounts()[0];
            if (!account) return null;
            const tokenResp = await msalClient.acquireTokenSilent({
                account,
                scopes: ['openid', 'profile', 'email']
            });
            const token = tokenResp?.idToken || tokenResp?.accessToken;
            if (token) {
                const nextUser = { ...(user || {}), getIdToken: async () => token };
                setUser(nextUser);
                return nextUser;
            }
            return null;
        }
        if (auth.currentUser) {
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

    const loginWithGoogle = () => {
        if (USE_ENTRA && msalClient) {
            setAuthError(null);
            return msalClient.loginRedirect({
                scopes: ['openid', 'profile', 'email'],
                prompt: 'select_account',
                extraQueryParameters: { domain_hint: 'google.com', prompt: 'select_account' }
            });
        }
        console.log("Initiating Google Sign-In Popup inside AuthContext...");
        return signInWithPopup(auth, googleProvider);
    };

    const signupWithEmail = (email, password) => {
        if (USE_ENTRA && msalClient) {
            setAuthError(null);
            return msalClient.loginRedirect({
                scopes: ['openid', 'profile', 'email'],
                loginHint: email || undefined
            });
        }
        return createUserWithEmailAndPassword(auth, email, password);
    };

    const loginWithEmail = (email, password) => {
        if (USE_ENTRA && msalClient) {
            setAuthError(null);
            return msalClient.loginRedirect({
                scopes: ['openid', 'profile', 'email'],
                loginHint: email || undefined
            });
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

    const resetPassword = (email) => {
        if (USE_ENTRA && msalClient) {
            setAuthError(null);
            return msalClient.loginRedirect({
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
        return sendPasswordResetEmail(auth, email, actionCodeSettings);
    };

    const changePassword = async (currentPassword, newPassword) => {
        if (USE_ENTRA) throw new Error("Password change is managed by Microsoft Entra.");
        if (!user || !user.email) throw new Error("User not authenticated");
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);
        return updatePassword(user, newPassword);
    };

    const setPasswordForSocialUser = async (newPassword) => {
        if (USE_ENTRA) throw new Error("Password setup is managed by Microsoft Entra.");
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

    const logout = () => {
        if (USE_ENTRA && msalClient) {
            setUser(null);
            setProfile(null);
            return msalClient.logoutRedirect({
                postLogoutRedirectUri: entraConfig.auth.postLogoutRedirectUri
            });
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
