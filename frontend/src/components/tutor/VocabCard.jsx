import React from 'react';
import { BookOpen, Copy } from 'lucide-react';

const VocabCard = ({ data }) => {
    if (!data || !data.chips) return null;

    const { topic, chips } = data;

    return (
        <div className="w-full max-w-2xl my-2">
            <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Ace Chips: {topic}
                </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {chips.map((chip, i) => (
                    <div key={i} className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 hover:shadow-md transition-shadow group">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-lg text-slate-800">{chip.word}</h3>
                            <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono">
                                {chip.type}
                            </span>
                        </div>

                        <p className="text-sm text-slate-600 mb-3 leading-snug">{chip.definition}</p>

                        <div className="bg-emerald-50 rounded p-2 border-l-2 border-emerald-400">
                            <p className="text-xs text-emerald-900 italic">"{chip.usage}"</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default VocabCard;
