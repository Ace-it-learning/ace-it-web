import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import ReadingPanel from '../components/exam/ReadingPanel';
import QuestionList from '../components/exam/QuestionList';

import { useAuth } from '../context/AuthContext';
import { addToNotebook } from '../services/notebookService';
import AlertModal from '../components/shared/AlertModal';
import { LoadingPage } from '../components/shared';

// --- Dictionary Popover Component ---
const DictionaryPopover = ({ data, position, onClose, onAddToNotebook, loading }) => {
    if (!position) return null;

    return (
        <div
            className="dictionary-popover absolute z-50 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 w-72 animate-in fade-in zoom-in duration-200 text-left"
            style={{ top: position.top + 10, left: position.left }}
        >
            <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-gray-900 capitalize">{data?.term || "Dictionary"}</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            {loading ? (
                <div className="space-y-2 animate-pulse">
                    <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                </div>
            ) : data?.error ? (
                <div className="text-red-500 text-sm py-2">
                    <p className="font-bold">Error</p>
                    <p>{data.error}</p>
                </div>
            ) : (
                <div className="space-y-3">
                    <div>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{data.type}</span>
                        <p className="text-gray-800 font-medium">{data.definition}</p>
                    </div>

                    <div className="bg-blue-50 p-2 rounded-lg text-blue-900 text-sm">
                        <span className="font-bold">Translation:</span> {data.translation}
                    </div>

                    {data.example && (
                        <p className="text-xs text-gray-500 italic">"{data.example}"</p>
                    )}

                    <button
                        onClick={() => onAddToNotebook(data)}
                        className="w-full bg-orange-500 text-white py-2 rounded-lg text-sm font-bold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 mt-2 shadow-sm"
                    >
                        Add to Notebook
                    </button>
                </div>
            )}
        </div>
    );
};

