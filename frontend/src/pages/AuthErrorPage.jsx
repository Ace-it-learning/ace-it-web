import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AuthErrorPage = () => {
    const navigate = useNavigate();
    const { beginSignInFlow } = useAuth();

    const handleTryAgain = async () => {
        try {
            const started = await beginSignInFlow();
            if (!started) navigate('/login');
        } catch (e) {
            console.error('[AuthErrorPage] Sign-in start failed:', e);
            navigate('/login');
        }
    };

    return (
        <div className="min-h-screen bg-[#fdfaf8] flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-[3.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] p-10 text-center space-y-8 animate-in fade-in zoom-in-95 duration-500 border border-red-50">
                <div className="flex justify-center">
                    <div className="bg-red-50 p-6 rounded-[2.5rem]">
                        <AlertCircle className="w-12 h-12 text-red-500" />
                    </div>
                </div>

                <div className="space-y-4">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Sign In Failed</h1>
                    <div className="space-y-2">
                        <p className="text-gray-500 font-medium">
                            The email or password you entered is incorrect.
                        </p>
                        <p className="text-xs text-gray-400 leading-relaxed uppercase tracking-black font-black">
                            Security Tip: Emails are case-insensitive, passwords are 100% case-sensitive.
                        </p>
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        type="button"
                        onClick={handleTryAgain}
                        className="w-full bg-primary text-white font-black py-5 rounded-[2rem] shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 active:scale-95"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Try Again
                    </button>
                </div>

                <div className="pt-4 border-t border-gray-50">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                        Ace It Learning • English Excellence
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthErrorPage;
