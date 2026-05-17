import React from 'react';
import { Star, MessageSquare } from 'lucide-react';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import { useLanguage } from '../../context/LanguageContext';

/** Set to true when real student testimonials are ready to publish. */
const SHOW_LANDING_TESTIMONIALS = false;

const Testimonials = () => {
    const [sectionRef, isVisible] = useIntersectionObserver({ threshold: 0.1 });
    const { t } = useLanguage();

    const testimonialData = t('landing.testimonials');

    if (!SHOW_LANDING_TESTIMONIALS) {
        return null;
    }

    return (
        <section ref={sectionRef} className="py-24 bg-[#f8f7f5] dark:bg-[#1a110a] relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 blur-[150px] pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                <div className={`text-center mb-16 transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 font-display italic">{t('landing.testimonials_title')}</h2>
                    <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
                        {t('landing.testimonials_subtitle')}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonialData.map((tItem, i) => (
                        <div
                            key={i}
                            style={{ transitionDelay: `${i * 200}ms` }}
                            className={`bg-white dark:bg-white/5 p-8 rounded-[3rem] border border-white dark:border-white/10 shadow-xl shadow-black/[0.02] hover:-translate-y-2 transition-all duration-700 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}
                        >
                            <div className="flex gap-1 mb-6">
                                {[...Array(5)].map((_, s) => (
                                    <Star key={s} className="w-4 h-4 text-amber-500 fill-amber-500" />
                                ))}
                            </div>

                            <p className="text-gray-700 dark:text-gray-300 italic mb-8 leading-relaxed">
                                "{tItem.text}"
                            </p>

                            <div className="flex items-center gap-4">
                                <div className="size-12 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                                    {tItem.name[0]}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{tItem.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{tItem.school}</p>
                                </div>
                                <div className="ml-auto opacity-10">
                                    <MessageSquare className="w-8 h-8 text-primary" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
