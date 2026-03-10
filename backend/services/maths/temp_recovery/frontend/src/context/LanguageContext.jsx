import React, { createContext, useState, useContext, useEffect } from 'react';
import { translations } from '../utils/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    // Default to 'zh' as per existing header, or check localStorage
    const [language, setLanguage] = useState(() => {
        const saved = localStorage.getItem('app-language-v2');
        // Verify that the saved language actually exists in our translations
        return (saved && translations[saved]) ? saved : 'zh'; // Default to Traditional Chinese
    });

    useEffect(() => {
        localStorage.setItem('app-language-v2', language);
    }, [language]);

    const t = (path) => {
        const keys = path.split('.');
        // Check if translations[language] exists, fallback to 'zh' then 'en'
        let current = translations[language] || translations['zh'] || translations['en'];

        if (!current) return path; // Should never happen if translations is imported correctly

        for (const key of keys) {
            if (current[key] === undefined) {
                console.warn(`Translation missing for key: ${path} in language: ${language}`);
                return path;
            }
            current = current[key];
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
