import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Headphones, Layers, Zap, ListChecks } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

import DataSprintBoard from '../components/listening/DataSprintBoard';
import IntegratedSimulationBoard from '../components/listening/IntegratedSimulationBoard';
import ListeningResultsStep from '../components/listening/ListeningResultsStep';
import MockCountdownTimer from '../components/utils/MockCountdownTimer';

const ListeningQuestPage = () => {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    
    // Mode details from Briefing
    const [currentMode, setCurrentMode] = useState(location.state?.mode || 'A');
    const level = location.state?.level || 'B2';
    const targetLevel = location.state?.targetLevel || 3;
    const isMock = location.state?.isMock || false;
    const duration = location.state?.duration || 0;

    const [step, setStep] = useState('loading'); // loading, simulator, results
    const [questData, setQuestData] = useState(null);
    const [userResults, setUserResults] = useState(null);
    const [userAudioSrc, setUserAudioSrc] = useState(null);
    const [marginalXP, setMarginalXP] = useState(0);
    const [prevBestScore, setPrevBestScore] = useState(0);

    // Persistence Helpers
    const getSessionKey = (qId, mode) => `ace_it_listening_session_${qId || 'unknown'}_${mode}`;
    const getHistoryKey = (qId, mode) => `ace_it_listening_history_${qId || 'unknown'}_${mode}`;

    // Load Data & Restore Session
    useEffect(() => {
        const loadQuest = async () => {
            const lStateData = location.state?.questData;
            // Robust ID recovery: 1. State, 2. URL param, 3. Last active session
            const persistentQuestId = localStorage.getItem('active_listening_quest_id');
            const questId = lStateData?.id || persistentQuestId;
            
            if (!questId) {
                console.warn("[QuestPage] No quest ID found. Returning to dashboard.");
                navigate('/dashboard');
                return;
            }

            // [NEW] FORCE FRESH START: Only wipe the ACTIVE SESSION, keep the HISTORY for badges
            if (location.state?.isNewSession) {
                console.log(`[QuestPage] Starting new session for ${questId}_${currentMode}. Preserving history.`);
                localStorage.removeItem(getSessionKey(questId, currentMode));
            }

            // Priority 1: Check localStorage for ACTIVE session (if refresh happened)
            const sessionKey = getSessionKey(questId, currentMode);
            const savedState = localStorage.getItem(sessionKey);

            if (savedState) {
               try {
                   const { results, audioSrc } = JSON.parse(savedState);
                   if (results) {
                       console.log(`[QuestPage] Restoring persistent session for ${questId}`);
                       setUserResults(results);
                       setUserAudioSrc(audioSrc);
                       setStep('results');
                       // If we have results, skip fetching unless data is missing
                       if (lStateData) {
                           setQuestData(lStateData);
                           return;
                       }
                   }
               } catch (e) {
                   console.warn("[QuestPage] Failed to restore session", e);
               }
            }

            // [FIX] ALWAYS fetch fresh data from API to ensure "High Fidelity" updates (seeders) are captured
            setStep('loading');

            try {
                let data = null;
                
                // Robust fetch for full scenario data (including sprint_data and integrated_data)
                if (isMock && location.state?.paperId) {
                    console.log(`[QuestPage] Fetching MOCK paper: ${location.state.paperId}`);
                    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                    const res = await fetch(`${API_URL}/api/english/mock/${location.state.paperId}`);
                    if (res.ok) data = await res.json();
                } else if (questId) {
                    console.log(`[QuestPage] Fetching FRESH scenario data for ID: ${questId}`);
                    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                    const res = await fetch(`${API_URL}/api/lab/listening/${questId}`);
                    if (res.ok) {
                        data = await res.json();
                    } else {
                        throw new Error("Failed to fetch scenario data");
                    }
                }

                if (data) {
                    setQuestData(data);
                    localStorage.setItem('active_listening_quest_id', data.id);
                    // Standard flow: if no saved results, start the simulator
                    if (!savedState) setStep('simulator');
                } else {
                    navigate('/dashboard');
                }
            } catch (err) {
                console.error("Failed to load quest:", err);
                if (!savedState) navigate('/dashboard');
            }
        };

        loadQuest();
    }, [location.state, navigate, currentMode]);

    const handleComplete = async (results, audioSrc) => {
        setUserResults(results);
        setUserAudioSrc(audioSrc);
        setStep('results');

        // Persistence Keys
        const sessionKey = getSessionKey(questData?.id, currentMode);
        const historyKey = getHistoryKey(questData?.id, currentMode);

        const score = results?.score || 0;
        const maxXP = currentMode === 'A' ? 25 : 50;

        // 1. Get Previous Best Score from History
        let prevBestScore = 0;
        let prevEarnedXP = 0;
        const existingHistory = localStorage.getItem(historyKey);
        if (existingHistory) {
            try {
                const hData = JSON.parse(existingHistory);
                prevBestScore = hData.results?.score || 0;
                prevEarnedXP = Math.floor((prevBestScore / 100) * maxXP);
            } catch (e) {}
        }

        // 2. Save Active Session (Recovery)
        try {
            localStorage.setItem(sessionKey, JSON.stringify({ results, audioSrc }));
        } catch (e) {
            console.warn("[QuestPage] Storage quota exceeded.", e);
            localStorage.setItem(sessionKey, JSON.stringify({ results, audioSrc: null }));
        }

        // 3. Update History if score is better
        if (score > prevBestScore) {
            localStorage.setItem(historyKey, JSON.stringify({ results, timestamp: Date.now() }));
        }

        // 4. Calculate Marginal XP (Only pay for the improvement)
        const currentPotentialXP = Math.floor((score / 100) * maxXP);
        const calcMarginalXP = Math.max(0, currentPotentialXP - prevEarnedXP);
        setMarginalXP(calcMarginalXP);
        setPrevBestScore(prevBestScore);

        // Submit XP to Backend
        try {
            console.log(`[QuestPage] Submitting results. Prev Best: ${prevBestScore}%, New: ${score}%. Marginal XP: ${calcMarginalXP}`);

            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const response = await fetch(`${API_URL}/api/lab/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    questId: questData?.id,
                    mode: currentMode,
                    score: score,
                    xpEarned: calcMarginalXP, // AWARD MARGINAL XP ONLY
                    userEmail: user?.email
                })
            });

            if (response.ok) {
                console.log(`[QuestPage] Successfully credited ${calcMarginalXP} XP to user.`);
            } else {
                console.warn(`[QuestPage] Failed to sync XP with server.`);
            }
        } catch (err) {
            console.error("[QuestPage] Error during XP submission:", err);
        }
    };

    const handleMoveToPartB = () => {
        // Clear Part A session when moving to B
        localStorage.removeItem(getSessionKey(questData?.id, 'A'));
        
        setCurrentMode('B');
        setStep('simulator');
        setUserResults(null);
        setUserAudioSrc(null);
        setMarginalXP(0);
        setPrevBestScore(0);
        window.scrollTo(0, 0);
    };

    const handleRetry = () => {
        localStorage.removeItem(getSessionKey(questData?.id, currentMode));
        setStep('simulator');
        setUserResults(null);
        setUserAudioSrc(null);
        setMarginalXP(0);
        setPrevBestScore(0);
        window.scrollTo(0, 0);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 px-8 py-3 flex items-center justify-between z-50 sticky top-0 shadow-sm">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate(questData?.id ? `/listening/briefing/${questData.id}` : '/dashboard', {
                            state: { questData: questData }
                        })}
                        className="p-2.5 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
                    >
                        <ArrowLeft size={22} />
                    </button>
                    <div>
                        <div className="flex items-center gap-2 mb-0.5">
                            <h1 className="font-black text-slate-900 tracking-tight text-lg">{questData?.title || "Listening Quest"}</h1>
                            {isMock ? (
                                <span className="px-2 py-0.5 bg-rose-600 text-white rounded text-[8px] font-black uppercase tracking-widest">
                                    HKEAA MOCK
                                </span>
                            ) : (
                                <span className="px-2 py-0.5 bg-slate-900 text-white rounded text-[8px] font-black uppercase tracking-widest">
                                    MISSION MODE
                                </span>
                            )}
                        </div>
                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] flex items-center gap-2">
                           {currentMode === 'A' ? (
                               <><Zap size={10} className="text-amber-500" /> Part A: Data Sprint (Level {targetLevel})</>
                           ) : (
                               <><Layers size={10} className="text-rose-500" /> Part B: Integrated Simulation ({level})</>
                           )}
                           <span className="text-slate-200">|</span>
                           <span className={`flex items-center gap-1 ${step === 'simulator' ? 'text-green-600' : 'text-slate-400'}`}>
                               <Headphones size={10} /> {step.toUpperCase()}
                           </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {isMock && duration > 0 && step === 'simulator' && (
                        <MockCountdownTimer 
                            initialSeconds={duration} 
                            onTimeUp={() => {
                                alert("Time is up! Submitting your listening paper...");
                                // handleComplete(null, null); // Forced submission with null results = 0? 
                                // Actually, we should trigger the simulator's own submission if possible
                                // but simpler: move to results with 0 or what's currently captured.
                                handleComplete({ score: 0 }, null); 
                            }} 
                        />
                    )}
                    {currentMode === 'B' && !isMock && (
                        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-rose-50 rounded-full border border-rose-100 italic">
                             <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest">Simulation Buffer Active</span>
                             <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                        </div>
                    )}
                </div>
            </header>

            {/* Main Content Area - Full width for Part B, centered for Part A */}
            <main className={`flex-1 flex flex-col w-full ${currentMode === 'A' ? 'p-6 md:p-12 max-w-7xl mx-auto' : 'p-0 overflow-hidden'}`}>
                {step === 'loading' && (
                    <div className={`flex flex-col items-center justify-center ${currentMode === 'A' ? 'h-[60vh]' : 'h-screen'} text-slate-400 animate-pulse`}>
                        <Loader2 size={64} className="animate-spin mb-6 text-indigo-500" />
                        <h3 className="text-xl font-black text-slate-800">Calibrating Simulator High Fidelity...</h3>
                        <p className="text-sm mt-2 font-bold text-slate-400">Loading HKDSE-Aligned Scenarios</p>
                    </div>
                )}

                {step === 'simulator' && (
                    <div className="flex-1 flex flex-col min-h-0 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
                        {currentMode === 'A' ? (
                            <DataSprintBoard 
                                questData={questData} 
                                onComplete={(res, audio) => handleComplete(res, audio)} 
                            />
                        ) : (
                            <IntegratedSimulationBoard 
                                questData={questData} 
                                level={level}
                                onComplete={(res, audio) => handleComplete(res, audio)} 
                            />
                        )}
                    </div>
                )}

                {step === 'results' && (
                    <ListeningResultsStep
                        results={userResults}
                        audioSrc={userAudioSrc}
                        mode={currentMode}
                        level={level}
                        marginalXP={marginalXP}
                        prevBestScore={prevBestScore}
                        onRetry={handleRetry}
                        onMoveToPartB={handleMoveToPartB}
                    />
                )}
            </main>
        </div>
    );
};

export default ListeningQuestPage;
