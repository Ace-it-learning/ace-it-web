import React from 'react';
import { Bot, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header = () => {
    const { user, loginWithGoogle, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            await loginWithGoogle();
        } catch (err) {
            console.error("Header Login failed", err);
        }
    };

    return (
        <header
            className="sticky top-0 z-50 w-full bg-black px-6 md:px-20 py-4 flex items-center justify-between shadow-lg"
        >
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                <div className="size-10 bg-primary rounded-lg flex items-center justify-center text-white">
                    <Bot className="w-6 h-6" />
                </div>
                <h1 className="text-white text-2xl font-bold tracking-tight font-display">Ace It!</h1>
            </div>

            <nav className="hidden md:flex items-center gap-10">
                <a href="#" className="text-white/80 hover:text-primary transition-colors text-sm font-medium">AI 導師</a>
                <a href="#" className="text-white/80 hover:text-primary transition-colors text-sm font-medium">協助</a>
                <a href="#" className="text-white/80 hover:text-primary transition-colors text-sm font-medium">定價</a>
            </nav>

            <div className="flex items-center gap-4">
                {!user ? (
                    <>
                        <button className="px-6 py-2 rounded-full bg-primary text-white text-sm font-bold hover:brightness-110 transition-all">
                            免費試用
                        </button>
                        <button
                            onClick={handleLogin}
                            className="flex items-center gap-2 px-6 py-2 rounded-full border border-white/20 text-white text-sm font-bold hover:bg-white/10 transition-all"
                        >
                            <LogIn className="w-4 h-4" /> 登入
                        </button>
                    </>
                ) : (
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end hidden sm:flex">
                            <span className="text-white text-xs font-bold opacity-60">Connected as</span>
                            <span className="text-white text-sm font-medium">{user.displayName || user.email}</span>
                        </div>
                        <button
                            onClick={logout}
                            className="flex items-center gap-2 px-6 py-2 rounded-full border border-red-500/30 text-red-500 text-sm font-bold hover:bg-red-500/10 transition-all"
                        >
                            <LogOut className="w-4 h-4" /> 登出
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
