import React from 'react';
import { Bot, LogIn, LogOut, Menu, X, Languages } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAvatar } from '../context/AvatarContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '../utils/cn';

import ConfirmationModal from './ConfirmationModal';
import Logo from './Logo';
import { Lightbulb, Zap, School } from 'lucide-react';

const Header = () => {
    const { user, loginWithGoogle, logout } = useAuth();
    const { isFocusMode, setIsFocusMode } = useAvatar();
    const { t, language, toggleLanguage } = useLanguage();
    const navigate = useNavigate();
    const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);


    const handleLogin = () => {
        navigate('/login');
    };

    if (isFocusMode) return null;

    return (
        <header
            className="sticky top-0 z-50 w-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-300 px-6 md:px-20 py-4 flex items-center justify-between shadow-md h-20 border-b border-gray-300"
        >
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                <div className="flex items-center gap-2">
                    <Logo className="h-10 w-auto drop-shadow-sm" />
                    <h1 className="text-2xl font-bold tracking-tight flex items-center">
                        <span className="text-[#FF6600] font-brand">A</span>
                        <span className="text-[#4A5568] font-brand">ce</span>
                        <span className="mx-1"></span>
                        <span className="text-[#FF6600] font-brand">I</span>
                        <span className="text-[#4A5568] font-brand">t!</span>
                        <span className="ml-2 text-2xl font-signature text-[#1A202C] drop-shadow-sm">DSE</span>
                    </h1>
                </div>
            </div>

            <nav className="hidden md:flex items-center gap-10">
                {!user && (
                    <>
                        <a href="#tutors" className="text-gray-800 hover:text-[#FF6600] transition-colors text-sm font-bold tracking-wide">{t('nav.ai_tutor')}</a>
                    </>
                )}
                {user && (
                    <>
                        <button
                            onClick={() => navigate('/prompts')}
                            className="flex items-center gap-2 text-gray-800 hover:text-amber-600 transition-colors text-sm font-bold tracking-wide group"
                        >
                            <Lightbulb className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
                            {t('nav.prompt_tips')}
                        </button>
                    </>
                )}
                <a
                    href="#pricing"
                    className="flex items-center gap-2 text-gray-800 hover:text-[#FF6600] transition-colors text-sm font-bold tracking-wide group"
                >
                    {user && <Zap className="w-4 h-4 text-primary group-hover:animate-pulse" />}
                    {user ? t('nav.upgrade_plan') : t('nav.pricing')}
                </a>

                {user && (
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-full text-sm font-bold tracking-wide hover:brightness-110 transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-95 group"
                    >
                        <School className="w-4 h-4 group-hover:animate-bounce" />
                        {t('nav.enter_classroom')}
                    </button>
                )}
            </nav>

            <div className="flex items-center gap-4">
                <button
                    onClick={toggleLanguage}
                    className="flex items-center gap-2 px-3 py-2 rounded-full text-gray-700 hover:text-gray-900 hover:bg-black/5 transition-all"
                    title={language === 'zh' ? 'Switch to English' : '切換至繁體中文'}
                >
                    <Languages className="w-4 h-4 text-[#FF6600]" />
                    <span className="text-sm font-bold">{language === 'zh' ? 'EN' : '繁'}</span>
                </button>
                {!user ? (
                    <>
                        <a href="#pricing" className="px-6 py-2 rounded-full bg-primary text-white text-sm font-bold hover:brightness-110 transition-all flex items-center justify-center">
                            {t('nav.free_trial')}
                        </a>
                        <button
                            onClick={handleLogin}
                            className="flex items-center gap-2 px-6 py-2 rounded-full border border-gray-300 text-gray-900 text-sm font-bold hover:bg-black/5 transition-all shadow-sm"
                        >
                            <LogIn className="w-4 h-4 text-[#FF6600]" /> {t('nav.login')}
                        </button>
                    </>
                ) : (
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end hidden sm:flex">
                            <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">{t('nav.connected_as')}</span>
                            <span className="text-gray-900 text-sm font-bold">{user.displayName || user.email}</span>
                        </div>
                        <button
                            onClick={() => setShowLogoutConfirm(true)}
                            className="flex items-center gap-2 px-6 py-2 rounded-full border border-red-500/30 text-red-500 text-sm font-bold hover:bg-red-500/10 transition-all"
                        >
                            <LogOut className="w-4 h-4" /> {t('nav.logout')}
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
    );
};

export default Header;
