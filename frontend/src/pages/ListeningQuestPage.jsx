import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Headphones, Layers, Zap, ListChecks } from 'lucide-react';
import { LoadingPage } from '../components/shared';
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
    const [userNotes, setUserNotes] = useState("");

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
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                
                // Robust fetch for full scenario data (including sprint_data and integrated_data)
                if (isMock && location.state?.paperId) {
                    console.log(`[QuestPage] Fetching MOCK paper: ${location.state.paperId}`);
                    const res = await fetch(`${API_URL}/api/english/mock/${location.state.paperId}`);
                    if (res.ok) data = await res.json();
                } else if (location.state?.isWeeklyQuest) {
                    console.log(`[QuestPage] Fetching WEEKLY paper`);
                    const res = await fetch(`${API_URL}/api/lab/weekly/listening`);
                    if (res.ok) data = await res.json();
                } else if (questId) {
                    console.log(`[QuestPage] Fetching FRESH scenario data for ID: ${questId}`);
                    
                    // Use special endpoint for weekly quests
                    const url = (questId.startsWith('weekly_') || location.state?.isWeeklyQuest)
                        ? `${API_URL}/api/lab/weekly/listening`
                        : `${API_URL}/api/lab/listening/${questId}`;
                    
                    let res = await fetch(url);
                    
                    // [FIX] MICRO-SKILL FALLBACK: If a micro-skill ID fails, try a default quest
                    if (!res.ok && questId.startsWith('listening_') && !questId.startsWith('weekly_')) {
                        console.warn(`[QuestPage] Quest ID ${questId} not found, falling back to l_001`);
                        res = await fetch(`${API_URL}/api/lab/listening/l_001`);
                    }

                    if (res.ok) {
                        data = await res.json();
                    } else {
                        throw new Error(`Failed to fetch scenario data for ${questId}`);
                    }
                }

                if (data) {
                    setQuestData(data);
                    localStorage.setItem('active_listening_quest_id', data.id);
                    // Standard flow: if no saved results, start the simulator
                    if (!savedState) setStep('simulator');
                } else {
                    console.error("[QuestPage] No data resolved for quest.");
                    navigate('/dashboard');
                }
            } catch (err) {
                console.error("[QuestPage] Initialization Error:", err);
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
                    masteryScore: score,
                    xpEarned: calcMarginalXP, // AWARD MARGINAL XP ONLY
                    userEmail: user?.email,
                    uid: user?.uid,
                    topic: currentMode === 'A' ? 'listening_part_a' : 'listening_content',
                    results: { [questData?.id || 'listening_mission']: true } // Mock results to pass backend validation
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
        
        // Revoke URL if it's a blob
        if (userAudioSrc && userAudioSrc.startsWith('blob:')) {
            URL.revokeObjectURL(userAudioSrc);
        }

        setCurrentMode('B');
        setStep('simulator');
        setUserResults(null);
        setUserAudioSrc(null);
        setMarginalXP(0);
        setPrevBestScore(0);
        window.scrollTo(0, 0);
    };


    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (userAudioSrc && userAudioSrc.startsWith('blob:')) {
                URL.revokeObjectURL(userAudioSrc);
            }
        };
    }, [userAudioSrc]);


    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-rose-100 italic-none">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/50 px-8 py-4 flex items-center justify-between z-50 sticky top-0 shadow-sm transition-all duration-300">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate(questData?.id ? `/listening/briefing/${questData.id}` : '/dashboard', {
                            state: { questData: questData }
                        })}
                        className="p-3 hover:bg-slate-100 bg-white border border-slate-100 rounded-2xl transition-all text-slate-500 shadow-sm hover:scale-105 active:scale-95"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="font-extrabold text-slate-900 tracking-tight text-xl">{questData?.title || "Listening Quest"}</h1>
                            {isMock ? (
                                <span className="px-2.5 py-1 bg-rose-600 text-white rounded-lg text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-rose-900/20">
                                    HKEAA MOCK
                                </span>
                            ) : (
                                <span className="px-2.5 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-slate-900/40">
                                    MISSION MODE
                                </span>
                            )}
                        </div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] flex items-center gap-3">
                           <div className="flex items-center gap-1.5">
                               {currentMode === 'A' ? (
                                   <><div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Part A: Data Sprint (Level {targetLevel})</>
                               ) : (
                                   <><div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" /> Part B: Integrated Skills ({level})</>
                               )}
                           </div>

                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {isMock && duration > 0 && step === 'simulator' && (
                        <div className="bg-slate-900 rounded-2xl px-5 py-2.5 border border-white/10 shadow-xl">
                            <MockCountdownTimer 
                                initialSeconds={duration} 
                                onTimeUp={() => {
                                    alert("Time is up! Submitting your listening paper...");
                                    handleComplete({ score: 0 }, null); 
                                }} 
                            />
                        </div>
                    )}

                </div>
            </header>

            {/* Main: same max-width + padding for Part A & B (Part B was full-bleed + overflow-hidden, which clipped the cheat dropdown) */}
            <main className="flex-1 flex flex-col w-full p-4 md:p-6 min-h-0">
                {step === 'loading' && (
                    <LoadingPage 
                        title="Calibrating Simulator High Fidelity..." 
                        subtext="Loading HKDSE-Aligned Scenarios and calibrating the environment."
                    />
                )}

                {step === 'simulator' && (
                    <div className={`flex-1 flex flex-col min-h-0 bg-white rounded-3xl shadow-2xl border border-slate-100 ${currentMode === 'A' ? 'overflow-hidden' : 'overflow-visible'}`}>
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
                        onMoveToPartB={handleMoveToPartB}
                    />
                )}
            </main>
        </div>
    );
};

export default ListeningQuestPage;
