import { useLanguage } from '../context/LanguageContext';

const Footer = () => {
    const { t } = useLanguage();
    return (
        <footer className="w-full bg-electric-orange text-white py-8 px-6 md:px-20 mt-10">
            <div className="text-center text-sm font-medium">{t('footer.copyright')}</div>
        </footer>
    );
};

export default Footer;
