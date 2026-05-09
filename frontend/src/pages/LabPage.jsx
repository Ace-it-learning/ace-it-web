import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, ArrowRight, Award, Book, BookOpen, CheckCircle2, ChevronLeft, ChevronRight, GraduationCap, Layout, Layers, Loader2, MessageSquare, Mic, MousePointerClick, Play, RefreshCcw, Save, Sparkles, Square, Star, Target, Trophy, Volume2, X } from 'lucide-react';
import { LoadingPage, GradingOverlay } from '../components/shared';
import NextPathRecommendations from '../components/lab/NextPathRecommendations';
import { useAuth } from '../context/AuthContext';
import { MICRO_SKILLS, getSkillName, getSkillDesc } from '../constants/microSkills';
import { calculateTier, getMasteryStats } from '../utils/masteryUtils';
import { addToNotebook } from '../services/notebookService';
import WritingWorkspace from '../components/lab/WritingWorkspace';
import WritingReview from '../components/lab/WritingReview';
import AlertModal from '../components/shared/AlertModal';
import ScaffoldToolbar from '../components/reading/ScaffoldToolbar';
import VocabSpotlight from '../components/reading/VocabSpotlight';
import ParagraphInsight from '../components/reading/ParagraphInsight';
import ArgumentMap from '../components/reading/ArgumentMap';
import MockCountdownTimer from '../components/utils/MockCountdownTimer';
import { useLanguage } from '../context/LanguageContext';
import { useAvatar } from '../context/AvatarContext';
import { motion, Reorder } from 'framer-motion';
import { isCheatEnabled } from '../utils/devAccess';

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

    return (
        <div
            className="dictionary-popover fixed z-[70] bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 w-72 animate-in fade-in zoom-in duration-200 text-left"
            style={{ top, left: Math.max(20, left) }}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 capitalize">{data?.term || "Dictionary"}</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">X</button>
            </div>

            {loading ? (
                <div className="space-y-2 animate-pulse">
                    <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
            ) : data?.error ? (
                <div className="text-red-500 text-sm py-2">
                    <p className="font-bold">Error</p>
                    <p>{data.error}</p>
                </div>
            ) : (
                <div className="space-y-3">
                    <div>
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{data.type}</span>
                        <p className="text-gray-800 dark:text-gray-200 font-medium">{data.definition}</p>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg text-blue-900 dark:text-blue-300 text-sm">
                        <span className="font-bold">Translation:</span> {data.translation}
                    </div>

                    {data.example && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 italic">"{data.example}"</p>
                    )}

                    <button
                        onClick={() => onAddToNotebook(data)}
                    >
                        Add to Notebook
                    </button>
                </div>
            )}
        </div>
    );
};

// --- Formula Visualizer Component (Option 1: Semantic Pill Map) ---
const FormulaVisualizer = ({ formula }) => {
    if (!formula) return null;

    // Split into segments but keep brackets and parentheses
    // Example: "[Subject 1] + (along with/as well as) + [Subject 2] + [Verb]"
    // Also handle simple text separated by " + " or " | "
    const parts = formula.split(/(\[.*?\]|\(.*?\)| \+ | \| )/g)
        .map(p => p.trim())
        .filter(p => p && p !== '+' && p !== '|');

    return (
        <div className="flex flex-wrap items-center justify-center gap-4 py-8 relative">
            {parts.map((part, idx) => {
                const isPill = part.startsWith('[') && part.endsWith(']');
                const isNoise = part.startsWith('(') && part.endsWith(')');
                const cleanPart = part.replace(/[\[\]\(\)]/g, '');

                if (isPill || (!isNoise && cleanPart.length > 0)) {
                    const isVerb = cleanPart.toLowerCase().includes('verb');
                    const isPrimary = cleanPart.toLowerCase().includes('subject 1') || cleanPart.toLowerCase().includes('target');
                    const isSecondary = cleanPart.toLowerCase().includes('subject 2');

                    return (
                        <motion.div
                            key={idx}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            className={`px-6 py-4 rounded-3xl font-black text-sm md:text-lg border-2 shadow-sm relative group ${
                                isVerb ? 'bg-green-50 border-green-500 text-green-700' :
                                isPrimary ? 'bg-indigo-50 border-indigo-500 text-indigo-700' :
                                isSecondary ? 'bg-gray-50 border-gray-200 text-gray-400 opacity-50 grayscale' :
                                'bg-white border-gray-200 text-gray-800'
                            }`}
                        >
                            {cleanPart}
                            {isPrimary && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-indigo-600 text-[10px] text-white rounded-full uppercase tracking-widest whitespace-nowrap">
                                    Primary
                                </div>
                            )}
                            {isVerb && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-green-600 text-[10px] text-white rounded-full uppercase tracking-widest whitespace-nowrap">
                                    Matches
                                </div>
                            )}
                        </motion.div>
                    );
                }

                if (isNoise) {
                    return (
                        <motion.div
                            key={idx}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            className="flex flex-col items-center"
                        >
                            <div className="px-4 py-3 rounded-2xl bg-gray-100/50 border border-gray-200 text-gray-400 text-xs md:text-sm font-bold italic opacity-40">
                                {cleanPart}
                            </div>
                            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest mt-1">Ignore</span>
                        </motion.div>
                    );
                }

                return (
                    <span key={idx} className="text-gray-300 text-2xl font-bold">
                        {part === '|' ? '|' : '+'}
                    </span>
                );
            })}
        </div>
    );
};

// --- Rule Card Component ---
const RuleCard = ({ rule, onNext, isLast }) => {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-900 p-8 md:p-12 rounded-[3.5rem] shadow-xl border-2 border-indigo-100 dark:border-indigo-900/40 max-w-5xl mx-auto"
        >
            <div className="flex items-center gap-4 mb-10">
                <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-200">
                    <Sparkles size={24} />
                </div>
                <h3 className="text-3xl font-black dark:text-white uppercase tracking-tight">{rule.name}</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch mb-10">
                {/* Left Side: Formula */}
                <div className="p-8 bg-gray-50 dark:bg-gray-800/40 rounded-[2.5rem] border-2 border-dashed border-indigo-200 dark:border-indigo-800 flex flex-col justify-center min-h-[250px]">
                    <h4 className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-2 text-center">Core Formula Breakdown</h4>
                    <FormulaVisualizer formula={rule.formula} />
                </div>

                {/* Right Side: Examples */}
                <div className="flex flex-col gap-4">
                    <div className="p-8 bg-red-50 dark:bg-red-900/10 rounded-3xl border border-red-100 dark:border-red-900/30 flex-1">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                                <X className="text-white" size={12} />
                            </div>
                            <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">Incorrect</span>
                        </div>
                        <p className="text-xl font-bold text-red-900 dark:text-red-200 italic leading-relaxed">"{rule.incorrect}"</p>
                    </div>

                    <div className="p-8 bg-green-50 dark:bg-green-900/10 rounded-3xl border border-green-100 dark:border-green-900/30 flex-1">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                                <CheckCircle2 className="text-white" size={12} />
                            </div>
                            <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">Correct</span>
                        </div>
                        <p className="text-xl font-bold text-green-900 dark:text-green-200 leading-relaxed">"{rule.correct}"</p>
                    </div>
                </div>
            </div>

            <button
                onClick={onNext}
                className="w-full py-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-3xl font-black text-2xl transition-all shadow-xl shadow-indigo-200/50 active:scale-95 flex items-center justify-center gap-3"
            >
                {isLast ? "Begin Mission Training" : "Next Mission Rule"}
                <ArrowRight size={24} />
            </button>
        </motion.div>
    );
};

