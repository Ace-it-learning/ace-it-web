import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, googleProvider } from '../firebase';
import {
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendEmailVerification,
    updatePassword,
    reauthenticateWithCredential,
    EmailAuthProvider,
    deleteUser
} from 'firebase/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isProfileLoading, setIsProfileLoading] = useState(false);
    const [initialized, setInitialized] = useState(false); // New state to track if onAuthStateChanged fired

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

    // Also update loading state once profile and auth are handled
    useEffect(() => {
        if (initialized && !isProfileLoading) {
            setLoading(false);
        }
    }, [initialized, isProfileLoading]);

    const loginWithGoogle = () => {
        console.log("Initiating Google Sign-In Popup inside AuthContext...");
        return signInWithPopup(auth, googleProvider);
    };

    const signupWithEmail = (email, password) => {
        return createUserWithEmailAndPassword(auth, email, password);
    };

    const loginWithEmail = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const verifyEmail = (user) => {
        const API_URL = window.location.origin;
        const actionCodeSettings = {
            url: `${API_URL}/verify-success`,
            handleCodeInApp: true,
        };
        return sendEmailVerification(user, actionCodeSettings);
    };

    const changePassword = async (currentPassword, newPassword) => {
        if (!user || !user.email) throw new Error("User not authenticated");
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);
        return updatePassword(user, newPassword);
    };

    const setPasswordForSocialUser = async (newPassword) => {
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
        await deleteUser(user);
        return { success: true };
    };

    const logout = () => {
        return signOut(auth);
    };

    return (
        <AuthContext.Provider value={{
            user,
            profile,
            refreshProfile,
            loading,
            isProfileLoading,
            initialized,
            loginWithGoogle,
            signupWithEmail,
            loginWithEmail,
            verifyEmail,
            changePassword,
            setPasswordForSocialUser,
            cancelSubscription,
            deleteUserAccount,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
