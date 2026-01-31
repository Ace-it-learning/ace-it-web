import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { AlertCircle, X } from 'lucide-react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel" }) => {
    return (
        <Dialog.Root open={isOpen} onOpenChange={onClose}>
            <Dialog.Portal>
                {/* Backdrop with blur */}
                <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 animate-in fade-in duration-200" />

                {/* Modal Content */}
                <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] outline-none animate-in fade-in zoom-in-95 duration-200">
                    <div className="bg-white/90 dark:bg-[#1a110a]/95 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-3xl shadow-2xl p-6 relative overflow-hidden">
                        {/* Decorative background flash */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10" />

                        <div className="flex flex-col items-center text-center gap-4 relative z-10">
                            {/* Icon Bubble */}
                            <div className="size-12 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center border border-red-100 dark:border-red-900/30">
                                <AlertCircle className="w-6 h-6 text-red-500" />
                            </div>

                            {/* Text */}
                            <div className="space-y-2">
                                <Dialog.Title className="text-xl font-bold text-[#1d130c] dark:text-white">
                                    {title}
                                </Dialog.Title>
                                <Dialog.Description className="text-sm text-gray-500 dark:text-gray-400 max-w-[280px] mx-auto leading-relaxed">
                                    {message}
                                </Dialog.Description>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3 w-full mt-4">
                                <button
                                    onClick={onClose}
                                    className="flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors outline-none focus:ring-2 focus:ring-gray-200"
                                >
                                    {cancelText}
                                </button>
                                <button
                                    onClick={onConfirm}
                                    className="flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-red-500 text-white shadow-lg shadow-red-500/20 hover:bg-red-600 hover:shadow-red-500/30 active:scale-95 transition-all outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                >
                                    {confirmText}
                                </button>
                            </div>
                        </div>

                        {/* Close X */}
                        <Dialog.Close asChild>
                            <button
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-full p-1 hover:bg-black/5 dark:hover:bg-white/5 outline-none"
                                aria-label="Close"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </Dialog.Close>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};

export default ConfirmationModal;
