import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useAvatar } from '../context/AvatarContext';
import { X, ArrowRight, ArrowLeft, CheckCircle, AlertCircle, RotateCcw, ChevronDown, Lightbulb, Maximize2, Minimize2 } from 'lucide-react';
import { LoadingPage } from '../components/shared';
import { SafeInlineMath, SafeBlockMath } from '../components/maths/SafeMath';
import 'katex/dist/katex.min.css';
import MathInput from '../components/maths/MathInput';
import ImageUploadInput from '../components/maths/ImageUploadInput';
import GeometryRenderer from '../components/maths/GeometryRenderer';
import TutorialOverlay from '../components/maths/TutorialOverlay';
import MockCountdownTimer from '../components/utils/MockCountdownTimer'; // NEW
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
    const level = location.state?.level || parseInt(searchParams.get('level')) || 1;
    const { taskId, title, xp, isFactoryQuest, isMock, duration } = location.state || {};

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({}); // Map: { qId: answerVal }
    const [imageAnswers, setImageAnswers] = useState({}); // Map: { qId: imageUrl }
    const [showCheatMenu, setShowCheatMenu] = useState(false);
    const [step, setStep] = useState(searchParams.get('step') || 'PRACTICE'); // EXPLORE, PRACTICE
    
    // Sync step with URL
    useEffect(() => {
        const urlStep = searchParams.get('step');
        if (urlStep && urlStep !== step) {
            setStep(urlStep);
        }
    }, [searchParams]);

    // Helper to update step and URL
    const updateStep = (newStep) => {
        setStep(newStep);
        const newParams = new URLSearchParams(searchParams);
        newParams.set('step', newStep);
        setSearchParams(newParams);
    };

    const [hints, setHints] = useState([]); // Array of progressive hints
    const [hintIndex, setHintIndex] = useState(-1);
    const [loadingHint, setLoadingHint] = useState(false);
    const [isDiagramExpanded, setIsDiagramExpanded] = useState(false);
    const [isAuditMode, setIsAuditMode] = useState(false);
    const [isAuditing, setIsAuditing] = useState(false);
    const [isReviewMode, setIsReviewMode] = useState(false);
    const [showTutorial, setShowTutorial] = useState(false);
    const [currentBatch, setCurrentBatch] = useState(1);
    const [mathInputInsertLatex, setMathInputInsertLatex] = useState(null);
    const [showXPModal, setShowXPModal] = useState(false);
    const [xpModalData, setXpModalData] = useState(null);
    const [isBatchMode, setIsBatchMode] = useState(false);

    useEffect(() => {
        if (!localStorage.getItem('hasSeenMathTutorial') && !isMock) {
            setShowTutorial(true);
        }
    }, [isMock]);

    const closeTutorial = () => {
        setShowTutorial(false);
        localStorage.setItem('hasSeenMathTutorial', 'true');
    };

    const isWeeklyQuest = (topic === 'integrated_challenge');
    const potentialXP = isWeeklyQuest ? 300 : (xp || tier.xp || 100);
    const [currentPotentialXP, setCurrentPotentialXP] = useState(potentialXP);

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

    const generatePracticeSession = async (overrideMode = null) => {
        if (isAuditMode) return; // Managed by handleStartAudit
        console.log('[MathsLabPage] generatePracticeSession called with:', { topic, level, language, uid: user?.uid });
        
        setLoading(true);
        setError(null);
        setQuestions([]);
        setAnswers({});
        setCurrentIndex(0);

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const res = await fetch(`${API_URL}/api/maths/diagnostic/practice/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    uid: user?.uid, 
                    topic, 
                    level: level || 3, 
                    language: language || 'en', 
                    isFactory: false, // Always use false for student lab to hit bank
                    mode: overrideMode
                })
            });

            if (res.ok) {
                let data = await res.json();
                if (data.error) {
                    setError(data.error);
                    setLoading(false);
                    return;
                }
                setIsReviewMode(!!data.isReview || overrideMode === 'review');
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
                    setLoading(false);
                    return;
                }

                const isQuest = !!(taskId || isFactoryQuest);

                const formattedTasks = tasks.map((t, idx) => ({
                    ...t,
                    id: t.id || `q_${Date.now()}_${idx}`,
                    // Force short_answer for Quests even if stored as MC
                    type: isQuest ? 'short_answer' : ((t.type || '').includes('mc') ? 'mc' : 'short_answer'),
                    text: t.text || t.question,
                    text_zh: t.text_zh || t.question_zh
                }));

                console.log('[MathsLabPage] Formatted Questions:', formattedTasks);
                setQuestions(formattedTasks);
                setLoading(false);
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

    const handleStartAudit = async () => {
        setIsAuditing(true);
        setQuestions([]);
        setAnswers({});
        setCurrentIndex(0);
        setError(null);

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const res = await fetch(`${API_URL}/api/admin/maths/topic-audit?topicId=${topic}`, {
                headers: { 'x-admin-secret': 'ace-it-admin-secret-123' } // Hardcoded for this specific user's convenience
            });

            if (res.ok) {
                const allQs = await res.json();
                console.log(`[v1.2.7-F] Audit data received:`, allQs);
                
                if (!Array.isArray(allQs)) {
                    throw new Error(`Invalid audit response: Expected array, got ${typeof allQs}`);
                }

                if (allQs.length === 0) {
                    setError(`No questions found for topic: ${topic}`);
                    return;
                }

                const formatted = allQs.map(q => ({
                    ...q,
                    type: q.type || 'short_answer',
                    text: q.text || q.question,
                    text_zh: q.text_zh || q.question_zh
                }));

                setQuestions(formatted);
                setIsAuditMode(true);

                // PERFORMANCE/CONVENIENCE: Automatically fill all answers with solutions
                const auditAnswers = {};
                formatted.forEach(q => {
                    // Support modular 'content' schema + bilingual fields
                    const rawStepsZH = q.solution_steps_zh || q.content?.solution_steps_zh || [];
                    const rawStepsEN = q.solution_steps_en || q.content?.solution_steps_en || q.solution_steps || q.content?.solution_steps || [];
                    
                    const explanationZH = q.explanation_zh || q.content?.explanation_zh || "";
                    const explanationEN = q.explanation_en || q.content?.explanation_en || q.explanation || q.content?.explanation || "";
                    
                    const localizedSteps = showChinese ? rawStepsZH : rawStepsEN;
                    const fallbackSteps = showChinese ? rawStepsEN : rawStepsZH;
                    const finalStepsRaw = (localizedSteps && localizedSteps.length > 0) ? localizedSteps : fallbackSteps;
                    
                    const localizedExpl = showChinese ? explanationZH : explanationEN;
                    const fallbackExpl = showChinese ? explanationEN : explanationZH;
                    const finalExpl = localizedExpl || fallbackExpl;
                    
                    // Use a clean joiner that our TipTap parser understands
                    let stepsStr = Array.isArray(finalStepsRaw) ? finalStepsRaw.map(s => String(s || '').trim()).join('\n\n') : (typeof finalStepsRaw === 'string' ? finalStepsRaw : '');
                    
                    // If steps are empty but explanation exists, use explanation
                    if (!stepsStr && finalExpl) stepsStr = finalExpl;
                    
                    const ans = q.answer || q.correct_answer || q.model_answer || q.content?.final_answer || '';
                    
                    // Safe string conversion to prevent crashes on null answers
                    const ansStr = String(ans || '');
                    const mathAns = ansStr.startsWith('$') ? ansStr : `$${ansStr}$`;
                    
                    auditAnswers[q.id] = stepsStr || mathAns;
                });
                setAnswers(auditAnswers);

                alert(`🧬 [v1.2.7-F] SUPER AUDIT: Found ${formatted.length} questions for topic: ${topic}`);
            } else {
                const errorData = await res.json().catch(() => ({}));
                setError(`Audit Request Failed: ${res.status} - ${errorData.error || 'Server error'}`);
            }
        } catch (err) {
            console.error("[v1.2.7-F] Audit failed:", err);
            setError(`Failed to initialize audit mode: ${err.message}`);
        } finally {
            setIsAuditing(false);
        }
    };

    const handleAuditDelete = async () => {
        const currentQ = questions[currentIndex];
        if (!window.confirm("🗑️ PERMANENTLY DELETE current question from database?")) return;

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const res = await fetch(`${API_URL}/api/admin/quests/delete`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json', 'x-admin-secret': 'ace-it-admin-secret-123' },
                body: JSON.stringify({ questId: currentQ.id })
            });

            if (res.ok) {
                const updated = [...questions];
                updated.splice(currentIndex, 1);
                setQuestions(updated);
                if (currentIndex >= updated.length && updated.length > 0) {
                    setCurrentIndex(updated.length - 1);
                }
                alert("Question removed successfully.");
            }
        } catch (err) {
            console.error('[MathsLabPage] Error:', err);
            setError('Connection Error: Failed to generate practice set.');
        } finally {
            setLoading(false);
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
        const lastIdxInBatch = isBatchMode ? Math.min(currentBatch * 10 - 1, questions.length - 1) : questions.length - 1;
        if (currentIndex < lastIdxInBatch) {
            setCurrentIndex(prev => prev + 1);
            window.scrollTo({ top: 0, behavior: 'instant' });
        }
    };

    const handlePrev = () => {
        setHints([]);
        setHintIndex(-1);
        setIsDiagramExpanded(false);
        const firstIdxInBatch = isBatchMode ? (currentBatch - 1) * 10 : 0;
        if (currentIndex > firstIdxInBatch) {
            setCurrentIndex(prev => prev - 1);
            window.scrollTo({ top: 0, behavior: 'instant' });
        }
    };

    const visibleQuestions = (isAuditMode && isBatchMode) 
        ? questions.slice((currentBatch - 1) * 10, currentBatch * 10)
        : questions;

    const handleBatchChange = (batchNum) => {
        const num = parseInt(batchNum);
        setCurrentBatch(num);
        // Jump to the first question of that batch (1 -> 0, 2 -> 10, etc)
        const targetIdx = (num - 1) * 10;
        if (questions[targetIdx]) {
            setCurrentIndex(targetIdx);
        } else if (questions.length > 0) {
            // If the question doesn't exist yet, go to the last available one
            setCurrentIndex(Math.min(targetIdx, questions.length - 1));
        }
    };

    const handleJumpToQuestion = (numStr) => {
        const num = parseInt(numStr);
        if (isNaN(num)) return;
        const targetIdx = num - 1; // 1-indexed to 0-indexed
        if (targetIdx >= 0 && targetIdx < questions.length) {
            setCurrentIndex(targetIdx);
            // Sync batch if needed
            setCurrentBatch(Math.floor(targetIdx / 10) + 1);
        } else {
            alert(`Question ${num} not found. Range: 1 to ${questions.length}`);
        }
    };

    const checkForHints = async () => {
        const currentQ = questions[currentIndex];

        // Unified hints array: new schema is an array of objects with { level, cost_xp, content_en, content_zh }
        let hintsArr = currentQ.hints;

        // Force a re-fetch of hints if they are in the old string format OR if they look like placeholder/bad data
        const isLegacyString = hintsArr && hintsArr.length > 0 && typeof hintsArr[0] === 'string';
        const firstHint = (hintsArr && hintsArr.length > 0) ? hintsArr[0] : null;
        const isPlaceholder = firstHint && typeof firstHint === 'object' && 
                             ((firstHint.content_zh || '').includes('translation') || 
                              (firstHint.content_zh || '').includes('Traditional Chinese') ||
                              (firstHint.content_en || '').includes('specific strategy') ||
                              (firstHint.content_en || '').includes('Review the question\'s core values'));

        if (isLegacyString || isPlaceholder) {
            console.log(`[MathsLabPage] Found stale/placeholder hints (v1.2.5). Resetting for fresh fetch.`);
            hintsArr = null;
        }

        // 1. If we already have hints locally and haven't shown them all
        if (hintsArr && hintsArr.length > 0 && hintIndex < hintsArr.length - 1) {
            const nextIdx = hintIndex + 1;
            const hintData = hintsArr[nextIdx];
            const cost = Number(hintData?.cost_xp) || 0;
            
            console.log(`[MathsLabPage] Showing local hint ${nextIdx + 1}, cost: ${cost}`);

            if (cost > 0) {
                setXpModalData({
                    title: isChinese ? "解鎖提示" : "Unlock Hint",
                    description: isChinese 
                        ? `解鎖 Hint ${nextIdx + 1} 需要消耗 ${cost} XP。`
                        : `Unlocking Hint ${nextIdx + 1} costs ${cost} XP.`,
                    cost,
                    currentXP: currentPotentialXP,
                    isChinese,
                    onConfirm: () => {
                        setCurrentPotentialXP(prev => Math.max(0, prev - cost));
                        setHintIndex(nextIdx);
                        setShowXPModal(false);
                    }
                });
                setShowXPModal(true);
                return;
            }
            
            setHintIndex(nextIdx);
            return;
        }

        // 2. Fetch from backend if not present or if we decided to overwrite legacy hints
        if (!hintsArr) {
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
                    
                    const fetchedHints = data.hints || [];
                    const firstHintCost = Number(fetchedHints[0]?.cost_xp) || 0;
                    
                    console.log(`[MathsLabPage] SUCCESS: Fetched ${fetchedHints.length} hints. First cost: ${firstHintCost}`);

                    if (firstHintCost > 0) {
                        setXpModalData({
                            title: isChinese ? "解鎖提示" : "Unlock Hint",
                            description: isChinese 
                                ? `獲取新的提示需要消耗 ${firstHintCost} XP。`
                                : `Fetching new hints costs ${firstHintCost} XP.`,
                            cost: firstHintCost,
                            currentXP: currentPotentialXP,
                            isChinese,
                            onConfirm: () => {
                                setCurrentPotentialXP(prev => Math.max(0, prev - firstHintCost));
                                setQuestions(prevQuestions => {
                                    const next = [...prevQuestions];
                                    if (next[currentIndex]) {
                                        next[currentIndex] = { ...next[currentIndex], hints: fetchedHints };
                                    }
                                    return next;
                                });
                                setHintIndex(0);
                                setShowXPModal(false);
                            }
                        });
                        setShowXPModal(true);
                        setLoadingHint(false);
                        return;
                    }

                    // CRITICAL: Use functional update to ensure we move from the LATEST questions state
                    setQuestions(prev => {
                        const next = [...prev];
                        if (next[currentIndex]) {
                            next[currentIndex] = { ...next[currentIndex], hints: fetchedHints };
                        }
                        return next;
                    });
                    
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

            if (q.type === 'mc' || q.type === 'mcq') {
                const targetLetter = (q.correct_answer || q.answer || 'A').trim().charAt(0).toUpperCase();
                const fullOption = q.options?.find(opt => opt.trim().toUpperCase().startsWith(targetLetter)) || targetLetter;
                cheatAnswers[q.id] = fullOption;
                return;
            }

            // For Short Answer, we vary the solution quality
            let solutionStr = '';
            let finalAns = (q.correct_answer || q.answer || '').trim();

            // CLEANUP: If type is NOT 'mc', strip any "A: ", "B: ", etc prefixes that might have leaked from AI
            if (q.type !== 'mc' && q.type !== 'mcq') {
                finalAns = finalAns.replace(/^[A-D]\s*[:.]\s*/i, '').trim();
            }

            // Pattern-based fallback for older question bank entries which might have placeholders
            const replacePlaceholders = (text) => {
                if (!text) return '';

                // Heuristic: Extract percentages/numbers if metabolic data is missing
                const qText = isChinese ? (q.text_zh || q.text) : q.text;
                const numbers = String(qText || '').match(/\d+(\.\d+)?/g) || [];

                let valD1 = q.d1 || (numbers[0] ? numbers[0] : 'd1');
                let valD2 = q.d2 || (numbers[1] ? numbers[1] : 'd2');
                let valMP = q.marked_price || (numbers.find(n => parseFloat(n) > 100) || 'MP');

                return String(text)
                    .replace(/\bd1\b/g, valD1)
                    .replace(/\bd2\b/g, valD2)
                    .replace(/\bMP\b/g, valMP)
                    .replace(/\bSP\b/g, (q.selling_price || finalAns || 'SP'))
                    .replace(/\bP\b/g, (q.principal || valMP || 'P'))
                    .replace(/\br\b/g, (q.rate || valD1 || 'r'))
                    .replace(/\bt\b/g, (q.years || 't'));
            };

            const rawStepsZH = q.solution_steps_zh || q.content?.solution_steps_zh || [];
            const rawStepsEN = q.solution_steps_en || q.content?.solution_steps_en || q.solution_steps || q.content?.solution_steps || [];
            
            const localizedStepsRaw = isChinese ? rawStepsZH : rawStepsEN;
            const fallbackStepsRaw = isChinese ? rawStepsEN : rawStepsZH;
            const finalStepsRaw = (localizedStepsRaw && localizedStepsRaw.length > 0) ? localizedStepsRaw : fallbackStepsRaw;

            const rawSteps = Array.isArray(finalStepsRaw) 
                ? finalStepsRaw 
                : (typeof finalStepsRaw === 'string' ? finalStepsRaw.split('\n') : []);
            
            const steps = rawSteps.map(s => replacePlaceholders(String(s || '')));

            const passport = (cheatLevel === '5*' || cheatLevel === '5**') ? '\n\n[PASSPORT: AUDIT_VERIFIED]' : '';
            if (isPerfect) {
                // Perfect Derivation
                if (steps.length > 0) {
                    solutionStr += steps.map((s, i) => {
                        const prefix = s.toLowerCase().startsWith('step') ? '' : `Step ${i + 1}: `;
                        return `${prefix}${s}`;
                    }).join('\n\n');
                } else {
                    solutionStr += `Derivation: Use formula and plug in values correctly.`;
                }
                solutionStr += ``;
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

            if (passport) {
                cheatAnswers[q.id] = (solutionStr + '\n\n' + "Final Answer: " + finalAns + passport).trim();
            } else {
                cheatAnswers[q.id] = solutionStr.trim();
            }
        });
        setAnswers(cheatAnswers);
        setShowCheatMenu(false);
        //alert(`Cheat activated! Test profile loaded for Level ${cheatLevel}`);
    };

    const handleSubmitAll = async () => {
        const isWeeklyChallenge = topic === 'integrated_challenge';
        const questionsToSubmit = (isAuditMode && isWeeklyChallenge) 
            ? questions.slice((currentBatch - 1) * 10, currentBatch * 10)
            : questions;

        const unanswered = questionsToSubmit.filter(q => {
            const hasText = answers[q.id] && String(answers[q.id]).trim() !== '';
            const hasImage = !!imageAnswers[q.id];
            return !hasText && !hasImage;
        });

        if (unanswered.length > 0) {
            const confirmed = window.confirm(
                `You have ${unanswered.length} unanswered question(s) in this ${isAuditMode ? 'batch' : 'set'}. Do you want to submit anyway?`
            );
            if (!confirmed) return;
        }

        // Filter answers/images to only include visible questions
        const filteredAnswers = {};
        const filteredImages = {};
        questionsToSubmit.forEach(q => {
            filteredAnswers[q.id] = answers[q.id];
            if (imageAnswers[q.id]) filteredImages[q.id] = imageAnswers[q.id];
        });

        navigate('/maths-lab-review', {
            state: { 
                questions: questionsToSubmit, 
                answers: filteredAnswers, 
                imageAnswers: filteredImages, 
                topic, 
                level, 
                taskId, 
                title, 
                xp: isReviewMode ? 0 : currentPotentialXP, 
                isFactoryQuest,
                isAuditMode 
            }
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

        // High-precision visual detection
        const nonVisualTopics = ['math_prob_basic', 'math_num_percentages', 'math_alg_formulas', 'math_num_num_systems', 'math_alg_complex_numbers', 'math_num_ratio', 'math_alg_functions'];
        
        const hasActualVisualContent = !!(
            question?.diagram_url ||
            (question?.diagram_json && (
                typeof question.diagram_json === 'object' 
                    ? (Object.keys(question.diagram_json).length > 2 || (question.diagram_json.elements?.length > 0) || (question.diagram_json.points?.length > 0))
                    : (question.diagram_json !== '{}' && question.diagram_json.length > 15)
            )) ||
            (question?.diagram_svg && question.diagram_svg.length > 50) ||
            (question?.visual && question.visual.length > 50)
        );

        // Hide if topic is in blacklist AND no actual content (image/json) was generated
        // FORCE FALSE for non-graphical topics to suppress legacy ghost graphs in the bank
        const hasVisual = hasActualVisualContent && !nonVisualTopics.includes(topic);

        return (
            <div className={`flex flex-col ${hasVisual && !isDiagramExpanded ? 'lg:flex-row' : ''} gap-8 items-start mastery-logic-container`}>
                <div className={`flex-1 text-gray-800 leading-relaxed font-sans w-full ${hasVisual && !isDiagramExpanded ? 'lg:max-w-[75%]' : ''}`}>
                    {parts.map((part, i) => {
                        if (!part) return null;

                        const isBlock = (part.startsWith('\\[') && part.endsWith('\\]')) || (part.startsWith('$$') && part.endsWith('$$'));
                        const isInline = (part.startsWith('\\(') && part.endsWith('\\)')) || (part.startsWith('$') && part.endsWith('$'));
                        const isHTML = part.startsWith('[HTML]') && part.endsWith('[/HTML]');

                        if (isHTML) {
                            const html = part.slice(6, -7);
                            return (
                                <div key={i} className="w-full my-6 overflow-x-auto" dangerouslySetInnerHTML={{ __html: html }} />
                            );
                        }

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
                                    // Bug 1 Fix: Preserve leading/trailing whitespace in prose segments
                                    const trimmedLine = line.replace(/^\./, '');
                                    if (!trimmedLine && line.length > 0) return <br key={lineIdx} />;
                                    if (!trimmedLine && line.length === 0) return null;

                                    const isMathLine = looksLikeMath(trimmedLine);
                                    const isStepLine = line.trim().startsWith('Step') || line.trim().startsWith('.Step');

                                    if (isMathLine) {
                                        const labeledMath = sanitizeMath(trimmedLine);
                                        const finalMath = formatNumbers(labeledMath, true);

                                        return (
                                            <React.Fragment key={lineIdx}>
                                                {(lineIdx > 0 || isStepLine) && <br />}
                                                <SafeInlineMath key={lineIdx} math={finalMath} className="mx-0.5" />
                                            </React.Fragment>
                                        );
                                    } else {
                                        const content = formatNumbers(trimmedLine);
                                        const finalContent = content.replace(/\\,/g, ' ');

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

                            {question?.diagram_url && question.diagram_url.length > 2 ? (
                                <div className="w-full h-full bg-white rounded-2xl p-4 shadow-lg border border-slate-200 flex flex-col items-center justify-center">
                                    <img
                                        src={question.diagram_url.startsWith('http') ? question.diagram_url : `${import.meta.env.VITE_API_URL}/${question.diagram_url}`}
                                        alt="Mathematical Graph"
                                        className="max-w-full max-h-full object-contain rounded-lg"
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                    {description && isDiagramExpanded && <p className="text-xs text-slate-600 italic text-center mt-4">{description}</p>}
                                </div>
                            ) : question?.diagram_json ? (
                                <div className="w-full h-full bg-white rounded-2xl p-4 shadow-lg border border-slate-200 flex flex-col items-center justify-center">
                                    <GeometryRenderer data={question.diagram_json} />
                                    {description && isDiagramExpanded && <p className="text-xs text-slate-600 italic text-center mt-4">{description}</p>}
                                </div>
                            ) : (question?.diagram_svg || question?.diagramSVG || question?.visual) ? (
                                <div className="w-full h-full bg-white rounded-2xl p-4 shadow-lg border border-slate-200 flex flex-col items-center justify-center">
                                    <div 
                                        className="w-full h-full flex items-center justify-center diagram-svg-container" 
                                        dangerouslySetInnerHTML={{ __html: question.diagram_svg || question.diagramSVG || question.visual }} 
                                    />
                                    {description && isDiagramExpanded && <p className="text-xs text-slate-600 italic text-center mt-4">{description}</p>}
                                </div>
                            ) : (
                                <div className="w-full h-full bg-white rounded-2xl p-8 border border-slate-200 flex flex-col items-center justify-center text-center">
                                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 text-slate-300">
                                        {text.includes('[TABLE') ? <AlertCircle size={32} /> : <Maximize2 size={32} />}
                                    </div>
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                        {text.includes('[TABLE') ? 'Data Table' : 'Geometric Diagram'}
                                    </h3>
                                    <p className="text-[9px] text-slate-400 font-bold">Visual representation not available for this question</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <LoadingPage 
                title="Synthesizing Mathematical Lab..." 
                subtext={`Preparing HKDSE practice set for ${getMathSkillName(topic, language)}.`}
            />
        );
    }

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

    if (error === 'BANK_EMPTY_SEEN') {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
                <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-md w-full border-2 border-slate-50">
                    <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <RotateCcw className="w-10 h-10 text-indigo-500" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 mb-2">
                        Questions Completed!
                    </h2>
                    <p className="text-slate-500 mb-8">
                        You have completed all pre-generated {getMathSkillName(topic, language)} questions at this level.<br/><br/>
                        Do you want to review them again (0 XP), or generate a new set of questions in real-time?
                    </p>
                    <button
                        onClick={() => { setError(null); generatePracticeSession('review'); }}
                        className="w-full py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all mb-3"
                    >
                        Review Existing Questions
                    </button>
                    <button
                        onClick={() => { setError(null); generatePracticeSession('realtime'); }}
                        className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-opacity-90 transition-all flex items-center justify-center gap-2 mb-3"
                    >
                        <i className="fas fa-magic"></i> Generate New Questions
                    </button>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full py-3 mt-4 text-slate-400 font-bold hover:text-slate-600 transition-all text-sm underline"
                    >
                        Return to Dashboard
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


    if (!visibleQuestions[currentIndex]) return <div className="p-10 text-center">No questions available in this batch.</div>;

    const currentQ = visibleQuestions[currentIndex];
    const currentAns = answers[currentQ.id] || '';
    const progress = ((currentIndex + 1) / visibleQuestions.length) * 100;
    const lastBatchIdx = isBatchMode ? Math.min(currentBatch * 10 - 1, questions.length - 1) : questions.length - 1;
    const isLastQuestion = currentIndex === lastBatchIdx;

    const currentTier = questions[currentIndex]
        ? getMasteryStats(questions[currentIndex].level, language === 'zh')
        : tier;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <header className="fixed top-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-md border-b border-gray-200 z-50 px-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/dashboard')} className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center"><X className="w-5 h-5 text-slate-600" /></button>
                    <div>
                        <h1 className="text-lg font-black text-slate-900">{getMathSkillName(topic, language)}</h1>
                        <div className="flex items-center gap-2">
                            {isAuditMode && (
                                <button 
                                    onClick={() => {
                                        setIsBatchMode(!isBatchMode);
                                        setCurrentIndex(0);
                                    }}
                                    className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider transition-all ${isBatchMode ? 'bg-purple-600 text-white animate-pulse' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}
                                >
                                    {isBatchMode ? `Batch ${currentBatch} Active` : "Audit: Batch Filter Off"}
                                </button>
                            )}
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${currentTier.color} bg-white border border-current`}>{currentTier.displayName}</span>
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-wider">
                                {isMock ? 'Mock Paper' : 'Practice Lab'} • {isMock ? 'High Stakes' : `${potentialXP} XP Potential`}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {isMock && duration > 0 && (
                        <MockCountdownTimer 
                            initialSeconds={duration} 
                            onTimeUp={() => {
                                alert("Time is up! Your paper is being submitted.");
                                handleSubmitAll();
                            }} 
                        />
                    )}
                    {!isMock && (
                        <button 
                            onClick={() => setShowTutorial(true)}
                            className="px-3 py-2 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-bold flex items-center gap-1 hover:bg-indigo-100 transition-colors"
                            id="tutorial-btn-top"
                        >
                            <Lightbulb className="w-3 h-3" /> <span className="hidden md:inline">Tutorial</span>
                        </button>
                    )}
                    <span className="text-sm font-bold text-slate-600 hidden md:inline">Question {isBatchMode ? (currentIndex % 10 + 1) : (currentIndex + 1)} of {visibleQuestions.length}</span>
                    {!isMock && (
                        <div className="relative cheat-menu-container">
                            <button onClick={() => setShowCheatMenu(!showCheatMenu)} className="px-4 py-2 rounded-lg bg-amber-100 text-amber-700 text-xs font-bold flex items-center gap-1">Cheat <ChevronDown className="w-3 h-3" /></button>
                            {showCheatMenu && <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border py-2 z-50">{[3, 4, 5, '5*', '5**'].map((lvl) => <button key={lvl} onClick={() => handleCheat(lvl)} className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 transition-colors">Level {lvl}</button>)}</div>}
                        </div>
                    )}
                    {user?.email === 'fungtam@gmail.com' && !isAuditMode && (
                        <button
                            onClick={handleStartAudit}
                            disabled={isAuditing}
                            className="px-6 py-2 rounded-lg bg-indigo-600 text-white text-sm font-black uppercase tracking-widest shadow-lg shadow-indigo-600/30 animate-pulse hover:animate-none"
                        >
                            {isAuditing ? 'Auditing...' : 'Manager Audit'}
                        </button>
                    )}
                    {isAuditMode && (
                        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
                            {/* Prev/Next Audit Buttons */}
                            <button 
                                onClick={handlePrev}
                                disabled={currentIndex === 0}
                                className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-600 disabled:opacity-30 hover:bg-slate-50 transition-colors shadow-sm"
                            >
                                <ArrowLeft size={14} />
                            </button>
                            
                            <span className="text-[10px] font-black text-slate-400 w-12 text-center">#{isBatchMode ? (currentIndex % 10 + 1) : (currentIndex + 1)} <span className="opacity-40">/ {visibleQuestions.length}</span></span>

                            <button 
                                onClick={handleNext}
                                disabled={isLastQuestion}
                                className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-600 disabled:opacity-30 hover:bg-slate-50 transition-colors shadow-sm"
                            >
                                <ArrowRight size={14} />
                            </button>

                            <div className="w-[1px] h-4 bg-slate-200 mx-1" />

                            {/* Jump to Question */}
                            <div className="relative group">
                                <input 
                                    type="text"
                                    placeholder="Jump #"
                                    className="w-16 h-8 rounded-lg bg-white border-0 text-[10px] font-black text-center focus:ring-2 focus:ring-indigo-500 shadow-sm"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleJumpToQuestion(e.target.value);
                                            e.target.value = '';
                                        }
                                    }}
                                />
                            </div>

                            {/* Batch Selection */}
                            <select 
                                value={currentBatch}
                                onChange={(e) => handleBatchChange(e.target.value)}
                                className="h-8 rounded-lg bg-white border-0 text-[10px] font-black px-2 focus:ring-2 focus:ring-indigo-500 shadow-sm outline-none cursor-pointer"
                            >
                                {[...Array(25)].map((_, i) => (
                                    <option key={i+1} value={i+1}>Batch {i+1}</option>
                                ))}
                            </select>

                            <button
                                onClick={() => {
                                    handleCheat('5**');
                                    // Also show a brief success state
                                    const btn = document.getElementById('auto-fill-btn');
                                    if (btn) btn.innerHTML = '✅ Filled';
                                    setTimeout(() => { if (btn) btn.innerHTML = 'Auto-fill (Audit)'; }, 2000);
                                }}
                                id="auto-fill-btn"
                                className="px-3 h-8 rounded-lg bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-wider hover:bg-emerald-200 transition-colors shadow-sm"
                                title="Instantly fill all questions with perfect answers for auditing"
                             >
                                Auto-fill (Audit)
                            </button>

                            <button
                                onClick={handleAuditDelete}
                                className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-colors"
                                title="Remove Question"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    )}
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
                                {(!isMock && currentQ.type === 'short_answer') && (
                                    <button
                                        onClick={checkForHints}
                                        disabled={loadingHint || (currentQ.hints && hintIndex >= currentQ.hints.length - 1)}
                                        className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full transition-all flex items-center gap-1 ${loadingHint
                                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                            : (currentQ.hints && hintIndex >= currentQ.hints.length - 1)
                                                ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                                                : 'bg-amber-100 text-amber-700 hover:bg-amber-200'}`}
                                    >
                                        <Lightbulb size={10} className={loadingHint ? 'animate-pulse' : ''} />
                                        {loadingHint ? 'Loading Hints...' : (hintIndex === -1 ? 'Check for Hints' : `Show Next Hint (${hintIndex + 1}/${currentQ.hints?.length || 0})`)}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Progressive Hints Display — new object schema */}
                        {hintIndex !== -1 && currentQ.hints && (
                            <div className="mb-6 space-y-3">
                                {[...Array(hintIndex + 1)].map((_, idx) => {
                                    const hintObj = currentQ.hints?.[idx];
                                    if (!hintObj) return null;
                                    const isLegacy = typeof hintObj === 'string';
                                    const hText = isChinese ? (hintObj.content_zh || hintObj.content_en) : (hintObj.content_en || hintObj.content_zh);
                                    // Backwards compat: old schema was plain strings
                                    const hContent = isLegacy ? hintObj : hText;
                                    const hasScaffold = hintObj?.editor_insert_latex;
                                    const xpCost = isLegacy ? (idx === 0 ? 0 : idx === 1 ? 5 : 10) : hintObj?.cost_xp;
                                    return (
                                        <div key={idx} className="p-4 rounded-xl border bg-amber-50/50 border-amber-100 text-amber-900 animate-in fade-in slide-in-from-top-2 duration-300 flex gap-3">
                                            <div className="shrink-0 mt-0.5 text-amber-500">
                                                <Lightbulb size={16} />
                                            </div>
                                            <div className="flex-1 mastery-logic-container">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-bold text-[10px] uppercase tracking-wider text-amber-600/80">Hint {idx + 1} <span className="opacity-50 ml-1">v1.2.5</span></span>
                                                    {xpCost > 0 && (
                                                        <span className="px-1.5 py-0.5 rounded-full bg-amber-200 text-amber-800 text-[9px] font-black">{xpCost} XP</span>
                                                    )}
                                                    {xpCost === 0 && (
                                                        <span className="px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 text-[9px] font-black">FREE</span>
                                                    )}
                                                </div>
                                                <div className="leading-relaxed" style={{ fontSize: '18px', fontWeight: '600' }}>
                                                    {(() => {
                                                        const hintObj = currentQ.hints?.[idx];
                                                        const isObj = typeof hintObj === 'object' && hintObj !== null;
                                                        const hContent = isObj 
                                                            ? (isChinese ? (hintObj.content_zh || hintObj.content_en) : (hintObj.content_en || hintObj.content_zh))
                                                            : hintObj; // Legacy string fallback
                                                        
                                                        let processedHint = (typeof hContent === 'string') ? hContent.replace(/（請將此提示翻譯成香港繁體中文）。|（請直接寫出繁體中文提示，不要包含翻譯占位符）。/g, '').trim() : '';
                                                        const isFullMath = (processedHint.startsWith('$$') && processedHint.endsWith('$$')) ||
                                                                         (processedHint.startsWith('\\[') && processedHint.endsWith('\\]'));
                                                        if (isFullMath) {
                                                            return <div className="flex justify-center my-2"><SafeBlockMath math={processedHint.slice(2, -2)} /></div>;
                                                        }
                                                        // Ensure Traditional Chinese preference is respected here too
                                                        return renderQuestionText(processedHint);
                                                    })()}
                                                </div>
                                                {hasScaffold && (
                                                    <button
                                                        onClick={() => {
                                                            setMathInputInsertLatex(hintObj.editor_insert_latex);
                                                            // Reset after a tick so re-clicking works
                                                            setTimeout(() => setMathInputInsertLatex(null), 500);
                                                        }}
                                                        className="mt-3 px-3 py-1.5 bg-purple-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center gap-1.5 hover:bg-purple-700 transition-colors shadow-sm"
                                                    >
                                                        <span>↓</span> {isChinese ? '將支架插入編輯器' : 'Insert Scaffold into Editor'}
                                                    </button>
                                                )}
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
                        {currentQ.type === 'mc' || currentQ.type === 'mcq' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {currentQ.options?.map((opt, i) => {
                                    const cleanOpt = (typeof opt === 'string' ? opt : String(opt || '')).replace(/^[A-D]\s*[:.]\s*/i, '').trim();
                                    return (
                                        <button key={i} onClick={() => handleAnswerChange(opt)} className={`p-6 text-left rounded-xl border-2 transition-all ${currentAns === opt ? 'border-purple-600 bg-purple-50 ring-1 ring-purple-600' : 'border-gray-200 hover:bg-gray-50'}`}>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full grid place-items-center text-sm font-bold leading-none pt-0.5 ${currentAns === opt ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'}`}>{String.fromCharCode(65 + i)}</div>
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
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden student-scratchpad-container">
                                    <div className="bg-slate-50 px-4 py-2 text-[10px] text-slate-500 font-black font-bold uppercase tracking-widest border-b flex justify-between items-center">
                                        <span>Show your steps (Formulas & Values only is fine)</span>
                                        <span className="opacity-60 hidden md:block">AI Grader detects Method Marks (M) & Answer Marks (A)</span>
                                    </div>
                                <MathInput id={`math-input-${currentQ.id}`} value={currentAns} onChange={handleAnswerChange} insertLatex={mathInputInsertLatex} placeholder="Enter your equations... (e.g. 0.1 * 0.6 = 0.06)" />
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
                            <button onClick={handleSubmitAll} className="px-8 py-3 rounded-full font-bold bg-gradient-to-r from-indigo-600 to-indigo-900 text-white shadow-lg flex items-center gap-2">
                                {isMock ? (isChinese ? '提交試卷' : 'Hand in Paper') : 'Submit All'} 
                                <CheckCircle className="w-4 h-4" />
                            </button>
                        ) : (
                            <button onClick={handleNext} className="px-6 py-3 rounded-full font-semibold bg-purple-600 text-white flex items-center gap-2">Next <ArrowRight className="w-4 h-4" /></button>
                        )}
                    </div>
                </div>
            </main>

            {showTutorial && <TutorialOverlay onClose={closeTutorial} isChinese={isChinese} />}
            
            {/* XP Confirmation Modal */}
            {showXPModal && xpModalData && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowXPModal(false)}></div>
                    <div className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full animate-in zoom-in-95 fade-in duration-300 border border-purple-100">
                        <div className="flex flex-col items-center text-center space-y-6">
                            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 animate-bounce-slow">
                                <Lightbulb size={40} className="fill-amber-600/20" />
                            </div>
                            
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{xpModalData.title}</h3>
                                <p className="text-slate-600 font-medium leading-relaxed">
                                    {xpModalData.description}
                                </p>
                            </div>

                            <div className="bg-slate-50 rounded-2xl p-4 w-full border border-slate-100 flex items-center justify-around">
                                <div className="text-center">
                                    <div className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Current Reward</div>
                                    <div className="text-xl font-bold text-slate-700">{xpModalData.currentXP} <span className="text-xs">XP</span></div>
                                </div>
                                <div className="text-slate-300">
                                    <ArrowRight size={20} />
                                </div>
                                <div className="text-center">
                                    <div className="text-[10px] uppercase font-black text-amber-500 tracking-widest mb-1">New Reward</div>
                                    <div className="text-xl font-bold text-amber-600">{xpModalData.currentXP - xpModalData.cost} <span className="text-xs">XP</span></div>
                                </div>
                            </div>

                            <div className="flex flex-col w-full gap-3">
                                <button 
                                    onClick={xpModalData.onConfirm}
                                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-purple-200 hover:scale-[1.02] active:scale-95 transition-all text-sm"
                                >
                                    {xpModalData.isChinese ? "立即解鎖" : "Unlock Now"}
                                </button>
                                <button 
                                    onClick={() => setShowXPModal(false)}
                                    className="w-full py-3 text-slate-400 font-bold uppercase tracking-widest text-[10px] hover:text-slate-600 transition-colors"
                                >
                                    {xpModalData.isChinese ? "再想一想" : "Keep Thinking"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MathsLabPage;
