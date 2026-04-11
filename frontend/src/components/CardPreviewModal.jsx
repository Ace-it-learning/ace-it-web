import React from 'react';
import { X, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const rarityConfig = {
    default: { label: 'Default', borderClass: 'border-gray-300', glowClass: '', badgeClass: 'bg-gray-100 text-gray-600', bgGradient: 'from-gray-50 to-gray-100' },
    common: { label: 'Common', borderClass: 'border-gray-400', glowClass: '', badgeClass: 'bg-gray-200 text-gray-700', bgGradient: 'from-gray-50 to-slate-100' },
    rare: { label: 'Rare', borderClass: 'border-blue-400', glowClass: 'shadow-[0_0_25px_rgba(59,130,246,0.3)]', badgeClass: 'bg-blue-100 text-blue-700', bgGradient: 'from-blue-50 to-indigo-100' },
    epic: { label: 'Epic', borderClass: 'border-purple-400', glowClass: 'shadow-[0_0_30px_rgba(147,51,234,0.35)] animate-pulse-slow', badgeClass: 'bg-purple-100 text-purple-700', bgGradient: 'from-purple-50 to-fuchsia-100' },
    legendary: { label: 'Legendary', borderClass: 'border-amber-400', glowClass: 'shadow-[0_0_40px_rgba(251,191,36,0.4)] ring-sparkle', badgeClass: 'bg-amber-100 text-amber-800', bgGradient: 'from-amber-50 to-yellow-100' },
};

const CardPreviewModal = ({ isOpen, onClose, card, type = 'tutor' }) => {
    const navigate = useNavigate();
    const { t } = useLanguage();

    if (!isOpen || !card) return null;

    const rarity = card.rarity || 'default';
    const config = rarityConfig[rarity] || rarityConfig.default;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            {/* Modal Card */}
            <div className={`relative z-10 w-[320px] max-h-[90vh] rounded-3xl overflow-hidden border-2 ${config.borderClass} ${config.glowClass} bg-gradient-to-b ${config.bgGradient} shadow-2xl transform transition-all animate-in zoom-in-95 duration-300`}>
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 z-20 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>

                {/* Card Image */}
                <div className="w-full aspect-[3/4] overflow-hidden relative">
                    <img
                        src={card.image || card.avatar}
                        alt={card.name}
                        className="w-full h-full object-cover scale-[1.35] translate-y-[5%]"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(card.name)}&background=random&size=400&bold=true`;
                        }}
                    />
                    {/* Gradient overlay at bottom */}
                    <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />

                    {/* Rarity Badge */}
                    <div className="absolute top-3 left-3">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${config.badgeClass} shadow-sm`}>
                            {rarity === 'default' ? t('collection.default') : config.label}
                        </span>
                    </div>

                    {/* Name overlay */}
                    <div className="absolute bottom-3 left-4 right-4">
                        <h3 className="text-xl font-black text-white drop-shadow-lg">{card.name}</h3>
                    </div>
                </div>

                {/* Card Details */}
                <div className="p-5">
                    <p className="text-sm text-gray-600 leading-relaxed mb-4">
                        {card.description || card.tone || ''}
                    </p>

                    {/* Tutor Traits */}
                    {card.traits && (
                        <div className="grid grid-cols-2 gap-2 mb-4 p-3 bg-white/50 rounded-2xl border border-white/50">
                            {Object.entries(card.traits).map(([key, val]) => (
                                <div key={key} className="flex flex-col">
                                    <span className="text-[8px] uppercase font-black text-gray-400 tracking-wider">
                                        {key === 'intensity' ? 'Level' : key === 'disposition' ? 'Mood' : key === 'vibe' ? 'Manner' : key}
                                    </span>
                                    <span className="text-[10px] font-bold text-gray-700 capitalize">{val}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Trait / Personality */}
                    {(card.trait || card.personality) && !card.traits && (
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                {card.trait || card.personality}
                            </span>
                        </div>
                    )}

                    {/* Action Button */}
                    <button
                        onClick={() => {
                            onClose();
                            navigate('/collection');
                        }}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-sm flex items-center justify-center gap-2 hover:shadow-lg hover:scale-[1.02] transition-all"
                    >
                        {t('card_preview.view_collection')}
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export { rarityConfig };
export default CardPreviewModal;
