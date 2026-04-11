import React from 'react';
import { BookOpen, CheckCircle, ListChecks, Info, Lightbulb } from 'lucide-react';

const WritingStudioBriefing = ({ prompt, blueprint, checklist, completedItems, onToggleChecklist }) => {
    return (
        <div className="flex flex-col h-full bg-white divide-y divide-slate-100">
            {/* Mission Prompt Section */}
            <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center">
                        <BookOpen size={16} className="text-white" />
                    </div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">The Briefing</h3>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <p className="text-sm font-bold text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {prompt}
                    </p>
                </div>
            </div>

            {/* Genre Blueprint Section */}
            <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                        <Lightbulb size={16} className="text-indigo-600" />
                    </div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Genre Blueprint</h3>
                </div>
                <div className="space-y-3">
                    {blueprint?.map((item, idx) => (
                        <div key={idx} className="flex gap-3 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/50">
                            <CheckCircle size={14} className="text-indigo-500 shrink-0 mt-0.5" />
                            <span className="text-[11px] font-black text-indigo-700 uppercase tracking-tight leading-tight">
                                {item}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Content Checklist Section */}
            <div className="p-6 flex-1 overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center">
                            <ListChecks size={16} className="text-rose-600" />
                        </div>
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Requirement Checklist</h3>
                    </div>
                    <span className="text-[10px] font-black text-slate-400">
                        {completedItems.length} / {checklist?.length || 0}
                    </span>
                </div>
                
                <div className="space-y-2">
                    {checklist?.map((item, idx) => {
                        const isChecked = completedItems.includes(idx);
                        return (
                            <button
                                key={idx}
                                onClick={() => onToggleChecklist(idx)}
                                className={`w-full flex items-start gap-3 p-4 rounded-2xl border transition-all text-left
                                    ${isChecked 
                                        ? 'bg-emerald-50 border-emerald-100 text-emerald-900' 
                                        : 'bg-white border-slate-100 hover:border-rose-200 text-slate-600'
                                    }`}
                            >
                                <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors
                                    ${isChecked ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-slate-300'}`}>
                                    {isChecked && <CheckCircle size={12} className="text-white" />}
                                </div>
                                <span className={`text-xs font-bold leading-tight ${isChecked ? 'line-through opacity-70' : ''}`}>
                                    {item}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* DSE Pro Tip - Enlarged */}
            <div className="p-5 bg-slate-900 border-t border-slate-800">
                <div className="flex items-center gap-2 mb-2">
                    <div className="bg-amber-500/10 p-1 rounded-md">
                        <Lightbulb size={14} className="text-amber-500" />
                    </div>
                    <span className="text-[11px] font-black text-amber-500 uppercase tracking-widest">Examiner Tip</span>
                </div>
                <p className="text-sm font-bold text-slate-100 italic leading-relaxed">
                    {blueprint && blueprint.length > 0 
                        ? `Focus on the "${blueprint[1] || 'Core'}" section to secure higher marks in 'Organization'.`
                        : "Level 5** responses always demonstrate consistent awareness of the target audience and prompt requirements."}
                </p>
                <div className="mt-3 flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                    <Info size={10} />
                    Expert Insight (2024 DSE Syllabus)
                </div>
            </div>
        </div>
    );
};

export default WritingStudioBriefing;
