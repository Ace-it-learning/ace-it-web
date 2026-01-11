import React from 'react';
import { Bot } from 'lucide-react';

const Header = () => {
    return (
        <header className="sticky top-0 z-50 w-full bg-black px-6 md:px-20 py-4 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
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
                <button className="px-6 py-2 rounded-full bg-primary text-white text-sm font-bold hover:brightness-110 transition-all">
                    免費試用
                </button>
                <button className="px-6 py-2 rounded-full border border-white/20 text-white text-sm font-bold hover:bg-white/10 transition-all">
                    登入
                </button>
            </div>
        </header>
    );
};

export default Header;
