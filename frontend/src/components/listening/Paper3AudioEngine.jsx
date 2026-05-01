import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { Play, Loader2, Headphones, Volume2, Timer, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { speak, stopAll } from '../../utils/ttsService';

const Paper3AudioEngine = forwardRef(({ script, phase, onPhaseChange, onTaskChange, onSectionChange, onTidyingStart, onTidyingEnd, onStudyStart, onComplete, onRequireSelection, onCountdownTick, onStatusChange, initialIndex = 0, initialPause = null, onIndexChange }, ref) => {
    const { user } = useAuth();

    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [isPlaying, setIsPlaying] = useState(initialIndex > 0 || ['PART_A', 'PART_B_AUDIO', 'TRANSITION'].includes(phase));
    const [isWaitingForSelection, setIsWaitingForSelection] = useState(phase === 'B1B2_GATE');
    
    // Developer Shortcut: Skip to end of Part A
    useImperativeHandle(ref, () => ({
        fastForwardToPartAEnd: () => {
            const targetIndex = script.findIndex(item => item.text?.toLowerCase().includes("end of part a"));
            if (targetIndex !== -1) {
                console.log(`[AudioEngine] Fast-forwarding to Part A end (Index ${targetIndex})`);
                
                // 1. STOP all current audio/speech immediately
                try {
                    stopAll();
                    if (audioRef.current) {
                        audioRef.current.pause();
                        audioRef.current.src = "";
                    }
                } catch (e) {}

                // 2. CLEAR all countdowns/wait states
                setPauseCountdown(null);
                setPrepCountdown(null);
                setIsWaitingForSelection(false);
                
                // 3. JUMP to index and SYNC with parent
                lastProcessedIndex.current = -1; // Force re-process of this index
                setCurrentIndex(targetIndex);
                onIndexChange?.(targetIndex);
                
                // 4. ENSURE we are in playback mode
                setIsPlaying(true);
            }
        },
        resumeAfterSelection: () => {
            // STOP current audio immediately
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = "";
                audioRef.current = null;
                audioRef.current = null;
            }
            setIsWaitingForSelection(false);
            setIsPlaying(true);
            let nextIndex = currentIndex + 1;
            // Skip any immediately following pauses if they are just study/tidying pauses
            while (nextIndex < script.length && script[nextIndex].text?.match(/\(\d+-(second|minute) pause\)/)) {
                nextIndex++;
            }
            setCurrentIndex(nextIndex);
            onIndexChange?.(nextIndex);
        },
        stop: () => {
            console.log("[AudioEngine] Stopping all audio and clearing queues.");
            setIsPlaying(false);
            try {
                stopAll();
                if (audioRef.current) {
                    audioRef.current.pause();
                    audioRef.current.src = "";
                }
            } catch (e) {}
        }
    }));
    const [isEngineBuffering, setIsEngineBuffering] = useState(false);
    const [pauseCountdown, setPauseCountdown] = useState(['PART_A', 'PART_B_AUDIO', 'INDEPENDENT'].includes(phase) ? initialPause : null);
    const [prepCountdown, setPrepCountdown] = useState(phase === 'PREPARATION' ? initialPause : null);
    const audioRef = useRef(null);
    const prefetchQueue = useRef(new Map()); // Map: index -> audioBase64
    const hasPlayedPrep = useRef(false);
    const lastScriptRef = useRef(null);
    const lastProcessedIndex = useRef(-1);
    const lastTaskNumber = useRef(1);
    const isInitialResume = useRef(initialPause > 0);

    // Cleanup on unmount
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
            stopAll();
        };
    }, []);


    // Initial Resume Logic (if starting from a pause)
    useEffect(() => {
        if (initialPause && initialPause > 0 && isPlaying) {
            setPauseCountdown(initialPause);
        }
    }, [initialPause]);

    // Reset on script change
    useEffect(() => {
        if (script && script.length > 0 && script !== lastScriptRef.current) {
            setCurrentIndex(initialIndex);
            prefetchQueue.current.clear();
            lastScriptRef.current = script;
        }
    }, [script, initialIndex]);

    // Preparation Countdown Management
    useEffect(() => {
        if (phase !== 'PREPARATION' && hasPlayedPrep.current) {
            hasPlayedPrep.current = false;
        }

        let timer;
        if (!isPlaying && phase === 'PREPARATION' && prepCountdown === null && !hasPlayedPrep.current) {
            hasPlayedPrep.current = true;
            // Only set 5 mins if we don't have a restored timer
            const isFreshStart = !initialPause || initialPause >= 300;
            const startSecs = (initialPause && initialPause > 0) ? initialPause : 300;
            setPrepCountdown(startSecs);
            
            if (isFreshStart) {
                // Small delay to ensure audio context is ready after user click
                setTimeout(() => {
                    playSpeech("You now have 5 minutes to study the Question-Answer Book. You will hear a signal to start Part A.");
                }, 1000);
            }
        }

        if (!isPlaying && phase === 'PREPARATION' && prepCountdown > 0) {
            timer = setInterval(() => {
                setPrepCountdown(prev => {
                    const next = prev > 0 ? prev - 1 : 0;
                    onCountdownTick?.(next);
                    if (next === 0) handleStart();
                    return next;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isPlaying, phase, prepCountdown === null, onCountdownTick, initialPause]);

    // PRE-FETCHING REMOVED (Ensuring Zero API Cost)

    // MAIN EXECUTION LOOP
    useEffect(() => {
        if (!isPlaying || isWaitingForSelection) {
            lastProcessedIndex.current = -1; // Reset so it can re-trigger on resume
            return;
        }
        
        if (currentIndex >= script.length) {
            onComplete?.();
            return;
        }

        // Prevent multiple simultaneous processing loops for the same index
        if (lastProcessedIndex.current === currentIndex) return;
        lastProcessedIndex.current = currentIndex;
        
        const processItem = async () => {
            const myIndex = currentIndex;
            const item = script[currentIndex];
            
            // Clean text (remove pause marker from spoken text)
            const spokenText = item.text.replace(/\(\d+-(second|minute) pause\)/g, '').trim();
            const pauseMatch = item.text.match(/\((\d+)-second pause/);
            const minutePauseMatch = item.text.match(/\((\d+)-minute pause/);
            const pauseSeconds = pauseMatch ? parseInt(pauseMatch[1]) : (minutePauseMatch ? parseInt(minutePauseMatch[1]) * 60 : 0);
            const isTidying = item.text.toLowerCase().includes('tidy up');

            // Detect Task Changes
            if (item.text.toLowerCase().includes('task')) {
                const taskMatch = item.text.match(/task\s+(\d+)/i);
                if (taskMatch) {
                    lastTaskNumber.current = parseInt(taskMatch[1]);
                    onTaskChange?.(lastTaskNumber.current);
                }
            }
            const currentTask = lastTaskNumber.current;

            // Detect Section Changes (Part A -> Part B transition)
            if (phase === 'PART_B_AUDIO' && (item.text.toLowerCase().includes('integrated skills') || item.text.toLowerCase().includes('part b'))) {
                onSectionChange?.('B');
            }

            // Phase 1: Play Speech (if text exists and NOT resuming from a mid-item pause)
            if (spokenText && spokenText.length > 1 && !isInitialResume.current) {
                await playSpeech(spokenText, item.speaker);
                // IF INDEX CHANGED DURING SPEECH, ABORT THIS LOOP
                if (currentIndex !== myIndex) return;
            }

            // Phase 2: Handle Pause (if exists)
            if (pauseSeconds > 0) {
                if (isTidying) {
                    // Find the last mentioned task to tidy
                    const taskMatch = script.slice(0, currentIndex + 1)
                        .reverse()
                        .find(s => s.text.toLowerCase().includes('task'))
                        ?.text.match(/task\s+(\d+)/i);
                    const tidyingTaskNum = taskMatch ? parseInt(taskMatch[1]) : 1;
                    onTidyingStart?.(pauseSeconds, tidyingTaskNum);
                } else if (item.text.toLowerCase().includes('study')) {
                    onStudyStart?.(pauseSeconds, currentTask);
                }

                // If we are resuming, use the initialPause for the first pause we encounter
                const actualPause = isInitialResume.current ? initialPause : pauseSeconds;
                isInitialResume.current = false;
                setPauseCountdown(actualPause);
                
                const timer = setInterval(() => {
                    // IF INDEX CHANGED DURING PAUSE, ABORT TIMER
                    if (currentIndex !== myIndex) {
                        clearInterval(timer);
                        return;
                    }



                    setPauseCountdown(prev => {
                        const next = prev > 0 ? prev - 1 : 0;
                        onCountdownTick?.(next);
                        if (next === 0) {
                            clearInterval(timer);
                            if (isTidying) onTidyingEnd?.();
                            
                            // CHECK IF THIS WAS THE PART B PREP PAUSE
                            const isPartBPrep = item.text.toLowerCase().includes('study the part b');
                            if (isPartBPrep) {
                                setIsWaitingForSelection(true);
                                onRequireSelection?.();
                            } else {
                                const nextIdx = currentIndex + 1;
                                setCurrentIndex(nextIdx);
                                onIndexChange?.(nextIdx);
                            }
                            return null;
                        }
                        return next;
                    });
                }, 1000);
            } else {
                // No pause, move to next immediately if index hasn't changed
                if (currentIndex === myIndex) {
                    const nextIdx = currentIndex + 1;
                    setCurrentIndex(nextIdx);
                    onIndexChange?.(nextIdx);
                }
            }
        };

        processItem();
    }, [currentIndex, isPlaying]);

    useEffect(() => {
        onStatusChange?.({ 
            isEngineBuffering: Boolean(isEngineBuffering), 
            isPlaying: Boolean(isPlaying), 
            pauseCountdown 
        });
    }, [isEngineBuffering, isPlaying, pauseCountdown, onStatusChange]);

    const currentRequestIdRef = useRef(0);

    const playSpeech = (text, speakerName) => {
        return new Promise((resolve) => {
            speak({
                text,
                speakerName,
                onEnd: resolve,
                rate: 0.95,
                useBrowserOnly: true // Ensure local browser TTS for Paper 3
            });
        });
    };

    const handleStart = () => {
        setIsPlaying(true);
        setPrepCountdown(null);
        onPhaseChange?.('PART_A');
        onSectionChange?.('A');
        onIndexChange?.(0);
    };


    return (
        <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl border-b-[8px] border-indigo-500 relative overflow-hidden group">
            {/* Background Animation for Live State */}
            {isPlaying && !pauseCountdown && (
                <div className="absolute inset-0 bg-indigo-600/5 animate-pulse" />
            )}

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className={`p-4 rounded-2xl ${isPlaying ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500'}`}>
                            <Headphones size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Status</p>
                            <h4 className="text-xl font-black uppercase tracking-tight">
                                {isEngineBuffering ? 'Receiving Signal...' : 
                                 pauseCountdown ? 'Station Silence' : 
                                 isPlaying ? 'Live Broadcast' : 'System Ready'}
                            </h4>
                        </div>
                    </div>
                    {isPlaying && (
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-colors duration-500 ${pauseCountdown ? 'bg-rose-500/20 text-rose-500 border-rose-500/30' : 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30'}`}>
                            <div className={`w-2 h-2 rounded-full animate-pulse ${pauseCountdown ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                            <span className="text-[10px] font-black uppercase tracking-widest">{pauseCountdown ? 'Pause' : 'On Air'}</span>
                        </div>
                    )}
                </div>

                {prepCountdown !== null && !isPlaying ? (
                    <div className="flex flex-col items-center justify-center py-6 bg-slate-800/50 rounded-3xl border border-indigo-500/30 mb-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Clock size={20} className="text-indigo-400" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Preparation Time</span>
                        </div>
                        <div className="text-6xl font-black tabular-nums text-white tracking-tighter">
                            {Math.floor(prepCountdown / 60)}:{(prepCountdown % 60).toString().padStart(2, '0')}
                        </div>

                        {/* Developer Fast-Forward (Hidden for general users) */}
                        {user?.email === 'fungtam@gmail.com' && (
                            <button 
                                onClick={() => setPrepCountdown(3)}
                                className="mt-4 px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-indigo-500/20"
                            >
                                Fast Forward (3s)
                            </button>
                        )}
                    </div>
                ) : pauseCountdown ? (
                    <div className="flex flex-col items-center justify-center py-6 bg-slate-800/50 rounded-3xl border border-slate-700">
                        <div className="flex items-center gap-3 mb-2">
                            <Timer size={20} className="text-indigo-400" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Silent Reading / Tidying</span>
                        </div>
                        <div className="text-6xl font-black tabular-nums text-indigo-400 tracking-tighter">
                            {Math.floor(pauseCountdown / 60)}:{(pauseCountdown % 60).toString().padStart(2, '0')}
                        </div>

                        {/* Developer Fast-Forward */}
                        {user?.email === 'fungtam@gmail.com' && (
                            <button 
                                onClick={() => setPauseCountdown(3)}
                                className="mt-4 px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-indigo-500/20"
                            >
                                Fast Forward (3s)
                            </button>
                        )}
                    </div>
                ) : !isPlaying ? (

                    <button 
                        onClick={handleStart}
                        className="w-full py-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-900/40 transition-all active:scale-95 flex items-center justify-center gap-4"
                    >
                        <Play size={24} fill="currentColor" /> Start Broadcast
                    </button>
                ) : (
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center gap-6 py-8 px-10 bg-white/5 rounded-[2rem] border border-white/5">
                            <Volume2 size={32} className="text-indigo-400 shrink-0" />
                            <div className="flex-1">
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Now Playing</p>
                                <p className="text-sm font-medium text-slate-300 italic leading-relaxed line-clamp-2">
                                    "{script[currentIndex]?.text}"
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-center justify-between px-4">
                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Progress</span>
                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{currentIndex + 1} / {script.length}</span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden p-0.5">
                            <motion.div 
                                className="h-full bg-indigo-500 rounded-full" 
                                initial={{ width: 0 }}
                                animate={{ width: `${((currentIndex + 1) / script.length) * 100}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between text-[9px] font-black text-slate-600 uppercase tracking-widest">
                <span>HKEAA 2026 Simulation</span>
                <span>One-Play Protocol Enabled</span>
            </div>
        </div>
    );
});

export default Paper3AudioEngine;
