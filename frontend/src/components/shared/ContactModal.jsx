import React, { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Mail, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { submitContactEnquiry } from '../../services/contactService';
import { isValidContactEmail } from '../../utils/emailValidation';

const ENQUIRY_KEYS = [
    'general',
    'technical',
    'billing',
    'feedback',
    'schools_b2b',
    'press',
    'hkdse_content',
    'privacy_data'
];

const ContactModal = ({ isOpen, onClose }) => {
    const { t, language } = useLanguage();
    const { user } = useAuth();
    const [enquiryType, setEnquiryType] = useState('');
    const [replyEmail, setReplyEmail] = useState('');
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [thanksOpen, setThanksOpen] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        setEnquiryType('');
        setMessage('');
        setReplyEmail(user?.email ? String(user.email).trim() : '');
        setError(null);
        setSubmitting(false);
        setThanksOpen(false);
    }, [isOpen, user?.email]);

    const handleOpenChange = (next) => {
        if (!next) {
            setThanksOpen(false);
            onClose();
        }
    };

    const getToken = async () => {
        if (!user || user.uid === 'guest' || typeof user.getIdToken !== 'function') return undefined;
        return user.getIdToken();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        const trimmed = message.trim();
        if (trimmed.length < 10) {
            setError(t('contact.error_short'));
            return;
        }
        if (!enquiryType) {
            setError(t('contact.error_select'));
            return;
        }
        const trimmedReply = replyEmail.trim();
        let effectiveReply = '';
        if (isValidContactEmail(trimmedReply)) effectiveReply = trimmedReply;
        else if (user?.email && isValidContactEmail(user.email)) effectiveReply = String(user.email).trim();
        if (!effectiveReply) {
            setError(t('contact.error_email'));
            return;
        }
        setSubmitting(true);
        try {
            await submitContactEnquiry(
                { enquiryType, message: trimmed, language, replyEmail: effectiveReply },
                getToken
            );
            setThanksOpen(true);
            setEnquiryType('');
            setMessage('');
            setReplyEmail(user?.email ? String(user.email).trim() : '');
        } catch (err) {
            setError(err?.message || t('contact.error_generic'));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] animate-in fade-in duration-300" />
                <Dialog.Content className="fixed left-[50%] top-[50%] z-[101] w-[95%] max-w-4xl max-h-[90vh] translate-x-[-50%] translate-y-[-50%] outline-none animate-in fade-in zoom-in-95 duration-300">
                    <div className="relative flex h-full max-h-[90vh] flex-col overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl dark:bg-[#1a110a]">
                        <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-gray-50/50 dark:bg-white/5 flex-shrink-0">
                            <div className="flex items-center gap-3 min-w-0 pr-2">
                                <div className="p-2 rounded-xl bg-blue-50 text-blue-600 dark:bg-white/5 flex-shrink-0">
                                    <Mail size={24} />
                                </div>
                                <div className="min-w-0">
                                    <Dialog.Title className="text-xl font-bold text-gray-900 dark:text-white truncate">
                                        {t('contact.title')}
                                    </Dialog.Title>
                                    <Dialog.Description className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                        {t('contact.intro')}
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

                        <div className="overflow-y-auto custom-scrollbar bg-white dark:bg-[#1a110a] flex-1 p-6 md:p-10 space-y-8">
                            <div className="rounded-2xl border border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.03] p-5 md:p-6">
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    <span className="font-semibold text-gray-900 dark:text-white">
                                        {t('contact.email_intro')}
                                    </span>{' '}
                                    <a
                                        className="font-bold text-primary dark:text-electric-orange underline-offset-2 hover:underline break-all"
                                        href={`mailto:${t('contact.email_value')}`}
                                    >
                                        {t('contact.email_value')}
                                    </a>
                                </p>
                            </div>

                                <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto">
                                    <div className="space-y-2">
                                        <label
                                            htmlFor="contact-enquiry-type"
                                            className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400"
                                        >
                                            {t('contact.enquiry_type_label')}
                                        </label>
                                        <select
                                            id="contact-enquiry-type"
                                            value={enquiryType}
                                            onChange={(ev) => setEnquiryType(ev.target.value)}
                                            className="w-full rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#23170f] px-4 py-3 text-gray-900 dark:text-white text-[15px] focus:outline-none focus:ring-2 focus:ring-primary/40"
                                        >
                                            <option value="">{t('contact.select_placeholder')}</option>
                                            {ENQUIRY_KEYS.map((key) => (
                                                <option key={key} value={key}>
                                                    {t(`contact.enquiry_types.${key}`)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label
                                            htmlFor="contact-reply-email"
                                            className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400"
                                        >
                                            {t('contact.reply_email_label')}
                                        </label>
                                        <input
                                            id="contact-reply-email"
                                            type="email"
                                            autoComplete="email"
                                            value={replyEmail}
                                            onChange={(ev) => setReplyEmail(ev.target.value)}
                                            className="w-full rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#23170f] px-4 py-3 text-gray-900 dark:text-white text-[15px] focus:outline-none focus:ring-2 focus:ring-primary/40"
                                            placeholder={user?.email ? String(user.email) : 'name@example.com'}
                                        />
                                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                            {t('contact.reply_email_hint')}
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <label
                                            htmlFor="contact-message"
                                            className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400"
                                        >
                                            {t('contact.message_label')}
                                        </label>
                                        <textarea
                                            id="contact-message"
                                            value={message}
                                            onChange={(ev) => setMessage(ev.target.value)}
                                            rows={6}
                                            maxLength={8000}
                                            placeholder={t('contact.message_placeholder')}
                                            className="w-full rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#23170f] px-4 py-3 text-gray-900 dark:text-white text-[15px] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/40 resize-y min-h-[140px]"
                                        />
                                        <p className="text-xs text-gray-400 text-right">
                                            {message.length} / 8000
                                        </p>
                                    </div>
                                    {error ? (
                                        <p className="text-sm text-red-600 dark:text-red-400 font-medium" role="alert">
                                            {error}
                                        </p>
                                    ) : null}
                                    <div className="flex flex-wrap gap-3 justify-end">
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-black rounded-2xl font-black hover:opacity-90 transition-all text-sm active:scale-95 shadow-lg shadow-gray-900/10 dark:shadow-none disabled:opacity-50 disabled:pointer-events-none"
                                        >
                                            {submitting ? t('contact.sending') : t('contact.submit')}
                                        </button>
                                    </div>
                                </form>
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

                        {thanksOpen ? (
                            <div
                                className="absolute inset-0 z-20 flex items-center justify-center rounded-3xl bg-black/30 p-4 backdrop-blur-sm"
                                role="alertdialog"
                                aria-modal="true"
                                aria-labelledby="contact-thanks-title"
                                aria-describedby="contact-thanks-desc"
                            >
                                <div className="w-full max-w-sm rounded-2xl border-2 border-green-200 bg-white p-6 text-center shadow-2xl dark:border-green-900/60 dark:bg-[#23170f]">
                                    <div className="mb-4 flex justify-center">
                                        <div className="rounded-full bg-green-50 p-4 dark:bg-green-950/50">
                                            <CheckCircle2 size={32} className="text-green-600 dark:text-green-400" />
                                        </div>
                                    </div>
                                    <h3
                                        id="contact-thanks-title"
                                        className="mb-2 text-lg font-bold text-gray-900 dark:text-white"
                                    >
                                        {t('contact.thanks_popup_title')}
                                    </h3>
                                    <p
                                        id="contact-thanks-desc"
                                        className="mb-6 font-medium leading-relaxed text-gray-600 dark:text-gray-300"
                                    >
                                        {t('contact.thanks_popup_body')}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => setThanksOpen(false)}
                                        className="w-full rounded-xl bg-green-600 py-2.5 font-bold text-white shadow-lg transition-all hover:bg-green-700 active:scale-95 dark:bg-green-600"
                                    >
                                        {t('common.confirm')}
                                    </button>
                                </div>
                            </div>
                        ) : null}
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

export default ContactModal;
