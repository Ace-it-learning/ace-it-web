import React, { useState, useEffect, useRef } from 'react';
import { PenTool, Play, Pause, AlertTriangle, FastForward } from 'lucide-react';

const LiveListenStep = ({ script, audioSegments, prediction, onComplete }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [notes, setNotes] = useState("");
    const [speedWarning, setSpeedWarning] = useState(false);
    const lastNoteTime = useRef(Date.now());
    const [progress, setProgress] = useState(0);

    // Audio State
    const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
    const audioRef = useRef(null);
    const [currentSpeaker, setCurrentSpeaker] = useState(null);

    // Local segments state (from props OR parsed script)
    const [segments, setSegments] = useState([]);

    // Initialize segments
    useEffect(() => {
        if (audioSegments && audioSegments.length > 0) {
            setSegments(audioSegments);
        } else if (script) {
            // Parse script into segments
            // Format: "Speaker: Text" or just "Text" chunks
            const lines = script.split(/\n+/).filter(line => line.trim().length > 0);
            const parsed = lines.map((line, idx) => {
                const match = line.match(/^([^:]+):\s*(.*)/);
                return {
                    id: idx,
                    speaker: match ? match[1].trim() : "Narrator",
                    text: match ? match[2].trim() : line.trim(),
                    audio: null // No pre-recorded audio
                };
            });
            setSegments(parsed);
        }
    }, [script, audioSegments]);

    // Cleanup TTS on unmount
    useEffect(() => {
        return () => {
            window.speechSynthesis.cancel();
        };
    }, []);

    // Effect: Handle Sequential Playback
    useEffect(() => {
        if (!segments || segments.length === 0) return;

        if (isPlaying) {
            playSegment(currentSegmentIndex);
        } else {
            if (audioRef.current) {
                audioRef.current.pause();
            }
            window.speechSynthesis.pause();
        }

        return () => {
            // Don't cancel here or it stops between segments in React 18 strict mode
            // We handle pause via isPlaying check
        };
    }, [isPlaying, segments]); // Add segments as dependency

    const playSegment = (index) => {
        if (!segments || index >= segments.length) {
            setIsPlaying(false);
            setProgress(100);
            return;
        }

        const segment = segments[index];
        setCurrentSpeaker(segment.speaker);

        // If audio exists, play it
        if (segment.audio) {
            window.speechSynthesis.cancel(); // Stop any overlapping TTS
            if (audioRef.current) audioRef.current.pause();

            const audio = new Audio(`data:audio/mp3;base64,${segment.audio}`);
            audioRef.current = audio;

            const stepSize = 100 / segments.length;
            const baseProgress = index * stepSize;

            audio.ontimeupdate = () => {
                const segProgress = (audio.currentTime / audio.duration) * stepSize;
                setProgress(Math.min(100, baseProgress + segProgress));
            };

            audio.onended = () => {
                setCurrentSegmentIndex(prev => prev + 1);
                playSegment(index + 1);
            };

            audio.play().catch(e => console.error("Audio playback error:", e));
        } else {
            // Fallback: TTS
            const utterance = new SpeechSynthesisUtterance(segment.text);

            // Attempt to pick a voice based on speaker tags (Simplistic)
            const voices = window.speechSynthesis.getVoices();
            if (segment.speaker.includes('British')) {
                utterance.voice = voices.find(v => v.lang.includes('GB')) || null;
            } else if (segment.speaker.includes('American')) {
                utterance.voice = voices.find(v => v.lang.includes('US')) || null;
            }

            // Adjust rate for "Fast" speakers
            if (segment.speaker.includes('Fast')) utterance.rate = 1.2;
            else utterance.rate = 1.0;

            utterance.onend = () => {
                setCurrentSegmentIndex(prev => prev + 1);
                playSegment(index + 1);
            };

            // Simple progress simulation for TTS
            const estimatedDuration = segment.text.length * 60; // ~60ms per char
            const stepSize = 100 / segments.length;
            const baseProgress = index * stepSize;
            let startTime = Date.now();

            // Clear any previous interval for safety
            if (audioRef.current && audioRef.current.interval) clearInterval(audioRef.current.interval);

            // Use a dummy object to store interval/pause methods to unify interface if needed
            // For now, valid HTMLAudioElement doesn't have .interval, ensuring no conflict
            const progressInterval = setInterval(() => {
                if (!window.speechSynthesis.speaking) {
                    clearInterval(progressInterval);
                    return;
                }
                const elapsed = Date.now() - startTime;
                const ratio = Math.min(1, elapsed / estimatedDuration);
                setProgress(Math.min(100, baseProgress + (ratio * stepSize)));
            }, 100);

            window.speechSynthesis.speak(utterance);

            // Handle pause state
            if (!isPlaying) window.speechSynthesis.pause();
        }
    };

    const togglePlay = () => {
        if (isPlaying) {
            window.speechSynthesis.pause();
        } else {
            window.speechSynthesis.resume();
        }
        setIsPlaying(!isPlaying);
    };

    const handleNoteChange = (e) => {
        setNotes(e.target.value);
        lastNoteTime.current = Date.now();
        setSpeedWarning(false);
    };

    // Check for "Zoning Out"
    useEffect(() => {
        const checkInterval = setInterval(() => {
            // Increased threshold to 12 seconds to be less annoying
            if (isPlaying && Date.now() - lastNoteTime.current > 12000) {
                setSpeedWarning(true);
            }
        }, 1000);
        return () => clearInterval(checkInterval);
    }, [isPlaying]);

    return (
        <div className="flex gap-6 h-full">
            {/* Left: Audio Player & Status */}
            <div className="w-1/3 flex flex-col gap-6">
                <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                    {/* Speaker Info Overlay */}
                    {currentSpeaker && isPlaying && (
                        <div className="absolute top-0 left-0 right-0 bg-indigo-600/90 text-white text-xs font-bold px-4 py-2 text-center animate-fade-in z-20">
                            Speaking: {currentSpeaker.split('[')[0]}
                            {currentSpeaker.includes('[') && (
                                <span className="opacity-75 font-normal ml-1">
                                    {currentSpeaker.match(/\[(.*?)\]/)[0]}
                                </span>
                            )}
                        </div>
                    )}

                    <div className="flex justify-between items-center mb-6 mt-6">
                        <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 ${isPlaying ? 'bg-red-500 animate-pulse' : 'bg-slate-500'} rounded-full`}></div>
                            <span className={`font-mono text-sm tracking-widest ${isPlaying ? 'text-red-400' : 'text-slate-500'}`}>
                                {isPlaying ? 'LIVE FEED' : 'PAUSED'}
                            </span>
                        </div>
                        <span className="text-xs text-slate-400 font-mono">
                            {audioSegments ? 'Factory Audio' : 'Mock Audio'}
                        </span>
                    </div>

                    <div className="flex justify-center mb-8">
                        <button
                            onClick={togglePlay}
                            className="w-16 h-16 bg-white text-slate-900 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-white/10"
                        >
                            {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                        </button>
                    </div>

                    {/* Waveform / Progress */}
                    <div className="relative h-12 bg-slate-800 rounded-lg overflow-hidden flex items-center justify-center">
                        <div className="absolute left-0 top-0 bottom-0 bg-indigo-500/30 transition-all duration-100 ease-linear" style={{ width: `${progress}%` }}></div>
                        <div className="flex gap-1 items-end h-6 z-10 opacity-50">
                            {[...Array(20)].map((_, i) => (
                                <div key={i} className="w-1 bg-white rounded-full animate-bounce" style={{ height: `${Math.random() * 100}%`, animationDuration: `${Math.random() * 0.5 + 0.5}s`, animationPlayState: isPlaying ? 'running' : 'paused' }}></div>
                            ))}
                        </div>
                    </div>
                </div>

                {speedWarning && (
                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3 animate-pulse">
                        <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={20} />
                        <div>
                            <h4 className="font-bold text-amber-800 text-sm">Zone Out Detected!</h4>
                            <p className="text-amber-700 text-xs mt-1">
                                You missed the last keyword. Focus on the <strong>noun phrases</strong>.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Right: Digital Notepad */}
            <div className="flex-1 flex flex-col">
                <div className="bg-yellow-50 border-t-4 border-yellow-400 rounded-lg shadow-sm flex-1 flex flex-col overflow-hidden">
                    <div className="bg-yellow-100/50 p-2 border-b border-yellow-200 flex justify-between items-center">
                        <span className="font-handwriting font-bold text-yellow-800 flex items-center gap-2 px-2">
                            <PenTool size={16} /> Rough Notes
                        </span>
                        <span className="text-[10px] text-yellow-600 uppercase font-bold tracking-wider opacity-60">Phase 1: Strategic Capture</span>
                    </div>

                    {/* Prediction Buckets */}
                    {prediction && prediction.length > 0 && (
                        <div className="bg-yellow-100/30 p-4 border-b border-yellow-200/50">
                            <p className="text-[10px] font-black text-yellow-700/50 uppercase tracking-[0.2em] mb-3 ml-1">Prediction Buckets</p>
                            <div className="flex flex-wrap gap-2">
                                {prediction.map(p => (
                                    <div key={p.id} className="bg-white border border-yellow-300 rounded-xl px-4 py-2 shadow-sm flex flex-col ring-2 ring-yellow-400/10">
                                        <span className="text-xs font-black text-yellow-800 uppercase tracking-tighter mb-0.5">Bucket</span>
                                        <span className="text-sm font-bold text-slate-800 leading-none">{p.name}</span>
                                        {p.synonyms && p.synonyms.length > 0 && (
                                            <div className="mt-1 flex gap-1 items-center opacity-60">
                                                <div className="w-1 h-1 rounded-full bg-yellow-600" />
                                                <span className="text-[10px] italic text-slate-500 truncate max-w-[120px]">
                                                    {p.synonyms.slice(0, 2).join(', ')}...
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <textarea
                        className="flex-1 w-full bg-transparent p-6 font-mono text-sm leading-relaxed focus:outline-none resize-none text-slate-700"
                        placeholder="- Use abbr. (e.g., govt, b/c, w/o)&#10;- Arrows for process (->)&#10;- Capture dates & names"
                        value={notes}
                        onChange={handleNoteChange}
                        spellCheck="false"
                    />
                </div>

                <div className="mt-4 flex justify-end">
                    <button
                        onClick={() => onComplete(notes)}
                        disabled={!notes || isPlaying} // Encourage finishing audio
                        className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-black transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Finish & Synthesize <FastForward size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LiveListenStep;
