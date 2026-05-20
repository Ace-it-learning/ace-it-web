import React, { useState } from 'react';
import { Mail, Zap, Check, BellOff } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import LegalModal from '../shared/LegalModal';
import { cn } from '../../utils/cn';

/**
 * Marketing / product communication opt-in UI (opt-in button shown first).
 */
const CommunicationPreferences = ({
    optIn,
    onOptIn,
    onOptOut,
    isLoading = false,
    xpAlreadyAwarded = false,
    compact = false
}) => {
    const { t, language } = useLanguage();
    const [legalType, setLegalType] = useState(null);

    const optedIn = optIn === true;
    const optedOut = optIn === false;
    const hasChoice = optedIn || optedOut;
    const andWord = language === 'zh' ? '及' : 'and';

    const selectedBtn =
        'bg-primary text-white border-primary shadow-lg shadow-primary/25';
    const neutralBtn =
        'bg-white dark:bg-[#1a110a] border-slate-200 text-slate-600 hover:border-primary/40 hover:text-primary';

    return (
        <>
            <div
                className={cn(
                    'space-y-4',
                    compact
                        ? 'border-t border-black/5 dark:border-white/5 pt-6'
                        : 'rounded-2xl border border-slate-100 bg-slate-50/80 p-6'
                )}
            >
                <div className="flex items-start gap-3">
                    <div
                        className={cn(
                            'rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0',
                            compact ? 'w-9 h-9' : 'w-10 h-10'
                        )}
                    >
                        <Mail className={compact ? 'w-4 h-4' : 'w-5 h-5'} />
                    </div>
                    <div className="space-y-1 min-w-0">
                        <h3
                            className={cn(
                                'font-bold text-[#1d130c] dark:text-white',
                                compact ? 'text-sm' : 'text-base'
                            )}
                        >
                            {t('communication.title')}
                        </h3>
                        <p
                            className={cn(
                                'text-[#a16b45] dark:text-[#d2b48c]',
                                compact ? 'text-xs' : 'text-sm'
                            )}
                        >
                            {t('communication.description')}
                        </p>
                        <p
                            className={cn(
                                'flex items-center gap-1.5 font-bold text-primary',
                                compact ? 'text-xs' : 'text-sm'
                            )}
                        >
                            <Zap className="w-4 h-4 shrink-0" />
                            {!xpAlreadyAwarded
                                ? t('communication.xp_reward')
                                : t('communication.xp_already')}
                        </p>
                    </div>
                </div>

                {hasChoice && (
                    <p
                        className={cn(
                            'text-xs',
                            optedIn ? 'text-primary' : 'text-slate-500'
                        )}
                    >
                        {optedIn
                            ? t('communication.status_opted_in')
                            : t('communication.status_opted_out')}
                    </p>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        type="button"
                        disabled={isLoading}
                        onClick={onOptIn}
                        className={cn(
                            'flex-1 py-3.5 px-4 rounded-2xl font-bold text-sm border transition-all flex items-center justify-center gap-2 disabled:opacity-60',
                            optedIn ? selectedBtn : neutralBtn
                        )}
                    >
                        {optedIn ? <Check className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                        {t('communication.opt_in')}
                    </button>
                    <button
                        type="button"
                        disabled={isLoading}
                        onClick={onOptOut}
                        className={cn(
                            'flex-1 py-3.5 px-4 rounded-2xl font-bold text-sm border transition-all flex items-center justify-center gap-2 disabled:opacity-60',
                            optedOut ? selectedBtn : neutralBtn
                        )}
                    >
                        <BellOff className="w-4 h-4" />
                        {t('communication.opt_out')}
                    </button>
                </div>

                <p className={cn('text-slate-500 dark:text-slate-400', compact ? 'text-[11px]' : 'text-xs')}>
                    {t('communication.legal_hint')}{' '}
                    <button
                        type="button"
                        onClick={() => setLegalType('privacy')}
                        className="text-primary font-semibold underline underline-offset-2 hover:opacity-80"
                    >
                        {t('footer.privacy')}
                    </button>{' '}
                    {andWord}{' '}
                    <button
                        type="button"
                        onClick={() => setLegalType('terms')}
                        className="text-primary font-semibold underline underline-offset-2 hover:opacity-80"
                    >
                        {t('footer.terms')}
                    </button>
                    .
                </p>
            </div>

            <LegalModal isOpen={!!legalType} onClose={() => setLegalType(null)} type={legalType} />
        </>
    );
};

export default CommunicationPreferences;
