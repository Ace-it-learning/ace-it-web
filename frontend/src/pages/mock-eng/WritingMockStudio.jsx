import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { 
    PenTool, 
    ChevronRight, 
    Clock,
    ShieldCheck, 
    ArrowLeft,
    CheckCircle2,
    Layout,
    Upload,
    Trash2,
    X as XIcon,
    BarChart3,
    Sparkles,
    AlertCircle,
    Info,
    Trophy,
    Target,
    FileText,
    TrendingUp,
    HelpCircle,
    Eye
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { BrainCircuit } from 'lucide-react';
import { LoadingPage, GradingOverlay } from '../../components/shared';
import { useAuth } from '../../context/AuthContext';
import { fetchWithAuth } from '../../utils/apiAuth';
import { apiUrl } from '../../utils/apiBase';
import { useAvatar } from '../../context/AvatarContext';
import UpgradeModal from '../../components/common/UpgradeModal';
import { isCheatEnabled } from '../../utils/devAccess';

/** Vite dev: same-origin `/api` uses the dev-server proxy (port 3001). Production: `VITE_API_URL` or same-origin rewrites. */
function getWritingMockApiBase() {
    if (import.meta.env.DEV) return '';
    const raw = import.meta.env.VITE_API_URL;
    if (raw && String(raw).trim()) return String(raw).replace(/\/$/, '');
    return '';
}

// Studio Components
import WritingStudioLayout from '../../components/writing/WritingStudioLayout';
import WritingStudioHeader from '../../components/writing/WritingStudioHeader';
import WritingStudioBriefing from '../../components/writing/WritingStudioBriefing';
import WritingStudioEditor from '../../components/writing/WritingStudioEditor';
import WritingStudioControlPanel from '../../components/writing/WritingStudioControlPanel';

const WritingMockStudio = () => {
    const { user, profile } = useAuth();
    const { englishTutor } = useAvatar();
    const { paperId } = useParams();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const tier = profile?.subscription_tier || 'free';

    // Core State
    const [isInitialized, setIsInitialized] = useState(false);
    const [phase, setPhase] = useState(searchParams.get('phase') || 'LOADING'); // LOADING, BRIEFING, PART_A, PART_B_SELECTOR, PART_B, RESULTS
    const [mockData, setMockData] = useState(null);
    const [selectedPartB, setSelectedPartB] = useState(null);
    
    // Sync phase with URL
    useEffect(() => {
        const urlPhase = searchParams.get('phase');
        if (urlPhase && urlPhase !== phase) {
            setPhase(urlPhase);
        }
    }, [searchParams]);

    // Helper to update phase and URL
    const updatePhase = (newPhase) => {
        setPhase(newPhase);
        setSearchParams({ phase: newPhase });
    };

    // Timer State
    const [timeLeft, setTimeLeft] = useState(120 * 60); // 120 minutes
    const [isTimeUp, setIsTimeUp] = useState(false);

    // Drafting State
    const [draftA, setDraftA] = useState('');
    const [titleA, setTitleA] = useState('');
    const [imagesA, setImagesA] = useState([]);
    
    const [draftB, setDraftB] = useState('');
    const [titleB, setTitleB] = useState('');
    const [imagesB, setImagesB] = useState([]);

    // UI State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [showQuitModal, setShowQuitModal] = useState(false);
    const [sparkNotes, setSparkNotes] = useState('');
    const [submissionResults, setSubmissionResults] = useState(null);
    const [submissionProgress, setSubmissionProgress] = useState(0);
    const [isDev, setIsDev] = useState(false);
    const [isInjecting, setIsInjecting] = useState(false);
    const [originalView, setOriginalView] = useState(null); // { title, content, type }

    // Initial Fetch
    useEffect(() => {
        // Detect Dev mode for cheat buttons
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            setIsDev(true);
        }
        const fetchMock = async () => {
            // Fetch Lock: Prevent double-fetches from StrictMode
            if (window._isFetchingMockWriting === paperId) return;
            window._isFetchingMockWriting = paperId;

            try {
                const API_BASE = getWritingMockApiBase();
                const res = await fetch(`${API_BASE}/api/english/mock/${paperId}?uid=${user?.uid || 'guest'}`);
                if (res.ok) {
                    const data = await res.json();
                    
                    // Check for results persistence
                    const urlPhase = searchParams.get('phase');
                    const saved = localStorage.getItem(`mock_save_${paperId}`);
                    
                    if (urlPhase === 'RESULTS') {
                        const savedResults = localStorage.getItem(`mock_results_${paperId}`);
                        if (savedResults) {
                            try {
                                setSubmissionResults(JSON.parse(savedResults));
                            } catch (e) {
                                console.error("Failed to load saved results:", e);
                                updatePhase('BRIEFING');
                            }
                        } else {
                            updatePhase('BRIEFING');
                        }
                    } else if (saved) {
                        try {
                            const { draftA, draftB, titleA, titleB, imagesA, imagesB, timeLeft, sparkNotes, phase: savedPhase, selectedPartB } = JSON.parse(saved);
                            setDraftA(draftA || '');
                            setDraftB(draftB || '');
                            setTitleA(titleA || '');
                            setTitleB(titleB || '');
                            setImagesA(imagesA || []);
                            setImagesB(imagesB || []);
                            setTimeLeft(timeLeft || 120 * 60);
                            setSparkNotes(sparkNotes || '');
                            if (selectedPartB) setSelectedPartB(selectedPartB);
                            
                            // If they were in the middle of a part, resume it
                            if (savedPhase && ['PART_A', 'PART_B_SELECTOR', 'PART_B'].includes(savedPhase)) {
                                updatePhase(savedPhase);
                            } else if (!urlPhase) {
                                updatePhase('BRIEFING');
                            }
                        } catch (err) {
                            console.error("Failed to parse auto-save:", err);
                            if (!urlPhase) updatePhase('BRIEFING');
                            setTitleA('');
                        }
                    } else if (!urlPhase) {
                        updatePhase('BRIEFING');
                        setTitleA('');
                    }

                    // Set mock data last to trigger effects only after restoration is complete
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
                setTimeout(() => { window._isFetchingMockWriting = null; }, 2000);
            }
        };
        fetchMock();
    }, [paperId, navigate]);

    // Auto-save Effect
    useEffect(() => {
        if (isInitialized && ['PART_A', 'PART_B_SELECTOR', 'PART_B'].includes(phase) && paperId) {
            const saveData = {
                draftA, draftB, 
                titleA, titleB, 
                imagesA, imagesB, 
                timeLeft, 
                sparkNotes,
                phase,
                selectedPartB,
                timestamp: Date.now()
            };
            localStorage.setItem(`mock_save_${paperId}`, JSON.stringify(saveData));
            localStorage.setItem('last_mock_inprogress_writing', JSON.stringify({ paperId, topic: mockData?.meta?.topic, type: 'writing' }));
        }
    }, [draftA, draftB, titleA, titleB, imagesA, imagesB, timeLeft, sparkNotes, phase, paperId, selectedPartB, mockData]);

    // Timer Interval
    useEffect(() => {
        if (phase === 'BRIEFING' || phase === 'LOADING' || phase === 'RESULTS') return;
        
        const interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    setIsTimeUp(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        
        return () => clearInterval(interval);
    }, [phase]);

    // Auto-submit on time up
    useEffect(() => {
        if (isTimeUp && !isSubmitting) {
            handleSubmit();
        }
    }, [isTimeUp]);

    // Handlers
    const handlePartBSelect = (electiveIdx) => {
        const elective = mockData.Part_B[electiveIdx];
        setSelectedPartB(elective);
        setTitleB(elective.type + " Task");
        updatePhase('PART_B');
    };

    const handleUpload = async (file, part) => {
        if (!user) return;
        setUploading(true);
        try {
            const API_BASE = getWritingMockApiBase();
            const token = await user.getIdToken();
            const sasRes = await fetch(`${API_BASE}/api/data/uploads/sas`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    folder: `writing_mocks/${user.uid}/${paperId}/${part}`,
                    filename: file.name,
                    contentType: file.type || 'application/octet-stream'
                })
            });
            if (!sasRes.ok) throw new Error('Failed to get upload URL');
            const { uploadUrl, publicUrl } = await sasRes.json();
            const uploadRes = await fetch(uploadUrl, {
                method: 'PUT',
                headers: {
                    'x-ms-blob-type': 'BlockBlob',
                    'Content-Type': file.type || 'application/octet-stream'
                },
                body: file
            });
            if (!uploadRes.ok) throw new Error('Upload to Azure Blob failed');
            const url = publicUrl;
            
            if (part === 'A') {
                setImagesA(prev => [...prev, url]);
            } else {
                setImagesB(prev => [...prev, url]);
            }
        } catch (err) {
            console.error("Upload failed:", err);
            alert("Image upload failed. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteImage = (index, part) => {
        if (part === 'A') {
            setImagesA(prev => prev.filter((_, i) => i !== index));
        } else {
            setImagesB(prev => prev.filter((_, i) => i !== index));
        }
    };

    const handleCheatMode = async (level) => {
        setIsInjecting(true);
        setSubmissionProgress(10);
        
        try {
            const API_BASE = getWritingMockApiBase();
            
            // Part A
            setSubmissionProgress(30);
            const resA = await fetch(`${API_BASE}/api/english/mock/cheat/writing`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    level,
                    part: 'A',
                    type: mockData.Part_A.genre,
                    situation: mockData.Part_A.situation
                })
            });
            
            if (resA.ok) {
                const dataA = await resA.json();
                setDraftA(dataA.content);
                setTitleA(dataA.title);
            } else {
                const errData = await resA.json();
                console.error("Part A Cheat failed:", errData);
            }
            
            // Part B
            let activePartB = selectedPartB;
            if (!activePartB && mockData?.Part_B?.length > 0) {
                activePartB = mockData.Part_B[0];
                setSelectedPartB(activePartB);
                localStorage.setItem(`mock_save_${paperId}_partB`, JSON.stringify(activePartB));
            }

            if (activePartB) {
                setSubmissionProgress(60);
                const resB = await fetch(`${API_BASE}/api/english/mock/cheat/writing`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        level,
                        part: 'B',
                        type: activePartB.type,
                        situation: activePartB.question
                    })
                });
                
                if (resB.ok) {
                    const dataB = await resB.json();
                    setDraftB(dataB.content);
                    setTitleB(dataB.title);
                } else {
                    console.error("Part B Cheat failed");
                }
            }
            
            setSubmissionProgress(100);
            setTimeout(() => {
                setIsInjecting(false);
                setSubmissionProgress(0);
            }, 800);
            
        } catch (err) {
            console.error("Cheat injection failed:", err);
            setIsInjecting(false);
            alert("Cheat injection failed. Check console for details.");
        }
    };

    const handleSubmit = async () => {
        if (tier === 'free') {
            setShowUpgradeModal(true);
            return;
        }
        setIsSubmitting(true);
        setSubmissionProgress(20);
        try {
            const API_BASE = getWritingMockApiBase();
            
            const payload = {
                paperId,
                uid: user?.uid,
                email: user?.email,
                responses: [
                    {
                        part: 'A',
                        text: draftA,
                        title: titleA,
                        images: imagesA
                    },
                    {
                        part: 'B',
                        text: draftB,
                        title: titleB,
                        images: imagesB,
                        elective: selectedPartB?.elective,
                        question: selectedPartB?.question,
                        type: selectedPartB?.type
                    }
                ]
            };

            setSubmissionProgress(50);
            const submitUrl = API_BASE
                ? `${API_BASE}/api/english/mock/writing/submit`
                : apiUrl('/api/english/mock/writing/submit');
            const res = await fetchWithAuth(user, submitUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                let results;
                try {
                    results = await res.json();
                } catch (parseErr) {
                    console.error('Writing submit: response was not valid JSON', parseErr);
                    throw parseErr;
                }
                setSubmissionProgress(100);
                setTimeout(() => {
                    setSubmissionResults(results);
                    localStorage.setItem(`mock_results_${paperId}`, JSON.stringify(results));
                    localStorage.removeItem(`mock_save_${paperId}`);
                    localStorage.removeItem('last_mock_inprogress_writing');
                    setIsSubmitting(false);
                    // Navigate to standalone result page if resultId is available
                    if (results.resultId) {
                        navigate(`/mock-exam-eng/writing/results/${results.resultId}`);
                    } else {
                        updatePhase('RESULTS');
                    }
                }, 1000);
            } else {
                let detail = '';
                let userMsg = `Submission failed (${res.status}). Check that the API is running and try again.`;
                try {
                    detail = await res.text();
                    try {
                        const asJson = JSON.parse(detail);
                        if (asJson && typeof asJson.error === 'string' && asJson.error.trim()) {
                            userMsg = `Submission failed (${res.status}): ${asJson.error}`;
                        }
                    } catch (_) { /* not JSON */ }
                } catch (_) { /* ignore */ }
                console.error('Writing submit failed', res.status, detail);
                alert(userMsg);
                setIsSubmitting(false);
            }
        } catch (err) {
            console.error("Submission error:", err);
            alert(`Submission error: ${err?.message || 'Network or server unreachable. If you use local dev, ensure the backend is running on port 3001.'}`);
            setIsSubmitting(false);
        }
    };

    // Rendering Logic
    if (phase === 'LOADING' || (!mockData && phase !== 'RESULTS')) return (
        <LoadingPage 
            title="Calibrating Writing Arena..." 
            subtext="Setting up HKDSE Paper 2 environment and loading prompt assets."
        />
    );

    if (phase === 'BRIEFING') return (
        <div className="h-screen bg-white flex items-center justify-center p-8">
            <div className="max-w-2xl w-full">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-rose-50 rounded-2xl text-rose-600">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 leading-tight">Writing Paper Instructions</h1>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Paper 2 | {mockData?.meta?.topic}</p>
                    </div>
                </div>

                <div className="space-y-6 bg-slate-50 p-8 rounded-[2rem] border border-slate-100 mb-8 text-base text-slate-600 font-medium leading-relaxed">
                    <p>1. This paper consists of **two parts**: Part A and Part B.</p>
                    <p>2. **Part A** is compulsory (approx. 200 words).</p>
                    <p>3. In **Part B**, you must choose **ONE** question (approx. 400 words) from the following themes:</p>
                    
                    <div className="grid grid-cols-2 gap-3 mt-4">
                        {mockData?.Part_B?.map((item, idx) => (
                            <div key={idx} className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-slate-400">
                                {item.elective}
                            </div>
                        ))}
                    </div>

                    <p className="mt-6 text-sm italic text-slate-400 border-t border-slate-200 pt-4">Time allowed: **120 minutes (2 hours)**. Clock starts upon clicking begin.</p>
                </div>

                <div className="flex gap-4">
                    <button 
                        onClick={() => navigate('/mock-exam-eng', { state: { activeTab: 'writing' } })}
                        className="flex-1 py-5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-black uppercase tracking-[0.2em] transition-all text-lg"
                    >
                        Go Back
                    </button>
                    <button 
                        onClick={() => updatePhase('PART_A')}
                        className="flex-[2] py-5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-rose-900/20 active:scale-95 transition-all text-lg"
                    >
                        Begin Writing Simulation
                    </button>
                </div>
            </div>
        </div>
    );

    if (phase === 'PART_B_SELECTOR') return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-12 text-white">
            <div className="max-w-5xl w-full py-12 text-center animate-in fade-in zoom-in duration-500">
                <div className="mb-12">
                    <div className="inline-block px-4 py-1 bg-rose-500 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-full mb-6">Decision Point</div>
                    <h2 className="text-6xl font-black mb-4 tracking-tight leading-tight">Choose your Elective Theme</h2>
                    <p className="text-slate-400 text-base font-medium italic">Part A drafting preserved. Select your specialty for Part B.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {mockData.Part_B.map((item, idx) => (
                        <div 
                            key={idx}
                            onClick={() => handlePartBSelect(idx)}
                            className="group bg-slate-800/50 backdrop-blur-xl border-2 border-slate-700/50 hover:border-rose-500 p-8 rounded-[2.5rem] cursor-pointer transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-rose-500/20"
                        >
                            <span className="inline-block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4 px-3 py-1 bg-slate-700/30 rounded-lg group-hover:bg-rose-500/10 group-hover:text-rose-400 transition-colors">{item.elective}</span>
                            <h3 className="text-lg font-black mb-4 line-clamp-2 group-hover:text-white transition-colors uppercase leading-tight">{item.type} Task</h3>
                            <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed font-medium capitalize opacity-60 group-hover:opacity-100 transition-opacity">{item.question}</p>
                        </div>
                    ))}
                </div>
                
                <div className="flex justify-center">
                    <button 
                        onClick={() => updatePhase('PART_A')}
                        className="flex items-center gap-2 text-slate-500 hover:text-white font-black uppercase tracking-widest text-xs transition-colors"
                    >
                        <ArrowLeft size={14} />
                        Back to Part A
                    </button>
                </div>
            </div>
        </div>
    );

    if (phase === 'PART_A' || phase === 'PART_B') {
        const isPartA = phase === 'PART_A';
        const activePrompt = isPartA ? mockData.Part_A.situation : selectedPartB?.question;
        const activeBlueprint = isPartA ? mockData.Part_A.blueprint : selectedPartB?.blueprint;
        const activeChecklist = isPartA 
            ? (mockData.Part_A.requirements || mockData.Part_A.checklist) 
            : (selectedPartB?.requirements || selectedPartB?.checklist);
        const currentDraft = isPartA ? draftA : draftB;
        const currentTitle = isPartA ? titleA : titleB;
        const currentImages = isPartA ? imagesA : imagesB;
        const wordCount = currentDraft.trim().split(/\s+/).filter(x => x.length > 0).length;

        return (
            <WritingStudioLayout
                isSidebarOpen={isSidebarOpen}
                isLeftSidebarOpen={isLeftSidebarOpen}
                header={
                    <WritingStudioHeader 
                        title={mockData?.meta?.topic}
                        status={isSubmitting ? "Submitting" : "Exam in Progress"}
                        isMock={true}
                        duration={timeLeft}
                        onTimeUp={handleSubmit}
                        isSidebarOpen={isSidebarOpen}
                        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                        isLeftSidebarOpen={isLeftSidebarOpen}
                        onToggleLeftSidebar={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
                        onBack={() => setShowQuitModal(true)}
                        isCheatMode={isCheatEnabled(user, profile)}
                        onCheatInject={handleCheatMode}
                    />
                }
                leftColumn={
                    <WritingStudioBriefing 
                        prompt={activePrompt}
                        blueprint={activeBlueprint}
                        checklist={activeChecklist}
                        completedItems={[]}
                        onToggleChecklist={() => {}}
                        isMock={true}
                        fullMockData={mockData}
                    />
                }
                centerColumn={
                    <div className="flex flex-col h-full gap-6">
                        <div className="flex gap-2">
                            <button 
                                onClick={() => updatePhase('PART_A')}
                                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isPartA ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-400 hover:text-slate-600 border border-slate-200'}`}
                            >
                                Part A: Compulsory
                            </button>
                            <button 
                                onClick={() => selectedPartB ? updatePhase('PART_B') : updatePhase('PART_B_SELECTOR')}
                                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${!isPartA ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-400 hover:text-slate-600 border border-slate-200'}`}
                            >
                                Part B: {selectedPartB ? selectedPartB.elective : 'Select Elective'}
                            </button>
                        </div>

                        <WritingStudioEditor 
                            title={currentTitle}
                            onTitleChange={isPartA ? setTitleA : setTitleB}
                            content={currentDraft}
                            onContentChange={isPartA ? setDraftA : setDraftB}
                            wordCount={wordCount}
                            isMock={true}
                            isSubmitting={isSubmitting}
                            onSubmit={handleSubmit}
                        />
                    </div>
                }
                rightColumn={
                    <WritingStudioControlPanel 
                        isMock={true}
                        uploadedImages={currentImages}
                        onUpload={(file) => handleUpload(file, isPartA ? 'A' : 'B')}
                        onDeleteImage={(idx) => handleDeleteImage(idx, isPartA ? 'A' : 'B')}
                        sparkNotes={sparkNotes}
                        onSparkChange={setSparkNotes}
                    />
                }
            >
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
                                        onClick={() => navigate('/mock-exam-eng', { state: { activeTab: 'writing' } })}
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

                <GradingOverlay
                    isOpen={isInjecting}
                    title="Injecting AI Drafts"
                    status="Synthesizing Level-Specific Content..."
                />
                <UpgradeModal 
                    isOpen={showUpgradeModal} 
                    onClose={() => setShowUpgradeModal(false)}
                    title="Pro / Premium Required"
                    message="Please subscribe to a Pro or Premium plan to submit Mock Exams and receive AI evaluation with grade prediction."
                />
            </WritingStudioLayout>
        );
    }

    if (phase === 'RESULTS' && submissionResults) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] pb-20">
                {/* Results Header */}
                <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-50">
                    <div className="flex items-center gap-6">
                        <button 
                            onClick={() => navigate('/mock-exam-eng')}
                            className="p-3 text-slate-400 hover:text-slate-600 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all"
                        >
                            <ArrowLeft size={18} />
                        </button>
                        <div>
                             <h1 className="text-lg font-black text-slate-800 tracking-tight">{mockData?.meta?.topic}</h1>
                             <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Writing Mock P2</span>
                                <span className="text-slate-300">/</span>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assessment Finalized</span>
                             </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="bg-slate-900 rounded-[1.25rem] px-6 py-3 border border-white/10 shadow-xl flex items-center gap-3">
                            <div className="size-8 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-900/40">
                                <Trophy size={16} />
                            </div>
                            <span className="text-xs font-black text-white uppercase tracking-widest">Grade Finalized</span>
                        </div>
                    </div>
                </header>

                <main className="max-w-7xl mx-auto px-8 pt-12 space-y-12">
                    {/* Top Hero Card */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="lg:col-span-8 bg-slate-900 rounded-[3rem] p-10 relative overflow-hidden text-white shadow-2xl"
                        >
                            <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                                <div className="flex flex-col">
                                    <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1">Estimated DSE Level</p>
                                    <p className="text-8xl font-black text-white tracking-tighter drop-shadow-2xl">
                                        {submissionResults.level}
                                    </p>
                                    {/* XP Display */}
                                    <div className="mt-2 flex items-center gap-2">
                                        <div className="px-3 py-1 bg-[#FF8A00]/20 border border-[#FF8A00]/30 rounded-full flex items-center gap-2">
                                            <Sparkles size={12} className="text-[#FF8A00]" />
                                            <span className="text-[11px] font-black text-[#FF8A00] uppercase tracking-[0.15em]">XP EARNED: +750</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 w-full space-y-6 bg-white/5 p-8 rounded-[2.5rem] border border-white/10 backdrop-blur-sm">
                                    <div className="flex gap-10">
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1">Total Marks</p>
                                            <p className="text-3xl font-black text-white">{submissionResults.totalScore} <span className="text-sm text-indigo-300/50">/ {submissionResults.possibleScore}</span></p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1">Percentage</p>
                                            <p className="text-3xl font-black text-emerald-400">{Math.round(submissionResults.percentage)}%</p>
                                        </div>
                                    </div>
                                    <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden border border-white/5">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${submissionResults.percentage}%` }}
                                            transition={{ delay: 0.5, duration: 1 }}
                                            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 shadow-[0_0_20px_rgba(99,102,241,0.5)]"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Background Elements */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-[120px] rounded-full -mr-32 -mt-32" />
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-500/10 blur-[120px] rounded-full -ml-32 -mb-32" />
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="lg:col-span-4 bg-white rounded-[3rem] p-10 border border-slate-200 shadow-xl space-y-8"
                        >
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Target size={14} className="text-indigo-600" />
                                Mastery Breakdown
                            </h3>
                            <div className="space-y-8">
                                {Object.entries(submissionResults.skillScores).map(([skill, data], idx) => {
                                    const domainKey = skill.toLowerCase();
                                    const scoreA = submissionResults.sectionalScores.A.domains[domainKey]?.score || 0;
                                    const scoreB = submissionResults.sectionalScores.B.domains[domainKey]?.score || 0;
                                    
                                    return (
                                        <div key={idx} className="space-y-3">
                                            <div className="flex justify-between items-end">
                                                <div className="space-y-1">
                                                    <span className="block text-sm font-black text-slate-800 uppercase tracking-tight">{skill}</span>
                                                    <div className="flex gap-3 text-[10px] font-bold text-slate-400">
                                                        <span>PART A: <span className="text-slate-600">{scoreA}/7</span></span>
                                                        <span className="text-slate-200">|</span>
                                                        <span>PART B: <span className="text-slate-600">{scoreB}/7</span></span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-xs font-black text-indigo-600">{data.score} / {data.possible}</span>
                                                </div>
                                            </div>
                                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                                <motion.div 
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${(data.score / data.possible) * 100}%` }}
                                                    transition={{ delay: 0.8 + idx * 0.1 }}
                                                    className={`h-full ${idx === 0 ? 'bg-indigo-500' : idx === 1 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </div>

                    {/* Feedback Sections */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {['A', 'B'].map((part) => {
                            const partData = submissionResults.sectionalScores[part];
                            return (
                                <motion.div 
                                    key={part}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="bg-white rounded-[3rem] border border-slate-200 shadow-xl overflow-hidden flex flex-col"
                                >
                                    <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg ${part === 'A' ? 'bg-slate-900' : 'bg-rose-600'}`}>
                                                <span className="font-black text-sm">{part}</span>
                                            </div>
                                            <div>
                                                <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">{part === 'A' ? 'Compulsory' : 'Elective'}</h4>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Domain Performance</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <button 
                                                onClick={() => {
                                                    setOriginalView({
                                                        title: part === 'A' ? titleA : titleB,
                                                        content: part === 'A' ? draftA : draftB,
                                                        type: part === 'A' ? 'Compulsory' : 'Elective'
                                                    });
                                                }}
                                                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-500 hover:text-slate-900 hover:border-slate-400 transition-all shadow-sm"
                                            >
                                                <Eye size={12} />
                                                View Original
                                            </button>
                                            <div className="text-right">
                                                <p className="text-2xl font-black text-slate-900">{partData.score} <span className="text-xs text-slate-400">/ 21</span></p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-8 flex-1 space-y-6">
                                        {/* Domain Feedback */}
                                        <div className="space-y-4">
                                            {Object.entries(partData.domains).map(([domain, info]) => (
                                                <div key={domain} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-indigo-200 transition-all">
                                                    <div className="flex justify-between items-center mb-3">
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{domain}</span>
                                                        <span className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-black text-indigo-600">{info.score} / 7</span>
                                                    </div>
                                                    <p className="text-base font-bold text-slate-600 leading-relaxed italic">
                                                        "{info.feedback}"
                                                    </p>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Dynamic Tutor Feedback */}
                                        <div className="mt-8 p-6 bg-slate-900 rounded-[2rem] relative overflow-hidden">
                                            <div className="relative z-10 flex gap-4">
                                                <div className="size-12 rounded-full overflow-hidden shrink-0 border-2 border-white shadow-lg">
                                                    <img src={englishTutor?.avatar || "/avatars/Miss_Janie.jpg"} alt={englishTutor?.name || "Janie"} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Examiner's Summary</span>
                                                        <Sparkles size={10} className="text-amber-400" />
                                                    </div>
                                                    <p className="text-base font-bold text-slate-100 leading-relaxed italic">
                                                        {partData.overallFeedback}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Final Action */}
                    <div className="flex justify-center gap-6 pt-12">
                        <button 
                            onClick={() => navigate('/mock-exam-eng')}
                            className="bg-slate-900 text-white px-12 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl hover:scale-105 transition-all"
                        >
                            Return to Exam Hub
                        </button>
                    </div>
                </main>

                {/* Original View Modal */}
                <AnimatePresence>
                    {originalView && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-8">
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setOriginalView(null)}
                                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                            />
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="bg-white w-full max-w-3xl max-h-[80vh] rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col"
                            >
                                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                    <div className="flex items-center gap-4">
                                        <div className={`size-10 rounded-xl flex items-center justify-center text-white font-black ${originalView.type === 'Compulsory' ? 'bg-slate-900' : 'bg-rose-600'}`}>
                                            {originalView.type === 'Compulsory' ? 'A' : 'B'}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-slate-900 tracking-tight">{originalView.type} Response</h3>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Student Original Draft</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setOriginalView(null)}
                                        className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                                    >
                                        <XIcon size={20} className="text-slate-400" />
                                    </button>
                                </div>
                                <div className="p-10 overflow-y-auto flex-1 custom-scrollbar">
                                    <h4 className="text-xl font-black text-slate-900 mb-6 border-l-4 border-indigo-500 pl-4">{originalView.title}</h4>
                                    <div className="prose prose-slate max-w-none">
                                        <p className="text-slate-600 leading-relaxed whitespace-pre-wrap font-medium text-lg">
                                            {originalView.content}
                                        </p>
                                    </div>
                                </div>
                                <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                                    <button 
                                        onClick={() => setOriginalView(null)}
                                        className="px-8 py-3 bg-slate-900 text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-black transition-all shadow-lg"
                                    >
                                        Close Preview
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    return null;
};

export default WritingMockStudio;
