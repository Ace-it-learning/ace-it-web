import React from 'react';
import { Target, Info, Play, Volume2, ArrowRight } from 'lucide-react';

const PhonemeSpotlight = ({ wordAnalysis = [], onPlayWord }) => {
    const troubleWords = wordAnalysis.filter(w => w.status === 'incorrect');

    if (troubleWords.length === 0) return null;

    return (
        <div className="bg-white rounded-3xl border border-rose-100 shadow-xl overflow-hidden animate-in slide-in-from-right-8 duration-500">
            <div className="bg-rose-50 px-6 py-4 border-b border-rose-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-rose-500 rounded-xl text-white">
                        <Target className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-rose-900 uppercase tracking-tight">Phoneme Spotlight</h3>
                        <p className="text-[10px] text-rose-600 font-bold">TOP 3 TARGETS FOR IMPROVEMENT</p>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-4">
                {troubleWords.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="group relative bg-rose-50/30 p-4 rounded-2xl border border-rose-100/50 hover:bg-rose-50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <span className="text-lg font-black text-rose-600 tracking-tight">{item.word}</span>
                                <span className="ml-2 text-xs font-mono text-rose-400">[{item.ipa_actual || '...'}]</span>
                            </div>
                            <button 
                                onClick={() => onPlayWord(item.word)}
                                className="p-2 bg-white rounded-xl text-rose-500 shadow-sm border border-rose-100 hover:scale-110 transition-transform"
                            >
                                <Volume2 className="w-4 h-4" />
                            </button>
                        </div>
                        
                        <div className="flex items-start gap-2 bg-white/60 p-3 rounded-xl border border-rose-100/30">
                            <Info className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-rose-800 leading-relaxed font-medium">
                                {item.advice || "Focus on the ending sound of this word."}
                            </p>
                        </div>

                        {/* Decoration */}
                        <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-rose-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                ))}

                <button className="w-full py-3 bg-rose-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-rose-700 transition-colors shadow-lg shadow-rose-200">
                    Review All Phonetics
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default PhonemeSpotlight;
