import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, PlayCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

const Hero = () => {
    const navigate = useNavigate();
    const { user, loginWithGoogle } = useAuth();
    const { t } = useLanguage();

    const handleStartJourney = () => {
        if (user) {
            navigate('/dashboard');
        } else {
            navigate('/login');
        }
    };

    const [scrollY, setScrollY] = React.useState(0);

    React.useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Calculate dynamic rotation based on scroll
    // Rotate from original position to a slightly different angle as the user scrolls
    const rotationY = Math.min(scrollY * 0.05, 15);
    const rotationX = Math.min(scrollY * 0.02, 10);

    return (
        <section className="relative pt-12 pb-20 md:pt-20 md:pb-40 overflow-hidden bg-background-light dark:bg-[#0f0a07]">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] animate-pulse delay-700" />
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20 text-left">
                    {/* Left Column: Content */}
                    <div className="flex-1 max-w-2xl">
                        {/* Main Heading */}
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-8 tracking-tight leading-[1.1] animate-in fade-in slide-in-from-left-6 duration-700 delay-100">
                            {t('landing.hero_title')} <br className="hidden md:block" />
                            <span className="bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent">{t('landing.hero_ai_powered')}</span> {t('landing.hero_subtitle')}
                        </h1>

                        {/* Subtext */}
                        <p className="text-xl text-gray-600 dark:text-gray-400 mb-12 leading-relaxed animate-in fade-in slide-in-from-left-8 duration-900 delay-200">
                            {t('landing.hero_desc')}
                        </p>

                        {/* CTAs */}
                        <div className="flex flex-col sm:flex-row items-center gap-4 animate-in fade-in slide-in-from-left-10 duration-1000 delay-300">
                            <button
                                onClick={handleStartJourney}
                                className="w-full sm:w-auto group flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white rounded-full font-bold text-lg hover:brightness-110 transition-all shadow-xl shadow-primary/20 hover:shadow-primary/40 active:scale-95"
                            >
                                {t('landing.start_journey')}
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                            {/* 
                            <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-white dark:bg-white/5 text-gray-700 dark:text-white border border-gray-200 dark:border-white/10 rounded-full font-bold text-lg hover:bg-gray-50 dark:hover:bg-white/10 transition-all active:scale-95">
                                <PlayCircle className="w-5 h-5" />
                                {t('landing.watch_demo')}
                            </button>
                            */}
                        </div>
                    </div>

                    {/* Right Column: Animated Laptop Visual */}
                    <div className="flex-1 relative w-full max-w-[600px] lg:max-w-none animate-in fade-in zoom-in duration-1000 delay-500">
                        {/* Visual Glow */}
                        <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full scale-75 animate-pulse overflow-hidden" />

                        <div className="relative z-10 perspective-[2000px]">
                            <div
                                className="relative transform-gpu animate-hero-float transition-all duration-300 ease-out"
                                style={{
                                    transform: `rotateY(${rotationY}deg) rotateX(${rotationX}deg)`
                                }}
                            >
                                <img
                                    src="/hero_mockup.png"
                                    alt="Ace It Dashboard Mockup"
                                    className="w-full h-auto drop-shadow-2xl rounded-2xl select-none pointer-events-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
