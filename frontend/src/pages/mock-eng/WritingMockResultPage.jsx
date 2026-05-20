import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, X as XIcon, Sparkles, Trophy, Target, Eye, FileText
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useAvatar } from '../../context/AvatarContext';

const WritingMockResultPage = () => {
    const { resultId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { englishTutor } = useAvatar();
    
    const [result, setResult] = useState(null);
    const [isFetching, setIsFetching] = useState(true);
    const [originalView, setOriginalView] = useState(null);

    useEffect(() => {
        const fetchResult = async () => {
            if (!resultId || !user) return;
            setIsFetching(true);
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                const res = await fetch(`${API_URL}/api/results/${resultId}?uid=${user.uid}`);
                if (res.ok) {
                    const data = await res.json();
                    setResult(data);
                } else {
                    navigate('/achievements');
                }
            } catch (_err) {
                navigate('/achievements');
            } finally {
                setIsFetching(false);
            }
        };
        fetchResult();
    }, [resultId, user, navigate]);

    if (isFetching) {
        return (
            <div className="h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="font-bold text-slate-400 animate-pulse uppercase tracking-widest text-xs">Loading Writing Report...</p>
                </div>
            </div>
        );
    }

    if (!result) return null;

    const submissionResults = result || {};
    const level = submissionResults.level || '4';
    const percentage = submissionResults.percentage || 0;
    const skillScores = submissionResults.skillScores || {};
    const sectionalScores = submissionResults.sectionalScores || { A: { score: 0, possible: 0, domains: {} }, B: { score: 0, possible: 0, domains: {} } };
    const draftA = result.draftA || '';
    const titleA = result.titleA || '';
    const draftB = result.draftB || '';
    const titleB = result.titleB || '';
    const selectedPartB = result.selectedPartB || null;

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <nav className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-50">
                <button onClick={() => navigate('/achievements')} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-all font-black text-xs uppercase tracking-widest">
                    <ArrowLeft size={16} /> Back to Achievements
                </button>
                <div className="text-right">
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Writing Mock Report</p>
                    <p className="text-xs font-bold text-slate-600">{result.topic || 'Writing Mock'}</p>
                </div>
            </nav>

            <main className="max-w-5xl mx-auto p-8 space-y-8">
                {/* Grade Hero */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[3rem] p-12 shadow-xl border border-slate-100 text-center"
                >
                    <div className={`text-8xl font-black italic ${level.includes('5') ? 'text-indigo-600' : 'text-slate-900'}`}>
                        {level}
                    </div>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-4">Predicted DSE Level</p>
                    <div className="mt-8 flex justify-center gap-12">
                        <div>
                            <p className="text-3xl font-black text-slate-900">{submissionResults.totalScore} <span className="text-lg text-slate-400">/ {submissionResults.possibleScore}</span></p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Total Marks</p>
                        </div>
                        <div>
                            <p className="text-3xl font-black text-slate-900">{Math.round(percentage)}%</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Accuracy</p>
                        </div>
                        {submissionResults.xpAwarded !== undefined && (
                            <div>
                                <p className="text-3xl font-black text-amber-600">+{submissionResults.xpAwarded}</p>
                                <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mt-1">XP Earned</p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Mastery Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(skillScores).map(([skill, data]) => (
                        <motion.div 
                            key={skill} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-3xl p-8 shadow-lg border border-slate-100"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">{skill}</h4>
                                <span className="text-lg font-black text-slate-900">{data.score} / {data.possible}</span>
                            </div>
                            <div className="h-3 bg-slate-50 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(data.score / data.possible) * 100}%` }}
                                    className="h-full bg-indigo-500 rounded-full"
                                />
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Part A & B Cards */}
                {['A', 'B'].map(part => {
                    const partData = sectionalScores[part];
                    if (!partData) return null;
                    const isPartA = part === 'A';
                    return (
                        <motion.div 
                            key={part}
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-[3rem] p-10 shadow-xl border border-slate-100"
                        >
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900">Part {part}</h3>
                                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                        {isPartA ? 'Compulsory' : (selectedPartB?.elective || 'Elective')}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-black text-slate-900">{partData.score} <span className="text-sm text-slate-400">/ {partData.possible}</span></p>
                                </div>
                            </div>

                            {/* Domain feedback */}
                            {partData.domains && Object.entries(partData.domains).map(([domain, data]) => (
                                <div key={domain} className="mb-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-black text-slate-500 uppercase tracking-wider">{domain}</span>
                                        <span className="text-sm font-black text-slate-900">{data.score} / {data.possible || 9}</span>
                                    </div>
                                    <p className="text-sm text-slate-600 leading-relaxed">{data.feedback || 'Evaluation complete.'}</p>
                                </div>
                            ))}

                            {/* View Original button */}
                            <button 
                                onClick={() => setOriginalView({
                                    title: isPartA ? titleA : titleB,
                                    content: isPartA ? draftA : draftB,
                                    type: isPartA ? 'Compulsory' : 'Elective'
                                })}
                                className="flex items-center gap-2 px-6 py-3 bg-indigo-50 text-indigo-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-100 transition-all"
                            >
                                <Eye size={16} /> View Original
                            </button>
                        </motion.div>
                    );
                })}
            </main>

            {/* Original View Modal */}
            <AnimatePresence>
                {originalView && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-8">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setOriginalView(null)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white w-full max-w-4xl max-h-[85vh] rounded-[3rem] shadow-2xl relative flex flex-col overflow-hidden"
                        >
                            <div className="p-8 border-b border-slate-100 flex justify-between items-center shrink-0">
                                <div>
                                    <h2 className="text-xl font-black text-slate-900">{originalView.title || 'Untitled'}</h2>
                                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{originalView.type}</p>
                                </div>
                                <button onClick={() => setOriginalView(null)} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-colors">
                                    <XIcon size={20} />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-8">
                                <div className="prose prose-slate max-w-none">
                                    <p className="text-base font-medium text-slate-700 leading-relaxed whitespace-pre-wrap">
                                        {originalView.content || 'No content recorded.'}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default WritingMockResultPage;
