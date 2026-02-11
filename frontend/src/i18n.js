import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Minimal resources for now
const resources = {
    en: {
        translation: {
            "nav": {
                "agents": "Agents"
            },
            "vocabulary": {
                "title": "DSE English Vocabulary",
                "subtitle": "STRATEGIC LEXICON FOR LEVEL 5**",
                "find_word": "Find a word...",
                "request_ai": "Request AI Analysis",
                "total_words": "{{count}} Words Loaded",
                "generate_another": "Generate Another",
                "golden_sentence": "Generate Golden Sentence",
                "generation_failed": "Generation failed: {{error}}"
            }
        }
    },
    zh: {
        translation: {
            "nav": {
                "agents": "智能代理"
            },
            "vocabulary": {
                "title": "DSE 英文詞彙庫",
                "subtitle": "5** 級策略詞彙表",
                "find_word": "搜尋詞彙...",
                "request_ai": "請求 AI 分析",
                "total_words": "已加載 {{count}} 個詞彙",
                "generate_another": "再生成一句",
                "golden_sentence": "生成金句",
                "generation_failed": "生成失敗: {{error}}"
            }
        }
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: "en", // default language
        fallbackLng: "en",
        interpolation: {
            escapeValue: false // react already safes from xss
        }
    });

export default i18n;
