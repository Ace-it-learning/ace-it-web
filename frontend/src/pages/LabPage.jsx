import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { X, BookOpen, Layers, CheckCircle2, ChevronRight, MessageSquare, Award, Sparkles, Loader2, Volume2, Mic, Play, MousePointerClick, Square } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getSkillName } from '../constants/microSkills';
import { addToNotebook } from '../services/notebookService';

// --- Dictionary Popover Component ---
const DictionaryPopover = ({ data, position, onClose, onAddToNotebook, loading }) => {
    if (!position) return null;

    return (
        <div
            className="dictionary-popover fixed z-[70] bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 w-72 animate-in fade-in zoom-in duration-200 text-left"
            style={{ top: position.top + 10, left: position.left }}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 capitalize">{data?.term || "Dictionary"}</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">✕</button>
            </div>

            {loading ? (
                <div className="space-y-2 animate-pulse">
                    <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
            ) : data?.error ? (
                <div className="text-red-500 text-sm py-2">
                    <p className="font-bold">⚠️ Error</p>
                    <p>{data.error}</p>
                </div>
            ) : (
                <div className="space-y-3">
                    <div>
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{data.type}</span>
                        <p className="text-gray-800 dark:text-gray-200 font-medium">{data.definition}</p>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg text-blue-900 dark:text-blue-300 text-sm">
                        <span className="font-bold">繁：</span> {data.translation}
                    </div>

                    {data.example && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 italic">"{data.example}"</p>
                    )}

                    <button
                        onClick={() => onAddToNotebook(data)}
                        className="w-full bg-orange-500 text-white py-2 rounded-lg text-sm font-bold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 mt-2 shadow-sm"
                    >
                        <span>📓</span> Add to Notebook
                    </button>
                </div>
            )}
        </div>
    );
};

const LabPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const topic = searchParams.get('topic');
    const focus = searchParams.getAll('focus');
    const initialLevel = searchParams.get('level') || '3'; // Default to 3 if not specified
    const location = useLocation(); // Add useLocation for state access
    console.log("LabPage: Location State", location.state);

    const [currentLevel, setCurrentLevel] = useState(() => {
        // 3-Tier Normalization Logic
        const lvlStr = String(initialLevel);
        if (lvlStr.includes('5**') || lvlStr.startsWith('7') || lvlStr.startsWith('6')) return '7';
        if (lvlStr.includes('5') || lvlStr.startsWith('5') || lvlStr.startsWith('4')) return '5';
        return '3'; // Default/Fallback to 3
    });

    const [loading, setLoading] = useState(true);
    const [lessonData, setLessonData] = useState(null);
    const [step, setStep] = useState('EXPLORE'); // EXPLORE, PRACTICE, SUCCESS
    const [userAnswers, setUserAnswers] = useState({}); // id -> string
    const [feedbacks, setFeedbacks] = useState({}); // id -> { correct: bool, logic: string }
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isPlaying, setIsPlaying] = useState(null); // qId being played
    const [isListening, setIsListening] = useState(null); // qId being recorded
    const [genError, setGenError] = useState(null); // Capture specific generation errors
    const [evalError, setEvalError] = useState(null); // Capture evaluation errors
    const [hasErrors, setHasErrors] = useState(false); // Track if current attempt has errors
    const [earnedXp, setEarnedXp] = useState(0);
    const [masteryScore, setMasteryScore] = useState(0);

    // Dictionary State
    const [popover, setPopover] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    // Audio Helpers
    const playAudio = (text, id) => {
        if (isPlaying === id) {
            window.speechSynthesis.cancel();
            setIsPlaying(null);
            return;
        }

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-GB';
        utterance.rate = 0.9;
        utterance.onstart = () => setIsPlaying(id);
        utterance.onend = () => setIsPlaying(null);
        window.speechSynthesis.speak(utterance);
    };

    const startVoiceCapture = (id) => {
        if (!('webkitSpeechRecognition' in window)) {
            alert("Speech recognition not supported in this browser.");
            return;
        }

        const recognition = new window.webkitSpeechRecognition();
        recognition.lang = 'en-US';
        recognition.onstart = () => setIsListening(id);
        recognition.onend = () => setIsListening(null);
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            handleAnswerChange(id, transcript);
        };
        recognition.start();
    };

    useEffect(() => {
        // Sync currentLevel with URL param if it changes (e.g. from Roadmap navigation or dropdown)
        const urlLevel = searchParams.get('level');
        if (urlLevel) {
            let normalized = '3';
            const lvlStr = String(urlLevel);
            if (lvlStr.includes('5**') || lvlStr.startsWith('7') || lvlStr.startsWith('6')) normalized = '7';
            else if (lvlStr.includes('5') || lvlStr.startsWith('5') || lvlStr.startsWith('4')) normalized = '5';

            if (normalized !== currentLevel) {
                setCurrentLevel(normalized);
                setStep('EXPLORE'); // Force back to briefing
                setLessonData(null); // Clear old data to show loading properly
                setUserAnswers({}); // Clear answers
                setFeedbacks({}); // Clear feedbacks
                setLoading(true); // Trigger loading UI
            }
        }
    }, [searchParams, currentLevel]);

    useEffect(() => {
        const fetchLesson = async () => {
            if (!topic) {
                navigate('/dashboard');
                return;
            }

            setGenError(null);
            setLoading(true);

            // Retry Logic for Frontend
            let attempts = 0;
            const maxAttempts = 3;

            while (attempts < maxAttempts) {
                try {
                    attempts++;
                    const response = await fetch(`${API_URL}/api/lab/generate`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            topic,
                            focus,
                            level: `HKDSE Level ${currentLevel}`,
                            uid: user?.uid || 'placeholder'
                        })
                    });

                    if (!response.ok) {
                        // If 504 or 429, we might want to retry explicitly, or just throw to catch block
                        const errorData = await response.json();
                        throw new Error(errorData.error || `Server error: ${response.status}`);
                    }

                    const data = await response.json();
                    setLessonData(data);

                    // Initialize answers
                    const initialAnswers = {};
                    if (data.interactive_tasks && data.interactive_tasks.length > 0) {
                        data.interactive_tasks.forEach(t => initialAnswers[t.id] = '');
                    } else if (data.interactive_task) {
                        const taskId = 'q1';
                        initialAnswers[taskId] = '';
                        data.interactive_tasks = [{ ...data.interactive_task, id: taskId }];
                    }
                    setUserAnswers(initialAnswers);
                    setLoading(false);
                    return; // Success!

                } catch (err) {
                    console.warn(`Attempt ${attempts} failed:`, err);
                    if (attempts >= maxAttempts) {
                        console.error("Lab Error (Final):", err);
                        setGenError(err.message);
                        setLoading(false);
                    } else {
                        // Wait before retry (2s, 4s...)
                        await new Promise(r => setTimeout(r, 2000 * attempts));
                    }
                }
            }
        };

        fetchLesson();
    }, [topic, currentLevel]); // Re-fetch when level changes

    const handleCheat = async (targetLevel) => {
        setIsSubmitting(true);
        try {
            const res = await fetch(`${API_URL}/api/lab/cheat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tasks: lessonData.interactive_tasks,
                    level: targetLevel,
                    uid: user?.uid,
                    passage: lessonData.reading_passage
                })
            });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Cheat failed");
            }
            const cheatedAnswers = await res.json();
            if (Object.keys(cheatedAnswers).length === 0) {
                alert("Cheat generated no answers. This can happen if the AI times out. Try again?");
            }
            setUserAnswers(prev => ({ ...prev, ...cheatedAnswers }));
        } catch (e) {
            console.error("Cheat Error:", e);
            alert(`Cheat failed: ${e.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAnswerChange = (id, value) => {
        setUserAnswers(prev => ({ ...prev, [id]: value }));
        if (feedbacks[id]) {
            const newFeedbacks = { ...feedbacks };
            delete newFeedbacks[id];
            setFeedbacks(newFeedbacks);
        }
    };

    const handleSubmitMission = async () => {
        setIsSubmitting(true);
        setEvalError(null);
        setHasErrors(false);

        try {
            // AI Powered Evaluation
            const res = await fetch(`${API_URL}/api/lab/evaluate_batch`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tasks: lessonData.interactive_tasks,
                    answers: userAnswers,
                    uid: user?.uid || 'placeholder',
                    category: lessonData.type
                })
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Evaluation failed");
            }
            const aiFeedbacks = await res.json();

            setFeedbacks(aiFeedbacks);

            // Calculate Performance
            const results = {};
            let correctCount = 0;
            const totalCount = lessonData.interactive_tasks.length;

            lessonData.interactive_tasks.forEach(t => {
                const f = aiFeedbacks[t.id];
                const isCorrect = f && f.correct === true;
                results[t.id] = isCorrect;
                if (isCorrect) correctCount++;
            });

            const taskXp = location.state?.taskXp || 50;
            const calculatedXp = Math.floor((correctCount / totalCount) * taskXp);
            setEarnedXp(calculatedXp);

            const calculatedMasteryScore = Math.floor((correctCount / totalCount) * 100);
            setMasteryScore(calculatedMasteryScore);

            // Collect Mistakes
            const mistakes = lessonData.interactive_tasks
                .filter(t => results[t.id] === false)
                .map(t => ({
                    question: t.question,
                    userAnswer: userAnswers[t.id],
                    feedback: aiFeedbacks[t.id]?.feedback || t.answer_logic,
                    topic: topic,
                    level: currentLevel,
                    incorrect: true
                }));

            // Persist results
            const submitRes = await fetch(`${API_URL}/api/lab/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    uid: user?.uid || 'placeholder',
                    results,
                    xp: calculatedXp,
                    masteryScore: calculatedMasteryScore,
                    topic: lessonData.topic || 'Learning Lab',
                    mistakes // Send detected mistakes
                })
            });
            if (!submitRes.ok) throw new Error("Failed to save mission progress");

            // Mark Roadmap Task as Completed (if launched from Roadmap)
            if (location.state?.taskId) {
                try {
                    await fetch(`${API_URL}/api/roadmap/complete`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            uid: user?.uid,
                            taskId: location.state.taskId
                        })
                    });
                } catch (err) {
                    console.error("Failed to complete roadmap task:", err);
                }
            }

            setStep('SUCCESS');
        } catch (e) {
            console.error("Evaluation Error:", e);
            setEvalError(e.message);
            window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top to see error if it's there? No, better toast or fixed bar.
        } finally {
            setIsSubmitting(false);
        }
    };

    // Dictionary Logic
    const handleTextClick = async (e) => {
        // Only trigger in Practice mode
        if (step !== 'PRACTICE' && step !== 'SUCCESS') return;

        e.preventDefault();
        e.stopPropagation();

        let text = "";
        const selection = window.getSelection();
        const selectedText = selection.toString().trim();

        if (selectedText.length > 0) {
            text = selectedText;
        } else if (document.caretRangeFromPoint) {
            const range = document.caretRangeFromPoint(e.clientX, e.clientY);
            if (range && range.startContainer.nodeType === Node.TEXT_NODE) {
                range.expand('word');
                text = range.toString().trim();
            }
        }

        // Validate: Must contain at least one letter and not be too long
        if (!text || text.split(' ').length > 4 || !/[a-zA-Z]/.test(text)) return;

        // Position Logic (Fixed for fixed positioning context or scrolling)
        // usage of e.clientX/Y is safer for fixed, but we want relative to word? 
        // Actually for fixed popover, clientX/Y is good.

        setPopover({
            position: { top: e.clientY, left: e.clientX }, // Simple mouse position based
            term: text,
            loading: true,
            data: null
        });

        try {
            const res = await fetch(`${API_URL}/api/dictionary`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text,
                    context: selection.anchorNode?.textContent?.substring(0, 100) || ""
                })
            });
            const data = await res.json();

            setPopover(prev => ({
                ...prev,
                loading: false,
                data: { ...data, term: text }
            }));
        } catch (error) {
            setPopover(prev => ({
                ...prev,
                loading: false,
                data: { term: text, error: "Could not retrieve definition." }
            }));
        }
    };

    const handleAddToNotebook = async (dictData) => {
        if (!user) {
            alert("🔒 Please log in to save words to your notebook.");
            return;
        }
        if (dictData) {
            try {
                await addToNotebook(user.uid, {
                    term: dictData.term,
                    note: `${dictData.definition} (${dictData.translation})`,
                    context: `Lab: ${getSkillName(topic)}`,
                    type: 'vocabulary',
                    source: 'Learning Lab',
                    examId: 'lab-session'
                });
                alert("✅ Saved to Notebook!");
                setPopover(null);
            } catch (err) {
                alert("Failed to save.");
            }
        }
    };

    const handleClose = () => {
        // If success step reached, pass completion flag
        if (step === 'SUCCESS') {
            navigate('/', { state: { labCompleted: true, topic, level: currentLevel } });
        } else {
            navigate('/');
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white dark:bg-gray-950">
                <div className="flex flex-col items-center max-w-sm text-center px-6">
                    <div className="relative size-24 mb-8">
                        <div className="absolute inset-0 bg-indigo-500 rounded-full animate-ping opacity-20"></div>
                        <div className="relative size-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-xl">
                            <Loader2 size={40} className="text-white animate-spin" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-black dark:text-white mb-2">Generating Learning Lab</h3>
                    <p className="text-gray-500 dark:text-gray-400">Curating a personalized mission... (This might take around 1 minute for fresh content generation)</p>
                </div>
            </div>
        );
    }

    if (!lessonData && !loading) {
        return (
            <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col items-center justify-center p-6 text-center">
                <div className="size-20 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-full flex items-center justify-center mb-6">
                    <X size={40} />
                </div>
                <h2 className="text-3xl font-black dark:text-white mb-2">Generation Failed</h2>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mb-4">
                    Miss Janie encountered an issue creating this mission. The AI might be busy or the topic is too complex.
                </p>
                {genError && (
                    <div className="mb-8 p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl text-xs font-mono text-red-600 dark:text-red-400 max-w-md break-words">
                        Error Details: {genError}
                    </div>
                )}
                <button
                    onClick={() => window.location.reload()}
                    className="px-8 py-3 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 transition-colors shadow-lg"
                >
                    Try Again
                </button>
                <button
                    onClick={() => navigate('/')}
                    className="mt-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 font-bold"
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }

    const displayTopic = getSkillName(topic);

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col animate-in fade-in duration-300">


            {/* Dictionary Popover Overlay */}
            {popover && (
                <>
                    <div className="fixed inset-0 z-[60]" onClick={() => setPopover(null)} />
                    <DictionaryPopover
                        data={popover.data}
                        position={popover.position}
                        loading={popover.loading}
                        onClose={() => setPopover(null)}
                        onAddToNotebook={handleAddToNotebook}
                    />
                </>
            )}

            {/* Immersive Standalone Header */}
            <header className="sticky top-0 flex-none flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md z-20">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-indigo-600 rounded-lg text-white">
                        <Layers size={18} />
                    </div>
                    <div>
                        <h2 className="text-sm md:text-base font-black dark:text-white tracking-wider">
                            {lessonData?.type ? `${lessonData.type.charAt(0) + lessonData.type.slice(1).toLowerCase()} - ` : ''}{displayTopic}
                        </h2>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-gray-400">Mission Type: </span>
                            <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                                Comprehensive Practice
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {user?.email === 'fungtam@gmail.com' && (
                        <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 p-1 rounded-lg border border-amber-200">
                            <span className="text-[10px] font-black text-amber-600 px-1">DEBUG CHEAT:</span>
                            {['3', '4', '5', '5*', '5**'].map(lvl => (
                                <button
                                    key={lvl}
                                    onClick={() => handleCheat(lvl)}
                                    disabled={isSubmitting}
                                    className="text-[10px] font-bold px-2 py-0.5 hover:bg-amber-200 dark:hover:bg-amber-800 rounded transition-colors dark:text-amber-400"
                                >
                                    {lvl}
                                </button>
                            ))}
                        </div>
                    )}
                    Live Training Session
                </div>

                {/* Difficulty Selector */}
                <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 rounded-lg p-1 border border-gray-100 dark:border-gray-800">
                    <span className="text-[10px] font-bold text-gray-400 pl-2 uppercase tracking-wide">Level</span>
                    <select
                        value={currentLevel}
                        onChange={(e) => {
                            // NEW: Sync to URL instead of just local state
                            const newLevel = e.target.value;
                            const params = new URLSearchParams(window.location.search);
                            params.set('level', newLevel);
                            navigate(`${window.location.pathname}?${params.toString()}`, { replace: true });
                        }}
                        className="bg-white dark:bg-gray-800 text-sm font-bold text-gray-700 dark:text-gray-200 py-1 px-2 rounded-md outline-none border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-indigo-500 transition-colors"
                    >
                        <option value="3">Foundation Building</option>
                        <option value="5">DSE Standard</option>
                        <option value="7">Elite Challenge</option>
                    </select>
                </div>

                <button
                    onClick={handleClose}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all group"
                    title="Exit Lab"
                >
                    <X size={20} className="text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
                </button>
            </header>

            {/* Immersive Scroll Content */}
            <main className="flex-1 bg-gray-50/50 dark:bg-transparent select-none">
                <div className="max-w-6xl mx-auto px-6 py-10 md:py-20 font-sans">

                    {step === 'EXPLORE' && (
                        <div className="space-y-16 animate-in slide-in-from-bottom-8 duration-700">
                            {/* Hero Intro */}
                            <div className="space-y-6">
                                <span className="inline-block px-4 py-1.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-black uppercase tracking-[0.2em] rounded-full">
                                    Conceptual Briefing
                                </span>
                                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                                    <h1 className="text-5xl md:text-7xl font-black tracking-tight text-gray-900 dark:text-white max-w-4xl leading-[1.1]">
                                        Mastering {displayTopic}
                                    </h1>
                                    <div className="flex flex-col items-center justify-center p-6 bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-[2.5rem] shadow-sm transform hover:rotate-3 transition-transform">
                                        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                                            <Award size={32} className="fill-current" />
                                            <span className="text-4xl font-black">+{location.state?.taskXp || 100}</span>
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 mt-1">XP Points</span>
                                    </div>
                                </div>
                                <p className="text-xl md:text-2xl text-gray-500 dark:text-gray-400 max-w-2xl font-medium">
                                    We've broken down the mechanics. Level up your HKDSE proficiency with this personalized deep dive.
                                </p>
                            </div>

                            {/* Main Lesson Block */}
                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
                                <div className="xl:col-span-2 space-y-12">
                                    <section className="bg-white dark:bg-gray-900 p-8 md:p-14 rounded-[3rem] shadow-sm border border-gray-100 dark:border-gray-800">
                                        <div className="prose prose-xl prose-indigo dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                                            {lessonData.conceptual_explanation}
                                        </div>

                                        <div className="mt-12 space-y-4">
                                            <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest px-2">Key Competencies</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {lessonData.key_points.map((pt, idx) => (
                                                    <div key={idx} className="flex items-center gap-4 p-5 bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700 rounded-2xl">
                                                        <div className="size-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                                                            <CheckCircle2 size={18} className="text-green-600 dark:text-green-500" />
                                                        </div>
                                                        <span className="text-base font-bold dark:text-white">{pt}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </section>
                                </div>

                                <div className="space-y-6">
                                    {/* Quest Task Panel */}
                                    {location.state?.taskTitle && (
                                        <div className="p-6 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-[2rem] text-white shadow-xl animate-in slide-in-from-right-8 duration-700 mb-8">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="p-2 bg-white/20 rounded-xl">
                                                    <Award size={24} />
                                                </div>
                                                <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider">
                                                    +{location.state.taskXp || 50} XP
                                                </span>
                                            </div>
                                            <h3 className="text-xl font-bold mb-2 leading-tight">
                                                {location.state.taskTitle}
                                            </h3>
                                            <p className="text-indigo-100 text-sm opacity-90">
                                                {location.state.taskDescription}
                                            </p>
                                        </div>
                                    )}

                                    <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                                        <Sparkles className="text-indigo-500" size={24} />
                                        Case Studies
                                    </h3>
                                    {lessonData.examples.map((ex, idx) => (
                                        <div key={idx} className="p-8 bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm group hover:border-indigo-300 transition-all duration-300">
                                            <p className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 italic leading-relaxed">
                                                "{ex.text}"
                                            </p>
                                            <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
                                                {ex.explanation}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-10 flex justify-center sticky bottom-10 z-10">
                                <button
                                    onClick={() => setStep('PRACTICE')}
                                    className="group flex items-center gap-4 px-12 py-6 bg-gray-900 dark:bg-white text-white dark:text-black rounded-full font-black text-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_50px_rgba(255,255,255,0.05)] hover:scale-105 transition-all active:scale-95"
                                >
                                    Proceed to Quest
                                    <div className="p-1.5 bg-white/10 dark:bg-black/5 rounded-full group-hover:translate-x-1 transition-transform">
                                        <ChevronRight size={28} />
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 'PRACTICE' && (
                        <div className={`max-w-[1400px] mx-auto animate-in slide-in-from-right-16 duration-700 ${lessonData.reading_passage ? 'w-full' : 'max-w-4xl'}`}>
                            {/* Minimal Section Spacer instead of bulky header */}
                            <div className="mb-10"></div>

                            <div className={`flex flex-col ${lessonData.reading_passage ? 'lg:flex-row' : ''} gap-8 items-start`}>
                                {/* Reading Passage Context - Left Panel */}
                                {lessonData.reading_passage && (
                                    <div className="w-full lg:w-1/2 sticky top-24 max-h-[calc(100vh-140px)] overflow-y-auto bg-white dark:bg-gray-900 p-8 md:p-12 rounded-[2rem] border-2 border-indigo-100 dark:border-indigo-900/40 shadow-sm custom-scrollbar">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600">
                                                    <Sparkles size={18} />
                                                </div>
                                                <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest">Source Material</h4>
                                            </div>
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 rounded-full text-[10px] font-bold uppercase tracking-wide animate-pulse">
                                                <MousePointerClick size={14} />
                                                <span>Click words to define</span>
                                            </div>
                                        </div>
                                        <div
                                            className="prose prose-xl prose-indigo dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed font-serif italic cursor-text hover:text-gray-900 dark:hover:text-gray-100 transition-colors select-text"
                                            onClick={handleTextClick}
                                        >
                                            {lessonData.reading_passage}
                                        </div>
                                    </div>
                                )}

                                {/* Questions - Right Panel or Main Center */}
                                <div className={`w-full ${lessonData.reading_passage ? 'lg:w-1/2' : 'max-w-4xl mx-auto'} space-y-10 pb-20`}>
                                    {lessonData.interactive_tasks.map((task, idx) => (
                                        <div
                                            key={task.id}
                                            id={`task-${task.id}`}
                                            className={`group bg-white dark:bg-gray-900 p-6 md:p-8 rounded-[2rem] border-2 transition-all duration-300 ${feedbacks[task.id]
                                                ? (feedbacks[task.id].correct ? 'border-green-500 shadow-green-500/5' : 'border-red-500 shadow-red-500/5')
                                                : 'border-transparent shadow-sm'
                                                }`}
                                        >
                                            <div className="flex flex-col md:flex-row gap-6 mb-8">
                                                <div className="size-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 text-xl font-black text-gray-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors uppercase">
                                                    {idx + 1}
                                                </div>
                                                <div className="flex-1 space-y-2">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex-1">
                                                            {lessonData.type === 'SPEAKING' ? (
                                                                <>
                                                                    <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 leading-snug mb-1">
                                                                        {task.question}
                                                                    </h3>
                                                                    <p className="text-sm font-bold text-gray-400 dark:text-gray-500 opacity-80">
                                                                        {task.instruction}
                                                                    </p>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 leading-snug mb-1">
                                                                        {task.instruction}
                                                                    </h3>
                                                                    <p className="text-sm font-bold text-gray-400 dark:text-gray-500 opacity-80">
                                                                        {task.question}
                                                                    </p>
                                                                </>
                                                            )}
                                                        </div>

                                                        {lessonData.type === 'LISTENING' && task.audio_script && (
                                                            <button
                                                                onClick={() => playAudio(task.audio_script, task.id)}
                                                                className={`p-4 rounded-2xl border-2 transition-all ${isPlaying === task.id ? 'bg-indigo-600 text-white border-indigo-600 animate-pulse' : 'bg-white dark:bg-gray-800 text-indigo-600 border-indigo-100 hover:shadow-lg'}`}
                                                            >
                                                                {isPlaying === task.id ? <Square size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="relative">
                                                {task.type === 'MCQ' && task.options ? (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                                                        {task.options.map((opt, oIdx) => (
                                                            <button
                                                                key={oIdx}
                                                                onClick={() => handleAnswerChange(task.id, opt.substring(0, 1))}
                                                                className={`p-4 text-left rounded-xl border-2 transition-all font-bold ${userAnswers[task.id] === opt.substring(0, 1)
                                                                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                                                    : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-indigo-300'
                                                                    }`}
                                                            >
                                                                {opt}
                                                            </button>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <textarea
                                                        value={userAnswers[task.id] || ''}
                                                        onChange={(e) => handleAnswerChange(task.id, e.target.value)}
                                                        placeholder={task.placeholder || (lessonData.type === 'SPEAKING' ? "Click the mic or type your response..." : "Type your answer here...")}
                                                        className={`w-full p-5 pr-16 bg-gray-50 dark:bg-gray-950/50 border-2 rounded-2xl outline-none transition-all text-lg font-medium min-h-[100px] focus:bg-white dark:focus:bg-gray-900 ${feedbacks[task.id]
                                                            ? (feedbacks[task.id].correct ? 'border-green-100 dark:border-green-900/40 text-green-700 dark:text-green-300' : 'border-red-100 dark:border-red-900/40 text-red-700 dark:text-red-300')
                                                            : 'border-gray-100 dark:border-gray-800 focus:border-indigo-500 text-gray-800 dark:text-white'
                                                            }`}
                                                    />
                                                )}

                                                {lessonData.type === 'SPEAKING' && (
                                                    <button
                                                        onClick={() => startVoiceCapture(task.id)}
                                                        className={`absolute bottom-6 right-6 p-4 rounded-2xl transition-all shadow-lg ${isListening === task.id ? 'bg-red-500 text-white animate-pulse' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                                                    >
                                                        <Mic size={24} />
                                                    </button>
                                                )}
                                            </div>

                                            {feedbacks[task.id] && (
                                                <div className={`mt-6 p-6 rounded-2xl border flex items-start gap-4 animate-in slide-in-from-top-4 duration-300 ${feedbacks[task.id].correct
                                                    ? 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800 text-green-700 dark:text-green-400'
                                                    : 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800 text-red-700 dark:text-red-400'
                                                    }`}>
                                                    <div className="mt-1 shrink-0">
                                                        {feedbacks[task.id].correct ? <CheckCircle2 size={24} /> : <div className="text-2xl">💡</div>}
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="font-black uppercase tracking-widest text-[10px]">
                                                            {feedbacks[task.id].correct ? 'Excellent Work' : 'Hint'}
                                                        </p>
                                                        <p className="text-lg font-bold leading-relaxed">{feedbacks[task.id].logic}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Submission Bar (Static at bottom) */}
                            <div className="pt-16 pb-20 flex flex-col items-center gap-4 px-4 w-full">
                                {evalError && (
                                    <div className="w-full max-w-2xl p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-red-600 dark:text-red-400 text-sm font-bold flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
                                        <X size={20} className="shrink-0" />
                                        <span>Evaluation Failed: {evalError}. Please try submitting again.</span>
                                    </div>
                                )}
                                <div className="flex flex-col md:flex-row gap-4 w-full">
                                    <button
                                        onClick={() => setStep('EXPLORE')}
                                        className="flex-1 px-10 py-6 border-2 border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-full font-black text-xl dark:text-white hover:bg-white dark:hover:bg-gray-800 transition-all shadow-xl active:scale-95"
                                    >
                                        Review Briefing
                                    </button>
                                    <button
                                        onClick={handleSubmitMission}
                                        disabled={isSubmitting || Object.values(userAnswers).some(a => !a.trim())}
                                        className="flex-[2] py-6 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-full font-black text-2xl shadow-[0_20px_50px_rgba(79,70,229,0.3)] transition-all flex items-center justify-center gap-3 active:scale-95"
                                    >
                                        {isSubmitting ? (
                                            <Loader2 className="animate-spin" size={32} />
                                        ) : (
                                            <>
                                                Submit Practice Book
                                                <ChevronRight size={32} />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 'SUCCESS' && (
                        <div className={`max-w-[1400px] mx-auto animate-in zoom-in-95 duration-1000 ${lessonData.reading_passage ? 'w-full' : 'max-w-4xl'}`}>
                            {/* Mission Header */}
                            <div className="text-center py-10 md:py-20">
                                <div className="relative inline-block mb-16">
                                    <div className="absolute inset-0 bg-yellow-400 blur-[80px] opacity-40 animate-pulse" />
                                    <div className="relative p-16 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 text-white rounded-[5rem] shadow-[0_40px_100px_rgba(234,179,8,0.3)]">
                                        <Award size={100} strokeWidth={2.5} />
                                    </div>
                                    <div className="absolute -top-10 -right-10 p-6 bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl border-8 border-yellow-100 dark:border-yellow-900 animate-bounce">
                                        <Sparkles className="text-yellow-500" size={48} />
                                    </div>
                                </div>

                                <h1 className="text-6xl md:text-7xl font-black dark:text-white mb-8 tracking-tighter">Mission Accomplished</h1>
                                <p className="text-2xl md:text-3xl text-gray-500 dark:text-gray-400 mb-16 leading-relaxed font-bold max-w-xl mx-auto">
                                    {lessonData.success_feedback}
                                </p>
                            </div>

                            <div className={`flex flex-col ${lessonData.reading_passage ? 'lg:flex-row' : ''} gap-8 items-start`}>
                                {/* Reading Passage Context - Left Panel (Review Mode) */}
                                {lessonData.reading_passage && (
                                    <div className="w-full lg:w-1/2 sticky top-24 max-h-[calc(100vh-140px)] overflow-y-auto bg-white dark:bg-gray-900 p-8 md:p-12 rounded-[2rem] border-2 border-indigo-100 dark:border-indigo-900/40 shadow-sm custom-scrollbar">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600">
                                                <BookOpen size={18} />
                                            </div>
                                            <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest">Reference Passage</h4>
                                        </div>
                                        <div className="prose prose-xl prose-indigo dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed font-serif italic">
                                            {lessonData.reading_passage}
                                        </div>
                                    </div>
                                )}

                                {/* Results & Review - Right Panel */}
                                <div className={`w-full ${lessonData.reading_passage ? 'lg:w-1/2' : 'max-w-4xl mx-auto'} pb-20`}>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-16">
                                        <div className="bg-green-50 dark:bg-green-900/10 p-10 rounded-[3.5rem] border-2 border-green-100 dark:border-green-900/50 transform hover:scale-105 transition-all">
                                            <div className="flex items-center justify-center gap-4 mb-3">
                                                <Sparkles className="text-green-600" size={32} />
                                                <span className="text-4xl font-black text-green-700 dark:text-green-400">+{earnedXp} XP</span>
                                            </div>
                                            <p className="text-green-600 dark:text-green-500 font-bold uppercase tracking-widest text-[10px]">Performance Points</p>
                                        </div>

                                        <div className="bg-orange-50 dark:bg-orange-900/10 p-10 rounded-[3.5rem] border-2 border-orange-100 dark:border-orange-900/50 transform hover:scale-105 transition-all">
                                            <div className="flex items-center justify-center gap-4 mb-3">
                                                <Award className="text-orange-600" size={32} />
                                                <span className="text-4xl font-black text-orange-700 dark:text-orange-400">{masteryScore}%</span>
                                            </div>
                                            <p className="text-orange-600 dark:text-orange-500 font-bold uppercase tracking-widest text-[10px]">Overall Mission Grade</p>
                                        </div>
                                    </div>

                                    {/* Detailed Mission Review Section */}
                                    <div className="space-y-8 text-left">
                                        <h3 className="text-3xl font-black dark:text-white flex items-center gap-4 mb-8">
                                            <div className="size-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white">
                                                <BookOpen size={24} />
                                            </div>
                                            Mission Review
                                        </h3>

                                        {lessonData.interactive_tasks.map((task, idx) => (
                                            <div key={task.id} className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 p-8 shadow-sm">
                                                <div className="flex justify-between items-start mb-6">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-4 mb-2">
                                                            <div className="size-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-black text-gray-400 text-xs">
                                                                {idx + 1}
                                                            </div>
                                                            <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{task.instruction}</p>
                                                        </div>
                                                        <h4 className="font-bold dark:text-white leading-snug text-lg">{task.question}</h4>
                                                    </div>
                                                    {feedbacks[task.id]?.correct ? (
                                                        <span className="px-4 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-black rounded-full uppercase">Mastered</span>
                                                    ) : (
                                                        <span className="px-4 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-black rounded-full uppercase">Review Mistake</span>
                                                    )}
                                                </div>

                                                <div className="space-y-6">
                                                    <div>
                                                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">My Answer</p>
                                                        {task.type === 'MCQ' ? (
                                                            <div className="space-y-2">
                                                                <p className="text-lg font-black text-indigo-600 dark:text-indigo-400">Selected: {userAnswers[task.id]}</p>
                                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 opacity-60">
                                                                    {task.options?.map((opt, oIdx) => (
                                                                        <div
                                                                            key={oIdx}
                                                                            className={`p-3 rounded-xl border text-sm font-bold ${userAnswers[task.id] === opt.substring(0, 1) ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-100 bg-gray-50 text-gray-400'}`}
                                                                        >
                                                                            {opt}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <p className="text-lg font-medium text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700 italic">
                                                                "{userAnswers[task.id] || '(No Answer)'}"
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <p className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-2">Miss Janie's Feedback & Explanation</p>
                                                        <div className={`p-6 rounded-2xl border leading-relaxed font-medium ${feedbacks[task.id]?.correct
                                                                ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-800 text-gray-700 dark:text-gray-300'
                                                                : 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30 text-red-800 dark:text-red-200'
                                                            }`}>
                                                            {feedbacks[task.id]?.feedback || task.answer_logic || "Review the core concept to see how you can refine this."}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        <button
                                            onClick={handleClose}
                                            className="w-full py-8 bg-gray-900 dark:bg-white dark:text-black text-white rounded-[2rem] font-black text-3xl shadow-2xl hover:scale-[1.02] transition-all active:scale-95 mt-10"
                                        >
                                            Confirm & Return
                                        </button>

                                        <div className="mt-16 space-y-4 text-center">
                                            <p className="text-sm font-black text-gray-400 uppercase tracking-[0.3em]">Continuity Path</p>
                                            <div className="flex flex-wrap justify-center gap-3">
                                                {lessonData.suggested_next_steps.map((s, i) => (
                                                    <button key={i} className="px-6 py-3 bg-gray-100 dark:bg-gray-800 rounded-2xl text-lg font-bold text-gray-600 dark:text-gray-300 hover:bg-indigo-600 hover:text-white transition-all">
                                                        {s}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div >
    );
};

export default LabPage;
