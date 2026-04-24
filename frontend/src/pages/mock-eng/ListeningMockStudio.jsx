import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { 
    Headphones, 
    ChevronRight, 
    Clock, 
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
    FastForward
} from 'lucide-react';
import { LoadingPage, GradingOverlay } from '../../components/shared';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import MockCountdownTimer from '../../components/utils/MockCountdownTimer';
import DataFileViewer from '../../components/listening/DataFileViewer';
import Paper3AudioEngine from '../../components/listening/Paper3AudioEngine';

const ListeningMockStudio = () => {
    const { user } = useAuth();
    const { paperId } = useParams();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // EXAM PHASES: LOADING, BRIEFING, PREPARATION, PART_A, TRANSITION, PART_B_AUDIO, B1B2_GATE, INDEPENDENT, RESULTS
    const [phase, setPhase] = useState(searchParams.get('phase') || 'LOADING');
    const [mockData, setMockData] = useState(null);
    const [selectedSection, setSelectedSection] = useState(null); // 'B1' or 'B2'
    const [userAnswers, setUserAnswers] = useState({});
    const [drafts, setDrafts] = useState({}); // taskId -> string
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Engine State
    const [activeTaskNumber, setActiveTaskNumber] = useState(1);
    const [isTidying, setIsTidying] = useState(false);
    const [tidyingTime, setTidyingTime] = useState(0);
    const [tidyingTask, setTidyingTask] = useState(1);
    const [currentSection, setCurrentSection] = useState('A'); // 'A' or 'B'
    const [broadcastTimer, setBroadcastTimer] = useState(null);
    const [broadcastStatus, setBroadcastStatus] = useState({ isPlaying: false, isBuffering: false, pauseCountdown: null });
    const [audioIndex, setAudioIndex] = useState(0);
    const [showQuitModal, setShowQuitModal] = useState(false);
    const [independentTimeLeft, setIndependentTimeLeft] = useState(75 * 60);
    
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
                if (data.phase) {
                    setPhase(data.phase);
                    setSearchParams({ phase: data.phase });
                }
                setSelectedSection(data.selectedSection);
                setAudioIndex(data.audioIndex || 0);
                setBroadcastTimer(data.broadcastTimer);
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
                phase,
                selectedSection,
                audioIndex,
                broadcastTimer,
                independentTimeLeft
            };
            localStorage.setItem(`ace-it-listening-${paperId}`, JSON.stringify(state));
            
            // GLOBAL HUB FLAG (For MockLibraryEngPage)
            localStorage.setItem(`last_mock_inprogress_listening`, JSON.stringify({
                paperId,
                type: 'listening',
                topic: mockData.name,
                timestamp: Date.now()
            }));
        }
    }, [paperId, mockData, userAnswers, drafts, phase, selectedSection, audioIndex, broadcastTimer]);

    // Sync phase with URL
    useEffect(() => {
        const urlPhase = searchParams.get('phase');
        if (urlPhase && urlPhase !== phase) {
            setPhase(urlPhase);
        }
    }, [searchParams]);

    // Independent Writing Timer
    useEffect(() => {
        let timer;
        if (phase === 'INDEPENDENT' && independentTimeLeft > 0) {
            timer = setInterval(() => {
                setIndependentTimeLeft(prev => {
                    const next = prev - 1;
                    if (next <= 0) handleSubmit();
                    return next;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [phase, independentTimeLeft]);

    const updatePhase = (newPhase) => {
        setPhase(newPhase);
        setSearchParams({ phase: newPhase });
        
        // Enforce section visibility based on phase
        if (newPhase === 'PART_A') setCurrentSection('A');
        if (newPhase === 'PART_B_AUDIO') setCurrentSection('B');
    };

    const handleAudioComplete = () => {
        if (phase === 'PART_A') {
            // Part A finished, automatically transition to Part B audio briefing
            updatePhase('PART_B_AUDIO');
        } else if (phase === 'PART_B_AUDIO') {
            // Part B audio finished, enter the 75-minute independent writing phase
            updatePhase('B1B2_GATE');
        }
    };

    // Load Mock Data
    useEffect(() => {
        const fetchMock = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                const res = await fetch(`${API_URL}/api/english/mock/${paperId}`);
                if (res.ok) {
                    const data = await res.json();
                    
                    // Normalize Data: Ensure Part_A.tasks exists even in legacy structures
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

                        } else if (data.Part_A.Task_1) { // Very old structure
                            data.Part_A.tasks = Object.keys(data.Part_A)
                                .filter(key => key.startsWith('Task_'))
                                .map(key => ({ id: key, ...data.Part_A[key] }));
                        }
                    }

                    // Normalize Script
                    if (data.Part_A && !data.Part_A.script && data.Part_A.audio_script) {
                        // Reconstruct script if missing but audio_script exists
                        data.Part_A.script = [];
                        Object.entries(data.Part_A.audio_script).forEach(([key, val]) => {
                            data.Part_A.script.push({ speaker: "Announcer", text: `Start of ${key}.` });
                            if (val.content) {
                                data.Part_A.script.push(...val.content.map(c => ({ speaker: c.speaker, text: c.line })));
                            }
                            data.Part_A.script.push({ speaker: "Announcer", text: "(60-second pause to tidy up answers)" });
                        });
                    }

                    setMockData(data);
                    if (!searchParams.get('phase')) updatePhase('BRIEFING');

                } else { navigate('/mock-exam-eng'); }
            } catch (err) {
                console.error("Error fetching mock:", err);
                navigate('/mock-exam-eng');
            }
        };
        fetchMock();
    }, [paperId]);

    // Handle B1/B2 Switching with Warning
    const handleSwitchSection = (newSection) => {
        if (phase === 'INDEPENDENT' && selectedSection && selectedSection !== newSection) {
            if (window.confirm(`Switching to ${newSection} will erase your current writing for Tasks ${selectedSection === 'B1' ? '5-7' : '8-10'}. Continue?`)) {
                setSelectedSection(newSection);
                // Clear irrelevant drafts
                const updatedDrafts = { ...drafts };
                const tasksToClear = selectedSection === 'B1' ? ['Task_5', 'Task_6', 'Task_7'] : ['Task_8', 'Task_9', 'Task_10'];
                tasksToClear.forEach(t => delete updatedDrafts[t]);
                setDrafts(updatedDrafts);
            }
        } else {
            setSelectedSection(newSection);
            if (phase === 'B1B2_GATE') {
                setCurrentSection('B'); // Force redirect to Part B tasks
                updatePhase('INDEPENDENT');
                audioEngineRef.current?.resumeAfterSelection();
            }
        }
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
    }, [activeTaskNumber, isIndependent, phase, currentSection]);

    const handleSubmit = async () => {
        if (!window.confirm("Are you sure you want to submit your paper? This will end your examination session.")) return;
        
        setIsSubmitting(true);
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
                localStorage.removeItem(`ace-it-listening-${paperId}`); // Clear session on success
                updatePhase('RESULTS');
            }
        } catch (err) {
            console.error("Submission Error:", err);
            alert("Digital Examination Protocol Error: Your submission could not be processed. Please check your connection.");
        } finally {
            setIsSubmitting(false);
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
                            <div className="relative group">
                                <button className="w-10 h-10 flex items-center justify-center bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-xl border border-amber-200 transition-all shadow-sm">
                                    <Zap size={16} fill="currentColor" />
                                </button>
                                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[60]">
                                    <button 
                                        onClick={() => {
                                            const answers = {};
                                            mockData?.Part_A?.tasks.forEach(t => t.questions.forEach(q => answers[q.id] = q.answer));
                                            setUserAnswers(answers);
                                            const bDrafts = {};
                                            if (mockData?.Part_B) {
                                                const tasks = selectedSection === 'B1' ? mockData.Part_B.Part_B1?.tasks : mockData.Part_B.Part_B2?.tasks;
                                                tasks?.forEach(t => bDrafts[t.id] = "Level 5** Perfect response using all Data File points...");
                                            }
                                            setDrafts(bDrafts);
                                        }}
                                        className="w-full text-left p-3 hover:bg-indigo-50 rounded-xl flex items-center gap-3 group transition-all"
                                    >
                                        <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center font-black">5*</div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-900">Auto-fill 5**</p>
                                            <p className="text-[8px] text-slate-400">All points included</p>
                                        </div>
                                    </button>
                                    <button 
                                        onClick={() => {
                                            const answers = {};
                                            mockData?.Part_A?.tasks.forEach(t => t.questions.forEach((q, idx) => answers[q.id] = idx % 2 === 0 ? q.answer : 'Wrong answer'));
                                            setUserAnswers(answers);
                                        }}
                                        className="w-full text-left p-3 hover:bg-rose-50 rounded-xl flex items-center gap-3 group transition-all"
                                    >
                                        <div className="w-8 h-8 bg-rose-100 text-rose-600 rounded-lg flex items-center justify-center font-black">L2</div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-900">Auto-fill Level 2</p>
                                            <p className="text-[8px] text-slate-400">50% error rate</p>
                                        </div>
                                    </button>
                                </div>
                            </div>

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
                            onClick={handleSubmit} 
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
                                    if (taskNum) setTidyingTask(taskNum);
                                }}
                                onTidyingEnd={() => setIsTidying(false)}
                                onPhaseChange={updatePhase}
                                onRequireSelection={() => updatePhase('B1B2_GATE')}
                                onCountdownTick={setBroadcastTimer}
                                onStatusChange={setBroadcastStatus}
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
                                <DataFileViewer dataFiles={mockData?.Part_B?.data_file || []} />
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
                                            {broadcastStatus.isBuffering ? 'Buffering...' : (broadcastStatus.pauseCountdown ? 'Station Silence' : 'On Air')}
                                        </span>
                                    </div>
                                    <div className="h-4 w-[1px] bg-white/10" />
                                    <div className="flex items-center gap-3">
                                        <Clock size={14} className="text-indigo-400" />
                                        <span className="text-[11px] font-black tabular-nums tracking-wider text-indigo-100">
                                            {phase === 'INDEPENDENT' 
                                                ? `${Math.floor(independentTimeLeft / 60)}:${(independentTimeLeft % 60).toString().padStart(2, '0')}`
                                                : (broadcastTimer !== null ? `${Math.floor(broadcastTimer / 60)}:${(broadcastTimer % 60).toString().padStart(2, '0')}` : '--:--')}
                                        </span>
                                        {phase === 'INDEPENDENT' && <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2">Session Remaining</span>}
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
                                                                <p className="text-[11px] font-bold">You have <span className="text-amber-300 font-black">{tidyingTime}s</span> to check your answers for <span className="underline decoration-2">Task {tidyingTask}</span></p>
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

                {/* B1/B2 CHOICE MODAL PROMPT */}
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
    if (phase === 'RESULTS') return (
        <div className="h-screen bg-slate-900 flex items-center justify-center p-8 selection:bg-indigo-100">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl w-full text-center text-white">
                <div className="inline-flex p-8 bg-indigo-500 text-white rounded-[3rem] mb-10 shadow-2xl shadow-indigo-900/40">
                    <CheckCircle2 size={72} />
                </div>
                <h1 className="text-5xl font-black mb-6 tracking-tight">Paper 3 Concluded</h1>
                <p className="text-slate-400 mb-12 font-medium text-xl leading-relaxed px-12">
                    Your Question-Answer Book and Integrated Tasks have been submitted. 
                    AI Examiners are now calibrating your register, tone, and evidence synthesis.
                </p>
                <div className="flex gap-4">
                    <button onClick={() => navigate('/mock-exam-eng')} className="flex-1 py-6 bg-white text-slate-900 rounded-[2rem] font-black uppercase tracking-widest hover:bg-slate-100 transition-all">Hub Home</button>
                    <button className="flex-1 py-6 bg-slate-800 text-indigo-400 rounded-[2rem] font-black uppercase tracking-widest hover:bg-slate-700 transition-all flex items-center justify-center gap-3">
                        <BarChart size={20} /> Advanced Analytics
                    </button>
                </div>
            </motion.div>
        </div>
    );
    return null;
};

export default ListeningMockStudio;
