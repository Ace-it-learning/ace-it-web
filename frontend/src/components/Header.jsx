import React, { useState, useRef, useEffect } from 'react';
import { Bot, LogIn, LogOut, Menu, X, Languages, Pin, PinOff, Lightbulb, Zap, School } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAvatar } from '../context/AvatarContext';
import { useLanguage } from '../context/LanguageContext';
import { useHeader } from '../context/HeaderContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '../utils/cn';

import ConfirmationModal from './ConfirmationModal';
import Logo from './Logo';

const Header = () => {
    const { user, loginWithGoogle, logout } = useAuth();
    const { isFocusMode, setIsFocusMode } = useAvatar();
    const { t, language, toggleLanguage } = useLanguage();
    const { isPinned, setIsPinned, isVisible, setIsVisible } = useHeader();
    const navigate = useNavigate();
    const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);
    const hideTimeoutRef = useRef(null);

    const handleMouseEnter = () => {
        if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
        setIsVisible(true);
    };

    const handleMouseLeave = () => {
        if (!isPinned) {
            hideTimeoutRef.current = setTimeout(() => {
                setIsVisible(false);
            }, 1500);
        }
    };

    // Keep visible if pinned
    useEffect(() => {
        if (isPinned) {
            setIsVisible(true);
        }
    }, [isPinned, setIsVisible]);

    const handleLogin = () => {
        navigate('/login');
    };

    if (isFocusMode) return null;

    const showHeader = isPinned || isVisible;

    return (
        <>
            {/* Invisible Hover Trigger Area */}
            {!showHeader && (
                <div
                    className="fixed top-0 left-0 w-full h-4 z-[60] cursor-pointer"
                    onMouseEnter={handleMouseEnter}
                />
            )}

            <header
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className={cn(
                    "fixed top-0 left-0 z-50 w-full bg-[#EEF1F5] px-6 md:px-12 py-3 flex items-center justify-between shadow-sm h-16 border-b border-gray-200 transition-transform duration-500 ease-in-out",
                    !showHeader && "-translate-y-full"
                )}
            >
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                    <Logo className="h-9 w-auto" />
                    <h1 className="text-xl font-bold tracking-tight flex items-center">
                        <span className="text-[#F1783B] font-brand">A</span>
                        <span className="text-[#4A5568] font-brand">ce</span>
                        <span className="mx-1.5"></span>
                        <span className="text-[#F1783B] font-brand">I</span>
                        <span className="text-[#4A5568] font-brand">t!</span>
                        <span className="ml-2 text-2xl font-signature text-[#4A5568] italic">DSE</span>
                    </h1>
                </div>

                {/* Navigation Group */}
                <nav className="hidden md:flex items-center gap-8">
                    <button
                        onClick={() => navigate('/prompts')}
                        className="flex items-center gap-2 text-gray-700 hover:text-[#F1783B] transition-colors"
                    >
                        <Lightbulb className="w-4 h-4 text-[#F1783B]" />
                        <span className="text-sm font-semibold">Prompt tips</span>
                    </button>

                    <button
                        onClick={() => navigate('/subscription')}
                        className="flex items-center gap-2 text-gray-700 hover:text-[#F1783B] transition-colors"
                    >
                        <Zap className="w-4 h-4 text-[#F1783B]" />
                        <span className="text-sm font-semibold">Upgrade Plan</span>
                    </button>

                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 px-6 py-2 rounded-full bg-[#F1783B] text-white shadow-lg shadow-[#F1783B]/20 hover:bg-[#d96a32] transition-all transform hover:-translate-y-0.5"
                    >
                        <School className="w-4 h-4" />
                        <span className="text-sm font-bold tracking-wide">Enter Classroom</span>
                    </button>
                </nav>

                <div className="flex items-center gap-6">
                    <button
                        onClick={toggleLanguage}
                        className="flex items-center gap-1.5 text-gray-700 hover:text-[#F1783B] transition-all"
                    >
                        <Languages className="w-4 h-4 text-[#F1783B]" />
                        <span className="text-sm font-bold">{language === 'zh' ? '繁' : 'EN'}</span>
                    </button>

                    {!user ? (
                        <button
                            onClick={handleLogin}
                            className="flex items-center gap-2 px-6 py-2 rounded-full border border-gray-300 text-gray-900 text-sm font-bold hover:bg-black/5 transition-all shadow-sm"
                        >
                            <LogIn className="w-4 h-4 text-[#F1783B]" /> {t('nav.login')}
                        </button>
                    ) : (
                        <div className="flex items-center gap-5">
                            <div className="flex flex-col items-end hidden sm:flex">
                                <span className="text-gray-400 text-[9px] font-bold uppercase tracking-[0.1em]">SIGNED IN AS</span>
                                <span className="text-gray-900 text-sm font-extrabold -mt-1">{user.displayName || user.email}</span>
                            </div>

                            <div className="flex items-center gap-2 h-8 px-2 rounded-lg bg-white/50 border border-gray-200">
                                <button
                                    onClick={() => setIsPinned(!isPinned)}
                                    className={cn(
                                        "p-1 rounded-md transition-all",
                                        isPinned ? "bg-[#F1783B] text-white" : "text-gray-400 hover:text-[#F1783B]"
                                    )}
                                    title={isPinned ? "Unpin Header" : "Pin Header"}
                                >
                                    {isPinned ? <Pin className="w-4 h-4" /> : <PinOff className="w-4 h-4" />}
                                </button>
                            </div>

                            <button
                                onClick={() => setShowLogoutConfirm(true)}
                                className="flex items-center gap-2 px-5 py-1.5 rounded-full border border-red-100 text-[#E11D48] text-sm font-bold hover:bg-red-50 transition-all"
                            >
                                <LogOut className="w-4 h-4" /> Sign out
                            </button>
                        </div>
                    )}
                </div>

                <ConfirmationModal
                    isOpen={showLogoutConfirm}
                    onClose={() => setShowLogoutConfirm(false)}
                    onConfirm={() => {
                        setShowLogoutConfirm(false);
                        logout();
                    }}
                    title={t('nav.logout_confirm_title') || "Sign Out"}
                    message={t('nav.logout_confirm_message') || "Are you sure you want to sign out?"}
                    confirmText={t('nav.logout') || "Sign Out"}
                    cancelText={t('common.cancel') || "Cancel"}
                />
            </header >
        </>
    );
};

export default Header;
