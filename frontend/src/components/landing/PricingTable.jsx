import React from 'react';
import { Check, Zap, Sparkles, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

const PricingTable = () => {
    const navigate = useNavigate();
    const { user, loginWithGoogle } = useAuth();
    const { t } = useLanguage();

    const handleAction = () => {
        if (user) {
            navigate('/dashboard');
        } else {
            navigate('/login');
        }
    };

    const plans = [
        {
            name: t('pricing.tiers.free.name'),
            price: t('pricing.tiers.free.price'),
            period: t('pricing.tiers.free.period'),
            desc: t('pricing.tiers.free.desc'),
            features: t('pricing.tiers.free.features'),
            icon: <Zap className="w-5 h-5 text-gray-400" />,
            color: "slate",
            cta: t('pricing.tiers.free.cta')
        },
        {
            name: t('pricing.tiers.pro.name'),
            price: t('pricing.tiers.pro.price'),
            period: t('pricing.tiers.pro.period'),
            desc: t('pricing.tiers.pro.desc'),
            features: t('pricing.tiers.pro.features'),
            icon: <ShieldCheck className="w-5 h-5 text-primary" />,
            color: "primary",
            cta: t('pricing.tiers.pro.cta'),
            popular: true
        },
        {
            name: t('pricing.tiers.premium.name'),
            price: t('pricing.tiers.premium.price'),
            period: t('pricing.tiers.premium.period'),
            desc: t('pricing.tiers.premium.desc'),
            features: t('pricing.tiers.premium.features'),
            icon: <Sparkles className="w-5 h-5 text-amber-500" />,
            color: "amber",
            cta: t('pricing.tiers.premium.cta')
        }
    ];

    return (
        <section id="pricing" className="py-24 bg-white dark:bg-[#1a110a]">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 font-display italic">
                        {t('pricing.title')}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
                        {t('pricing.subtitle')}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {plans.map((p) => (
                        <div
                            key={p.name}
                            className={`relative p-10 rounded-[3rem] border transition-all hover:scale-[1.02] flex flex-col ${p.popular
                                ? 'bg-[#23170f] border-primary text-white shadow-2xl shadow-primary/20 scale-105 z-10'
                                : 'bg-[#f8f7f5] dark:bg-white/5 border-gray-100 dark:border-white/10 text-gray-900 dark:text-white'
                                }`}
                        >
                            {p.popular && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-1 rounded-full">
                                    {t('landing.most_popular')}
                                </div>
                            )}

                            <div className="flex items-center gap-3 mb-8">
                                <div className={`p-3 rounded-xl ${p.popular ? 'bg-white/10' : 'bg-white dark:bg-white/10'} shadow-sm`}>
                                    {p.icon}
                                </div>
                                <h3 className="text-xl font-bold">{p.name}</h3>
                            </div>

                            <div className="mb-8">
                                <span className="text-4xl font-bold">{p.price}</span>
                                {p.period && <span className={p.popular ? 'text-gray-400' : 'text-gray-500'}>{p.period}</span>}
                                <p className={`mt-2 text-sm ${p.popular ? 'text-gray-400' : 'text-gray-500'}`}>{p.desc}</p>
                            </div>

                            <div className="space-y-4 mb-10 flex-1">
                                {p.features.map(f => (
                                    <div key={f} className="flex items-center gap-3 text-sm font-medium">
                                        <div className={`size-5 rounded-full flex items-center justify-center shrink-0 ${p.popular ? 'bg-primary/20' : 'bg-primary/10'}`}>
                                            <Check className={`w-3 h-3 ${p.popular ? 'text-primary' : 'text-primary'}`} />
                                        </div>
                                        <span className={p.popular ? 'text-gray-300' : 'text-gray-600 dark:text-gray-400'}>{f}</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={handleAction}
                                className={`w-full py-4 rounded-full font-bold transition-all active:scale-95 ${p.popular
                                    ? 'bg-primary text-white hover:brightness-110 shadow-lg shadow-primary/20'
                                    : 'bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/20'
                                    }`}
                            >
                                {p.cta}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default PricingTable;
