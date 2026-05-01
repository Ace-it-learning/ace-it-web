import React, { useState, useRef, useEffect } from 'react';
import { Bot, LogIn, LogOut, Menu, X, Languages, Pin, PinOff, Lightbulb, Zap, School, ChevronDown, User, Shield, CreditCard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAvatar } from '../context/AvatarContext';
import { useLanguage } from '../context/LanguageContext';
import { useHeader } from '../context/HeaderContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '../utils/cn';
import { motion, AnimatePresence } from 'framer-motion';

import ConfirmationModal from './ConfirmationModal';
import Logo from './Logo';

const Header = () => {
    const { user, profile, loginWithGoogle, logout } = useAuth();
    const { isFocusMode, setIsFocusMode } = useAvatar();
    const { t, language, toggleLanguage } = useLanguage();
    const { isPinned, setIsPinned, isVisible, setIsVisible } = useHeader();
    const navigate = useNavigate();
    const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const userMenuRef = useRef(null);
    const hideTimeoutRef = useRef(null);

    // Close menu on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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
                        <span className="mx-0.5"></span>
                        <span className="text-[#F1783B] font-brand">I</span>
                        <span className="text-[#4A5568] font-brand">t!</span>
                        <span className="ml-2 text-2xl font-signature text-[#4A5568] italic">DSE</span>
                    </h1>
                </div>

                {/* Navigation Group */}
                <nav className="hidden md:flex items-center gap-8">
                    {!user && (
                        <button
                            onClick={() => navigate('/features')}
                            className="flex items-center gap-2 text-gray-700 hover:text-[#F1783B] transition-colors"
                        >
                            <Bot className="w-4 h-4 text-[#F1783B]" />
                            <span className="text-sm font-semibold">Features</span>
                        </button>
                    )}

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

                    <div className="flex items-center gap-4">
                        {!user ? (
                            <button
                                onClick={() => navigate('/login')}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white border border-[#F1783B]/20 text-[#F1783B] text-sm font-bold hover:bg-orange-50 transition-all shadow-sm active:scale-95"
                            >
                                <LogIn className="w-4 h-4 text-[#F1783B]" /> {t('nav.login')}
                            </button>
                        ) : (
                            <>
                                {/* Header Pin/Unpin Controls */}
                                <div className="hidden sm:flex items-center gap-2 h-10 px-2 rounded-xl bg-slate-50 border border-slate-200 shadow-sm">
                                    <button
                                        onClick={() => setIsPinned(!isPinned)}
                                        className={cn(
                                            "p-1.5 rounded-lg transition-all",
                                            isPinned ? "bg-[#F1783B] text-white shadow-md shadow-orange-200" : "text-slate-400 hover:text-[#F1783B] hover:bg-white"
                                        )}
                                        title={isPinned ? "Unpin Header" : "Pin Header"}
                                    >
                                        {isPinned ? <Pin size={18} /> : <PinOff size={18} />}
                                    </button>
                                </div>

                                <div className="relative" ref={userMenuRef}>
                                <button
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 transition-all active:scale-95"
                                >
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F1783B] to-[#D96A32] flex items-center justify-center text-white font-bold text-lg shadow-sm border-2 border-white">
                                        {(profile?.nickname || user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                                    </div>
                                    <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", isMenuOpen && "rotate-180")} />
                                </button>

                                <AnimatePresence>
                                    {isMenuOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute right-0 mt-3 w-72 bg-white rounded-[2rem] shadow-2xl border border-slate-100 py-4 z-50 overflow-hidden"
                                        >
                                            <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-4 bg-slate-50/50">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#F1783B] to-[#D96A32] flex items-center justify-center text-white font-bold text-xl">
                                                    {(profile?.nickname || user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-sm font-bold text-slate-900 truncate">
                                                        {profile?.nickname || user.displayName || "Student"}
                                                    </span>
                                                    <span className="text-[10px] text-slate-500 truncate">{user.email}</span>
                                                </div>
                                            </div>

                                            <div className="p-2">
                                                <button
                                                    onClick={() => { navigate('/account?tab=general'); setIsMenuOpen(false); }}
                                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors group"
                                                >
                                                    <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-[#F1783B] group-hover:bg-[#F1783B] group-hover:text-white transition-colors">
                                                        <User size={16} />
                                                    </div>
                                                    {t('nav.parent_report')}
                                                </button>
                                                <button
                                                    onClick={() => { navigate('/account?tab=general'); setIsMenuOpen(false); }}
                                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors group"
                                                >
                                                    <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-[#F1783B] group-hover:bg-[#F1783B] group-hover:text-white transition-colors">
                                                        <User size={16} />
                                                    </div>
                                                    Update Profile
                                                </button>
                                                <button
                                                    onClick={() => { navigate('/account?tab=security'); setIsMenuOpen(false); }}
                                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors group"
                                                >
                                                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                        <Shield size={16} />
                                                    </div>
                                                    Change Password
                                                </button>
                                                <button
                                                    onClick={() => { navigate('/account?tab=subscription'); setIsMenuOpen(false); }}
                                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors group"
                                                >
                                                    <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                                        <CreditCard size={16} />
                                                    </div>
                                                    Manage Subscription
                                                </button>
                                                <div className="my-2 border-t border-slate-50" />
                                                <button
                                                    onClick={() => { setShowLogoutConfirm(true); setIsMenuOpen(false); }}
                                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors group"
                                                >
                                                    <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors">
                                                        <LogOut size={16} />
                                                    </div>
                                                    Sign out
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </>
                    )}
                </div>
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
        </header>
    </>
);
};

export default Header;
