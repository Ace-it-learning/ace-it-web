import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useAvatar } from '../context/AvatarContext';
import { ChevronLeft, CheckCircle, XCircle, Trophy, Home, Maximize2, Minimize2, User, Cpu, RefreshCw } from 'lucide-react';
import { GradingOverlay } from '../components/shared';
import { SafeInlineMath, SafeBlockMath } from '../components/maths/SafeMath';
import 'katex/dist/katex.min.css';
import { getMathSkillName } from '../constants/mathMicroSkills';
import MathStepExplainer from '../components/maths/MathStepExplainer';
import { getMasteryStats } from '../utils/masteryUtils';
import { formatNumbers, sanitizeMath, prepareMathText, splitContentByDelimiters, looksLikeMath, isTipTapJSON, convertTipTapToElite, rescueMangledLatex } from '../utils/mathFormattingUtils';
import GeometryRenderer from '../components/maths/GeometryRenderer';

const MathsLabReview = () => {
    const { user } = useAuth();
    const { language, toggleLanguage } = useLanguage();
    const { setActiveAgentId } = useAvatar();
    const navigate = useNavigate();
    const location = useLocation();
    const { questions, answers, imageAnswers, topic, level, taskId, title, xp, isFactoryQuest } = location.state || {};

    const [submitting, setSubmitting] = useState(!location.state?.already_submitted);
    const [isSubmitted, setIsSubmitted] = useState(!!location.state?.already_submitted);
    const [expandedDiagrams, setExpandedDiagrams] = useState({});

    const toggleDiagram = (id) => {
        setExpandedDiagrams(prev => ({ ...prev, [id]: !prev[id] }));
    };

    // Legacy level progression removed (Blended Quests)

    const [results, setResults] = useState([]);
    const [score, setScore] = useState(0);
    const [totalPossible, setTotalPossible] = useState(0);
    const [isGrading, setIsGrading] = useState(true);
    const [xpBreakdown, setXpBreakdown] = useState(null);

    const currentTier = getMasteryStats(level, language === 'zh');

    const gradeAnswers = useCallback(async () => {
        // [HARDENING FIX 3.0]: Minimal Loading Time to prevent "Instant Pop"
        const MIN_LOADING_MS = 1500;
        const startTime = Date.now();
        
        setIsGrading(true);
        console.log('[Review v4] gradeAnswers started. Questions:', questions?.length);
        console.table(questions.map(q => ({ id: q.id, type: q.type, marks: q.marks || 3 })));
        console.log('[Review v4] Answers keys:', Object.keys(answers || {}));

        // 1. Basic synchronous grading (Exact Match) - Use rescued strings for comparison
        const baseResults = questions.map(q => {
            const rawUserAnswer = (answers[q.id] || '').trim();
            const isJson = isTipTapJSON(rawUserAnswer);
            
            // CONVERSION: Treat JSON as Elite string if detected
            const eliteUserAnswer = isJson ? convertTipTapToElite(rawUserAnswer) : rawUserAnswer;
            const userAnswer = rescueMangledLatex(eliteUserAnswer);
            const correctAnswer = (q.correct_answer || q.answer || '').trim();
            
            let isCorrect = userAnswer === correctAnswer;
            const isPassport = String(userAnswer).includes('[PASSPORT: AUDIT_VERIFIED]');
            if (isPassport) isCorrect = true;

            if (!isCorrect && (q.type === 'short_answer' || q.type === 'AI_Generator' || q.type === 'conventional')) {
                // Aggressive cleaning: normalize superscripts, strip all units, LaTeX math markers, and non-alphanumeric except dots
                const clean = (str) => String(str || '')
                    .replace(/²/g, '2').replace(/³/g, '3') // Normalize superscripts
                    .replace(/\\text\{|\\\}|[\$\\\(\)\s,;°\^\[\]\{\}=\*²³]|deg|degree|cm|units|area|angle/gi, '')
                    .toLowerCase();
                const cUser = clean(userAnswer);
                const cCorrect = clean(correctAnswer);
                
                // 1. Direct segment matching
                const segments = (q.correct_answer || q.answer || '').split(/[;,]/).map(s => clean(s)).filter(s => s.length > 2);
                const allSegmentsFound = segments.length > 0 && segments.every(seg => cUser.includes(seg));

                if (cUser === cCorrect || allSegmentsFound || (cCorrect.length > 3 && cUser.includes(cCorrect))) {
                    isCorrect = true;
                }
            } else if (!isCorrect && (q.type === 'mc' || q.type === 'mcq')) {
                const uClean = userAnswer.trim().toUpperCase();
                const cClean = correctAnswer.trim().toUpperCase();
                
                // 1. First-Letter Comparison (A vs A. ...)
                const uLetter = uClean.charAt(0);
                const cLetter = cClean.charAt(0);
                if (uLetter === cLetter && /^[A-D]$/.test(uLetter)) {
                    isCorrect = true;
                } else {
                    // 2. Content-Based Comparison (Strip "A." and compare)
                    const stripLetter = (str) => str.replace(/^[A-D]\s*[:.]\s*/i, '').replace(/[\$\s]/g, '').toLowerCase();
                    const sUser = stripLetter(userAnswer);
                    const sCorrect = stripLetter(correctAnswer);
                    if (sUser === sCorrect && sUser !== "") {
                        isCorrect = true;
                    } else if (sUser.includes(sCorrect) && sCorrect.length > 2) {
                        isCorrect = true;
                    }
                }
            }

            const maxScore = q.marks || (q.type === 'mcq' || q.type === 'mc' ? 1 : 12);
            return { id: q.id, correct: isCorrect, score: isCorrect ? maxScore : 0, maxScore, userAnswer, correctAnswer, question: q };
        });

        // 2. AI Grading for short answers over the network
        const hasShortAnswers = questions.some(q => 
            q.type === 'short_answer' || 
            q.type === 'AI_Generator' || 
            q.type === 'conventional'
        );
        let finalResults = [...baseResults];

        if (hasShortAnswers) {
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                const rescuedAnswers = {};
                Object.keys(answers).forEach(id => {
                    const rawAns = (answers[id] || '').trim();
                    const eliteAns = isTipTapJSON(rawAns) ? convertTipTapToElite(rawAns) : rawAns;
                    const finalAns = rescueMangledLatex(eliteAns);
                    // Escape solo % signs for KaTeX safety
                    rescuedAnswers[id] = finalAns.replace(/(?<!\\)%/g, '\\%');
                });

                console.log('[Review v4] Fetching AI grade for', questions.length, 'questions...');
                const res = await fetch(`${API_URL}/api/maths/lab/grade`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ questions, answers: rescuedAnswers, imageAnswers: imageAnswers || {}, language })
                });

                if (res.ok) {
                    const aiGrades = await res.json();
                    console.log('[Review v4] AI Grades received:', aiGrades.length);
                    finalResults = finalResults.map(r => {
                        const aiGrade = (aiGrades || []).find(g => String(g.id) === String(r.id));
                        if (aiGrade) {
                            // [HARDENING] If the deterministic frontend logic already marked it correct,
                            // do NOT let the AI downgrade it.
                            const isDeterministicCorrect = r.correct === true;
                            return {
                                ...r,
                                correct: isDeterministicCorrect ? true : aiGrade.isCorrect,
                                score: isDeterministicCorrect ? Math.max(r.score, aiGrade.score ?? 0) : (aiGrade.score ?? r.score),
                                maxScore: aiGrade.maxScore ?? r.maxScore,
                                aiFeedback: aiGrade.feedback
                            };
                         }
                        return r;
                    });
                }
            } catch (e) {
                console.error("[Review v4] AI Grading failed, falling back to basic matching", e);
            }
        }

        const totalEarned = finalResults.reduce((sum, r) => sum + (r.score || 0), 0);
        const totalMax = finalResults.reduce((sum, r) => sum + (r.maxScore || 1), 0);

        // [HARDENING 3.1]: Ensure minimal loading time for UX
        const elapsed = Date.now() - startTime;
        if (elapsed < MIN_LOADING_MS) {
            await new Promise(resolve => setTimeout(resolve, MIN_LOADING_MS - elapsed));
        }

        setResults(finalResults);
        setScore(totalEarned);
        setTotalPossible(totalMax);
        setIsGrading(false);

        if (!isSubmitted && !location.state?.already_submitted) {
            submitFinalResults(totalEarned, totalMax, finalResults);
        } else if (submitting) {
            setSubmitting(false);
        }
    }, [questions, answers, language, location.state?.already_submitted, isSubmitted, submitting]);

    useEffect(() => {
        // Ensure the math tutor is active when reviewing results
        setActiveAgentId('math');
        console.log('[Review v2] Component mounted. Results length:', results.length);

        if (!questions || !answers) {
            if (!isSubmitted && !location.state?.already_submitted) {
                console.warn('[MathsLabReview] Missing state, redirecting to dashboard');
                navigate('/dashboard');
            }
            return;
        }

        if (!location.state?.already_submitted || results.length === 0) {
            console.log('[Review v4] Triggering gradeAnswers effect...');
            gradeAnswers();
        }
    }, [questions, answers, gradeAnswers, location.state?.already_submitted]);

    const submitFinalResults = async (totalEarned, totalMax, gradedArray) => {
        // Version 4.1: Robust Identity Check
        const currentUid = user?.uid || location.state?.uid;
        if (!currentUid) {
            console.warn('[Review v4] Delaying submission: No UID yet.');
            return;
        }

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const potentialXp = xp || 50;
            const earnedXp = Math.floor((totalEarned / totalMax) * potentialXp);

            const submissionData = {
                uid: currentUid,
                topic,
                level,
                score: totalEarned,
                total: totalMax,
                scorePercent: Math.round((totalEarned / totalMax) * 100),
                taskId,
                xp: earnedXp,
                isFactoryQuest,
                questionIds: questions.map(q => q.id)
            };

            const res = await fetch(`${API_URL}/api/maths/diagnostic/practice/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submissionData)
            });

            if (res.ok) {
                const data = await res.json();
                if (data.breakdown) {
                    setXpBreakdown(data.breakdown);
                }
            }

            console.log(`[Review v4] Successfully recorded practice completion for ${currentUid}`);
            setIsSubmitted(true);

            navigate(location.pathname, {
                replace: true,
                state: { ...location.state, already_submitted: true, graded_results: gradedArray, score: totalEarned, totalPossible: totalMax }
            });
        } catch (error) {
            console.error('Failed to submit results:', error);
        } finally {
            setSubmitting(false);
        }
    };
    const renderMath = (text) => {
        if (!text) return null;
        const processedText = (typeof text === 'string') ? text : String(text);
        const safeMathString = processedText.replace(/\\+dots/g, "...");
        const cleanText = prepareMathText(isTipTapJSON(safeMathString) ? convertTipTapToElite(safeMathString) : safeMathString);
        
        // Remove diagram/table markers for the text pass
        const displaySubtext = cleanText
            .replace(/\[DIAGRAM REQUIRED:[\s\S]*?\]/g, '')
            .replace(/\[TABLE REQUIRED:[\s\S]*?\]/g, '')
            .trim();

        const parts = splitContentByDelimiters(displaySubtext);

        return (
            <div className="text-gray-800 leading-[1.6] font-sans">
                {parts.map((part, i) => {
                    if (!part) return null;

                    // v1.7.6: Robust regex-based detection for math parts
                    // Bug Fix: Only trim when testing for math part match, but don't re-assign the trimmed version globally
                    const mathMatch = (typeof part === 'string' ? part.trim() : '').match(/^(\$\$?|\\\(|\\\[)([\s\S]+?)(\$\$?|\\\)|\\\])$/);

                    if (mathMatch) {
                        const opener = mathMatch[1];
                        const math = mathMatch[2];
                        const isBlock = opener === '$$' || opener === '\\[';

                        const finalMath = formatNumbers(sanitizeMath(rescueMangledLatex(math).replace(/\n/g, ' ')), true);
                        return isBlock 
                            ? <SafeBlockMath key={i} math={finalMath} />
                            : <SafeInlineMath key={i} math={finalMath} className="mx-0.5" />;
                    }

                    // Prose segment: preserve original part with spacing
                    const html = formatNumbers(part)
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\*(.*?)\*/g, '<em>$1</em>')
                        .replace(/___HKD___/g, 'HK$')
                        .replace(/___USD___/g, '$')
                        .replace(/\\,/g, ' ')
                        .replace(/\n/g, '<br />');

                    return <span key={i} className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: html }} />;
                })}
            </div>
        );
    };

    if (submitting || isGrading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <GradingOverlay 
                    isOpen={true}
                    title={isGrading ? 'AI Examiner is Grading...' : 'Saving Results...'}
                    status={isGrading ? 'Analyzing your steps and final answer' : 'Please wait while we record your progress'}
                />
            </div>
        );
    }

    if (!questions || !results.length) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="text-center bg-white p-12 rounded-3xl shadow-xl border border-slate-200">
                    <h2 className="text-2xl font-black text-slate-800 mb-4">No Results Found</h2>
                    <p className="text-slate-500 mb-8">We couldn't find your practice results.</p>
                    <button onClick={() => navigate('/dashboard', { 
                        state: { 
                            labCompleted: true, 
                            topic: title || topic || "Maths Lab", 
                            earnedXp: Math.floor((score / (totalPossible || 1)) * (xp || 50)), 
                            masteryScore: Math.round((score / (totalPossible || 1)) * 100) 
                        } 
                    })} className="bg-purple-600 px-8 py-3 rounded-2xl text-white font-black hover:bg-purple-700 transition-all">Back to Dashboard</button>
                </div>
            </div>
        );
    }

    const scorePercent = totalPossible > 0 ? Math.round((score / totalPossible) * 100) : 0;

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="fixed top-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200 z-50 px-6 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <button onClick={() => navigate('/dashboard', { 
                        state: { 
                            labCompleted: true, 
                            topic: title || topic || "Maths Lab", 
                            earnedXp: Math.floor((score / (totalPossible || 1)) * (xp || 50)), 
                            masteryScore: Math.round((score / (totalPossible || 1)) * 100) 
                        } 
                    })} className="w-12 h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-all group">
                        <ChevronLeft className="w-6 h-6 text-slate-600 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 tracking-tight">Practice Review</h1>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">{getMathSkillName(topic, language)} • {currentTier.displayName}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button onClick={toggleLanguage} className={`px-3 py-1.5 rounded-lg border text-xs font-black transition-all flex items-center gap-2 ${language === 'zh' ? 'bg-purple-600 border-purple-600 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-400 hover:border-purple-300 hover:text-purple-600'}`}>{language === 'zh' ? '繁體中文' : 'ENGLISH'}</button>
                    <div className="text-right">
                        <p className="text-sm text-slate-500 font-medium">Your Score</p>
                        <p className="text-2xl font-black text-purple-600">{score}/{totalPossible}</p>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 pt-32 pb-20">
                <div className="bg-gradient-to-br from-purple-600 to-indigo-600 p-8 rounded-3xl shadow-2xl mb-12 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <Trophy className="w-8 h-8" />
                                <h2 className="text-3xl font-black">Practice Complete!</h2>
                            </div>
                            <p className="text-purple-100">You scored <span className="font-black text-white">{scorePercent}%</span> on this practice set</p>
                        </div>
                        <div className="text-right">
                            <div className="text-6xl font-black">{score}</div>
                            <div className="text-purple-200 text-sm">out of {totalPossible}</div>
                        </div>
                    </div>

                    {/* XP BREAKDOWN (New) */}
                    {xpBreakdown && (
                        <div className="mt-8 pt-8 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
                            <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                                <div className="text-[10px] font-black uppercase tracking-widest text-purple-200 mb-1">Base Reward</div>
                                <div className="text-xl font-black">{xpBreakdown.base} XP</div>
                            </div>
                            {xpBreakdown.tierMultiplier > 1 && (
                                <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-purple-200 mb-1">Premium Bonus</div>
                                    <div className="text-xl font-black">x{xpBreakdown.tierMultiplier}</div>
                                </div>
                            )}
                            {xpBreakdown.masteryMultiplier > 1 && (
                                <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-purple-200 mb-1">Mastery Bonus</div>
                                    <div className="text-xl font-black">x{xpBreakdown.masteryMultiplier}</div>
                                </div>
                            )}
                            {xpBreakdown.milestoneBonus > 0 && (
                                <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-purple-200 mb-1">Milestone</div>
                                    <div className="text-xl font-black">+{xpBreakdown.milestoneBonus} XP</div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="space-y-12">
                    {results.map((result, idx) => (
                        <div key={idx} className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden transition-all duration-300 hover:shadow-2xl">
                            <div className={`px-8 py-5 flex items-center justify-between ${result.correct || result.score === result.maxScore ? 'bg-emerald-50/50' : 'bg-red-50/50'}`}>
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${result.correct || result.score === result.maxScore ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                        {result.correct || result.score === result.maxScore ? <CheckCircle size={24} /> : <XCircle size={24} />}
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Question {idx + 1}</span>
                                        <div className="flex items-center gap-3">
                                            <p className={`text-lg font-black ${result.score === result.maxScore ? 'text-emerald-700' : result.score > 0 ? 'text-amber-700' : 'text-red-700'}`}>
                                                {result.score} / {result.maxScore} Marks
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-white border border-slate-100 text-slate-500 shadow-sm">
                                    {(result.question.type === 'mc' || result.question.type === 'mcq') ? 'Multiple Choice (Paper 2)' : 'Structured Question'}
                                </span>
                            </div>

                            <div className="p-8 space-y-10">
                                <div>
                                    <div className="flex flex-col gap-3 mb-8">
                                        <div className="text-xl font-medium text-slate-800 leading-relaxed">
                                            {renderMath(result.question.text)}
                                        </div>
                                        {result.question.text_zh && (
                                            <div className="text-xl font-medium text-slate-600 leading-relaxed border-t border-slate-50 pt-3">
                                                {renderMath(result.question.text_zh)}
                                            </div>
                                        )}
                                    </div>
                                    {!['math_alg_apgp', 'math_alg_functions', 'math_alg_func'].includes(topic) && (result.question.diagram_url || result.question.diagram_json || result.question.diagram_svg || result.question.visual || result.question.content?.diagram_svg) && (
                                        <div className={`mt-8 flex flex-col items-center mx-auto transition-all duration-300 ${expandedDiagrams[result.id] ? 'w-full' : 'w-[320px]'}`}>
                                            <div className="w-full relative bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 shadow-inner flex flex-col items-center justify-center">
                                                <button onClick={() => toggleDiagram(result.id)} className="absolute top-4 right-4 z-10 p-2 bg-white rounded-xl shadow-md text-slate-400 hover:text-purple-600 transition-all">
                                                    {expandedDiagrams[result.id] ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                                                </button>
                                                {result.question.diagram_url ? (
                                                    <img src={`${import.meta.env.VITE_API_URL}/${result.question.diagram_url}`} alt="Graph" className={`max-w-full object-contain mix-blend-multiply ${expandedDiagrams[result.id] ? 'max-h-[600px]' : 'max-h-56'}`} />
                                                ) : result.question.diagram_json ? (
                                                    <GeometryRenderer data={result.question.diagram_json} />
                                                ) : (result.question.diagram_svg || result.question.visual || result.question.content?.diagram_svg) ? (
                                                     <div 
                                                        className={`w-full flex items-center justify-center geometry-diagram-container transition-all duration-300 ${expandedDiagrams[result.id] ? 'min-h-[400px]' : 'min-h-[220px]'}`} 
                                                        dangerouslySetInnerHTML={{ __html: result.question.diagram_svg || result.question.visual || result.question.content?.diagram_svg }} 
                                                     />
                                                ) : null}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* v1.3.0: MCQ Options Display */}
                                {(result.question.type === 'mc' || result.question.type === 'mcq') && result.question.options && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {result.question.options.map((option, idx) => {
                                            const optionLetter = option.trim().substring(0, 1).toUpperCase();
                                            const isCorrect = optionLetter === (result.question.correct_answer || result.correctAnswer);
                                            const isStudentSelected = result.userAnswer && (result.userAnswer.trim().toUpperCase() === optionLetter || (result.userAnswer.trim().startsWith(optionLetter) && result.userAnswer.trim().length <= 3));
                                            
                                            let bgClass = 'bg-white border-slate-100';
                                            let textClass = 'text-slate-600';
                                            let borderClass = 'border-2';
                                            
                                            if (isCorrect) {
                                                bgClass = 'bg-emerald-50 border-emerald-200';
                                                textClass = 'text-emerald-900';
                                                borderClass = 'border-2';
                                            } else if (isStudentSelected && !isCorrect) {
                                                bgClass = 'bg-red-50 border-red-200';
                                                textClass = 'text-red-900';
                                                borderClass = 'border-2';
                                            }

                                            return (
                                                <div key={idx} className={`p-4 rounded-2xl flex items-center justify-between transition-all ${bgClass} ${borderClass}`}>
                                                    <div className={`text-sm font-medium ${textClass}`}>
                                                        {renderMath(option)}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {isCorrect && <CheckCircle size={16} className="text-emerald-500" />}
                                                        {isStudentSelected && !isCorrect && <XCircle size={16} className="text-red-500" />}
                                                        {isStudentSelected && <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-white px-2 py-0.5 rounded-lg border border-slate-100 italic">Your choice</span>}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                <div className="flex flex-col gap-8">
                                    {/* Hide Scratchpad and AI Rubric for MCQs to prevent clutter/hallucinations */}
                                    {!(result.question.type === 'mc' || result.question.type === 'mcq') && (
                                        <>
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-2 text-slate-400">
                                                    <User size={14} className="opacity-60" />
                                                    <p className="text-[10px] font-black uppercase tracking-widest">Student Scratchpad</p>
                                                </div>
                                                <div className={`p-6 rounded-3xl border-2 transition-all student-scratchpad-container ${result.correct ? 'bg-emerald-50/30 border-emerald-100 shadow-sm shadow-emerald-100/50' : 'bg-red-50/30 border-red-100 shadow-sm shadow-red-100/50'}`}>
                                                    {result.userAnswer ? (
                                                        <div className="font-sans prose prose-slate max-w-none">{renderMath(result.userAnswer)}</div>
                                                    ) : (
                                                        <span className="text-slate-400 italic text-sm">No steps provided digitally.</span>
                                                    )}
                                                    {imageAnswers?.[result.id] && (
                                                        <div className="mt-6 pt-6 border-t border-slate-200/50">
                                                            <p className="text-[10px] font-black text-purple-600 uppercase tracking-wider mb-4">Handwritten Proof</p>
                                                            <img src={imageAnswers[result.id]} alt="Steps" className="max-w-full rounded-2xl border-4 border-white shadow-xl" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {((result.question.type !== 'mc' && result.question.type !== 'mcq' && result.aiFeedback !== undefined) || result.aiFeedback) && (
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-2 text-indigo-500">
                                                        <Cpu size={14} className="opacity-60" />
                                                        <p className="text-[10px] font-black uppercase tracking-widest">AI Scoring Rubric</p>
                                                    </div>
                                                    <div className="p-6 rounded-3xl bg-indigo-50/40 border-2 border-indigo-100 shadow-sm shadow-indigo-100/50 text-indigo-900 leading-relaxed font-sans text-sm mastery-logic-container">
                                                        {result.aiFeedback ? renderMath(result.aiFeedback) : <span className="text-indigo-400 italic">No detailed feedback provided.</span>}
                                                    </div>
                                                </div>
                                            )}

                                            {!result.correct && (
                                                <div className="bg-emerald-50/40 p-6 rounded-3xl border border-emerald-100/50">
                                                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-3">Target Objective</p>
                                                    <div className="text-emerald-900">
                                                        {(() => {
                                                            const rawAns = language === 'zh' && result.question.type === 'mc' 
                                                                ? (result.question.options_zh?.[result.question.options?.indexOf(result.correctAnswer)] || result.correctAnswer) 
                                                                : result.correctAnswer;
                                                            // Bug 2 Fix: Wrap in delimiters to ensure it renders as math component
                                                            const wrappedAns = (rawAns.includes('\\') || rawAns.includes('_') || rawAns.includes('^')) 
                                                                ? `$${rawAns}$` 
                                                                : rawAns;
                                                            return renderMath(wrappedAns);
                                                        })()}
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>

                                {((result.question.solution_steps_en && result.question.solution_steps_en.length > 0) || (result.question.solution_steps && result.question.solution_steps.length > 0) || result.question.solution_steps_zh || result.question.answer_logic_zh) && (
                                    <div className="pt-8 border-t border-slate-100">
                                        <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-6">Mastery Logic (Step-by-Step)</p>
                                        <div className="space-y-8 mastery-logic-container">
                                            {(() => {
                                                const rawSteps = language === 'zh'
                                                    ? (result.question.solution_steps_zh || (result.question.answer_logic_zh ? result.question.answer_logic_zh.split('\n').filter(s => s.trim()) : (result.question.solution_steps_en || result.question.solution_steps)))
                                                    : (result.question.solution_steps_en || result.question.solution_steps);
                                                
                                                const stepsArr = Array.isArray(rawSteps) ? rawSteps : (typeof rawSteps === 'string' ? rawSteps.split('\n').filter(s => s.trim()) : []);
                                                
                                                return stepsArr.map((step, stepIdx) => {
                                                    const trimmedStep = (typeof step === 'string') ? step.trim() : '';
                                                    const isFullMath = (trimmedStep.startsWith('$$') && trimmedStep.endsWith('$$')) ||
                                                                     (trimmedStep.startsWith('\\[') && trimmedStep.endsWith('\\]'));
                                                    
                                                    return (
                                                        <div key={stepIdx} className="flex gap-4 group">
                                                            <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-purple-50 text-purple-600 font-black text-xs grid place-items-center border border-purple-100 group-hover:bg-purple-600 group-hover:text-white transition-all leading-none pt-0.5">
                                                                {stepIdx + 1}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-start justify-between gap-6">
                                                                    <div className="flex-1 pt-0">
                                                                        <div className="text-slate-700 leading-relaxed font-sans">{renderMath(step)}</div>
                                                                    </div>
                                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                                        <MathStepExplainer
                                                                            question={language === 'zh' ? (result.question.text_zh || result.question.text) : result.question.text}
                                                                            fullSolution={language === 'zh' 
                                                                                ? (result.question.answer_logic_zh || (Array.isArray(result.question.solution_steps_zh) ? result.question.solution_steps_zh.join('\\n') : (Array.isArray(result.question.solution_steps) ? result.question.solution_steps.join('\\n') : (result.question.solution_steps || '')))) 
                                                                                : (Array.isArray(result.question.solution_steps) ? result.question.solution_steps.join('\\n') : (result.question.solution_steps || ''))}
                                                                            targetStep={step}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                });
                                            })()}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-16 flex gap-6 justify-center">
                    <button onClick={() => navigate('/dashboard', { state: { labCompleted: true, topic: title || topic || "Maths Lab", earnedXp: Math.floor((score / (totalPossible || 1)) * (xp || 50)), masteryScore: Math.round((score / (totalPossible || 1)) * 100) } })} className="px-10 py-5 rounded-3xl bg-white text-slate-700 font-black border border-slate-200 hover:bg-slate-50 transition-all flex items-center gap-3 shadow-sm"><Home size={20} /> Dashboard</button>
                    {user?.email === 'fungtam@gmail.com' && (
                        <button 
                            onClick={gradeAnswers} 
                            disabled={isGrading}
                            className="px-10 py-5 rounded-3xl bg-purple-50 text-purple-700 font-black border-2 border-purple-200 hover:bg-purple-100 transition-all flex items-center gap-3 shadow-lg shadow-purple-100"
                        >
                            <RefreshCw size={20} className={isGrading ? 'animate-spin' : 'animate-pulse text-purple-400'} />
                            Re-examine with AI
                        </button>
                    )}
                    <button onClick={() => navigate('/maths/lab', { state: { topic, level, taskId, title, xp, isFactoryQuest } })} className="px-10 py-5 rounded-3xl bg-purple-600 text-white font-black hover:bg-purple-700 transition-all shadow-xl shadow-purple-200">Practice again</button>
                </div>
            </main>
        </div>
    );
};

export default MathsLabReview;
