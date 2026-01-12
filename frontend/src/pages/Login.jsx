import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn } from 'lucide-react';

const Login = () => {
    const { loginWithGoogle } = useAuth();

    const handleLogin = async () => {
        try {
            await loginWithGoogle();
        } catch (error) {
            console.error("Login failed", error);
            alert("Login failed: " + error.message);
        }
    };

    return (
        <div className="min-h-screen bg-[#fdfaf8] dark:bg-[#120c08] flex items-center justify-center p-4">
            <div className="max-w-md w-full glass-container p-8 text-center space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold text-primary tracking-tight">Ace it!</h1>
                    <p className="text-[#a16b45] dark:text-[#d2b48c] text-lg font-medium">Your Ultimate DSE AI Tutor</p>
                </div>

                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                    <button
                        onClick={handleLogin}
                        className="relative w-full flex items-center justify-center gap-3 bg-white dark:bg-[#1a110a] text-[#1d130c] dark:text-white px-8 py-4 rounded-full font-bold shadow-xl hover:scale-105 transition-transform border border-black/5"
                    >
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6" alt="Google" />
                        Sign in with Google
                    </button>
                </div>

                <div className="pt-4 border-t border-black/5 dark:border-white/10 text-sm text-[#a16b45]/70 dark:text-[#d2b48c]/50">
                    Join thousands of students mastering DSE with AI
                </div>
            </div>
        </div>
    );
};

export default Login;
