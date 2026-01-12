import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const [isOnboarded, setIsOnboarded] = useState(null);
    const location = useLocation();

    useEffect(() => {
        console.log("ProtectedRoute useEffect: user =", user);
        if (user) {
            console.log("ProtectedRoute useEffect: user.uid =", user.uid); // Added log for user.uid
            if (!user.uid) {
                console.error("ProtectedRoute: user found but uid is missing!");
                return;
            }
            // Check if user has a profile/onboarding complete
            const checkOnboarding = async () => {
                try {
                    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                    console.log(`ProtectedRoute: Fetching onboarding status for ${user.uid}`);
                    const res = await fetch(`${API_URL}/api/stats?uid=${user.uid}`);
                    console.log(`ProtectedRoute: stats res status = ${res.status}`);
                    if (res.status === 404) {
                        setIsOnboarded(false);
                    } else {
                        setIsOnboarded(true);
                    }
                } catch (err) {
                    console.error("ProtectedRoute onboarding check failed", err);
                    setIsOnboarded(false);
                }
            };
            checkOnboarding();
        }
    }, [user]);

    if (loading) return null;

    if (!user) {
        // If not logged in, we don't force them anywhere unless it's a specific action.
        // For /onboarding, we should probably still require a user.
        if (location.pathname === '/onboarding') {
            return <Navigate to="/" />;
        }
        return children;
    }

    // Special case for onboarding page
    if (location.pathname === '/onboarding') {
        return children;
    }

    // Redirect to onboarding if profile not found
    if (isOnboarded === false) {
        return <Navigate to="/onboarding" />;
    }

    if (isOnboarded === null) return null; // Wait for check

    return children;
};

export default ProtectedRoute;
