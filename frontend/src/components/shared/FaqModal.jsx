import React, { useState, useMemo } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, CircleHelp, Plus } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { cn } from '../../utils/cn';

const FaqModal = ({ isOpen, onClose }) => {
    const { t } = useLanguage();
    const [expandedIdx, setExpandedIdx] = useState(null);

    const items = useMemo(() => {
        const raw = t('faq.items');
        return Array.isArray(raw) ? raw : [];
    }, [t]);

    const handleOpenChange = (next) => {
        if (!next) onClose();
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] animate-in fade-in duration-300" />
                <Dialog.Content className="fixed left-[50%] top-[50%] z-[101] w-[95%] max-w-4xl max-h-[90vh] translate-x-[-50%] translate-y-[-50%] outline-none animate-in fade-in zoom-in-95 duration-300">
                    <div className="bg-white dark:bg-[#1a110a] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-white/10 h-full max-h-[90vh]">
                        <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-gray-50/50 dark:bg-white/5 flex-shrink-0">
                            <div className="flex items-center gap-3 min-w-0 pr-2">
                                <div className="p-2 rounded-xl bg-violet-50 text-violet-600 dark:bg-white/5 flex-shrink-0">
                                    <CircleHelp size={24} />
                                </div>
                                <div className="min-w-0">
                                    <Dialog.Title className="text-xl font-bold text-gray-900 dark:text-white truncate">
                                        {t('faq.title')}
                                    </Dialog.Title>
                                    <Dialog.Description className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                        {t('faq.intro')}
                                    </Dialog.Description>
                                </div>
                            </div>
                            <Dialog.Close asChild>
                                <button
                                    type="button"
                                    className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors text-gray-500 flex-shrink-0"
                                    aria-label={t('common.cancel')}
                                >
                                    <X size={20} />
                                </button>
                            </Dialog.Close>
                        </div>

                        <div className="overflow-y-auto custom-scrollbar bg-white dark:bg-[#1a110a] flex-1 p-6 md:p-10">
                            <div className="space-y-2 max-w-3xl mx-auto">
                                {items.map((item, idx) => {
                                    const open = expandedIdx === idx;
                                    return (
                                        <div
                                            key={idx}
                                            className="rounded-2xl border border-gray-100 dark:border-white/10 bg-gray-50/80 dark:bg-white/[0.03] overflow-hidden"
                                        >
                                            <button
                                                type="button"
                                                onClick={() => setExpandedIdx(open ? null : idx)}
                                                className="w-full flex items-center gap-3 text-left px-4 py-3.5 hover:bg-white/60 dark:hover:bg-white/5 transition-colors"
                                            >
                                                <span
                                                    className={cn(
                                                        'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#23170f] text-gray-700 dark:text-gray-200 transition-transform',
                                                        open && 'rotate-45 border-primary/40 text-primary dark:text-electric-orange'
                                                    )}
                                                    aria-hidden
                                                >
                                                    <Plus size={18} strokeWidth={2.5} />
                                                </span>
                                                <span className="font-semibold text-gray-900 dark:text-white text-[15px]">
                                                    {item.q}
                                                </span>
                                            </button>
                                            {open ? (
                                                <div className="px-4 pb-4 pl-[4.25rem] text-gray-700 dark:text-gray-300 text-sm md:text-[15px] leading-relaxed space-y-3">
                                                    {(Array.isArray(item.a) ? item.a : item.a ? [item.a] : []).map(
                                                        (paragraph, pi) => (
                                                            <p key={pi}>{paragraph}</p>
                                                        )
                                                    )}
                                                </div>
                                            ) : null}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50/50 dark:bg-white/5 flex justify-end flex-shrink-0">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-black rounded-2xl font-black hover:opacity-90 transition-all text-sm active:scale-95 shadow-lg shadow-gray-900/10 dark:shadow-none"
                            >
                                {t('common.cancel')}
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

export default FaqModal;
