import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { 
    BookOpen, 
    ChevronRight, 
    Clock, 
    ShieldCheck, 
    AlertCircle,
    ArrowLeft,
    CheckCircle2,
    Lock,
    HelpCircle,
    Check,
    X as XIcon,
    ArrowRight,
    Trophy,
    Target,
    Activity,
    BarChart,
    TrendingUp,
    Award,
    Zap,
    Brain,
    BrainCircuit,
    FileText,
    History,
    Sparkles,
    Loader2
} from 'lucide-react';
import { LoadingPage, GradingOverlay } from '../../components/shared';
import { useAuth } from '../../context/AuthContext';
import { useAvatar } from '../../context/AvatarContext';
import UpgradeModal from '../../components/common/UpgradeModal';
import MockCountdownTimer from '../../components/utils/MockCountdownTimer';
import { isCheatEnabled } from '../../utils/devAccess';
/* eslint-disable no-unused-vars */
import { motion, AnimatePresence } from 'framer-motion';
/* eslint-enable no-unused-vars */

// --- Sub-Components for High-Fidelity Formats ---

const TFNGTable = ({ question, userAnswers, onChange, disabled }) => {
    const qId = question.id;
    const currentAnswers = userAnswers[qId] || {};

    return (
        <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full text-left border-collapse bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
                <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="p-5 text-[11px] font-black uppercase text-slate-400 tracking-widest">Statement</th>
                        <th className="p-5 text-[11px] font-black uppercase text-slate-400 tracking-widest text-center w-32">T / F / NG</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {question.items.map((item, idx) => (
                        <React.Fragment key={idx}>
                            <tr className="group hover:bg-slate-50/30 transition-colors border-none">
                                <td className="p-5 py-8">
                                    <div className="text-sm font-bold text-slate-700 leading-relaxed">{item.statement}</div>
                                </td>
                                <td className="p-5 align-top pt-8">
                                    <div className="flex justify-center gap-1.5">
                                        {['TRUE', 'FALSE', 'NOT_GIVEN'].map(opt => (
                                            <button
                                                key={opt}
                                                onClick={() => !disabled && onChange(qId, { ...currentAnswers, [idx]: { ...currentAnswers[idx], choice: opt } })}
                                                disabled={disabled}
                                                className={`size-9 rounded-xl flex items-center justify-center text-[11px] font-black transition-all ${
                                                    currentAnswers[idx]?.choice === opt
                                                    ? 'bg-slate-900 text-white shadow-lg scale-110'
                                                    : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                                }`}
                                            >
                                                {opt === 'NOT_GIVEN' ? 'NG' : opt.charAt(0)}
                                            </button>
                                        ))}
                                    </div>
                                </td>
                            </tr>
                            <AnimatePresence>
                                {currentAnswers[idx]?.choice === 'FALSE' && (
                                    <tr className="border-none">
                                        <td colSpan={2} className="px-5 pb-8 pt-0">
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="p-6 bg-orange-50/30 border border-orange-100 rounded-2xl overflow-hidden"
                                            >
                                                <div className="text-[11px] font-black text-[#f15a24] uppercase tracking-widest mb-3 flex items-center gap-2">
                                                    <AlertCircle size={12} />
                                                    Justification Required
                                                </div>
                                                <textarea
                                                    className="w-full p-4 bg-white border-2 border-orange-100 rounded-xl text-sm font-bold text-slate-800 focus:ring-4 focus:ring-orange-100 focus:border-[#f15a24] outline-none resize-none transition-all shadow-sm"
                                                    placeholder="Provide evidence from the text to support your answer..."
                                                    rows={1}
                                                    disabled={disabled}
                                                    value={currentAnswers[idx]?.justification || ''}
                                                    onChange={(e) => onChange(qId, { ...currentAnswers, [idx]: { ...currentAnswers[idx], justification: e.target.value } })}
                                                    onInput={(e) => {
                                                        e.target.style.height = 'auto';
                                                        e.target.style.height = e.target.scrollHeight + 'px';
                                                    }}
                                                />
                                            </motion.div>
                                        </td>
                                    </tr>
                                )}
                            </AnimatePresence>
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const SummaryCloze = ({ question, userAnswers, onChange, disabled }) => {
    const qId = question.id;
    const currentAnswers = userAnswers[qId] || {};

    // Parse text to find [1], [2] etc.
    const parts = question.content.split(/(\[\d+\])/g);

    return (
        <div className="p-6 bg-white border border-slate-100 rounded-3xl leading-[2.5] text-sm font-medium text-slate-600">
            {parts.map((part, i) => {
                const match = part.match(/\[(\d+)\]/);
                if (match) {
                    const num = match[1];
                    return (
                        <span key={i} className="inline-block px-1 align-middle">
                            <input
                                type="text"
                                className="w-24 h-8 bg-slate-50 border-b-2 border-slate-200 text-center text-xs font-black text-indigo-600 outline-none focus:border-indigo-500 transition-all uppercase placeholder:text-slate-300"
                                placeholder={num}
                                disabled={disabled}
                                value={currentAnswers[num] || ''}
                                onChange={(e) => onChange(qId, { ...currentAnswers, [num]: e.target.value })}
                            />
                        </span>
                    );
                }
                return <span key={i}>{part}</span>;
            })}
            {disabled && (
                <div className="mt-4 p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl text-[11px] font-black text-indigo-600 uppercase tracking-widest text-center">
                    Model Answers: {Object.values(question.answers || {}).join(' | ')}
                </div>
            )}
        </div>
    );
};

const FlowChart = ({ question, userAnswers, onChange, disabled }) => {
    const qId = question.id;
    const currentAnswers = userAnswers[qId] || {};

    return (
        <div className="flex flex-col gap-4 max-w-sm mx-auto pt-4">
            {question.steps.map((step, idx) => {
                const parts = step.split(/(\[\d+\])/g);
                return (
                    <React.Fragment key={idx}>
                        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm text-xs font-bold text-slate-700 flex items-center justify-center text-center">
                            {parts.map((part, i) => {
                                const match = part.match(/\[(\d+)\]/);
                                if (match) {
                                    const num = match[1];
                                    return (
                                        <input
                                            key={i}
                                            type="text"
                                            className="w-20 h-6 mx-1 bg-indigo-50 border-b border-indigo-300 text-center outline-none uppercase text-indigo-600"
                                            value={currentAnswers[num] || ''}
                                            disabled={disabled}
                                            onChange={(e) => onChange(qId, { ...currentAnswers, [num]: e.target.value })}
                                        />
                                    );
                                }
                                return <span key={i}>{part}</span>;
                            })}
                        </div>
                        {idx < question.steps.length - 1 && (
                            <div className="flex justify-center py-1">
                                <div className="w-px h-6 bg-slate-200 relative">
                                    <div className="absolute -bottom-1 -left-[3px] size-1.5 border-r border-b border-slate-200 rotate-45" />
                                </div>
                            </div>
                        )}
                    </React.Fragment>
                );
            })}
            {disabled && (
                <div className="mt-4 p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl text-[11px] font-black text-indigo-600 uppercase tracking-widest text-center">
                    Model Answers: {Object.values(question.answers || {}).join(' | ')}
                </div>
            )}
        </div>
    );
};

const shuffleArray = (arr) => [...arr].sort(() => Math.random() - 0.5);

const VocabMatch = ({ question, userAnswers, onChange, disabled }) => {
    const qId = question.id;
    const currentAnswers = userAnswers[qId] || {};
    const words = Object.keys(question.pairs);
    const meanings = useMemo(() => shuffleArray(Object.values(question.pairs)), [question.pairs]);

    const isTableMode = question.render_as === 'table' || 
                        question.skill_tag?.toLowerCase().includes('dos and don\'ts') || 
                        question.question?.toLowerCase().includes('dos and don\'ts');

    const categories = useMemo(() => {
        if (question.categories) return question.categories;
        // Fallback for Dos and Don'ts if categories not provided
        if (isTableMode && !question.categories) {
            const allValues = Object.values(question.pairs);
            return [...new Set(allValues)];
        }
        return [];
    }, [question.categories, question.pairs, isTableMode]);

    if (isTableMode) {
        return (
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Action / Statement</th>
                            <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-widest w-32 text-center">Category / Choice</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {words.map((word, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                <td className="p-4 text-xs font-bold text-slate-700">{word}</td>
                                <td className="p-4">
                                    <div className="flex justify-center gap-2">
                                        {categories.map(opt => (
                                            <button
                                                key={opt}
                                                onClick={() => !disabled && onChange(qId, { ...currentAnswers, [word]: opt })}
                                                className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${
                                                    currentAnswers[word] === opt
                                                    ? 'bg-slate-900 text-white shadow-md'
                                                    : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                                }`}
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {words.map((word, idx) => (
                <div key={idx} className="flex items-center gap-4">
                    <div className="w-24 py-2 px-3 bg-slate-900 text-white rounded-lg text-[11px] font-black uppercase tracking-widest text-center shrink-0">
                        {word}
                    </div>
                    <ArrowRight size={14} className="text-slate-300" />
                    <select
                        className="flex-1 p-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={currentAnswers[word] || ''}
                        disabled={disabled}
                        onChange={(e) => onChange(qId, { ...currentAnswers, [word]: e.target.value })}
                    >
                        <option value="">Select Meaning...</option>
                        {meanings.map((m, mi) => (
                            <option key={mi} value={m}>{m}</option>
                        ))}
                    </select>
                </div>
            ))}
        </div>
    );
};

// --- Line Number Mapping Engine ---
const LineMappingContext = React.createContext({ lines: {}, updateLine: () => {} });

const MeasuredParagraph = ({ pId, content, onLineCalculated, highlightedLine, lineMapping }) => {
    const pRef = useRef(null);
    const words = useMemo(() => content.split(/(\s+)/), [content]);
    
    useEffect(() => {
        const calculateLines = () => {
            if (!pRef.current) return;
            const container = pRef.current.closest('.resource-container');
            if (!container) return;
            const containerTop = container.getBoundingClientRect().top;
            const style = getComputedStyle(pRef.current);
            const lineHeight = parseFloat(style.lineHeight);
            
            const wordSpans = pRef.current.querySelectorAll('.word-span');
            const newMappings = {};
            
            wordSpans.forEach(span => {
                const rect = span.getBoundingClientRect();
                const lineNum = Math.floor((rect.top - containerTop) / lineHeight) + 1;
                const text = span.innerText.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g,"").toLowerCase().trim();
                if (text) {
                    newMappings[`${text}_${pId}`] = lineNum;
                }
            });
            
            onLineCalculated(newMappings);
        };

        const timer = setTimeout(calculateLines, 800); // Allow layout to settle
        window.addEventListener('resize', calculateLines);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', calculateLines);
        };
    }, [content, pId, onLineCalculated]);

    return (
        <p ref={pRef} className="text-slate-600 leading-[1.8] text-[1.125rem] font-medium font-serif whitespace-pre-wrap relative">
            {words.map((word, i) => {
                const text = word.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g,"").toLowerCase().trim();
                const isHighlighted = highlightedLine && lineMapping[`${text}_${pId}`] === highlightedLine;
                
                return (
                    <span 
                        key={i} 
                        className={`word-span inline-block transition-colors duration-300 ${word.trim() ? "" : ""} ${
                            isHighlighted ? "bg-indigo-100 text-indigo-900 rounded px-0.5 -mx-0.5" : ""
                        }`}
                    >
                        {word}
                    </span>
                );
            })}
        </p>
    );
};

// --- Main Studio Component ---

const ReadingMockStudio = () => {
    const [lineMapping, setLineMapping] = useState({}); // { word_pid: lineNum }
    const [highlightedLine, setHighlightedLine] = useState(null);
    const [zoomedImage, setZoomedImage] = useState(null);
    
    const updateLines = useCallback((newMappings) => {
        setLineMapping(prev => {
            let changed = false;
            for (const key in newMappings) {
                if (prev[key] !== newMappings[key]) {
                    changed = true;
                    break;
                }
            }
            if (!changed) return prev;
            return { ...prev, ...newMappings };
        });
    }, []);

    const getLineForQuestion = (question) => {
        const qText = question.question || "";
        const pMatch = qText.match(/\[(p\d+)\]/);
        if (!pMatch) return "X";
        const pId = pMatch[1];
        
        // 1. If an explicit anchor is provided in the JSON, use it (Highest Priority)
        if (question.anchor) {
            const anchor = question.anchor.toLowerCase().trim();
            const firstWord = anchor.split(' ')[0];
            return lineMapping[`${firstWord}_${pId}`] || "X";
        }

        // 2. Fallback: Try to find a quoted word in the question
        const quoteMatch = qText.match(/['"](.*?)['"]/);
        if (quoteMatch) {
            const word = quoteMatch[1].split(' ')[0].toLowerCase().trim();
            return lineMapping[`${word}_${pId}`] || "X";
        }
        return "X";
    };
    const isDev = window.location.hostname === 'localhost' || 
                  window.location.hostname === '127.0.0.1' || 
                  window.location.hostname.startsWith('192.168.') || 
                  window.location.hostname.startsWith('10.');

    const { paperId } = useParams();
    const navigate = useNavigate();
    const { user, profile } = useAuth();
    const { englishTutor } = useAvatar();
    const [searchParams, setSearchParams] = useSearchParams();

    const [phase, setPhase] = useState(searchParams.get('phase') || 'LOADING'); // LOADING, BRIEFING, SELECTOR, EXAM, RESULTS
    const [mockData, setMockData] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);

    // Helper to update phase and URL
    const updatePhase = useCallback((newPhase) => {
        setPhase(newPhase);
        setSearchParams({ phase: newPhase });
    }, [setSearchParams]);

    // Sync phase with URL
    useEffect(() => {
        const urlPhase = searchParams.get('phase');
        if (urlPhase && urlPhase !== phase) {
            setPhase(urlPhase);
        }
    }, [searchParams, phase]);
    const [selectedSection, setSelectedSection] = useState(null); // 'B1' or 'B2'
    const [userAnswers, setUserAnswers] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(90 * 60);
    const [assessmentResults, setAssessmentResults] = useState(null);
    const [showForkWarning, setShowForkWarning] = useState(false);
    const [pendingSection, setPendingSection] = useState(null);

    const [leftWidth, setLeftWidth] = useState(50);
    const [isResizing, setIsResizing] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const tier = profile?.subscription_tier || 'free';

    const [activePart, setActivePart] = useState('A'); // 'A' or 'B'
    const [isMarkingSchemeOpen, setIsMarkingSchemeOpen] = useState(false);
    const [showQuitModal, setShowQuitModal] = useState(false);
    
    // Sectional Timing Analytics
    const [sectionTimes, setSectionTimes] = useState({ A: 0, B: 0 });
    
    const resourceScrollRef = useRef(null);
    const questionScrollRef = useRef(null);
    const paragraphRefs = useRef({});

    // Fetch Mock Data
    useEffect(() => {
        const fetchMock = async () => {
            // Fetch Lock: Prevent double-fetches from StrictMode
            if (window._isFetchingMockReading === paperId) return;
            window._isFetchingMockReading = paperId;

            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                const res = await fetch(`${API_URL}/api/english/mock/${paperId}?uid=${user?.uid || 'guest'}`);
                if (res.ok) {
                    const data = await res.json();
                    
                    const urlPhase = searchParams.get('phase');
                    const saved = localStorage.getItem(`mock_save_${paperId}`);

                    if (urlPhase === 'RESULTS') {
                        const savedResults = localStorage.getItem(`mock_results_reading_${paperId}`);
                        if (savedResults) {
                            try {
                                setAssessmentResults(JSON.parse(savedResults));
                            } catch (e) {
                                console.error("Failed to load saved results:", e);
                                updatePhase('BRIEFING');
                            }
                        } else {
                            updatePhase('BRIEFING');
                        }
                    } else if (saved) {
                        try {
                            const { answers, section, time, phase: savedPhase, sectionTimes: savedSectionTimes } = JSON.parse(saved);
                            setUserAnswers(answers || {});
                            if (section) setSelectedSection(section);
                            if (time) setTimeRemaining(time);
                            if (savedSectionTimes) setSectionTimes(savedSectionTimes);
                            
                            if (savedPhase === 'EXAM') {
                                updatePhase('EXAM');
                            } else if (!urlPhase) {
                                updatePhase('BRIEFING');
                            }
                        } catch (err) {
                            console.error("Failed to load auto-save:", err);
                            if (!urlPhase) updatePhase('BRIEFING');
                        }
                    } else if (!urlPhase) {
                        updatePhase('BRIEFING');
                    }
                    // Set mock data last to ensure all other state is restored first
                    setMockData(data);
                    setIsInitialized(true);
                } else {
                    navigate('/mock-exam-eng');
                }
            } catch (err) {
                console.error("Error fetching mock:", err);
                navigate('/mock-exam-eng');
            } finally {
                // Keep the lock for 2 seconds to bridge the StrictMode gap
                setTimeout(() => { window._isFetchingMockReading = null; }, 2000);
            }
        };
        fetchMock();
    }, [paperId, navigate]);

    // Auto-save effect
    useEffect(() => {
        if (isInitialized && phase === 'EXAM' && paperId) {
            const saveData = {
                answers: userAnswers,
                section: selectedSection,
                time: timeRemaining,
                sectionTimes: sectionTimes,
                phase: 'EXAM',
                timestamp: Date.now()
            };
            localStorage.setItem(`mock_save_${paperId}`, JSON.stringify(saveData));
            // Also update a global "last mock" pointer for the Library page
            localStorage.setItem('last_mock_inprogress_reading', JSON.stringify({ paperId, topic: mockData?.meta?.topic, type: 'reading' }));
        }
    }, [userAnswers, selectedSection, timeRemaining, sectionTimes, phase, paperId, mockData]);

    // Master Timer Loop
    useEffect(() => {
        if (phase !== 'EXAM') return;

        const timer = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 0) {
                    clearInterval(timer);
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });

            // Track sectional time
            setSectionTimes(prev => ({
                ...prev,
                [activePart]: prev[activePart] + 1
            }));
        }, 1000);

        return () => clearInterval(timer);
    }, [phase, activePart]);

    useEffect(() => {
        if (resourceScrollRef.current) resourceScrollRef.current.scrollTop = 0;
        if (questionScrollRef.current) questionScrollRef.current.scrollTop = 0;
    }, [activePart]);

    const handleStartSelector = () => updatePhase('SELECTOR');
    
    const handleTrySelectSection = (section) => {
        if (section === 'B1') {
            setPendingSection(section);
            setShowForkWarning(true);
        } else {
            setSelectedSection(section);
            updatePhase('EXAM');
        }
    };

    const confirmSection = () => {
        setSelectedSection(pendingSection);
        updatePhase('EXAM');
        setShowForkWarning(false);
    };

    const [submissionProgress, setSubmissionProgress] = useState(0);

    const handleSubmit = async () => {
        if (tier === 'free') {
            setShowUpgradeModal(true);
            return;
        }
        if (isSubmitting) return;
        setIsSubmitting(true);
        setSubmissionProgress(0);
        
        // Progress Simulation
        const progressInterval = setInterval(() => {
            setSubmissionProgress(prev => {
                if (prev >= 92) {
                    clearInterval(progressInterval);
                    return 92;
                }
                return prev + (prev < 50 ? 5 : 2);
            });
        }, 1500);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 420000); // 420s timeout for massive papers

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const token = await user?.getIdToken?.();
            const res = await fetch(`${API_URL}/api/english/mock/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                signal: controller.signal,
                body: JSON.stringify({ 
                    paperId, 
                    userAnswers,
                    uid: user?.uid || 'guest',
                    analytics: {
                        selectedSection,
                        sectionTimes,
                        totalTimeSpent: (90 * 60) - timeRemaining
                    }
                })
            });
            
            clearInterval(progressInterval);
            setSubmissionProgress(100);
            clearTimeout(timeoutId);

            if (res.ok) {
                const results = await res.json();
                setAssessmentResults(results);
                localStorage.setItem(`mock_results_reading_${paperId}`, JSON.stringify(results));
                setTimeout(() => updatePhase('RESULTS'), 500); // Small pause for 100% state
                localStorage.removeItem(`mock_save_${paperId}`);
                localStorage.removeItem('last_mock_inprogress_reading');
            } else {
                const error = await res.json();
                alert(`Submission failed: ${error.error || 'Server error'}`);
            }
        } catch (err) {
            clearInterval(progressInterval);
            console.error("Submission error:", err);
            if (err.name === 'AbortError') {
                alert("Submission timed out. The AI analysis is taking longer than expected. Please try again.");
            } else {
                alert("Submission failed. Please check your connection and try again.");
            }
        } finally {
            setTimeout(() => {
                setIsSubmitting(false);
            }, 1000);
        }
    };


    const handleCheatMode = (level) => {
        const autoAnswers = {};
        const allQuestions = [
            ...(mockData?.Part_A?.questions || []),
            ...(mockData?.Part_B1?.questions || []),
            ...(mockData?.Part_B2?.questions || [])
        ];

        // Probabilities of being correct based on level
        const accuracyMap = {
            '5** (P)': 1.0,
            '5**': 1.0,
            '5*': 1.0,
            '5': 0.9,
            '4': 0.75,
            '3': 0.5
        };
        const accuracy = accuracyMap[level] || 0.4;

        const getWrongMC = (correct) => {
            const opts = ['A', 'B', 'C', 'D'].filter(o => o !== correct);
            return opts[Math.floor(Math.random() * opts.length)];
        };


        allQuestions.forEach(q => {
            const isCorrect = Math.random() < accuracy;
            
            if (q.type === 'Multiple_Choice' || q.type === 'mc_main_idea') {
                const correct = q.marking_scheme.trim().charAt(0);
                autoAnswers[q.id] = isCorrect ? correct : getWrongMC(correct);
            } 
            else if (q.type === 'tf_ng') {
                const cheatItems = (q.items || []).map(item => {
                    const isCorrectItem = Math.random() < accuracy;
                    const choice = isCorrectItem ? item.answer : (item.answer === 'TRUE' ? 'FALSE' : 'TRUE');
                    
                    // Use REAL justification if available, or a contextual paraphrase
                    let justification = "";
                    if (choice === 'FALSE') {
                        justification = isCorrectItem 
                            ? (item.justification || `The text actually states the opposite.`) 
                            : "The author never mentions this point specifically.";
                    }
                    
                    return { choice, justification };
                });
                autoAnswers[q.id] = cheatItems;
            } 
            else if (q.type === 'summary_cloze' || q.type === 'flow_chart') {
                const sub = {};
                Object.entries(q.answers || {}).forEach(([k, v]) => {
                    const itemCorrect = Math.random() < accuracy;
                    if (itemCorrect) {
                        sub[k] = v;
                    } else if (level === '4') {
                        // Near miss or minor typo
                        sub[k] = v.substring(0, v.length - 1);
                    } else {
                        sub[k] = "";
                    }
                });
                autoAnswers[q.id] = sub;
            } 
            else if (q.type === 'vocab_match') {
                const sub = {};
                Object.entries(q.pairs || {}).forEach(([k, v]) => {
                    const itemCorrect = Math.random() < accuracy;
                    sub[k] = itemCorrect ? v : "";
                });
                autoAnswers[q.id] = sub;
            } 
            else {
                // Open Ended
                const scheme = q.marking_scheme || "";
                if (level === '5*' || level === '5**') {
                    autoAnswers[q.id] = scheme;
                } else if (level === '5** (P)') {
                    // Advanced Semantic Paraphrasing: Vary syntax and vocabulary
                    let paraphrased = scheme;
                    if (scheme.split(' ').length > 4) {
                        const variations = [
                            (s) => `According to the passage, ${s.charAt(0).toLowerCase()}${s.slice(1)}`,
                            (s) => `The author implies that ${s.charAt(0).toLowerCase()}${s.slice(1)}`,
                            (s) => `${s.replace(/^The writer /i, "The creator of the text ")}`,
                            (s) => `One could argue that ${s.charAt(0).toLowerCase()}${s.slice(1)}`,
                            (s) => `${s.replace(/\./g, "")} (as stated in the extract).`
                        ];
                        const transform = variations[Math.floor(Math.random() * variations.length)];
                        paraphrased = transform(scheme);
                    }
                    autoAnswers[q.id] = paraphrased;
                } else if (isCorrect) {
                    if (level === '5') {
                        autoAnswers[q.id] = q.marking_logic?.key_phrases?.join(' ') || scheme;
                    } else if (level === '4') {
                        // Take the primary point only
                        const primary = q.marking_logic?.key_phrases?.[0] || scheme.split(/[,.;]/)[0];
                        autoAnswers[q.id] = primary ? primary.trim() + "." : "It relates to " + scheme.substring(0, 15);
                    } else {
                        autoAnswers[q.id] = scheme.substring(0, 20) + "...";
                    }
                } else {
                    autoAnswers[q.id] = level === '3' ? "I don't know." : "The writer mentions this in the text.";
                }
            }
        });
        setUserAnswers(autoAnswers);
        alert(`Cheat Mode: Level ${level} intelligence simulated!`);
    };

    const startResizing = (e) => {
        setIsResizing(true);
        e.preventDefault();
    };

    const stopResizing = () => {
        setIsResizing(false);
    };

    const onResize = useCallback((e) => {
        if (!isResizing) return;
        const newWidth = (e.clientX / window.innerWidth) * 100;
        if (newWidth > 30 && newWidth < 80) {
            setLeftWidth(newWidth);
        }
    }, [isResizing]);

    useEffect(() => {
        if (isResizing) {
            window.addEventListener('mousemove', onResize);
            window.addEventListener('mouseup', stopResizing);
        } else {
            window.removeEventListener('mousemove', onResize);
            window.removeEventListener('mouseup', stopResizing);
        }
        return () => {
            window.removeEventListener('mousemove', onResize);
            window.removeEventListener('mouseup', stopResizing);
        };
    }, [isResizing, onResize]);

    const scrollToParagraph = (pId) => {
        const el = paragraphRefs.current[pId];
        if (el && resourceScrollRef.current) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.classList.add('bg-indigo-50/50');
            setTimeout(() => el.classList.remove('bg-indigo-50/50'), 2000);
        }
    };

    const handleAnswerChange = (qId, value) => {
        setUserAnswers(prev => ({ ...prev, [qId]: value }));
    };


    if (phase === 'LOADING' || (!mockData && phase !== 'RESULTS')) {
        return (
            <LoadingPage 
                title="Calibrating HKEAA Arena..." 
                subtext="Setting up HKDSE Paper 1 environment and indexing passage resources."
            />
        );
    }

    if (phase === 'BRIEFING') {
        return (
            <div className="h-screen bg-white flex items-center justify-center p-8 selection:bg-rose-100 italic-none">
                <div className="max-w-2xl w-full">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 leading-tight">Reading Paper Instructions</h1>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Paper 1 | {mockData?.meta?.topic}</p>
                        </div>
                    </div>

                    <div className="space-y-6 bg-slate-50 p-8 rounded-[2rem] border border-slate-100 mb-10 text-slate-600 font-medium leading-relaxed font-sans">
                        <p>1. This paper consists of **two parts**: Part A and Part B.</p>
                        <p>2. **Part A** is compulsory for all candidates.</p>
                        <p>3. In **Part B**, you must choose **EITHER** B1 (Easier) **OR** B2 (Harder).</p>
                        <p>4. Time allowed: **90 minutes**.</p>
                        <p>5. AI assistance, hints, and retries are strictly prohibited.</p>
                    </div>


                    <div className="flex gap-4">
                        <button 
                            onClick={() => navigate('/mock-exam-eng', { state: { activeTab: 'reading' } })}
                            className="flex-1 py-5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-black uppercase tracking-[0.2em] transition-all text-xs"
                        >
                            Go Back
                        </button>
                        <button 
                            onClick={handleStartSelector}
                            className="flex-[2] py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-900/20 active:scale-95 transition-all text-xs"
                        >
                            I Understand, Continue
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (phase === 'SELECTOR') {
        return (
            <div className="h-screen bg-slate-900 flex items-center justify-center p-8 selection:bg-rose-100 text-white italic-none">
                <AnimatePresence>
                    {showForkWarning && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
                        >
                            <motion.div 
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="bg-white text-slate-900 p-10 rounded-[3rem] max-w-md w-full shadow-2xl text-center"
                            >
                                <div className="p-4 bg-rose-100 text-rose-600 rounded-full w-fit mx-auto mb-6">
                                    <AlertCircle size={32} />
                                </div>
                                <h3 className="text-2xl font-black mb-4 uppercase">Important Warning</h3>
                                <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                                    You have selected the **Easier (B1)** path. Please note that choosing this section caps your overall grade for this paper at **Level 4**. 
                                    Do you wish to proceed?
                                </p>
                                <div className="space-y-3">
                                    <button 
                                        onClick={confirmSection}
                                        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest"
                                    >
                                        Yes, I Accept Level 4 Cap
                                    </button>
                                    <button 
                                        onClick={() => setShowForkWarning(false)}
                                        className="w-full py-4 bg-slate-100 text-slate-400 rounded-2xl font-black uppercase text-xs tracking-widest"
                                    >
                                        Go Back
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="max-w-4xl w-full">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-black mb-4 tracking-tight leading-tight uppercase">Select your Reading Path</h2>
                        <p className="text-slate-400 font-medium italic">Part A is Compulsory. Which Part B will you attempt?</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                        <div 
                            onClick={() => handleTrySelectSection('B1')}
                            className="group bg-slate-800 border-2 border-slate-700 hover:border-emerald-500 p-10 rounded-[3rem] cursor-pointer transition-all hover:-translate-y-2"
                        >
                            <div className="mb-6 flex justify-between items-start">
                                <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-500">
                                    <BookOpen size={32} />
                                </div>
                                <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest">Easier (B1)</span>
                            </div>
                            <h3 className="text-3xl font-black mb-4 uppercase">Section B1</h3>
                            <p className="text-slate-400 leading-relaxed mb-8">Suitable for candidates aiming for **Level 4**. The text is less complex with more straightforward questions.</p>
                            <div className="flex items-center gap-2 text-emerald-500 font-black text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                Select Path <ChevronRight size={16} />
                            </div>
                        </div>

                        <div 
                            onClick={() => handleTrySelectSection('B2')}
                            className="group bg-slate-800 border-2 border-slate-700 hover:border-rose-500 p-10 rounded-[3rem] cursor-pointer transition-all hover:-translate-y-2 text-white"
                        >
                            <div className="mb-6 flex justify-between items-start">
                                <div className="p-4 bg-rose-500/10 rounded-2xl text-rose-500">
                                    <Lock size={32} />
                                </div>
                                <span className="bg-rose-500/20 text-rose-400 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest">Harder (B2)</span>
                            </div>
                            <h3 className="text-3xl font-black mb-4 uppercase">Section B2</h3>
                            <p className="text-slate-400 leading-relaxed mb-8">Required for candidates aiming for **Level 5, 5*, or 5**. Passages are academic and require deep analysis.</p>
                            <div className="flex items-center gap-2 text-rose-500 font-black text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                Select Path <ChevronRight size={16} />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-slate-500 text-[11px] font-black uppercase tracking-[0.2em]">
                        <AlertCircle size={14} />
                        Crucial: You cannot change your selection once the paper begins.
                    </div>
                </div>
            </div>
        );
    }

    if (phase === 'EXAM' || phase === 'REVIEW') {
        const partA = mockData?.Part_A;
        const partB = mockData?.[`Part_${selectedSection}`];

        return (
            <div className="h-screen bg-slate-50 flex flex-col font-sans selection:bg-rose-100 italic-none overflow-hidden">
                {/* Header */}
                <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4 flex items-center justify-between z-50">
                    <div className="flex items-center gap-6">
                        <button 
                            onClick={() => {
                                if (phase === 'REVIEW') {
                                    navigate('/mock-exam-eng');
                                } else {
                                    setShowQuitModal(true);
                                }
                            }}
                            className="p-3 text-slate-400 hover:text-slate-600 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all"
                        >
                            <ArrowLeft size={18} />
                        </button>
                        <div>
                             <h1 className="text-lg font-black text-slate-800 tracking-tight">{mockData?.meta?.topic}</h1>
                             <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Reading Mock P1</span>
                                <span className="text-slate-300">/</span>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Section: Part A + {selectedSection}</span>
                             </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {phase === 'REVIEW' ? (
                            <div className="bg-slate-900 rounded-[1.25rem] px-6 py-3 border border-white/10 shadow-xl flex items-center gap-3">
                                <div className="size-8 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-900/40">
                                    <CheckCircle2 size={16} />
                                </div>
                                <span className="text-xs font-black text-white uppercase tracking-widest">Reviewing Performance</span>
                            </div>
                        ) : (
                            <div className="bg-slate-900 rounded-[1.25rem] px-6 py-3 border border-white/10 shadow-xl flex items-center gap-4">
                                {isCheatEnabled(user, profile) && (
                                    <div className="flex items-center gap-2 pr-4 border-r border-white/10">
                                        <span className="text-[11px] font-black text-rose-400 uppercase tracking-tighter">Cheat:</span>
                                        {['3', '4', '5', '5*', '5**', '5** (P)'].map(lvl => (
                                            <button 
                                                key={lvl}
                                                onClick={() => handleCheatMode(lvl)}
                                                className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-md text-[11px] font-black text-white hover:bg-rose-600 hover:border-rose-600 transition-all"
                                            >
                                                {lvl}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                <MockCountdownTimer 
                                    seconds={timeRemaining} 
                                    onTimeUp={() => {
                                        alert("Time is up! Submitting your answers...");
                                        handleSubmit();
                                    }} 
                                />
                            </div>
                        )}
                        <button 
                            onClick={phase === 'REVIEW' ? () => updatePhase('RESULTS') : handleSubmit}
                            disabled={isSubmitting}
                            className={`${phase === 'REVIEW' ? 'bg-slate-800' : 'bg-indigo-600 hover:bg-indigo-700'} text-white px-8 py-3.5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg active:scale-95 transition-all outline-none disabled:opacity-70 disabled:cursor-wait flex items-center gap-2`}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={14} className="animate-spin" />
                                    Submitting...
                                </>
                            ) : phase === 'REVIEW' ? (
                                'Return to Results'
                            ) : (
                                'Final Submission'
                            )}
                        </button>
                    </div>
                </header>

                <AnimatePresence>
                    {isSubmitting && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[200] bg-slate-900/90 backdrop-blur-xl flex flex-col items-center justify-center text-center p-8"
                        >
                            <div className="relative mb-12">
                                <div className="size-32 border-4 border-white/10 border-t-indigo-500 rounded-full animate-spin" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <BrainCircuit size={48} className="text-white animate-pulse" />
                                </div>
                            </div>
                            <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">Pedagogical Analysis in Progress</h2>
                            <p className="text-indigo-200 text-sm font-medium max-w-md leading-relaxed">
                                {englishTutor?.name || "Miss Janie"} is evaluating your responses against the <span className="text-white font-bold">HKEAA Marking Rubric</span> and cross-referencing textual evidence...
                            </p>
                            <div className="mt-8 w-full max-w-sm space-y-4">
                                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden border border-white/5">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${submissionProgress}%` }}
                                        className="h-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.6)]"
                                    />
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300">
                                    <span>Syncing Rubric</span>
                                    <span>{submissionProgress}%</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {showQuitModal && (
                        <div className="fixed inset-0 z-[200] flex items-center justify-center p-8">
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowQuitModal(false)}
                                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                            />
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="bg-white w-full max-w-md p-10 rounded-[3rem] shadow-2xl relative text-center"
                            >
                                <div className="size-16 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-sm">
                                    <Clock size={32} />
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tight">Pause Examination?</h2>
                                <p className="text-slate-500 font-medium mb-10 leading-relaxed text-sm">
                                    Don't worry—your progress is being <span className="text-slate-900 font-bold">automatically saved</span>. You can safely return to the Selection Hub and resume this paper exactly where you left off.
                                </p>
                                <div className="space-y-3">
                                    <button 
                                        onClick={() => navigate('/mock-exam-eng')}
                                        className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-900/10 active:scale-95"
                                    >
                                        Save & Quit
                                    </button>
                                    <button 
                                        onClick={() => setShowQuitModal(false)}
                                        className="w-full py-5 bg-slate-50 text-slate-400 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-100 transition-all active:scale-95"
                                    >
                                        Keep Working
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Section Navigation */}
                <div className="bg-white border-b border-slate-100 flex items-center justify-center p-4 gap-4 z-40 shadow-sm shrink-0">
                    <button 
                        onClick={() => setActivePart('A')}
                        className={`px-8 py-3 rounded-full text-xs font-black uppercase tracking-[0.2em] transition-all transform active:scale-95 ${
                            activePart === 'A' 
                                ? 'bg-[#f15a24] text-white shadow-xl shadow-orange-200 ring-4 ring-orange-50' 
                                : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                        }`}
                    >
                        Compulsory | Part A
                    </button>
                    <div className="w-px h-6 bg-slate-200" />
                    <button 
                        onClick={() => setActivePart('B')}
                        className={`px-8 py-3 rounded-full text-xs font-black uppercase tracking-[0.2em] transition-all transform active:scale-95 ${
                            activePart === 'B' 
                                ? 'bg-[#f15a24] text-white shadow-xl shadow-orange-200 ring-4 ring-orange-50' 
                                : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                        }`}
                    >
                        Elective | Part {selectedSection}
                    </button>
                </div>

                {/* Main Exam Layout */}
                <div className="flex-1 flex overflow-hidden">
                    <div 
                        ref={resourceScrollRef}
                        className="overflow-y-auto bg-slate-100 p-12 border-r border-slate-200 custom-scrollbar scroll-smooth relative"
                        style={{ width: `${leftWidth}%` }}
                    >
                        <div className="max-w-[700px] mx-auto space-y-16 pb-32">
                            {activePart === 'A' ? (
                                /* Part A Resources */
                                <div className="space-y-12">
                                    {Object.values(partA?.resources || {}).map((text, idx) => (
                                        <div key={idx} className="bg-white p-12 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden resource-container">
                                            <div className="absolute left-0 top-0 bottom-0 w-8 bg-slate-50/50 flex flex-col pt-32 text-[10px] font-black text-slate-300 leading-relaxed border-r border-slate-100 items-center gap-[4.5rem]">
                                                <span>5</span><span>10</span><span>15</span><span>20</span><span>25</span><span>30</span><span>35</span>
                                            </div>
                                            <div className="pl-6">
                                                <h2 className="text-3xl font-black text-slate-900 mb-2 leading-tight">{text.title}</h2>
                                                <p className="text-slate-400 font-bold text-sm mb-12 uppercase tracking-widest leading-relaxed">{text.subheading}</p>
                                                <div className="space-y-8">
                                                    {Object.entries(text.content || {}).map(([pId, p]) => (
                                                        <div 
                                                            key={pId} 
                                                            ref={el => paragraphRefs.current[pId] = el}
                                                            className="relative group/p transition-colors duration-500 rounded-xl"
                                                        >
                                                            <span className={`absolute -left-12 top-0 text-[11px] font-black uppercase tracking-tighter transition-colors ${
                                                                highlightedLine && Object.keys(lineMapping).some(k => k.endsWith(`_${pId}`) && lineMapping[k] === highlightedLine) ? "text-indigo-500" : "text-slate-200"
                                                            }`}>[{pId}]</span>
                                                            <MeasuredParagraph pId={pId} content={p} onLineCalculated={updateLines} highlightedLine={highlightedLine} lineMapping={lineMapping} />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                /* Part B Resources */
                                <div className="space-y-12">
                                    {Object.values(partB?.resources || {}).map((text, idx) => (
                                        <div key={idx} className={`bg-white p-12 rounded-[2.5rem] shadow-sm border-2 relative overflow-hidden resource-container ${selectedSection === 'B1' ? 'border-emerald-100' : 'border-rose-100'}`}>
                                            <div className="absolute left-0 top-0 bottom-0 w-8 bg-slate-50/50 flex flex-col pt-32 text-[10px] font-black text-slate-300 leading-relaxed border-r border-slate-100 items-center gap-[4.5rem]">
                                                <span>5</span><span>10</span><span>15</span><span>20</span><span>25</span><span>30</span><span>35</span><span>40</span><span>45</span>
                                            </div>
                                            <div className="pl-6">
                                                <h2 className="text-3xl font-black text-slate-900 mb-2 leading-tight">{text.title}</h2>
                                                <p className="text-slate-400 font-bold text-sm mb-12 uppercase tracking-widest leading-relaxed">{text.subheading}</p>
                                                <div className="space-y-8">
                                                    {Object.entries(text.content || {}).map(([pId, p]) => (
                                                        <div 
                                                            key={pId} 
                                                            ref={el => paragraphRefs.current[pId] = el}
                                                            className="relative group/p transition-colors duration-500 rounded-xl"
                                                        >
                                                            <span className={`absolute -left-12 top-0 text-[11px] font-black uppercase tracking-tighter transition-colors ${
                                                                highlightedLine && Object.keys(lineMapping).some(k => k.endsWith(`_${pId}`) && lineMapping[k] === highlightedLine) ? "text-indigo-500" : "text-slate-200"
                                                            }`}>[{pId}]</span>
                                                            <MeasuredParagraph pId={pId} content={p} onLineCalculated={updateLines} highlightedLine={highlightedLine} lineMapping={lineMapping} />
                                                        </div>
                                                    ))}
                                                    {text.images?.map((img, iIdx) => (
                                                        <div key={iIdx} className="my-8 flex flex-col items-center gap-4">
                                                            <motion.div 
                                                                whileHover={{ scale: 1.02 }}
                                                                onClick={() => setZoomedImage(img)}
                                                                className="bg-white p-4 rounded-3xl border border-slate-100 shadow-xl overflow-hidden max-w-lg cursor-zoom-in relative group/img"
                                                            >
                                                                <img src={img.url} alt={img.caption} className="w-full h-auto rounded-2xl" />
                                                                <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/10 transition-colors flex items-center justify-center">
                                                                    <Sparkles className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={32} />
                                                                </div>
                                                            </motion.div>
                                                            <p className="text-xs font-bold text-slate-400 italic text-center max-w-sm">{img.caption}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Resize Handle */}
                    <div 
                        onMouseDown={startResizing}
                        className={`w-1.5 cursor-col-resize hover:bg-indigo-400 transition-colors z-50 ${isResizing ? 'bg-indigo-500' : 'bg-slate-200'}`}
                    />

                    {/* Right Side: Questions */}
                    <div 
                        ref={questionScrollRef}
                        className="flex-1 bg-white overflow-y-auto px-10 py-12 custom-scrollbar shadow-[-10px_0_30px_rgba(0,0,0,0.02)]"
                    >
                        <div className="max-w-xl mx-auto space-y-16 pb-32">
                            <div className="space-y-8">
                                <div className="flex items-center justify-between border-b pb-4 mb-8">
                                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]">HKEAA Answer Sheet | Part {activePart === 'A' ? 'A' : selectedSection}</h3>
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                        <HelpCircle size={12} />
                                        <span>Click paragraph IDs [p1] to jump to text</span>
                                    </div>
                                </div>
                                
                                {/* Filtered Question list */}
                                {(activePart === 'A' ? partA?.questions : partB?.questions)?.map((q, idx) => (
                                    <div 
                                        key={q.id} 
                                        className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 hover:border-indigo-200 transition-all shadow-sm group"
                                        onMouseEnter={() => setHighlightedLine(getLineForQuestion(q))}
                                        onMouseLeave={() => setHighlightedLine(null)}
                                    >
                                        <div className="flex items-start gap-4 mb-6">
                                            <div className="size-8 bg-slate-900 text-white rounded-xl flex items-center justify-center text-xs font-black shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                                                {(() => {
                                                    const partALen = mockData?.Part_A?.questions?.length || 0;
                                                    const partB1Len = mockData?.Part_B1?.questions?.length || 0;
                                                    if (activePart === 'A') {
                                                        return idx + 1;
                                                    }
                                                    // Part B logic - follow A continuously
                                                    if (selectedSection === 'B1') {
                                                        return idx + partALen + 1;
                                                    } else {
                                                        // B2 follows B1
                                                        return idx + partALen + partB1Len + 1;
                                                    }
                                                })()}
                                            </div>
                                            <div className="pt-1">
                                                <p className="text-sm font-bold text-slate-800 leading-relaxed">
                                                    {q.question.replace(/\(line X\)/g, `(line ${getLineForQuestion(q)})`).split(/\[(p\d+)\]/g).map((part, i) => {
                                                        if (part.match(/^p\d+$/)) {
                                                            return (
                                                                <button 
                                                                    key={i}
                                                                    onClick={() => scrollToParagraph(part)}
                                                                    className="mx-1 px-1.5 py-0.5 bg-indigo-100 text-indigo-600 rounded-md hover:bg-indigo-600 hover:text-white transition-all text-[11px]"
                                                                >
                                                                    {part}
                                                                </button>
                                                            );
                                                        }
                                                        return part;
                                                    })}
                                                    <span className="ml-2 text-slate-400 font-black text-[11px] tracking-tight">({q.marks} marks)</span>
                                                </p>
                                                {q.skill_tag && (
                                                    <div className="mt-2 flex gap-2">
                                                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{q.skill_tag}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="pl-12">
                                            {/* Render different question types */}
                                            {q.type === 'Multiple_Choice' || q.type === 'mc_main_idea' ? (
                                                <div className="space-y-2.5">
                                                    {q.options.map((opt, oIdx) => (
                                                        <button 
                                                            key={oIdx}
                                                            onClick={() => phase !== 'REVIEW' && handleAnswerChange(q.id, opt.charAt(0))}
                                                            disabled={phase === 'REVIEW'}
                                                            className={`w-full text-left p-4 rounded-2xl border text-xs font-bold transition-all flex items-center justify-between group/opt ${
                                                                userAnswers[q.id] === opt.charAt(0)
                                                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-900/20 translate-x-2'
                                                                : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'
                                                            }`}
                                                        >
                                                            <span>{opt}</span>
                                                            {userAnswers[q.id] === opt.charAt(0) && <Check size={14} />}
                                                        </button>
                                                    ))}
                                                </div>
                                            ) : q.type === 'tf_ng' ? (
                                                <TFNGTable question={q} userAnswers={userAnswers} onChange={handleAnswerChange} disabled={phase === 'REVIEW'} />
                                            ) : q.type === 'summary_cloze' ? (
                                                <SummaryCloze question={q} userAnswers={userAnswers} onChange={handleAnswerChange} disabled={phase === 'REVIEW'} />
                                            ) : q.type === 'flow_chart' ? (
                                                <FlowChart question={q} userAnswers={userAnswers} onChange={handleAnswerChange} disabled={phase === 'REVIEW'} />
                                            ) : q.type === 'vocab_match' ? (
                                                <VocabMatch question={q} userAnswers={userAnswers} onChange={handleAnswerChange} disabled={phase === 'REVIEW'} />
                                            ) : (
                                                <div className="w-full relative">
                                                    <textarea 
                                                        className="w-full bg-white border border-slate-200 rounded-[2rem] p-6 text-sm font-bold text-slate-800 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none resize-none overflow-hidden"
                                                        placeholder="Type your answer here..."
                                                        rows={2}
                                                        disabled={phase === 'REVIEW'}
                                                        value={userAnswers[q.id] || ''}
                                                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                                        onInput={(e) => {
                                                            e.target.style.height = 'auto';
                                                            e.target.style.height = e.target.scrollHeight + 'px';
                                                        }}
                                                    />
                                                </div>
                                            )}

                                            {/* Model Answer for Review Mode */}
                                            {phase === 'REVIEW' && (
                                                <div className="mt-4 p-5 bg-white rounded-3xl border border-indigo-100 shadow-sm">
                                                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2">HKEAA Model Answer</p>
                                                    <div className="text-xs font-bold text-slate-700 leading-relaxed">
                                                        {q.type === 'Multiple_Choice' || q.type === 'mc_main_idea' ? (
                                                            <span>Option {q.marking_scheme}</span>
                                                        ) : q.type === 'vocab_match' ? (
                                                            <div className="grid grid-cols-2 gap-2">
                                                                {Object.entries(q.pairs).map(([w, m]) => (
                                                                    <div key={w} className="bg-slate-50 p-2 rounded-lg border border-slate-100 flex justify-between">
                                                                        <span className="text-slate-400">{w}</span>
                                                                        <span>{m}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : q.type === 'tf_ng' ? (
                                                            <div className="space-y-3">
                                                                {q.items.map((item, idx) => (
                                                                    <div key={idx} className="flex flex-col gap-1">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[9px] font-black">{idx + 1}</span>
                                                                            <span className="font-black text-indigo-500">{item.answer}</span>
                                                                        </div>
                                                                        {item.answer === 'FALSE' && item.justification && (
                                                                            <p className="text-[11px] text-slate-400 italic pl-6">Justification: {item.justification}</p>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <span>{q.marking_scheme || Object.values(q.answers || {}).join(' | ')}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Miss Janie's Professional Feedback (HKEAA Rubric) */}
                                            {assessmentResults?.results?.[q.id] && (phase === 'REVIEW' || phase === 'RESULTS') && (
                                                <div className={`mt-6 p-5 rounded-[2rem] border-l-4 shadow-sm ${
                                                    assessmentResults.results[q.id].status === 'correct' ? 'bg-emerald-50/50 border-emerald-500' :
                                                    assessmentResults.results[q.id].status === 'partial' ? 'bg-amber-50/50 border-amber-500' : 'bg-rose-50/50 border-rose-500'
                                                }`}>
                                                    <div className="flex gap-4">
                                                        <div className="size-10 rounded-full overflow-hidden shrink-0 border-2 border-white shadow-md">
                                                            <img src={englishTutor?.avatar || "/avatars/Miss_Janie.jpg"} alt={englishTutor?.name || "Janie"} className="w-full h-full object-cover" />
                                                        </div>
                                                        <div className="flex-1 space-y-2">
                                                            <div className="flex items-center justify-between">
                                                                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Examiner's Feedback</p>
                                                                <div className="px-2 py-0.5 bg-white rounded-lg text-[11px] font-black text-slate-600 border border-slate-100">
                                                                    Score: {assessmentResults.results[q.id].score} / {q.marks}
                                                                </div>
                                                            </div>
                                                            <div className="space-y-3">
                                                                <p className="text-sm font-bold text-slate-800 leading-relaxed">
                                                                    {(() => {
                                                                        const raw = assessmentResults.results[q.id].feedback || "Evaluated based on HKEAA criteria. Review the model answer above for key terminology.";
                                                                        const parts = raw.split(/(Suggestion:|Consideration:|Tip:)/i);
                                                                        return parts[0];
                                                                    })()}
                                                                </p>
                                                                {(() => {
                                                                    const raw = assessmentResults.results[q.id].feedback || "";
                                                                    const match = raw.match(/(Suggestion:|Consideration:|Tip:)(.*)/i);
                                                                    if (match) {
                                                                        return (
                                                                            <div className="p-3 bg-white/60 rounded-xl border border-white/40 flex items-start gap-2 shadow-sm">
                                                                                <div className="size-5 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                                                                                    <HelpCircle size={12} />
                                                                                </div>
                                                                                <p className="text-[11px] font-bold text-slate-500 italic leading-relaxed">
                                                                                    <span className="text-indigo-600 font-black uppercase mr-1">{match[1]}</span>
                                                                                    {match[2]}
                                                                                </p>
                                                                            </div>
                                                                        );
                                                                    }
                                                                    return (
                                                                        <div className="p-3 bg-white/60 rounded-xl border border-white/40 flex items-start gap-2 shadow-sm">
                                                                            <div className="size-5 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                                                                                <CheckCircle2 size={12} />
                                                                            </div>
                                                                            <p className="text-[11px] font-bold text-slate-500 italic leading-relaxed">
                                                                                <span className="text-indigo-600 font-black uppercase mr-1">Professional Advice:</span>
                                                                                {assessmentResults.results[q.id].professionalAdvice || "To push for Level 5**, ensure you maintain this level of precision across the entire paper under timed conditions."}
                                                                            </p>
                                                                        </div>
                                                                    );
                                                                })()}
                                                                
                                                                {/* Sub-results for multi-part questions (TFNG, Summary etc) */}
                                                                {assessmentResults.results[q.id].subResults && (
                                                                    <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
                                                                        {Object.entries(assessmentResults.results[q.id].subResults).map(([key, sub], sIdx) => (
                                                                            <div key={sIdx} className="flex items-start gap-2 bg-white/40 p-2 rounded-lg border border-white/50 shadow-sm">
                                                                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase shrink-0 ${sub.score > 0 || sub.status === 'correct' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                                                                    {sub.score > 0 || sub.status === 'correct' ? '✓' : '✗'} Part {isNaN(key) ? key : parseInt(key) + 1}
                                                                                </span>
                                                                                <p className="text-[11px] font-medium text-slate-500 leading-tight">{sub.feedback || (sub.status === 'correct' ? 'Correctly identified.' : `Incorrect. Correct answer: ${sub.correct || 'N/A'}`)}</p>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}

                                                                {q.learning_note && (
                                                                    <div className="mt-4 p-4 bg-indigo-50/80 rounded-2xl border border-indigo-100 shadow-sm">
                                                                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                                                            <Sparkles size={12} className="fill-indigo-500" />
                                                                            {englishTutor?.name || "Miss Janie"}'s Learning Moment
                                                                        </p>
                                                                        <p className="text-xs font-bold text-slate-700 leading-relaxed italic">
                                                                            {q.learning_note}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            {(assessmentResults.results[q.id].score > 0 && assessmentResults.results[q.id].score < q.marks) && assessmentResults.results[q.id].markingSnippet && (
                                                                <div className="mt-4 p-4 bg-white/80 rounded-2xl border border-amber-200/30">
                                                                    <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1.5">HKEAA Marking Scheme snippet:</p>
                                                                    <p className="text-xs font-medium text-slate-500 italic leading-relaxed">"{assessmentResults.results[q.id].markingSnippet}"</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (phase === 'RESULTS') {
        if (!assessmentResults) {
            updatePhase('SELECTOR');
            return null;
        }

        const percentage = assessmentResults?.percentage || 0;
        const level = String(assessmentResults?.level || '1');
        const sectional = {
            A: assessmentResults?.sectionalScores?.A || { score: 0, possible: 0 },
            B: assessmentResults?.sectionalScores?.B || { score: 0, possible: 0 }
        };
        const analytics = assessmentResults?.analytics || {};
        const skillScores = assessmentResults?.skillScores || {};

        const formatSecs = (s) => {
            if (typeof s !== 'number' || isNaN(s)) return '0m 0s';
            return `${Math.floor(s / 60)}m ${s % 60}s`;
        };

        const getTacticalVerdict = () => {
            const analysis = {
                holistic: "",
                time: { status: 'neutral', comment: "" },
                skills: { status: 'neutral', comment: "" },
                nextSteps: []
            };

            // 1. Holistic Grade Context
            if (level.includes('5')) {
                analysis.holistic = "Exceptional performance. You demonstrate the 'Global Native' proficiency level required for top-tier university entrance.";
            } else if (level === '4') {
                analysis.holistic = "Competent performance. You have a solid grasp of the passage but are losing marks on nuanced inference and precise extraction.";
            } else {
                analysis.holistic = "Developing proficiency. Focus on literal comprehension and basic reference skills before tackling complex interpretation.";
            }

            // 2. Time Management
            const aTime = analytics.sectionTimes?.A || 0;
            const bTime = analytics.sectionTimes?.B || 0;
            const totalTime = aTime + bTime;

            if (aTime > 45 * 60) {
                analysis.time.status = 'warning';
                analysis.time.comment = `Pacing Issue: You spent ${Math.floor(aTime/60)}m on Part A. In a high-stakes DSE environment, this leaves insufficient time for the complex 'deep reading' required for Part B2.`;
                analysis.nextSteps.push("Practice 'Skimming for Gist' in Part A to cut your time down to 40 mins.");
            } else if (totalTime < 30 * 60 && percentage < 80) {
                analysis.time.status = 'caution';
                analysis.time.comment = "Rush Detected: You finished very early but missed several 'careless' marks. Professional examiners look for precision over speed.";
                analysis.nextSteps.push("Use the extra time to verify 'Linked Justification' in T/F/NG questions.");
            } else {
                analysis.time.status = 'success';
                analysis.time.comment = "Optimal Pacing: Your distribution between A and B reflects a mature exam strategy.";
            }

            // 3. Skill Mastery
            let lowestSkill = { label: '', pct: 100 };
            Object.entries(skillScores).forEach(([label, stats]) => {
                const pct = stats.possible > 0 ? (stats.score / stats.possible) * 100 : 100;
                if (pct < lowestSkill.pct) lowestSkill = { label, pct };
            });

            if (lowestSkill.label && lowestSkill.pct < 70) {
                analysis.skills.status = 'warning';
                analysis.skills.comment = `Skill Gap: '${lowestSkill.label}' is your primary point leakage. This skill requires you to look beyond the text for authorial intent.`;
                analysis.nextSteps.push(`Review the 'Examiner's Note' for all ${lowestSkill.label} questions in this paper.`);
            } else {
                analysis.skills.status = 'success';
                analysis.skills.comment = "Balanced Skillset: No major weak points detected across micro-skill categories.";
            }

            if (selectedSection === 'B1' && level === '4' && percentage >= 80) {
                analysis.nextSteps.push("You've maxed out Part B1. Your next mock MUST be Part B2 to unlock the Level 5 range.");
            }

            // Hustle Culture Specific "Director's Note"
            if (mockData?.meta?.topic?.toLowerCase().includes('hustle culture') && selectedSection === 'B2') {
                const b2Score = sectional.B.score;
                const b2Possible = sectional.B.possible;
                const b2Pct = b2Possible > 0 ? (b2Score / b2Possible) * 100 : 0;
                
                if (b2Pct < 50) {
                    analysis.directorNote = "Part B2 was based on Byung-Chul Han's philosophy. It’s normal to find this level of abstract language challenging. Let's focus on identifying his 'Keywords' like self-exploitation and hyper-attention next time.";
                }
            }

            return analysis;
        };

        const verdict = getTacticalVerdict();

        return (
            <div className="min-h-screen bg-[#f1f5f9] flex flex-col p-8 selection:bg-indigo-100">
                <nav className="max-w-7xl w-full mx-auto flex justify-between items-center mb-10">
                    <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-all font-black text-xs uppercase tracking-widest">
                        <ArrowLeft size={16} />
                        Back to Dashboard
                    </button>
                    <div className="flex items-center gap-6">
                        <div className="text-right">
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Candidate Report</p>
                            <p className="text-base font-bold text-slate-700">{user?.displayName || 'Student'}</p>
                        </div>
                        <div className="h-10 w-px bg-slate-200" />
                        <div className="flex items-center gap-3">
                            <div className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-black text-slate-500 shadow-sm">
                                {new Date().toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                </nav>

                <main className="max-w-7xl w-full mx-auto space-y-8">
                    {/* Top Level Summary: The Grade Card */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="lg:col-span-8 bg-white rounded-[3.5rem] shadow-2xl shadow-slate-200/60 overflow-hidden border border-white relative"
                        >
                            <div className="p-12">
                                <div className="flex justify-between items-start mb-12">
                                    <div>
                                        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Mock Score Report</h1>
                                        <p className="text-slate-400 font-medium">Standardized HKEAA Paper 1 Assessment</p>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <div className={`text-6xl font-black italic-none ${level.includes('5') ? 'text-indigo-600' : 'text-slate-900'} flex flex-col items-end`}>
                                            {level}
                                            {selectedSection === 'B1' && level === '4' && (
                                                <span className="mt-2 px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] border border-amber-100 shadow-sm">
                                                    B1 Level Cap
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Awarded Grade</p>
                                        
                                        {assessmentResults.xpAwarded !== undefined && (
                                            <motion.div 
                                                initial={{ scale: 0.5, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                className="mt-4 flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-xl border border-amber-100 shadow-sm"
                                            >
                                                <Zap size={14} className="fill-amber-500 text-amber-500" />
                                                <span className="text-xs font-black uppercase tracking-tight">+{assessmentResults.xpAwarded} XP Earned</span>
                                            </motion.div>
                                        )}
                                    </div>
                                </div>

                                {/* Grade Meter */}
                                <div className="space-y-6">
                                    <div className="flex justify-between items-end">
                                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">DSE Grade Boundary Scale</span>
                                        <span className="text-xs font-black text-slate-900">{Math.round(percentage)}% Accuracy</span>
                                    </div>
                                    <div className="relative h-12 bg-slate-100 rounded-2xl flex p-1.5 overflow-hidden">
                                        {['1', '2', '3', '4', '5', '5*', '5**'].map((lvl) => {
                                            const isLocked = selectedSection === 'B1' && lvl.includes('5');
                                            const isActive = level === lvl;
                                            return (
                                                <div 
                                                    key={lvl} 
                                                    className={`flex-1 flex items-center justify-center text-[11px] font-black rounded-xl transition-all relative ${
                                                        isActive ? 'bg-indigo-600 text-white shadow-lg' : 
                                                        isLocked ? 'bg-slate-200 text-slate-400 opacity-50' : 'text-slate-400'
                                                    }`}
                                                >
                                                    {lvl}
                                                    {isLocked && <Lock size={10} className="absolute top-1 right-1" />}
                                                </div>
                                            );
                                        })}
                                        {/* Marker */}
                                        <motion.div 
                                            initial={{ left: 0 }}
                                            animate={{ left: `${percentage}%` }}
                                            className="absolute top-0 bottom-0 w-1 bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.5)] z-10"
                                        />
                                    </div>
                                    <div className="flex justify-between px-2 text-[11px] font-black text-slate-300 uppercase tracking-widest">
                                        <span>Fail</span>
                                        <span>Satisfactory</span>
                                        <span>Excellence</span>
                                        <span>Elite (Level 5 Range)</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="lg:col-span-4 bg-slate-900 rounded-[3.5rem] p-12 text-white relative overflow-hidden"
                        >
                            <div className="absolute -top-10 -right-10 opacity-10">
                                <Trophy size={200} />
                            </div>
                            
                            <h3 className="text-xl font-black mb-8 uppercase tracking-widest">Sectional Raw Scores</h3>
                            <div className="space-y-6">
                                <div className="p-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Part A (Compulsory)</span>
                                        <span className="text-xl font-black">{sectional?.A?.score || 0} <span className="text-sm text-slate-500 font-bold">/ {sectional?.A?.possible || 0}</span></span>
                                    </div>
                                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${(sectional?.A?.possible > 0 ? (sectional.A.score/sectional.A.possible)*100 : 0)}%` }} />
                                    </div>
                                </div>

                                <div className="p-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Part {selectedSection}</span>
                                        <span className="text-xl font-black">{sectional?.B?.score || 0} <span className="text-sm text-slate-500 font-bold">/ {sectional?.B?.possible || 0}</span></span>
                                    </div>
                                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${(sectional?.B?.possible > 0 ? (sectional.B.score/sectional.B.possible)*100 : 0)}%` }} />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Middle Row: Analytics Deep Dive */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Card B: Time Efficiency */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl"
                        >
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                                    <Clock size={20} />
                                </div>
                                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Time Efficiency</h3>
                            </div>

                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-slate-400">Time on Part A</span>
                                    <span className={`text-sm font-black ${analytics.sectionTimes?.A > 45 * 60 ? 'text-rose-500' : 'text-slate-900'}`}>
                                        {formatSecs(analytics.sectionTimes?.A || 0)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-slate-400">Time on Part B</span>
                                    <span className="text-sm font-black text-slate-900">
                                        {formatSecs(analytics.sectionTimes?.B || 0)}
                                    </span>
                                </div>
                                <div className="pt-4 border-t border-slate-100">
                                    <p className="text-[11px] text-slate-400 font-bold leading-relaxed italic">
                                        {analytics.sectionTimes?.A > 45 * 60 
                                            ? "⚠️ Overtime on Part A! You must aim for under 45 mins to save time for Part B analysis."
                                            : "✅ Great pace on Part A. This gives you ample time for the complex B2 extracts."}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                        {/* Card C: Skill Mastery Bars */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden"
                        >
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                                    <Target size={20} />
                                </div>
                                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Skill Mastery</h3>
                            </div>

                            <div className="space-y-5">
                                {Object.entries(skillScores).map(([skill, stats]) => {
                                    const possible = stats?.possible || 0;
                                    const score = stats?.score || 0;
                                    const pct = possible > 0 ? (score / possible) * 100 : 0;
                                    return (
                                        <div key={skill} className="space-y-2">
                                            <div className="flex justify-between text-xs font-bold text-slate-600 uppercase tracking-wider">
                                                <span>{skill}</span>
                                                <span className="text-slate-900">{Math.round(pct)}%</span>
                                            </div>
                                            <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full transition-all duration-1000 ${pct > 75 ? 'bg-emerald-500' : pct > 50 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${pct}%` }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-50">
                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 text-center italic-none">Top Performance Area</p>
                                <div className="flex justify-center">
                                    {(() => {
                                        const best = Object.entries(skillScores).sort((a,b) => (b[1].score/b[1].possible) - (a[1].score/a[1].possible))[0];
                                        return (
                                            <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-[11px] font-black uppercase tracking-wider border border-emerald-100 shadow-sm">
                                                {best?.[0] || 'Standard Reading'}
                                            </span>
                                        );
                                    })()}
                                </div>
                            </div>
                        </motion.div>

                        {/* Card D: Miss Janie's Comprehensive Verdict */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-indigo-50 p-10 rounded-[3.5rem] border border-indigo-100 relative overflow-hidden flex flex-col"
                        >
                            <div className="flex items-center gap-3 mb-6 relative z-10">
                                <div className="size-12 rounded-full overflow-hidden border-2 border-white shadow-md">
                                    <img src={englishTutor?.avatar || "/avatars/Miss_Janie.jpg"} alt={englishTutor?.name || "Janie"} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-slate-900">{englishTutor?.name || "Miss Janie"}'s Analysis</h3>
                                    <p className="text-[11px] font-black text-indigo-400 uppercase tracking-widest italic-none">Pedagogical Specialist</p>
                                </div>
                            </div>

                            <div className="space-y-6 flex-1 relative z-10">
                                <div>
                                    <p className="text-base font-bold text-slate-800 leading-relaxed italic">
                                        "{verdict.holistic}"
                                    </p>
                                </div>

                                {verdict.directorNote && (
                                    <div className="p-6 bg-indigo-600 text-white rounded-[2.5rem] shadow-xl shadow-indigo-200 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-10">
                                            <BrainCircuit size={80} />
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-60">Director's Note</p>
                                        <p className="text-sm font-bold leading-relaxed relative z-10">
                                            {verdict.directorNote}
                                        </p>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div className="p-5 bg-white/60 rounded-3xl border border-white/40 shadow-sm">
                                        <div className="flex items-center gap-2 mb-2.5">
                                            <div className={`size-2.5 rounded-full ${verdict.time.status === 'success' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                            <span className="text-xs font-black text-slate-500 uppercase tracking-[0.15em]">Time Strategy</span>
                                        </div>
                                        <p className="text-[13px] font-bold text-slate-600 leading-relaxed">{verdict.time.comment}</p>
                                    </div>

                                    <div className="p-5 bg-white/60 rounded-3xl border border-white/40 shadow-sm">
                                        <div className="flex items-center gap-2 mb-2.5">
                                            <div className={`size-2.5 rounded-full ${verdict.skills.status === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                            <span className="text-xs font-black text-slate-500 uppercase tracking-[0.15em]">Skill Focus</span>
                                        </div>
                                        <p className="text-[13px] font-bold text-slate-600 leading-relaxed">{verdict.skills.comment}</p>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <p className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-4">Improvement Roadmap</p>
                                    <ul className="space-y-3">
                                        {verdict.nextSteps.map((step, idx) => (
                                            <li key={idx} className="flex items-start gap-3 text-sm font-bold text-slate-600 leading-snug">
                                                <div className="mt-1.5 size-1.5 bg-indigo-400 rounded-full shrink-0 shadow-sm" />
                                                {step}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <button 
                                onClick={() => updatePhase('REVIEW')}
                                className="mt-8 w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                            >
                                Detailed Question Review
                            </button>
                        </motion.div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="flex justify-center gap-6 pt-12 pb-20">
                        <button onClick={() => setIsMarkingSchemeOpen(true)} className="flex items-center gap-2 px-8 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
                            Marking Scheme
                        </button>
                    </div>
                </main>

                {/* Marking Scheme Modal */}
                <AnimatePresence>
                    {isMarkingSchemeOpen && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-8">
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsMarkingSchemeOpen(false)}
                                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                            />
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="bg-white w-full max-w-6xl h-[85vh] rounded-[3rem] shadow-2xl relative flex flex-col overflow-hidden border border-white/20"
                            >
                                <div className="p-8 border-b border-slate-100 flex justify-between items-center shrink-0 bg-slate-50/50">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-slate-900 text-white rounded-2xl">
                                            <ShieldCheck size={24} />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">HKEAA Marking Criteria & Logic</h2>
                                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-1 italic-none">Internal Memo | Confidential | {mockData?.meta?.topic}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setIsMarkingSchemeOpen(false)} className="p-3 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200 transition-colors shadow-sm">
                                        <XIcon size={20} />
                                    </button>
                                </div>
                                
                                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-white">
                                    <table className="w-full text-left border-collapse table-fixed">
                                        <thead>
                                            <tr className="border-b-2 border-slate-900">
                                                <th className="py-4 px-4 text-[11px] font-black uppercase text-slate-400 tracking-widest w-[120px]">Question / Mark</th>
                                                <th className="py-4 px-4 text-[11px] font-black uppercase text-slate-400 tracking-widest">Correct Answer & Keywords</th>
                                                <th className="py-4 px-4 text-[11px] font-black uppercase text-slate-400 tracking-widest w-[35%]">Marking Logic / Examiner's Note</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {[
                                                ...(mockData?.Part_A?.questions || []),
                                                ...(mockData?.Part_B1?.questions || []),
                                                ...(mockData?.Part_B2?.questions || [])
                                            ].map((q, idx) => {
                                                const qNum = idx + 1;
                                                
                                                return (
                                                    <tr 
                                                        key={q.id} 
                                                        className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                                                        onClick={() => {
                                                            const pMatch = q.question.match(/paragraph (\d+)/i);
                                                            if (pMatch) scrollToParagraph(`p${pMatch[1]}`);
                                                            setIsMarkingSchemeOpen(false);
                                                        }}
                                                    >
                                                        <td className="py-6 px-4 align-top">
                                                            <div className="flex flex-col gap-1">
                                                                <span className="text-sm font-black text-slate-900">Q{qNum}</span>
                                                                <span className="text-[11px] font-black text-indigo-500 uppercase">({q.marks} Marks)</span>
                                                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">{q.skill_tag || 'Standard'}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-6 px-4 align-top">
                                                            <div className="space-y-4">
                                                                {q.type === 'tf_ng' ? (
                                                                    <div className="grid grid-cols-1 gap-2">
                                                                        {(q.items || []).map((it, i) => (
                                                                            <div key={i} className="text-xs font-bold text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-start gap-3">
                                                                                <span className="size-5 rounded bg-slate-900 text-white text-[10px] flex items-center justify-center shrink-0">{(i+1)}</span>
                                                                                <div>
                                                                                    <span className="text-indigo-600 font-black uppercase">{it.answer}</span>
                                                                                    {it.justification && (
                                                                                        <p className="mt-1 text-[11px] text-slate-500 font-medium leading-relaxed italic">
                                                                                            <span className="text-[10px] font-black text-slate-400 uppercase mr-1">Justification:</span> 
                                                                                            "{it.justification}"
                                                                                        </p>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                ) : q.type === 'summary_cloze' || q.type === 'flow_chart' ? (
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {Object.entries(q.answers || {}).map(([key, val]) => (
                                                                            <div key={key} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-lg">
                                                                                <span className="text-[10px] font-black text-indigo-300">[{key}]</span>
                                                                                <span className="text-[11px] font-black text-indigo-700 uppercase">{val}</span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                ) : (
                                                                    <div className="text-sm font-bold text-slate-700 leading-relaxed">
                                                                        {q.marking_scheme || "Refer to passage context."}
                                                                        {q.marking_logic?.key_phrases && (
                                                                            <div className="mt-3 flex flex-wrap gap-2">
                                                                                {q.marking_logic.key_phrases.map((kp, i) => (
                                                                                    <span key={i} className="px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded text-[10px] font-black uppercase tracking-widest">
                                                                                        ✓ {kp}
                                                                                    </span>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="py-6 px-4 align-top border-l border-slate-50 bg-slate-50/30">
                                                            <div className="space-y-4">
                                                                {q.type === 'tf_ng' && (
                                                                    <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
                                                                        <div className="flex items-center gap-2 mb-2">
                                                                            <AlertCircle size={12} className="text-amber-500" />
                                                                            <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Conditional Marking</span>
                                                                        </div>
                                                                        <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
                                                                            Justification is **ONLY** marked if the T/F/NG choice is correct. No marks for justifications that don't address the core concept.
                                                                        </p>
                                                                    </div>
                                                                )}

                                                                <div className="flex flex-col gap-1">
                                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Allocation</span>
                                                                    <p className="text-[11px] font-bold text-slate-600">
                                                                        {q.marks > 1 ? `Award 1 mark for each correct point (Max ${q.marks}).` : "Award 1 mark for the correct answer."}
                                                                        {q.type === 'Open_Ended' && q.marks > 1 && " Partial marks (0.5) may be awarded for capturing core concepts."}
                                                                    </p>
                                                                </div>

                                                                {q.marking_logic?.notes && (
                                                                    <div className="flex flex-col gap-1">
                                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Examiner's Note</span>
                                                                        <p className="text-[11px] text-slate-500 font-medium leading-relaxed bg-white p-2 rounded-lg border border-slate-100 shadow-sm italic">
                                                                            {q.marking_logic.notes}
                                                                        </p>
                                                                    </div>
                                                                )}

                                                                {q.marking_logic?.rejection_criteria && (
                                                                    <div className="flex flex-col gap-1">
                                                                        <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Reject / Do Not Award</span>
                                                                        <div className="p-2 bg-rose-50 border border-rose-100 rounded-lg">
                                                                            {q.marking_logic.rejection_criteria.map((rj, i) => (
                                                                                <p key={i} className="text-[11px] text-rose-700 font-bold leading-relaxed flex items-center gap-2">
                                                                                    <span className="size-1 bg-rose-400 rounded-full shrink-0" />
                                                                                    {rj}
                                                                                </p>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {!q.marking_logic?.notes && q.type === 'Open_Ended' && (
                                                                    <div className="flex flex-col gap-1">
                                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Note</span>
                                                                        <p className="text-[11px] text-slate-400 font-medium italic">Spelling is ignored unless it changes the meaning or is a Cloze extraction.</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                                
                                <div className="p-8 bg-slate-900 border-t border-white/10 shrink-0 flex justify-between items-center">
                                    <div className="flex gap-8">
                                        <div className="flex items-center gap-3">
                                            <div className="size-2 bg-emerald-500 rounded-full animate-pulse" />
                                            <p className="text-[11px] font-black text-white uppercase tracking-[0.2em]">HKEAA Standard Verified</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="size-2 bg-indigo-500 rounded-full" />
                                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Spelling Tolerance Active</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setIsMarkingSchemeOpen(false)} 
                                        className="px-10 py-4 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-100 transition-all shadow-xl"
                                    >
                                        Close Blueprint
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Image Zoom Modal */}
                <AnimatePresence>
                    {zoomedImage && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setZoomedImage(null)}
                            className="fixed inset-0 z-[300] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-8 md:p-20 cursor-zoom-out"
                        >
                            <motion.div 
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                onClick={(e) => e.stopPropagation()}
                                className="max-w-7xl w-full max-h-full flex flex-col items-center gap-6"
                            >
                                <div className="bg-white p-2 rounded-[2.5rem] shadow-2xl relative group">
                                    <img 
                                        src={zoomedImage.url} 
                                        alt={zoomedImage.caption} 
                                        className="max-w-full max-h-[80vh] object-contain rounded-[2rem]" 
                                    />
                                    <button 
                                        onClick={() => setZoomedImage(null)}
                                        className="absolute -top-4 -right-4 size-12 bg-white text-slate-900 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all border border-slate-100"
                                    >
                                        <XIcon size={20} />
                                    </button>
                                </div>
                                <div className="text-center space-y-2">
                                    <p className="text-white font-black text-lg tracking-tight">{zoomedImage.caption}</p>
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">HKEAA Tactical Diagram | Zoom Active</p>
                                </div>
                            </motion.div>
                        </motion.div>


                    )}
                </AnimatePresence>
                <GradingOverlay 
                    isOpen={isSubmitting}
                    title="Analyzing Reading Performance"
                    status="Cross-referencing your answers with HKEAA marking logic..."
                    progress={submissionProgress}
                />
                <UpgradeModal 
                    isOpen={showUpgradeModal} 
                    onClose={() => setShowUpgradeModal(false)}
                    title="Unlock Evaluation"
                    message="Free tier users can preview the mock paper, but AI evaluation and grade prediction are Pro features. Upgrade now to get your results!"
                />
            </div>
        );
    }
};

export default ReadingMockStudio;

