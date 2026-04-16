import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, googleProvider } from '../firebase';
import {
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendEmailVerification
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
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
