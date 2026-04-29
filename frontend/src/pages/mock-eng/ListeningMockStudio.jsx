import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { 
    ChevronRight,
    Headphones,
    Clock,
    Trophy, 
    Star, 
    BarChart3, 
    BookOpen, 
    Sparkles, 
    Target, 
    Info, 
    ClipboardList, 
    PenTool, 
    Layout,
    ShieldCheck, 
    ArrowLeft,
    CheckCircle2,
    FileText,
    Mail,
    Globe,
    MessageSquare,
    Play,
    Pause,
    BarChart,
    AlertTriangle,
    Edit3,
    ArrowRight,
    Zap,
    ChevronDown,
    FastForward,
    AlertCircle,
    X,
    Layers,
    GraduationCap
} from 'lucide-react';
import { LoadingPage, GradingOverlay } from '../../components/shared';
import { useAuth } from '../../context/AuthContext';
import UpgradeModal from '../../components/common/UpgradeModal';
import { useAvatar } from '../../context/AvatarContext';
import { motion, AnimatePresence } from 'framer-motion';
import MockCountdownTimer from '../../components/utils/MockCountdownTimer';
import DataFileViewer from '../../components/listening/DataFileViewer';
import Paper3AudioEngine from '../../components/listening/Paper3AudioEngine';

const SMART_CITY_GOLDEN_ANSWERS = {
    Task_5: `Subject: Response to Your Concerns Regarding Smart Lampposts in Kowloon East\n\nDear Mr. Wong,\n\nThank you for contacting the IT Bureau. We value your feedback regarding the smart lampposts in your neighborhood.\n\nI would like to reassure you that your privacy is our top priority. All data collected by the 5G Sensor Array is fully anonymized and, as mandated by our strict policy, is never sold to third parties or advertisers. To further ensure your digital safety, we have partnered with CyberGuard HK to provide free antivirus and anti-phishing software to all participating households.\n\nThe Smart Mobility initiative aims to reduce urban stress for all residents. Our data shows that this system has already saved commuters in Kowloon East approximately 20 minutes per day by optimizing traffic flow.\n\nWe hope this clarifies our position. Please feel free to reach out if you have further questions.\n\nYours sincerely,\n\nProject Assistant, IT Bureau`,
    Task_6: `[NOTICE] New AI Field Trainers Program\n\nBridging the digital divide is a core mission of the Smart City 2026 initiative. We are excited to announce the launch of our 'AI Field Trainers' program, creating 200 new roles dedicated to supporting our senior community.\n\nThese trainers will be deployed directly to elderly centers across the district. Their primary goal is to provide hands-on digital literacy training, helping you navigate new technologies with confidence. We encourage all seniors to participate and enjoy the benefits of a connected city.\n\nDon't let the technology gap hold you back—join us in building a smarter, more inclusive Hong Kong.`,
    Task_7: `Smart City 2026: Budget and Rollout Update\n\nThe Government has allocated a total investment of $2.5 Billion HKD to transform Hong Kong into a world-class smart city. As we move towards our target rollout in Q4 2026, we are closely monitoring our progress.\n\nRecent audits show that while our hardware and staffing goals are on track, there is currently a 'Critical Gap' in our publicity spending. We recognize that this has led to some public skepticism, and we are committed to increasing our transparency and outreach efforts in the coming months. \n\nOur goal remains 'Innovation for All,' ensuring that our smart infrastructure benefits every citizen through improved mobility and efficiency.`,
    Task_8: `Dear Union Leader,\n\nI am writing to you regarding the 'HK Workers Union' concerns about our upcoming AI Policy. At the IT Bureau, we firmly believe in 'Innovation for All,' and we want to reassure you that our goal is not to replace workers, but to empower them.\n\nWe understand the fear of job displacement. However, our strategy focuses on job creation. We are currently recruiting 200 'AI Field Trainers' to support our digital inclusion efforts. Furthermore, our recruitment policy specifically emphasizes hiring individuals with strong 'soft skills' and 'community empathy'—human qualities that AI cannot replicate. These roles will be critical in bridging the gap between technology and the public.\n\nTo ensure ethical implementation, the AI Ethics Committee will provide rigorous oversight of all rollouts. We are committed to a future where technology enhances efficiency without compromising worker security.\n\nYours sincerely,\n\nProject Manager, IT Bureau`,
    Task_9: `Internal Memo: Budget Status and Publicity Strategy\n\nTo: All IT Bureau Staff\nSubject: Q1 Budget Update and 'Social Media Week' Proposal\n\nA recent review of our Q1 2026 spending shows that while our hardware initiatives are slightly over-budget ($550M vs $500M), there is a 'Critical Gap' in our publicity allocation, with only $40M of the $100M budget spent. This lack of communication has contributed to recent public skepticism.\n\nTo address this, we will launch a 'Social Media Week' in July. This initiative will involve local influencers to build trust and explain our 'Human-First AI' vision. It is vital that we communicate that all data is anonymized and never sold.\n\nWe must act with urgency to bridge this publicity gap before the Q4 rollout.`,
    Task_10: `🚀 Hong Kong is moving faster with #SmartMobility! \n\nDid you know our smart lampposts are already saving commuters in Kowloon East 20 minutes a day? 🕒\n\nWe hear your privacy concerns. That’s why we use **Military Grade** anonymization to keep your data safe, and all info stays right here in HK! 🛡️ Plus, we’ve teamed up with CyberGuard HK to give you FREE security software!\n\nJoin our **Human-First AI** revolution. Because technology should work for you, not the other way around. 🇭🇰💡\n\n#InnovationForAll #SmartCityHK #HumanFirstAI`
};

