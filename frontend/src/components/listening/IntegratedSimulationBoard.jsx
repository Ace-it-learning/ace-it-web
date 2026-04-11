import React, { useState, useEffect } from 'react';
import { 
    Play, Pause, FileText, Headphones, Mail, 
    Clock, Image, Globe, ChevronRight, PenTool, 
    BookOpen, CheckCircle, Sidebar, AlertCircle, 
    MessageSquare, Send, X, Layers, Zap, Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

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
                    text: integratedData.audio_transcript || "Starting Part B planning meeting audio briefing.",
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
            <div className="flex flex-col gap-10 animate-in fade-in duration-700">
                {/* Audio Status Header */}
                <div className="bg-slate-900 p-8 rounded-3xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 border-b-4 border-rose-600">
                    <div className="flex items-center gap-6">
                        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-500 ${isPlaying ? 'bg-rose-500 text-white animate-pulse shadow-[0_0_30px_rgba(244,63,94,0.4)]' : 'bg-slate-800 text-slate-400'}`}>
                            <Headphones size={36} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded">Critical Phase</span>
                                <span className="text-rose-400 text-xs font-black uppercase tracking-widest">Part B: Audio Briefing</span>
                            </div>
                            <h2 className="text-3xl font-black text-white leading-none">Stage 1: Listening & Notetaking</h2>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        {user?.email === 'fungtam@gmail.com' && (
                            <div className="relative">
                                <button 
                                    onClick={() => !isCheating && setShowCheatMenu(!showCheatMenu)}
                                    disabled={isCheating}
                                    className={`flex items-center gap-2 px-6 py-4 bg-slate-800 text-amber-400 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all border border-amber-400/30 shadow-lg ${isCheating ? 'opacity-50 cursor-wait' : ''}`}
                                >
                                    {isCheating ? (
                                        <><Loader2 size={18} className="animate-spin" /> Generating...</>
                                    ) : (
                                        <><Zap size={18} className="fill-current" /> Admin Cheat</>
                                    )}
                                </button>
                                
                                {showCheatMenu && (
                                    <div className="absolute top-full right-0 mt-3 w-48 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="p-2 border-b border-white/5 bg-white/5">
                                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 px-3">Generate Level</span>
                                        </div>
                                        {['4', '5', '5ss'].map((lvl) => (
                                            <button
                                                key={lvl}
                                                onClick={() => handleCheat(lvl)}
                                                className="w-full text-left px-4 py-3 text-[10px] font-black text-amber-50/70 hover:text-white hover:bg-white/10 transition-colors uppercase tracking-widest flex items-center justify-between group"
                                            >
                                                {lvl === '5ss' ? 'Level 5**' : `Level ${lvl}`}
                                                <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                        <button 
                            onClick={handlePlayAudio}
                            disabled={isPlaying}
                            className={`px-10 py-5 rounded-2xl font-black transition-all flex items-center gap-3 shadow-xl
                                ${isPlaying ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-rose-600 text-white hover:bg-rose-500 hover:scale-105 active:scale-95 shadow-rose-900/40'}
                            `}
                        >
                            {isPlaying ? 'Audio Track Playing...' : <><Play size={24} className="fill-current" /> Play Recording</>}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Persistent Sidebar: Timer & Writing Task Instruction */}
                    <div className="lg:col-span-1 sticky top-24 flex flex-col gap-6 h-fit">
                        {/* Digital Examination Timer */}
                        <div className="bg-slate-900 rounded-3xl p-8 shadow-2xl border-b-4 border-amber-500 text-white">
                            <div className="flex items-center gap-3 mb-4 text-amber-500">
                                <Clock size={20} />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Time Remaining</span>
                            </div>
                            <div className={`text-4xl font-black tabular-nums tracking-tighter mb-4 ${timeLeft < 300 ? 'text-rose-500 animate-pulse' : 'text-white'}`}>
                                {formatTime(timeLeft)}
                            </div>
                            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-amber-500 transition-all duration-1000" 
                                    style={{ width: `${(timeLeft / totalTime) * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* Writing Task Instruction */}
                        <div className="bg-indigo-900 text-white rounded-3xl p-8 shadow-2xl border-l-8 border-indigo-400">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                                    <PenTool size={20} className="text-indigo-300" />
                                </div>
                                <h3 className="text-lg font-black uppercase tracking-widest leading-none">Writing Task</h3>
                            </div>
                            
                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-2">Instructions</h4>
                                    <p className="text-sm font-bold leading-tight">
                                        {writingTask.instruction}
                                    </p>
                                </div>
                                
                                <div className="pt-6 border-t border-white/10">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Format</span>
                                        <span className="text-xs font-black bg-white/10 px-3 py-1 rounded-full text-indigo-100">Formal Response</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Word Count</span>
                                        <span className="text-xs font-black text-white">{writingTask.word_count || "200-250"} words</span>
                                    </div>
                                </div>

                                <div className="mt-8 p-4 bg-indigo-800/50 rounded-2xl border border-white/5">
                                    <p className="text-xs font-bold text-indigo-200 leading-relaxed italic text-center">
                                        "Listen carefully for points that are NOT mentioned in the Data File."
                                    </p>
                                </div>

                                {/* Data File Lock Status */}
                                <div className="mt-4 flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5 grayscale">
                                    <BookOpen className="text-indigo-400" size={20} />
                                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Data File Locked until Stage 2</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Structured Notetaking Sheet */}
                    <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 min-h-[600px] flex flex-col">
                        <div className="flex items-start justify-between mb-10 pb-6 border-b border-slate-50">
                            <div>
                                <h3 className="text-2xl font-black text-slate-800 mb-2 flex items-center gap-3">
                                    <Layers className="text-rose-600" />
                                    Rough Notetaking Sheet
                                </h3>
                                <p className="text-slate-500 font-medium">Capture points mentioned in the planning meeting.</p>
                            </div>
                            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-3">
                                <div className="text-xs font-black text-slate-500 uppercase tracking-widest leading-none">
                                    Mode: <span className="text-slate-800">{level === 'B1' ? 'B1 (Standard)' : 'B2 (Elite)'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 space-y-10">
                            {notetakingFields.map((field) => (
                                <div key={field.id} className="group">
                                    <label className="block text-sm font-black text-slate-400 uppercase tracking-widest mb-3 group-focus-within:text-rose-600 transition-colors">
                                        {field.label}
                                    </label>
                                    <textarea
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] p-6 text-slate-800 font-bold focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all placeholder:text-slate-300 min-h-[140px] resize-none"
                                        placeholder={field.placeholder || "Enter notes..."}
                                        value={notes[field.id] || ""}
                                        onChange={(e) => handleNoteChange(field.id, e.target.value)}
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="mt-12 pt-10 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4 text-slate-400">
                                <AlertCircle size={20} />
                                <p className="text-sm font-bold max-w-md italic">Once audio finishes, your notes will move to the side-drawer for Task 5-7 synthesis.</p>
                            </div>
                            <button
                                onClick={handleSwitchStage}
                                className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-black hover:bg-black transition-all flex items-center gap-3 shadow-xl hover:scale-105 active:scale-95"
                            >
                                Proceed to Synthesis Stage <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // STAGE 2: SYNTHESIS (Tiled Three-Column Layout)
    return (
        <div className="fixed inset-0 top-0 lg:top-16 bg-slate-50 flex overflow-hidden animate-in fade-in duration-500">
            {/* Column 1: Official Data File (Fixed Width) */}
            <div className="w-[350px] lg:w-[450px] flex flex-col h-full border-r border-slate-200 bg-white shrink-0">
                <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <BookOpen size={16} className="text-rose-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Official Data File</span>
                    </div>
                </div>

                {/* Vertical Tabs for Data File */}
                <div className="flex flex-col p-3 bg-slate-100 gap-2 border-b border-slate-200">
                    {dataFile.map((doc, idx) => (
                        <button
                            key={doc.id}
                            onClick={() => setActiveDoc(idx)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all border-2
                                ${activeDoc === idx
                                    ? 'bg-rose-600 text-white border-rose-600 shadow-md'
                                    : 'bg-white text-slate-500 border-slate-200 hover:border-rose-200'
                                }`}
                        >
                            {React.createElement(getDocIcon(doc.type), { size: 14, className: activeDoc === idx ? 'text-white' : 'text-slate-400' })}
                            <span className="text-[10px] font-black uppercase tracking-tight truncate">{doc.title}</span>
                        </button>
                    ))}
                </div>

                {/* Document Content Panel */}
                <div className="flex-1 overflow-y-auto p-8 bg-white selection:bg-rose-100">
                    <div className="prose prose-sm prose-slate max-w-none">
                        <h2 className="text-xl font-black text-slate-900 mb-6 border-b-2 border-rose-100 pb-3 uppercase tracking-tight">
                            {dataFile[activeDoc]?.title}
                        </h2>
                        <div 
                            className="text-slate-700 font-bold leading-relaxed space-y-4" 
                            dangerouslySetInnerHTML={{ __html: dataFile[activeDoc]?.content }} 
                        />
                    </div>
                </div>
            </div>

            {/* Column 2: Question-Answer Book (Main Editor) */}
            <div className="flex-1 flex flex-col h-full bg-slate-50 border-r border-slate-200">
                <div className="p-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <PenTool size={16} className="text-indigo-600" />
                        <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Question-Answer Book</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        {/* Static Word Count Pill */}
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-900 border border-indigo-400/30 rounded-lg shadow-sm">
                            <PenTool size={12} className="text-indigo-300" />
                            <div className="flex flex-col items-start leading-none">
                                <span className="text-[7px] font-black text-indigo-300 uppercase tracking-widest mb-0.5">Words</span>
                                <span className="text-xs font-black text-white tabular-nums">
                                    {draftText.split(/\s+/).filter(x => x.length > 0).length}
                                </span>
                            </div>
                        </div>

                        {/* Digital Examination Timer */}
                        <div className="flex items-center gap-3 px-4 py-2 bg-slate-900 rounded-xl border border-white/10 shadow-lg">
                            <Clock size={14} className="text-amber-500" />
                            <span className={`text-xl font-black tabular-nums tracking-tight ${timeLeft < 300 ? 'text-rose-500 animate-pulse' : 'text-white'}`}>
                                {formatTime(timeLeft)}
                            </span>
                        </div>
                        <button 
                            onClick={() => setShowNotesSidebar(!showNotesSidebar)}
                            className={`p-2 rounded-lg transition-colors ${showNotesSidebar ? 'bg-indigo-600 text-white' : 'bg-white text-slate-400 hover:bg-slate-100 shadow-sm border border-slate-200'}`}
                            title={showNotesSidebar ? "Hide Notes" : "Show Audio Notes"}
                        >
                            <Sidebar size={20} />
                        </button>
                    </div>
                </div>

                {/* Prominent Instruction Strip */}
                <div className="px-6 py-4 bg-indigo-900 text-white flex items-center gap-6">
                    <div className="bg-white/10 p-2.5 rounded-xl shrink-0">
                        <PenTool size={18} className="text-indigo-300" />
                    </div>
                    <p className="text-sm font-black uppercase tracking-wide leading-snug">
                        {writingTask.instruction}
                    </p>
                    <div className="ml-auto shrink-0 flex gap-3">
                        <span className="text-[10px] font-black bg-white/10 px-4 py-2 rounded-xl uppercase italic border border-white/10">
                           Target: {writingTask.word_count || "200"} words
                        </span>
                    </div>
                </div>

                {/* Editor Surface */}
                <div className="flex-1 p-6 relative flex flex-col overflow-hidden">
                    <textarea
                        className="flex-1 w-full bg-white rounded-3xl p-10 text-slate-800 font-bold text-lg leading-relaxed shadow-inner border-2 border-slate-100 focus:outline-none focus:border-indigo-500 transition-colors resize-none placeholder:text-slate-200"
                        placeholder="Synthesize points from audio notes and data file here..."
                        value={draftText}
                        onChange={(e) => setDraftText(e.target.value)}
                    />
                </div>

                {/* Footer Submit */}
                <div className="p-6 bg-white border-t border-slate-200 flex justify-end">
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || draftText.length < 50}
                        className={`px-12 py-5 rounded-2xl font-black text-lg transition-all flex items-center gap-3 shadow-2xl
                            ${draftText.length >= 50 
                                ? 'bg-slate-900 text-white hover:bg-black hover:scale-105 active:scale-95' 
                                : 'bg-slate-100 text-slate-300 shadow-none cursor-not-allowed'}
                        `}
                    >
                        {isSubmitting ? (
                            <Loader2 size={24} className="animate-spin" />
                        ) : (
                            <><Send size={20} /> Submit Final Response</>
                        )}
                    </button>
                </div>
            </div>

            {/* Column 3: My Audio Notes (Tiled) */}
            {showNotesSidebar && (
                <div className="w-[280px] lg:w-[320px] bg-slate-50 border-l border-slate-200 flex flex-col h-full animate-in slide-in-from-right duration-300 shrink-0">
                    <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <MessageSquare size={16} className="text-rose-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest">My Audio Notes</span>
                        </div>
                        <button onClick={() => setShowNotesSidebar(false)} className="hover:text-rose-400 transition-colors">
                            <X size={16} />
                        </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50">
                        {notetakingFields.map(field => (
                            <div key={field.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
                                <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-rose-500 rounded-full"></div>
                                    {field.label}
                                </h5>
                                <p className="text-xs font-bold text-slate-800 leading-relaxed italic border-l-2 border-slate-100 pl-3">
                                    {notes[field.id] || "No recording data captured."}
                                </p>
                            </div>
                        ))}
                        
                        <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                           <div className="flex items-center gap-2 mb-2">
                               <AlertCircle size={14} className="text-indigo-600" />
                               <span className="text-[9px] font-black text-indigo-900 uppercase">Pro Tip</span>
                           </div>
                           <p className="text-[10px] font-bold text-indigo-800 leading-tight">
                               Reference these notes AND cross-check with the Data File to maximize Marks.
                           </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IntegratedSimulationBoard;
