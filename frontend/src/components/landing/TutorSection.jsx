import React from 'react';
import { Heart } from 'lucide-react';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import { useLanguage } from '../../context/LanguageContext';

const TutorSection = () => {
    const [sectionRef, isVisible] = useIntersectionObserver({ threshold: 0.1 });
    const { t } = useLanguage();

    const tutors = [
        {
            name: "Ace Sir",
            role: t('landing.tutors.ace_sir.role'),
            vision: t('landing.tutors.ace_sir.vision'),
            highlights: t('landing.tutors.ace_sir.highlights'),
            avatar: "/avatars/ace_sir_new.jpg",
            color: "orange"
        },
        {
            name: "Miss Janie",
            role: t('landing.tutors.miss_janie.role'),
            vision: t('landing.tutors.miss_janie.vision'),
            highlights: t('landing.tutors.miss_janie.highlights'),
            avatar: "/avatars/english_v2.jpg",
            color: "blue"
        },
        {
            name: "Mr. Wong",
            role: t('landing.tutors.mr_wong.role'),
            vision: t('landing.tutors.mr_wong.vision'),
            highlights: t('landing.tutors.mr_wong.highlights'),
            avatar: "/avatars/math.png",
            color: "emerald"
        },
        {
            name: "Miss Chen",
            role: t('landing.tutors.miss_chen.role'),
            vision: t('landing.tutors.miss_chen.vision'),
            highlights: t('landing.tutors.miss_chen.highlights'),
            avatar: "/avatars/chinese.png",
            color: "amber"
        }
    ];

    return (
        <section id="tutors" ref={sectionRef} className="py-24 bg-white dark:bg-[#1a110a]">
            <div className="container mx-auto px-6">
                <div className={`text-center mb-20 transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 font-display italic">{t('landing.tutors_title')}</h2>
                    <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
                        {t('landing.tutors_subtitle')}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {tutors.map((t, i) => (
                        <div
                            key={t.name}
                            style={{ transitionDelay: `${i * 150}ms` }}
                            className={`group relative bg-[#f8f7f5] dark:bg-white/5 p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/10 hover:border-primary/30 transition-all hover:shadow-2xl hover:shadow-primary/5 active:scale-[0.98] transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}
                        >
                            <div className={`size-20 rounded-2xl mb-6 overflow-hidden border-2 border-white dark:border-white/10 shadow-sm group-hover:rotate-3 transition-transform`}>
                                <img src={t.avatar} alt={t.name} className="w-full h-full object-cover object-top" />
                            </div>

                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{t.name}</h3>
                            <p className="text-primary text-xs font-bold uppercase tracking-widest mb-4 italic">{t.role}</p>

                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 leading-relaxed italic">
                                "{t.vision}"
                            </p>

                            <div className="space-y-3">
                                {t.highlights.map(h => (
                                    <div key={h} className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                                        <div className="w-1 h-1 rounded-full bg-primary" />
                                        {h}
                                    </div>
                                ))}
                            </div>

                            {/* Decorative Badge */}
                            <div className="absolute top-8 right-8 opacity-10 group-hover:opacity-100 transition-opacity">
                                <Heart className="w-5 h-5 text-primary" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TutorSection;
