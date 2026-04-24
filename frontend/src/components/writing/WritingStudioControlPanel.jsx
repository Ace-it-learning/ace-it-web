import React, { useState, useEffect } from 'react';
import { Sparkles, MessageSquare, ChevronRight, Target, Star, Loader2, ShieldAlert, PenTool } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import { getLocalizedValue } from '../../utils/writingUtils';

const WritingStudioControlPanel = ({ 
    sparkNotes, 
    onSparkChange, 
    reviewData, 
    onReviewTrigger, 
    isReviewing,
    isMock = false,
    uploadedImages = [],
    onUpload,
    onDeleteImage
}) => {
    const { language } = useLanguage();
    const isChinese = language?.startsWith('zh');
    const [activeTab, setActiveTab] = useState('spark');

    const tabs = isMock 
        ? [
            { id: 'spark', label: 'Spark', icon: Sparkles, color: 'text-amber-500', bg: 'bg-amber-50' },
            { id: 'upload', label: 'Upload', icon: PenTool, color: 'text-rose-500', bg: 'bg-rose-50' }
          ]
        : [
            { id: 'spark', label: 'Spark', icon: Sparkles, color: 'text-amber-500', bg: 'bg-amber-50' },
            { id: 'review', label: 'Review', icon: MessageSquare, color: 'text-indigo-500', bg: 'bg-indigo-50' }
          ];

    // If in Mock mode, default to spark but allow upload
    useEffect(() => {
        if (isMock && activeTab === 'review') setActiveTab('spark');
    }, [isMock]);

    return (
        <div className="flex flex-col h-full bg-white border-l border-slate-100">
            {/* Tab Navigation */}
            <div className="flex bg-slate-50 border-b border-slate-200 p-1">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all
                            ${activeTab === tab.id 
                                ? 'bg-white shadow-sm text-slate-900' 
                                : 'text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        <tab.icon size={16} className={activeTab === tab.id ? tab.color : ''} />
                        <span className="text-xs font-black uppercase tracking-widest">{tab.label}</span>
                    </button>
                ))}
            </div>

            {isMock && (
                <div className="bg-indigo-600 px-6 py-4 flex items-center gap-3">
                    <ShieldAlert size={18} className="text-indigo-200" />
                    <span className="text-xs font-black text-white uppercase tracking-widest leading-none">Exam Integrity Active</span>
                </div>
            )}

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
                <AnimatePresence mode="wait">
                    {activeTab === 'spark' && (
                        <motion.div 
                            key="spark"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="p-6 h-full flex flex-col"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-amber-50 rounded-2xl flex items-center justify-center">
                                    <Sparkles size={20} className="text-amber-500" />
                                </div>
                                <div>
                                    <h4 className="text-base font-black text-slate-900 uppercase tracking-widest leading-none">The Spark</h4>
                                    <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-tight">Scratchpad & Outlining</p>
                                </div>
                            </div>
                            
                            <div className="flex-1 min-h-[400px] flex flex-col">
                                <textarea
                                    value={sparkNotes}
                                    onChange={(e) => onSparkChange(e.target.value)}
                                    placeholder="Jot down your structure, arguments, and vocabulary ideas here..."
                                    className="flex-1 w-full bg-amber-50/40 border-2 border-amber-100/50 rounded-[2.5rem] p-8 text-base font-bold text-slate-700 placeholder:text-slate-600 focus:outline-none focus:border-amber-300 transition-all shadow-inner resize-none leading-relaxed"
                                />
                            </div>
                            
                            {/* Removed black tip box per user request */}
                        </motion.div>
                    )}

                    {activeTab === 'upload' && isMock && (
                        <motion.div 
                            key="upload"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="p-6 h-full flex flex-col"
                        >
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 bg-rose-50 rounded-2xl flex items-center justify-center">
                                    <PenTool size={20} className="text-rose-500" />
                                </div>
                                <div>
                                    <h4 className="text-base font-black text-slate-900 uppercase tracking-widest leading-none">Paper Upload</h4>
                                    <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-tight">Submit Handwritten Work</p>
                                </div>
                            </div>

                            <div className="flex-1 space-y-6">
                                <p className="text-sm font-bold text-slate-500 leading-relaxed">
                                    Prefer writing on paper? You can upload photos of your response here. The AI will transcribe and grade it directly.
                                </p>

                                <div className="grid grid-cols-2 gap-4">
                                    {uploadedImages.map((url, i) => (
                                        <div key={i} className="relative group aspect-[3/4] bg-slate-100 rounded-2xl overflow-hidden border-2 border-slate-200">
                                            <img src={url} alt={`Handwritten ${i+1}`} className="w-full h-full object-cover" />
                                            <button 
                                                onClick={() => onDeleteImage(i)}
                                                className="absolute top-2 right-2 p-1.5 bg-rose-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Target size={14} />
                                            </button>
                                        </div>
                                    ))}
                                    
                                    {uploadedImages.length < 4 && (
                                        <label className="aspect-[3/4] border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-slate-50 hover:border-rose-300 cursor-pointer transition-all">
                                            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                                                <Sparkles size={20} />
                                            </div>
                                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Add Page</span>
                                            <input 
                                                type="file" 
                                                accept="image/*" 
                                                className="hidden" 
                                                onChange={(e) => {
                                                    const file = e.target.files[0];
                                                    if (file) onUpload(file);
                                                }}
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>

                            <div className="mt-8 p-5 bg-rose-50 rounded-[2rem] border border-rose-100">
                                <p className="text-sm font-bold text-rose-700 leading-tight flex items-start gap-3">
                                    <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                                    Ensure your handwriting is legible and the photo is well-lit for accurate AI transcription.
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'review' && (
                        <motion.div 
                            key="review"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="p-6 h-full flex flex-col"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center">
                                        <MessageSquare size={20} className="text-indigo-500" />
                                    </div>
                                    <div>
                                        <h4 className="text-base font-black text-slate-900 uppercase tracking-widest leading-none">AI Marker</h4>
                                        <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-tight">Real-time Analysis</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onReviewTrigger}
                                    disabled={isReviewing}
                                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all
                                        ${isReviewing ? 'bg-slate-100 text-slate-300' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200'}`}
                                >
                                    {isReviewing ? <Loader2 size={14} className="animate-spin" /> : 'Run Review'}
                                </button>
                            </div>

                            {reviewData ? (
                                reviewData.status === 'short_content' ? (
                                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-rose-50/50 rounded-[2.5rem] border-2 border-dashed border-rose-100">
                                        <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center mb-4">
                                            <Target size={24} className="text-rose-500" />
                                        </div>
                                        <h5 className="text-xs font-black text-rose-900 uppercase tracking-widest mb-2">Draft Too Short</h5>
                                        <p className="text-sm font-bold text-rose-600 leading-relaxed">
                                            The AI Marker needs at least <span className="font-black">30 words</span> to perform a high-fidelity evaluation. Keep writing!
                                        </p>
                                    </div>
                                ) : reviewData.status === 'error' ? (
                                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50 rounded-[2.5rem]">
                                        <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                                            <Target size={24} className="text-slate-400" />
                                        </div>
                                        <h5 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-2">Analysis Hub Busy</h5>
                                        <p className="text-sm font-bold text-slate-500 leading-relaxed">
                                            We're experiencing heavy traffic. Please try running the review again in a moment.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {/* CLO Meters */}
                                        <div className="grid grid-cols-3 gap-2">
                                            {Object.entries(reviewData.clo_status || {}).map(([key, val]) => (
                                                <div key={key} className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex flex-col items-center">
                                                    <span className="text-xs font-black text-slate-400 uppercase mb-1">{key[0]}</span>
                                                    <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                                                        <div className="h-full bg-indigo-600" style={{ width: `${val}%` }} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Feedback Loop */}
                                        <div className="space-y-4">
                                            <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl">
                                                <p className="text-sm font-bold text-indigo-900 leading-relaxed italic">
                                                    {getLocalizedValue(reviewData, 'overall_feedback', isChinese) || reviewData.overall_feedback}
                                                </p>
                                            </div>

                                            {reviewData.paragraph_analysis?.map((item, idx) => (
                                                <div key={idx} className={`p-4 rounded-2xl border ${item.type === 'strength' ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className={`w-1.5 h-1.5 rounded-full ${item.type === 'strength' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                                        <span className={`text-xs font-black uppercase tracking-widest ${item.type === 'strength' ? 'text-emerald-700' : 'text-rose-700'}`}>
                                                            Para {item.para_index + 1}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm font-bold text-slate-700 leading-tight">
                                                        {getLocalizedValue(item, 'feedback', isChinese) || item.feedback}
                                                    </p>
                                                </div>
                                            ))}

                                            {/* Vocabulary Boosts */}
                                            <div className="space-y-3">
                                                <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Vocabulary Upgrades</h5>
                                                {reviewData.vocabulary_upgrades?.map((item, idx) => (
                                                    <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                        <span className="text-sm font-bold text-slate-400 line-through shrink-0">{item.original}</span>
                                                        <ChevronRight size={12} className="text-indigo-400" />
                                                        <div className="flex-1">
                                                            <span className="text-sm font-black text-indigo-600 block">{item.suggestion}</span>
                                                            <span className="text-xs font-bold text-slate-500 italic block">
                                                                {getLocalizedValue(item, 'reason', isChinese) || getLocalizedValue(item, 'explanation', isChinese) || item.reason || item.explanation}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center opacity-30">
                                    <Target size={48} className="text-slate-300 mb-4" />
                                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest text-center">
                                        No active review.<br/>Click 'Run Review' to calibrate.
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default WritingStudioControlPanel;
