import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn } from 'lucide-react';

const Login = () => {
    const { loginWithGoogle } = useAuth();

    const handleLogin = async () => {
        console.log("Login button clicked!");
        try {
            console.log("Calling loginWithGoogle from AuthContext...");
            await loginWithGoogle();
        } catch (error) {
            console.error("Login failed in Login component:", error);
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

                <div className="relative group p-4 border rounded-2xl bg-white/50">
                    <button
                        onClick={handleLogin}
                        className="w-full flex items-center justify-center gap-3 bg-primary text-white px-8 py-5 rounded-full font-bold shadow-xl hover:scale-105 transition-transform"
                    >
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6" alt="Google" />
                        使用 Google 登入
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
