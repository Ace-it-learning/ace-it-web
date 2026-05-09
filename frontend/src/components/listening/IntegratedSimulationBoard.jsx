import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { 
    Play, Pause, FileText, Headphones, Mail, 
    Clock, Image, Globe, ChevronRight, PenTool, 
    BookOpen, CheckCircle, Sidebar, AlertCircle, 
    MessageSquare, Send, X, Layers, Zap, Loader2,
    Timer, Trash2, Palette, Edit3
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { GradingOverlay } from '../shared';
import AudioWaveform from '../utils/AudioWaveform';
import { isCheatEnabled } from '../../utils/devAccess';

const IntegratedSimulationBoard = ({ questData, level, onComplete }) => {
    const { user, profile } = useAuth();
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
    
    // Highlighting State
    const [localDocs, setLocalDocs] = useState({}); // i -> html string
    const [isHighlightMode, setIsHighlightMode] = useState(true);
    const [activeColor, setActiveColor] = useState('rgba(254, 240, 212, 0.6)');
    
    const colors = [
        'rgba(254, 240, 212, 0.6)', // Yellow
        'rgba(219, 234, 254, 0.6)', // Blue
        'rgba(220, 252, 231, 0.6)', // Green
        'rgba(254, 226, 226, 0.6)', // Red
    ];

    // Global Timer: Unified 60-minute Integrated Simulation (HKEAA Standard)
    const totalTime = 60 * 60;
    const [timeLeft, setTimeLeft] = useState(totalTime);
    const [showCheatMenu, setShowCheatMenu] = useState(false);
    const [isCheating, setIsCheating] = useState(false);
    const cheatBtnRef = useRef(null);
    const [cheatMenuFixed, setCheatMenuFixed] = useState({ top: 0, right: 0 });

    useLayoutEffect(() => {
        if (!showCheatMenu || !cheatBtnRef.current) return;
        const placeMenu = () => {
            const el = cheatBtnRef.current;
            if (!el) return;
            const rect = el.getBoundingClientRect();
            const gap = 8;
            setCheatMenuFixed({
                top: rect.bottom + gap,
                right: Math.max(8, window.innerWidth - rect.right)
            });
        };
        placeMenu();
        window.addEventListener('resize', placeMenu);
        window.addEventListener('scroll', placeMenu, true);
        return () => {
            window.removeEventListener('resize', placeMenu);
            window.removeEventListener('scroll', placeMenu, true);
        };
    }, [showCheatMenu]);
    
    // Derived Data (Moved up to avoid TDZ errors in useEffect)
    const integratedData = questData?.integrated_data || {};
    const notetakingFields = integratedData.notetaking_fields || [];
    const dataFile = integratedData.data_file || [];
    const writingTask = integratedData.writing_task || {};

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

    useEffect(() => {
        if (!showCheatMenu) return;
        const close = (e) => {
            if (!e.target.closest?.('.integrated-cheat-menu')) setShowCheatMenu(false);
        };
        document.addEventListener('mousedown', close);
        return () => document.removeEventListener('mousedown', close);
    }, [showCheatMenu]);

    // Initialize localDocs from dataFile
    useEffect(() => {
        if (dataFile && dataFile.length > 0 && Object.keys(localDocs).length === 0) {
            const initial = {};
            dataFile.forEach((doc, i) => {
                initial[i] = doc.content
                    ?.replace(/\\n/g, '\n')
                    .replace(/\n/g, '<br />') || '';
            });
            setLocalDocs(initial);
        }
    }, [dataFile]);

    // Highlighting Logic
    useEffect(() => {
        const handleGlobalMouseUp = (e) => {
            if (!isHighlightMode) return;
            
            const selection = window.getSelection();
            if (!selection || selection.isCollapsed || selection.rangeCount === 0) return;

            const range = selection.getRangeAt(0);
            const container = document.getElementById(`doc-content-${activeDoc}`);
            
            if (container && container.contains(range.commonAncestorContainer)) {
                try {
                    const selectedText = selection.toString().trim();
                    if (selectedText.length === 0) return;

                    const span = document.createElement('span');
                    span.className = 'highlight-span transition-colors duration-200';
                    span.style.backgroundColor = activeColor;
                    span.dataset.color = activeColor;
                    
                    try {
                        range.surroundContents(span);
                    } catch (surroundErr) {
                        const fragment = range.extractContents();
                        span.appendChild(fragment);
                        range.insertNode(span);
                    }

                    setTimeout(() => {
                        const updatedHTML = container.innerHTML;
                        setLocalDocs(prev => ({
                            ...prev,
                            [activeDoc]: updatedHTML
                        }));
                        selection.removeAllRanges();
                    }, 50);
                    
                } catch (err) {
                    console.error("Highlighting process failed:", err);
                }
            }
        };

        document.addEventListener('mouseup', handleGlobalMouseUp);
        return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
    }, [isHighlightMode, activeDoc, activeColor, localDocs]);

    const clearHighlights = () => {
        const container = document.getElementById(`doc-content-${activeDoc}`);
        if (container) {
            const highlights = container.querySelectorAll('.highlight-span');
            highlights.forEach(h => {
                const parent = h.parentNode;
                if (parent) {
                    while (h.firstChild) {
                        parent.insertBefore(h.firstChild, h);
                    }
                    parent.removeChild(h);
                }
            });

            const allSpans = container.querySelectorAll('span[style*="background-color"]');
            allSpans.forEach(s => {
                const parent = s.parentNode;
                if (parent) {
                    while (s.firstChild) {
                        parent.insertBefore(s.firstChild, s);
                    }
                    parent.removeChild(s);
                }
            });
            
            const cleanedHTML = container.innerHTML;
            setLocalDocs(prev => ({
                ...prev,
                [activeDoc]: cleanedHTML
            }));
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Lightweight non-overlapping ambience cue for stage directions like
    // "[Sound of chairs moving and papers shuffling]".
    const playSoundscapeCue = (durationMs = 1100) => {
        return new Promise((resolve) => {
            try {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                if (!AudioCtx) return resolve();
                const ctx = new AudioCtx();
                const sampleRate = ctx.sampleRate;
                const frameCount = Math.floor(sampleRate * (durationMs / 1000));
                const buffer = ctx.createBuffer(1, frameCount, sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < frameCount; i++) {
                    data[i] = (Math.random() * 2 - 1) * 0.07; // low-volume rustle
                }

                const source = ctx.createBufferSource();
                source.buffer = buffer;
                const filter = ctx.createBiquadFilter();
                filter.type = 'bandpass';
                filter.frequency.value = 1200;
                filter.Q.value = 0.8;

                const gain = ctx.createGain();
                gain.gain.setValueAtTime(0.0001, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.08);
                gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + Math.max(0.2, durationMs / 1000));

                source.connect(filter);
                filter.connect(gain);
                gain.connect(ctx.destination);

                source.onended = async () => {
                    try { await ctx.close(); } catch { /* noop */ }
                    resolve();
                };
                source.start();
                source.stop(ctx.currentTime + durationMs / 1000);
            } catch {
                resolve();
            }
        });
    };


    // Cleanup audio on unmount
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.onended = null;
                audioRef.current.onerror = null;
                audioRef.current.src = "";
                audioRef.current.load();
                audioRef.current = null;
            }
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);


    const normalizeCheatDraft = (text) => {
        if (!text || typeof text !== 'string') return '';
        return text
            .replace(/\*\*/g, '')
            .replace(/^\s*[-*]\s+/gm, '')
            .replace(/\r\n/g, '\n')
            .replace(/\n{3,}/g, '\n\n')
            .trim();
    };

    const handleCheat = async (targetLvl = "5**") => {
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
                    level: targetLvl,
                    prompt: `
                        MISSION TITLE: ${questData.title}
                        INSTRUCTION: ${writingTask.instruction}
                        DSE FORMAT: ${writingTask.format || 'Formal Report'}
                        CONTENT POINTS TO INCLUDE: ${points.join('; ')}
                        DATA FILE REF: ${JSON.stringify(integratedData.data_file)}
                        OUTPUT STYLE: Write a polished formal memo in plain text only. No markdown symbols, no **, no bullet markers.
                    `
                })
            });

            const data = await response.json();
            if (data.text) {
                setDraftText(normalizeCheatDraft(data.text));
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

    // TTS Logic (Forced Browser TTS)
    const handlePlayAudio = async () => {
        setHasStarted(true); // START TIMER
        setIsPlaying(true);
        try {
            const rawText = integratedData.audio_transcript || questData.audio_transcript || questData.listeningTranscript || "Starting Part B planning meeting audio briefing.";
            
            // Cleanup current
            if (window.speechSynthesis) window.speechSynthesis.cancel();

            const hasSoundscapeTag = /^\s*\[[^\]]*sound[^\]]*\]/im.test(rawText);
            if (hasSoundscapeTag) {
                await playSoundscapeCue(1100); // ends before spoken content starts
            }

            const text = rawText.replace(/\[.*?\]/g, '').trim();
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-GB';
            utterance.rate = 1.0;
            
            utterance.onend = () => {
                setIsPlaying(false);
            };

            utterance.onerror = (e) => {
                console.error("Browser TTS Error:", e);
                setIsPlaying(false);
            };

            window.speechSynthesis.speak(utterance);
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
            // [COST HARDENED] Pre-fetching backend audio removed as it is now redundant with Browser TTS
            let finalAudioSrc = currentAudioSrc || "browser_tts";

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
    const activeDocType = (dataFile[activeDoc]?.type || '').toLowerCase();
    const isPosterDoc = activeDocType === 'poster';
    const isProgramCardDoc = activeDocType === 'program_card';

    if (stage === 'LISTENING') {
        return (
            <div className="flex flex-col gap-8 animate-in fade-in duration-1000 pb-6">
                {/* Audio header — tightened to mirror Part A (DataSprintBoard) rhythm */}
                <div className="bg-slate-900 p-6 md:p-8 rounded-[2.5rem] shadow-xl flex flex-col gap-6 border-b-4 border-rose-600 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500 rounded-full blur-[100px] -mr-32 -mt-32 opacity-20" />
                    
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                        <div className="flex items-center gap-4 md:gap-6">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-700 shadow-xl ${isPlaying ? 'bg-rose-500 text-white animate-pulse shadow-rose-500/40 ring-2 ring-rose-500/20' : 'bg-slate-800 text-slate-400 border border-white/5'}`}>
                                <Headphones size={28} />
                            </div>
                            <div>
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <span className="bg-rose-600 text-white text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md shadow-md">Critical Briefing</span>
                                    <span className="text-rose-400/90 text-[10px] font-black uppercase tracking-widest">Stage 1: Planning Meeting</span>
                                </div>
                                <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-tight italic-none">Listening & Core Notetaking</h2>
                            </div>
                        </div>
                        
                        <div className="flex flex-wrap items-center justify-end gap-3">
                            {isCheatEnabled(user, profile) && (
                                <div className="relative integrated-cheat-menu">
                                    <button 
                                        ref={cheatBtnRef}
                                        type="button"
                                        onClick={() => !isCheating && setShowCheatMenu(!showCheatMenu)}
                                        disabled={isCheating}
                                        className={`flex items-center gap-2 px-4 py-3 bg-slate-800 text-amber-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all border border-amber-400/30 shadow-lg ${isCheating ? 'opacity-50 cursor-wait' : ''}`}
                                    >
                                        {isCheating ? (
                                            <><Loader2 size={16} className="animate-spin" /> Analyzing...</>
                                        ) : (
                                            <><Zap size={16} className="fill-current" /> Admin Sync</>
                                        )}
                                    </button>
                                    
                                    {showCheatMenu && (
                                        <div
                                            role="menu"
                                            className="fixed w-52 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden ring-1 ring-black/10 z-[100020] animate-in zoom-in duration-200"
                                            style={{ top: cheatMenuFixed.top, right: cheatMenuFixed.right }}
                                        >
                                            <div className="px-3 py-2 bg-slate-50 border-b border-slate-100">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Target Proficiency</span>
                                            </div>
                                            {['4', '5', '5**'].map((lvl) => (
                                                <button
                                                    type="button"
                                                    key={lvl}
                                                    role="menuitem"
                                                    onClick={() => handleCheat(lvl)}
                                                    className="w-full text-left px-4 py-3 text-[11px] font-black text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all uppercase tracking-widest flex items-center justify-between group"
                                                >
                                                    {lvl === '5**' ? 'Level 5**' : `Level ${lvl}`}
                                                    <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                            <button 
                                type="button"
                                onClick={handlePlayAudio}
                                disabled={isPlaying}
                                className={`px-8 py-4 rounded-2xl font-black text-base transition-all flex items-center gap-3 shadow-xl
                                    ${isPlaying ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-white/5' : 'bg-rose-600 text-white hover:bg-rose-500 hover:scale-[1.02] active:scale-95 shadow-rose-900/30'}
                                `}
                            >
                                {isPlaying ? 'Recording Stream Active' : <><Play size={22} className="fill-current shrink-0" /> Start Audio Feed</>}
                            </button>
                        </div>
                    </div>


                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                    {/* Persistent Sidebar: Timer & Mission Specs */}
                    <div className="lg:col-span-1 sticky top-24 flex flex-col gap-6 h-fit">
                        {/* Digital Exam Timer */}
                        <div className="bg-slate-900 rounded-[2rem] p-6 shadow-xl border-b-8 border-amber-500 text-white relative overflow-hidden group">
                            <div className="flex items-center gap-3 mb-4 relative z-10">
                                <Clock size={20} className="text-amber-500 shrink-0" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Simulation Time</span>
                            </div>
                            <div className={`text-4xl md:text-5xl font-black tabular-nums tracking-tighter mb-6 relative z-10 transition-colors duration-500 ${timeLeft < 300 ? 'text-rose-500 animate-pulse' : 'text-white'}`}>
                                {formatTime(timeLeft)}
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden relative z-10 shadow-inner">
                                <div 
                                    className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-1000 shadow-[0_0_25px_rgba(245,158,11,0.5)]" 
                                    style={{ width: `${(timeLeft / totalTime) * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* Mission Requirements Card */}
                        <div className="bg-indigo-900 text-white rounded-[2rem] p-6 shadow-xl border-l-8 border-indigo-400 relative overflow-hidden">
                            <div className="flex items-center gap-3 mb-5 relative z-10">
                                <div className="w-11 h-11 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/5 shadow-lg shrink-0">
                                    <PenTool size={22} className="text-indigo-300" />
                                </div>
                                <h3 className="text-base font-black tracking-tight uppercase leading-tight italic-none">Mission Specs</h3>
                            </div>
                            
                            <div className="space-y-5 relative z-10">
                                <div>
                                    <h4 className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em] mb-2">Operational Briefing</h4>
                                    <p className="text-sm font-bold leading-snug tracking-tight text-indigo-50/90">
                                        {writingTask.instruction}
                                    </p>
                                </div>
                                
                                <div className="pt-5 border-t border-white/10 grid grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Format</span>
                                        <span className="text-[10px] font-black bg-white/10 px-3 py-1 rounded-full text-indigo-50 border border-white/5 text-center">Formal</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Quota</span>
                                        <span className="text-[10px] font-black text-white px-1 py-1">{writingTask.word_count || "200-250"} words</span>
                                    </div>
                                </div>

                                <div className="mt-4 p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/5 shadow-inner">
                                    <p className="text-[11px] font-bold text-indigo-200 leading-relaxed italic text-center opacity-85">
                                        Capture auditory nuances today; synthesize with the data file tomorrow.
                                    </p>
                                </div>

                                <div className="mt-4 flex items-center gap-3 p-4 bg-black/20 rounded-xl border border-white/5 opacity-50 select-none grayscale cursor-not-allowed">
                                    <BookOpen className="text-indigo-400 shrink-0" size={20} />
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Document Database</span>
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Locked: Listening Phase</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Structured Notetaking Sheet */}
                    <div className="lg:col-span-2 bg-white rounded-[2rem] p-6 md:p-8 shadow-lg shadow-slate-900/5 border border-slate-100 min-h-[min(520px,70vh)] flex flex-col relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-48 h-48 bg-slate-50 rounded-full blur-[80px] -ml-24 -mt-24 opacity-80" />
                        
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8 pb-6 border-b border-slate-100 relative z-10">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 mb-2 flex items-center gap-3 tracking-tight italic-none">
                                    <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center shadow-sm shrink-0">
                                        <Layers size={20} />
                                    </div>
                                    Rough Notetaking Sheet
                                </h3>
                                <p className="text-slate-500 font-bold text-sm tracking-tight italic opacity-90 pl-1">Capture all points mentioned in the briefing.</p>
                            </div>
                            <div className="p-3 md:p-4 bg-slate-50 border border-slate-100 rounded-2xl shadow-sm flex items-center gap-3 shrink-0 self-start">
                                <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">
                                    Difficulty: <span className="text-indigo-600">{level === 'B1' ? 'B1 Standard' : 'B2 Elite'}</span>
                                </div>
                                <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${isPlaying ? 'bg-emerald-500 animate-pulse ring-2 ring-emerald-500/25' : 'bg-slate-200'}`} />
                            </div>
                        </div>

                        <div className="flex-1 space-y-8 relative z-10">
                            {notetakingFields.map((field) => (
                                <div key={field.id} className="group">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-1 h-5 bg-slate-200 group-focus-within:bg-rose-500 transition-colors rounded-full" />
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-focus-within:text-slate-800 transition-colors">
                                            {field.label}
                                        </label>
                                    </div>
                                    <textarea
                                        className="w-full bg-slate-50/80 border border-slate-100 rounded-2xl p-5 text-slate-800 font-bold text-sm leading-relaxed focus:outline-none focus:bg-white focus:ring-4 focus:ring-rose-500/10 focus:border-rose-400/40 transition-all placeholder:text-slate-300 min-h-[110px] resize-y shadow-inner"
                                        placeholder={field.placeholder || "Enter notes..."}
                                        value={notes[field.id] || ""}
                                        onChange={(e) => handleNoteChange(field.id, e.target.value)}
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="mt-10 pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                            <div className="flex items-center gap-3 text-slate-500 group">
                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-amber-50 group-hover:text-amber-600 transition-colors shrink-0">
                                    <AlertCircle size={20} />
                                </div>
                                <p className="text-xs font-bold max-w-md leading-snug italic opacity-90">Once audio finishes, your notes will move to the synthesis side-drawer.</p>
                            </div>
                            <button
                                type="button"
                                onClick={handleSwitchStage}
                                className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-base hover:bg-black transition-all flex items-center gap-3 shadow-lg hover:scale-[1.02] active:scale-95 group w-full md:w-auto justify-center"
                            >
                                Proceed to Synthesis
                                <div className="bg-white/10 p-1 rounded-md group-hover:bg-white/20 transition-colors">
                                    <ChevronRight size={18} />
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (stage === 'SYNTHESIS') {
        const panelHeightClass = 'h-[min(70vh,580px)]';
        return (
            <div className="flex flex-col gap-8 animate-in fade-in duration-1000 pb-8">
                <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-lg border border-slate-100 border-b-4 border-indigo-600 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500 rounded-full blur-[100px] -ml-40 -mt-40 opacity-[0.07]" />
                    
                    <div className="flex items-center gap-4 relative z-10 min-w-0">
                        <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-900/30 rotate-2 shrink-0">
                            <PenTool size={26} />
                        </div>
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                <span className="bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md shadow-md">Synthesis Mode</span>
                                <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Stage 2 · Writing</span>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight italic-none">Data Integration & Drafting</h2>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-3 relative z-10">
                        <div className="px-5 py-3 bg-slate-900 rounded-2xl shadow-lg border-l-4 border-amber-500 flex items-center gap-3 group shrink-0">
                            <Clock size={18} className="text-amber-500 shrink-0" />
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-0.5">Remaining</span>
                                <span className={`text-lg font-black tabular-nums tracking-tight leading-none ${timeLeft < 300 ? 'text-rose-500 animate-pulse' : 'text-white'}`}>
                                    {formatTime(timeLeft)}
                                </span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isSubmitting || draftText.length < 50}
                            className={`px-8 py-4 rounded-2xl font-black text-base transition-all flex items-center gap-3 shadow-lg relative
                                ${draftText.length >= 50 && !isSubmitting
                                    ? 'bg-slate-900 text-white hover:bg-black hover:scale-[1.02] active:scale-95 shadow-slate-900/30 overflow-hidden' 
                                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'}
                            `}
                        >
                            {isSubmitting ? (
                                <><Loader2 size={20} className="animate-spin" /> Digitizing...</>
                            ) : (
                                <>
                                    <Send size={20} className={draftText.length >= 50 ? 'animate-bounce shrink-0' : 'shrink-0'} /> 
                                    Finalize Simulation
                                    {draftText.length >= 50 && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_3s_infinite]" />}
                                </>
                            )}
                        </button>
                        
                        <button 
                            type="button"
                            onClick={() => setShowNotesSidebar(!showNotesSidebar)}
                            title="Toggle briefing notes"
                            className={`p-4 rounded-2xl transition-all border ${showNotesSidebar ? 'bg-indigo-600 text-white border-indigo-500 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:bg-indigo-50 hover:text-indigo-600'}`}
                        >
                            <MessageSquare size={22} />
                        </button>
                    </div>
                </div>

                <div className={`grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 flex-1`}>
                    {/* Left: Data file — compact tabs + panel height aligned with Part A density */}
                    <div className="lg:col-span-4 flex flex-col h-fit lg:sticky lg:top-24">
                        <div className="flex items-center gap-2 mb-3 ml-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.25em]">Data file</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-0.5 mb-px items-end relative z-10 px-1">
                            {dataFile.map((doc, idx) => (
                                <button
                                    type="button"
                                    key={idx}
                                    onClick={() => setActiveDoc(idx)}
                                    className={`px-3 py-2 text-[9px] font-black uppercase tracking-widest rounded-t-xl transition-all border-x border-t
                                        ${activeDoc === idx 
                                            ? 'bg-white border-slate-200 text-indigo-600 shadow-sm relative z-20 pb-3' 
                                            : 'bg-slate-100 border-transparent text-slate-400 hover:bg-slate-200 pb-1.5'}
                                    `}
                                >
                                    Doc {idx + 1}: {doc.type}
                                </button>
                            ))}
                        </div>

                        <div className={`bg-white rounded-[1.75rem] shadow-lg border border-slate-200/80 flex flex-col ${panelHeightClass} overflow-hidden relative group`}>
                             <div className="p-4 md:p-5 border-b border-slate-100 bg-slate-50/60 flex flex-wrap items-center justify-between gap-3 shrink-0">
                               <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-9 h-9 bg-white shadow-sm rounded-lg flex items-center justify-center text-indigo-600 shrink-0">
                                        {React.createElement(getDocIcon(dataFile[activeDoc]?.type), { size: 18 })}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-sm font-black text-slate-900 tracking-tight leading-tight truncate">{dataFile[activeDoc]?.title || `Document ${activeDoc + 1}`}</h3>
                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Ref #{activeDoc + 101}</span>
                                    </div>
                               </div>

                               {/* Highlighter Toolbar */}
                               <div className="flex items-center gap-3 bg-white/50 p-1.5 rounded-2xl border border-slate-100 shadow-inner">
                                   <button 
                                       onClick={() => setIsHighlightMode(!isHighlightMode)}
                                       className={`p-2.5 rounded-xl transition-all ${isHighlightMode ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-50 text-slate-400 hover:text-slate-600'}`}
                                       title={isHighlightMode ? "Disable Highlighter" : "Enable Highlighter"}
                                   >
                                       {isHighlightMode ? <Zap size={16} fill="currentColor" /> : <Edit3 size={16} />}
                                   </button>
                                   
                                   <div className="w-[1px] h-4 bg-slate-200 mx-1" />

                                   <div className="flex items-center gap-1.5">
                                       {colors.map(color => (
                                           <button 
                                               key={color}
                                               onClick={() => {
                                                   setActiveColor(color);
                                                   setIsHighlightMode(true);
                                               }}
                                               className={`w-6 h-6 rounded-lg border-2 transition-all hover:scale-110 active:scale-95 ${activeColor === color ? 'border-indigo-500 ring-4 ring-indigo-50' : 'border-white shadow-sm'}`}
                                               style={{ backgroundColor: color }}
                                           />
                                       ))}
                                   </div>

                                   <div className="w-[1px] h-4 bg-slate-200 mx-1" />

                                   <button 
                                       onClick={clearHighlights}
                                       className="p-2.5 bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500 rounded-xl transition-all"
                                       title="Clear all highlights"
                                   >
                                       <Trash2 size={16} />
                                   </button>
                               </div>
                            </div>

                            <div className={`flex-1 overflow-y-auto p-5 md:p-6 custom-scrollbar selection:bg-indigo-100 italic-none ${isPosterDoc ? 'bg-gradient-to-b from-amber-50/80 to-rose-50/40' : 'bg-white'}`}>
                                <div className={`max-w-none prose prose-sm ${isPosterDoc ? 'prose-amber prose-p:text-slate-800 prose-p:font-semibold' : 'prose-indigo prose-slate'}`}>
                                    <div className="flex items-center gap-2 mb-5 px-3 py-2 bg-indigo-50 border border-indigo-100 rounded-xl w-fit">
                                        <Zap size={12} className="text-indigo-400 shrink-0" />
                                        <span className="text-[9px] font-black text-indigo-900 uppercase tracking-widest">{isPosterDoc ? 'Public notice' : 'Archive'}</span>
                                    </div>
                                    {isProgramCardDoc ? (
                                        <div className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-white to-indigo-50 p-4 shadow-sm">
                                            <div className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">Program Card</div>
                                            {(String(dataFile[activeDoc]?.content || '')
                                                .replace(/\\n/g, '\n')
                                                .split('\n')
                                                .filter(Boolean)).map((line, idx) => {
                                                    const [k, ...rest] = line.split(':');
                                                    const hasPair = rest.length > 0;
                                                    return (
                                                        <div key={idx} className={`py-2 ${idx > 0 ? 'border-t border-indigo-100' : ''}`}>
                                                            {hasPair ? (
                                                                <div className="flex items-start justify-between gap-3">
                                                                    <span className="text-[11px] font-black uppercase tracking-wide text-slate-500">{k.trim()}</span>
                                                                    <span className="text-sm font-bold text-slate-800 text-right">{rest.join(':').trim()}</span>
                                                                </div>
                                                            ) : (
                                                                <div className="text-sm font-bold text-slate-800">{line}</div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    ) : (
                                        <div 
                                            id={`doc-content-${activeDoc}`}
                                            className={`leading-relaxed text-sm select-text ${isPosterDoc ? 'text-slate-900 font-bold tracking-wide' : 'text-slate-700 font-semibold'}`}
                                            dangerouslySetInnerHTML={{ __html: localDocs[activeDoc] || "" }}
                                        />
                                    )}
                                    {dataFile[activeDoc]?.type === 'INFOGRAPHIC' && (dataFile[activeDoc]?.imageUrl || dataFile[activeDoc]?.items) && (
                                        <div className="mt-8 p-5 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                            <div className="flex items-center gap-2 mb-4">
                                                <Image className="text-indigo-400" size={18} />
                                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Visual data</span>
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

                    <div className="lg:col-span-5 flex flex-col gap-3">
                        <div className="flex items-center gap-2 ml-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.25em]">Draft</span>
                        </div>

                        <div className={`bg-white rounded-[1.75rem] shadow-lg border-2 border-indigo-100/40 flex flex-col ${panelHeightClass} relative overflow-hidden`}>
                            <div className="p-4 md:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shadow-sm shrink-0">
                                        <PenTool size={18} />
                                    </div>
                                    <h3 className="text-sm font-black text-slate-900 tracking-tight italic-none uppercase truncate">Your response</h3>
                                </div>
                                <div className="text-right shrink-0">
                                        <div className={`text-[10px] font-black uppercase tracking-widest leading-none mb-1 ${draftText.length < 50 ? 'text-rose-500' : 'text-emerald-600'}`}>
                                            {draftText.split(/\s+/).filter(Boolean).length} words {level ? `· ${level}` : ''}
                                        </div>
                                        <div className="w-28 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full transition-all duration-700 ${draftText.length < 100 ? 'bg-amber-400' : 'bg-emerald-500'}`}
                                                style={{ width: `${Math.min(100, (draftText.length / 200) * 100)}%` }}
                                            />
                                        </div>
                                </div>
                            </div>

                            <textarea
                                className="flex-1 min-h-0 p-5 md:p-6 text-slate-800 font-semibold text-sm leading-relaxed focus:outline-none resize-none selection:bg-indigo-100 bg-[linear-gradient(transparent,transparent_27px,rgba(241,245,249,0.45)_27px)] bg-[length:100%_28px] custom-scrollbar"
                                placeholder="Begin synthesizing your response here..."
                                value={draftText}
                                onChange={(e) => setDraftText(e.target.value)}
                                spellCheck={false}
                            />
                        </div>
                    </div>

                    <div className={`lg:col-span-3 transition-all duration-500 flex flex-col gap-3 ${showNotesSidebar ? 'opacity-100 translate-x-0' : 'opacity-45 translate-x-1 grayscale-[0.2]'}`}>
                        <div className="flex items-center gap-2 ml-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.25em]">Briefing notes</span>
                        </div>

                        <div className={`bg-slate-900 rounded-[1.75rem] p-6 shadow-xl flex flex-col ${panelHeightClass} relative overflow-hidden text-white border border-white/10`}>
                            <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500 rounded-full blur-[80px] -mr-24 -mt-24 opacity-[0.12]" />
                            
                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10 relative z-10">
                                <div className="flex items-center gap-2 min-w-0">
                                    <div className="w-9 h-9 bg-rose-500/20 text-rose-300 rounded-lg flex items-center justify-center ring-1 ring-white/10 shrink-0">
                                        <MessageSquare size={17} />
                                    </div>
                                    <h3 className="font-black text-white tracking-tight text-sm italic-none truncate">Field notes</h3>
                                </div>
                                <button 
                                    type="button"
                                    onClick={() => setShowNotesSidebar(false)}
                                    className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all shrink-0"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="flex-1 min-h-0 overflow-y-auto space-y-6 custom-scrollbar pr-1 relative z-10">
                                {notetakingFields.map((field) => (
                                    <div key={field.id} className="relative group">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-1 h-2.5 bg-rose-500 rounded-full" />
                                            <label className="text-[9px] font-black text-rose-400/90 uppercase tracking-widest truncate">{field.label}</label>
                                        </div>
                                        <div className="bg-white/5 rounded-2xl p-4 border border-white/5 transition-colors group-hover:bg-white/[0.07]">
                                            <p className="text-xs font-semibold leading-relaxed text-slate-200 whitespace-pre-wrap">
                                                {notes[field.id] || "No data captured."}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 p-4 bg-indigo-600 rounded-2xl shadow-lg relative overflow-hidden shrink-0">
                               <div className="absolute top-0 right-0 p-4 text-white/5">
                                   <AlertCircle size={44} />
                               </div>
                               <h4 className="text-[9px] font-black uppercase tracking-widest text-indigo-200 mb-2 relative z-10">Synthesis tip</h4>
                               <p className="text-[11px] font-bold text-indigo-50 leading-snug relative z-10">
                                   Merge briefing points with data-file evidence for a coherent answer.
                               </p>
                            </div>
                        </div>
                </div>
            </div>
            {/* AI Grading Overlay */}
                <GradingOverlay 
                    isOpen={isSubmitting} 
                    title="Digitizing & Evaluating"
                    status="Synthesizing your notes and data file evidence..."
                />
            </div>
        );
    }

};

export default IntegratedSimulationBoard;
