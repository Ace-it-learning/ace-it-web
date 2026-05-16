import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import LegalModal from './shared/LegalModal';
import ContactModal from './shared/ContactModal';
import FaqModal from './shared/FaqModal';

const Footer = () => {
    const { t } = useLanguage();
    const [legalType, setLegalType] = useState(null); // 'terms', 'privacy', 'disclaimer', or null
    const [faqOpen, setFaqOpen] = useState(false);
    const [faqModalKey, setFaqModalKey] = useState(0);
    const [contactOpen, setContactOpen] = useState(false);

    return (
        <footer className="w-full bg-electric-orange text-white py-12 px-6 md:px-20 mt-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 max-w-7xl mx-auto">
                <div className="text-sm font-medium order-2 md:order-1 opacity-80">
                    {t('footer.copyright')}
                </div>
                
                <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 order-1 md:order-2">
                    <button 
                        type="button"
                        onClick={() => {
                            setFaqModalKey((k) => k + 1);
                            setFaqOpen(true);
                        }}
                        className="text-sm font-bold border-b border-transparent hover:border-white transition-all opacity-80 hover:opacity-100"
                    >
                        {t('footer.faq')}
                    </button>
                    <button 
                        type="button"
                        onClick={() => setContactOpen(true)}
                        className="text-sm font-bold border-b border-transparent hover:border-white transition-all opacity-80 hover:opacity-100"
                    >
                        {t('footer.contact')}
                    </button>
                    <button 
                        type="button"
                        onClick={() => setLegalType('terms')}
                        className="text-sm font-bold border-b border-transparent hover:border-white transition-all opacity-80 hover:opacity-100"
                    >
                        {t('footer.terms')}
                    </button>
                    <button 
                        type="button"
                        onClick={() => setLegalType('privacy')}
                        className="text-sm font-bold border-b border-transparent hover:border-white transition-all opacity-80 hover:opacity-100"
                    >
                        {t('footer.privacy')}
                    </button>
                    <button 
                        type="button"
                        onClick={() => setLegalType('disclaimer')}
                        className="text-sm font-bold border-b border-transparent hover:border-white transition-all opacity-80 hover:opacity-100"
                    >
                        {t('footer.disclaimer')}
                    </button>
                </div>
            </div>

            <LegalModal 
                isOpen={!!legalType} 
                onClose={() => setLegalType(null)} 
                type={legalType} 
            />
            <FaqModal key={faqModalKey} isOpen={faqOpen} onClose={() => setFaqOpen(false)} />
            <ContactModal isOpen={contactOpen} onClose={() => setContactOpen(false)} />
        </footer>
    );
};

export default Footer;
