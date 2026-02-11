import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, Award, Book, BookOpen, CheckCircle2, ChevronRight, GraduationCap, Layout, Layers, Loader2, MessageSquare, Mic, MousePointerClick, Play, RefreshCcw, Save, Sparkles, Square, Star, Trophy, Volume2, X } from 'lucide-react';
import NextPathRecommendations from '../components/lab/NextPathRecommendations';
import { useAuth } from '../context/AuthContext';
import { getSkillName } from '../constants/microSkills';
import { addToNotebook } from '../services/notebookService';
import WritingWorkspace from '../components/lab/WritingWorkspace';
import WritingReview from '../components/lab/WritingReview';
import AlertModal from '../components/shared/AlertModal';
import ScaffoldToolbar from '../components/reading/ScaffoldToolbar';
import VocabSpotlight from '../components/reading/VocabSpotlight';
import ParagraphInsight from '../components/reading/ParagraphInsight';
import ArgumentMap from '../components/reading/ArgumentMap';
import { useLanguage } from '../context/LanguageContext';

// --- Dictionary Popover Component ---
const DictionaryPopover = ({ data, position, onClose, onAddToNotebook, loading }) => {
    if (!position) return null;

    // Calculate intelligent position to avoid overflow
    const width = 288; // w-72
    const height = 400; // conservative estimate for height

    let left = position.left;
    let top = position.top + 10;

    // Boundary check for right edge
    if (left + width > window.innerWidth) {
        left = window.innerWidth - width - 20;
    }

    // Boundary check for bottom edge
    if (top + height > window.innerHeight) {
        top = position.top - height - 10;
        if (top < 0) top = 20; // Fallback to top if it would overflow both ways
    }

    return (
        <div
            className="dictionary-popover fixed z-[70] bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 w-72 animate-in fade-in zoom-in duration-200 text-left"
            style={{ top, left: Math.max(20, left) }}
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
    const { t, language } = useLanguage();

    // Alert State
    const [alertState, setAlertState] = useState({ isOpen: false, type: 'info', message: '' });

    const showAlert = (type, message) => {
        setAlertState({ isOpen: true, type, message });
    };

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

    // Scaffold State
    const [scaffoldSettings, setScaffoldSettings] = useState(() => {
        const saved = localStorage.getItem('readingScaffoldSettings');
        return saved ? JSON.parse(saved) : { vocab: false, structure: false, logic: false };
    });
    const [scaffoldData, setScaffoldData] = useState(null);
    const [isLoadingScaffold, setIsLoadingScaffold] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    // Formatting the topic for display
    // Formatting the topic for display
    const isWritingTopic = topic && topic.startsWith('writing_');
    const displayTopic = topic
        ? (isWritingTopic ? `Writing Skill: ${getSkillName(topic)}` : getSkillName(topic))
        : "Learning Lab";

    // Reset scaffold data when passage changes
    useEffect(() => {
        if (lessonData?.reading_passage) {
            console.log('[LabPage] Reading passage changed, resetting scaffold data and settings');
            setScaffoldData(null);
            setScaffoldSettings({ vocab: false, structure: false, logic: false });
        }
    }, [lessonData?.reading_passage]);

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
            showAlert('error', "Speech recognition not supported in this browser.");
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

            // Determine if this is a Writing 2.0 request
            // We use 'writing' topic OR detect writing modes passed via state/URL OR check for writing_* skill IDs
            const isWritingLab = topic === 'writing' || topic.startsWith('writing_') || ['SENTENCE_BUILDER', 'PARAGRAPH_PLANNER', 'MINI_ESSAY'].includes(focus?.[0]);

            // Retry Logic for Frontend
            let attempts = 0;
            const maxAttempts = 3;
            const endpoint = isWritingLab ? `${API_URL}/api/lab/writing/generate` : `${API_URL}/api/lab/generate`;

            while (attempts < maxAttempts) {
                try {
                    attempts++;
                    // Construct payload based on lab type
                    const payload = {
                        level: currentLevel,
                        uid: user?.uid || 'placeholder'
                    };

                    if (isWritingLab) {
                        payload.topic = topic; // Pass the specific skill ID (e.g. 'writing_relevance') or 'writing'

                        // Map Skill ID to Mode (Heuristics)
                        // If logic isn't specific, default to PARAGRAPH_PLANNER
                        let derivedMode = 'PARAGRAPH_PLANNER';
                        if (focus && focus.length > 0 && ['SENTENCE_BUILDER', 'PARAGRAPH_PLANNER', 'MINI_ESSAY'].includes(focus[0])) {
                            derivedMode = focus[0];
                        } else if (topic.includes('sentence')) {
                            derivedMode = 'SENTENCE_BUILDER';
                        } else if (topic.includes('development') || topic.includes('organization') || topic.includes('coherence')) {
                            derivedMode = 'MINI_ESSAY';
                        }

                        payload.mode = derivedMode;
                        console.log(`[LabPage] Writing Lab Detected. Topic: ${topic}, Mode: ${derivedMode}`);
                    } else {
                        payload.topic = topic;
                        payload.focus = focus;
                    }

                    const response = await fetch(endpoint, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || `Server error: ${response.status}`);
                    }

                    // Writing Competencies Map (Fallback if AI doesn't generate them)
                    const WRITING_COMPETENCIES = {
                        'writing_development': [
                            "Elaboration of Arguments: Expanding ideas with depth",
                            "Use of Evidence: Supporting claims with concrete examples",
                            "Relevance: Maintaining strict focus on the prompt",
                            "Clarity of Thought: Expressing complex ideas simply"
                        ],
                        'writing_organization': [
                            "Paragraph Structure: Topic sentences and supporting details",
                            "Logical Flow: Smooth transitions between ideas",
                            "Coherence: Linking sentences effectively",
                            "Structural Unity: Beginning, middle, and end alignment"
                        ],
                        'writing_coherence': [
                            "Transition Signals: Using 'However', 'Therefore', etc.",
                            "Reference Words: Using pronouns to link ideas",
                            "Logical Sequencing: Ordering points for maximum impact",
                            "Idea Connection: Bridging concepts smoothly"
                        ],
                        'writing_sentenceVariety': [
                            "Sentence Length: Mixing short and long sentences",
                            "Structure Types: Using compound and complex sentences",
                            "Openers: Varying how sentences begin",
                            "Rhythm: Creating a natural flow of text"
                        ],
                        'PARAGRAPH_PLANNER': [
                            "Topic Sentence: Clearly stating the main idea",
                            "Supporting Details: Providing evidence and analysis",
                            "Concluding Sentence: Wrapping up the argument",
                            "Unity: Ensuring all sentences relate to the topic"
                        ],
                        'SENTENCE_BUILDER': [
                            "Grammar Accuracy: Avoiding common pitfalls",
                            "Vocabulary Selection: Choosing precise words",
                            "Sentence Structure: Mastering syntax",
                            "Punctuation Control: Using commas and periods correctly"
                        ],
                        'MINI_ESSAY': [
                            "Thesis Statement: clear and arguable position",
                            "Argument structuring: Logic and persuasion",
                            "Counter-arguments: Addressing opposing views",
                            "Conclusion: Synthesizing main points"
                        ]
                    };

                    const data = await response.json();

                    // Inject Fallback Competencies for Writing
                    if (isWritingLab && (!data.key_points || data.key_points.length === 0)) {
                        // Try specific topic match first, then mode match
                        data.key_points = WRITING_COMPETENCIES[topic] || WRITING_COMPETENCIES[payload.mode] || [
                            "Clear Expression: Communicating ideas effectively",
                            "Task Fulfilment: Meeting all prompt requirements",
                            "Language Accuracy: minimizing grammatical errors",
                            "Organization: Structuring text logically"
                        ];
                    }

                    setLessonData(data); // Writing API returns { mode, theme, ... }

                    // Initialize answers
                    const initialAnswers = {};
                    if (!isWritingLab) {
                        // Standard Lab Initialization
                        if (data.interactive_tasks && data.interactive_tasks.length > 0) {
                            data.interactive_tasks.forEach(t => initialAnswers[t.id] = '');
                        } else if (data.interactive_task) {
                            const taskId = 'q1';
                            initialAnswers[taskId] = '';
                            data.interactive_tasks = [{ ...data.interactive_task, id: taskId }];
                        }
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
                        await new Promise(r => setTimeout(r, 2000 * attempts));
                    }
                }
            }
        };

        fetchLesson();
    }, [topic, currentLevel]); // Re-fetch when level changes

    const handleTextClick = async (e) => {
        // Prevent event from bubbling to window (prevents immediate close)
        e.stopPropagation();

        let text = "";
        const selection = window.getSelection();
        const selectedText = selection.toString().trim();

        if (selectedText.length > 0) {
            // Case 1: Drag Highlight
            text = selectedText;
        } else {
            // Case 2: Single Click (Word Expansion)
            if (document.caretRangeFromPoint) {
                const range = document.caretRangeFromPoint(e.clientX, e.clientY);
                if (range && range.startContainer.nodeType === Node.TEXT_NODE) {
                    range.expand('word');
                    text = range.toString().trim();
                    const sel = window.getSelection();
                    sel.removeAllRanges();
                    sel.addRange(range);
                }
            }
        }

        // Validation
        if (!text || text.split(' ').length > 4) return;

        // Calculate Position
        const range = window.getSelection().getRangeAt(0);
        const rect = range.getBoundingClientRect();

        setPopover({
            position: {
                top: rect.bottom,
                left: rect.left
            },
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
                    context: selection.anchorNode?.textContent?.substring(0, 100)
                })
            });
            const data = await res.json();

            setPopover(prev => ({
                ...prev,
                loading: false,
                data: { ...data, term: text }
            }));
        } catch (error) {
            console.error("Dictionary Fetch Error:", error);
            setPopover(prev => ({
                ...prev,
                loading: false,
                data: { term: text, error: "Could not retrieve definition." }
            }));
        }
    };

    const handleAddToNotebook = async (dictData) => {
        if (!user) {
            showAlert('info', "Please log in to save words to your notebook.");
            return;
        }

        if (dictData) {
            try {
                await addToNotebook(user.uid, {
                    term: dictData.term,
                    note: `${dictData.definition} (${dictData.translation})`,
                    context: `Lab: ${displayTopic}`,
                    type: 'vocabulary',
                    source: `Learning Lab (${currentLevel})`
                });
                showAlert('success', "Saved to Notebook!");
                setPopover(null);
            } catch (err) {
                console.error(err);
                const isNetworkError = err.message === 'Failed to fetch' || err.message.includes('NetworkError');
                if (isNetworkError) {
                    showAlert('network', "Could not save to notebook. Please check your internet connection.");
                } else {
                    showAlert('error', "Failed to save to notebook.");
                }
            }
        }
    };

    const handleClose = () => {
        if (step === 'SUCCESS') {
            const params = new URLSearchParams();
            params.set('quest_completed', 'true');
            if (topic) params.set('topic', topic);
            navigate(`/dashboard?${params.toString()}`);
            return;
        }

        if (window.history.length > 2) {
            navigate(-1);
        } else {
            navigate('/dashboard');
        }
    };

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
                showAlert('info', "Cheat generated no answers. This can happen if the AI times out. Please try again.");
            }
            setUserAnswers(prev => ({ ...prev, ...cheatedAnswers }));
        } catch (e) {
            console.error("Cheat Error:", e);
            const isNetworkError = e.message === 'Failed to fetch' || e.message.includes('NetworkError');
            if (isNetworkError) {
                showAlert('network', "Failed to connect to the server. Please check your internet connection.");
            } else {
                showAlert('error', `Cheat failed: ${e.message}`);
            }
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

    const handleWritingSubmit = async (text) => {
        setIsSubmitting(true);
        setEvalError(null);
        try {
            const res = await fetch(`${API_URL}/api/lab/writing/evaluate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentText: text,
                    context: {
                        mode: lessonData.mode,
                        theme: lessonData.theme,
                        instruction: lessonData.instruction || lessonData.question_text || lessonData.prompt_text,
                        target_level: `HKDSE Level ${currentLevel}`
                    }
                })
            });

            if (!res.ok) throw new Error("Evaluation failed");

            const feedback = await res.json();
            setFeedbacks({ writing: feedback }); // Store as special 'writing' feedback key
            setUserAnswers({ writing: text }); // Store submission

            // 1. Calculate Mastery Score (0-100) based on Level
            const estimatedLevel = feedback.score_estimated || "3";
            let numericScore = 60; // Default Level 3
            if (estimatedLevel.includes('5**')) numericScore = 100;
            else if (estimatedLevel.includes('5*')) numericScore = 90;
            else if (estimatedLevel.includes('5')) numericScore = 80;
            else if (estimatedLevel.includes('4')) numericScore = 70;
            else if (estimatedLevel.includes('3')) numericScore = 60;
            else if (estimatedLevel.includes('2')) numericScore = 40;
            else if (estimatedLevel.includes('1')) numericScore = 20;

            // 2. Map Mode to Micro-Skill ID (for Mastery Radar)
            let skillId = 'writing_relevance'; // Default fallback

            // Priority: If the user came via a specific skill URL (e.g. topic=writing_development), use that.
            if (topic && topic.startsWith('writing_')) {
                skillId = topic;
            } else {
                // Heuristic mapping based on mode
                if (lessonData.mode === 'SENTENCE_BUILDER') skillId = 'writing_sentenceVariety';
                else if (lessonData.mode === 'PARAGRAPH_PLANNER') skillId = 'writing_paragraphStructure';
                else if (lessonData.mode === 'MINI_ESSAY') skillId = 'writing_development';
            }

            const baseXp = 50;
            const levelMultiplier = numericScore >= 80 ? 1.5 : 1;
            const finalXp = Math.floor(baseXp * levelMultiplier);
            setEarnedXp(finalXp);
            setMasteryScore(numericScore);

            // 3. Persist to Backend (Update Profile & Timeline)
            const submitPayload = {
                uid: user?.uid || 'placeholder',
                results: { writing_task: true },
                xp: finalXp,
                masteryScore: numericScore,
                topic: skillId,
                mistakes: []
            };

            await fetch(`${API_URL}/api/lab/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submitPayload)
            });

            setStep('SUCCESS');
        } catch (e) {
            console.error("Writing Eval Error:", e);
            setEvalError(e.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const isWritingMode = lessonData?.mode && ['SENTENCE_BUILDER', 'PARAGRAPH_PLANNER', 'MINI_ESSAY'].includes(lessonData.mode);

    // --- WRITING WORKSPACE RENDER ---
    if (step === 'PRACTICE' && isWritingMode) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <header className="px-6 py-4 bg-white border-b border-gray-100 flex justify-between items-center">
                    <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full">
                        <X size={24} className="text-gray-400" />
                    </button>
                    <span className="font-black text-indigo-600 uppercase tracking-widest text-sm">
                        Writing Lab
                    </span>
                    <div className="w-10" />
                </header>
                <div className="flex-1 overflow-y-auto">
                    <WritingWorkspace
                        lessonData={lessonData}
                        onSubmit={handleWritingSubmit}
                        isSubmitting={isSubmitting}
                    />
                </div>
            </div>
        );
    }

    // --- WRITING REVIEW RENDER ---
    if (step === 'SUCCESS' && isWritingMode) {
        return (
            <div className="min-h-screen bg-white">
                <header className="px-6 py-4 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white/90 backdrop-blur z-20">
                    <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full">
                        <X size={24} className="text-gray-400" />
                    </button>
                    <span className="font-black text-green-600 uppercase tracking-widest text-sm">
                        {t('lab.mission_accomplished')}
                    </span>
                    <div className="flex items-center gap-2 px-3 py-1 bg-amber-100/50 text-amber-700 rounded-full text-xs font-bold">
                        <Award size={14} />
                        +{earnedXp} {t('lab.xp_points')}
                    </div>
                </header>
                <div className="flex-1 overflow-y-auto pt-8 px-4">
                    <WritingReview
                        submission={userAnswers.writing}
                        feedback={feedbacks.writing}
                        topic={topic}
                        level={currentLevel}
                        lessonMode={lessonData?.mode}
                        onTryAgain={() => {
                            setStep('EXPLORE');
                            setLessonData(null);
                            // Could trigger re-fetch if useEffect depends on lessonData being null? 
                            // Actually fetchLesson depends on topic/level. 
                            // To force refetch, we might need a key or toggle.
                            navigate(0); // Simple reload for now to get fresh prompt
                        }}
                        onNext={handleClose}
                    />
                </div>
            </div>
        );
    }

    // --- LOADING STATE ---
    if (loading) {
        return (
            <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-indigo-600" size={48} />
                    <p className="text-gray-500 font-medium animate-pulse">{t('lab.designing_lesson')}</p>
                </div>
            </div>
        );
    }

    // --- ERROR STATE ---
    if (genError) {
        return (
            <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
                <div className="text-center space-y-4 p-8">
                    <div className="inline-flex p-4 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full mb-4">
                        <X size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('lab.connection_interrupted')}</h2>
                    <p className="text-gray-500 max-w-md mx-auto">{genError}</p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold hover:scale-105 transition-transform"
                    >
                        {t('lab.return_dashboard')}
                    </button>
                </div>
            </div>
        );
    }

    // Standard Lab Render...
    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col animate-in fade-in duration-300">
            {/* ... Existing standard header ... */}
            {/* Same header code as before, we just need to ensure we don't duplicate or lose it */}

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

            {/* Custom Alert Modal */}
            <AlertModal
                isOpen={alertState.isOpen}
                type={alertState.type}
                message={alertState.message}
                onClose={() => setAlertState({ ...alertState, isOpen: false })}
                onRetry={null} // Retry logic can be passed if needed
            />

            {/* Immersive Standalone Header */}
            <header className="sticky top-0 w-full flex justify-between items-center px-8 md:px-12 py-4 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md z-20">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-indigo-600 rounded-lg text-white">
                        <Layers size={18} />
                    </div>
                    <div>
                        <h2 className="text-sm md:text-base font-black dark:text-white tracking-wider">
                            {lessonData?.type ? `${lessonData.type.charAt(0) + lessonData.type.slice(1).toLowerCase()} - ` : ''}{displayTopic}
                        </h2>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-gray-400">{t('lab.mission_type')}</span>
                            <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                                {t('lab.comprehensive_practice')}
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
                    {t('lab.live_training')}
                </div>

                {/* Difficulty Selector */}
                <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 rounded-lg p-1 border border-gray-100 dark:border-gray-800">
                    <span className="text-[10px] font-bold text-gray-400 pl-2 uppercase tracking-wide">{t('lab.level')}</span>
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
                        <option value="3">{t('lab.foundation_building')}</option>
                        <option value="5">{t('lab.dse_standard')}</option>
                        <option value="7">{t('lab.elite_challenge')}</option>
                    </select>
                </div>

                <button
                    onClick={handleClose}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all group"
                    title={t('lab.exit_lab')}
                >
                    <X size={20} className="text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
                </button>
            </header>

            {/* Immersive Scroll Content */}
            <main className="flex-1 bg-gray-50/50 dark:bg-transparent select-none">
                <div className="w-full px-8 md:px-12 py-10 md:py-20 font-sans">

                    {step === 'EXPLORE' && (
                        <div className="space-y-16 animate-in slide-in-from-bottom-8 duration-700">
                            {/* Hero Intro */}
                            <div className="space-y-6">
                                <span className="inline-block px-4 py-1.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-black uppercase tracking-[0.2em] rounded-full">
                                    {t('lab.briefing')}
                                </span>
                                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                                    <h1 className="text-5xl md:text-7xl font-black tracking-tight text-gray-900 dark:text-white max-w-4xl leading-[1.1]">
                                        {t('lab.mastering').replace('{{topic}}', displayTopic)}
                                    </h1>
                                    <div className="flex flex-col items-center justify-center p-6 bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-[2.5rem] shadow-sm transform hover:rotate-3 transition-transform">
                                        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                                            <Award size={32} className="fill-current" />
                                            <span className="text-4xl font-black">+{location.state?.taskXp || 100}</span>
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 mt-1">{t('lab.xp_points')}</span>
                                    </div>
                                </div>
                                <p className="text-xl md:text-2xl text-gray-500 dark:text-gray-400 max-w-2xl font-medium">
                                    {t('lab.lab_intro')}
                                </p>
                            </div>

                            {/* Main Lesson Block */}
                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
                                <div className="xl:col-span-2 space-y-12">
                                    <section className="bg-white dark:bg-gray-900 p-8 md:p-14 rounded-[3rem] shadow-sm border border-gray-100 dark:border-gray-800">
                                        <div className="prose prose-xl prose-indigo dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                                            {lessonData.conceptual_explanation}
                                        </div>

                                        {(lessonData.key_points || []).length > 0 && (
                                            <div className="mt-12 space-y-4">
                                                <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest px-2">{t('lab.key_competencies')}</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {(lessonData.key_points || []).map((pt, idx) => (
                                                        <div key={idx} className="flex items-center gap-4 p-5 bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700 rounded-2xl">
                                                            <div className="size-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                                                                <CheckCircle2 size={18} className="text-green-600 dark:text-green-500" />
                                                            </div>
                                                            <span className="text-base font-bold dark:text-white">{pt}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
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

                                    {/* Case Studies Section - Safe Render */}
                                    {(lessonData.examples || []).length > 0 && (
                                        <>
                                            <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                                                <Sparkles className="text-indigo-500" size={24} />
                                                {t('lab.case_studies')}
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
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="pt-10 flex justify-center sticky bottom-10 z-10">
                                <button
                                    onClick={() => setStep('PRACTICE')}
                                    className="group flex items-center gap-4 px-12 py-6 bg-gray-900 dark:bg-white text-white dark:text-black rounded-full font-black text-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_50px_rgba(255,255,255,0.05)] hover:scale-105 transition-all active:scale-95"
                                >
                                    {t('lab.proceed_to_quest')}
                                    <div className="p-1.5 bg-white/10 dark:bg-black/5 rounded-full group-hover:translate-x-1 transition-transform">
                                        <ChevronRight size={28} />
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 'PRACTICE' && (
                        <div className={`w-full mx-auto px-0 animate-in slide-in-from-right-16 duration-700`}>
                            {/* Minimal Section Spacer instead of bulky header */}
                            <div className="mb-10"></div>

                            <div className={`flex flex-col ${lessonData.reading_passage ? 'lg:flex-row' : ''} gap-8 items-start`}>
                                {/* Reading Passage Context - Left Panel */}
                                {lessonData.reading_passage && (
                                    <div className="w-full lg:w-[58%] sticky top-24 max-h-[calc(100vh-140px)] overflow-y-auto bg-white dark:bg-gray-900 rounded-[2rem] border-2 border-indigo-100 dark:border-indigo-900/40 shadow-sm custom-scrollbar">
                                        <div className="p-6 md:p-10">
                                            {/* Scaffold Toolbar */}
                                            <ScaffoldToolbar settings={scaffoldSettings} onChange={(s) => {
                                                console.log('[LabPage] Scaffold settings changed:', s);
                                                setScaffoldSettings(s);
                                                localStorage.setItem('readingScaffoldSettings', JSON.stringify(s));
                                                // Fetch scaffold data if any toggle enabled and not already loaded
                                                if ((s.vocab || s.structure || s.logic) && !scaffoldData && !isLoadingScaffold) {
                                                    console.log('[LabPage] Fetching scaffold data...');
                                                    setIsLoadingScaffold(true);
                                                    fetch(`${API_URL}/api/reading/scaffold`, {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({ passage: lessonData.reading_passage, level: 3 })
                                                    }).then(r => {
                                                        if (!r.ok) return r.json().then(e => { throw new Error(e.error || `Server error: ${r.status}`) });
                                                        return r.json();
                                                    }).then(data => {
                                                        console.log('[LabPage] Scaffold data received:', data);
                                                        if (!data || (!data.vocab && !data.tags && !data.connectors)) {
                                                            console.warn('[LabPage] Scaffold data empty or malformed');
                                                        }
                                                        setScaffoldData(data);
                                                        setIsLoadingScaffold(false);
                                                    }).catch(e => {
                                                        console.error('[LabPage] Scaffold fetch error:', e);
                                                        setIsLoadingScaffold(false);
                                                        showAlert('error', `Could not load learning scaffolds: ${e.message}`);
                                                        // Reset settings so user can try again
                                                        setScaffoldSettings({ vocab: false, structure: false, logic: false });
                                                    });
                                                }
                                            }} />

                                            <div className="flex items-center justify-between mb-6 mt-6">
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

                                            {/* Loading indicator */}
                                            {isLoadingScaffold && (
                                                <div className="flex items-center justify-center gap-2 p-3 mb-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                                                    <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                                                    <span className="text-xs text-indigo-600 font-medium">Loading scaffolds...</span>
                                                </div>
                                            )}

                                            <div
                                                className="prose prose-xl prose-indigo dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed font-serif cursor-text select-text"
                                                onClick={handleTextClick}
                                            >
                                                {(() => {
                                                    // Determine paragraphs to render
                                                    const paras = scaffoldData?.paragraphs || lessonData.reading_passage.split(/\n\n+/).filter(p => p.trim());

                                                    return paras.map((paraText, idx) => {
                                                        const pTag = scaffoldData?.tags?.find(t => t.index === idx);
                                                        const pConnector = scaffoldData?.connectors?.find(c => c.to === idx);

                                                        return (
                                                            <div key={idx} className="relative mb-8 last:mb-0">
                                                                {/* Logic Connector (Level 3) */}
                                                                {scaffoldSettings.logic && pConnector && (
                                                                    <ArgumentMap
                                                                        type={pConnector.type}
                                                                        from={pConnector.from}
                                                                        to={pConnector.to}
                                                                        bridgeSentence={pConnector.bridge_sentence}
                                                                        signalWords={pConnector.signal_words}
                                                                        examInsight={pConnector.exam_insight}
                                                                        language={language}
                                                                    />
                                                                )}

                                                                <div className="flex gap-4 items-start">
                                                                    {/* Paragraph Tag (Level 2) */}
                                                                    {scaffoldSettings.structure && pTag && (
                                                                        <div className="flex-shrink-0 mt-1.5 w-56">
                                                                            <ParagraphInsight
                                                                                tag={pTag.tag}
                                                                                summary={pTag.summary}
                                                                                keyPhrases={pTag.key_phrases}
                                                                                dseTip={pTag.dse_tip}
                                                                                index={idx}
                                                                                language={language}
                                                                            />
                                                                        </div>
                                                                    )}

                                                                    <div className={`flex-grow ${scaffoldSettings.structure ? 'pl-2' : ''}`}>
                                                                        {scaffoldSettings.vocab && scaffoldData?.vocab ? (
                                                                            <VocabSpotlight
                                                                                text={paraText}
                                                                                vocabData={scaffoldData.vocab}
                                                                                onWordClick={(word) => console.log('Word clicked:', word)}
                                                                            />
                                                                        ) : (
                                                                            <p className="m-0 italic hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                                                                                {paraText}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    });
                                                })()}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Questions - Right Panel or Main Center */}
                                <div className={`w-full ${lessonData.reading_passage ? 'lg:w-[42%]' : 'max-w-4xl mx-auto'} space-y-10 pb-20`}>
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
                                                            {feedbacks[task.id].correct ? t('lab.excellent_work') : t('lab.hint')}
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
                                        <span>{t('lab.evaluation_failed').replace('{{error}}', evalError)}</span>
                                    </div>
                                )}
                                <div className="flex flex-col md:flex-row gap-4 w-full">
                                    <button
                                        onClick={() => setStep('EXPLORE')}
                                        className="flex-1 px-10 py-6 border-2 border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-full font-black text-xl dark:text-white hover:bg-white dark:hover:bg-gray-800 transition-all shadow-xl active:scale-95"
                                    >
                                        {t('lab.review_briefing')}
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
                                                {t('lab.submit_practice')}
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

                                <h1 className="text-6xl md:text-7xl font-black dark:text-white mb-8 tracking-tighter">{t('lab.mission_accomplished')}</h1>
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
                                            <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest">{t('lab.reference_passage')}</h4>
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
                                            <p className="text-green-600 dark:text-green-500 font-bold uppercase tracking-widest text-[10px]">{t('lab.performance_points')}</p>
                                        </div>

                                        <div className="bg-orange-50 dark:bg-orange-900/10 p-10 rounded-[3.5rem] border-2 border-orange-100 dark:border-orange-900/50 transform hover:scale-105 transition-all">
                                            <div className="flex items-center justify-center gap-4 mb-3">
                                                <Award className="text-orange-600" size={32} />
                                                <span className="text-4xl font-black text-orange-700 dark:text-orange-400">{masteryScore}%</span>
                                            </div>
                                            <p className="text-orange-600 dark:text-orange-500 font-bold uppercase tracking-widest text-[10px]">{t('lab.overall_grade')}</p>
                                        </div>
                                    </div>

                                    {/* Detailed Mission Review Section */}
                                    <div className="space-y-8 text-left">
                                        <h3 className="text-3xl font-black dark:text-white flex items-center gap-4 mb-8">
                                            <div className="size-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white">
                                                <BookOpen size={24} />
                                            </div>
                                            {t('lab.mission_review')}
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
                                                        <span className="px-4 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-black rounded-full uppercase">{t('lab.mastered')}</span>
                                                    ) : (
                                                        <span className="px-4 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-black rounded-full uppercase">{t('lab.review_mistake')}</span>
                                                    )}
                                                </div>

                                                <div className="space-y-6">
                                                    <div>
                                                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">{t('lab.my_answer')}</p>
                                                        {task.type === 'MCQ' ? (
                                                            <div className="space-y-2">
                                                                <p className="text-lg font-black text-indigo-600 dark:text-indigo-400">{t('lab.selected').replace('{{option}}', userAnswers[task.id])}</p>
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
                                                                "{userAnswers[task.id] || t('lab.no_answer')}"
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <p className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-2">{t('lab.ai_feedback_explanation')}</p>
                                                        <div className={`p-6 rounded-2xl border leading-relaxed font-medium ${feedbacks[task.id]?.correct
                                                            ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-800 text-gray-700 dark:text-gray-300'
                                                            : 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30 text-red-800 dark:text-red-200'
                                                            }`}>
                                                            {feedbacks[task.id]?.feedback || task.answer_logic || t('lab.review_core_concept')}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Next Path Recommendations (Shared) */}
                                        <NextPathRecommendations
                                            level={currentLevel}
                                            topic={displayTopic} // or location.state.topicId if available for cleaner logic
                                            lessonMode={lessonData.type} // passing type as mode for R/L/S logic
                                            onRetry={() => setStep('EXPLORE')}
                                            onExit={handleClose}
                                        />
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