const ReviewPage = () => {
    const { examId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    // State
    const [examData, setExamData] = useState(null);
    const [questionsFromSub, setQuestionsFromSub] = useState([]);
    const [activePart, setActivePart] = useState('Part_A');
    const [loading, setLoading] = useState(true);

    // Dictionary State
    const [popover, setPopover] = useState(null);

    // Alert State
    const [alertState, setAlertState] = useState({ isOpen: false, type: 'info', message: '' });

    const showAlert = (type, message) => {
        setAlertState({ isOpen: true, type, message });
    };

    // Data from Navigation State
    const { answers, feedback, scoreInfo } = location.state || {}; // scoreInfo contains xpEarned and cheatingDetected

    useEffect(() => {
        // ANTI-CHEAT POPUP
        if (scoreInfo?.cheatingDetected) {
            const message = "Whoa there, Einstein! ⚡ Either you're a genius or you've got help. This round earns 10% XP.";
            // We can use a simple alert for now or a custom toast state
            // Let's rely on a delayed alert to ensure UI loads first
            setTimeout(() => showAlert('info', message), 500);
        }
    }, [scoreInfo]);

    useEffect(() => {
        const fetchExamData = async () => {
            if (!examId) return;
            try {
                const token = await user?.getIdToken?.();
                const res = await fetch(`${API_URL}/api/data/review/${encodeURIComponent(examId)}`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {}
                });
                if (!res.ok) {
                    console.error("Exam not found");
                } else {
                    const payload = await res.json();
                    setExamData(payload.examData || null);
                    setQuestionsFromSub(Array.isArray(payload.questions) ? payload.questions : []);
                }
            } catch (error) {
                console.error("Error fetching review data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchExamData();
    }, [examId, user]);

    // Close popover logic is now handled by the Backdrop overlay
    // No useEffect needed for window click

    if (loading) {
        return (
            <LoadingPage 
                title="Loading Review Protocol" 
                subtext={`Retrieving your performance data for ${examData?.title || 'this assessment'}...`}
            />
        );
    }
    if (!examData) return <div className="h-screen flex items-center justify-center">Exam data not found.</div>;
    if (!answers || !feedback) return <div className="h-screen flex items-center justify-center">
        <div className="text-center">
            <h2 className="text-xl font-bold mb-2">No Result Data</h2>
            <p className="text-gray-500 mb-4">Please access this page from the Result Page.</p>
            <button onClick={() => navigate('/dashboard')} className="text-primary hover:underline">Go Home</button>
        </div>
    </div>;

    // --- Helper Logic ---
    let currentResources = {};
    if (examData[activePart] && examData[activePart].resources) {
        // 1. Nested Schema (root.Part_A.resources) - New Generator
        currentResources = examData[activePart].resources;
    } else if (examData.resources && examData.resources[activePart]) {
        // 2. Legacy Schema (root.resources.Part_A)
        currentResources = examData.resources[activePart];
    } else if (examData.resources && activePart === 'Part_A') {
        // 3. Fallback Flat Legacy
        currentResources = examData.resources;
    }

    // Question Extraction: Prioritize Sub-collection
    let allQuestions = questionsFromSub.length > 0 ? questionsFromSub : (examData.questions || []);

    // Fallback for Legacy Nested Schema
    if (allQuestions.length === 0) {
        ['Part_A', 'Part_B1', 'Part_B2'].forEach(pKey => {
            if (examData[pKey] && examData[pKey].questions) {
                allQuestions = allQuestions.concat(examData[pKey].questions);
            }
        });
    }

    const currentQuestions = allQuestions.filter(q => {
        if (!q.part) return activePart === 'Part_A';
        const val = String(q.part).toLowerCase().replace(/[\s_]+/g, '');
        const matchMap = {
            'Part_A': ['a', 'parta'],
            'Part_B1': ['b1', 'partb1'],
            'Part_B2': ['b2', 'partb2']
        };
        const allowed = matchMap[activePart] || [];
        return allowed.includes(val);
    });

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
            // Use caretRangeFromPoint / caretPositionFromPoint to find the word
            if (document.caretRangeFromPoint) {
                const range = document.caretRangeFromPoint(e.clientX, e.clientY);
                if (range && range.startContainer.nodeType === Node.TEXT_NODE) {
                    // Expand to word boundary
                    range.expand('word');
                    text = range.toString().trim();
                    // Visually select it
                    const sel = window.getSelection();
                    sel.removeAllRanges();
                    sel.addRange(range);
                }
            }
        }

        // Validation
        if (!text || text.split(' ').length > 4) return;

        // Calculate Position
        // Position popover just below the word, aligned to left
        const range = window.getSelection().getRangeAt(0);
        const rect = range.getBoundingClientRect();

        setPopover({
            position: {
                top: rect.bottom + window.scrollY + 5, // 5px gap
                left: rect.left + window.scrollX
            },
            term: text,
            loading: true,
            data: null
        });

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
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
            // Do not close! Show error state.
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
                    context: `Exam: ${examData.title}`,
                    type: 'vocabulary',
                    source: examData.title,
                    examId: examId
                });
                showAlert('success', "Saved to Notebook!");
                setPopover(null);
            } catch (err) {
                console.error(err);
                if (err.message === 'Failed to fetch' || err.message.includes('NetworkError')) {
                    showAlert('network', "Could not save to notebook. Please check your internet connection.");
                } else {
                    showAlert('error', "Failed to save to notebook.");
                }
            }
        }
    };

    const handleQuestionSelect = (ref) => {
        if (!ref) return;
        let targetId;
        if (ref.includes(':')) {
            const [textKey, pKey] = ref.split(':');
            targetId = `p-${textKey}-${pKey}`;
        } else {
            targetId = `passage-${ref}`;
        }

        const element = document.getElementById(targetId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.classList.add('bg-yellow-100', 'transition-colors', 'duration-500');
            setTimeout(() => element.classList.remove('bg-yellow-100'), 2000);
        } else {
            console.warn("Target element not found:", targetId);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-100 overflow-hidden relative">
            {/* Popover & Backdrop */}
            {popover && (
                <>
                    {/* Invisible Backdrop to catch outside clicks */}
                    <div
                        className="fixed inset-0 z-40 bg-transparent cursor-default"
                        onClick={(e) => {
                            e.stopPropagation();
                            setPopover(null);
                        }}
                    ></div>

                    {/* The Popover itself (z-50 sits above backdrop) */}
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
                onRetry={null}
            />

            <div className="bg-white shadow-sm border-b px-6 py-3 flex justify-between items-center z-10 sticky top-0">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-2 font-medium">
                        ← Back to Results
                    </button>
                    <div className="w-px h-6 bg-gray-200 mx-2"></div>
                    <h2 className="font-bold text-gray-800">
                        Review Protocol: {examData.title}
                    </h2>

                    <div className="flex gap-1 bg-gray-100 p-1 rounded-lg ml-8">
                        {['Part_A', 'Part_B1', 'Part_B2'].map(part => (
                            <button
                                key={part}
                                onClick={() => setActivePart(part)}
                                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${activePart === part
                                    ? "bg-white text-primary shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"
                                    }`}
                            >
                                {part.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {scoreInfo?.xpEarned > 0 && (
                        <div className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold flex items-center gap-1 border border-yellow-200 shadow-sm animate-pulse">
                            <span>✨</span> {scoreInfo.xpEarned} XP Gained
                        </div>
                    )}
                    <div className="text-sm font-medium text-gray-500">
                        Final Score: <span className="text-gray-900 font-bold">{scoreInfo?.totalScore} / {scoreInfo?.totalMaxScore}</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                <div
                    className="w-1/2 overflow-y-auto p-8 border-r bg-white/50 backdrop-blur-xl space-y-8 scroll-smooth"
                    onClick={handleTextClick}
                >
                    <ReadingPanel
                        resources={currentResources}
                    // We attach click to container, but we can also attach to panel for redundancy
                    />

                    {/* DEBUGGER */}
                    <div className="mt-12 p-4 bg-gray-900 text-green-400 text-xs font-mono rounded-lg opacity-80">
                        <h3 className="uppercase font-bold mb-2 border-b border-gray-700 pb-1">Debug Info</h3>
                        <p>Active Part: {activePart}</p>
                        <p>Total Questions: {allQuestions.length}</p>
                        <p>Filtered Questions: {currentQuestions.length}</p>
                        <p>Exam Data Keys: {Object.keys(examData).join(', ')}</p>
                    </div>
                </div>

                <div className="w-1/2 overflow-y-auto bg-gray-50 p-8 scroll-smooth">
                    <QuestionList
                        questions={currentQuestions}
                        answers={answers}
                        readOnly={true}
                        feedbackData={feedback}
                        onQuestionSelect={handleQuestionSelect}
                    />
                </div>
            </div>
        </div>
    );
};

export default ReviewPage;
