import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import BrainstormingStep from '../components/writing/BrainstormingStep';
import DraftingStep from '../components/writing/DraftingStep';
import OrganizationStep from '../components/writing/OrganizationStep';
import { PenTool, Lightbulb, Link as LinkIcon, CheckCircle, Trophy, Star, Loader2, ArrowRight } from 'lucide-react';

const WritingQuestPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // State
    const [step, setStep] = useState(1); // 1: Brainstorm, 2: Draft, 3: Organize/Review, 4: Result
    const [topic] = useState(location.state?.topic || "Social Media Addiction");
    const [title] = useState(location.state?.title || "Custom Topic");
    const [textType] = useState(location.state?.format || "Essay");

    // Data Storage across steps
    const [brainstormData, setBrainstormData] = useState({ points: [] });
    const [draftContent, setDraftContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [gradeResult, setGradeResult] = useState(null);
    const [compareResult, setCompareResult] = useState(null);
    const [comparingLevel, setComparingLevel] = useState(null); //Isolated loading state
    const [showCompareModal, setShowCompareModal] = useState(false);
    const [selectedLevel, setSelectedLevel] = useState(null); //Track level for modal title

    const [syllabus, setSyllabus] = useState(null);

    // Syllabus / Config (fetched from backend)
    const steps = [
        { id: 1, title: "1. Spark Ideas", icon: Lightbulb, desc: "Content & Brainstorming" },
        { id: 2, title: "2. Draft & Polish", icon: PenTool, desc: "Drafting & Power-Ups" },
        { id: 3, title: "3. Connect & Review", icon: LinkIcon, desc: "Organization & Flow" }
    ];

    useEffect(() => {
        const fetchSyllabus = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                const res = await fetch(`${API_URL}/api/writing/syllabus`);
                if (res.ok) {
                    const data = await res.json();
                    setSyllabus(data);
                }
            } catch (err) {
                console.error("Failed to load syllabus", err);
            }
        };
        fetchSyllabus();
    }, []);

    const handleBrainstormComplete = (data) => {
        setBrainstormData(data);
        setStep(2);
    };

    const handleDraftUpdate = (text) => {
        setDraftContent(text);
    };

    const handleDraftComplete = () => {
        setStep(3);
    };

    const handleFinalSubmit = async () => {
        setIsSubmitting(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const res = await fetch(`${API_URL}/api/writing/grade`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic,
                    textType,
                    content: draftContent
                })
            });

            if (res.ok) {
                const data = await res.json();
                setGradeResult(data);
                setStep(4);
            } else {
                console.error("Grading failed");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCompare = async (targetLevel) => {
        setComparingLevel(targetLevel);
        setSelectedLevel(targetLevel);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const res = await fetch(`${API_URL}/api/writing/draft/compare`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: draftContent,
                    topic,
                    textType,
                    targetLevel
                })
            });
            if (res.ok) {
                const data = await res.json();
                setCompareResult(data);
                setShowCompareModal(true);
            }
        } catch (error) {
            console.error("Comparison failed", error);
        } finally {
            setComparingLevel(null);
        }
    };

    const handleBack = () => {
        if (step === 1) {
            navigate(-1);
        } else if (step === 4) {
            navigate('/dashboard');
        } else {
            setStep(step - 1);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* Header */}
            <header className="bg-white border-b py-4 px-8 flex justify-between items-center shadow-sm sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <button onClick={handleBack} className="text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors">
                        <ArrowRight size={16} className="rotate-180" />
                        {step === 1 ? "Exit" : "Back"}
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <span className="bg-indigo-100 text-indigo-700 p-1.5 rounded-md"><PenTool size={18} /></span>
                            Writer's Studio
                        </h1>
                        <p className="text-xs text-gray-500">{title} ({textType})</p>
                    </div>
                </div>

                {/* Progress Stepper */}
                <div className="flex items-center gap-2">
                    {steps.map((s) => {
                        const Icon = s.icon;
                        const isActive = step === s.id;
                        const isDone = step > s.id;
                        return (
                            <div key={s.id} className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${isActive ? 'bg-indigo-600 text-white shadow-md scale-105' : isDone ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'}`}>
                                {isDone ? <CheckCircle size={16} /> : <Icon size={16} />}
                                <span className="font-bold text-sm hidden sm:inline">{s.title}</span>
                            </div>
                        );
                    })}
                </div>

                <div className="w-24"></div> {/* Spacer for balance */}
            </header>

            {/* Main Content Area */}
            <main className="flex-1 max-w-[90%] flex flex-col mx-auto w-full p-8 animate-in fade-in duration-500">
                {step === 1 && (
                    <BrainstormingStep
                        topic={topic}
                        title={title}
                        onComplete={handleBrainstormComplete}
                        pillarData={syllabus?.learning_content?.find(p => p.id === 'pillar_content')}
                    />
                )}

                {step === 2 && (
                    <DraftingStep
                        topic={topic}
                        textType={textType}
                        brainstormPoints={brainstormData.points}
                        initialContent={draftContent}
                        onUpdate={handleDraftUpdate}
                        onNext={handleDraftComplete}
                        pillarData={syllabus?.learning_content?.find(p => p.id === 'pillar_language')}
                    />
                )}

                {step === 3 && (
                    <OrganizationStep
                        content={draftContent}
                        onUpdate={handleDraftUpdate}
                        onSubmit={handleFinalSubmit}
                        isSubmitting={isSubmitting}
                        pillarData={syllabus?.learning_content?.find(p => p.id === 'pillar_organization')}
                    />
                )}

                {step === 4 && gradeResult && (
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-500">
                        <div className="bg-indigo-900 text-white p-8 text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1),transparent)]"></div>
                            <Trophy className="mx-auto mb-4 text-yellow-400 drop-shadow-lg" size={48} />
                            <h2 className="text-3xl font-black mb-2">Quest Complete!</h2>
                            <p className="text-indigo-200">Here's your comprehensive breakdown.</p>
                        </div>

                        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Score Card */}
                            <div className="md:col-span-1 space-y-4">
                                <div className="bg-indigo-50 rounded-xl p-6 text-center border border-indigo-100">
                                    <h3 className="text-xs uppercase font-bold text-indigo-400 tracking-widest mb-2">Overall Level</h3>
                                    <div className="text-5xl font-black text-indigo-900 mb-2">
                                        {gradeResult.overall_score >= 7 ? "5**" : gradeResult.overall_score >= 6 ? "5*" : gradeResult.overall_score >= 5 ? "5" : gradeResult.overall_score >= 4 ? "4" : gradeResult.overall_score}
                                    </div>
                                    <div className="text-sm font-bold text-indigo-600">Score: {gradeResult.overall_score}/7</div>
                                </div>

                                <div className="space-y-2">
                                    {Object.entries(gradeResult.pillar_scores || {}).map(([key, data]) => (
                                        <div key={key} className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
                                            <span className="capitalize font-bold text-gray-700">{key}</span>
                                            <div className="flex items-center gap-1">
                                                <span className="font-bold text-indigo-600">{data.score}/7</span>
                                                {data.score >= 5 && <Star size={12} className="text-yellow-500 fill-current" />}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Comparison Buttons (Moved below scores) */}
                                <div className="space-y-2 pt-4 border-t border-gray-100">
                                    <h3 className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1 text-center">Compare with Model</h3>
                                    {[5, 6, 7].map(score => {
                                        const level = score === 7 ? "5**" : score === 6 ? "5*" : "5";
                                        // Only show levels higher than current score
                                        if (score <= gradeResult.overall_score) return null;

                                        return (
                                            <button
                                                key={level}
                                                onClick={() => handleCompare(level)}
                                                disabled={comparingLevel !== null}
                                                className="w-full py-2.5 bg-white border border-indigo-100 text-indigo-700 rounded-xl hover:bg-indigo-50 text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm hover:border-indigo-300"
                                            >
                                                {comparingLevel === level ? <Loader2 className="animate-spin" size={12} /> : <Star size={12} />}
                                                See Level {level} Version
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Feedback */}
                            <div className="md:col-span-2 space-y-6">
                                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                                    <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                                        Examiner's Summary
                                    </h3>
                                    <p className="text-blue-800 italic text-sm leading-relaxed">"{gradeResult.examiner_summary}"</p>
                                </div>

                                <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Detailed Feedback</h3>
                                <div className="space-y-6">
                                    {Object.entries(gradeResult.pillar_scores || {}).map(([key, data]) => (
                                        <div key={key}>
                                            <h4 className="font-black text-[10px] uppercase text-indigo-400 tracking-widest mb-2 px-2 py-0.5 bg-indigo-50 inline-block rounded">{key}</h4>
                                            <div className="text-sm text-gray-700 space-y-4">
                                                {/* Split by actual newlines or literal \n\n representations */}
                                                {data.feedback.split(/\n\n|\\n\\n/).map((paragraph, pIdx) => {
                                                    const cleanP = paragraph.replace(/\*\*/g, '').trim();
                                                    if (!cleanP) return null;

                                                    // Helper to render paragraph with badge support
                                                    const renderP = (type, content) => {
                                                        const badgeMatch = content.match(/^\[(.*?):?\s*(.*?)\]/);
                                                        let cleanText = content;
                                                        let badge = null;

                                                        if (badgeMatch) {
                                                            badge = badgeMatch[1] + (badgeMatch[2] ? `: ${badgeMatch[2]}` : '');
                                                            cleanText = content.replace(badgeMatch[0], '').trim();
                                                        }

                                                        return (
                                                            <div className="flex flex-col gap-1.5">
                                                                <p className="flex items-center gap-2 flex-wrap">
                                                                    <strong className={type === 'Strength' ? 'text-indigo-800' : 'text-amber-800'}>
                                                                        {type}:
                                                                    </strong>
                                                                    {badge && (
                                                                        <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded border border-indigo-200 uppercase tracking-tight">
                                                                            {badge}
                                                                        </span>
                                                                    )}
                                                                </p>
                                                                <p className="leading-relaxed">{cleanText}</p>
                                                            </div>
                                                        );
                                                    };

                                                    // Case 1: Strength and Improvement in same paragraph
                                                    if (cleanP.toLowerCase().includes('strength:') && cleanP.toLowerCase().includes('improvement:')) {
                                                        const sIndex = cleanP.toLowerCase().indexOf('strength:');
                                                        const iIndex = cleanP.toLowerCase().indexOf('improvement:');
                                                        const strengthPart = cleanP.substring(sIndex + 9, iIndex).trim();
                                                        const improvementPart = cleanP.substring(iIndex + 12).trim();
                                                        return (
                                                            <div key={pIdx} className="space-y-4">
                                                                {renderP('Strength', strengthPart)}
                                                                {renderP('Improvement', improvementPart)}
                                                            </div>
                                                        );
                                                    }

                                                    // Case 2: Separate paragraphs
                                                    if (cleanP.toLowerCase().startsWith('strength:')) {
                                                        return <div key={pIdx}>{renderP('Strength', cleanP.replace(/^strength:\s*/i, ''))}</div>;
                                                    }
                                                    if (cleanP.toLowerCase().startsWith('improvement:')) {
                                                        return <div key={pIdx}>{renderP('Improvement', cleanP.replace(/^improvement:\s*/i, ''))}</div>;
                                                    }
                                                    return <p key={pIdx} className="leading-relaxed">{paragraph}</p>;
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => navigate('/dashboard')}
                                        className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition"
                                    >
                                        Return to Dashboard
                                    </button>
                                    <button
                                        onClick={() => navigate('/writing/menu')}
                                        className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                                    >
                                        New Quest <ArrowRight size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Comparison Modal */}
            {showCompareModal && compareResult && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl">
                        <div className="p-6 border-b flex justify-between items-center bg-indigo-900 text-white rounded-t-2xl">
                            <div>
                                <h2 className="text-2xl font-bold">Model Answer Comparison</h2>
                                <p className="text-indigo-200 text-sm">Analyze the gap between your work and a Level {selectedLevel} standard.</p>
                            </div>
                            <button onClick={() => setShowCompareModal(false)} className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition">
                                <span className="font-bold text-lg px-2">×</span>
                            </button>
                        </div>

                        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                            {/* Student Side */}
                            <div className="flex-1 p-6 border-r overflow-y-auto bg-gray-50">
                                <h3 className="text-sm font-bold uppercase text-gray-500 mb-4 sticky top-0 bg-gray-50 py-2 border-b">Your Draft (Level {gradeResult.overall_score >= 7 ? "5**" : gradeResult.overall_score >= 6 ? "5*" : gradeResult.overall_score >= 5 ? "5" : gradeResult.overall_score >= 4 ? "4" : gradeResult.overall_score})</h3>
                                <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap font-serif leading-relaxed">
                                    {draftContent}
                                </div>
                            </div>

                            {/* Model Side */}
                            <div className="flex-1 p-6 overflow-y-auto bg-white">
                                <h3 className="text-sm font-bold uppercase text-indigo-600 mb-4 sticky top-0 bg-white py-2 border-b">Model Answer</h3>
                                <div className="prose prose-sm max-w-none text-gray-800 whitespace-pre-wrap font-serif leading-relaxed">
                                    {compareResult.model_essay}
                                </div>
                            </div>

                            {/* Analysis Sidebar (Right or Bottom) */}
                            <div className="w-full md:w-80 bg-indigo-50 p-6 overflow-y-auto border-l border-indigo-100">
                                <h3 className="text-sm font-bold uppercase text-indigo-900 mb-4 flex items-center gap-2">
                                    <Lightbulb size={16} className="text-yellow-600" />
                                    Key Differences
                                </h3>
                                <div className="space-y-6">
                                    {compareResult.key_differences?.map((diff, idx) => (
                                        <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-indigo-100">
                                            <h4 className="font-bold text-indigo-700 text-sm mb-2">{diff.area}</h4>
                                            <div className="space-y-2 text-xs">
                                                <div className="p-2 bg-red-50 text-red-700 rounded border border-red-100">
                                                    <span className="font-bold block mb-1">You wrote:</span>
                                                    "{diff.student_version}"
                                                </div>
                                                <div className="flex justify-center">
                                                    <ArrowRight size={14} className="text-indigo-300 rotate-90" />
                                                </div>
                                                <div className="p-2 bg-green-50 text-green-700 rounded border border-green-100">
                                                    <span className="font-bold block mb-1">Model upgrade:</span>
                                                    "{diff.model_upgrade}"
                                                </div>
                                                <p className="text-gray-600 italic mt-2">{diff.explanation}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default WritingQuestPage;
