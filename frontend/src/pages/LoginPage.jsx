import React from 'react';
import AuthForm from '../components/AuthForm';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const LoginPage = () => {
    const { user } = useAuth();

    if (user && user.emailVerified) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="min-h-screen bg-[#fdfaf8] dark:bg-[#120c08] flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white dark:bg-[#1a110a] rounded-[3rem] shadow-2xl shadow-primary/5 p-10 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 border border-black/5 dark:border-white/10">
                <div className="flex flex-col items-center gap-6">
                    <div className="bg-[#fff5ee] dark:bg-primary/10 p-4 rounded-full">
                        <div className="bg-white dark:bg-[#1a110a] p-3 rounded-full shadow-sm">
                            <span className="text-3xl">🔒</span>
                        </div>
                    </div>
                </div>

                <AuthForm onAuthSuccess={() => window.location.href = '/dashboard'} />
            </div>
        </div>
    );
};

export default LoginPage;
