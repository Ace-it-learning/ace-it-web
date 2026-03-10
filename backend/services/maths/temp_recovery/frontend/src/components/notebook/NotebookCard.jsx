import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book, XCircle, Lightbulb, LayoutTemplate, Trash2, CheckCircle, RotateCw, PlayCircle } from 'lucide-react';

const NotebookCard = ({ item, onDelete, onUpdateStatus }) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const navigate = useNavigate();

    const typeConfig = {
        vocabulary: { color: 'indigo', icon: Book, label: 'Vocabulary' },
        mistake: { color: 'red', icon: XCircle, label: 'Mistake Log' },
        golden_nugget: { color: 'amber', icon: Lightbulb, label: 'Golden Nugget' },
        pattern: { color: 'emerald', icon: LayoutTemplate, label: 'Sentence Pattern' }
    };

    const config = typeConfig[item.type] || typeConfig.vocabulary;
    const Icon = config.icon;

    // --- CARD CONTENT RENDERS ---
    const renderContent = () => {
        if (item.type === 'vocabulary') {
            return (
                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                    {!isFlipped ? (
                        <>
                            <h3 className="text-2xl font-black text-gray-800 dark:text-white mb-2">{item.term}</h3>
                            <p className="text-xs text-indigo-500 font-bold uppercase tracking-widest">Click to reveal definition</p>
                        </>
                    ) : (
                        <div className="animate-in fade-in zoom-in-95 duration-200">
                            <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">{item.note}</p>
                            {item.context && <p className="text-xs text-gray-400 italic border-t pt-2 mt-2 border-gray-100 dark:border-gray-700">"{item.context}"</p>}
                        </div>
                    )}
                </div>
            );
        }

        if (item.type === 'mistake') {
            return (
                <div className="h-full flex flex-col p-4">
                    <h4 className="font-bold text-gray-800 dark:text-white mb-3 text-sm line-clamp-3">{item.term}</h4> {/* Uses term as the Question/Context */}
                    <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar">
                        <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-xs">
                            <span className="font-bold text-red-500 block mb-1">You said:</span>
                            <span className="text-red-700 dark:text-red-300 line-through">{item.context}</span>
                        </div>
                        <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-xs">
                            <span className="font-bold text-green-600 block mb-1">Correction:</span>
                            <span className="text-green-800 dark:text-green-300">{item.note}</span>
                        </div>
                    </div>
                </div>
            );
        }

        if (item.type === 'golden_nugget') {
            return (
                <div className="h-full flex flex-col p-5 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10">
                    <Lightbulb className="text-amber-500 mb-3" size={24} />
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-100 italic leading-relaxed">
                        "{item.note}"
                    </p>
                    {item.practiceTopic && (
                        <div className="mt-auto pt-4">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate('/dashboard', { state: { startPrompt: `I want to practice my Golden Nugget: ${item.practiceTopic}` } });
                                }}
                                className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95"
                            >
                                <PlayCircle size={14} />
                                Practice Now
                            </button>
                        </div>
                    )}
                    {item.term && !item.practiceTopic && <p className="mt-4 text-xs font-black text-amber-600 uppercase tracking-widest">{item.term}</p>}
                </div>
            );
        }

        return (
            <div className="p-4">
                <h3 className="font-bold text-gray-900 dark:text-white">{item.term}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{item.note}</p>
            </div>
        );
    };

    return (
        <div
            className={`relative group bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden min-h-[220px] flex flex-col ${isFlipped && item.type === 'vocabulary' ? 'ring-2 ring-indigo-500/20' : ''}`}
            onClick={() => item.type === 'vocabulary' && setIsFlipped(!isFlipped)}
        >
            {/* Header Badge */}
            <div className="absolute top-4 left-4 z-10 flex gap-2">
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-${config.color}-50 dark:bg-${config.color}-900/20 text-${config.color}-600 dark:text-${config.color}-400 flex items-center gap-1.5`}>
                    <Icon size={12} />
                    {config.label}
                </div>
            </div>

            {/* Delete Button (Hover) */}
            <button
                onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                className="absolute top-4 right-4 z-20 p-2 bg-white dark:bg-gray-800 text-gray-400 hover:text-red-500 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <Trash2 size={16} />
            </button>

            {/* Main Content Area */}
            <div className="flex-1 mt-8">
                {renderContent()}
            </div>

            {/* Footer Actions */}
            <div className="p-3 border-t border-gray-50 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
                <span className="text-[10px] text-gray-400 font-medium">
                    {item.source || 'Added manually'}
                </span>
                {item.type === 'vocabulary' && (
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsFlipped(!isFlipped); }}
                        className="text-gray-400 hover:text-indigo-500 transition-colors"
                    >
                        <RotateCw size={14} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default NotebookCard;