const ListeningMockStudio = () => {
    const { user, profile } = useAuth();
    const { paperId } = useParams();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const tier = profile?.subscription_tier || 'free';

    // EXAM PHASES: LOADING, BRIEFING, PREPARATION, PART_A, TRANSITION, PART_B_AUDIO, B1B2_GATE, INDEPENDENT, RESULTS
    const [phase, setPhase] = useState(searchParams.get('phase') || 'LOADING');
    const [mockData, setMockData] = useState(null);
    const [selectedSection, setSelectedSection] = useState(null); // 'B1' or 'B2'
    const [userAnswers, setUserAnswers] = useState({});
    const [drafts, setDrafts] = useState({}); // taskId -> string
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionResults, setSubmissionResults] = useState(null);
    const [xpAwarded, setXpAwarded] = useState(0);
    const [activeResultPart, setActiveResultPart] = useState('A'); 
    const [localDocs, setLocalDocs] = useState({}); // i -> html string
    
    const { getAgentIdentity } = useAvatar();
    const englishTutor = getAgentIdentity('english');
    
    // Engine State
    const [activeTaskNumber, setActiveTaskNumber] = useState(1);
    const [isTidying, setIsTidying] = useState(false);
    const [tidyingTime, setTidyingTime] = useState(0);
    const [tidyingTask, setTidyingTask] = useState(1);
    const [currentSection, setCurrentSection] = useState('A'); // 'A' or 'B'
    const [broadcastTimer, setBroadcastTimer] = useState(null);
    const [broadcastStatus, setBroadcastStatus] = useState({ isPlaying: false, isEngineBuffering: false, pauseCountdown: null });
    const [audioIndex, setAudioIndex] = useState(0);
    const [showQuitModal, setShowQuitModal] = useState(false);
    const [isBroadcastComplete, setIsBroadcastComplete] = useState(false);
    const [independentTimeLeft, setIndependentTimeLeft] = useState(75 * 60);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [showSwitchModal, setShowSwitchModal] = useState(false);
    const [pendingSection, setPendingSection] = useState(null);
    
    const rightPanelRef = useRef(null);
    const audioEngineRef = useRef(null);

    const isPartA = phase === 'PART_A' || phase === 'PREPARATION';
    const isIndependent = phase === 'INDEPENDENT';

    // SESSION HYDRATION (Session Shield)
    useEffect(() => {
        if (!paperId) return;
        const saved = localStorage.getItem(`ace-it-listening-${paperId}`);
        if (saved) {
            try {
                const data = JSON.parse(saved);
                if (!data) return;
                setUserAnswers(data.userAnswers || {});
                setDrafts(data.drafts || {});
                setLocalDocs(data.localDocs || {});
                if (data.phase) {
                    setPhase(data.phase);
                    setSearchParams({ phase: data.phase });
                }
                setSelectedSection(data.selectedSection);
                setAudioIndex(data.audioIndex || 0);
                setBroadcastTimer(data.broadcastTimer);
                setIsBroadcastComplete(data.isBroadcastComplete || false);
                if (data.independentTimeLeft) setIndependentTimeLeft(data.independentTimeLeft);
            } catch (e) { console.error("Session recovery failed", e); }
        }
    }, [paperId]);

    // SESSION PERSISTENCE
    useEffect(() => {
        if (paperId && mockData && phase !== 'RESULTS') {
            const state = {
                userAnswers,
                drafts,
                localDocs,
                phase,
                selectedSection,
                audioIndex,
                broadcastTimer,
                isBroadcastComplete,
                independentTimeLeft
            };
            localStorage.setItem(`ace-it-listening-${paperId}`, JSON.stringify(state));
            
            // GLOBAL HUB FLAG (For MockLibraryEngPage)
            localStorage.setItem(`last_mock_inprogress_listening`, JSON.stringify({
                paperId,
                type: 'listening',
                topic: mockData.meta?.title || 'Listening Mock',
                timestamp: Date.now()
            }));
        }
    }, [paperId, mockData, userAnswers, drafts, localDocs, phase, selectedSection, audioIndex, broadcastTimer, independentTimeLeft]);

    // Sync phase with URL (Source of Truth)
    useEffect(() => {
        const urlPhase = searchParams.get('phase');
        if (urlPhase && urlPhase !== phase) {
            console.log(`[ListeningMock] Syncing phase from URL: ${urlPhase}`);
            setPhase(urlPhase);
        }
    }, [searchParams]); // Only depend on searchParams to avoid revert-loop with local state updates

    useEffect(() => {
        let timer;
        if (phase === 'INDEPENDENT' && isBroadcastComplete && independentTimeLeft > 0) {
            timer = setInterval(() => {
                setIndependentTimeLeft(prev => {
                    const next = prev - 1;
                    if (next <= 0) handleSubmit();
                    return next;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [phase, isBroadcastComplete, independentTimeLeft]);

    const updatePhase = (newPhase) => {
        console.log(`[ListeningMock] Phase Transition: ${phase} -> ${newPhase}`);
        setPhase(newPhase);
        setSearchParams(params => {
            params.set('phase', newPhase);
            return params;
        }, { replace: true });
        
        // Enforce section visibility based on phase
        if (newPhase === 'PART_A') setCurrentSection('A');
        if (newPhase === 'PART_B_AUDIO' || newPhase === 'INDEPENDENT') setCurrentSection('B');
    };

    const handleAudioComplete = () => {
        if (phase === 'PART_A') {
            // Part A finished, automatically transition to Part B audio briefing
            updatePhase('PART_B_AUDIO');
        } else if (phase === 'PART_B_AUDIO') {
            // Part B audio finished, enter the 75-minute independent writing phase
            updatePhase('B1B2_GATE');
        } else if (phase === 'INDEPENDENT') {
            // Broadcast completely finished after the briefing
            console.log("[ListeningMock] Broadcast Complete. Starting Independent Timer.");
            setIsBroadcastComplete(true);
        }
    };

    // Load Mock Data
    useEffect(() => {
        const fetchMock = async () => {
            // Fetch Lock: Prevent double-fetches from StrictMode
            if (window._isFetchingMockListening === paperId) return;
            window._isFetchingMockListening = paperId;

            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                const res = await fetch(`${API_URL}/api/english/mock/${paperId}`);
                if (res.ok) {
                    const data = await res.json();
                    
                    // Normalize Data
                    if (data.Part_A && !data.Part_A.tasks) {
                        if (data.Part_A.audio_script) {
                                data.Part_A.tasks = Object.entries(data.Part_A.audio_script).map(([key, val]) => ({
                                    id: key,
                                    ...val,
                                    questions: (val.questions || []).map((q, idx) => ({
                                        ...q,
                                        id: q.id || `${key}_q${idx + 1}`
                                    }))
                                }));
                        } else if (data.Part_A.Task_1) {
                            data.Part_A.tasks = Object.keys(data.Part_A)
                                .filter(key => key.startsWith('Task_'))
                                .map(key => ({ id: key, ...data.Part_A[key] }));
                        }
                    }

                    setMockData(data);
                    
                    const urlPhase = searchParams.get('phase');
                    if (urlPhase === 'RESULTS') {
                        const savedResults = localStorage.getItem(`mock_results_listening_${paperId}`);
                        if (savedResults) {
                            try {
                                const parsedResults = JSON.parse(savedResults);
                                setSubmissionResults(parsedResults);
                                setXpAwarded(parsedResults.xpAwarded || 750);
                                setPhase('RESULTS');
                            } catch (e) {
                                console.error("Failed to load saved results:", e);
                                updatePhase('BRIEFING');
                            }
                        } else {
                            updatePhase('BRIEFING');
                        }
                    } else {
                        // Initialize phase only if not already set by hydration
                        setPhase(prev => {
                            if (prev === 'LOADING') return 'BRIEFING';
                            return prev;
                        });
                    }

                } else { navigate('/mock-exam-eng'); }
            } catch (err) {
                console.error("Error fetching mock:", err);
                navigate('/mock-exam-eng');
            } finally {
                // Keep the lock for 2 seconds to bridge the StrictMode gap
                setTimeout(() => { window._isFetchingMockListening = null; }, 2000);
            }
        };
        if (paperId) fetchMock();
    }, [paperId, navigate]);

    // Handle B1/B2 Switching with Warning
    const handleSwitchSection = (newSection) => {
        console.log(`[ListeningMock] Section Selection: ${newSection}`);
        if (phase === 'INDEPENDENT' && selectedSection && selectedSection !== newSection) {
            setPendingSection(newSection);
            setShowSwitchModal(true);
        } else {
            setSelectedSection(newSection);
            if (phase === 'B1B2_GATE') {
                setCurrentSection('B'); // Force redirect to Part B tasks
                updatePhase('INDEPENDENT');
                
                // Use a slight delay to ensure state has propagated before resuming audio
                setTimeout(() => {
                    audioEngineRef.current?.resumeAfterSelection();
                }, 100);
            }
        }
    };

    const executeSwitch = () => {
        if (!pendingSection) return;
        const newSection = pendingSection;
        setSelectedSection(newSection);
        // Clear irrelevant drafts
        const updatedDrafts = { ...drafts };
        const tasksToClear = selectedSection === 'B1' ? ['Task_5', 'Task_6', 'Task_7'] : ['Task_8', 'Task_9', 'Task_10'];
        tasksToClear.forEach(t => delete updatedDrafts[t]);
        setDrafts(updatedDrafts);
        setShowSwitchModal(false);
        setPendingSection(null);
    };

    // Auto-scroll management
    useEffect(() => {
        if (currentSection === 'B') {
            // Force scroll to top when entering Part B to ensure headers are visible
            rightPanelRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (activeTaskNumber && !isIndependent && currentSection === 'A') {
            const el = document.getElementById(`task-section-${activeTaskNumber}`);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [activeTaskNumber, isIndependent, phase, currentSection, isTidying, !!broadcastStatus.pauseCountdown]);

    const handleSaveAndQuit = () => {
        try {
            audioEngineRef.current?.stop();
            window.speechSynthesis.cancel();
            // Double-tap cancel for stubborn browser TTS implementations
            setTimeout(() => window.speechSynthesis.cancel(), 50);
        } catch (err) {}

        try {
            if (paperId && mockData) {
                const state = {
                    userAnswers,
                    drafts,
                    phase,
                    selectedSection,
                    audioIndex,
                    broadcastTimer,
                    independentTimeLeft
                };
                localStorage.setItem(`ace-it-listening-${paperId}`, JSON.stringify(state));
            }
        } catch (err) {
            console.warn("Save state failed:", err);
        }
        
        // Use direct location change for maximum reliability on exit
        window.location.href = '/mock-exam-eng';
    };

    const handleSubmit = async (isAutoSubmit = false) => {
        // Handle case where it's called as an event handler (e.g. onClick)
        const autoMode = isAutoSubmit === true;

        if (tier === 'free') {
            setShowUpgradeModal(true);
            return;
        }

        if (!autoMode && !showSubmitModal) {
            setShowSubmitModal(true);
            return;
        }
        
        setShowSubmitModal(false);
        setIsSubmitting(true);
        let submissionSuccessful = false;
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            
            // Format submission for MockAssessmentService.evaluateListeningPaper
            const payload = {
                paperId,
                userAnswers: {
                    ...userAnswers,
                    drafts: drafts // Part B drafts
                },
                analytics: {
                    selectedSection,
                    startTime: new Date().toISOString(),
                    paperType: 'LISTENING'
                }
            };

            const res = await fetch(`${API_URL}/api/english/mock/submit-listening`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const assessment = await res.json();
                localStorage.removeItem(`ace-it-listening-${paperId}`); 
                localStorage.removeItem('last_mock_inprogress_listening'); 
                
                // Save results for page refresh (following Writing Mock flow)
                localStorage.setItem(`mock_results_listening_${paperId}`, JSON.stringify(assessment));
                
                setSubmissionResults(assessment);
                setXpAwarded(assessment.xpAwarded || 750);
                
                // CRITICAL: use updatePhase to sync URL, preventing revert on refresh
                updatePhase('RESULTS');
                
                window.scrollTo({ top: 0, behavior: 'smooth' });
                submissionSuccessful = true;
            } else {
                const errorData = await res.json().catch(() => ({}));
                console.error("Submission failed with status:", res.status, errorData);
                alert(`Submission failed (${res.status}). Please check your connection.`);
            }
        } catch (err) {
            console.error("Submission Error:", err);
            alert("Submission failed. Please check your connection and try again.");
        } finally {
            // Always hide overlay after a short delay to ensure UI transition
            setTimeout(() => {
                setIsSubmitting(false);
            }, 1000);
        }
    };

    if (phase === 'LOADING' || (!mockData && phase !== 'RESULTS')) return (
        <LoadingPage 
            title="Calibrating Listening Arena..." 
            subtext="Setting up HKDSE Paper 3 environment and synchronizing broadcast streams."
        />
    );

    // --- PHASE: BRIEFING ---
    if (phase === 'BRIEFING') return (
        <div className="h-screen bg-white flex items-center justify-center p-8 selection:bg-indigo-100">
            <div className="max-w-3xl w-full">
                <div className="flex items-center gap-6 mb-12">
                    <div className="p-5 bg-indigo-50 rounded-3xl text-indigo-600 shadow-lg shadow-indigo-900/5">
                        <ShieldCheck size={32} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 leading-tight">Paper 3: Listening & Integrated Skills</h1>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.3em] mt-2">Official HKEAA Simulation Hub</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    <div className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Exam Structure</h3>
                        <ul className="space-y-4 text-sm font-bold text-slate-600">
                            <li className="flex items-start gap-3">
                                <div className="mt-1.5 w-1.5 h-1.5 bg-indigo-500 rounded-full shrink-0" />
                                <span>Part A: Tasks 1-4 (Compulsory)</span>
                            </li>
                            <li className="flex items-start gap-3 text-indigo-600">
                                <div className="mt-1.5 w-1.5 h-1.5 bg-indigo-500 rounded-full shrink-0" />
                                <span>Part B: Choice of B1 or B2</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="mt-1.5 w-1.5 h-1.5 bg-indigo-500 rounded-full shrink-0" />
                                <span>Total Broadcast: ~60 Minutes</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="mt-1.5 w-1.5 h-1.5 bg-indigo-500 rounded-full shrink-0" />
                                <span>Independent Writing: 75 Minutes</span>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-amber-50/50 p-10 rounded-[2.5rem] border border-amber-100">
                        <h3 className="text-xs font-black text-amber-600 uppercase tracking-widest mb-6">Integrity Protocol</h3>
                        <div className="space-y-4 text-xs font-bold text-amber-800/70 leading-relaxed">
                            <p>• Audio tracks play <strong>once only</strong>. No pausing or rewinding allowed during broadcast.</p>
                            <p>• <strong>Copy-Paste is disabled</strong> in the Data File viewer. All evidence must be re-typed by the candidate.</p>
                            <p>• B2 is required for Level 5** eligibility. B1 is capped at Level 4.</p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4">
                    <button 
                        onClick={() => navigate('/mock-exam-eng', { state: { activeTab: 'listening' } })}
                        className="flex-1 py-6 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-3xl font-black uppercase tracking-[0.2em] transition-all text-xs"
                    >
                        Go Back
                    </button>
                    <button 
                        onClick={() => updatePhase('PREPARATION')}
                        className="flex-[2] py-6 bg-slate-900 hover:bg-black text-white rounded-3xl font-black uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-4 text-xs"
                    >
                        Initialize Simulation <ArrowRight size={20} />
                    </button>
                </div>
            </div>
        </div>
    );


    // --- MAIN EXAM LAYOUT (PART A / PART B / INDEPENDENT / TIER SELECTION) ---
    if (['PREPARATION', 'PART_A', 'TRANSITION', 'PART_B_AUDIO', 'INDEPENDENT', 'B1B2_GATE'].includes(phase)) {
        const currentScript = (mockData?.Part_B?.script && mockData.Part_B.script.length > 0 && !['PREPARATION', 'PART_A', 'TRANSITION'].includes(phase))
            ? mockData.Part_B.script 
            : (mockData?.Part_A?.script && mockData.Part_A.script.length > 0) ? mockData.Part_A.script : [];
        
        const activeTasks = currentSection === 'B'
            ? (selectedSection === 'B1' ? mockData?.Part_B?.Part_B1?.tasks : mockData?.Part_B?.Part_B2?.tasks) || mockData?.Part_B?.tasks || []
            : mockData?.Part_A?.tasks || [];

        return (
            <div className="h-screen bg-slate-50 flex flex-col font-sans selection:bg-indigo-100 italic-none overflow-hidden">
                {/* Exam Header */}
                <header className="bg-white border-b border-slate-200 px-10 py-5 flex items-center justify-between z-50 shadow-sm">
                    <div className="flex items-center gap-6">
                        <button 
                            onClick={() => setShowQuitModal(true)}
                            className="p-3 hover:bg-slate-100 text-slate-400 hover:text-slate-900 rounded-2xl transition-all"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div className="flex flex-col">

                             <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-xl font-black text-slate-900 tracking-tight">{mockData?.meta?.title || 'Listening Mock'}</h1>
                                <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${isIndependent ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-white'}`}>
                                    {String(phase || 'LOADING').replace('_', ' ')}
                                </span>
                             </div>
                             <div className="flex items-center gap-3">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">HKDSE English Paper 3</span>
                                {selectedSection && (
                                    <>
                                        <div className="w-1 h-1 bg-slate-300 rounded-full" />
                                        <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${selectedSection === 'B2' ? 'text-rose-500' : 'text-indigo-500'}`}>Section {selectedSection}</span>
                                    </>
                                )}
                             </div>
                        </div>
                    </div>


                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-4">
                            {/* Admin Skip Button */}
                            {user?.email === 'fungtam@gmail.com' && (
                                <button 
                                    onClick={() => audioEngineRef.current?.fastForwardToPartAEnd()}
                                    className="w-10 h-10 flex items-center justify-center bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl border border-indigo-200 transition-all animate-pulse shadow-sm"
                                    title="Fast Forward to End of Part A (Dev Only)"
                                >
                                    <FastForward size={16} fill="currentColor" />
                                </button>
                            )}

                            {/* Cheat Menu */}
                            {user?.email === 'fungtam@gmail.com' && (
                                <div className="relative group">
                                    <button className="w-10 h-10 flex items-center justify-center bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-xl border border-amber-200 transition-all shadow-sm">
                                        <Zap size={16} fill="currentColor" />
                                    </button>
                                    <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[60]">
                                        <div className="px-3 py-2 border-b border-slate-50 mb-1">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cheat Console</p>
                                        </div>
                                        
                                        {/* Option A + B1 */}
                                        <button 
                                            onClick={() => {
                                                const answers = {};
                                                mockData?.Part_A?.tasks.forEach(t => t.questions.forEach(q => answers[q.id] = q.answer));
                                                setUserAnswers(answers);
                                                
                                                const bDrafts = {};
                                                if (mockData?.Part_B) {
                                                    const b1Tasks = ['Task_5', 'Task_6', 'Task_7'];
                                                    b1Tasks.forEach(tid => {
                                                        bDrafts[tid] = SMART_CITY_GOLDEN_ANSWERS[tid] || "Level 5** Perfect response using all Data File points...";
                                                    });
                                                    setSelectedSection('B1');
                                                }
                                                setDrafts(bDrafts);
                                            }}
                                            className="w-full text-left p-3 hover:bg-indigo-50 rounded-xl flex items-center gap-3 group transition-all"
                                        >
                                            <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center font-black text-xs">B1</div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-900">Fill A + B1 (5**)</p>
                                                <p className="text-[8px] text-slate-400">Tasks 1-7 complete</p>
                                            </div>
                                        </button>

                                        {/* Option A + B2 */}
                                        <button 
                                            onClick={() => {
                                                const answers = {};
                                                mockData?.Part_A?.tasks.forEach(t => t.questions.forEach(q => answers[q.id] = q.answer));
                                                setUserAnswers(answers);
                                                
                                                const bDrafts = {};
                                                if (mockData?.Part_B) {
                                                    const b2Tasks = ['Task_8', 'Task_9', 'Task_10'];
                                                    b2Tasks.forEach(tid => {
                                                        bDrafts[tid] = SMART_CITY_GOLDEN_ANSWERS[tid] || "Level 5** Perfect response using all Data File points...";
                                                    });
                                                    setSelectedSection('B2');
                                                }
                                                setDrafts(bDrafts);
                                            }}
                                            className="w-full text-left p-3 hover:bg-rose-50 rounded-xl flex items-center gap-3 group transition-all"
                                        >
                                            <div className="w-8 h-8 bg-rose-100 text-rose-600 rounded-lg flex items-center justify-center font-black text-xs">B2</div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-900">Fill A + B2 (5**)</p>
                                                <p className="text-[8px] text-slate-400">Tasks 1-4 & 8-10 complete</p>
                                            </div>
                                        </button>

                                        <div className="h-[1px] bg-slate-50 my-1" />

                                        <button 
                                            onClick={() => {
                                                const answers = {};
                                                mockData?.Part_A?.tasks.forEach(t => t.questions.forEach((q, idx) => answers[q.id] = idx % 2 === 0 ? q.answer : 'Wrong answer'));
                                                setUserAnswers(answers);
                                            }}
                                            className="w-full text-left p-3 hover:bg-slate-50 rounded-xl flex items-center gap-3 group transition-all opacity-50"
                                        >
                                            <div className="w-8 h-8 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center font-black">L2</div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-900">Level 2 (Part A Only)</p>
                                                <p className="text-[8px] text-slate-400">50% error rate</p>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="flex bg-slate-900/5 p-1 rounded-xl border border-slate-200">
                                <button 
                                    onClick={() => setCurrentSection('A')}
                                    className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${currentSection === 'A' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    Part A
                                </button>
                                <button 
                                    onClick={() => setCurrentSection('B')}
                                    className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${currentSection === 'B' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    Part B
                                </button>
                            </div>
                        </div>

                        <button 
                            onClick={() => handleSubmit(false)} 
                            disabled={isSubmitting || !selectedSection}
                            className={`px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all
                                ${selectedSection 
                                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20 active:scale-95' 
                                    : 'bg-slate-100 text-slate-300 cursor-not-allowed'}
                            `}
                        >
                            {isSubmitting ? 'Transmitting...' : 'Submit Paper'}
                        </button>
                    </div>
                </header>

                <main className="flex-1 flex overflow-hidden">
                    {/* Left Panel: Broadcast / Data File */}
                    <div className="flex-1 bg-white border-r border-slate-200 flex flex-col overflow-hidden relative">
                        {/* Paper3AudioEngine must stay mounted to prevent timer/audio reset during toggles */}
                        <div className={`p-16 flex-col items-center justify-center h-full max-w-2xl mx-auto text-center ${currentSection === 'B' ? 'hidden' : 'flex'}`}>
                            <Paper3AudioEngine 
                                ref={audioEngineRef}
                                script={currentScript || []} 
                                phase={phase}
                                initialIndex={audioIndex}
                                initialPause={broadcastTimer}
                                onTaskChange={setActiveTaskNumber}
                                onIndexChange={setAudioIndex}
                                onSectionChange={setCurrentSection}
                                onTidyingStart={(secs, taskNum) => { 
                                    setIsTidying(true); 
                                    setTidyingTime(secs); 
                                    if (taskNum) {
                                        setTidyingTask(taskNum);
                                        setActiveTaskNumber(taskNum);
                                    }
                                }}
                                onTidyingEnd={() => setIsTidying(false)}
                                onStudyStart={(secs, taskNum) => {
                                    if (taskNum) setActiveTaskNumber(taskNum);
                                }}
                                onPhaseChange={updatePhase}
                                onRequireSelection={() => updatePhase('B1B2_GATE')}
                                onCountdownTick={setBroadcastTimer}
                                onStatusChange={(status) => setBroadcastStatus(prev => ({ ...prev, ...status }))}
                                onComplete={handleAudioComplete}
                            />
                            
                            <div className="mt-12 space-y-6">
                                <h3 className="text-2xl font-black text-slate-900">Broadcast Phase</h3>
                                <p className="text-slate-500 font-medium leading-relaxed">
                                    All questions should be answered in the Question-Answer Book on the right. 
                                    The broadcast includes all necessary reading and tidying pauses.
                                </p>
                            </div>
                        </div>

                        {currentSection === 'B' && (
                            <div className="absolute inset-0 z-10 flex flex-col bg-white">
                                <DataFileViewer 
                                    key={paperId} 
                                    dataFiles={mockData?.Part_B?.data_file || []} 
                                    localDocs={localDocs}
                                    setLocalDocs={setLocalDocs}
                                />
                            </div>
                        )}
                    </div>

                    {/* Right Panel: Answer Book */}
                    <div ref={rightPanelRef} className="flex-1 overflow-y-auto bg-slate-50/50 p-0 custom-scrollbar relative">
                        {/* SLIM BROADCAST BAR (Part B Only) */}
                        {currentSection === 'B' && (
                            <div className="sticky top-0 z-[80] bg-slate-950 text-white px-8 py-3 flex items-center justify-between border-b border-white/10 shadow-2xl">
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${broadcastStatus.isPlaying ? (broadcastStatus.pauseCountdown ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse') : 'bg-slate-700'}`} />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                            {broadcastStatus.isEngineBuffering ? 'Buffering...' : (broadcastStatus.pauseCountdown ? 'Station Silence' : 'On Air')}
                                        </span>
                                    </div>
                                    <div className="h-4 w-[1px] bg-white/10" />
                                    <div className="flex items-center gap-3">
                                        <Clock size={14} className="text-indigo-400" />
                                        <span className="text-[11px] font-black tabular-nums tracking-wider text-indigo-100">
                                            {isBroadcastComplete && phase === 'INDEPENDENT' 
                                                ? `${Math.floor(independentTimeLeft / 60)}:${(independentTimeLeft % 60).toString().padStart(2, '0')}`
                                                : (broadcastTimer !== null ? `${Math.floor(broadcastTimer / 60)}:${(broadcastTimer % 60).toString().padStart(2, '0')}` : '--:--')}
                                        </span>
                                        {isBroadcastComplete && phase === 'INDEPENDENT' && <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2">Session Remaining</span>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">HKEAA Live Monitoring System</span>
                                    <div className="flex gap-0.5">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className={`w-1 h-3 rounded-full ${broadcastStatus.isPlaying && !broadcastStatus.pauseCountdown ? 'bg-emerald-500/40 animate-bounce' : 'bg-slate-800'}`} style={{ animationDelay: `${i * 0.15}s` }} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="max-w-3xl mx-auto p-12">
                            {currentSection === 'A' ? (
                                <div className="space-y-8 pb-32">


                                        <div className="flex items-center justify-between border-b-4 border-slate-900 pb-6 mb-8">
                                            <div>
                                                <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Part A</h2>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Question-Answer Book</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Task</span>
                                                <p className="text-2xl font-black text-indigo-600">{activeTaskNumber}</p>
                                            </div>
                                        </div>

                                         {(mockData?.Part_A?.tasks || []).map((task, tIdx) => (
                                            <div 
                                                key={task.id} 
                                                className="transition-all duration-500 rounded-[2rem] overflow-visible relative bg-white border border-slate-200 shadow-xl shadow-slate-200/40"
                                                id={`task-section-${tIdx + 1}`}
                                            >
                                                {/* Anchored Tidying Tip */}
                                                <AnimatePresence>
                                                    {isTidying && tidyingTask === (tIdx + 1) && (
                                                        <motion.div 
                                                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                                            className="absolute -top-12 left-0 right-0 z-[60] bg-indigo-600 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-indigo-400"
                                                        >
                                                            <Edit3 size={18} />
                                                            <div className="flex-1">
                                                                <p className="text-[8px] font-black uppercase tracking-widest opacity-80">Tidying Mode Activated</p>
                                                                <p className="text-[11px] font-bold">You have <span className="text-amber-300 font-black">{broadcastTimer || tidyingTime}s</span> to check your answers for <span className="underline decoration-2">Task {tidyingTask}</span></p>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                                <div className="bg-slate-900 px-8 py-4 flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <span className="w-8 h-8 bg-indigo-500 text-white rounded-lg flex items-center justify-center font-black text-sm">{tIdx + 1}</span>
                                                        <h4 className="text-sm font-black text-white uppercase tracking-widest">{task.id}</h4>
                                                    </div>
                                                    <p className="text-[9px] font-bold text-slate-400 italic max-w-md truncate">{task.instructions}</p>
                                                </div>

                                                <div className="bg-white p-8 border-x border-b border-slate-200 shadow-xl shadow-slate-200/40">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                                                        {(task.questions || []).map((q, qIdx) => (
                                                            <div key={q.id} className="flex flex-col gap-2 group">
                                                                <div className="flex items-baseline gap-2">
                                                                    <span className="text-[10px] font-black text-slate-300 group-focus-within:text-indigo-400">{qIdx + 1}.</span>
                                                                    <label className="text-[11px] font-bold text-slate-600 leading-tight">
                                                                        {q.label || q.question || q.text}
                                                                    </label>
                                                                </div>
                                                                
                                                                {q.options ? (
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {q.options.map(opt => (
                                                                            <button 
                                                                                key={opt}
                                                                                onClick={() => setUserAnswers(prev => ({...prev, [q.id]: opt}))}
                                                                                className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold transition-all ${userAnswers[q.id] === opt ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-indigo-300'}`}
                                                                            >
                                                                                {opt}
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                ) : (
                                                                    <input 
                                                                        type="text"
                                                                        className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-400 rounded-lg px-4 py-2.5 text-xs font-bold text-slate-900 transition-all outline-none"
                                                                        placeholder=".................................................................."
                                                                        value={userAnswers[q.id] || ''}
                                                                        onChange={(e) => setUserAnswers(prev => ({...prev, [q.id]: e.target.value}))}
                                                                    />
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    {/* Bridge to Part B (Appears at end of Part A script) */}
                                    {activeTaskNumber === 4 && (
                                         <div className="pt-20 text-center">
                                            <button 
                                                onClick={() => updatePhase('B1B2_GATE')}
                                                className="px-12 py-6 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-105 transition-all"
                                            >
                                                Proceed to Integrated Skills
                                            </button>
                                         </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-16 pb-40">
                                    <div className="flex items-center justify-between border-b-4 border-slate-900 pb-8">
                                        <div>
                                            <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Integrated Tasks</h2>
                                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-2">Part {selectedSection} Response Book</p>
                                        </div>
                                        <button 
                                            onClick={() => handleSwitchSection(selectedSection === 'B1' ? 'B2' : 'B1')}
                                            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-900/20 active:scale-95"
                                        >
                                            Switch to {selectedSection === 'B1' ? 'B2' : 'B1'}
                                        </button>
                                    </div>

                                    {activeTasks.map((task, idx) => {
                                        const taskNumber = selectedSection === 'B2' ? (idx + 8) : (idx + 5);
                                        return (
                                            <div key={task.id} className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-5">
                                                        <span className={`w-14 h-14 text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-xl ${selectedSection === 'B2' ? 'bg-rose-600 shadow-rose-900/20' : 'bg-indigo-600 shadow-indigo-900/20'}`}>
                                                            {taskNumber}
                                                        </span>
                                                        <div>
                                                            <h4 className="text-2xl font-black text-slate-900 tracking-tight">Task {taskNumber}: {task.type}</h4>
                                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Evaluation Target: {task.tone} Register</p>
                                                        </div>
                                                    </div>
                                                </div>

                                            <div className="bg-amber-50/50 border border-amber-100/50 rounded-[2.5rem] p-10 space-y-6">
                                                <div className="flex items-center gap-2 text-amber-600">
                                                    <MessageSquare size={16} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Client Instructions</span>
                                                </div>
                                                <p className="text-sm font-bold text-amber-900/80 leading-relaxed italic">
                                                    "{task.instructions}"
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {task.requirements?.map((req, rIdx) => (
                                                        <span key={rIdx} className="px-3 py-1 bg-white border border-amber-200 text-[9px] font-black text-amber-600 uppercase tracking-widest rounded-lg">
                                                            Req: {req}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            
                                            <div className="relative group">
                                                 <textarea 
                                                    className="w-full h-[600px] bg-white border-2 border-slate-100 group-hover:border-indigo-200 rounded-[3rem] p-12 text-xl font-medium text-slate-800 outline-none focus:border-indigo-500 transition-all selection:bg-indigo-100 shadow-xl shadow-slate-200/50"
                                                    placeholder="Synthesize Data File evidence here. Remember: Copy-Paste is disabled..."
                                                    value={drafts[task.id] || ''}
                                                    onChange={(e) => setDrafts(prev => ({...prev, [task.id]: e.target.value}))}
                                                 />
                                                 <div className="absolute bottom-10 right-12 flex items-center gap-4">
                                                    <div className="px-4 py-2 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                                                        Word Count: {(drafts[task.id] || '').trim().split(/\s+/).filter(x => x.length > 0).length}
                                                    </div>
                                                 </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </main>

                <style dangerouslySetInnerHTML={{ __html: `
                    .custom-scrollbar::-webkit-scrollbar {
                        width: 10px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: transparent;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: #e2e8f0;
                        border-radius: 10px;
                        border: 3px solid transparent;
                        background-clip: content-box;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                        background: #cbd5e1;
                        background-clip: content-box;
                    }
                ` }} />
                
                <GradingOverlay 
                    isOpen={isSubmitting}
                    title="Transmitting Paper 3"
                    status="Finalizing your listening scripts and integrated tasks..."
                />

                <AnimatePresence>
                    {isSubmitting && (
                        <div className="fixed inset-0 z-[200] bg-slate-900/90 backdrop-blur-xl flex items-center justify-center text-center p-8">
                            <div className="flex flex-col items-center">
                                <div className="size-24 border-4 border-white/10 border-t-indigo-500 rounded-full animate-spin mb-8" />
                                <h2 className="text-2xl font-black text-white uppercase tracking-widest">Evaluating Performance</h2>
                                <p className="text-slate-400 font-bold mt-2">Miss Janie is reviewing your Integrated Tasks...</p>
                            </div>
                        </div>
                    )}
                </AnimatePresence>

                <UpgradeModal 
                    isOpen={showUpgradeModal} 
                    onClose={() => setShowUpgradeModal(false)}
                    title="Unlock Evaluation"
                    message="Free trial users can attempt the Listening Mock paper, but AI evaluation and grade prediction are Pro features. Upgrade now to get your results!"
                />

                <AnimatePresence>
                    {showSubmitModal && (
                        <div className="fixed inset-0 z-[200] flex items-center justify-center p-8">
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowSubmitModal(false)}
                                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                            />
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-white w-full max-w-md p-10 rounded-[3rem] shadow-2xl relative z-[210] text-center"
                            >
                                <div className="size-16 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-sm">
                                    <CheckCircle2 size={32} />
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tight">Submit Examination?</h2>
                                <p className="text-slate-500 font-medium mb-10 leading-relaxed text-sm">
                                    Are you sure you want to submit your paper? This will finalize your answers and <span className="text-slate-900 font-bold">end your examination session</span>.
                                </p>
                                <div className="space-y-3">
                                    <button 
                                        type="button"
                                        onClick={() => setShowSubmitModal(false)}
                                        className="w-full py-5 bg-slate-50 text-slate-400 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-100 transition-all active:scale-95 cursor-pointer"
                                    >
                                        Review Answers
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => handleSubmit(true)}
                                        className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-900/20 active:scale-95 cursor-pointer relative z-[220]"
                                    >
                                        Finalize & Submit
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
                <AnimatePresence>
                    {showSwitchModal && (
                        <div className="fixed inset-0 z-[200] flex items-center justify-center p-8">
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowSwitchModal(false)}
                                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                            />
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-white w-full max-w-md p-10 rounded-[3rem] shadow-2xl relative z-[210] text-center"
                            >
                                <div className="size-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-sm">
                                    <AlertTriangle size={32} />
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tight">Switch Section?</h2>
                                <p className="text-slate-500 font-medium mb-10 leading-relaxed text-sm">
                                    Switching to <span className="text-rose-500 font-bold">{pendingSection}</span> will <span className="text-slate-900 font-bold underline decoration-rose-500 decoration-2">erase your current writing</span> for Tasks {selectedSection === 'B1' ? '5-7' : '8-10'}. This action cannot be undone.
                                </p>
                                <div className="space-y-3">
                                    <button 
                                        type="button"
                                        onClick={() => setShowSwitchModal(false)}
                                        className="w-full py-5 bg-slate-50 text-slate-400 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-100 transition-all active:scale-95 cursor-pointer"
                                    >
                                        Cancel Switch
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={executeSwitch}
                                        className="w-full py-5 bg-rose-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-rose-700 transition-all shadow-xl shadow-rose-900/20 active:scale-95 cursor-pointer relative z-[220]"
                                    >
                                        Confirm & Erase
                                    </button>
                                </div>
                            </motion.div>
                        </div>
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
                                onClick={(e) => e.stopPropagation()}
                                className="bg-white w-full max-w-md p-10 rounded-[3rem] shadow-2xl relative z-[210] text-center"
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
                                        type="button"
                                        onClick={() => setShowQuitModal(false)}
                                        className="w-full py-5 bg-slate-50 text-slate-400 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-100 transition-all active:scale-95 cursor-pointer"
                                    >
                                        Keep Working
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={handleSaveAndQuit}
                                        className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-900/10 active:scale-95 cursor-pointer relative z-[220]"
                                    >
                                        Save & Quit
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {phase === 'B1B2_GATE' && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-slate-900/90 backdrop-blur-xl selection:bg-indigo-100 text-white"
                        >
                            <motion.div 
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                className="max-w-4xl w-full"
                            >
                                <div className="text-center mb-12">
                                    <h2 className="text-5xl font-black mb-4 tracking-tight leading-tight">Select Integrated Skills Tier</h2>
                                    <p className="text-slate-400 font-medium italic text-lg">Broadcast complete. Choose your path for the 75-minute writing phase.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div 
                                        onClick={() => handleSwitchSection('B1')}
                                        className="group bg-slate-800/50 border-2 border-slate-700 hover:border-indigo-500 p-10 rounded-[3rem] cursor-pointer transition-all hover:-translate-y-2 relative overflow-hidden"
                                    >
                                        <div className="mb-8 flex justify-between items-start relative z-10">
                                            <div className="p-4 bg-indigo-500/10 rounded-xl text-indigo-500">
                                                <Headphones size={32} />
                                            </div>
                                            <span className="bg-indigo-500 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">Easier (B1)</span>
                                        </div>
                                        <h3 className="text-3xl font-black mb-4 uppercase tracking-tight relative z-10">Tasks 5—7</h3>
                                        <p className="text-slate-400 leading-relaxed mb-8 text-sm relative z-10">Optimized for candidates aiming for **Level 4**. Synthesis is direct and data interpretation is straightforward.</p>
                                        <div className="flex items-center gap-2 text-indigo-400 font-black text-xs uppercase tracking-widest relative z-10">
                                            Commence B1 Path <ChevronRight size={16} />
                                        </div>
                                    </div>

                                    <div 
                                        onClick={() => handleSwitchSection('B2')}
                                        className="group bg-slate-800/50 border-2 border-slate-700 hover:border-rose-500 p-10 rounded-[3rem] cursor-pointer transition-all hover:-translate-y-2 relative overflow-hidden"
                                    >
                                        <div className="mb-8 flex justify-between items-start relative z-10">
                                            <div className="p-4 bg-rose-500/10 rounded-xl text-rose-500">
                                                <ShieldCheck size={32} />
                                            </div>
                                            <span className="bg-rose-500 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">Harder (B2)</span>
                                        </div>
                                        <h3 className="text-3xl font-black mb-4 uppercase tracking-tight relative z-10">Tasks 8—10</h3>
                                        <p className="text-slate-400 leading-relaxed mb-8 text-sm relative z-10">Mandatory for **Level 5, 5*, or 5***. Requires sophisticated manipulation of conflicting Data File evidence.</p>
                                        <div className="flex items-center gap-2 text-rose-400 font-black text-xs uppercase tracking-widest relative z-10">
                                            Commence B2 Path <ChevronRight size={16} />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    // --- PHASE: RESULTS ---
    if (phase === 'RESULTS' && submissionResults) {
        const { 
            level = "U", 
            percentage = 0, 
            sectionalScores = { A: { score: 0, possible: 0 }, B: { score: 0, possible: 0, domains: {} } },
            skillScores = {},
            results: detailedResults = {}
        } = submissionResults;

        const writingEvaluation = detailedResults?.writingEvaluation || {};

        const getLevelColor = (lvl) => {
            if (lvl?.includes('5**')) return 'bg-rose-600';
            if (lvl?.includes('5*')) return 'bg-rose-500';
            if (lvl?.includes('5')) return 'bg-indigo-600';
            if (lvl?.includes('4')) return 'bg-emerald-600';
            if (lvl?.includes('3')) return 'bg-amber-500';
            return 'bg-slate-600';
        };

        return (
            <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-indigo-100">
                {/* Header */}
                <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between z-50 sticky top-0 shadow-sm">
                    <div className="flex items-center gap-6">
                        <button 
                            onClick={() => navigate('/mock-exam-eng')}
                            className="p-2.5 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
                        >
                            <ArrowLeft size={22} />
                        </button>
                        <div>
                            <div className="flex items-center gap-2 mb-0.5">
                                <h1 className="font-black text-slate-900 tracking-tight text-lg">Listening Assessment Report</h1>
                                <span className="px-2 py-0.5 bg-indigo-600 text-white rounded text-[9px] font-black uppercase tracking-widest">
                                    Mission Completed
                                </span>
                            </div>
                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] flex items-center gap-2">
                                 <Headphones size={10} className="text-indigo-500" /> {mockData?.meta?.title || 'Paper 3 Mock'}
                                 <span className="text-slate-200">|</span>
                                 <span className="flex items-center gap-1 text-slate-500">
                                     <Star size={10} className="text-rose-500 fill-current" /> Section {selectedSection}
                                 </span>
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

                <main className="flex-1 max-w-7xl mx-auto w-full p-8 space-y-8">
                    {/* Hero Section: Level & Mastery Breakdown */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Level Card */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="lg:col-span-4 bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col items-center justify-center text-center relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600" />
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Predicted DSE Level</h3>
                            <div className="relative">
                                <motion.div 
                                    initial={{ scale: 0.5, rotate: -10 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: 'spring', damping: 12 }}
                                    className={`text-9xl font-black italic tracking-tighter ${level?.includes('5') ? 'text-rose-600' : 'text-indigo-600'}`}
                                >
                                    {level}
                                </motion.div>
                                {level?.includes('5') && (
                                    <div className="absolute -top-4 -right-4 bg-amber-400 text-white p-2 rounded-full shadow-lg border-2 border-white">
                                        <Sparkles size={20} fill="currentColor" />
                                    </div>
                                )}
                            </div>
                            <div className="mt-8 space-y-1">
                                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Composite Score</p>
                                <p className="text-2xl font-black text-slate-900">{Math.round(percentage)}%</p>
                            </div>
                            <div className="mt-6 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percentage}%` }}
                                    className={`h-full ${getLevelColor(level)}`}
                                />
                            </div>

                            <div className="mt-8 pt-8 border-t border-slate-100 w-full">
                                <div className="flex items-center justify-center gap-3">
                                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                                        <Zap size={16} fill="currentColor" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">XP Gained</p>
                                        <p className="text-xl font-black text-emerald-600">+{xpAwarded || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Mastery Grid */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="lg:col-span-8 bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-xl shadow-slate-200/50"
                        >
                            <div className="flex items-center justify-between mb-10">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">HKEAA Mastery Breakdown</h3>
                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                    <Info size={12} />
                                    <span>Based on 2026 Marking Scheme</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {Object.entries(skillScores).map(([skill, data], idx) => (
                                    <div key={skill} className="space-y-4">
                                        <div className="flex justify-between items-end">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{skill}</p>
                                                <p className="text-lg font-black text-slate-900">{Math.round((data.score / data.possible) * 100)}%</p>
                                            </div>
                                            <p className="text-xs font-bold text-slate-400">{data.score} / {data.possible}</p>
                                        </div>
                                        <div className="h-3 bg-slate-50 rounded-full border border-slate-100 overflow-hidden">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(data.score / data.possible) * 100}%` }}
                                                transition={{ delay: 0.3 + (idx * 0.1) }}
                                                className={`h-full ${idx === 0 ? 'bg-indigo-500' : idx === 1 ? 'bg-rose-500' : idx === 2 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-12 p-6 bg-slate-50 rounded-3xl border border-dashed border-slate-200 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white rounded-2xl shadow-sm text-indigo-600">
                                        <BarChart3 size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-slate-900 uppercase tracking-tight">Performance Summary</p>
                                        <p className="text-[10px] text-slate-500 font-medium">Your strongest pillar is <span className="font-bold text-indigo-600">{Object.keys(skillScores).length > 0 ? Object.keys(skillScores).reduce((a, b) => ((skillScores[a]?.score || 0) / (skillScores[a]?.possible || 1)) > ((skillScores[b]?.score || 0) / (skillScores[b]?.possible || 1)) ? a : b) : 'Pending Evaluation'}</span>.</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Total Marks</p>
                                    <p className="text-2xl font-black text-slate-900">{submissionResults.totalScore} / {submissionResults.possibleScore}</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Miss Janie's Verdict */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-indigo-950 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl shadow-indigo-900/40"
                    >
                        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-indigo-900/50 to-transparent pointer-events-none" />
                        <div className="relative z-10 flex flex-col md:flex-row gap-12 items-start">
                            <div className="shrink-0 flex flex-col items-center gap-4">
                                <div className="w-24 h-24 bg-white/10 rounded-3xl backdrop-blur-xl border border-white/20 flex items-center justify-center overflow-hidden">
                                    <img src={englishTutor?.avatar || "/avatars/Miss_Janie.jpg"} alt={englishTutor?.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Examiner</p>
                                    <p className="text-lg font-black tracking-tight">{englishTutor?.name || "Miss Janie"}</p>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em] mb-3">Overall Verdict</h3>
                                    <p className="text-2xl font-medium leading-relaxed italic opacity-95">
                                        "{writingEvaluation.overall_feedback || "Excellent work on synthesising the Data File evidence. Focus on more sophisticated transitions to reach Level 5**."}"
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-4 pt-4 border-t border-white/10">
                                    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-xs font-bold">
                                        <Target size={14} className="text-rose-400" />
                                        <span>Primary Goal: {sectionalScores?.B?.score < 30 ? 'Evidence Synthesis' : 'Linguistic Flair'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-xs font-bold">
                                        <CheckCircle2 size={14} className="text-emerald-400" />
                                        <span>Accuracy: {sectionalScores?.A?.score ? Math.round((sectionalScores.A.score / sectionalScores.A.possible) * 100) : 0}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Detail Toggle */}
                    <div className="flex bg-white p-2 rounded-2xl border border-slate-200 shadow-sm sticky top-24 z-40">
                        <button 
                            onClick={() => setActiveResultPart('A')}
                            className={`flex-1 py-4 rounded-xl flex items-center justify-center gap-3 transition-all ${activeResultPart === 'A' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
                        >
                            <ClipboardList size={18} />
                            <span className="font-black uppercase tracking-widest text-[11px]">Part A Analysis</span>
                        </button>
                        <button 
                            onClick={() => setActiveResultPart('B')}
                            className={`flex-1 py-4 rounded-xl flex items-center justify-center gap-3 transition-all ${activeResultPart === 'B' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
                        >
                            <PenTool size={18} />
                            <span className="font-black uppercase tracking-widest text-[11px]">Part B Evaluation</span>
                        </button>
                    </div>

                    {/* Detailed Analysis Content */}
                    <div className="min-h-[600px]">
                        <AnimatePresence mode="wait">
                            {activeResultPart === 'A' ? (
                                <motion.div 
                                    key="part-a"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="space-y-8"
                                >
                                    {mockData?.Part_A?.tasks?.map((task, tIdx) => (
                                        <div key={task.id} className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
                                            <div className="bg-slate-900 px-10 py-6 flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center font-black text-white">{tIdx + 1}</div>
                                                    <h4 className="font-black text-white uppercase tracking-widest text-sm">{task.id}</h4>
                                                </div>
                                                <div className="px-4 py-1.5 bg-white/10 rounded-full border border-white/10 text-[10px] font-black text-indigo-300 uppercase tracking-widest">
                                                    Listening Focus
                                                </div>
                                            </div>
                                            <div className="p-10 space-y-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    {task.questions.map((q, qIdx) => {
                                                        const qAssessment = detailedResults[q.id];
                                                        const isCorrect = qAssessment?.status === 'correct';
                                                        const isPartial = qAssessment?.status === 'partial';
                                                        
                                                        return (
                                                            <div key={q.id} className="space-y-4 p-6 bg-slate-50 rounded-3xl border border-slate-200 relative group transition-all hover:border-indigo-200">
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Question {qIdx + 1}</span>
                                                                    <div className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${isCorrect ? 'bg-emerald-100 text-emerald-700' : (isPartial ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700')}`}>
                                                                        {qAssessment?.status || 'Incorrect'}
                                                                    </div>
                                                                </div>
                                                                <p className="text-xs font-bold text-slate-900 leading-relaxed">{q.label || q.text}</p>
                                                                
                                                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                                                                    <div>
                                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Your Answer</p>
                                                                        <p className={`text-xs font-black ${isCorrect ? 'text-emerald-600' : 'text-slate-900'}`}>
                                                                            {submissionResults.userAnswers.answers[q.id] || '(Blank)'}
                                                                        </p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Correct Mark</p>
                                                                        <p className="text-xs font-black text-indigo-600">{q.answer || q.marking_scheme}</p>
                                                                    </div>
                                                                </div>
                                                                
                                                                {(qAssessment?.feedback || qAssessment?.professionalAdvice) && (
                                                                    <div className="mt-4 p-4 bg-white rounded-2xl border border-slate-100 text-[10px] font-medium text-slate-500 italic leading-relaxed flex items-start gap-3">
                                                                        <div className="w-6 h-6 rounded-lg overflow-hidden shrink-0 border border-slate-100 shadow-sm">
                                                                            <img src={englishTutor?.avatar || "/avatars/Miss_Janie.jpg"} alt={englishTutor?.name} className="w-full h-full object-cover" />
                                                                        </div>
                                                                        <div>
                                                                            <span className="font-bold text-indigo-600 not-italic mr-2">{englishTutor?.name || "Miss Janie"}:</span>
                                                                            {qAssessment.feedback || qAssessment.professionalAdvice}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </motion.div>
                            ) : (
                                <motion.div 
                                    key="part-b"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-12"
                                >
                                    {/* Pillar Breakdown for Part B */}
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                        {Object.entries(sectionalScores?.B?.domains || {}).map(([domain, data], idx) => (
                                            <div key={domain} className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-lg text-center space-y-4">
                                                <div className={`w-12 h-12 mx-auto rounded-2xl flex items-center justify-center ${idx === 0 ? 'bg-indigo-100 text-indigo-600' : idx === 1 ? 'bg-rose-100 text-rose-600' : idx === 2 ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                                    {idx === 0 ? <ClipboardList size={24} /> : idx === 1 ? <Layout size={24} /> : idx === 2 ? <PenTool size={24} /> : <ShieldCheck size={24} />}
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{domain}</p>
                                                    <p className="text-2xl font-black text-slate-900">{data?.score || 0} / {domain === 'appropriacy' ? 6 : (domain === 'content' ? 18 : 9)}</p>
                                                </div>
                                                <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{data?.feedback?.split('.')[0] || "Evaluation complete."}.</p>
                                            </div>
                                        ))}
                                    </div>

                                     {/* Task-by-Task 2-Column Comparison */}
                                    {Object.entries(writingEvaluation.task_breakdown || {}).map(([taskId, data], idx) => {
                                        const taskData = (selectedSection === 'B1' ? mockData?.Part_B?.Part_B1?.tasks : mockData?.Part_B?.Part_B2?.tasks)?.find(t => t.id === taskId);
                                        if (!taskData) return null;
                                        
                                        const studentDraft = submissionResults?.userAnswers?.drafts?.[taskId] || "";
                                        const modelAnswer = data.model_answer || "";
                                        const taskNumber = selectedSection === 'B1' ? idx + 5 : idx + 8;

                                        return (
                                            <div key={taskId} className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl overflow-hidden scroll-mt-24" id={`task-review-${taskId}`}>
                                                <div className="bg-slate-900 px-12 py-8 flex items-center justify-between">
                                                    <div className="flex items-center gap-6">
                                                        <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center font-black text-white text-xl shadow-lg shadow-indigo-900/40">
                                                            {taskNumber}
                                                        </div>
                                                        <div>
                                                            <h4 className="text-xl font-black text-white tracking-tight">Task {taskNumber}: {taskData.type}</h4>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Synthesis Review & Evaluation</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-4">
                                                        <div className="px-6 py-2 bg-white/10 rounded-full border border-white/10 text-[10px] font-black text-indigo-300 uppercase tracking-widest flex items-center gap-2">
                                                            <Target size={14} /> Tone: {taskData.tone || 'Formal'}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 lg:grid-cols-2">
                                                    {/* Student Answer */}
                                                    <div className="p-12 border-r border-slate-100 bg-slate-50/30">
                                                        <div className="flex items-center justify-between mb-8">
                                                            <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                                <GraduationCap size={16} className="text-indigo-500" /> Candidate Response
                                                            </h5>
                                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Word Count: {studentDraft.trim().split(/\s+/).filter(x => x.length > 0).length}</span>
                                                        </div>
                                                        <div className="prose prose-slate max-w-none">
                                                            <p className="text-base font-medium text-slate-700 leading-relaxed whitespace-pre-wrap selection:bg-indigo-100">
                                                                {studentDraft || "No response recorded for this task."}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Model Answer (Elite Version) */}
                                                    <div className="p-12 bg-white">
                                                        <div className="flex items-center justify-between mb-8">
                                                            <h5 className="text-xs font-black text-rose-600 uppercase tracking-widest flex items-center gap-2">
                                                                <Sparkles size={16} className="fill-current" /> Elite Master Version
                                                            </h5>
                                                            <span className="px-3 py-1 bg-rose-50 text-rose-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-rose-100">
                                                                Level 5** Standard
                                                            </span>
                                                        </div>
                                                        <div className="prose prose-rose max-w-none">
                                                            <p className="text-base font-medium text-slate-900 leading-relaxed whitespace-pre-wrap bg-rose-50/30 p-8 rounded-[2rem] border border-rose-100 shadow-sm selection:bg-rose-100">
                                                                {modelAnswer || "Model answer being generated..."}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Miss Janie's Professional Feedback Section */}
                                                <div className="bg-slate-50 p-12 border-t border-slate-200">
                                                    <div className="flex flex-col md:flex-row items-start gap-10">
                                                        <div className="shrink-0 flex flex-col items-center gap-3">
                                                            <div className="w-20 h-20 bg-indigo-600 rounded-3xl shadow-xl shadow-indigo-900/20 border-4 border-white flex items-center justify-center text-white overflow-hidden">
                                                                <img src={englishTutor?.avatar || "/avatars/Miss_Janie.jpg"} alt={englishTutor?.name} className="w-full h-full object-cover" />
                                                            </div>
                                                            <div className="text-center">
                                                                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Expert</p>
                                                                <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{englishTutor?.name || "Miss Janie"}</p>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="flex-1 space-y-6">
                                                            <div>
                                                                <h5 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                                    <Info size={14} className="text-indigo-500" /> Professional Feedback
                                                                </h5>
                                                                <p className="text-lg text-slate-600 font-medium leading-relaxed italic border-l-4 border-indigo-200 pl-6">
                                                                    "{data.comments || "Your synthesis of the meeting minutes was clear."}"
                                                                </p>
                                                            </div>

                                                            {data.missed_points?.length > 0 && (
                                                                <div>
                                                                    <h5 className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-3">Critical Missed Evidence</h5>
                                                                    <div className="flex flex-wrap gap-3">
                                                                        {data.missed_points.map((p, pi) => (
                                                                            <span key={pi} className="px-5 py-2.5 bg-white border border-rose-100 text-rose-700 rounded-2xl text-[10px] font-bold flex items-center gap-3 shadow-sm hover:border-rose-300 transition-colors">
                                                                                <AlertCircle size={14} className="text-rose-500" /> {p}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Footer Navigation */}
                    <div className="pt-12 border-t border-slate-200 flex items-center justify-end">
                        <button 
                            onClick={() => navigate('/dashboard', { 
                                state: { 
                                    mockCompleted: true,
                                    type: 'Listening',
                                    level: level,
                                    score: `${Math.round(percentage)}%`,
                                    improvements: writingEvaluation?.overall_feedback
                                } 
                            })}
                            className="px-10 py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase text-[11px] tracking-[0.2em] hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-900/20 active:scale-95 flex items-center gap-3"
                        >
                            Back to Dashboard <ChevronRight size={18} />
                        </button>
                    </div>
                </main>

                <style dangerouslySetInnerHTML={{ __html: `
                    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap');
                    body { font-family: 'Outfit', sans-serif; }
                    .prose p { margin-bottom: 1.5em; }
                ` }} />
            </div>
        );
    }

    return null;
};

export default ListeningMockStudio;
