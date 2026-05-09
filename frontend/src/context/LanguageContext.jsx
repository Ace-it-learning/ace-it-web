import React, { createContext, useState, useContext, useEffect } from 'react';
import { translations } from '../utils/translations';

const LanguageContext = createContext({
    language: 'zh',
    setLanguage: () => { },
    t: (path) => path,
    toggleLanguage: () => { }
});

export const LanguageProvider = ({ children }) => {
    // Default to 'zh' as per existing header, or check localStorage
    const [language, setLanguage] = useState(() => {
        const saved = localStorage.getItem('app-language-v2');
        console.log("[LanguageContext] Initializing. Saved language:", saved);
        
        // Verify that the saved language actually exists in our translations
        if (saved && translations[saved]) {
            return saved;
        }
        
        return 'zh'; // Default to Traditional Chinese
    });

    useEffect(() => {
        console.log("[LanguageContext] Language changed to:", language);
        localStorage.setItem('app-language-v2', language);
    }, [language]);

    const t = (path, params = {}) => {
        const keys = path.split('.');
        let current = translations[language] || translations['zh'] || translations['en'];

        if (!current) return path;

        for (const key of keys) {
            if (current[key] === undefined) {
                if (path === 'stats.xp_progress') {
                    console.log(`[LanguageContext] Key MISSING: ${path} in language: ${language}. Falling back.`);
                }
                console.warn(`Translation missing for key: ${path} in language: ${language}`);
                return path;
            }
            current = current[key];
        }

        if (path === 'stats.xp_progress') {
            console.log(`[LanguageContext] Translating: ${path} | Language: ${language} | Result: ${current}`);
        }

        // Handle string interpolation for {{key}}
        if (typeof current === 'string' && params && Object.keys(params).length > 0) {
            let interpolated = current;
            Object.keys(params).forEach(key => {
                const value = params[key];
                // Case-insensitive replacement to be extra safe
                const regex = new RegExp(`{{${key}}}`, 'gi');
                interpolated = interpolated.replace(regex, value !== undefined ? value : '');
            });
            return interpolated;
        }

        return current;
    };

    const toggleLanguage = () => {
        setLanguage(prev => prev === 'zh' ? 'en' : 'zh');
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, toggleLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
