import React, { useState } from 'react';
import { Target, CheckCircle2, Sparkles, AlertCircle, Info } from 'lucide-react';

const PredictionStep = ({ onComplete, topic, metadata }) => {
    const [selectedKeywords, setSelectedKeywords] = useState([]);

    // Use metadata from backend if available, otherwise fallback to defaults
    const availableSubtopics = metadata?.sub_topics || [
        { id: '1', name: "Budget Deficit", synonyms: ["financial shortfall", "funding gap", "economic loss"], is_distractor: false },
        { id: '2', name: "Tax Reform", synonyms: ["fiscal policy change", "revenue adjustment", "levy overhaul"], is_distractor: false },
        { id: '3', name: "Public Housing", synonyms: ["government estates", "affordable living", "social residency"], is_distractor: false },
        { id: '4', name: "Healthcare System", synonyms: [], is_distractor: true, hint: "Think about the context—how would a doctor help with a train delay?" },
        { id: '5', name: "Education Funding", synonyms: ["academic grants", "scholarship pool", "school resources"], is_distractor: false },
        { id: '6', name: "Space Travel", synonyms: [], is_distractor: true, hint: "Does the government prioritize moon landings over local transport?" }
    ];

    const toggleKeyword = (subtopic) => {
        if (selectedKeywords.find(k => k.id === subtopic.id)) {
            setSelectedKeywords(prev => prev.filter(k => k.id !== subtopic.id));
        } else {
            if (selectedKeywords.length < 3) {
                setSelectedKeywords(prev => [...prev, subtopic]);
            }
        }
    };

    return (
        <div className="flex flex-col h-full max-w-4xl mx-auto">
            <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                    <Sparkles size={12} /> Vocabulary Field Activation
                </div>
                <h2 className="text-2xl font-black text-slate-800 mb-2">Phase 1: The Pen (Strategic Capture)</h2>
                <p className="text-slate-500">
                    Prepare your ear for <strong>synonyms</strong> and related concepts, not just exact word-matching.
                    <br />
                    Select <strong>3 sub-topics</strong> you expect to be discussed in <strong>"{topic || 'Strategic Analysis'}"</strong>.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {availableSubtopics.map(sub => {
                    const isSelected = selectedKeywords.find(k => k.id === sub.id);
                    return (
                        <div key={sub.id} className="flex flex-col gap-2">
                            <button
                                onClick={() => toggleKeyword(sub)}
                                className={`p-5 rounded-2xl border-2 transition-all flex items-center justify-between text-left
                                    ${isSelected
                                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 shadow-sm'
                                        : 'border-slate-200 hover:border-indigo-300 bg-white text-slate-600 hover:shadow-md'
                                    }`}
                            >
                                <div className="flex flex-col">
                                    <span className={`text-sm font-black uppercase tracking-tight ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`}>
                                        Concept {sub.id}
                                    </span>
                                    <span className="text-lg font-bold">{sub.name}</span>
                                </div>
                                {isSelected ? (
                                    <CheckCircle2 size={24} className="text-indigo-600 shrink-0" />
                                ) : (
                                    <div className="w-6 h-6 rounded-full border-2 border-slate-200 shrink-0" />
                                )}
                            </button>

                            {/* Synonym Bridge or Distractor Hint */}
                            {isSelected && (
                                <div className={`px-5 py-3 rounded-xl border animate-in fade-in slide-in-from-top-2 duration-300 ${sub.is_distractor
                                        ? 'bg-amber-50 border-amber-200 text-amber-800'
                                        : 'bg-indigo-600 text-white border-transparent shadow-lg shadow-indigo-200'
                                    }`}>
                                    {sub.is_distractor ? (
                                        <div className="flex gap-3 items-start">
                                            <AlertCircle size={18} className="shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-widest mb-1 opacity-80">Logical Guess!</p>
                                                <p className="text-sm font-medium leading-relaxed">{sub.hint || "This seems relevant, but focus on the primary context."}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex gap-3 items-start">
                                            <Info size={18} className="shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-widest mb-1 opacity-80">The Synonym Bridge</p>
                                                <p className="text-sm leading-relaxed italic">
                                                    "Great choice! Listen for: <span className="font-bold">{sub.synonyms?.join(', ')}</span>"
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="mt-8 flex justify-center pb-10">
                <button
                    onClick={() => onComplete(selectedKeywords)}
                    disabled={selectedKeywords.length < 3}
                    className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black shadow-xl hover:bg-black disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-3 active:scale-95 group"
                >
                    <Target size={24} className="group-hover:rotate-12 transition-transform" />
                    Enter Capture Mode
                </button>
            </div>
        </div>
    );
};

export default PredictionStep;
