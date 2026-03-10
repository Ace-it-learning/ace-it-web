import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useAvatar } from '../context/AvatarContext';
import { X, ArrowRight, ArrowLeft, CheckCircle, AlertCircle, RotateCcw, ChevronDown, Lightbulb, Maximize2, Minimize2 } from 'lucide-react';
import { SafeInlineMath, SafeBlockMath } from '../components/maths/SafeMath';
import 'katex/dist/katex.min.css';
import MathInput from '../components/maths/MathInput';
import ImageUploadInput from '../components/maths/ImageUploadInput';
import GeometryRenderer from '../components/maths/GeometryRenderer';
import { getMathSkillName } from '../constants/mathMicroSkills';
import { getMasteryStats, getDifficultyTierDetails } from '../utils/masteryUtils';
import { formatNumbers, sanitizeMath, prepareMathText, splitContentByDelimiters, looksLikeMath } from '../utils/mathFormattingUtils';

const MathsLabPage = () => {
    const { user } = useAuth();
    const { language, t } = useLanguage();
    const { setActiveAgentId } = useAvatar();
    const [showChinese, setShowChinese] = useState(language === 'zh');
    const isChinese = showChinese;
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    // Support both location.state (from Roadmap) and URL params (from AI Tutor)
    const topic = location.state?.topic || searchParams.get('topic');
    const level = location.state?.level || parseInt(searchParams.get('level')) || 3;
    const { taskId, title, xp, isFactoryQuest } = location.state || {};

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({}); // Map: { qId: answerVal }
    const [imageAnswers, setImageAnswers] = useState({}); // Map: { qId: imageUrl }
    const [showCheatMenu, setShowCheatMenu] = useState(false);
    const [step, setStep] = useState('PRACTICE'); // EXPLORE, PRACTICE
    const [hints, setHints] = useState([]); // Array of progressive hints
    const [hintIndex, setHintIndex] = useState(-1);
    const [loadingHint, setLoadingHint] = useState(false);
    const [isDiagramExpanded, setIsDiagramExpanded] = useState(false);

    const tier = getMasteryStats(level || 3, language === 'zh');
    const potentialXP = xp || tier.xp || 100;

    const lastFetchKey = useRef("");

    useEffect(() => {
        // Ensure the math tutor is active when entering the lab
        setActiveAgentId('math');

        if (!user || !topic) {
            navigate('/dashboard');
            return;
        }

        const fetchKey = `${user.uid}-${topic}-${level}-${isFactoryQuest}`;
        if (lastFetchKey.current === fetchKey) return;

        lastFetchKey.current = fetchKey;

        fetchData();
    }, [user, topic, level, isFactoryQuest]);

    const fetchData = async () => {
        setLoading(true);
        await Promise.all([
            generatePracticeSession()
        ]);
        setLoading(false);
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (showCheatMenu && !e.target.closest('.cheat-menu-container')) {
                setShowCheatMenu(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [showCheatMenu]);

    const generatePracticeSession = async () => {
        console.log('[MathsLabPage] generatePracticeSession called with:', { topic, level, language, uid: user?.uid });
        // setLoading is handled in fetchData
        setQuestions([]);
        setAnswers({});
        setCurrentIndex(0);

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const res = await fetch(`${API_URL}/api/maths/diagnostic/practice/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid: user?.uid, topic, level: level || 3, language: language || 'en', isFactory: false })
            });

            if (res.ok) {
                let data = await res.json();
                let tasks = [];
                if (Array.isArray(data)) {
                    tasks = data;
                } else if (data.interactive_tasks) {
                    tasks = Array.isArray(data.interactive_tasks) ? data.interactive_tasks : [data.interactive_tasks];
                } else if (data.tasks) {
                    tasks = Array.isArray(data.tasks) ? data.tasks : [data.tasks];
                } else if (data.data && Array.isArray(data.data)) {
                    tasks = data.data;
                }

                if (!tasks || tasks.length === 0) {
                    setError("No questions available for this level/topic yet.");
                    return;
                }

                const isQuest = !!(taskId || isFactoryQuest);

                const formattedTasks = tasks.map((t, idx) => ({
                    ...t,
                    id: t.id || `q_${Date.now()}_${idx}`,
                    // Force short_answer for Quests even if stored as MC
                    type: isQuest ? 'short_answer' : ((t.type || '').includes('mc') ? 'mc' : 'short_answer'),
                    text: t.text || t.question
                }));

                setQuestions(formattedTasks);
            } else {
                let errorMessage = `Server Error: ${res.status}`;
                try {
                    const errorData = await res.json();
                    if (errorData.error || errorData.details) {
                        errorMessage = errorData.details || errorData.error;
                    }
                } catch (e) { }
                setError(errorMessage);
            }
        } catch (error) {
            console.error("Failed to generate practice", error);
            setError(error.message);
        }
    };

    const handleAnswerChange = (val) => {
        const currentQ = questions[currentIndex];
        setAnswers(prev => ({
            ...prev,
            [currentQ.id]: val
        }));
    };

    const handleNext = () => {
        setHints([]);
        setHintIndex(-1);
        setIsDiagramExpanded(false);
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handlePrev = () => {
        setHints([]);
        setHintIndex(-1);
        setIsDiagramExpanded(false);
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const checkForHints = async () => {
        const currentQ = questions[currentIndex];

        // 1. If we already have hints locally and haven't shown them all
        if ((currentQ.hints || currentQ.hints_zh) && (hintIndex < (isChinese ? (currentQ.hints_zh?.length || 0) : (currentQ.hints?.length || 0)) - 1)) {
            const nextIdx = hintIndex + 1;
            setHintIndex(nextIdx);
            return;
        }

        // 2. Fetch from backend if not present or if we need more
        if (!currentQ.hints && !currentQ.hints_zh) {
            setLoadingHint(true);
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                const res = await fetch(`${API_URL}/api/maths/lab/hint`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        question: currentQ.text,
                        question_zh: currentQ.text_zh,
                        topic: topic,
                        level: level,
                        language: isChinese ? 'zh' : 'en'
                    })
                });

                if (res.ok) {
                    const data = await res.json();

                    // Save back to question object to avoid re-fetching
                    const updatedQuestions = [...questions];
                    updatedQuestions[currentIndex] = {
                        ...currentQ,
                        hints: data.hints,
                        hints_zh: data.hints_zh
                    };
                    setQuestions(updatedQuestions);
                    setHintIndex(0);
                }
            } catch (err) {
                console.error("Failed to fetch hint:", err);
            } finally {
                setLoadingHint(false);
            }
        }
    };

    const handleCheat = (cheatLevel) => {
        const cheatAnswers = {};
        questions.forEach(q => {
            const isPerfect = cheatLevel === '5**';
            const isHigh = cheatLevel === '5';
            const isMedium = cheatLevel === '4';
            const isLow = cheatLevel === '3';

            if (q.type === 'mc') {
                cheatAnswers[q.id] = q.answer;
                return;
            }

            // For Short Answer, we vary the solution quality
            let solutionStr = '';
            let finalAns = q.answer || '';

            // CLEANUP: If type is NOT 'mc', strip any "A: ", "B: ", etc prefixes that might have leaked from AI
            if (q.type !== 'mc') {
                finalAns = finalAns.replace(/^[A-D]\s*[:.]\s*/i, '').trim();
            }

            const rawSteps = q.solution_steps || [];

            // Pattern-based fallback for older question bank entries which might have placeholders
            const replacePlaceholders = (text) => {
                if (!text) return '';

                // Heuristic: Extract percentages/numbers if metabolic data is missing
                const qText = isChinese ? (q.text_zh || q.text) : q.text;
                const numbers = qText.match(/\d+(\.\d+)?/g) || [];

                let valD1 = q.d1 || (numbers[0] ? numbers[0] : 'd1');
                let valD2 = q.d2 || (numbers[1] ? numbers[1] : 'd2');
                let valMP = q.marked_price || (numbers.find(n => parseFloat(n) > 100) || 'MP');

                return text
                    .replace(/\bd1\b/g, valD1)
                    .replace(/\bd2\b/g, valD2)
                    .replace(/\bMP\b/g, valMP)
                    .replace(/\bSP\b/g, (q.selling_price || finalAns || 'SP'))
                    .replace(/\bP\b/g, (q.principal || valMP || 'P'))
                    .replace(/\br\b/g, (q.rate || valD1 || 'r'))
                    .replace(/\bt\b/g, (q.years || 't'));
            };

            const steps = rawSteps.map(s => replacePlaceholders(s));

            if (isPerfect) {
                // Perfect Derivation
                if (steps.length > 0) {
                    solutionStr += steps.map((s, i) => s.toLowerCase().startsWith('step') ? s : `Step ${i + 1}: ${s}`).join('\n');
                } else {
                    solutionStr += `Derivation: Use formula and plug in values correctly.`;
                }
                solutionStr += `\n\nFinal Answer: ${finalAns}`;
            } else if (isHigh) {
                // Good but less formal
                solutionStr = `Solution:\n`;
                solutionStr += steps.slice(0, Math.max(1, steps.length - 1)).join('\n');
                solutionStr += `\nFinal result is ${finalAns}`;
            } else if (isMedium) {
                // Missing steps or slight rounding difference
                solutionStr = `Answer: ${finalAns}\n(Reasoning: Multiplied the values and rounded up.)`;
            } else {
                // Level 3: Deliberate "Trap" or "Mistake" for testing grader
                // e.g. Add 10 to the answer or use a simple interest formula for compound
                let flawedAns = finalAns;
                try {
                    const num = parseFloat(finalAns.replace(/[^\d.-]/g, ''));
                    if (!isNaN(num)) flawedAns = `${(num + 5).toFixed(1)}${finalAns.includes('%') ? '%' : ''}`;
                } catch (e) { }

                solutionStr = ``;
                solutionStr += `Reasoning: Added the percentages directly: ${finalAns} + bias.\n`;
                solutionStr += `Result: ${flawedAns}`;
            }

            cheatAnswers[q.id] = solutionStr;
        });
        setAnswers(cheatAnswers);
        setShowCheatMenu(false);
        //alert(`Cheat activated! Test profile loaded for Level ${cheatLevel}`);
    };

    const handleSubmitAll = async () => {
        const unanswered = questions.filter(q => {
            const hasText = answers[q.id] && answers[q.id].trim() !== '';
            const hasImage = !!imageAnswers[q.id];
            return !hasText && !hasImage;
        });
        if (unanswered.length > 0) {
            const confirmed = window.confirm(
                `You have ${unanswered.length} unanswered question(s). Do you want to submit anyway?`
            );
            if (!confirmed) return;
        }
        navigate('/maths-lab-review', {
            state: { questions, answers, imageAnswers, topic, level, taskId, title, xp: potentialXP, isFactoryQuest }
        });
    };

    const renderQuestionText = (text, question = {}) => {
        if (!text) return null;

        // 1. Extract and Hide [DIAGRAM REQUIRED: ...] and [TABLE REQUIRED: ...] tags
        const diagramMatch = text.match(/\[DIAGRAM REQUIRED:([\s\S]*?)\]/);
        const tableMatch = text.match(/\[TABLE REQUIRED:([\s\S]*?)\]/);
        const description = (diagramMatch ? diagramMatch[1] : (tableMatch ? tableMatch[1] : '')).trim();

        const safeText = typeof text === 'string' ? text : (typeof text === 'number' ? String(text) : (Array.isArray(text) ? text.join('\n') : String(text || '')));

        const displaySubtext = safeText
            .replace(/\[DIAGRAM REQUIRED:[\s\S]*?\]/g, '')
            .replace(/\[TABLE REQUIRED:[\s\S]*?\]/g, '')
            .trim();

        const cleanText = prepareMathText(displaySubtext);
        const parts = splitContentByDelimiters(cleanText);

        const hasVisual = !!(
            question?.diagram_url ||
            (question?.diagram_json && Object.keys(question.diagram_json).length > 0) ||
            question?.diagram_svg
        );

        return (
            <div className={`flex flex-col ${hasVisual && !isDiagramExpanded ? 'lg:flex-row' : ''} gap-8 items-start`}>
                <div className={`flex-1 text-gray-800 leading-relaxed font-sans w-full ${hasVisual && !isDiagramExpanded ? 'lg:max-w-[75%]' : ''}`}>
                    {parts.map((part, i) => {
                        if (!part) return null;

                        const isBlock = (part.startsWith('\\[') && part.endsWith('\\]')) || (part.startsWith('$$') && part.endsWith('$$'));
                        const isInline = (part.startsWith('\\(') && part.endsWith('\\)')) || (part.startsWith('$') && part.endsWith('$'));

                        if (isBlock || isInline) {
                            let math = '';
                            if (part.startsWith('\\[') || part.startsWith('\\(')) math = part.slice(2, -2);
                            else if (part.startsWith('$$')) math = part.slice(2, -2);
                            else math = part.slice(1, -1);

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
                                        const labeledMath = sanitizeMath(trimmedLine);
                                        const finalMath = formatNumbers(labeledMath, true);

                                        return (
                                            <React.Fragment key={lineIdx}>
                                                {(lineIdx > 0 || isStepLine) && <br />}
                                                <SafeInlineMath key={lineIdx} math={finalMath} className="mx-1" />
                                            </React.Fragment>
                                        );
                                    } else {
                                        const formattedLine = formatNumbers(trimmedLine);
                                        const content = formattedLine
                                            .replace(/___HKD___/g, 'HK$')
                                            .replace(/___USD___/g, '$')
                                            .replace(/\\,/g, ' ');

                                        return (
                                            <React.Fragment key={lineIdx}>
                                                {(lineIdx > 0 || isStepLine) && <br />}
                                                <span className="whitespace-pre-wrap">{content}</span>
                                            </React.Fragment>
                                        );
                                    }
                                })}
                            </span>
                        );
                    })}
                </div>

                {/* Diagram Section */}
                {topic !== 'math_alg_apgp' && hasVisual && (
                    <div className={`flex flex-col items-center ${isDiagramExpanded ? 'w-full my-8' : 'w-full lg:w-[245px] shrink-0'}`}>
                        <div className={`relative w-full p-4 bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-400 shadow-inner overflow-hidden transition-all duration-300 ${isDiagramExpanded ? 'min-h-[400px]' : 'aspect-square'}`}>
                            {/* Overlay Enlarge Icon */}
                            <button
                                onClick={() => setIsDiagramExpanded(!isDiagramExpanded)}
                                className="absolute top-3 right-3 z-10 p-2 bg-white/60 backdrop-blur-md rounded-xl border border-white/40 shadow-sm text-slate-600 hover:text-purple-600 hover:bg-white transition-all scale-75 hover:scale-90"
                            >
                                {isDiagramExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                            </button>

                            {question?.diagram_url ? (
                                <div className="w-full h-full bg-white rounded-2xl p-4 shadow-lg border border-slate-200 flex flex-col items-center justify-center">
                                    <img
                                        src={`${import.meta.env.VITE_API_URL}/${question.diagram_url}`}
                                        alt="Mathematical Graph"
                                        className="max-w-full max-h-full object-contain rounded-lg"
                                    />
                                    {description && isDiagramExpanded && <p className="text-xs text-slate-600 italic text-center mt-4">{description}</p>}
                                </div>
                            ) : question?.diagram_json ? (
                                <div className="w-full h-full bg-white rounded-2xl p-4 shadow-lg border border-slate-200 flex flex-col items-center justify-center">
                                    <GeometryRenderer data={question.diagram_json} />
                                    {description && isDiagramExpanded && <p className="text-xs text-slate-600 italic text-center mt-4">{description}</p>}
                                </div>
                            ) : question?.diagram_svg ? (
                                <div className="w-full h-full bg-white rounded-2xl p-4 shadow-lg border border-slate-200 flex flex-col items-center justify-center">
                                    <div className="w-full h-full flex items-center justify-center" dangerouslySetInnerHTML={{ __html: question.diagram_svg }} />
                                    {description && isDiagramExpanded && <p className="text-xs text-slate-600 italic text-center mt-4">{description}</p>}
                                </div>
                            ) : (
                                <>
                                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 text-indigo-500/40">
                                        {text.includes('[TABLE') ? <i className="fas fa-table text-2xl"></i> : <i className="fas fa-chart-area text-2xl"></i>}
                                    </div>
                                    <h3 className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2 text-center">{text.includes('[TABLE') ? 'Statistical Data' : 'Geometric Visualization'}</h3>
                                    {description && <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-slate-200 text-slate-700 w-full shadow-sm text-center text-xs line-clamp-3">"{description}"</div>}
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    if (loading) return <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div><h2 className="text-xl font-bold text-slate-700">Generating Practice Set...</h2><p className="text-slate-500">Preparing questions for {getMathSkillName(topic, language)}</p></div>;

    // Explicitly handle empty state to prevent infinite blank screen
    if (!loading && !error && questions.length === 0) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
                <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-md w-full border-2 border-slate-50">
                    <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="w-10 h-10 text-amber-500" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 mb-2">No Questions Generated</h2>
                    <p className="text-slate-500 mb-8">
                        The AI could not generate questions for this topic and level at this time.
                    </p>
                    <button onClick={fetchData} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-opacity-90 transition-all flex items-center justify-center gap-2 mb-3">
                        <RotateCcw className="w-4 h-4" /> Try Again
                    </button>
                    <button onClick={() => navigate('/dashboard')} className="w-full py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-opacity-90 transition-all">
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (error) {
        const isComingSoon = error.includes('QUEST_BANK_EMPTY') || error.includes('No questions available');
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
                <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-md w-full border-2 border-slate-50">
                    <div className={`w-20 h-20 ${isComingSoon ? 'bg-indigo-100' : 'bg-red-100'} rounded-full flex items-center justify-center mx-auto mb-6`}>
                        {isComingSoon ? <RotateCcw className="w-10 h-10 text-indigo-500" /> : <AlertCircle className="w-10 h-10 text-red-500" />}
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 mb-2">
                        {isComingSoon ? "Quest Coming Soon" : "Oops! Something went wrong"}
                    </h2>
                    <p className="text-slate-500 mb-8">
                        {isComingSoon
                            ? "We are currently manufacturing fresh math quest content for this micro-skill. Please check out later!"
                            : error}
                    </p>
                    <button
                        onClick={fetchData}
                        className={`w-full py-3 ${isComingSoon ? 'bg-slate-100 text-slate-600' : 'bg-indigo-600 text-white'} rounded-xl font-bold hover:bg-opacity-90 transition-all flex items-center justify-center gap-2 mb-3`}
                    >
                        <RotateCcw className="w-4 h-4" /> Try Again
                    </button>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className={`w-full py-3 ${isComingSoon ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'} rounded-xl font-bold hover:bg-opacity-90 transition-all`}
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }


    if (!questions[currentIndex]) return <div className="p-10 text-center">No questions available.</div>;

    const currentQ = questions[currentIndex];
    const currentAns = answers[currentQ.id] || '';
    const progress = ((currentIndex + 1) / questions.length) * 100;
    const isLastQuestion = currentIndex === questions.length - 1;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <header className="fixed top-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-md border-b border-gray-200 z-50 px-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/dashboard')} className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center"><X className="w-5 h-5 text-slate-600" /></button>
                    <div>
                        <h1 className="text-lg font-black text-slate-900">{getMathSkillName(topic, language)}</h1>
                        <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${tier.color} bg-white border border-current`}>{tier.displayName}</span>
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-wider">Practice Lab • {potentialXP} XP Potential</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-slate-600 hidden md:inline">Question {currentIndex + 1} of {questions.length}</span>
                    <div className="relative cheat-menu-container">
                        <button onClick={() => setShowCheatMenu(!showCheatMenu)} className="px-4 py-2 rounded-lg bg-amber-100 text-amber-700 text-xs font-bold flex items-center gap-1">Cheat <ChevronDown className="w-3 h-3" /></button>
                        {showCheatMenu && <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border py-2 z-50">{[3, 4, 5, '5*', '5**'].map((lvl) => <button key={lvl} onClick={() => handleCheat(lvl)} className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 transition-colors">Level {lvl}</button>)}</div>}
                    </div>
                    <button onClick={handleSubmitAll} className="px-6 py-2 rounded-lg bg-purple-600 text-white text-sm font-bold shadow-md">Submit All</button>
                </div>
            </header>
            <div className="fixed top-16 left-0 right-0 h-1 bg-gray-200 z-40"><div className="h-full bg-purple-600 transition-all duration-500" style={{ width: `${progress}%` }}></div></div>
            <main className="flex-1 pt-20 px-0 pb-24">
                <div className="max-w-6xl mx-auto h-full flex flex-col gap-6">
                    <div className="bg-white p-4 md:p-8 rounded-xl shadow-none border-0 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-3">
                                <div className="text-xs font-bold text-purple-600 uppercase">Topic: {currentQ.topic || getMathSkillName(topic, language)}</div>
                                <button
                                    onClick={() => setShowChinese(!showChinese)}
                                    className={`px-2 py-1 rounded-md border text-[10px] font-black transition-all flex items-center gap-1 ${showChinese
                                        ? 'bg-purple-600 border-purple-600 text-white shadow-sm'
                                        : 'bg-white border-slate-200 text-slate-400 hover:border-purple-300 hover:text-purple-600'
                                        }`}
                                >
                                    {showChinese ? 'ZH' : 'EN'}
                                </button>
                            </div>
                            <div className="flex items-center gap-2">
                                {currentQ.type === 'short_answer' && (
                                    <button
                                        onClick={checkForHints}
                                        disabled={loadingHint || (hintIndex >= (isChinese ? (currentQ.hints_zh?.length || 0) : (currentQ.hints?.length || 0)) - 1)}
                                        className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full transition-all flex items-center gap-1 ${loadingHint
                                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                            : (hintIndex >= (isChinese ? (currentQ.hints_zh?.length || 0) : (currentQ.hints?.length || 0)) - 1)
                                                ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                                                : 'bg-amber-100 text-amber-700 hover:bg-amber-200'}`}
                                    >
                                        <Lightbulb size={10} className={loadingHint ? 'animate-pulse' : ''} />
                                        {loadingHint ? 'Loading Hints...' : (hintIndex === -1 ? 'Check for Hints' : `Show Next Hint (${hintIndex + 1}/${isChinese ? (currentQ.hints_zh?.length || 0) : (currentQ.hints?.length || 0)})`)}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Progressive Hints Display */}
                        {hintIndex !== -1 && (currentQ.hints || currentQ.hints_zh) && (
                            <div className="mb-6 space-y-3">
                                {[...Array(hintIndex + 1)].map((_, idx) => {
                                    const h = isChinese ? (currentQ.hints_zh?.[idx] || currentQ.hints?.[idx]) : (currentQ.hints?.[idx] || currentQ.hints_zh?.[idx]);
                                    if (!h) return null;
                                    return (
                                        <div key={idx} className="p-4 rounded-xl border bg-amber-50/50 border-amber-100 text-amber-900 animate-in fade-in slide-in-from-top-2 duration-300 flex gap-3">
                                            <div className="shrink-0 mt-0.5 text-amber-500">
                                                <Lightbulb size={16} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-[10px] uppercase tracking-wider mb-1 text-amber-600/80">Hint {idx + 1}</div>
                                                <div className="text-sm leading-relaxed">{h}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        <div className="text-lg text-gray-800 font-medium whitespace-pre-wrap">
                            {renderQuestionText(isChinese ? (currentQ.text_zh || currentQ.text) : currentQ.text, currentQ)}
                        </div>
                    </div>

                    <div className="flex-1">
                        {currentQ.type === 'mc' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {currentQ.options?.map((opt, i) => {
                                    const cleanOpt = (typeof opt === 'string' ? opt : String(opt || '')).replace(/^[A-D]\s*[:.]\s*/i, '').trim();
                                    return (
                                        <button key={i} onClick={() => handleAnswerChange(opt)} className={`p-6 text-left rounded-xl border-2 transition-all ${currentAns === opt ? 'border-purple-600 bg-purple-50 ring-1 ring-purple-600' : 'border-gray-200 hover:bg-gray-50'}`}>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${currentAns === opt ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'}`}>{String.fromCharCode(65 + i)}</div>
                                                <div className="flex-1">
                                                    {renderQuestionText(isChinese ? (currentQ.options_zh?.[i] || cleanOpt) : cleanOpt)}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="bg-slate-50 px-4 py-2 text-[10px] text-slate-500 font-black font-bold uppercase tracking-widest border-b">
                                        Show your steps below (LaTeX supported)
                                    </div>
                                    <MathInput id={`math-input-${currentQ.id}`} value={currentAns} onChange={handleAnswerChange} placeholder="Start typing your solution... (e.g. x^2 + 2x...)" />
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                        <div className="w-full border-t border-slate-200"></div>
                                    </div>
                                    <div className="relative flex justify-center">
                                        <span className="bg-slate-50 px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Or</span>
                                    </div>
                                </div>
                                <ImageUploadInput
                                    questionId={currentQ.id}
                                    uid={user?.uid}
                                    existingUrl={imageAnswers[currentQ.id] || null}
                                    onUpload={(url) => setImageAnswers(prev => ({ ...prev, [currentQ.id]: url }))}
                                    onRemove={() => setImageAnswers(prev => { const copy = { ...prev }; delete copy[currentQ.id]; return copy; })}
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex justify-between items-center pt-4">
                        <button onClick={handlePrev} disabled={currentIndex === 0} className={`px-6 py-3 rounded-full font-semibold flex items-center gap-2 ${currentIndex === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700'}`}><ArrowLeft className="w-4 h-4" /> Previous</button>
                        {isLastQuestion ? (
                            <button onClick={handleSubmitAll} className="px-8 py-3 rounded-full font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg flex items-center gap-2">Submit All <CheckCircle className="w-4 h-4" /></button>
                        ) : (
                            <button onClick={handleNext} className="px-6 py-3 rounded-full font-semibold bg-purple-600 text-white flex items-center gap-2">Next <ArrowRight className="w-4 h-4" /></button>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default MathsLabPage;
