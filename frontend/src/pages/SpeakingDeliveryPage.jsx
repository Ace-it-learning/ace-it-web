import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mic, Play, Pause, Square, RotateCcw, CheckCircle2, Volume2, Loader2, ArrowRight, Zap, Languages, Sparkles } from 'lucide-react';
import DeliveryScaffoldPassage from '../components/speaking/DeliveryScaffoldPassage';
import SpeakingWaveform from '../components/speaking/SpeakingWaveform';
import PhonemeSpotlight from '../components/speaking/PhonemeSpotlight';
import { useKaraokeSync } from '../hooks/useKaraokeSync';
import { useAzureSpeechRecognition } from '../hooks/useAzureSpeechRecognition';
import { useAzureTTS } from '../hooks/useAzureTTS';

// Simplified Speaking Scaffold Toolbar
const SpeakingScaffoldToolbar = ({ settings, onChange }) => {
    const toggles = [
        {
            key: 'vocab',
            label: 'Vocab & IPA',
            icon: Languages,
            activeClasses: 'bg-emerald-100 text-emerald-700 border-emerald-300',
            dotActiveClass: 'bg-emerald-500'
        }
    ];

    return (
        <div className="flex items-center gap-2 p-1 bg-gray-50 rounded-xl border border-gray-100 w-fit">
            {toggles.map(({ key, label, icon: Icon, activeClasses, dotActiveClass }) => (
                <button
                    key={key}
                    onClick={() => onChange({ ...settings, [key]: !settings[key] })}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border ${settings[key]
                        ? activeClasses
                        : 'bg-white text-gray-400 border-transparent hover:border-gray-200'
                        }`}
                >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{label}</span>
                    <div className={`w-1 h-1 rounded-full ${settings[key] ? dotActiveClass : 'bg-gray-300'}`}></div>
                </button>
            ))}
        </div>
    );
};

const SpeakingDeliveryPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    // 1. Module & Content Selection
    const topicId = searchParams.get('topic') || 'a_1';
    const level = searchParams.get('level') || '3';
    const [currentSegment, setCurrentSegment] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [scaffoldSettings, setScaffoldSettings] = useState({ vocab: true });
    
    // Results & Feedback State
    const [gradingResult, setGradingResult] = useState(null);
    const [isGrading, setIsGrading] = useState(false);
    const [resultsMode, setResultsMode] = useState(false);

    // [RESTORED MISSING STATE]
    const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
    const [results, setResults] = useState([]);
    const [isFinished, setIsFinished] = useState(false);
    const [recordedBlob, setRecordedBlob] = useState(null);
    const [segmentFeedback, setSegmentFeedback] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isPlayingStudent, setIsPlayingStudent] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [voiceLevel, setVoiceLevel] = useState(0);
    const [quest, setQuest] = useState({ segments: [], role: 'Candidate', scenario: 'Speaking Drill' });

    // Audio & Recording Refs
    const mediaRecorder = useRef(null);
    const audioChunks = useRef([]);
    const audioContext = useRef(null);
    const analyser = useRef(null);
    const animationFrame = useRef(null);
    const silenceTimeout = useRef(null);
    const studentAudio = useRef(null);
    const wavesurferRecorder = useRef(null);
    const karaoke = useKaraokeSync({
        audioUrl: currentSegment?.master_audio_url ?? null,
        timingsUrl: currentSegment?.master_timings_url ?? null,
    });

    const { speak, stop } = useAzureTTS({ uid: user?.uid });

    // Audio Playback for Spotlight (Azure TTS)
    const handlePlayWord = (word) => {
        speak(word, 'Examiner', { pitch: 1.0, rate: 1.0 });
    };

    useEffect(() => {
        const fetchDrill = async () => {
            setIsLoading(true);
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                const res = await fetch(`${API_URL}/api/speaking/quest/generate?module=delivery&level=${level}&focus=${topicId}&uid=${user?.uid || 'guest'}`);
                if (!res.ok) throw new Error('Generation failed');
                const data = await res.json();
                console.log('[Speaking Delivery] Loaded Data:', data);
                
                // DATA KEY UNIFICATION (v10.0 Deep Clean)
                // Handle different backend formats (stimulus, master_script, etc.)
                if (data && data.segments?.[0]) {
                    const seg = data.segments[0];
                    // Map stimulus to master_script if missing
                    if (!seg.master_script && seg.stimulus) seg.master_script = seg.stimulus;
                    // Map strategy_goal to focus_advice if missing
                    if (!seg.focus_advice && seg.strategy_goal) seg.focus_advice = seg.strategy_goal;
                    
                    // Priority check for focusAdvice
                    if (!data.focusAdvice) {
                        data.focusAdvice = seg.focus_advice || seg.strategy_goal || data.focus_advice || "Focus on your pacing and intonation.";
                    }
                }
                
                setQuest(data);
                if (data?.segments?.[0]) {
                    setCurrentSegment(data.segments[0]);
                }
            } catch (err) {
                console.error('Drill load error:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDrill();
    }, [topicId, level, user?.uid]);

    // Cleanup on unmount only — don't include recordedBlobUrl in deps
    useEffect(() => {
        return () => {
            stopAllAudio();
            if (studentAudio.current) {
                studentAudio.current.pause();
                studentAudio.current = null;
            }
        };
    }, []);


    const stopMasterAudio = () => {
        karaoke.stop();
        stop();
    };

    const stopAllAudio = () => {
        stop();
        if (studentAudio.current) {
            studentAudio.current.pause();
            studentAudio.current.onended = null;
            studentAudio.current.src = "";
            studentAudio.current.load();
        }
        setIsPlayingStudent(false);
    };


    const handleMasterDemo = async () => {
        if (karaoke.isPlaying) {
            stopMasterAudio();
            return;
        }
        stopAllAudio();
        await karaoke.toggle();
    };

    useEffect(() => {
        if (currentSegment?.master_audio_url && currentSegment?.master_timings_url) {
            karaoke.ensureLoaded();
        }
    }, [currentSegment?.master_audio_url, currentSegment?.master_timings_url]);

    // Azure Speech Recognition Hook (for real-time transcript preview)
    const {
        startListening: startAzureListening,
        stopListening: stopAzureListening,
        resetTranscript: resetAzureTranscript
    } = useAzureSpeechRecognition({
        silenceThresholdMs: 6000,
        onPartial: (text) => {
            // Could show live transcript during reading practice
            console.log('[SpeakingDelivery] Partial:', text);
        },
        onFinal: (text) => {
            console.log('[SpeakingDelivery] Final transcript:', text);
        },
        onError: (err) => {
            console.error('[SpeakingDelivery] Azure STT error:', err);
        }
    });

    // 3. Recording with Silence Detection
    const startRecording = async () => {
        stopAllAudio(); // CRITICAL: Stop all TTS and Demo audio before recording starts
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Audio Context for Voice Level Visualization
            audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
            analyser.current = audioContext.current.createAnalyser();
            const source = audioContext.current.createMediaStreamSource(stream);
            source.connect(analyser.current);
            analyser.current.fftSize = 256;

            const bufferLength = analyser.current.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const updateVoiceLevel = () => {
                analyser.current.getByteFrequencyData(dataArray);
                const average = dataArray.reduce((a, b) => a + b) / bufferLength;
                setVoiceLevel(average);

                animationFrame.current = requestAnimationFrame(updateVoiceLevel);
            };
            updateVoiceLevel();

            mediaRecorder.current = new MediaRecorder(stream);
            audioChunks.current = [];

            mediaRecorder.current.ondataavailable = (e) => {
                audioChunks.current.push(e.data);
                resetSilenceDetection();
            };

            mediaRecorder.current.onstop = () => {
                const blob = new Blob(audioChunks.current, { type: 'audio/webm' });
                setRecordedBlob(blob);
                stream.getTracks().forEach(track => track.stop());
                if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
                setVoiceLevel(0);
            };

            mediaRecorder.current.start(1000);
            resetAzureTranscript();
            startAzureListening();
            setIsRecording(true);
            resetSilenceDetection();
        } catch (err) {
            console.error('Microphone error:', err);
            alert('Microphone access denied.');
        }
    };

    const resetSilenceDetection = () => {
        if (silenceTimeout.current) clearTimeout(silenceTimeout.current);
        silenceTimeout.current = setTimeout(() => {
            console.log("[SpeakingQuest] Auto-stopping due to silence...");
            stopRecording();
        }, 5000);
    };

    const stopRecording = () => {
        if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
            mediaRecorder.current.stop();
            stopAzureListening();
            setIsRecording(false);
            if (silenceTimeout.current) clearTimeout(silenceTimeout.current);
        }
    };

    // 4. Play Student Recording
    const playStudentRecording = () => {
        if (!recordedBlob) return;

        // If already playing, stop first
        if (studentAudio.current) {
            studentAudio.current.pause();
            studentAudio.current.currentTime = 0;
            studentAudio.current = null;
        }

        // Create a fresh blob URL each time (don't reuse recordedBlobUrl state)
        const url = URL.createObjectURL(recordedBlob);

        const audio = new Audio(url);
        audio.onended = () => {
            setIsPlayingStudent(false);
            URL.revokeObjectURL(url);
        };
        audio.onerror = () => {
            console.error('[SpeakingDelivery] Playback error');
            setIsPlayingStudent(false);
            URL.revokeObjectURL(url);
        };

        studentAudio.current = audio;
        setIsPlayingStudent(true);
        audio.play().catch(err => {
            console.error('[SpeakingDelivery] Play failed:', err);
            setIsPlayingStudent(false);
            URL.revokeObjectURL(url);
        });
    };


    const stopStudentRecording = () => {
        if (studentAudio.current) {
            studentAudio.current.pause();
            studentAudio.current.currentTime = 0;
            setIsPlayingStudent(false);
        }
    };

    // 5. Submit Segment
    const submitSegment = async () => {
        if (!recordedBlob) return;
        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('audio', recordedBlob, 'recording.webm');
            formData.append('module', 'delivery');
            formData.append('quest_id', quest?.template_id || quest?.id);
            formData.append('master_script', currentSegment.master_script);
            formData.append('level', level);
            formData.append('uid', user?.uid || 'guest');
            formData.append('focus', topicId);

            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const res = await fetch(`${API_URL}/api/speaking/quest/submit`, {
                method: 'POST',
                body: formData
            });

            if (!res.ok) throw new Error('Grading failed');

            const feedbackData = await res.json();
            
            // Safety: Ensure total score exists
            if (feedbackData.scores && feedbackData.scores.total === undefined) {
                const s = feedbackData.scores;
                feedbackData.scores.total = (s.pronunciation || 0) + (s.intonation || 0) + (s.pacing || 0) + (s.grammar || 0);
            }

            setSegmentFeedback(feedbackData);
            setResults(prev => [...prev, feedbackData]);
        } catch (err) {
            console.error('Grading error:', err);
            const fallback = {
                scores: { total: 0 },
                feedback: { summary: "Connection lost during grading.", improvement_advice: "Check your internet and try again." }
            };
            setSegmentFeedback(fallback);
            setResults(prev => [...prev, fallback]);
        } finally {
            setIsSubmitting(false);
        }
    };

    const nextRound = () => {
        if (currentSegmentIndex < quest.segments.length - 1) {
            setCurrentSegmentIndex(prev => prev + 1);
            setRecordedBlob(null);
            setSegmentFeedback(null);
            stopMasterAudio();
        } else {
            setIsFinished(true);
            window.sessionStorage.setItem('lastSpeakingResult', JSON.stringify({
                scores: results[0]?.scores || {},
                feedback: results[0]?.feedback || {}
            }));
        }
    };

    const retrySegment = () => {
        setRecordedBlob(null);
        setSegmentFeedback(null);
        setResults(prev => prev.slice(0, -1));
    };

    if (isLoading) return (
        <div className="h-screen bg-indigo-50 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
            <p className="text-indigo-600 font-bold animate-pulse">Generating Voice & Clarity Master Quest...</p>
        </div>
    );

    const handleTryNext = () => {
        if (!topicId) return;
        // Logic: infer next topic (e.g., a_1 -> a_2)
        const currentMatch = topicId.match(/([a-z]+)_(\d+)/);
        if (currentMatch) {
            const prefix = currentMatch[1];
            const nextNum = parseInt(currentMatch[2]) + 1;
            navigate(`/speaking/delivery/${level}/${prefix}_${nextNum}`);
            // Force a reload as we are navigating to the same component with different params
            window.location.reload();
        }
    };

    if (isFinished) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex flex-col pb-24">
                <div className="max-w-4xl mx-auto p-8 w-full">
                    <div className="text-center mb-12 animate-in zoom-in-95">
                        <div className="flex flex-col items-center gap-1 mb-4">
                            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em]">
                                {quest.title || "Delivery Quest"}
                            </span>
                            <h1 className="text-4xl font-black text-gray-900 leading-tight">
                                {currentSegment?.title || "Mission Assessment"}
                            </h1>
                        </div>

                        <div className="text-7xl font-black text-indigo-600 my-8 flex flex-col items-center">
                            <div>
                                {results[0]?.scores?.total} <span className="text-2xl opacity-50">/ 28</span>
                            </div>
                            {results[0]?.xp_awarded > 0 && (
                                <div className="mt-2 px-4 py-1 bg-amber-100 text-amber-600 rounded-full text-sm font-bold tracking-widest uppercase animate-in slide-in-from-bottom-2">
                                    +{results[0].xp_awarded} XP Earned
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                        {Object.entries(results[0]?.scores || {}).map(([key, val]) => (
                            key !== 'total' && (
                                <div key={key} className="bg-white rounded-2xl p-5 text-center shadow-lg border border-indigo-100 animate-in slide-in-from-bottom-4">
                                    <p className="text-[10px] font-black text-gray-400 upper tracking-widest mb-1">{key.replace('_', ' ')}</p>
                                    <div className="flex items-baseline justify-center gap-1">
                                        <p className="text-3xl font-black text-indigo-700">{val}</p>
                                        <p className="text-xs text-gray-400">/7</p>
                                    </div>
                                </div>
                            )
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-white rounded-3xl p-8 shadow-xl border border-indigo-50">
                            <div className="flex items-center gap-2 mb-4">
                                <Languages className="w-4 h-4 text-emerald-500" />
                                <h4 className="font-black text-xs text-gray-400 uppercase tracking-[0.2em]">Pronunciation Details</h4>
                            </div>
                            <PhonemeSpotlight 
                                wordAnalysis={results[0]?.word_analysis || []} 
                                onPlayWord={handlePlayWord} 
                            />
                        </div>

                        <div className="bg-white rounded-3xl p-8 shadow-xl border border-indigo-50">
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles className="w-4 h-4 text-indigo-500" />
                                <h4 className="font-black text-xs text-gray-400 uppercase tracking-[0.2em]">Rhythm & Melody</h4>
                            </div>
                            <p className="text-sm text-gray-700 font-medium leading-relaxed">
                                {results[0]?.scores?.total === 0 ? "N/A - Insufficient speech for analysis." : (results[0]?.feedback?.rhythm_score || "Good sentence-level stress and pacing.")}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white rounded-3xl p-8 shadow-xl border border-indigo-50">
                            <h4 className="font-black text-xs text-indigo-400 uppercase tracking-[0.2em] mb-4">Examiner Summary</h4>
                            <p className="text-lg text-gray-800 font-medium italic leading-relaxed">"{results[0]?.feedback?.summary}"</p>
                        </div>

                        <div className="bg-indigo-900 text-white rounded-3xl p-8 shadow-xl">
                            <h4 className="font-black text-xs text-indigo-300 uppercase tracking-[0.2em] mb-4">Improvement Roadmap</h4>
                            <p className="text-indigo-50 leading-relaxed font-light">{results[0]?.feedback?.improvement_advice}</p>
                        </div>
                    </div>
                </div>

                <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-md border-t border-indigo-100 z-50">
                    <div className="max-w-4xl mx-auto flex gap-4">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-2xl font-black text-lg hover:bg-gray-200 transition-all active:scale-95 flex items-center justify-center gap-3"
                        >
                            Return to Dashboard
                        </button>
                        <button
                            onClick={handleTryNext}
                            className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-xl hover:bg-indigo-700 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
                        >
                            Try Next Mission <ArrowRight className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FDFDFF] font-sans selection:bg-indigo-100 relative overflow-hidden flex flex-col">
            {/* Background Accents (Glassmorphism) */}
            <div className="bg-white/90 backdrop-blur-md border-b z-20 flex-shrink-0">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                        >
                            ←
                        </button>
                        <div>
                            <h2 className="font-bold text-gray-900 leading-tight">Delivery Quest</h2>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest leading-none mt-1">DSE Reading Aloud</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-[10px] font-black uppercase tracking-widest">Lv {level}</div>
                        {quest.segments.length > 1 && (
                            <div className="px-3 py-1 bg-gray-100 text-gray-500 rounded-lg text-[10px] font-bold uppercase tracking-widest">
                                Segment {currentSegmentIndex + 1} / {quest.segments.length}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex max-w-full w-full mx-auto px-4 py-3 overflow-hidden gap-4">

                {/* Left Panel: Passage (70%) */}
                <div className="w-[70%] bg-white rounded-3xl shadow-xl border border-gray-100 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-8 relative">
                        <div className="max-w-4xl mx-auto">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-[0.2em]">{quest.role}</span>
                                    <h3 className="text-xs font-bold text-gray-400 italic">"{quest.scenario}"</h3>
                                </div>

                                <SpeakingScaffoldToolbar
                                    settings={scaffoldSettings}
                                    onChange={setScaffoldSettings}
                                />
                            </div>

                            <DeliveryScaffoldPassage
                                text={currentSegment.master_script}
                                vocabulary={currentSegment.vocabulary}
                                settings={scaffoldSettings}
                                activeWordIndex={karaoke.activeWordIndex}
                                resultsMode={!!segmentFeedback}
                                wordAnalysis={segmentFeedback?.word_analysis || []}
                                user={user}
                                sourceTitle={quest?.title || 'Speaking Delivery Quest'}
                            />
                        </div>
                    </div>
                </div>

                {/* Right Panel: Controls & Advice (30%) */}
                <div className="w-[30%] flex flex-col gap-4 overflow-y-auto pr-1">

                    {/* Advice & Controls */}
                    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 space-y-5 flex-shrink-0">
                        <div className="bg-amber-50 border border-amber-50 p-4 rounded-xl">
                            <p className="text-[10px] font-black text-amber-600 uppercase mb-1.5 flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" /> Focus Advice</p>
                            <p className="text-xs font-semibold text-amber-900 leading-relaxed">{currentSegment.focus_advice}</p>
                        </div>

                        <button
                            onClick={handleMasterDemo}
                            disabled={karaoke.isLoading || !karaoke.hasKaraoke}
                            title={!karaoke.hasKaraoke ? 'Karaoke demo is available for library pronunciation drills (a_1–a_20)' : undefined}
                            className={`w-full py-3.5 rounded-xl font-black flex flex-col items-center justify-center gap-1 transition-all ${karaoke.isPlaying ? 'bg-red-500 text-white shadow-lg' : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                } ${(karaoke.isLoading || !karaoke.hasKaraoke) ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            <div className="flex items-center gap-3">
                                {karaoke.isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (karaoke.isPlaying ? <Square className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5" />)}
                                <span className="text-[10px] uppercase tracking-widest">
                                    {karaoke.isLoading ? 'Loading Demo...' : (karaoke.isPlaying ? 'STOP DEMO' : 'MASTER DEMO')}
                                </span>
                            </div>
                            {!karaoke.hasKaraoke && !karaoke.isLoading && (
                                <span className="text-[9px] font-semibold normal-case tracking-normal opacity-80 mt-0.5">
                                    Library drills only
                                </span>
                            )}
                            {karaoke.isLoading && (
                                <div className="w-48 h-1 bg-white/20 rounded-full mt-2 overflow-hidden">
                                    <div className="h-full bg-white animate-[loading_2s_ease-in-out_infinite]" style={{ width: '40%' }}></div>
                                </div>
                            )}
                        </button>
                    </div>

                    {/* Recording Controls */}
                    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 flex flex-col items-center gap-6">
                        {!segmentFeedback ? (
                            <>
                                <div className="w-full mb-4">
                                    <SpeakingWaveform isRecording={isRecording} />
                                </div>
                                <div className="relative">
                                    {isRecording && (
                                        <div
                                            className="absolute -inset-4 rounded-full border-4 border-red-500/20 animate-ping"
                                            style={{ animationDuration: '3s' }}
                                        ></div>
                                    )}
                                    <button
                                        onClick={isRecording ? stopRecording : startRecording}
                                        className={`w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-all relative z-10 ${isRecording ? 'bg-red-500 scale-110' : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'
                                            }`}
                                    >
                                        <Mic className="w-8 h-8 text-white" />
                                            <div
                                                className="absolute -inset-2 rounded-full border-4 border-red-400 opacity-50"
                                                style={{ transform: `scale(${1 + (voiceLevel / 100)})` }}
                                            ></div>
                                    </button>
                                </div>

                                {recordedBlob && !isRecording && (
                                    <div className="flex flex-col w-full gap-3 animate-in slide-in-from-top-4">
                                        <div className="flex gap-2">
                                            <button onClick={playStudentRecording} className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all ${isPlayingStudent ? 'bg-indigo-100 text-indigo-600 animate-pulse' : 'bg-white border-2 border-indigo-50 text-indigo-600 hover:border-indigo-200'}`}>
                                                <Volume2 className="w-4 h-4" /> <span className="text-[10px] font-bold uppercase tracking-wider">Playback</span>
                                            </button>
                                            <button onClick={retrySegment} className="px-4 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center border border-gray-200 hover:bg-gray-100 transition-colors">
                                                <RotateCcw className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <button
                                            onClick={submitSegment}
                                            disabled={isSubmitting}
                                            className="w-full py-4 bg-gray-900 text-white rounded-xl font-black text-[10px] tracking-[0.2em] shadow-xl disabled:opacity-50 hover:bg-black transition-all flex items-center justify-center gap-2"
                                        >
                                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                            {isSubmitting ? 'ANALYZING' : 'SUBMIT PERFORMANCE'}
                                        </button>
                                    </div>
                                )}

                                {isRecording && (
                                    <p className="text-[10px] font-black text-red-500 uppercase tracking-widest animate-pulse">
                                        Auto-stopping after 5s silence...
                                    </p>
                                )}

                                {!recordedBlob && !isRecording && (
                                    <button
                                        disabled
                                        className="w-full py-4 bg-gray-50 text-gray-400 rounded-xl font-black text-[10px] tracking-[0.2em] border border-gray-200 cursor-not-allowed opacity-60 flex items-center justify-center gap-2"
                                    >
                                        SUBMIT PERFORMANCE
                                    </button>
                                )}
                            </>
                        ) : (
                            <div className="w-full space-y-4 animate-in slide-in-from-bottom-6">
                                <button
                                    onClick={nextRound}
                                    className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-xs tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-xl hover:-translate-y-1 active:scale-[0.98]"
                                >
                                    CONTINUE TO FULL ASSESSMENT <ArrowRight className="w-4 h-4" />
                                </button>
                                <p className="text-[10px] text-gray-400 font-bold text-center uppercase tracking-widest leading-relaxed">
                                    Review ready. Final scores and<br />word analysis available on the next page.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SpeakingDeliveryPage;
