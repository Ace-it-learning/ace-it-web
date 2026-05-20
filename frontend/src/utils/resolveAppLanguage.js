import { translations } from './translations';

const SUPPORTED = Object.keys(translations);

const isSupported = (code) => SUPPORTED.includes(code);

/**
 * Map browser locale tags (e.g. zh-HK, en-US) to app language codes (zh | en).
 */
export const detectBrowserLanguage = () => {
    if (typeof navigator === 'undefined') return 'en';

    const tags = navigator.languages?.length
        ? navigator.languages
        : [navigator.language];

    for (const tag of tags) {
        if (!tag) continue;
        const norm = String(tag).toLowerCase();
        if (norm.startsWith('zh')) return 'zh';
        if (norm.startsWith('en')) return 'en';
    }

    return 'en';
};

/**
 * Resolve initial app language: URL ?lang= → saved preference → device locale.
 */
export const resolveAppLanguage = () => {
    if (typeof window !== 'undefined') {
        const urlLang = new URLSearchParams(window.location.search).get('lang');
        if (urlLang && isSupported(urlLang)) {
            return urlLang;
        }
    }

    if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem('app-language-v2');
        if (saved && isSupported(saved)) {
            return saved;
        }
    }

    return detectBrowserLanguage();
};
