import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import VocabularySidekick from '../components/tutor/VocabularySidekick';
import MathStepExplainer from '../components/maths/MathStepExplainer';

function ResultPage() {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { examId } = useParams();
    const { t } = useLanguage();
    const { user } = useAuth();
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    const [fetchedResult, setFetchedResult] = useState(null);
    const [loading, setLoading] = useState(!state || !state.result);

    useEffect(() => {
        const fetchResult = async () => {
            if (state?.result || !examId || !user) {
                if (state?.result) setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const token = await user.getIdToken();
                const res = await fetch(`${API_URL}/api/data/exam-submission/${encodeURIComponent(examId)}?uid=${encodeURIComponent(user.uid)}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data) setFetchedResult(data);
                }
            } catch (err) {
                console.error("Error fetching exam result:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchResult();
    }, [examId, user, state]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 animate-pulse font-medium">{t('lab.designing_lesson')}</p>
                </div>
            </div>
        );
    }

    const result = state?.result || fetchedResult;
    const answers = state?.answers || fetchedResult?.answers || {};

    if (!result) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-6">
                <div className="text-gray-400 text-6xl">?</div>
                <div className="text-xl font-medium text-gray-600">{t('result.no_result')}</div>
                <button
                    onClick={() => navigate('/mock-exam')}
                    className="px-6 py-3 bg-orange-500 text-white rounded-xl font-bold shadow-lg hover:bg-orange-600 transition-colors"
                >
                    {t('nav.mock_exam')}
                </button>
            </div>
        );
    }

    const { totalScore, totalMaxScore, percentage, partScores = {}, feedback = {} } = result;

    // --- 1. DSE Grading Logic ---
    const calculateDSEGrade = (p) => {
        if (p >= 90) return "5**";
        if (p >= 85) return "5*";
        if (p >= 75) return "5";
        if (p >= 65) return "4";
        if (p >= 55) return "3";
        if (p >= 40) return "2";
        return "1";
    };

    const dseGrade = calculateDSEGrade(percentage);

    // --- 3. Style Helpers (Fixing Tailwind Purge Issue) ---
    const getGradeStyles = (p) => {
        if (p >= 85) return { text: "text-green-600", bg: "bg-green-600", circle: "text-green-600" };
        if (p >= 65) return { text: "text-blue-600", bg: "bg-blue-600", circle: "text-blue-600" };
        if (p >= 50) return { text: "text-yellow-600", bg: "bg-yellow-600", circle: "text-yellow-600" };
        return { text: "text-red-600", bg: "bg-red-600", circle: "text-red-600" };
    };

    const overallStyles = getGradeStyles(percentage);

    // --- 2. Analysis Helpers ---
    const incorrectQuestions = Object.keys(feedback)
        .filter(qId => !feedback[qId].correct)
        .map(qId => ({ id: qId, ...feedback[qId] }));

    const getRecommendation = () => {
        if (dseGrade === "5**" || dseGrade === "5*") return t('result.recommendations.level5');
        if (dseGrade === "5" || dseGrade === "4") return t('result.recommendations.level4');
        if (dseGrade === "3") return t('result.recommendations.level3');
        return t('result.recommendations.level2');
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-7xl mx-auto mb-6 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">{t('result.title')}</h1>
                <button
                    onClick={() => {
                        const subject = state?.examData?.subject?.toUpperCase() || 'ENGLISH';
                        const category = state?.examData?.topic_category?.toUpperCase();
                        let filter = 'ALL';
                        if (category?.includes('READING')) filter = 'READING';
                        else if (category?.includes('LISTENING')) filter = 'LISTENING';
                        else if (category?.includes('SPEAKING')) filter = 'SPEAKING';
                        
                        navigate('/dashboard', { 
                            state: { 
                                openRoadmap: subject === 'MATHS' ? 'MATHS' : 'ENGLISH', 
                                roadmapFilter: filter,
                                mockCompleted: true,
                                type: category || (filter !== 'ALL' ? filter : 'Reading'),
                                level: dseGrade,
                                score: `${percentage}%`
                            } 
                        });
                    }}
                    className="text-gray-600 hover:text-gray-900 font-medium flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200"
                >
                    <span>← {t('result.back_roadmap') || 'Back to Roadmap'}</span>
                </button>
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* --- COLUMN 1: OVERALL SCORE & GRADE (3/12) --- */}
                <div className="col-span-1 lg:col-span-3 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center h-full">
                        <h2 className="text-lg font-semibold text-gray-500 mb-6 uppercase tracking-wider">{t('result.overall_performance')}</h2>

                        {/* Circular Progress */}
                        <div className="relative inline-block mb-4">
                            <svg className="w-48 h-48 transform -rotate-90">
                                <circle cx="96" cy="96" r="88" stroke="#F3F4F6" strokeWidth="12" fill="transparent" />
                                <circle
                                    cx="96" cy="96" r="88"
                                    stroke="currentColor" strokeWidth="12"
                                    fill="transparent"
                                    strokeDasharray={552}
                                    strokeDashoffset={552 - (552 * percentage) / 100}
                                    strokeLinecap="round"
                                    className={`${overallStyles.circle}`}
                                />
                            </svg>
                            <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center">
                                <span className="text-4xl font-extrabold text-gray-900">{totalScore}</span>
                                <span className="text-gray-400 text-sm">{t('result.out_of').replace('{{max}}', totalMaxScore)}</span>
                            </div>
                        </div>

                        {/* DSE Grade Badge */}
                        <div className="mt-4">
                            <p className="text-sm text-gray-400 mb-1">{t('result.estimated_grade')}</p>
                            <div className={`inline-block px-6 py-2 rounded-full text-2xl font-bold text-white ${overallStyles.bg} bg-opacity-90`}>
                                Level {dseGrade}
                            </div>
                        </div>

                        {/* Review Button */}
                        <button
                            onClick={() => {
                                console.log("Navigating to review:", examId);
                                if (!examId) {
                                    alert("Error: Exam ID missing.");
                                    return;
                                }
                                navigate(`/review/${examId}`, { state: { answers, feedback, scoreInfo: { totalScore, totalMaxScore } } });
                            }}
                            className="mt-8 w-full bg-orange-500 text-white py-3 rounded-xl font-bold shadow-lg hover:scale-105 transition-transform flex items-center justify-center gap-2 hover:bg-orange-600 ring-2 ring-orange-200"
                        >
                            {t('result.review_full_exam')}
                        </button>
                    </div>
                </div>

                {/* --- COLUMN 2: PART BREAKDOWN (4/12) --- */}
                <div className="col-span-1 lg:col-span-4">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-full flex flex-col">
                        <h2 className="text-lg font-semibold text-gray-700 mb-6 flex items-center gap-2">
                            {t('result.breakdown')}
                        </h2>

                        <div className="flex-1 space-y-6">
                            {Object.keys(partScores).map((partKey) => {
                                const part = partScores[partKey];
                                const pPercent = part.max > 0 ? Math.round((part.score / part.max) * 100) : 0;
                                const pGrade = calculateDSEGrade(pPercent);
                                const pStyles = getGradeStyles(pPercent);

                                return (
                                    <div key={partKey} className="group">
                                        <div className="flex justify-between items-end mb-2">
                                            <span className="font-medium text-gray-700 text-lg">
                                                {partKey.replace(/_/g, ' ')}
                                            </span>
                                            <div className="text-right">
                                                <span className={`font-bold text-lg ${pStyles.text}`}>{pPercent}%</span>
                                                <span className="text-xs text-gray-400 ml-2">({pGrade})</span>
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-1000 ${pStyles.bg}`}
                                                style={{ width: `${pPercent}%` }}
                                            />
                                        </div>

                                        <div className="mt-1 text-xs text-gray-500 text-right">
                                            {part.score} / {part.max} {t('result.marks')}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-8 bg-blue-50 p-4 rounded-xl border border-blue-100">
                            <h4 className="text-blue-800 font-semibold mb-2 text-sm">{t('result.suggestion')}</h4>
                            <p className="text-blue-700 text-sm leading-relaxed">
                                {getRecommendation()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* --- COLUMN 3: DEEP DIVE ANALYSIS (5/12) --- */}
                <div className="col-span-1 lg:col-span-5">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-full flex flex-col max-h-[calc(100vh-100px)]">
                        <h2 className="text-lg font-semibold text-gray-700 mb-4 flex justify-between items-center">
                            <span>{t('result.deep_dive')}</span>
                            <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">{t('result.mistakes').replace('{{count}}', incorrectQuestions.length)}</span>
                        </h2>

                        <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                            {incorrectQuestions.length === 0 ? (
                                <div className="text-center py-10 opacity-50">
                                    <p>{t('result.perfect_score')}</p>
                                </div>
                            ) : (
                                incorrectQuestions.map((item, idx) => (
                                    <div key={idx} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-xs font-bold text-gray-500 uppercase">Question {idx + 1} ({item.id})</span>
                                            <span className="text-xs font-mono text-red-500">-{item.max - item.score} {t('result.marks')}</span>
                                        </div>

                                        {/* Answers */}
                                        <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                                            <div>
                                                <p className="text-xs text-gray-400 mb-1">{t('result.your_answer')}</p>
                                                <div className="font-medium text-red-600 bg-red-50 px-2 py-1 rounded border border-red-100 break-words">
                                                    {String(item.userAnswer || t('lab.no_answer'))}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400 mb-1">{t('result.correct_answer')}</p>
                                                <div className="font-medium text-green-600 bg-green-50 px-2 py-1 rounded border border-green-100 break-words">
                                                    {String(item.correctAnswer)}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Logic / Explanation */}
                                        <div className="text-xs text-gray-600 bg-white p-3 rounded border border-gray-100 italic relative flex justify-between items-start gap-4">
                                            <span className="absolute -top-2 left-2 bg-white px-1 text-gray-400 text-[10px]">{t('result.explanation')}</span>
                                            <div className="flex-1">
                                                {item.logic}
                                            </div>
                                            {(state?.examData?.subject === 'maths' || state?.examData?.topic_category?.toLowerCase().includes('math') || examId?.toLowerCase().includes('math')) && (
                                                <MathStepExplainer
                                                    question={item.text || "Math Question"}
                                                    fullSolution={item.logic}
                                                    targetStep={item.logic}
                                                />
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

            </div>

            {/* Vocab Sidekick: Available in Analysis Mode */}
            <VocabularySidekick topic={state?.examData?.topic_category || "General English"} />
        </div>
    );
}

export default ResultPage;
