import React, { useState } from 'react';
import { ArrowRight, Star, Sparkles, AlertCircle } from 'lucide-react';

const PolisherCard = ({ data }) => {
    const [activeTab, setActiveTab] = useState('ace'); // 'upgrade' | 'ace'

    if (!data) return null;

    const { original, feedback, upgrade, ace_version } = data;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden my-2 max-w-2xl w-full">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 border-b border-indigo-100 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-indigo-900 text-sm">Writing Polisher</h3>
            </div>

            {/* Original Text (Collapsed or Small) */}
            <div className="p-4 border-b border-slate-100 bg-slate-50">
                <p className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Original</p>
                <p className="text-slate-700 italic text-sm border-l-2 border-slate-300 pl-3">"{original}"</p>
            </div>

            {/* Feedback Alert */}
            <div className="p-3 bg-amber-50 border-b border-amber-100 flex gap-2 items-start">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                <p className="text-xs text-amber-800 leading-relaxed">{feedback}</p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('upgrade')}
                    className={`flex-1 py-2 text-xs font-bold transition-colors ${activeTab === 'upgrade'
                            ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                            : 'text-slate-500 hover:bg-slate-50'
                        }`}
                >
                    Level Up (Lv 4)
                </button>
                <button
                    onClick={() => setActiveTab('ace')}
                    className={`flex-1 py-2 text-xs font-bold transition-colors ${activeTab === 'ace'
                            ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50/50'
                            : 'text-slate-500 hover:bg-slate-50'
                        }`}
                >
                    Ace Version (Lv 5**)
                </button>
            </div>

            {/* Content Area */}
            <div className="p-4 bg-white animate-in fade-in duration-300">
                {activeTab === 'upgrade' && (
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">BETTER</span>
                            <span className="text-xs text-slate-400">Clearer flow & grammar fix</span>
                        </div>
                        <p className="text-slate-800 font-medium text-lg leading-relaxed">{upgrade.text}</p>
                        <div className="mt-3 text-xs text-slate-500 bg-slate-50 p-2 rounded">
                            <span className="font-bold text-slate-700">Why?</span> {upgrade.explanation}
                        </div>
                    </div>
                )}

                {activeTab === 'ace' && (
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Star className="w-3 h-3 fill-current" /> SOPHISTICATED
                            </span>
                        </div>
                        <p className="text-purple-900 font-serif font-medium text-xl leading-relaxed">"{ace_version.text}"</p>
                        <div className="mt-4 grid grid-cols-2 gap-2">
                            {ace_version.key_techniques.map((tech, i) => (
                                <div key={i} className="bg-purple-50 p-2 rounded border border-purple-100">
                                    <p className="text-[10px] font-bold text-purple-600 uppercase mb-0.5">{tech.technique}</p>
                                    <p className="text-xs text-purple-800">{tech.impact}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PolisherCard;
