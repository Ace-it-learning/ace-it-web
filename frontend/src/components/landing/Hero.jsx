import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, PlayCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

const Hero = () => {
    const navigate = useNavigate();
    const { user, beginSignInFlow } = useAuth();
    const { t } = useLanguage();

    const handleStartJourney = async () => {
        if (user) {
            navigate('/dashboard');
            return;
        }
        try {
            const started = await beginSignInFlow();
            if (!started) navigate('/login');
        } catch (e) {
            console.error('[Hero] Sign-in start failed:', e);
            navigate('/login');
        }
    };

    return (
        <section className="relative w-full aspect-video min-h-[500px] flex items-center justify-center overflow-hidden">
            {/* Video Background */}
            <video
                src="/landing-roll.mp4"
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 w-full h-full object-cover z-0"
            />

            {/* Dark Overlay for readability */}
            <div className="absolute inset-0 bg-black/50 z-10" />

            {/* Content */}
            <div className="container mx-auto px-6 relative z-20">
                <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
                    {/* Main Heading */}
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-8 tracking-tight leading-[1.1] animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100 drop-shadow-lg">
                        {t('landing.hero_title')} <br className="hidden md:block" />
                        <span className="bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent">{t('landing.hero_ai_powered')}</span> {t('landing.hero_subtitle')}
                    </h1>

                    {/* Subtext */}
                    <p className="text-xl text-white/90 mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-900 delay-200 drop-shadow-md max-w-2xl">
                        {t('landing.hero_desc')}
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
                        <button
                            onClick={handleStartJourney}
                            className="w-full sm:w-auto group flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white rounded-full font-bold text-lg hover:brightness-110 transition-all shadow-xl shadow-primary/20 hover:shadow-primary/40 active:scale-95"
                        >
                            {t('landing.start_journey')}
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
