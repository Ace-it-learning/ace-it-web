import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const VerifyEmailSuccess = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        // Refresh user state if logged in to detect emailVerified change
        if (user) {
            user.reload().catch(err => console.error("Reload user error:", err));
        }

        const timer = setInterval(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);

        const redirect = setTimeout(() => {
            navigate('/onboarding');
        }, 5000);

        return () => {
            clearInterval(timer);
            clearTimeout(redirect);
        };
    }, [navigate, user]);

    return (
        <div className="min-h-screen bg-[#fdfaf8] flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-10 text-center space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="flex justify-center">
                    <div className="bg-green-100 p-6 rounded-full">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                </div>

                <div className="space-y-4">
                    <h1 className="text-3xl font-bold text-gray-900">Account Verified!</h1>
                    <p className="text-gray-500">
                        Your account has been created successfully. We're getting things ready for you.
                    </p>
                </div>

                <div className="bg-gray-50 rounded-2xl p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                            {countdown}
                        </div>
                        <span className="text-sm font-medium text-gray-700">Redirecting to onboarding...</span>
                    </div>
                    <button
                        onClick={() => navigate('/onboarding')}
                        className="p-2 hover:bg-white rounded-full transition-colors group"
                    >
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                    </button>
                </div>

                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                    Ace It Learning • English Excellence
                </p>
            </div>
        </div>
    );
};

export default VerifyEmailSuccess;
