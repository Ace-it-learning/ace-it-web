import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useAvatar } from '../context/AvatarContext';
import { ChevronLeft, CheckCircle, XCircle, Trophy, Home, Maximize2, Minimize2 } from 'lucide-react';
import { SafeInlineMath, SafeBlockMath } from '../components/maths/SafeMath';
import 'katex/dist/katex.min.css';
import { getMathSkillName } from '../constants/mathMicroSkills';
import MathStepExplainer from '../components/maths/MathStepExplainer';
import { getMasteryStats } from '../utils/masteryUtils';
import { formatNumbers, sanitizeMath, prepareMathText, splitContentByDelimiters, looksLikeMath } from '../utils/mathFormattingUtils';
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

    // Level progression logic
    const MATHS_LEVELS = [3, 4, 5, '5*', '5**'];
    const currentLevelIdx = MATHS_LEVELS.indexOf(level);
    const nextLevel = currentLevelIdx !== -1 && currentLevelIdx < MATHS_LEVELS.length - 1 ? MATHS_LEVELS[currentLevelIdx + 1] : null;

    const [results, setResults] = useState([]);
    const [score, setScore] = useState(0);
    const [totalPossible, setTotalPossible] = useState(0);
    const [isGrading, setIsGrading] = useState(true);

    const currentTier = getMasteryStats(level, language === 'zh');
    const nextTier = nextLevel ? getMasteryStats(nextLevel, language === 'zh') : null;

    useEffect(() => {
        // Ensure the math tutor is active when reviewing results
        setActiveAgentId('math');

        if (!questions || !answers) {
            if (!isSubmitted && !location.state?.already_submitted) {
                console.warn('[MathsLabReview] Missing state, redirecting to dashboard');
                navigate('/dashboard');
            }
            return;
        }

        const gradeAnswers = async () => {
            // If we have cached graded results (from a page refresh/back), use them natively
            if (location.state?.already_submitted && location.state?.graded_results) {
                setResults(location.state.graded_results);
                setScore(location.state.score);
                setTotalPossible(location.state.totalPossible || questions.reduce((sum, q) => sum + (q.marks || 3), 0));
                setIsGrading(false);
                if (submitting) setSubmitting(false);
                return;
            }

            setIsGrading(true);

            // 1. Basic synchronous grading (Exact Match)
            const baseResults = questions.map(q => {
                const userAnswer = (answers[q.id] || '').trim();
                const correctAnswer = (q.answer || '').trim();
                let isCorrect = userAnswer === correctAnswer;

                if (!isCorrect && q.type === 'short_answer') {
                    const clean = (str) => str.replace(/[\$\\]/g, '').replace(/\s+/g, '').toLowerCase();
                    const cUser = clean(userAnswer);
                    const cCorrect = clean(correctAnswer);
                    if (cUser === cCorrect) isCorrect = true;
                    else if (cUser.includes(cCorrect) && cCorrect.length > 2) isCorrect = true;
                }

                const maxScore = q.marks || 3;
                return { id: q.id, correct: isCorrect, score: isCorrect ? maxScore : 0, maxScore, userAnswer, correctAnswer, question: q };
            });

            // 2. AI Grading for short answers over the network
            const hasShortAnswers = questions.some(q => q.type === 'short_answer');
            let finalResults = [...baseResults];

            if (hasShortAnswers) {
                try {
                    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                    const res = await fetch(`${API_URL}/api/maths/lab/grade`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ questions, answers, imageAnswers: imageAnswers || {}, language })
                    });

                    if (res.ok) {
                        const aiGrades = await res.json();
                        finalResults = finalResults.map(r => {
                            const aiGrade = aiGrades.find(g => g.id === r.id);
                            if (aiGrade) {
                                return {
                                    ...r,
                                    correct: aiGrade.isCorrect,
                                    score: aiGrade.score ?? r.score,
                                    maxScore: aiGrade.maxScore ?? r.maxScore,
                                    aiFeedback: aiGrade.feedback
                                };
                            }
                            return r;
                        });
                    }
                } catch (e) {
                    console.error("AI Grading failed, falling back to basic matching", e);
                }
            }

            const totalEarned = finalResults.reduce((sum, r) => sum + (r.score || 0), 0);
            const totalMax = finalResults.reduce((sum, r) => sum + (r.maxScore || 1), 0);

            setResults(finalResults);
            setScore(totalEarned);
            setTotalPossible(totalMax);
            setIsGrading(false);

            // 3. Submit final results to backend
            if (!isSubmitted && !location.state?.already_submitted) {
                submitFinalResults(totalEarned, totalMax, finalResults);
            } else if (submitting) {
                setSubmitting(false);
            }
        };

        // If results array is empty, we haven't graded yet for this load cycle
        if (results.length === 0) {
            gradeAnswers();
        }
    }, [questions, answers, language, isSubmitted, location.state?.already_submitted]);

    const submitFinalResults = async (totalEarned, totalMax, gradedArray) => {
        try {
            console.log('[MathsLabReview] Submitting final results to backend...');
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const potentialXp = xp || 50;
            const earnedXp = Math.floor((totalEarned / totalMax) * potentialXp);

            const submissionData = {
                uid: user?.uid,
                topic,
                level,
                score: totalEarned,
                total: totalMax,
                taskId,
                xp: earnedXp,
                isFactoryQuest,
                questionIds: questions.map(q => q.id)
            };

            await fetch(`${API_URL}/api/maths/diagnostic/practice/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submissionData)
            });

            setIsSubmitted(true);

            // PERSISTENCE: Replace history state with "already_submitted" flag AND grades
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

        // Safety: Ensure text is a string
        if (typeof text !== 'string') {
            if (typeof text === 'number') text = String(text);
            else if (Array.isArray(text)) text = text.join('\n');
            else text = String(text);
        }

        // 1. Extract and Hide [DIAGRAM REQUIRED: ...] and [TABLE REQUIRED: ...] tags
        const diagramMatch = text.match(/\[DIAGRAM REQUIRED:([\s\S]*?)\]/);
        const tableMatch = text.match(/\[TABLE REQUIRED:([\s\S]*?)\]/);
        const description = (diagramMatch ? diagramMatch[1] : (tableMatch ? tableMatch[1] : '')).trim();

        const displaySubtext = text
            .replace(/\[DIAGRAM REQUIRED:[\s\S]*?\]/g, '')
            .replace(/\[TABLE REQUIRED:[\s\S]*?\]/g, '')
            .trim();

        const cleanText = prepareMathText(displaySubtext);
        const parts = splitContentByDelimiters(cleanText);

        return (
            <div className="text-gray-800 leading-relaxed font-sans">
                {parts.map((part, i) => {
                    if (!part) return null;

                    const isBlock = (part.startsWith('\\[') && part.endsWith('\\]')) || (part.startsWith('$$') && part.endsWith('$$'));
                    const isInline = (part.startsWith('\\(') && part.endsWith('\\)')) || (part.startsWith('$') && part.endsWith('$'));

                    if (isBlock || isInline) {
                        let math = '';
                        if (part.startsWith('\\[') || part.startsWith('\\(')) math = part.slice(2, -2);
                        else if (part.startsWith('$$')) math = part.slice(2, -2);
                        else math = part.slice(1, -1);

                        math = math
                            .replace(/\n/g, ' ')
                            .replace(/%/g, '\\%')
                            .replace(/___HKD___/g, '\\text{HK}\\$')
                            .replace(/___USD___/g, '\\$');

                        const labeledMath = sanitizeMath(math);
                        const finalMath = formatNumbers(labeledMath, true);

                        if (isBlock) {
                            return (
                                <SafeBlockMath key={i} math={finalMath} className="my-2" />
                            );
                        } else {
                            return (
                                <SafeInlineMath key={i} math={finalMath} className="mx-0.5" />
                            );
                        }
                    }

                    return (
                        <span key={i}>
                            {part.split(/(?:\r?\n|(?=\.Step\s*\d+\s*:?))/).map((line, lineIdx) => {
                                const trimmedLine = line.trim().replace(/^\./, '');
                                if (!trimmedLine && line.length > 0) return <br key={lineIdx} />;
                                if (!trimmedLine) return null;

                                const isMathLine = looksLikeMath(trimmedLine);
                                const isStepLine = line.trim().startsWith('Step') || line.trim().startsWith('.Step');

                                if (isMathLine) {
                                    const mathReadyLine = trimmedLine
                                        .replace(/%/g, '\\%')
                                        .replace(/___HKD___/g, '\\text{HK}\\$')
                                        .replace(/___USD___/g, '\\$');

                                    const labeledMath = sanitizeMath(mathReadyLine);
                                    const finalMath = formatNumbers(labeledMath, true);

                                    return (
                                        <React.Fragment key={lineIdx}>
                                            {(lineIdx > 0 || isStepLine) && <br />}
                                            <SafeInlineMath math={finalMath} className="mx-1" />
                                        </React.Fragment>
                                    );
                                } else {
                                    const formattedLine = formatNumbers(trimmedLine);
                                    const html = formattedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>')
                                        .replace(/___HKD___/g, 'HK$').replace(/___USD___/g, '$')
                                        .replace(/\\,/g, ' '); // Strip LaTeX spaces in plain text

                                    return (
                                        <React.Fragment key={lineIdx}>
                                            {(lineIdx > 0 || isStepLine) && <br />}
                                            <span className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: html }} />
                                        </React.Fragment>
                                    );
                                }
                            })}
                        </span>
                    );
                })}

                {description && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center gap-2 text-center my-2">
                        <div className="w-8 h-8 bg-white rounded-lg shadow-sm flex items-center justify-center text-slate-400">
                            <i className={`fas ${tableMatch ? 'fa-table' : 'fa-chart-area'}`}></i>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                            Technical {tableMatch ? 'Data' : 'Figure'} Preview
                        </p>
                        <p className="text-sm text-slate-600 italic font-medium leading-relaxed">"{description}"</p>
                    </div>
                )}
            </div>
        );
    };

    if (submitting || isGrading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
                <h2 className="text-xl font-bold text-slate-700">
                    {isGrading ? 'AI Examiner is Grading...' : 'Saving Results...'}
                </h2>
                <p className="text-slate-500">
                    {isGrading ? 'Analyzing your steps and final answer' : 'Please wait while we record your progress'}
                </p>
            </div>
        );
    }

    if (!questions || !results.length) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="text-center bg-white p-12 rounded-3xl shadow-xl border border-slate-200">
                    <h2 className="text-2xl font-black text-slate-800 mb-4">No Results Found</h2>
                    <p className="text-slate-500 mb-8">We couldn't find your practice results.</p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="bg-purple-600 px-8 py-3 rounded-2xl text-white font-black hover:bg-purple-700 transition-all"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const scorePercent = totalPossible > 0 ? Math.round((score / totalPossible) * 100) : 0;

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200 z-50 px-6 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-12 h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-all group"
                    >
                        <ChevronLeft className="w-6 h-6 text-slate-600 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 tracking-tight">
                            Practice Review
                        </h1>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                            {getMathSkillName(topic, language)} • {currentTier.displayName}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleLanguage}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-black transition-all flex items-center gap-2 ${language === 'zh'
                            ? 'bg-purple-600 border-purple-600 text-white shadow-sm'
                            : 'bg-white border-slate-200 text-slate-400 hover:border-purple-300 hover:text-purple-600'
                            }`}
                        title="Toggle Language"
                    >
                        {language === 'zh' ? '繁體中文' : 'ENGLISH'}
                    </button>
                    <div className="text-right">
                        <p className="text-sm text-slate-500 font-medium">Your Score</p>
                        <p className="text-2xl font-black text-purple-600">{score}/{totalPossible}</p>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 pt-32 pb-20">
                {/* Score Summary */}
                <div className="bg-gradient-to-br from-purple-600 to-indigo-600 p-8 rounded-3xl shadow-2xl mb-8 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <Trophy className="w-8 h-8" />
                                <h2 className="text-3xl font-black">Practice Complete!</h2>
                            </div>
                            <p className="text-purple-100">
                                You scored <span className="font-black text-white">{scorePercent}%</span> on this practice set
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-6xl font-black">{score}</div>
                            <div className="text-purple-200 text-sm">out of {totalPossible}</div>
                        </div>
                    </div>
                </div>

                {/* Question Review */}
                <div className="space-y-6">
                    {results.map((result, idx) => (
                        <div
                            key={result.id}
                            className="bg-white rounded-2xl shadow-lg border-2 border-slate-100 overflow-hidden"
                        >
                            {/* Question Header */}
                            <div className={`px-6 py-4 flex items-center justify-between ${result.correct || result.score === result.maxScore ? 'bg-emerald-50' : 'bg-red-50'
                                }`}>
                                <div className="flex items-center gap-3">
                                    {result.correct || result.score === result.maxScore ? (
                                        <CheckCircle className="w-6 h-6 text-emerald-600" />
                                    ) : (
                                        <XCircle className="w-6 h-6 text-red-600" />
                                    )}
                                    <div>
                                        <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                                            Question {idx + 1}
                                        </span>
                                        <p className={`font-black ${result.score === result.maxScore ? 'text-emerald-700' : result.score > 0 ? 'text-amber-700' : 'text-red-700'}`}>
                                            {result.score} / {result.maxScore} Marks
                                        </p>
                                    </div>
                                </div>
                                <span className="text-xs font-bold text-slate-500 bg-white px-3 py-1 rounded-full">
                                    {result.question.type === 'mc' ? 'MCQ' : 'Short Answer'}
                                </span>
                            </div>

                            {/* Question Content */}
                            <div className="p-6 space-y-6">
                                {/* Question Text */}
                                <div>
                                    <div className="text-lg font-medium text-slate-800">
                                        {renderMath(language === 'zh' ? (result.question.text_zh || result.question.text) : result.question.text)}
                                    </div>
                                    {/* Diagram Section */}
                                    {topic !== 'math_alg_apgp' && (result.question.diagram_url || result.question.diagram_json || result.question.diagram_svg) && (
                                        <div className={`mt-6 flex flex-col items-center mx-auto transition-all duration-300 ${expandedDiagrams[result.id] ? 'w-full' : 'w-[280px]'}`}>
                                            <div className="w-full relative bg-gradient-to-br from-slate-50 to-slate-100 p-4 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center">
                                                <button
                                                    onClick={() => toggleDiagram(result.id)}
                                                    className="absolute top-2 right-2 z-10 p-2 bg-white/80 backdrop-blur-md rounded-xl border border-slate-200 shadow-sm text-slate-600 hover:text-purple-600 transition-all scale-75 hover:scale-100"
                                                >
                                                    {expandedDiagrams[result.id] ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                                                </button>

                                                {result.question.diagram_url ? (
                                                    <div className="w-full bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex justify-center items-center overflow-hidden">
                                                        <img
                                                            src={`${import.meta.env.VITE_API_URL}/${result.question.diagram_url}`}
                                                            alt="Mathematical Graph"
                                                            className={`max-w-full object-contain ${expandedDiagrams[result.id] ? 'max-h-[500px]' : 'max-h-48'}`}
                                                        />
                                                    </div>
                                                ) : result.question.diagram_json ? (
                                                    <div className="w-full bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex justify-center items-center">
                                                        <GeometryRenderer data={result.question.diagram_json} />
                                                    </div>
                                                ) : result.question.diagram_svg ? (
                                                    <div className={`w-full bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex justify-center items-center ${expandedDiagrams[result.id] ? '' : 'overflow-hidden max-h-48'}`}
                                                        dangerouslySetInnerHTML={{ __html: result.question.diagram_svg }}
                                                    />
                                                ) : null}
                                            </div>
                                        </div>
                                    )}

                                </div>

                                {/* User Answer */}
                                <div>
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Your Answer</p>
                                    <div className={`p-4 rounded-xl border-2 ${result.correct
                                        ? 'bg-emerald-50 border-emerald-200'
                                        : 'bg-red-50 border-red-200'
                                        }`}>
                                        {result.userAnswer ? (
                                            <div className="whitespace-pre-wrap font-sans">{renderMath(result.userAnswer)}</div>
                                        ) : (
                                            <span className="text-slate-400 italic">No text answer provided</span>
                                        )}
                                        {imageAnswers?.[result.id] && (
                                            <div className="mt-3 pt-3 border-t border-slate-200">
                                                <p className="text-[10px] font-black text-purple-500 uppercase tracking-wider mb-2">Handwritten Steps</p>
                                                <img
                                                    src={imageAnswers[result.id]}
                                                    alt="Handwritten answer"
                                                    className="max-w-sm max-h-64 object-contain rounded-xl border border-slate-200 shadow-sm"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* AI Feedback */}
                                {result.aiFeedback && (
                                    <div>
                                        <p className="text-xs font-black text-indigo-600 uppercase tracking-wider mb-2">AI Examiner Feedback</p>
                                        <div className="p-4 rounded-xl bg-indigo-50 border-2 border-indigo-200 text-indigo-900 whitespace-pre-wrap font-sans">
                                            {result.aiFeedback}
                                        </div>
                                    </div>
                                )}

                                {/* Correct Answer (if wrong) */}
                                {!result.correct && (
                                    <div>
                                        <p className="text-xs font-black text-emerald-600 uppercase tracking-wider mb-2">Correct Answer</p>
                                        <div className="p-4 rounded-xl bg-emerald-50 border-2 border-emerald-200">
                                            {renderMath(language === 'zh' && result.question.type === 'mc' ? (result.question.options_zh?.[result.question.options?.indexOf(result.correctAnswer)] || result.correctAnswer) : result.correctAnswer)}
                                        </div>
                                    </div>
                                )}

                                {/* Solution Steps */}
                                {((result.question.solution_steps && result.question.solution_steps.length > 0) || result.question.answer_logic_zh) && (
                                    <div>
                                        <p className="text-xs font-black text-purple-600 uppercase tracking-wider mb-3">Step-by-Step Solution</p>
                                        <div className="space-y-4">
                                            {(language === 'zh'
                                                ? (result.question.solution_steps_zh || (result.question.answer_logic_zh ? result.question.answer_logic_zh.split('\\n').filter(s => s.trim()) : result.question.solution_steps))
                                                : result.question.solution_steps).map((step, stepIdx) => (
                                                    <div key={stepIdx} className="flex gap-3 group relative">
                                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-black text-sm flex items-center justify-center">
                                                            {stepIdx + 1}
                                                        </div>
                                                        <div className="flex-1 pt-1 flex items-start justify-between gap-4">
                                                            <div className="flex-1">
                                                                {renderMath(step)}
                                                            </div>
                                                            <MathStepExplainer
                                                                question={language === 'zh' ? (result.question.text_zh || result.question.text) : result.question.text}
                                                                fullSolution={language === 'zh' ? (result.question.answer_logic_zh || (result.question.solution_steps_zh ? result.question.solution_steps_zh.join('\\n') : result.question.solution_steps.join('\\n'))) : result.question.solution_steps.join('\\n')}
                                                                targetStep={step}
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Actions */}
                <div className="mt-12 flex gap-4 justify-center">
                    <button
                        onClick={() => navigate('/dashboard', {
                            state: {
                                labCompleted: true,
                                topic: title || topic || "Maths Lab",
                                earnedXp: Math.floor((score / (totalPossible || 1)) * (xp || 50)),
                                masteryScore: Math.round((score / (totalPossible || 1)) * 100)
                            }
                        })}
                        className="px-8 py-4 rounded-2xl bg-slate-100 text-slate-700 font-black hover:bg-slate-200 transition-all flex items-center gap-2"
                    >
                        <Home className="w-5 h-5" />
                        Back to Dashboard
                    </button>
                    <button
                        onClick={() => navigate('/maths/lab', {
                            state: { topic, level, taskId, title, xp, isFactoryQuest }
                        })}
                        className="px-8 py-4 rounded-2xl bg-purple-600 text-white font-black hover:bg-purple-700 transition-all shadow-lg shadow-purple-200"
                    >
                        Practice again ({currentTier.displayName})
                    </button>
                    {nextLevel && (
                        <button
                            onClick={() => navigate('/maths/lab', {
                                state: { topic, level: nextLevel, taskId, title, xp, isFactoryQuest }
                            })}
                            className="px-8 py-4 rounded-2xl bg-indigo-600 text-white font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                        >
                            Practice Next Level ({nextTier.displayName})
                        </button>
                    )}
                </div>
            </main>
        </div>
    );
};

export default MathsLabReview;
