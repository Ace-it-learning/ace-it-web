import React, { useState, useEffect } from 'react';
import { 
    Play, Pause, FileText, Headphones, Mail, 
    Clock, Image, Globe, ChevronRight, PenTool, 
    BookOpen, CheckCircle, Sidebar, AlertCircle, 
    MessageSquare, Send, X, Layers, Zap, Loader2,
    Timer
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AudioWaveform from '../utils/AudioWaveform';

const IntegratedSimulationBoard = ({ questData, level, onComplete }) => {
    const { user } = useAuth();
    const [stage, setStage] = useState('LISTENING'); // LISTENING, SYNTHESIS
    const [isPlaying, setIsPlaying] = useState(false);
    const [notes, setNotes] = useState({}); // Structured notes { fieldId: text }
    const [draftText, setDraftText] = useState("");
    const [activeDoc, setActiveDoc] = useState(0);
    const [showNotesSidebar, setShowNotesSidebar] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentAudioSrc, setCurrentAudioSrc] = useState(null);
    const audioRef = React.useRef(null);
    const [hasStarted, setHasStarted] = useState(false);

    // Global Timer: Unified 60-minute Integrated Simulation (HKEAA Standard)
    const totalTime = 60 * 60;
    const [timeLeft, setTimeLeft] = useState(totalTime);
    const [showCheatMenu, setShowCheatMenu] = useState(false);
    const [isCheating, setIsCheating] = useState(false);

    useEffect(() => {
        if (!hasStarted) return; // Only start countdown once student starts audio

        const timer = setInterval(() => {
            setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        
        return () => clearInterval(timer);
    }, [hasStarted]);

    // Separate effect for top-level landing scroll
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, []);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const integratedData = questData?.integrated_data || {};
    const notetakingFields = integratedData.notetaking_fields || [];
    const dataFile = integratedData.data_file || [];
    const writingTask = integratedData.writing_task || {};

    // Cleanup audio on unmount
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    const handleCheat = async (targetLvl = "5ss") => {
        setIsCheating(true);
        setShowCheatMenu(false);

        try {
            // 1. DYNAMIC NOTES: Map marking key points to the notes fields
            const points = integratedData.marking_key || [];
            const fields = notetakingFields || [];
            const adminNotes = {};
            
            if (fields.length > 0) {
                fields.forEach((field, idx) => {
                    // Distribute points across available fields
                    const perField = Math.ceil(points.length / fields.length);
                    const fieldPoints = points.slice(idx * perField, (idx + 1) * perField);
                    adminNotes[field.id] = fieldPoints.join(". ") + (fieldPoints.length > 0 ? "." : "");
                });
            } else if (fields.length === 0 && points.length > 0) {
                 adminNotes['nt1'] = points.join(". ");
            }
            setNotes(adminNotes);

            // 2. DYNAMIC DRAFT: Call backend for context-aware model answer
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/lab/writing/cheat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mode: writingTask.format || 'Report',
                    level: targetLvl === '5ss' ? '5**' : targetLvl === '5' ? '5' : '4',
                    prompt: `
                        MISSION TITLE: ${questData.title}
                        INSTRUCTION: ${writingTask.instruction}
                        DSE FORMAT: ${writingTask.format || 'Formal Report'}
                        CONTENT POINTS TO INCLUDE: ${points.join('; ')}
                        DATA FILE REF: ${JSON.stringify(integratedData.data_file)}
                    `
                })
            });

            const data = await response.json();
            if (data.text) {
                setDraftText(data.text);
            } else {
                // Fallback if AI fails
                setDraftText(`[AUTOMATED GENERATION FALLBACK]\nTarget Mission: ${questData.title}\nObjectives: ${points.slice(0,3).join(", ")}...\nFull response could not be generated.`);
            }
        } catch (e) {
            console.error("Cheat generation error:", e);
            setDraftText("[DEV ERROR] Cheat mechanism failed to reach backend.");
        } finally {
            setIsCheating(false);
            console.log(`Admin Cheat Activated: ${targetLvl} model answer generated dynamically.`);
        }
    };

    const getDSELevelFromScore = (s) => {
        if (s >= 95) return "5**";
        if (s >= 88) return "5*";
        if (s >= 80) return "5";
        if (s >= 70) return "4";
        if (s >= 60) return "3";
        return "2";
    };

    // TTS Logic
    const handlePlayAudio = async () => {
        setHasStarted(true); // START TIMER
        setIsPlaying(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/lab/tts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: integratedData.audio_transcript || questData.audio_transcript || questData.listeningTranscript || "Starting Part B planning meeting audio briefing.",
                    accent: 'UK',
                    gender: 'FEMALE'
                })
            });
            const data = await res.json();
            if (data.audio) {
                const audioBase64 = `data:audio/mp3;base64,${data.audio}`;
                setCurrentAudioSrc(audioBase64);
                const audio = new Audio(audioBase64);
                audioRef.current = audio;
                audio.play();
                audio.onended = () => {
                    setIsPlaying(false);
                    audioRef.current = null;
                };
            } else {
                throw new Error("TTS generation failed");
            }
        } catch (e) {
            console.error("Audio Playback Error:", e);
            setIsPlaying(false);
        }
    };

    const handleSwitchStage = () => {
        // Stop audio if it's still playing when moving to synthesis
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
            setIsPlaying(false);
        }
        setStage('SYNTHESIS');
    };

    const handleNoteChange = (id, val) => {
        setNotes(prev => ({ ...prev, [id]: val }));
    };

    // Auto-open sidebar on stage transition to Synthesis
    useEffect(() => {
        if (stage === 'SYNTHESIS') {
            setShowNotesSidebar(true);
        }
    }, [stage]);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            // Ensure audio is available even if student didn't click "Play"
            let finalAudioSrc = currentAudioSrc;
            if (!finalAudioSrc) {
                console.log("[IntegratedBoard] Pre-fetching audio for results page...");
                try {
                    const ttsRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/lab/tts`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            text: questData?.integrated_data?.audio_transcript || "Starting Part B planning meeting audio briefing.",
                            accent: 'UK',
                            gender: 'FEMALE'
                        })
                    });
                    const ttsData = await ttsRes.json();
                    if (ttsData.audio) {
                        finalAudioSrc = `data:audio/mp3;base64,${ttsData.audio}`;
                        setCurrentAudioSrc(finalAudioSrc);
                    }
                } catch (e) {
                    console.error("Failed to pre-fetch audio", e);
                }
            }

            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/lab/evaluate_integrated`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    questId: questData.id,
                    studentNotes: notes,
                    studentDraft: draftText,
                    targetLevel: level,
                    uid: 'currentUser'
                })
            });

            if (res.ok) {
                const evaluation = await res.json();
                
                // Ensure dseLevel is NOT "B1" or "B2" (the part IDs)
                const computedScore = Math.round((evaluation.totalScore / 18) * 100);
                const validatedLevel = (evaluation.dseLevel && !evaluation.dseLevel.includes('B')) 
                    ? evaluation.dseLevel 
                    : getDSELevelFromScore(computedScore);

                const finalResults = {
                    ...evaluation,
                    score: computedScore,
                    dseLevel: validatedLevel,
                    studentDraft: draftText,
                    studentNotes: notes
                };
                onComplete(finalResults, finalAudioSrc);
            } else {
                // Fallback result for network failure
                const mockScore = 62;
                onComplete({ 
                    content: 3, language: 3, organization: 3, appropriacy: 2,
                    totalScore: 11, score: mockScore, 
                    dseLevel: getDSELevelFromScore(mockScore), 
                    studentDraft: draftText,
                    feedback: "Simulator grading service unavailable. Basic credit awarded." 
                }, finalAudioSrc);
            }
        } catch (e) {
            console.error("Evaluation error:", e);
            onComplete({ score: 70, dseLevel: "4" }, currentAudioSrc);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getDocIcon = (type) => {
        switch (type?.toLowerCase()) {
            case 'email': return Mail;
            case 'minutes': return Clock;
            case 'poster': return Image;
            case 'webpage': return Globe;
            default: return FileText;
        }
    };

    if (stage === 'LISTENING') {
        return (
            <div className="flex flex-col gap-10 animate-in fade-in duration-1000">
                {/* Audio Status Header & Waveform */}
                <div className="bg-slate-900 p-10 rounded-[3rem] shadow-2xl flex flex-col gap-8 border-b-8 border-rose-600 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500 rounded-full blur-[120px] -mr-48 -mt-48 opacity-20" />
                    
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                        <div className="flex items-center gap-8">
                            <div className={`w-24 h-24 rounded-3xl flex items-center justify-center transition-all duration-700 shadow-2xl ${isPlaying ? 'bg-rose-500 text-white animate-pulse shadow-rose-500/40 ring-4 ring-rose-500/20' : 'bg-slate-800 text-slate-400 border border-white/5'}`}>
                                <Headphones size={40} />
                            </div>
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="bg-rose-600 text-white text-[10px] font-black uppercase tracking-[0.25em] px-3 py-1.5 rounded-lg shadow-lg shadow-rose-900/40">Critical Briefing</span>
                                    <span className="text-rose-400 text-xs font-black uppercase tracking-widest opacity-80">Stage 1: Planning Meeting</span>
                                </div>
                                <h2 className="text-4xl font-extrabold text-white tracking-tighter leading-none italic-none">Listening & Core Notetaking</h2>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            {user?.email === 'fungtam@gmail.com' && (
                                <div className="relative">
                                    <button 
                                        onClick={() => !isCheating && setShowCheatMenu(!showCheatMenu)}
                                        disabled={isCheating}
                                        className={`flex items-center gap-2 px-6 py-4 bg-slate-800 text-amber-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all border border-amber-400/30 shadow-xl ${isCheating ? 'opacity-50 cursor-wait' : ''}`}
                                    >
                                        {isCheating ? (
                                            <><Loader2 size={18} className="animate-spin" /> Analyzing...</>
                                        ) : (
                                            <><Zap size={18} className="fill-current" /> Admin Sync</>
                                        )}
                                    </button>
                                    
                                    {showCheatMenu && (
                                        <div className="absolute top-full right-0 mt-4 w-56 bg-white border border-slate-100 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] z-[100] overflow-hidden animate-in zoom-in duration-300">
                                            <div className="p-4 bg-slate-50 border-b border-slate-100">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Target Proficiency</span>
                                            </div>
                                            {['4', '5', '5ss'].map((lvl) => (
                                                <button
                                                    key={lvl}
                                                    onClick={() => handleCheat(lvl)}
                                                    className="w-full text-left px-6 py-4 text-xs font-black text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all uppercase tracking-widest flex items-center justify-between group"
                                                >
                                                    {lvl === '5ss' ? 'Level 5**' : `Level ${lvl}`}
                                                    <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                            <button 
                                onClick={handlePlayAudio}
                                disabled={isPlaying}
                                className={`px-12 py-6 rounded-[2rem] font-black text-xl transition-all flex items-center gap-4 shadow-2xl
                                    ${isPlaying ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-white/5' : 'bg-rose-600 text-white hover:bg-rose-500 hover:scale-105 active:scale-95 shadow-rose-900/40'}
                                `}
                            >
                                {isPlaying ? 'Recording Stream Active' : <><Play size={28} className="fill-current" /> Start Audio Feed</>}
                            </button>
                        </div>
                    </div>

                    {/* Integrated Waveform */}
                    <div className={`transition-all duration-1000 overflow-hidden relative z-10 ${isPlaying ? 'max-h-[160px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                        <div className="bg-white/5 backdrop-blur-sm rounded-[2.5rem] p-8 border border-white/10 shadow-inner">
                            <AudioWaveform 
                                audioSrc={currentAudioSrc} 
                                isPlaying={isPlaying} 
                                height={80}
                                waveColor="#475569"
                                progressColor="#f43f5e"
                            />
                        </div>
                        <div className="mt-4 flex items-center gap-3 text-rose-400 px-6">
                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80">Listening Mode: Simulation Buffer Engaged</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Persistent Sidebar: Timer & Mission Specs */}
                    <div className="lg:col-span-1 sticky top-28 flex flex-col gap-8 h-fit">
                        {/* Digital Exam Timer */}
                        <div className="bg-slate-900 rounded-[3rem] p-10 shadow-2xl border-b-[10px] border-amber-500 text-white relative overflow-hidden group">
                            <div className="flex items-center gap-4 mb-6 relative z-10">
                                <Clock size={24} className="text-amber-500" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Simulation Time</span>
                            </div>
                            <div className={`text-6xl font-black tabular-nums tracking-tighter mb-8 relative z-10 transition-colors duration-500 ${timeLeft < 300 ? 'text-rose-500 animate-pulse' : 'text-white'}`}>
                                {formatTime(timeLeft)}
                            </div>
                            <div className="h-2.5 bg-white/10 rounded-full overflow-hidden relative z-10 shadow-inner">
                                <div 
                                    className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-1000 shadow-[0_0_25px_rgba(245,158,11,0.5)]" 
                                    style={{ width: `${(timeLeft / totalTime) * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* Mission Requirements Card */}
                        <div className="bg-indigo-900 text-white rounded-[3rem] p-10 shadow-2xl border-l-[10px] border-indigo-400 relative overflow-hidden">
                            <div className="flex items-center gap-5 mb-8 relative z-10">
                                <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/5 shadow-xl">
                                    <PenTool size={28} className="text-indigo-300" />
                                </div>
                                <h3 className="text-2xl font-extrabold tracking-tight uppercase leading-none italic-none">Mission Specs</h3>
                            </div>
                            
                            <div className="space-y-8 relative z-10">
                                <div>
                                    <h4 className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em] mb-3">Operational Briefing</h4>
                                    <p className="text-lg font-bold leading-snug tracking-tight text-indigo-50/90">
                                        {writingTask.instruction}
                                    </p>
                                </div>
                                
                                <div className="pt-8 border-t border-white/10 grid grid-cols-2 gap-6">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Format</span>
                                        <span className="text-xs font-black bg-white/10 px-4 py-1.5 rounded-full text-indigo-50 border border-white/5 text-center">Formal</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Quota</span>
                                        <span className="text-xs font-black text-white px-1 py-1.5">{writingTask.word_count || "200-250"} words</span>
                                    </div>
                                </div>

                                <div className="mt-8 p-6 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/5 shadow-inner">
                                    <p className="text-xs font-bold text-indigo-200 leading-relaxed italic text-center opacity-80">
                                        "Capture auditory nuances today; synthesize with the data file tomorrow."
                                    </p>
                                </div>

                                {/* Data File Lock Status */}
                                <div className="mt-6 flex items-center gap-4 p-5 bg-black/20 rounded-2xl border border-white/5 opacity-50 select-none grayscale cursor-not-allowed">
                                    <BookOpen className="text-indigo-400" size={24} />
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Document Database</span>
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Locked: Listening Phase</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Structured Notetaking Sheet */}
                    <div className="lg:col-span-2 bg-white rounded-[4rem] p-12 shadow-2xl shadow-slate-900/5 border border-slate-100 min-h-[700px] flex flex-col relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-64 h-64 bg-slate-50 rounded-full blur-[100px] -ml-32 -mt-32 opacity-80" />
                        
                        <div className="flex items-start justify-between mb-12 pb-8 border-b border-slate-50 relative z-10 transition-all">
                            <div>
                                <h3 className="text-3xl font-extrabold text-slate-900 mb-3 flex items-center gap-4 tracking-tighter italic-none">
                                    <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center shadow-sm">
                                        <Layers size={24} />
                                    </div>
                                    Rough Notetaking Sheet
                                </h3>
                                <p className="text-slate-400 font-bold ml-1 tracking-tight italic opacity-90">Capture all points mentioned in the briefing.</p>
                            </div>
                            <div className="p-5 bg-white border border-slate-100 rounded-3xl shadow-sm flex items-center gap-4">
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none">
                                    Difficulty: <span className="text-indigo-600">{level === 'B1' ? 'B1 Standard' : 'B2 Elite'}</span>
                                </div>
                                <div className={`w-3 h-3 rounded-full ${isPlaying ? 'bg-emerald-500 animate-pulse ring-4 ring-emerald-500/20' : 'bg-slate-200'}`} />
                            </div>
                        </div>

                        <div className="flex-1 space-y-12 relative z-10">
                            {notetakingFields.map((field) => (
                                <div key={field.id} className="group">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-1.5 h-6 bg-slate-200 group-focus-within:bg-rose-500 transition-colors rounded-full" />
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-[0.25em] group-focus-within:text-slate-900 transition-colors">
                                            {field.label}
                                        </label>
                                    </div>
                                    <textarea
                                        className="w-full bg-slate-50/50 border-2 border-slate-50 rounded-[2.5rem] p-10 text-slate-800 font-bold text-lg leading-relaxed focus:outline-none focus:bg-white focus:ring-8 focus:ring-rose-500/5 focus:border-rose-500/30 transition-all placeholder:text-slate-200 min-h-[160px] resize-none shadow-inner"
                                        placeholder={field.placeholder || "Enter notes..."}
                                        value={notes[field.id] || ""}
                                        onChange={(e) => handleNoteChange(field.id, e.target.value)}
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="mt-16 pt-12 border-t border-slate-50 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                            <div className="flex items-center gap-4 text-slate-400 group">
                                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-amber-50 group-hover:text-amber-500 transition-all duration-500">
                                    <AlertCircle size={24} />
                                </div>
                                <p className="text-sm font-bold max-w-sm italic opacity-80 group-hover:opacity-100 transition-opacity">Once audio finishes, your notes will move to the synthesis side-drawer.</p>
                            </div>
                            <button
                                onClick={handleSwitchStage}
                                className="bg-slate-900 text-white px-12 py-6 rounded-3xl font-black text-lg hover:bg-black transition-all flex items-center gap-4 shadow-[0_20px_50px_rgba(15,23,42,0.3)] hover:scale-105 active:scale-95 group"
                            >
                                Proceed to Synthesis Stage 
                                <div className="bg-white/10 p-1.5 rounded-lg group-hover:bg-white/20 transition-colors">
                                    <ChevronRight size={20} />
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (stage === 'SYNTHESIS') {
        return (
            <div className="flex flex-col gap-10 min-h-screen animate-in fade-in duration-1000 pb-20">
                {/* Stage 2 Synthesis Header */}
                <div className="bg-white p-10 rounded-[3rem] shadow-2xl border-b-8 border-indigo-600 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500 rounded-full blur-[120px] -ml-48 -mt-48 opacity-10" />
                    
                    <div className="flex items-center gap-8 relative z-10">
                        <div className="w-20 h-20 bg-indigo-600 text-white rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-900/40 rotate-3">
                            <PenTool size={36} />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.25em] px-3 py-1.5 rounded-lg shadow-lg shadow-indigo-900/40">Synthesis Mode</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                    <span className="text-slate-400 text-xs font-black uppercase tracking-widest opacity-80 italic">Stage 2: Strategic Writing</span>
                                </div>
                            </div>
                            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tighter leading-none italic-none">Data Integration & Drafting</h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-8 relative z-10">
                        <div className="px-8 py-5 bg-slate-900 rounded-[2rem] shadow-2xl border-l-[6px] border-amber-500 flex items-center gap-4 group">
                            <Clock size={20} className="text-amber-500 group-hover:scale-110 transition-transform" />
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Remaining</span>
                                <span className={`text-2xl font-black tabular-nums tracking-tighter leading-none ${timeLeft < 300 ? 'text-rose-500 animate-pulse' : 'text-white'}`}>
                                    {formatTime(timeLeft)}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting || draftText.length < 50}
                            className={`px-12 py-6 rounded-[2rem] font-black text-xl transition-all flex items-center gap-4 shadow-2xl relative
                                ${draftText.length >= 50 && !isSubmitting
                                    ? 'bg-slate-900 text-white hover:bg-black hover:scale-105 active:scale-95 shadow-slate-900/40 overflow-hidden' 
                                    : 'bg-slate-100 text-slate-300 cursor-not-allowed'}
                            `}
                        >
                            {isSubmitting ? (
                                <><Loader2 size={24} className="animate-spin" /> Digitizing...</>
                            ) : (
                                <>
                                    <Send size={24} className={draftText.length >= 50 ? 'animate-bounce' : ''} /> 
                                    Finalize Simulation
                                    {draftText.length >= 50 && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_3s_infinite]" />}
                                </>
                            )}
                        </button>
                        
                        <button 
                            onClick={() => setShowNotesSidebar(!showNotesSidebar)}
                            className={`p-6 rounded-3xl transition-all border-2 ${showNotesSidebar ? 'bg-indigo-600 text-white border-indigo-400 shadow-xl shadow-indigo-900/40' : 'bg-white text-slate-400 border-slate-100 hover:bg-indigo-50 hover:text-indigo-600 shadow-sm'}`}
                        >
                            <MessageSquare size={28} />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 flex-1">
                    {/* Left Column: Data File Booklet (Index Tabs) */}
                    <div className="lg:col-span-4 flex flex-col h-fit sticky top-28">
                        <div className="flex items-center gap-2 mb-6 ml-4">
                            <div className="w-2 h-2 rounded-full bg-indigo-400" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">HKEAA Data File Database</span>
                        </div>
                        
                        {/* Booklet Tabs */}
                        <div className="flex flex-wrap gap-1 mb-[0.5px] items-end relative z-10 px-4">
                            {dataFile.map((doc, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveDoc(idx)}
                                    className={`px-5 py-3 text-[10px] font-black uppercase tracking-widest rounded-t-2xl transition-all border-x border-t
                                        ${activeDoc === idx 
                                            ? 'bg-white border-slate-200 text-indigo-600 shadow-[0_-4px_15px_rgba(0,0,0,0.05)] relative z-20 pb-4 scale-105 origin-bottom' 
                                            : 'bg-slate-100 border-transparent text-slate-400 hover:bg-slate-200 pb-2'}
                                    `}
                                >
                                    Doc {idx + 1}: {doc.type}
                                </button>
                            ))}
                        </div>

                        {/* Document Surface */}
                        <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-200/60 flex flex-col h-[750px] overflow-hidden relative group">
                            <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between shrink-0">
                               <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white shadow-sm rounded-xl flex items-center justify-center text-indigo-600">
                                        {React.createElement(getDocIcon(dataFile[activeDoc]?.type), { size: 20 })}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-extrabold text-slate-900 tracking-tight leading-none mb-1">{dataFile[activeDoc]?.title || `Document ${activeDoc + 1}`}</h3>
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest opacity-80">Reference Unit #{activeDoc + 101}</span>
                                    </div>
                               </div>
                            </div>

                            {/* High-Fidelity Doc Content */}
                            <div className="flex-1 overflow-y-auto p-12 custom-scrollbar bg-white selection:bg-indigo-100 italic-none">
                                <div className="max-w-none prose prose-indigo prose-slate">
                                    <div className="flex items-center gap-2 mb-8 px-5 py-3 bg-indigo-50 border border-indigo-100 rounded-2xl w-fit">
                                        <Zap size={14} className="text-indigo-400" />
                                        <span className="text-[10px] font-black text-indigo-900 uppercase tracking-widest">Digital Archive Active</span>
                                    </div>
                                    <div className="text-slate-700 leading-relaxed font-bold text-base whitespace-pre-wrap">
                                        {dataFile[activeDoc]?.content}
                                    </div>
                                    {dataFile[activeDoc]?.type === 'INFOGRAPHIC' && (dataFile[activeDoc]?.imageUrl || dataFile[activeDoc]?.items) && (
                                        <div className="mt-12 p-8 bg-slate-50 rounded-[2.5rem] border-2 border-slate-100 border-dashed">
                                            <div className="flex items-center gap-3 mb-6">
                                                <Image className="text-indigo-400" size={24} />
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Visual Data Node</span>
                                            </div>
                                            {dataFile[activeDoc]?.imageUrl ? (
                                                 <img src={dataFile[activeDoc].imageUrl} alt="Doc Data" className="rounded-3xl shadow-xl border-4 border-white" />
                                            ) : (
                                                <div className="grid grid-cols-1 gap-4">
                                                    {dataFile[activeDoc].items?.map((it, idx) => (
                                                        <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm flex items-center gap-4 group hover:shadow-md transition-shadow">
                                                            <div className="w-2 h-2 rounded-full bg-indigo-500" />
                                                            <span className="text-sm font-black text-slate-700">{it}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Center Column: Writing Editor */}
                    <div className="lg:col-span-5 flex flex-col gap-6">
                        <div className="flex items-center gap-2 mb-0.5 ml-4">
                            <div className="w-2 h-2 rounded-full bg-emerald-400" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Drafting Canvas</span>
                        </div>

                        <div className="bg-white rounded-[4rem] shadow-2xl border-4 border-indigo-100/30 flex flex-col h-[750px] relative group overflow-hidden">
                            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-sm -rotate-2">
                                        <PenTool size={22} />
                                    </div>
                                    <h3 className="text-xl font-extrabold text-slate-900 tracking-tighter italic-none uppercase">Response Interface</h3>
                                </div>
                                <div className="flex items-center gap-5">
                                    <div className="text-right">
                                        <div className={`text-xs font-black uppercase tracking-widest leading-none mb-1 ${draftText.length < 50 ? 'text-rose-500' : 'text-emerald-600'}`}>
                                            {draftText.split(/\s+/).filter(Boolean).length} Words {level && `(${level})`}
                                        </div>
                                        <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                            <div 
                                                className={`h-full transition-all duration-700 ${draftText.length < 100 ? 'bg-amber-400' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'}`}
                                                style={{ width: `${Math.min(100, (draftText.length / 200) * 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <textarea
                                className="flex-1 p-12 text-slate-800 font-bold text-lg leading-relaxed focus:outline-none resize-none selection:bg-indigo-100 bg-[linear-gradient(transparent,transparent_31px,rgba(241,245,249,0.5)_31px)] bg-[length:100%_32px] custom-scrollbar"
                                placeholder="Begin synthesizing your response here..."
                                value={draftText}
                                onChange={(e) => setDraftText(e.target.value)}
                                spellCheck={false}
                            />
                        </div>
                    </div>

                    {/* Right Column: Glassmorphic Notetaking Sidebar */}
                    <div className={`lg:col-span-3 transition-all duration-700 flex flex-col gap-8 ${showNotesSidebar ? 'opacity-100 translate-x-0' : 'opacity-40 translate-x-4 grayscale scale-95'}`}>
                        <div className="flex items-center gap-2 mb-0.5 ml-4">
                            <div className="w-2 h-2 rounded-full bg-rose-400" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Briefing Capture</span>
                        </div>

                        <div className="bg-slate-900 rounded-[3rem] p-10 shadow-[0_30px_60px_rgba(15,23,42,0.4)] flex flex-col h-[750px] relative overflow-hidden text-white border-x border-white/5">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500 rounded-full blur-[100px] -mr-32 -mt-32 opacity-10" />
                            
                            <div className="flex items-center justify-between mb-10 pb-6 border-b border-white/10 relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-rose-500/20 text-rose-400 rounded-xl flex items-center justify-center shadow-lg ring-1 ring-white/10">
                                        <MessageSquare size={20} />
                                    </div>
                                    <h3 className="font-extrabold text-white tracking-tight text-lg italic-none">Field Notes</h3>
                                </div>
                                <button 
                                    onClick={() => setShowNotesSidebar(false)}
                                    className="p-2 hover:bg-white/10 rounded-lg text-slate-500 hover:text-white transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-10 custom-scrollbar pr-4 relative z-10">
                                {notetakingFields.map((field) => (
                                    <div key={field.id} className="relative group">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-1 h-3 bg-rose-500 rounded-full" />
                                            <label className="text-[10px] font-black text-rose-400/80 uppercase tracking-[0.2em]">{field.label}</label>
                                        </div>
                                        <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/5 shadow-inner transition-all group-hover:bg-white/10 group-hover:border-white/10">
                                            <p className="text-sm font-bold leading-relaxed text-slate-200 whitespace-pre-wrap">
                                                {notes[field.id] || "No data captured."}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Synthesis Instructions Card (Persistent in Sidebar) */}
                            <div className="mt-10 p-8 bg-indigo-600 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                               <div className="absolute top-0 right-0 p-6 text-white/5 group-hover:text-white/10 transition-colors">
                                   <AlertCircle size={60} />
                               </div>
                               <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-200 mb-4 relative z-10 underline decoration-indigo-400/50 decoration-2 underline-offset-4">Synthesis Logic</h4>
                               <p className="text-xs font-black text-indigo-50 leading-relaxed relative z-10">
                                   Merge **auditory points** from these notes with the **official Data File** text to reach Level 5**.
                               </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
};

export default IntegratedSimulationBoard;
