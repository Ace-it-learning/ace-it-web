import React, { useState } from 'react';
import { BookOpen, CheckCircle, ListChecks, Info, Lightbulb, BookText, HelpCircle } from 'lucide-react';

const WritingStudioBriefing = ({ 
    prompt, 
    blueprint, 
    checklist, 
    completedItems, 
    onToggleChecklist, 
    isMock = false,
    fullMockData = null // Added for elective preview
}) => {
    const [viewMode, setViewMode] = useState('mission'); // 'mission' | 'elective'

    return (
        <div className="flex flex-col h-full bg-white divide-y divide-slate-100 overflow-hidden">
            {/* Mission Mode Switcher */}
            {isMock && (
                <div className="flex p-2 bg-slate-50 border-b border-slate-100 shrink-0">
                    <button 
                        onClick={() => setViewMode('mission')}
                        className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${viewMode === 'mission' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <BookOpen size={14} />
                        Active Task
                    </button>
                    <button 
                        onClick={() => setViewMode('elective')}
                        className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${viewMode === 'elective' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <ListChecks size={14} />
                        Electives
                    </button>
                </div>
            )}

            <div className="flex-1 overflow-y-auto">
                {/* Mission View */}
                {viewMode === 'mission' && (
                    <>
                        {/* Mission Prompt Section */}
                        <div className="p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center">
                                    <BookOpen size={16} className="text-white" />
                                </div>
                                <h3 className="text-base font-black text-slate-900 uppercase tracking-widest">The Briefing</h3>
                            </div>
                            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                <p className="text-base font-bold text-slate-700 leading-relaxed whitespace-pre-wrap">
                                    {prompt}
                                </p>
                            </div>
                        </div>
                        {/* Genre Blueprint Section - Hidden in Mock Mode */}
                        {!isMock && (
                            <div className="p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                                        <Lightbulb size={16} className="text-indigo-600" />
                                    </div>
                                    <h3 className="text-base font-black text-slate-900 uppercase tracking-widest">Genre Blueprint</h3>
                                </div>
                                <div className="space-y-3">
                                    {blueprint?.map((item, idx) => (
                                        <div key={idx} className="flex gap-3 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/50">
                                            <CheckCircle size={14} className="text-indigo-500 shrink-0 mt-0.5" />
                                            <span className="text-sm font-black text-indigo-700 uppercase tracking-tight leading-tight">
                                                {item}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Content Checklist Section */}
                        <div className="p-6 overflow-y-auto border-t border-slate-100">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center">
                                        <ListChecks size={16} className="text-rose-600" />
                                    </div>
                                    <h3 className="text-base font-black text-slate-900 uppercase tracking-widest">Mandatory Requirements</h3>
                                </div>
                                <span className="text-xs font-black text-slate-400">
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
                                            <span className={`text-sm font-bold leading-tight ${isChecked ? 'line-through opacity-70' : ''}`}>
                                                {item}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                )}

                {/* Elective View (DSE Style) */}
                {viewMode === 'elective' && fullMockData && (
                    <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {/* Part B Electives */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <span className="px-2 py-1 bg-rose-600 text-white text-[10px] font-black rounded uppercase tracking-widest">Part B</span>
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Electives (Choose One)</h4>
                            </div>
                            
                            <div className="grid gap-4">
                                {fullMockData.Part_B.map((item, idx) => (
                                    <div key={idx} className="group p-4 bg-white border border-slate-100 rounded-2xl hover:border-rose-200 transition-all">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md group-hover:bg-rose-50 group-hover:text-rose-600 transition-colors">
                                                {item.elective}
                                            </span>
                                            <span className="text-[10px] font-black text-slate-300">Option {idx + 2}</span>
                                        </div>
                                        <h5 className="text-xs font-black text-slate-800 mb-2 uppercase group-hover:text-rose-700 transition-colors">{item.type}</h5>
                                        <p className="text-xs font-bold text-slate-500 leading-relaxed mb-4">
                                            {item.question}
                                        </p>
                                        {item.requirements && (
                                            <div className="space-y-2 border-t border-slate-50 pt-3">
                                                {item.requirements.map((req, rIdx) => (
                                                    <div key={rIdx} className="flex gap-2 items-start">
                                                        <div className="size-1.5 rounded-full bg-rose-500 mt-1 shrink-0" />
                                                        <span className="text-[11px] font-medium text-slate-500 leading-tight">{req}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
                            <HelpCircle size={16} className="text-amber-500 mt-0.5 shrink-0" />
                            <p className="text-[11px] font-bold text-amber-800 leading-tight">
                                These are the 8 elective themes for Paper 2 Part B. You must select and answer exactly one.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* DSE Pro Tip - Hidden in Mock Mode */}
            {!isMock && (
                <div className="p-5 bg-slate-900 border-t border-slate-800 shrink-0">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="bg-amber-500/10 p-1 rounded-md">
                            <Lightbulb size={14} className="text-amber-500" />
                        </div>
                        <span className="text-xs font-black text-amber-500 uppercase tracking-widest">Examiner Tip</span>
                    </div>
                    <p className="text-base font-bold text-slate-100 italic leading-relaxed">
                        {blueprint && blueprint.length > 0 
                            ? `Focus on the "${blueprint[1] || 'Core'}" section to secure higher marks in 'Organization'.`
                            : "Level 5** responses always demonstrate consistent awareness of the target audience and prompt requirements."}
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wide">
                        <Info size={10} />
                        Expert Insight (2024 DSE Syllabus)
                    </div>
                </div>
            )}
        </div>
    );
};

export default WritingStudioBriefing;
