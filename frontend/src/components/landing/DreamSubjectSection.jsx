import React from 'react';
import { motion } from 'framer-motion';
import {
    Target,
    GraduationCap,
    ListOrdered,
    Sparkles,
    ArrowRight,
    CheckCircle,
    Crown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

const DreamSubjectSection = () => {
    const { t, language } = useLanguage();
    const { user, beginSignInFlow } = useAuth();
    const navigate = useNavigate();

    const screenshotSrc = language === 'zh'
        ? '/Dream_Subject/Dream_subject_zh.png'
        : '/Dream_Subject/Dream_subject_en.png';

    const highlights = t('landing.dream_subject.highlights');

    const handlePremiumCta = async () => {
        if (user) {
            navigate('/subscription');
            return;
        }
        try {
            const started = await beginSignInFlow();
            if (!started) {
                document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
            }
        } catch (e) {
            console.error('[DreamSubjectSection] Sign-in start failed:', e);
            document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <section id="dream-subjects" className="relative py-32 bg-[#f8f9fb] dark:bg-[#0d0d0d] overflow-hidden transition-colors">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="absolute top-20 right-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="absolute bottom-10 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"
            />

            <div className="container mx-auto px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-sm font-black uppercase tracking-widest mb-6"
                    >
                        <Crown className="w-4 h-4 fill-amber-500 text-amber-500" />
                        {t('landing.dream_subject.premium_badge')}
                    </motion.div>

                    <h2 className="text-3xl md:text-5xl font-bold mb-6 italic dark:text-white flex flex-wrap items-center justify-center gap-3">
                        <GraduationCap className="w-10 h-10 text-primary shrink-0" />
                        {t('landing.dream_subject.title')}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 max-w-3xl mx-auto text-lg leading-relaxed">
                        {t('landing.dream_subject.desc')}
                    </p>
                </motion.div>

                <div className="flex flex-col lg:flex-row items-center gap-16">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="flex-1 space-y-8 text-left order-2 lg:order-1"
                    >
                        <div className="space-y-4">
                            {highlights.map((feature, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.08 }}
                                    className="flex items-start gap-3 text-gray-700 dark:text-gray-300 font-medium"
                                >
                                    <motion.div
                                        whileHover={{ scale: 1.1 }}
                                        className="size-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5"
                                    >
                                        <CheckCircle className="w-3.5 h-3.5 text-primary" />
                                    </motion.div>
                                    <span className="leading-relaxed">{feature}</span>
                                </motion.div>
                            ))}
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="p-6 rounded-3xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 shadow-sm"
                        >
                            <motion.div
                                animate={{ rotate: [0, 5, -5, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                                className="inline-block mb-3"
                            >
                                <Sparkles className="w-6 h-6 text-amber-500" />
                            </motion.div>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                {t('landing.dream_subject.ace_sir_note')}
                            </p>
                        </motion.div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handlePremiumCta}
                            className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-full font-bold text-lg hover:brightness-110 transition-all shadow-xl shadow-amber-500/25"
                        >
                            <Crown className="w-5 h-5 fill-white" />
                            {t('landing.dream_subject.cta')}
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </motion.button>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="flex-1 relative order-1 lg:order-2 w-full"
                    >
                        <div className="relative rounded-[2.5rem] bg-white dark:bg-gray-900 shadow-2xl border border-gray-100 dark:border-white/10 p-4">
                            <div className="aspect-[16/10] rounded-[2rem] overflow-hidden relative bg-gray-100 dark:bg-gray-800">
                                <img
                                    src={screenshotSrc}
                                    alt={t('landing.dream_subject.title')}
                                    className="w-full h-full object-cover object-top"
                                />
                            </div>
                        </div>

                        <motion.div
                            animate={{ y: [0, -8, 0] }}
                            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                            className="absolute -top-4 -right-4 size-20 rounded-2xl bg-primary shadow-xl shadow-primary/30 flex items-center justify-center"
                        >
                            <Target className="w-9 h-9 text-white" />
                        </motion.div>

                        <motion.div
                            animate={{ y: [0, 8, 0] }}
                            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                            className="absolute -bottom-6 -left-6 px-5 py-3 rounded-2xl bg-white dark:bg-gray-800 shadow-xl border border-gray-100 dark:border-white/10 flex items-center gap-2"
                        >
                            <ListOrdered className="w-5 h-5 text-primary" />
                            <span className="text-sm font-bold dark:text-white">Top 20</span>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default DreamSubjectSection;