// --- Head Noun Selector Component ---
const HeadNounSelector = ({ task, onComplete, topic }) => {
    const [selectedIndices, setSelectedIndices] = useState([]);
    const [isCorrect, setIsCorrect] = useState(null);
    const [showExplanation, setShowExplanation] = useState(false);

    const isTenseLab = topic?.includes('tense');
    const isCountableLab = topic?.includes('countable');
    
    let phaseTitle = "Phase 2: Head Noun Identification";
    let mainInstruction = "Click the 'Head Noun' in the sentence below.";
    let subInstruction = "Identify the real subject that controls the verb.";

    if (isTenseLab) {
        phaseTitle = "Phase 2: Context Identification";
        mainInstruction = "Click the 'Time Marker' or 'Key Verb' that sets the tense context.";
        subInstruction = "Identify the cue that dictates the correct tense.";
    } else if (isCountableLab) {
        phaseTitle = "Phase 2: Noun Type Identification";
        mainInstruction = "Click the 'Uncountable Noun' or 'Quantifier' in the sentence below.";
        subInstruction = "Spot the words that often cause confusion in pluralization or quantity.";
    } else if (topic?.includes('wordform')) {
        phaseTitle = "Phase 2: Word Form Identification";
        mainInstruction = task.target_type 
            ? `Click the '${task.target_type}' in the sentence below.`
            : "Click the 'Target Word' (Adjective/Adverb/Noun) in the sentence below.";
        subInstruction = "Identify the word whose form must be correctly chosen based on its grammatical role.";
    } else if (topic?.includes('pronoun')) {
        phaseTitle = "Phase 2: Pronoun Reference Identification";
        mainInstruction = "Click the 'Pronoun' and its 'Antecedent' (the noun it refers to).";
        subInstruction = "Identify the relationship between the pronoun and the noun it replaces.";
    } else if (topic?.includes('inversion')) {
        phaseTitle = "Phase 2: Inversion Trigger Identification";
        mainInstruction = "Click the 'Negative Adverbial' or 'Condition' that triggers the inversion.";
        subInstruction = "Identify the word or phrase that forces the auxiliary verb to move before the subject.";
    } else if (topic?.includes('subjunctive')) {
        phaseTitle = "Phase 2: Subjunctive Mood Identification";
        mainInstruction = "Click the 'Mandatory Phrase' or the 'Subjunctive Verb' in the sentence below.";
        subInstruction = "Identify the structure that requires the base form of the verb (e.g., 'It is essential that he be...').";
    } else if (topic?.includes('participle')) {
        phaseTitle = "Phase 2: Participle Phrase Identification";
        mainInstruction = "Click the 'Participle' (Present/Past) and the 'Subject' it modifies.";
        subInstruction = "Identify the relationship between the descriptive phrase and the noun it describes.";
    } else if (topic?.includes('cohesion')) {
        phaseTitle = "Phase 2: Cohesive Device Identification";
        mainInstruction = "Click the 'Cohesive Device' or 'Transition' in the sentence below.";
        subInstruction = "Identify the word or phrase that links ideas together (e.g., 'Nonetheless', 'In light of').";
    } else if (topic?.includes('nominal')) {
        phaseTitle = "Phase 2: Nominal Clause Identification";
        mainInstruction = "Click the 'Noun Clause' (including the marker like 'What' or 'Whether').";
        subInstruction = "Identify the entire clause that acts as the subject or object of the main verb.";
    } else if (topic?.includes('relative')) {
        phaseTitle = "Phase 2: Advanced Relative Clause Identification";
        mainInstruction = "Click the 'Relative Pronoun' (e.g., 'whom', 'whereby') and the 'Noun' it describes.";
        subInstruction = "Identify the complex structure used to modify the noun (e.g., 'in which', 'of whom').";
    } else if (topic?.includes('modals')) {
        phaseTitle = "Phase 2: Modal Nuance Identification";
        mainInstruction = "Click the 'Modal Verb' and the 'Primary Verb' it modifies.";
        subInstruction = "Identify the word that expresses certainty, obligation, or possibility.";
    } else if (topic?.includes('passive')) {
        phaseTitle = "Phase 2: Passive Variation Identification";
        mainInstruction = "Click the 'Passive Verb' (be + past participle) or the 'Dummy Subject'.";
        subInstruction = "Identify the structures used to shift focus away from the doer of the action.";
    }

    // Reset state when task changes to fix "stuck" selections between questions
    useEffect(() => {
        setSelectedIndices([]);
        setIsCorrect(null);
        setShowExplanation(false);
    }, [task]);

    const handleTokenClick = (idx) => {
        if (showExplanation) return;
        
        let newSelection;
        if (selectedIndices.includes(idx)) {
            newSelection = selectedIndices.filter(i => i !== idx);
        } else {
            newSelection = [...selectedIndices, idx];
        }
        setSelectedIndices(newSelection);
    };

    const handleCheck = () => {
        // Sort both for comparison
        const sortedSelected = [...selectedIndices].sort((a, b) => a - b);
        const sortedTarget = [...task.head_noun_indices].sort((a, b) => a - b);
        
        const correct = JSON.stringify(sortedSelected) === JSON.stringify(sortedTarget);
        setIsCorrect(correct);
        setShowExplanation(true);
        onComplete(correct);
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
        >
            <div className="text-center space-y-4">
                <span className="inline-block px-4 py-1.5 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-xs font-black uppercase tracking-widest rounded-full">
                    {phaseTitle}
                </span>
                <h3 className="text-2xl md:text-3xl font-black dark:text-white">{mainInstruction}</h3>
                <p className="text-gray-500 font-medium italic">{subInstruction}</p>
            </div>

            <div className="bg-white dark:bg-gray-900 p-8 md:p-10 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-800">
                <div className="flex flex-wrap justify-center gap-2 md:gap-3">
                    {task.sentence_tokens.map((token, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleTokenClick(idx)}
                            className={`px-4 py-3 rounded-xl text-xl md:text-2xl font-bold transition-all ${
                                selectedIndices.includes(idx)
                                    ? 'bg-indigo-600 text-white shadow-lg scale-105'
                                    : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            } ${showExplanation && task.head_noun_indices.includes(idx) ? 'ring-4 ring-green-400' : ''}`}
                            disabled={showExplanation}
                        >
                            {token}
                        </button>
                    ))}
                </div>

                {!showExplanation && (
                    <div className="mt-12 flex justify-center">
                        <button
                            onClick={handleCheck}
                            disabled={selectedIndices.length === 0}
                            className="px-12 py-5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-full font-black text-xl transition-all shadow-xl active:scale-95"
                        >
                            Confirm Selection
                        </button>
                    </div>
                )}

                {showExplanation && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mt-10 p-8 rounded-3xl border-2 flex items-start gap-6 ${
                            isCorrect ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
                        }`}
                    >
                        <div className="size-12 rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-sm">
                            {isCorrect ? <CheckCircle2 className="text-green-600" /> : <X className="text-red-600" />}
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-black uppercase tracking-widest">{isCorrect ? "Masterful!" : "Not quite..."}</p>
                            <p className="text-lg font-bold leading-relaxed">{task.explanation}</p>
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};


// --- Ordering Task Component ---
const OrderingTask = ({ task, value, onChange, disabled }) => {
    const [items, setItems] = React.useState(() => {
        // value is a string of indices like "0-2-1-3"
        // If empty, use natural order
        const indices = (value && typeof value === 'string' && value.includes('-'))
            ? value.split('-').map(v => {
                const num = Number(v);
                if (!isNaN(num)) return num;
                // Handle letters A-Z
                const charCode = v.toUpperCase().charCodeAt(0);
                if (charCode >= 65 && charCode <= 90) return charCode - 65;
                return 0;
            })
            : task.options.map((_, i) => i);

        // Safety check: ensure indices match available options
        if (indices.length !== task.options.length) {
            return task.options.map((text, id) => ({ id, text }));
        }

        return indices.map(idx => ({
            id: idx,
            text: task.options[idx] || '???'
        }));
    });

    // Update parent state when items are reordered
    const handleReorder = (newItems) => {
        if (disabled) return;
        setItems(newItems);
        const newValue = newItems.map(item => item.id).join('-');
        onChange(newValue);
    };

    return (
        <Reorder.Group
            axis="y"
            values={items}
            onReorder={handleReorder}
            className="space-y-2 mt-4"
        >
            {items.map((item, idx) => (
                <Reorder.Item
                    key={item.id}
                    value={item}
                    disabled={disabled}
                    className={`p-4 bg-white dark:bg-gray-800 border-2 rounded-xl flex items-center gap-4 transition-all ${disabled
                        ? 'border-gray-100 dark:border-gray-800 cursor-default opacity-80'
                        : 'border-gray-50 dark:border-gray-700 cursor-grab active:cursor-grabbing hover:border-indigo-300 shadow-sm'
                        }`}
                >
                    <div className="size-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-xs font-black shrink-0">
                        {idx + 1}
                    </div>
                    <span className="text-gray-700 dark:text-gray-300 font-bold text-sm leading-relaxed">{item.text}</span>
                </Reorder.Item>
            ))}
        </Reorder.Group>
    );
};

const LabPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user, profile } = useAuth();
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
        // Standardized Normalization: Support both 1-4 Tiers AND 3-7 Semantic Levels
        const lvlStr = String(initialLevel);

        // 1. Literal Tiers (Legacy)
        if (lvlStr === '1') return '3';
        if (lvlStr === '2') return '4';
        // Note: We skip '3' and '4' here if they are intended to be literal levels, 
        // but traditionally Tier 3 -> Level 5 and Tier 4 -> Level 7.

        // 2. Semantic Levels (Standard)
        if (lvlStr === '7' || lvlStr.includes('5**')) return '7';
        if (lvlStr === '6' || lvlStr.includes('5*')) return '6';
        if (lvlStr === '5' || lvlStr.includes('5')) return '5'; // Match '5', 'HKDSE 5', etc.
        if (lvlStr === '4') return '4';
        if (lvlStr === '3') return '3';

        // 3. Fallback Mapping (Heuristic for Tier vs level ambiguity)
        // If it's '3' or '4' and we reached here, treat it as a level first.
        return lvlStr || '3';
    });

    const missionXp = location.state?.taskXp || location.state?.xp || (
        currentLevel === '7' ? 350 : 
        currentLevel === '6' ? 250 : 
        currentLevel === '5' ? 200 : 
        currentLevel === '4' ? 150 : 100
    );

    const [loading, setLoading] = useState(true);
    const [lessonData, setLessonData] = useState(null);
    const [step, setStep] = useState(searchParams.get('step') || 'EXPLORE'); // EXPLORE, PRACTICE, SUCCESS
    const [grammarSubStep, setGrammarSubStep] = useState('LEARN'); 
    const [currentRuleIdx, setCurrentRuleIdx] = useState(0);
    const [currentHeadNounIdx, setCurrentHeadNounIdx] = useState(0);
    const [currentDrillIdx, setCurrentDrillIdx] = useState(0);
    const [drillAnswers, setDrillAnswers] = useState({});
    const [identifyResults, setIdentifyResults] = useState({}); // idx -> bool
    const [comboCount, setComboCount] = useState(0);
    const [maxCombo, setMaxCombo] = useState(0);
    const [grammarMistakes, setGrammarMistakes] = useState([]);
    const [bossChecked, setBossChecked] = useState(false);

    // Focus Mode to hide global navbar and show custom mission header
    const { setIsFocusMode } = useAvatar();
    useEffect(() => {
        setIsFocusMode(true);
        return () => setIsFocusMode(false);
    }, [setIsFocusMode]);

    // Sync step with URL

    // Helper to update step and URL
    const updateStep = (newStep) => {
        setStep(newStep);
        const newParams = new URLSearchParams(searchParams);
        newParams.set('step', newStep);
        setSearchParams(newParams);
    };

    const [userAnswers, setUserAnswers] = useState({}); // id -> string
    const [feedbacks, setFeedbacks] = useState({}); // id -> { correct: bool, logic: string }
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isPlaying, setIsPlaying] = useState(null); // qId being played
    const [isListening, setIsListening] = useState(null); // qId being recorded
    const [genError, setGenError] = useState(null); // Capture specific generation errors
    const [evalError, setEvalError] = useState(null); // Capture evaluation errors
    const [hasErrors, setHasErrors] = useState(false); // Track if current attempt has errors
    const [earnedXp, setEarnedXp] = useState(0);
    const [xpBreakdown, setXpBreakdown] = useState(null);
    const [masteryScore, setMasteryScore] = useState(0);
    const [qBatch, setQBatch] = useState(0); // 0 or 1 for Easy level question sets
    const isFactoryQuest = location.state?.isFactoryQuest || false;
    const isWeeklyQuest = location.state?.isWeeklyQuest || topic?.includes('_weekly');
    const isMock = location.state?.isMock || false;
    const duration = location.state?.duration || 0;

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

    // Reset scaffold data only when passage ACTUALLY changes to something different
    const lastPassageRef = React.useRef(null);
    useEffect(() => {
        if (lessonData?.reading_passage && lessonData.reading_passage !== lastPassageRef.current) {
            console.log('[LabPage] Reading passage changed, resetting scaffold data');
            setScaffoldData(null);
            setScaffoldSettings({ vocab: false, structure: false, logic: false });
            lastPassageRef.current = lessonData.reading_passage;
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
            // Standardized Normalization: Support both 1-4 Tiers AND 3-7 Semantic Levels
            if (lvlStr === '7' || lvlStr.includes('5**')) normalized = '7';
            else if (lvlStr === '5' || lvlStr.includes('5*')) normalized = '5'; // Treat 5* as 5 or 7 depending on user preference, but here we'll map to 5 for now
            else if (lvlStr === '4' || lvlStr === '2') normalized = '4'; // Level 4 or Tier 2
            else if (lvlStr === '3' || lvlStr === '1') normalized = '3'; // Level 3 or Tier 1

            if (normalized !== currentLevel) {
                setCurrentLevel(normalized);
                updateStep('EXPLORE'); // Force back to briefing
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

            // --- FETCH LOCK (PREVENT DOUBLE-FETCH IN DEV) ---
            if (window._isFetchingLab === `${topic}-${currentLevel}-${qBatch}`) {
                console.log("[LabPage] Fetch already in progress for this topic/level. Skipping duplicate.");
                return;
            }
            window._isFetchingLab = `${topic}-${currentLevel}-${qBatch}`;

            setGenError(null);
            setLoading(true);

            // Determine if this is a Writing/Listening 2.0 request
            const isLegacyWriting = (topic === 'writing' || topic.startsWith('writing_')) || ['SENTENCE_BUILDER', 'PARAGRAPH_PLANNER', 'MINI_ESSAY'].includes(focus?.[0]);
            const isLegacyListening = topic.startsWith('listening_');
            const isWritingLab = isLegacyWriting; // Defined here to prevent ReferenceError below

            // [ARCHIVED] Blocking Legacy Lab Activities
            if (isLegacyWriting || isLegacyListening) {
                console.log(`[LabPage] Intercepted legacy ${isLegacyWriting ? 'writing' : 'listening'} request. Redirecting to Quests Lab.`);
                setLoading(false);
                setGenError(`This ${isLegacyWriting ? 'writing' : 'listening'} activity has moved to the Quests Lab. Please access the latest Quests via the 'Quests Lab' tab in the Roadmap.`);
                window._isFetchingLab = null;
                return;
            }

            const endpoint = isWritingLab ? `${API_URL}/api/lab/writing/generate` : `${API_URL}/api/lab/generate`;

            try {
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
                    if (location.state?.isWeeklyQuest || topic === 'reading_weekly') {
                        payload.isWeeklyQuest = true;
                    }
                }

                // AbortController: Kill fetch after 90 seconds to prevent infinite spinner
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 90000);

                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                    signal: controller.signal
                });
                clearTimeout(timeoutId);

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

                setDrillAnswers({});
                setCurrentRuleIdx(0);
                setCurrentHeadNounIdx(0);
                setCurrentDrillIdx(0);
                setGrammarSubStep('LEARN');
                setComboCount(0);
                setGrammarMistakes([]);
                setLessonData(data); // Writing API returns { mode, theme, ... }

                // Initialize answers
                const initialAnswers = {};
                if (!isWritingLab) {
                    // Standard Lab Initialization
                    if (data.interactive_tasks && data.interactive_tasks.length > 0) {
                        data.interactive_tasks.forEach(t => {
                            if (t.type === 'CATEGORIZATION') {
                                initialAnswers[t.id] = {};
                            } else if (t.type === 'ORDERING') {
                                // Default sequence: index-index-index
                                initialAnswers[t.id] = (t.options || []).map((_, i) => i).join('-');
                            } else {
                                initialAnswers[t.id] = '';
                            }
                        });
                    } else if (data.interactive_task) {
                        const taskId = 'q1';
                        initialAnswers[taskId] = '';
                        data.interactive_tasks = [{ ...data.interactive_task, id: taskId }];
                    }
                }

                setUserAnswers(initialAnswers);
                setLoading(false);
                window._isFetchingLab = null; // Release lock
                return; // Success!

            } catch (err) {
                console.error("Lab Error (Final):", err);
                setGenError(err.message || "Failed to generate lesson content.");
                setLoading(false);
                window._isFetchingLab = null; // Release lock
            }
        };

        fetchLesson();
    }, [topic, currentLevel, qBatch]); // Re-fetch when level or batch changes

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
        if (isMock && step !== 'SUCCESS') {
            if (!window.confirm("An exam is in progress. Leaving now will submit your current progress. Are you sure?")) return;
            handleSubmitMission();
            return;
        }

        if (step === 'SUCCESS') {
            const params = new URLSearchParams();
            params.set('quest_completed', 'true');
            if (topic) params.set('topic', topic);
            params.set('score', masteryScore !== undefined ? masteryScore : 0);
            params.set('xp', earnedXp || 0);
            
            // Use window.location.href to ensure a clean break/mount for ChatInterface greeting
            window.location.href = `/dashboard?${params.toString()}`;
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
            // Local-only cheat mode: never call AI, use model answers embedded in task JSON.
            const toOptionKey = (raw) => {
                if (raw === null || raw === undefined) return '';
                const text = String(raw).trim();
                if (!text) return '';
                const m = text.match(/^([A-D])(?:[\.\)]|\s|$)/i);
                if (m) return m[1].toUpperCase();
                if (/^[A-D]$/i.test(text)) return text.toUpperCase();
                return text;
            };

            const toOrderingAnswer = (task) => {
                const candidate = task?.answer_order || task?.correct_order || task?.answer || task?.correct_answer;
                if (!candidate) return '';
                if (Array.isArray(candidate)) {
                    if (candidate.every(v => typeof v === 'number')) return candidate.join('-');
                    const options = Array.isArray(task?.options) ? task.options : [];
                    const indices = candidate.map(v => {
                        const idx = options.findIndex(opt => String(opt).trim() === String(v).trim());
                        return idx >= 0 ? idx : v;
                    });
                    return indices.join('-');
                }
                return String(candidate);
            };

            const toCategorizationAnswer = (task) => {
                const candidate = task?.answer_map || task?.bucket_map || task?.correct_answer || task?.answer;
                if (candidate && typeof candidate === 'object' && !Array.isArray(candidate)) return candidate;
                return {};
            };

            const toTextAnswer = (task) => {
                const candidate = task?.answer ?? task?.correct_answer ?? task?.model_answer;
                if (Array.isArray(candidate)) return candidate.join('; ');
                if (candidate !== undefined && candidate !== null && String(candidate).trim()) return String(candidate);
                if (Array.isArray(task?.expected_keywords) && task.expected_keywords.length) return task.expected_keywords.join(', ');
                return '';
            };

            const cheatedAnswers = {};
            const tasks = Array.isArray(lessonData?.interactive_tasks) ? lessonData.interactive_tasks : [];

            tasks.forEach((task) => {
                if (!task?.id) return;
                const type = String(task.type || '').toUpperCase();
                if (type === 'MCQ') {
                    cheatedAnswers[task.id] = toOptionKey(task?.answer ?? task?.correct_answer);
                } else if (type === 'ORDERING') {
                    cheatedAnswers[task.id] = toOrderingAnswer(task);
                } else if (type === 'CATEGORIZATION') {
                    cheatedAnswers[task.id] = toCategorizationAnswer(task);
                } else {
                    cheatedAnswers[task.id] = toTextAnswer(task);
                }
            });

            // Grammar Boss Fight compatibility
            if (lessonData?.boss_fight?.errors && Array.isArray(lessonData.boss_fight.errors)) {
                lessonData.boss_fight.errors.forEach((err, idx) => {
                    cheatedAnswers[`boss_${idx}_orig`] = err?.original || '';
                    cheatedAnswers[`boss_${idx}_corr`] = err?.correction || '';
                });
            }

            if (Object.keys(cheatedAnswers).length === 0) {
                showAlert('info', "No model answers found in local JSON for this quest.");
            } else {
                setUserAnswers(prev => ({ ...prev, ...cheatedAnswers }));
                if (targetLevel === '7') {
                    showAlert('success', "5** cheat applied from local model answers (no AI call).");
                }
            }
        } catch (e) {
            console.error("Cheat Error:", e);
            showAlert('error', `Cheat failed: ${e.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRetry = () => {
        if (currentLevel === '3') {
            // Toggle batch (0 -> 1 or 1 -> 0)
            setQBatch(prev => prev === 0 ? 1 : 0);

            // Clear current answers and feedbacks
            setUserAnswers({});
            setFeedbacks({});
            setHasErrors(false);
            setEarnedXp(0);

            // Jump back to briefing first to allow fetchLesson to finish
            updateStep('EXPLORE');
            setLoading(true);
            setLessonData(null);
        } else {
            // For other levels, standard retry (re-fetch)
            updateStep('EXPLORE');
            setLessonData(null);
            setUserAnswers({});
            setFeedbacks({});
            setLoading(true);
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
            const interactiveTasks = Array.isArray(lessonData?.interactive_tasks)
                ? lessonData.interactive_tasks
                : [];

            // Grammar labs score locally (identify/drill/boss); `interactive_tasks` is often [].
            // Calling evaluate_batch with an empty task list still hits the model and may return invalid JSON → stuck on PRACTICE.
            let aiFeedbacks = {};
            if (interactiveTasks.length === 0) {
                aiFeedbacks = {};
            } else {
                const res = await fetch(`${API_URL}/api/lab/evaluate_batch`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        tasks: interactiveTasks,
                        answers: userAnswers,
                        uid: user?.uid || 'placeholder',
                        category: lessonData.type,
                        isFactoryQuest
                    })
                });

                if (!res.ok) {
                    let errMsg = 'Evaluation failed';
                    try {
                        const errData = await res.json();
                        errMsg = errData.error || errMsg;
                    } catch {
                        /* non-JSON error body */
                    }
                    throw new Error(errMsg);
                }
                aiFeedbacks = await res.json();
            }

            setFeedbacks(aiFeedbacks);

            // Calculate Performance
            const results = {};
            let correctCount = 0;
            let totalCount = 0;

             if (lessonData?.type === 'GRAMMAR' || location.state?.isGrammarLab) {
                // Grammar Lab Logic: Explicitly count correct answers
                const idTotal = lessonData.head_noun_tasks?.length || 0;
                const drillTotal = lessonData.drill_tasks?.length || 0;
                const bossTotal = lessonData.boss_fight?.errors?.length || 0;
                totalCount = idTotal + drillTotal + bossTotal;

                let idCorrect = 0;
                Object.values(identifyResults).forEach(v => { if (v === true) idCorrect++; });

                let drillCorrect = 0;
                lessonData.drill_tasks?.forEach((t, idx) => {
                    if (drillAnswers[idx] === t.answer) drillCorrect++;
                });

                let bossCorrect = 0;
                lessonData.boss_fight?.errors?.forEach((err, idx) => {
                    const isOriginalCorrect = userAnswers[`boss_${idx}_orig`]?.trim().toLowerCase() === err.original.toLowerCase();
                    const isCorrectionCorrect = userAnswers[`boss_${idx}_corr`]?.trim().toLowerCase() === err.correction.toLowerCase();
                    if (isOriginalCorrect && isCorrectionCorrect) {
                        bossCorrect += 1;
                    }
                });

                correctCount = idCorrect + drillCorrect + bossCorrect;
            } else {
                // Standard Lab Logic
                totalCount = interactiveTasks.length || 1;
                interactiveTasks.forEach(t => {
                    const f = aiFeedbacks[t.id];
                    const isCorrect = f && (f.status === 'correct' || f.correct === true);
                    const isPartial = f && f.status === 'partial';
                    
                    results[t.id] = isCorrect ? 'correct' : (isPartial ? 'partial' : 'incorrect');
                    if (isCorrect) {
                        correctCount += 1;
                    } else if (isPartial) {
                        correctCount += 0.5;
                    }
                });
            }

            // XP Calculation: Proportional to score and level difficulty
            const baseLevelXp = (
                currentLevel === '7' ? 350 : 
                currentLevel === '6' ? 250 : 
                currentLevel === '5' ? 200 : 
                currentLevel === '4' ? 150 : 100
            );
            
            let taskXp = location.state?.taskXp || baseLevelXp;
            if (lessonData?.type === 'GRAMMAR' || location.state?.isGrammarLab) {
                taskXp = baseLevelXp; 
            }

            const calculatedXp = Math.floor((correctCount / Math.max(1, totalCount)) * taskXp);
            setEarnedXp(calculatedXp);

            const calculatedMasteryScore = Math.floor((correctCount / Math.max(1, totalCount)) * 100);
            setMasteryScore(calculatedMasteryScore);

            // Collect Mistakes
            const mistakes = interactiveTasks
                .filter(t => results[t.id] === 'incorrect' || results[t.id] === 'partial' || results[t.id] === false)
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
                    level: currentLevel,
                    masteryScore: calculatedMasteryScore,
                    topic: lessonData.topic || topic || 'Learning Lab',
                    title: displayTopic, // NEW: Mission Name
                    paper: location.state?.isGrammarLab ? 'Grammar' : ((lessonData.type || 'READING').charAt(0).toUpperCase() + (lessonData.type || 'READING').slice(1).toLowerCase()), // NEW: Normalized Paper Name
                    mistakes, // Send detected mistakes
                    isFactoryQuest,
                    isWeeklyQuest,
                    isGrammarLab: location.state?.isGrammarLab
                })
            });
            if (!submitRes.ok) throw new Error("Failed to save mission progress");
            
            const submitData = await submitRes.json();
            if (submitData.breakdown) {
                setXpBreakdown(submitData.breakdown);
            }
            if (submitData.earnedTotal !== undefined) {
                setEarnedXp(submitData.earnedTotal);
            }

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

            updateStep('SUCCESS');
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

            const baseLevelXp = (
                currentLevel === '7' ? 350 : 
                currentLevel === '6' ? 250 : 
                currentLevel === '5' ? 200 : 
                currentLevel === '4' ? 150 : 100
            );
            const levelMultiplier = numericScore >= 80 ? 1.2 : (numericScore >= 60 ? 1.0 : 0.5);
            const finalXp = Math.floor(baseLevelXp * levelMultiplier);
            setEarnedXp(finalXp);
            setMasteryScore(numericScore);

            // 3. Persist to Backend (Update Profile & Timeline)
            const submitPayload = {
                uid: user?.uid || 'placeholder',
                results: { writing_task: true },
                xp: finalXp,
                masteryScore: numericScore,
                topic: skillId,
                title: displayTopic, // NEW: Mission Name
                paper: 'Writing', // NEW: Explicit Paper
                mistakes: [],
                isFactoryQuest,
                feedback: feedback // Include feedback for review
            };

            await fetch(`${API_URL}/api/lab/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submitPayload)
            });

            updateStep('SUCCESS');
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
                    <div className="w-10"></div>
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
                            updateStep('EXPLORE');
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
            <LoadingPage 
                title="Synthesizing Laboratory Material..." 
                subtext="Crafting an optimized HKDSE environment for your proficiency level."
            />
        );
    }

    // --- ERROR STATE ---
    if (genError) {
        const isComingSoon = genError.includes('QUEST_BANK_EMPTY');

        return (
            <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
                <div className="text-center space-y-4 p-8">
                    <div className={`inline-flex p-4 ${isComingSoon ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600' : 'bg-red-100 dark:bg-red-900/30 text-red-600'} rounded-full mb-4`}>
                        {isComingSoon ? <Layers size={32} /> : <X size={32} />}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {isComingSoon ? "Quest Coming Soon" : t('lab.connection_interrupted')}
                    </h2>
                    <p className="text-gray-500 max-w-md mx-auto">
                        {isComingSoon
                            ? "We are currently manufacturing fresh quest content for this micro-skill. Please check back later!"
                            : genError}
                    </p>
                    {genError.includes("moved to the Quests Lab") ? (
                        <button
                            onClick={() => navigate('/dashboard', { 
                                state: { 
                                    openRoadmap: 'ENGLISH', 
                                    roadmapFilter: genError.includes('listening') ? 'LISTENING' : 'WRITING' 
                                } 
                            })}
                            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:scale-105 transition-transform"
                        >
                            Go to Quests Lab
                        </button>
                    ) : (
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold hover:scale-105 transition-transform"
                        >
                            {t('lab.return_dashboard')}
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col animate-in fade-in duration-300">
            <header className="fixed top-0 inset-x-0 h-16 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 z-50 px-6 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate('/dashboard', { state: { openRoadmap: true } })} 
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all group flex items-center"
                        title="Back to Roadmap"
                    >
                        <ChevronLeft className="w-6 h-6 text-gray-500 group-hover:text-indigo-600 transition-colors" />
                    </button>
                    <div className="h-8 w-px bg-gray-100 dark:bg-gray-800 hidden md:block"></div>
                    <div className="flex flex-col justify-center">
                        <h1 className="text-sm font-black text-gray-900 dark:text-gray-100 tracking-tight leading-tight">{displayTopic}</h1>
                        <div className="flex items-center gap-2">
                            <span className="px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded text-[8px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-800">
                                Level {currentLevel === '7' ? '5**' : currentLevel === '6' ? '5*' : currentLevel}
                            </span>
                            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                <Sparkles size={8} className="text-amber-500" />
                                XP: +{missionXp}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Centered Progress Bar */}
                {lessonData?.type === 'GRAMMAR' && step === 'PRACTICE' && (
                    <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3">
                        <div className="flex gap-1.5">
                            {['LEARN', 'IDENTIFY', 'DRILL', 'BOSS_FIGHT'].map((s) => (
                                <div 
                                    key={s} 
                                    className={`h-1.5 w-8 md:w-12 rounded-full transition-all duration-500 ${
                                        grammarSubStep === s ? 'bg-indigo-600' : 
                                        (['LEARN', 'IDENTIFY', 'DRILL', 'BOSS_FIGHT'].indexOf(grammarSubStep) > ['LEARN', 'IDENTIFY', 'DRILL', 'BOSS_FIGHT'].indexOf(s) ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-800')
                                    }`}
                                />
                            ))}
                        </div>
                        <div className="hidden md:block px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 rounded border border-indigo-100 dark:border-indigo-800">
                            <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest whitespace-nowrap">
                                {grammarSubStep === 'LEARN' ? 'Rule' :
                                 grammarSubStep === 'IDENTIFY' ? 'Spotter' :
                                 grammarSubStep === 'DRILL' ? 'Drill' : 'Final'}
                            </span>
                        </div>
                    </div>
                )}

                <div className="flex items-center gap-3">
                    {/* Debug Cheat Tools - Internal QA */}
                    {isCheatEnabled(user, profile) && !isMock && (
                        <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 p-1 rounded-lg border border-amber-200">
                            <span className="text-[10px] font-black text-amber-600 px-1 hidden sm:block">DEBUG:</span>
                            {['3', '4', '5', '5*', '5**'].map(lvl => (
                                <button
                                    key={lvl}
                                    onClick={() => {
                                        const norm = lvl === '5**' ? '7' : lvl === '5*' ? '6' : lvl;
                                        if (step === 'PRACTICE') {
                                            handleCheat(norm);
                                        } else {
                                            const newParams = new URLSearchParams(searchParams);
                                            newParams.set('level', norm);
                                            setSearchParams(newParams);
                                        }
                                    }}
                                    disabled={isSubmitting}
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded transition-colors ${
                                        currentLevel === (lvl === '5**' ? '7' : lvl === '5*' ? '6' : lvl)
                                        ? 'bg-amber-500 text-white'
                                        : 'hover:bg-amber-200 dark:hover:bg-amber-800 dark:text-amber-400'
                                    }`}
                                >
                                    {lvl}
                                </button>
                            ))}
                        </div>
                    )}

                    {isMock && duration > 0 && step === 'PRACTICE' && (
                        <MockCountdownTimer 
                            initialSeconds={duration} 
                            onTimeUp={() => {
                                alert("Time is up! Submitting your mission...");
                                handleSubmitMission();
                            }} 
                        />
                    )}
                </div>
            </header>

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

            {/* The sticky header was removed to allow the Global Navbar to show instead */}


            {/* Immersive Scroll Content */}
            <main className="flex-1 bg-gray-50/50 dark:bg-transparent select-none pt-16">
                <div className="w-full px-8 md:px-12 pt-4 pb-12 font-sans">

                    {step === 'EXPLORE' && (
                        <div className="space-y-16 animate-in slide-in-from-bottom-8 duration-700">
                            {/* Hero Intro */}
                            <div className="space-y-6">
                                <span className="inline-block px-4 py-1.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-black uppercase tracking-[0.2em] rounded-full">
                                    {t('lab.briefing')}
                                </span>
                                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                                    <div className="flex flex-col gap-2">
                                        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-gray-900 dark:text-white max-w-4xl leading-[1.1]">
                                            {t('lab.mastering').replace('{{topic}}', displayTopic)}
                                        </h1>
                                        {topic?.startsWith('grammar_') && (
                                            <div className="flex items-center gap-3 mt-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg text-[11px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-800">
                                                        Level {currentLevel === '7' ? '5**' : currentLevel === '6' ? '5*' : currentLevel}
                                                    </div>
                                                    <div className="px-3 py-1 bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-lg text-[11px] font-black uppercase tracking-widest border border-amber-100 dark:border-amber-800">
                                                        {(() => {
                                                            const stats = typeof getMasteryStats === 'function' ? getMasteryStats(Number(currentLevel)) : null;
                                                            return (language === 'zh-HK' || language === 'zh-TW') ? stats?.zh : stats?.displayName;
                                                        })()}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col items-center justify-center p-6 bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-[2.5rem] shadow-sm transform hover:rotate-3 transition-transform">
                                        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                                            <Award size={32} className="fill-current" />
                                            <span className="text-4xl font-black">+{missionXp}</span>
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
                                    {/* Specialized Learning Content (Phase 11) */}
                                    {lessonData?.learning_content ? (
                                        <div className="space-y-12">
                                            {/* Anatomy Section */}
                                            <section className="bg-white dark:bg-gray-900 p-8 md:p-14 rounded-[3rem] shadow-sm border border-gray-100 dark:border-gray-800">
                                                <div className="flex items-center gap-4 mb-8">
                                                    <div className="p-3 bg-indigo-600 rounded-2xl text-white">
                                                        <BookOpen size={24} />
                                                    </div>
                                                    <h2 className="text-2xl font-black dark:text-white">Anatomy: {lessonData.learning_content.micro_skill}</h2>
                                                </div>

                                                <div className="space-y-8">
                                                    {lessonData.learning_content.anatomy.formula && (
                                                        <div className="p-8 bg-gray-50 dark:bg-gray-800/40 rounded-3xl border-2 border-dashed border-indigo-200 dark:border-indigo-800">
                                                            <h4 className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-4">Genre Format / Formula</h4>
                                                            <p className="text-2xl font-black text-gray-900 dark:text-white mb-2">{lessonData.learning_content.anatomy.formula}</p>
                                                            <p className="text-sm font-bold text-gray-500">{lessonData.learning_content.anatomy.formula_zh}</p>
                                                        </div>
                                                    )}

                                                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-8 rounded-3xl border border-indigo-100 dark:border-indigo-800">
                                                        <p className="text-xl font-bold text-indigo-900 dark:text-indigo-200 leading-relaxed mb-4">
                                                            {lessonData.learning_content.anatomy.definition}
                                                        </p>
                                                        <p className="text-lg text-indigo-700 dark:text-indigo-400 font-medium">
                                                            {lessonData.learning_content.anatomy.definition_zh}
                                                        </p>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <div className="p-8 bg-amber-50 dark:bg-amber-900/20 rounded-3xl border border-amber-100 dark:border-amber-800">
                                                            <h4 className="text-xs font-black text-amber-600 uppercase tracking-widest mb-4">Target Level</h4>
                                                            <p className="text-2xl font-black text-indigo-700 dark:text-indigo-400 mb-1">
                                                                {getMasteryStats(Number(currentLevel)).displayName}
                                                            </p>
                                                            <p className="text-sm font-bold text-amber-700 opacity-80">
                                                                {getMasteryStats(Number(currentLevel)).desc}
                                                            </p>
                                                        </div>
                                                        {/* Optional secondary card if needed */}
                                                    </div>
                                                </div>
                                            </section>

                                            {/* DSE Appearance */}
                                            <section className="space-y-6">
                                                <h3 className="text-2xl font-black text-gray-900 dark:text-white px-4">DSE Question Types</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    {lessonData.learning_content.dse_appearance.map((type, idx) => (
                                                        <div key={idx} className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm">
                                                            <h4 className="text-lg font-black text-indigo-600 mb-2">{type.type}</h4>
                                                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 leading-relaxed">{type.description}</p>
                                                            <div className="space-y-2">
                                                                {type.examples.map((ex, eIdx) => (
                                                                    <div key={eIdx} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-xs font-bold text-gray-500 italic">
                                                                        {ex}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </section>

                                            {/* Common Traps */}
                                            <section className="space-y-6">
                                                <h3 className="text-2xl font-black text-red-600 px-4 flex items-center gap-3">
                                                    <AlertModal.Icon type="error" size={24} />
                                                    Common Traps (常見陷阱)
                                                </h3>
                                                <div className="space-y-6">
                                                    {lessonData.learning_content.common_traps.map((trap, idx) => (
                                                        <div key={idx} className="bg-red-50 dark:bg-red-900/10 p-8 md:p-12 rounded-[3.5rem] border-2 border-red-100 dark:border-red-900/40">
                                                            <div className="flex flex-col md:flex-row gap-10">
                                                                <div className="flex-1 space-y-4">
                                                                    <div className="inline-block px-4 py-1 bg-red-600 text-white text-[10px] font-black rounded-full uppercase tracking-widest">
                                                                        TRAP: {trap.trap}
                                                                    </div>
                                                                    <p className="text-lg font-bold text-red-900 dark:text-red-200">{trap.description}</p>
                                                                    <div className="p-4 bg-white/50 dark:bg-black/20 rounded-2xl text-sm italic text-gray-600 dark:text-gray-400 border border-red-100">
                                                                        <strong>Example:</strong> {trap.example_trap}
                                                                    </div>
                                                                </div>
                                                                <div className="flex-1 bg-white dark:bg-gray-950 p-6 rounded-3xl border-2 border-green-500 shadow-lg relative">
                                                                    <div className="absolute -top-4 left-6 px-4 py-1 bg-green-500 text-white text-[10px] font-black rounded-full uppercase tracking-widest">
                                                                        Solution
                                                                    </div>
                                                                    <p className="text-green-700 dark:text-green-400 font-bold leading-relaxed">
                                                                        {trap.solution_zh}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </section>
                                        </div>
                                    ) : (
                                        <section className="bg-white dark:bg-gray-900 p-8 md:p-14 rounded-[3rem] shadow-sm border border-gray-100 dark:border-gray-800">
                                            <div className="prose prose-xl prose-indigo dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                                                {lessonData?.conceptual_explanation}
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
                                    )}
                                </div>

                                <div className="space-y-6">


                                    {/* Case Studies Section - Safe Render */}
                                    {lessonData.learning_content?.anatomy.examples ? (
                                        <>
                                            <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                                                <Sparkles className="text-indigo-500" size={24} />
                                                Case Studies
                                            </h3>
                                            {lessonData.learning_content.anatomy.examples.map((ex, idx) => (
                                                <div key={idx} className="p-8 bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm group hover:border-indigo-300 transition-all duration-300">
                                                    <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4">{ex.scenario}</h4>
                                                    <p className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-6 italic leading-relaxed">
                                                        "{ex.text}"
                                                    </p>
                                                    <div className="space-y-4">
                                                        <div className="flex gap-3">
                                                            <div className="size-6 bg-blue-100 text-blue-600 rounded flex items-center justify-center shrink-0 text-[10px] font-black">CLUE</div>
                                                            <p className="text-xs font-bold text-gray-600 dark:text-gray-400 italic">"{ex.clues.join(', ')}"</p>
                                                        </div>
                                                        <div className="flex gap-3">
                                                            <div className="size-6 bg-purple-100 text-purple-600 rounded flex items-center justify-center shrink-0 text-[10px] font-black">LOGIC</div>
                                                            <p className="text-xs font-bold text-gray-600 dark:text-gray-400">{ex.logic}</p>
                                                        </div>
                                                        <div className="mt-4 p-4 bg-indigo-600 text-white rounded-2xl">
                                                            <div className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">Inference</div>
                                                            <p className="font-bold leading-relaxed">{ex.inference_en}</p>
                                                            <p className="text-sm opacity-90 mt-1">{ex.inference_zh}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </>
                                    ) : (lessonData.examples || []).length > 0 && (
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
                                    onClick={() => updateStep('PRACTICE')}
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
                        <div className="w-full mx-auto px-0 animate-in slide-in-from-right-16 duration-700">
                            {lessonData?.type === 'GRAMMAR' ? (
                                <div className="max-w-7xl mx-auto py-10 px-4">
                                    <div className="relative flex items-center justify-center gap-6 group/nav">
                                        {/* Side Navigation: Previous */}
                                        <button
                                            onClick={() => {
                                                if (grammarSubStep === 'LEARN') {
                                                    if (currentRuleIdx > 0) setCurrentRuleIdx(currentRuleIdx - 1);
                                                } else if (grammarSubStep === 'IDENTIFY') {
                                                    if (currentHeadNounIdx > 0) setCurrentHeadNounIdx(currentHeadNounIdx - 1);
                                                    else {
                                                        setGrammarSubStep('LEARN');
                                                        setCurrentRuleIdx(lessonData.rule_cards.length - 1);
                                                    }
                                                } else if (grammarSubStep === 'DRILL') {
                                                    if (currentDrillIdx > 0) setCurrentDrillIdx(currentDrillIdx - 1);
                                                    else {
                                                        setGrammarSubStep('IDENTIFY');
                                                        setCurrentHeadNounIdx(lessonData.head_noun_tasks.length - 1);
                                                    }
                                                } else if (grammarSubStep === 'BOSS_FIGHT') {
                                                    setGrammarSubStep('DRILL');
                                                    setCurrentDrillIdx(lessonData.drill_tasks.length - 1);
                                                }
                                            }}
                                            disabled={grammarSubStep === 'LEARN' && currentRuleIdx === 0}
                                            className="flex items-center justify-center size-12 md:size-16 rounded-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xl text-gray-400 hover:text-indigo-600 disabled:opacity-0 transition-all hover:scale-110 active:scale-95 shrink-0"
                                            title="Previous Task"
                                        >
                                            <ChevronLeft size={36} strokeWidth={2.5} />
                                        </button>


                                        <div className="flex-1 max-w-5xl overflow-visible">
                                    {grammarSubStep === 'LEARN' && lessonData.rule_cards && lessonData.rule_cards[currentRuleIdx] && (
                                        <RuleCard 
                                            rule={lessonData.rule_cards[currentRuleIdx]}
                                            isLast={currentRuleIdx === (lessonData.rule_cards?.length || 0) - 1}
                                            onNext={() => {
                                                if (currentRuleIdx < (lessonData.rule_cards?.length || 0) - 1) {
                                                    setCurrentRuleIdx(currentRuleIdx + 1);
                                                } else {
                                                    setGrammarSubStep('IDENTIFY');
                                                }
                                            }}
                                        />
                                    )}

                                            {grammarSubStep === 'IDENTIFY' && lessonData.head_noun_tasks && lessonData.head_noun_tasks[currentHeadNounIdx] && (
                                                <HeadNounSelector 
                                                    task={lessonData.head_noun_tasks[currentHeadNounIdx]}
                                                    topic={topic}
                                                    onComplete={(correct) => {
                                                        setIdentifyResults(prev => ({ ...prev, [currentHeadNounIdx]: correct }));
                                                        if (correct) {
                                                            setComboCount(c => c + 1);
                                                            setMaxCombo(m => Math.max(m, comboCount + 1));
                                                        } else {
                                                            setComboCount(0);
                                                            setGrammarMistakes(m => [...m, { 
                                                                task: lessonData.head_noun_tasks[currentHeadNounIdx],
                                                                type: 'IDENTIFY' 
                                                            }]);
                                                        }
                                                    }}
                                                />
                                            )}


                                            {grammarSubStep === 'DRILL' && lessonData.drill_tasks && (
                                                <div className="space-y-8 animate-in slide-in-from-right-8">
                                                    <div className="text-center space-y-4">
                                                        <span className="inline-block px-4 py-1.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-black uppercase tracking-widest rounded-full">
                                                            Phase 3: Rapid-Fire Drills
                                                        </span>
                                                        <h3 className="text-2xl md:text-3xl font-black dark:text-white">Complete the sentence accurately.</h3>
                                                        <div className="text-sm font-bold text-gray-400">Task {currentDrillIdx + 1} of {lessonData.drill_tasks?.length || 0}</div>
                                                    </div>

                                                    <div className="bg-white dark:bg-gray-900 p-8 md:p-10 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-800">
                                                        <p className="text-3xl font-black text-center mb-12 dark:text-white leading-tight">
                                                            {lessonData.drill_tasks[currentDrillIdx]?.question}
                                                        </p>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            {lessonData.drill_tasks[currentDrillIdx]?.options?.map((opt, idx) => {
                                                                const isSelected = drillAnswers[currentDrillIdx] === opt;
                                                                const isAnswered = drillAnswers[currentDrillIdx] !== undefined;
                                                                const isCorrect = opt === lessonData.drill_tasks[currentDrillIdx].answer;

                                                                return (
                                                                    <button
                                                                        key={idx}
                                                                        onClick={() => {
                                                                            if (isAnswered) return;
                                                                            const correct = opt === lessonData.drill_tasks[currentDrillIdx].answer;
                                                                            setDrillAnswers(prev => ({ ...prev, [currentDrillIdx]: opt }));
                                                                            
                                                                            if (correct) {
                                                                                setComboCount(c => c + 1);
                                                                                setMaxCombo(m => Math.max(m, comboCount + 1));
                                                                            } else {
                                                                                setComboCount(0);
                                                                                setGrammarMistakes(m => [...m, {
                                                                                    task: lessonData.drill_tasks[currentDrillIdx],
                                                                                    type: 'DRILL',
                                                                                    userAnswer: opt
                                                                                }]);
                                                                            }
                                                                        }}
                                                                        disabled={isAnswered}
                                                                        className={`p-6 rounded-3xl text-xl font-black transition-all transform hover:scale-105 active:scale-95 shadow-sm border-2 ${
                                                                            !isAnswered ? 'bg-gray-50 dark:bg-gray-800 border-transparent hover:bg-indigo-600 hover:text-white' :
                                                                            (isCorrect ? 'bg-green-500 text-white border-green-600' : 
                                                                             (isSelected ? 'bg-red-500 text-white border-red-600' : 'bg-gray-50 dark:bg-gray-800 border-transparent opacity-50'))
                                                                        }`}
                                                                    >
                                                                        {opt}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>

                                                    {drillAnswers[currentDrillIdx] !== undefined && (
                                                        <motion.div 
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            className={`p-8 rounded-3xl border-2 flex items-start gap-6 ${
                                                                drillAnswers[currentDrillIdx] === lessonData.drill_tasks[currentDrillIdx].answer 
                                                                    ? 'bg-green-50 border-green-200 text-green-800' 
                                                                    : 'bg-red-50 border-red-200 text-red-800'
                                                            }`}
                                                        >
                                                            <div className="size-12 rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-sm">
                                                                {drillAnswers[currentDrillIdx] === lessonData.drill_tasks[currentDrillIdx].answer 
                                                                    ? <CheckCircle2 className="text-green-600" /> 
                                                                    : <X className="text-red-600" />
                                                                }
                                                            </div>
                                                            <div className="space-y-2">
                                                                <p className="text-sm font-black uppercase tracking-widest">
                                                                    {drillAnswers[currentDrillIdx] === lessonData.drill_tasks[currentDrillIdx].answer ? "Masterful!" : "Not quite..."}
                                                                </p>
                                                                <p className="text-lg font-bold leading-relaxed">
                                                                    {lessonData.drill_tasks[currentDrillIdx].explanation}
                                                                </p>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </div>
                                            )}

                                    {grammarSubStep === 'BOSS_FIGHT' && (
                                        <div className="space-y-12 animate-in zoom-in-95">
                                            <div className="text-center space-y-4">
                                                <div className="inline-flex items-center gap-3 px-6 py-2 bg-red-600 text-white rounded-full text-sm font-black uppercase tracking-widest shadow-lg shadow-red-600/20">
                                                    <AlertTriangle size={20} />
                                                    Final Submission: The Proofreader
                                                </div>
                                                <h3 className="text-4xl font-black dark:text-white">Find 3 errors in this report.</h3>
                                            </div>

                                            <div className="bg-white dark:bg-gray-900 p-8 md:p-10 rounded-[3rem] shadow-2xl border-2 border-red-100 dark:border-red-900/20 relative overflow-hidden">
                                                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-600 via-orange-500 to-red-600"></div>
                                                
                                                <div className="prose prose-2xl prose-red dark:prose-invert max-w-none font-medium leading-relaxed italic text-gray-700 dark:text-gray-300">
                                                    {lessonData.boss_fight.paragraph}
                                                </div>

                                                <div className="mt-16 space-y-4">
                                                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Correction Console</h4>
                                                    <div className="grid grid-cols-1 gap-3">
                                                        {lessonData.boss_fight.errors.map((err, idx) => {
                                                            const isOriginalCorrect = userAnswers[`boss_${idx}_orig`]?.trim().toLowerCase() === err.original.toLowerCase();
                                                            const isCorrectionCorrect = userAnswers[`boss_${idx}_corr`]?.trim().toLowerCase() === err.correction.toLowerCase();
                                                            const rowCorrect = isOriginalCorrect && isCorrectionCorrect;

                                                            return (
                                                                <div key={idx} className="space-y-4">
                                                                    <div className="flex flex-col md:flex-row gap-4">
                                                                        <div className="flex-1 relative">
                                                                            <input 
                                                                                placeholder="Original Error..."
                                                                                disabled={bossChecked}
                                                                                className={`w-full p-5 bg-gray-50 dark:bg-gray-800 rounded-2xl border-2 outline-none font-bold transition-all ${
                                                                                    bossChecked 
                                                                                        ? (isOriginalCorrect ? 'border-green-500 bg-green-50/50' : 'border-red-500 bg-red-50/50')
                                                                                        : 'border-transparent focus:border-red-500'
                                                                                }`}
                                                                                value={userAnswers[`boss_${idx}_orig`] || ''}
                                                                                onChange={(e) => handleAnswerChange(`boss_${idx}_orig`, e.target.value)}
                                                                            />
                                                                            {bossChecked && (
                                                                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                                                    {isOriginalCorrect ? <CheckCircle2 className="text-green-600" size={20} /> : <X className="text-red-600" size={20} />}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        <div className="flex-1 relative">
                                                                            <input 
                                                                                placeholder="Your Correction..."
                                                                                disabled={bossChecked}
                                                                                className={`w-full p-5 bg-gray-50 dark:bg-gray-800 rounded-2xl border-2 outline-none font-bold transition-all ${
                                                                                    bossChecked 
                                                                                        ? (isCorrectionCorrect ? 'border-green-500 bg-green-50/50' : 'border-red-500 bg-red-50/50')
                                                                                        : 'border-transparent focus:border-green-500'
                                                                                }`}
                                                                                value={userAnswers[`boss_${idx}_corr`] || ''}
                                                                                onChange={(e) => handleAnswerChange(`boss_${idx}_corr`, e.target.value)}
                                                                            />
                                                                            {bossChecked && (
                                                                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                                                    {isCorrectionCorrect ? <CheckCircle2 className="text-green-600" size={20} /> : <X className="text-red-600" size={20} />}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    {bossChecked && (
                                                                        <motion.div 
                                                                            initial={{ opacity: 0, height: 0 }}
                                                                            animate={{ opacity: 1, height: 'auto' }}
                                                                            className={`p-6 rounded-2xl border-2 flex items-start gap-4 ${
                                                                                rowCorrect ? 'bg-green-50 border-green-100 text-green-800' : 'bg-red-50 border-red-100 text-red-800'
                                                                            }`}
                                                                        >
                                                                            <div className="size-8 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm">
                                                                                {rowCorrect ? <CheckCircle2 size={18} className="text-green-600" /> : <X size={18} className="text-red-600" />}
                                                                            </div>
                                                                            <div className="space-y-1">
                                                                                <p className="text-[10px] font-black uppercase tracking-widest">{rowCorrect ? "Spot On!" : "Correction Needed"}</p>
                                                                                <p className="text-sm font-bold leading-relaxed">{err.explanation}</p>
                                                                            </div>
                                                                        </motion.div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                {evalError && (
                                                    <div className="mt-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-red-600 dark:text-red-400 text-sm font-bold flex items-center gap-3">
                                                        <X size={20} className="shrink-0" />
                                                        <span>{t('lab.evaluation_failed').replace('{{error}}', evalError)}</span>
                                                    </div>
                                                )}

                                                {!bossChecked ? (
                                                    <button
                                                        onClick={() => setBossChecked(true)}
                                                        disabled={lessonData.boss_fight.errors.some((_, i) => !userAnswers[`boss_${i}_orig`] || !userAnswers[`boss_${i}_corr`])}
                                                        className="mt-12 w-full py-8 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-[2.5rem] font-black text-3xl shadow-xl shadow-indigo-600/20 transition-all active:scale-95 flex items-center justify-center gap-4"
                                                    >
                                                        CHECK ANSWERS
                                                        <ChevronRight size={40} />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={handleSubmitMission}
                                                        disabled={isSubmitting}
                                                        className="mt-12 w-full py-8 bg-red-600 hover:bg-red-700 text-white rounded-[2.5rem] font-black text-3xl shadow-xl shadow-red-600/20 transition-all active:scale-95 flex items-center justify-center gap-4"
                                                    >
                                                        {isSubmitting ? <Loader2 className="animate-spin" size={40} /> : (
                                                            <>
                                                                FINAL SUBMISSION
                                                                <ChevronRight size={40} />
                                                            </>
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                        </div>

                                        {/* Side Navigation: Next */}
                                        <button
                                            onClick={() => {
                                                if (grammarSubStep === 'LEARN') {
                                                    if (currentRuleIdx < lessonData.rule_cards.length - 1) setCurrentRuleIdx(currentRuleIdx + 1);
                                                    else setGrammarSubStep('IDENTIFY');
                                                } else if (grammarSubStep === 'IDENTIFY') {
                                                    if (currentHeadNounIdx < lessonData.head_noun_tasks.length - 1) setCurrentHeadNounIdx(currentHeadNounIdx + 1);
                                                    else setGrammarSubStep('DRILL');
                                                } else if (grammarSubStep === 'DRILL') {
                                                    if (currentDrillIdx < lessonData.drill_tasks.length - 1) setCurrentDrillIdx(currentDrillIdx + 1);
                                                    else setGrammarSubStep('BOSS_FIGHT');
                                                }
                                            }}
                                            disabled={grammarSubStep === 'BOSS_FIGHT'}
                                            className="flex items-center justify-center size-12 md:size-16 rounded-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xl text-gray-400 hover:text-indigo-600 disabled:opacity-0 transition-all hover:scale-110 active:scale-95 shrink-0"
                                            title="Next Task"
                                        >
                                            <ChevronRight size={36} strokeWidth={2.5} />
                                        </button>

                                    </div>
                                </div>
                            ) : (<>

                            <div className={`flex flex-col ${lessonData.reading_passage ? 'lg:flex-row' : ''} gap-8 items-start`}>
                                {/* Reading Passage Context - Left Panel */}
                                {lessonData.reading_passage && (
                                    <div className="w-full lg:w-[58%] sticky top-24 max-h-[calc(100vh-80px)] overflow-y-auto bg-white dark:bg-gray-900 rounded-[2rem] border-2 border-indigo-100 dark:border-indigo-900/40 shadow-sm custom-scrollbar">
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
                                                        body: JSON.stringify({ passage: lessonData.reading_passage, level: currentLevel })
                                                    }).then(r => {
                                                        if (!r.ok) return r.json().then(e => { throw new Error(e.error || `Server error: ${r.status}`) });
                                                        return r.json();
                                                    }).then(data => {
                                                        console.log('[LabPage] Scaffold data received:', data);
                                                        // Handle potentially nested .data wrapper from GenerativeAIService
                                                        const normalizedData = data.data || data;
                                                        
                                                        if (!normalizedData || (!normalizedData.vocab && !normalizedData.tags && !normalizedData.connectors)) {
                                                            console.warn('[LabPage] Scaffold data empty or malformed');
                                                        }
                                                        setScaffoldData(normalizedData);
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
                                                className="prose prose-xl prose-indigo dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed font-sans text-[21px] cursor-text select-text"
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
                                                                    {/* Paragraph Tag (Level 2) - X-Ray View */}
                                                                    {scaffoldSettings.structure && pTag && (
                                                                        <div className="flex-shrink-0 mt-1.5 w-48 md:w-56 lg:w-64 min-w-[180px]">
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
 
                                                                    <div className={`flex-grow min-w-0 ${scaffoldSettings.structure ? 'pl-4' : ''}`}>
                                                                        {scaffoldSettings.vocab && scaffoldData?.vocab ? (
                                                                            <VocabSpotlight
                                                                                text={paraText}
                                                                                vocabData={scaffoldData.vocab}
                                                                                onWordClick={(word) => console.log('Word clicked:', word)}
                                                                            />
                                                                        ) : (
                                                                            <p className="m-0 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
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
                                                        {task.options.map((opt, oIdx) => {
                                                            const match = opt.match(/^([A-Da-d])[\)\.]?\s/);
                                                            const optKey = match ? match[1].toUpperCase() : String.fromCharCode(65 + oIdx);
                                                            const isSelected = userAnswers[task.id] === optKey;

                                                            return (
                                                                <button
                                                                    key={oIdx}
                                                                    onClick={() => handleAnswerChange(task.id, optKey)}
                                                                    className={`p-4 text-left rounded-xl border-2 transition-all font-bold ${isSelected
                                                                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                                                        : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-indigo-300'
                                                                        }`}
                                                                >
                                                                    {opt}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                ) : task.type === 'ORDERING' ? (
                                                    <OrderingTask
                                                        task={task}
                                                        value={userAnswers[task.id]}
                                                        onChange={(val) => handleAnswerChange(task.id, val)}
                                                        disabled={!!feedbacks[task.id]}
                                                    />
                                                ) : task.type === 'CATEGORIZATION' ? (
                                                    <CategorizationTask
                                                        task={task}
                                                        value={userAnswers[task.id]}
                                                        onChange={(val) => handleAnswerChange(task.id, val)}
                                                        disabled={!!feedbacks[task.id]}
                                                    />
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

                                            {
                                                feedbacks[task.id] && (
                                                    <div className={`mt-6 p-6 rounded-2xl border flex items-start gap-4 animate-in slide-in-from-top-4 duration-300 ${feedbacks[task.id].correct
                                                        ? 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800 text-green-700 dark:text-green-400'
                                                        : 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800 text-red-700 dark:text-red-400'
                                                        }`}>
                                                        <div className="mt-1 shrink-0">
                                                            {feedbacks[task.id].correct ? <CheckCircle2 size={24} /> : <span>HINT</span>}
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="font-black uppercase tracking-widest text-[10px]">
                                                                {feedbacks[task.id].correct ? t('lab.excellent_work') : t('lab.hint')}
                                                            </p>
                                                            <p className="text-lg font-bold leading-relaxed">{feedbacks[task.id].logic}</p>
                                                        </div>
                                                    </div>
                                                )
                                            }
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
                                        onClick={() => updateStep('EXPLORE')}
                                        className="flex-1 px-10 py-6 border-2 border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-full font-black text-xl dark:text-white hover:bg-white dark:hover:bg-gray-800 transition-all shadow-xl active:scale-95"
                                    >
                                        {t('lab.review_briefing')}
                                    </button>
                                    <button
                                        onClick={handleSubmitMission}
                                        disabled={isSubmitting || Object.values(userAnswers).some(a => {
                                            if (typeof a === 'string') return !a.trim();
                                            if (typeof a === 'object' && a !== null) return false; // Objects (Categorization) are considered "filled" if they exist
                                            return !a; // Fallback for undefined/null
                                        })}
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
                            </>
                        )}
                    </div>
                )}

                    {step === 'SUCCESS' && (
                        <div className={`max-w-[1400px] mx-auto animate-in zoom-in-95 duration-1000 ${lessonData.reading_passage ? 'w-full' : 'max-w-4xl'}`}>
                            {/* Mission Header */}
                            <div className="text-center py-10 md:py-20">
                                <div className="relative inline-block mb-16">
                                    <div className="absolute inset-0 bg-yellow-400 blur-[80px] opacity-40 animate-pulse"></div>
                                    <div className="relative p-16 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 text-white rounded-[5rem] shadow-[0_40px_100px_rgba(234,179,8,0.3)]">
                                        <Award size={100} strokeWidth={2.5} />
                                    </div>
                                    <div className="absolute -top-10 -right-10 p-6 bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl border-8 border-yellow-100 dark:border-yellow-900 animate-bounce">
                                        <Sparkles className="text-yellow-500" size={48} />
                                    </div>
                                </div>

                                <h1 className="text-6xl md:text-7xl font-black dark:text-white mb-8 tracking-tighter">{t('lab.mission_accomplished')}</h1>
                                <p className="text-2xl md:text-3xl text-gray-500 dark:text-gray-400 mb-16 leading-relaxed font-bold max-w-xl mx-auto">
                                    {masteryScore >= 90 ? (
                                        lessonData.success_feedback || "Outstanding! You have demonstrated exceptional mastery of these concepts."
                                    ) : masteryScore >= 70 ? (
                                        "Solid work! You've grasped the core concepts, but there's still room to sharpen your accuracy for a perfect score."
                                    ) : (
                                        "Mission Complete! You've identified several key areas for improvement. Keep practicing to solidify your understanding."
                                    )}
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
                                        <div className="bg-green-50 dark:bg-green-900/10 p-10 rounded-[3.5rem] border-2 border-green-100 dark:border-green-900/50 transform hover:scale-105 transition-all flex flex-col items-center">
                                            <div className="flex items-center justify-center gap-4 mb-3">
                                                <Sparkles className="text-green-600" size={32} />
                                                <span className="text-4xl font-black text-green-700 dark:text-green-400">+{earnedXp} XP</span>
                                            </div>
                                            <p className="text-green-600 dark:text-green-500 font-bold uppercase tracking-widest text-[10px] mb-4">{t('lab.performance_points')}</p>

                                            {/* XP BREAKDOWN TOOLTIP/LIST */}
                                            {xpBreakdown && (
                                                <div className="w-full bg-white/50 dark:bg-black/20 p-4 rounded-2xl border border-green-100 dark:border-green-900/50 space-y-2">
                                                    {xpBreakdown.milestoneBonus > 0 && (
                                                        <motion.div 
                                                            initial={{ scale: 0.8, opacity: 0 }}
                                                            animate={{ scale: 1, opacity: 1 }}
                                                            className="mb-4 p-4 bg-gradient-to-r from-pink-500 to-rose-600 rounded-xl text-white shadow-lg relative overflow-hidden"
                                                        >
                                                            <div className="absolute top-0 right-0 p-2 opacity-20">
                                                                <Trophy size={40} />
                                                            </div>
                                                            <div className="relative z-10">
                                                                <div className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">New Milestone!</div>
                                                                <div className="text-sm font-black italic">Level {results?.newSkillLevel || results?.milestoneAchieved} Unlocked</div>
                                                                <div className="text-[10px] font-bold mt-1 opacity-90">Bonus +200 XP Awarded</div>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                    <div className="flex justify-between text-[11px] font-bold">
                                                        <span className="text-gray-400 uppercase tracking-widest">Base Reward</span>
                                                        <span className="text-green-600">{xpBreakdown.base} XP</span>
                                                    </div>
                                                    {xpBreakdown.tierMultiplier > 1 && (
                                                        <div className="flex justify-between text-[11px] font-bold">
                                                            <span className="text-indigo-400 uppercase tracking-widest">Premium Multiplier</span>
                                                            <span className="text-indigo-600">x{xpBreakdown.tierMultiplier}</span>
                                                        </div>
                                                    )}
                                                    {xpBreakdown.masteryMultiplier > 1 && (
                                                        <div className="flex justify-between text-[11px] font-bold">
                                                            <span className="text-emerald-400 uppercase tracking-widest">Mastery Multiplier</span>
                                                            <span className="text-emerald-600">x{xpBreakdown.masteryMultiplier}</span>
                                                        </div>
                                                    )}
                                                    {xpBreakdown.milestoneBonus > 0 && (
                                                        <div className="flex justify-between text-[11px] font-bold">
                                                            <span className="text-pink-400 uppercase tracking-widest">Milestone Bonus</span>
                                                            <span className="text-pink-600">+{xpBreakdown.milestoneBonus} XP</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
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
                                                    {(() => {
                                                        const isCorrect = feedbacks[task.id]?.correct || feedbacks[task.id]?.status === 'correct';
                                                        const isPartial = feedbacks[task.id]?.status === 'partial';
                                                        if (isCorrect) return <span className="px-4 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-black rounded-full uppercase">{t('lab.mastered')}</span>;
                                                        if (isPartial) return <span className="px-4 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 text-xs font-black rounded-full uppercase">PARTIAL MARKS</span>;
                                                        return <span className="px-4 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-black rounded-full uppercase">{t('lab.review_mistake')}</span>;
                                                    })()}
                                                </div>

                                                <div className="space-y-6">
                                                    <div>
                                                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">{t('lab.my_answer')}</p>
                                                        {task.type === 'MCQ' ? (
                                                            <div className="space-y-2">
                                                                <p className="text-lg font-black text-indigo-600 dark:text-indigo-400">{t('lab.selected').replace('{{answer}}', userAnswers[task.id])}</p>
                                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 opacity-60">
                                                                    {task.options?.map((opt, oIdx) => {
                                                                        const match = opt.match(/^([A-Da-d])[\)\.]?\s/);
                                                                        const optKey = match ? match[1].toUpperCase() : String.fromCharCode(65 + oIdx);
                                                                        const isSelected = userAnswers[task.id] === optKey;
                                                                        return (
                                                                            <div
                                                                                key={oIdx}
                                                                                className={`p-3 rounded-xl border text-sm font-bold ${isSelected ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-100 bg-gray-50 text-gray-400'}`}
                                                                            >
                                                                                {opt}
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        ) : task.type === 'ORDERING' ? (
                                                            <div className="space-y-2 mt-2">
                                                                {(() => {
                                                                    const val = userAnswers[task.id];
                                                                    if (!val || typeof val !== 'string' || !val.includes('-')) {
                                                                        return <p className="text-lg font-medium text-gray-400 italic">"{t('lab.no_answer')}"</p>;
                                                                    }
                                                                    const parts = val.split('-');
                                                                    return parts.map((part, sequenceIdx) => {
                                                                        const num = Number(part);
                                                                        const idx = !isNaN(num) ? num : (part.toUpperCase().charCodeAt(0) - 65);
                                                                        const itemText = task.options?.[idx] || part;
                                                                        const letter = String.fromCharCode(65 + idx);
                                                                        return (
                                                                            <div key={sequenceIdx} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-xl">
                                                                                <div className="size-6 bg-indigo-100 dark:bg-indigo-900/30 rounded flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-[10px] font-black shrink-0">
                                                                                    {sequenceIdx + 1}
                                                                                </div>
                                                                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300 italic">
                                                                                    <span className="text-primary mr-2">{letter}:</span>
                                                                                    "{itemText}"
                                                                                </span>
                                                                            </div>
                                                                        );
                                                                    });
                                                                })()}
                                                            </div>
                                                        ) : task.type === 'CATEGORIZATION' ? (
                                                            <div className="space-y-4 mt-2">
                                                                {Object.entries(userAnswers[task.id] || {}).map(([bucket, indices]) => (
                                                                    <div key={bucket} className="bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-xl p-4">
                                                                        <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-2">{bucket}</p>
                                                                        <div className="flex flex-wrap gap-2">
                                                                            {Array.isArray(indices) && indices.map(idx => (
                                                                                <span key={idx} className="px-3 py-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200">
                                                                                    {task.options?.[idx] || `Item ${idx}`}
                                                                                </span>
                                                                            ))}
                                                                            {(!Array.isArray(indices) || indices.length === 0) && (
                                                                                <span className="text-xs text-gray-400 italic">No items assigned</span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <p className="text-lg font-medium text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700 italic">
                                                                "{userAnswers[task.id] || t('lab.no_answer')}"
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <p className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-2">{t('lab.feedback_logic')}</p>
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
                                            topic={topic} // Pass raw topic ID
                                            lessonMode={lessonData.type} // passing type as mode for R/L/S logic
                                            onRetry={handleRetry}
                                            onExit={handleClose}
                                            isWeeklyQuest={isWeeklyQuest}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main >
            {/* AI Grading Overlay */}
            <GradingOverlay 
                isOpen={isSubmitting} 
                title="Synchronizing Lab Data"
                status="Evaluating your logic and mastery of micro-skills..."
            />
        </div >
    );
};


// --- CATEGORIZATION TASK COMPONENT ---
function CategorizationTask({ task, value, onChange, disabled }) {
    // Debug logging to catch the "no options" state
    React.useEffect(() => {
        if (!task.options || task.options.length === 0) {
            console.warn(`[CategorizationTask] Warning: Task ${task.id} has no options!`, task);
        }
    }, [task]);

    // Derive current buckets state from value prop or initialize
    const currentBuckets = React.useMemo(() => {
        const initial = {};
        (task.buckets || []).forEach(b => initial[b] = []);

        if (value && typeof value === 'object' && value !== null) {
            Object.keys(initial).forEach(b => {
                if (Array.isArray(value[b])) initial[b] = value[b];
            });
        }
        return initial;
    }, [value, task.buckets]);

    // Compute which items haven't been assigned yet
    const unassignedItems = React.useMemo(() => {
        const assignedIndices = new Set();
        Object.values(currentBuckets).forEach(indices => {
            indices.forEach(i => {
                if (typeof i === 'number') assignedIndices.add(i);
            });
        });
        return (task.options || []).map((_, i) => i).filter(i => !assignedIndices.has(i));
    }, [currentBuckets, task.options]);

    // Move item between buckets or back to unassigned
    const moveItem = (itemIndex, targetBucket) => {
        if (disabled) return;

        const newBuckets = { ...currentBuckets };
        // Remove from all existing buckets
        Object.keys(newBuckets).forEach(b => {
            newBuckets[b] = (newBuckets[b] || []).filter(i => i !== itemIndex);
        });

        // Add to target bucket if one is provided
        if (targetBucket && newBuckets[targetBucket]) {
            newBuckets[targetBucket] = [...newBuckets[targetBucket], itemIndex].sort((a, b) => a - b);
        }

        onChange(newBuckets);
    };

    const taskPrefix = task.id || 'task';

    return (
        <div className="space-y-6 select-none">
            {/* Source Area */}
            <div className={`p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed transition-all duration-300 ${unassignedItems.length > 0 ? 'border-gray-200 dark:border-gray-700' : 'border-transparent opacity-50'}`}>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Items to Sort</p>
                <div className="flex flex-wrap gap-2 min-h-[40px]">
                    {unassignedItems.map(idx => (
                        <motion.div
                            layoutId={`cat-item-${taskPrefix}-${idx}`}
                            key={`unassigned-${idx}`}
                            className={`cursor-grab active:cursor-grabbing px-3 py-2 bg-white dark:bg-gray-700 shadow-sm border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 select-none ${disabled ? 'opacity-50 pointer-events-none' : 'hover:border-primary hover:text-primary transition-colors'}`}
                            draggable={!disabled}
                            onDragStart={(e) => {
                                e.dataTransfer.setData('text/plain', idx.toString());
                                e.stopPropagation();
                                if (window.getSelection) window.getSelection().removeAllRanges();
                            }}
                        >
                            {task.options[idx]}
                        </motion.div>
                    ))}
                    {unassignedItems.length === 0 && task.options?.length > 0 && (
                        <span className="text-xs text-gray-400 italic">All items sorted!</span>
                    )}
                    {(!task.options || task.options.length === 0) && (
                        <span className="text-xs text-red-400 italic">Error: No items found for this task.</span>
                    )}
                </div>
            </div>

            {/* Buckets Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(task.buckets || []).map((bucketName, bIdx) => (
                    <div
                        key={bucketName}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                            e.preventDefault();
                            const idx = parseInt(e.dataTransfer.getData('text/plain'));
                            if (!isNaN(idx)) moveItem(idx, bucketName);
                        }}
                        className="flex flex-col h-full min-h-[160px] bg-indigo-50/30 dark:bg-indigo-900/10 border-2 border-indigo-100 dark:border-indigo-500/20 rounded-2xl p-4 transition-all hover:border-indigo-300 dark:hover:border-indigo-500/40"
                    >
                        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-indigo-100 dark:border-indigo-500/20">
                            <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                            <span className="font-bold text-indigo-900 dark:text-indigo-300">{bucketName}</span>
                            <span className="ml-auto text-xs bg-white dark:bg-gray-800 px-2 py-0.5 rounded-full text-indigo-400 font-mono shadow-sm">
                                {(currentBuckets[bucketName] || []).length}
                            </span>
                        </div>

                        <div className="flex-1 space-y-2">
                            {(currentBuckets[bucketName] || []).map(idx => (
                                <motion.div
                                    layoutId={`cat-item-${taskPrefix}-${idx}`}
                                    key={`bucketed-${bucketName}-${idx}`}
                                    className="group relative px-3 py-2 bg-white dark:bg-gray-800 shadow-sm border border-indigo-100 dark:border-indigo-500/30 rounded-lg text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2"
                                >
                                    <span className="flex-1">{task.options[idx]}</span>
                                    {!disabled && (
                                        <button
                                            onClick={() => moveItem(idx, null)}
                                            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity p-1"
                                            title="Unassign"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </motion.div>
                            ))}
                            {(currentBuckets[bucketName] || []).length === 0 && (
                                <div className="h-full flex items-center justify-center py-8">
                                    <span className="text-[10px] text-indigo-300 dark:text-indigo-500/50 uppercase font-black tracking-widest">Drop here</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            {unassignedItems.length > 0 && (
                <div className="flex justify-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500/50 animate-pulse bg-red-50 dark:bg-red-900/10 px-4 py-1.5 rounded-full border border-red-100 dark:border-red-900/20">
                        Sort all items to complete!
                    </p>
                </div>
            )}
        </div>
    );
}

export default LabPage;
