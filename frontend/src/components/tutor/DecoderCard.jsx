import React from 'react';
import { Eye, GitBranch, Key, Zap } from 'lucide-react';

const DecoderCard = ({ data }) => {
    if (!data) return null;

    const { breakdown, logic_flow, difficult_vocab, dse_shortcut } = data;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden my-2 max-w-2xl w-full">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-3 border-b border-emerald-100 flex items-center gap-2">
                <Eye className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-emerald-900 text-sm">Reading Decoder</h3>
            </div>

            <div className="p-4 space-y-4">
                {/* 1. Logic Flow */}
                {logic_flow && (
                    <div>
                        <h4 className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase mb-2">
                            <GitBranch className="w-4 h-4" /> Author's Logic
                        </h4>
                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                            <p className="text-sm text-slate-800 leading-relaxed font-medium">"{logic_flow}"</p>
                        </div>
                    </div>
                )}

                {/* 2. Syntax Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="col-span-1">
                        <h4 className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase mb-2">
                            <Key className="w-4 h-4" /> Key Syntax
                        </h4>
                        <div className="space-y-2">
                            {breakdown.syntax.map((item, i) => (
                                <div key={i} className="bg-blue-50 p-2 rounded border border-blue-100">
                                    <span className="text-xs font-bold text-blue-700 bg-white border border-blue-200 px-1.5 py-0.5 rounded mr-2">
                                        {item.type}
                                    </span>
                                    <span className="text-sm text-blue-900">{item.segment}</span>
                                    <div className="text-[10px] text-blue-500 mt-1 pl-1">
                                        → {item.function}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="col-span-1">
                        <h4 className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase mb-2">
                            <Zap className="w-4 h-4" /> DSE Shortcut
                        </h4>
                        <div className="bg-amber-50 rounded-lg p-3 border border-amber-100 h-full">
                            <p className="text-sm text-amber-900 font-medium">{dse_shortcut}</p>
                        </div>
                    </div>
                </div>

                {/* 3. Difficult Vocab (Mini) */}
                {difficult_vocab && difficult_vocab.length > 0 && (
                    <div className="pt-2 border-t border-slate-100">
                        <p className="text-xs text-slate-400 mb-2">Detected Difficult Words:</p>
                        <div className="flex flex-wrap gap-2">
                            {difficult_vocab.map((v, i) => (
                                <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                                    {v.word} ({v.meaning})
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DecoderCard;
