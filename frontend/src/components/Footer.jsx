import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import LegalModal from './shared/LegalModal';

const Footer = () => {
    const { t } = useLanguage();
    const [legalType, setLegalType] = useState(null); // 'terms', 'disclaimer', or null

    return (
        <footer className="w-full bg-electric-orange text-white py-12 px-6 md:px-20 mt-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 max-w-7xl mx-auto">
                <div className="text-sm font-medium order-2 md:order-1 opacity-80">
                    {t('footer.copyright')}
                </div>
                
                <div className="flex items-center gap-8 order-1 md:order-2">
                    <button 
                        onClick={() => setLegalType('terms')}
                        className="text-sm font-bold border-b border-transparent hover:border-white transition-all opacity-80 hover:opacity-100"
                    >
                        {t('footer.terms')}
                    </button>
                    <button 
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
        </footer>
    );
};

export default Footer;
