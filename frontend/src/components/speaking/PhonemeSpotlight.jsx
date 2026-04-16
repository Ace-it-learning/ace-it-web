import React from 'react';
import { Target, Info, Play, Volume2, ArrowRight } from 'lucide-react';

const PhonemeSpotlight = ({ wordAnalysis = [], onPlayWord }) => {
    const troubleWords = wordAnalysis.filter(w => w.status === 'incorrect');
    const correctWords = wordAnalysis.filter(w => w.status === 'correct');

    // If absolutely no data
    if (wordAnalysis.length === 0) {
        return (
            <div className="bg-gray-50/50 rounded-3xl p-6 border border-dashed border-gray-200 text-center">
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">No detailed analysis available</p>
                <p className="text-[10px] text-gray-400 mt-1">Record a full passage to see phoneme spotlighting.</p>
            </div>
        );
    }

    const hasTrouble = troubleWords.length > 0;
    const displayWords = hasTrouble ? troubleWords : correctWords.slice(0, 5); // Show more if correct

    return (
        <div className={`bg-white rounded-3xl border shadow-xl overflow-hidden animate-in slide-in-from-right-8 duration-500 ${hasTrouble ? 'border-rose-100' : 'border-emerald-100'}`}>
            <div className={`px-6 py-4 border-b flex items-center justify-between ${hasTrouble ? 'bg-rose-50/50 border-rose-100' : 'bg-emerald-50/50 border-emerald-100'}`}>
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl text-white ${hasTrouble ? 'bg-rose-500' : 'bg-emerald-500'}`}>
                        <Target className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className={`text-sm font-black uppercase tracking-tight ${hasTrouble ? 'text-rose-900' : 'text-emerald-900'}`}>{hasTrouble ? 'Phoneme Spotlight' : 'Mastery Highlights'}</h3>
                        <p className={`text-[10px] font-bold ${hasTrouble ? 'text-rose-600' : 'text-emerald-600'}`}>{hasTrouble ? 'TARGETS FOR IMPROVEMENT' : 'EXCELLENT PRONUNCIATION DETECTED'}</p>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-3">
                {displayWords.map((item, idx) => (
                    <div key={idx} className="group flex items-start gap-4 p-2 rounded-xl hover:bg-gray-50 transition-colors">
                        {/* Bullet Point */}
                        <div className={`mt-2 w-2 h-2 rounded-full flex-shrink-0 animate-pulse ${hasTrouble ? 'bg-rose-500 shadow-lg shadow-rose-200' : 'bg-emerald-500 shadow-lg shadow-emerald-200'}`} />
                        
                        {/* Word & Feedback */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className={`text-sm font-black tracking-tight ${hasTrouble ? 'text-rose-600' : 'text-emerald-600'}`}>{item.word}</span>
                                <span className={`text-[10px] font-mono opacity-40 ${hasTrouble ? 'text-rose-900' : 'text-emerald-900'}`}>[{item.ipa_actual || item.ipa_target || '...'}]</span>
                            </div>
                            <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                                {item.advice || (hasTrouble ? "Focus on clarity." : "Perfectly pronounced.")}
                            </p>
                        </div>

                        {/* Play Button */}
                        <button 
                            onClick={() => onPlayWord(item.word)}
                            className={`p-1.5 rounded-lg border transition-all hover:scale-110 active:scale-95 flex-shrink-0 ${hasTrouble ? 'text-rose-500 border-rose-100 bg-rose-50/30' : 'text-emerald-500 border-emerald-100 bg-emerald-50/30'}`}
                            title="Play Master Audio"
                        >
                            <Volume2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                ))}

                <div className="pt-2">
                    <button className={`w-full py-2.5 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors shadow-lg ${hasTrouble ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'}`}>
                        {hasTrouble ? 'Review All Phonetics' : 'View Full Analysis'}
                        <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PhonemeSpotlight;
