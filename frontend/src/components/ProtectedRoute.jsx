import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const [isOnboarded, setIsOnboarded] = useState(null);
    const location = useLocation();

    useEffect(() => {
        if (user) {
            // Check if user has a profile/onboarding complete
            const checkOnboarding = async () => {
                try {
                    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                    const res = await fetch(`${API_URL}/api/stats?uid=${user.uid}`);
                    if (res.status === 404) {
                        setIsOnboarded(false);
                    } else {
                        setIsOnboarded(true);
                    }
                } catch (err) {
                    setIsOnboarded(false);
                }
            };
            checkOnboarding();
        }
    }, [user]);

    if (loading) return null; // Or a spinner

    if (!user) {
        return <Navigate to="/login" />;
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
