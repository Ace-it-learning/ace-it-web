import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, FileText, ShieldAlert } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const LegalModal = ({ isOpen, onClose, type }) => {
    const { t } = useLanguage();
    
    // type can be 'terms' or 'disclaimer'
    const title = type === 'terms' ? t('legal.terms_title') : t('legal.disclaimer_title');
    const content = type === 'terms' ? t('legal.terms') : t('legal.disclaimer');
    const Icon = type === 'terms' ? FileText : ShieldAlert;

    return (
        <Dialog.Root open={isOpen} onOpenChange={onClose}>
            <Dialog.Portal>
                {/* Backdrop */}
                <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] animate-in fade-in duration-300" />

                {/* Content */}
                <Dialog.Content className="fixed left-[50%] top-[50%] z-[101] w-[95%] max-w-4xl max-h-[90vh] translate-x-[-50%] translate-y-[-50%] outline-none animate-in fade-in zoom-in-95 duration-300">
                    <div className="bg-white dark:bg-[#1a110a] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-white/10 h-full max-h-[90vh]">
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-gray-50/50 dark:bg-white/5 flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-xl ${type === 'terms' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'} dark:bg-white/5`}>
                                    <Icon size={24} />
                                </div>
                                <Dialog.Title className="text-xl font-bold text-gray-900 dark:text-white">
                                    {title}
                                </Dialog.Title>
                            </div>
                            <Dialog.Close asChild>
                                <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors text-gray-500">
                                    <X size={20} />
                                </button>
                            </Dialog.Close>
                        </div>

                        {/* Scrollable Body */}
                        <div className="p-8 md:p-12 overflow-y-auto custom-scrollbar bg-white dark:bg-[#1a110a] flex-1">
                            <div className="space-y-10 max-w-3xl mx-auto">
                                {Array.isArray(content) && content.map((section, index) => (
                                    <div key={index} className="space-y-4 group">
                                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-primary dark:text-electric-orange/80 group-hover:text-electric-orange transition-colors">
                                            {section.title}
                                        </h4>
                                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-[15px] md:text-base text-justify subpixel-antialiased">
                                            {section.content}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Additional standard footer-in-modal text if needed */}
                            <div className="mt-16 pt-8 border-t border-gray-100 dark:border-white/5 text-center">
                                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                                    {t('footer.copyright')}
                                </p>
                            </div>
                        </div>

                        {/* Action Area */}
                        <div className="p-4 bg-gray-50/50 dark:bg-white/5 flex justify-end flex-shrink-0">
                            <button
                                onClick={onClose}
                                className="px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-black rounded-2xl font-black hover:opacity-90 transition-all text-sm active:scale-95 shadow-lg shadow-gray-900/10 dark:shadow-none"
                            >
                                {t('common.confirm') || 'OK'}
                            </button>
                        </div>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
            
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(0, 0, 0, 0.2);
                    border-radius: 10px;
                    border: 2px solid transparent;
                    background-clip: content-box;
                }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.15);
                    border: 2px solid transparent;
                    background-clip: content-box;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(0, 0, 0, 0.3);
                    background-clip: content-box;
                }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.25);
                    background-clip: content-box;
                }
            `}</style>
        </Dialog.Root>
    );
};

export default LegalModal;
