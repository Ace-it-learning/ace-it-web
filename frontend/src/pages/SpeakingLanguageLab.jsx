import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Mic, MicOff, Play, Pause, RotateCcw, Send, 
    ArrowRight, Sparkles, BookOpen, Volume2, 
    CheckCircle2, AlertCircle, Info, Bookmark,
    ChevronRight, Brain, Languages
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const API_BASE_URL = `${API_URL}/api`;

const SpeakingLanguageLab = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const level = searchParams.get('level') || '3';
    const topic = searchParams.get('topic') || 'language_patterns';
    const { user } = { user: { uid: 'guest' } }; // Simplified for now, or use AuthContext

    // State
    const [phase, setPhase] = useState('IDLE'); // IDLE, PRACTICE, REVIEW
    const [quest, setQuest] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [gradingResult, setGradingResult] = useState(null);
    
    // Practice State
    const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
    const [responses, setResponses] = useState([]); // Array of { sentence, transcript, audioBlob }
    const [isRecording, setIsRecording] = useState(false);
    const [isSynthesizing, setIsSynthesizing] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    
    // Audio Context
    const mediaRecorder = useRef(null);
    const audioChunks = useRef([]);
    const audioRef = useRef(new Audio());

    // Initial Loading
    useEffect(() => {
        const fetchQuest = async () => {
            try {
                setIsLoading(true);
                const res = await axios.get(`${API_BASE_URL}/speaking/quest/generate`, {
                    params: { module: 'language_patterns', level, focus: topic }
                });
                setQuest(res.data);
                setIsLoading(false);
            } catch (err) {
                console.error("Failed to load quest:", err);
                setIsLoading(false);
            }
        };
        fetchQuest();
    }, [level, topic]);

    const startSession = () => {
        setPhase('PRACTICE');
        setCurrentSentenceIndex(0);
        setResponses([]);
    };

    const readForMe = async (text) => {
        if (!text || isSynthesizing) return;
        setIsSynthesizing(true);
        try {
            const res = await axios.post(`${API_BASE_URL}/tts`, {
                text,
                languageCode: 'en-GB',
                uid: user?.uid || 'guest'
            });
            
            if (res.data.audioContent) {
                const audioBlob = new Blob(
                    [Uint8Array.from(atob(res.data.audioContent), c => c.charCodeAt(0))],
                    { type: 'audio/wav' }
                );
                const url = URL.createObjectURL(audioBlob);
                audioRef.current.src = url;
                audioRef.current.play();
                audioRef.current.onended = () => setIsSynthesizing(false);
            }
        } catch (err) {
            console.error("TTS failed:", err);
            setIsSynthesizing(false);
        }
    };

    const toggleRecording = async () => {
        if (!isRecording) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorder.current = new MediaRecorder(stream);
                audioChunks.current = [];

                mediaRecorder.current.ondataavailable = (event) => {
                    audioChunks.current.push(event.data);
                };

                mediaRecorder.current.onstop = async () => {
                    const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
                    
                    // 1. Immediately update responses so 'Next' button appears
                    const currentSentenceIndexLocal = currentSentenceIndex;
                    setResponses(prev => {
                        const newResponses = [...prev];
                        newResponses[currentSentenceIndexLocal] = {
                            sentence: quest.practice_sentences[currentSentenceIndexLocal].text,
                            target_word: quest.practice_sentences[currentSentenceIndexLocal].target_word,
                            audioBlob,
                            status: 'transcribing'
                        };
                        return newResponses;
                    });

                    // 2. Perform background transcription
                    setIsTranscribing(true);
                    try {
                        const formData = new FormData();
                        formData.append('audio', audioBlob);
                        formData.append('module', 'delivery');
                        formData.append('master_script', quest.practice_sentences[currentSentenceIndexLocal].text);
                        formData.append('uid', user?.uid || 'guest');
                        
                        const res = await axios.post(`${API_BASE_URL}/speaking/quest/submit`, formData, {
                            headers: { 'Content-Type': 'multipart/form-data' }
                        });

                        const transcript = res.data.transcript || "";
                        const word_analysis = res.data.word_analysis || [];

                        setResponses(prev => {
                            const newResponses = [...prev];
                            newResponses[currentSentenceIndexLocal] = {
                                ...newResponses[currentSentenceIndexLocal],
                                transcript,
                                word_analysis,
                                status: 'done'
                            };
                            return newResponses;
                        });
                    } catch (err) {
                        console.error("Transcription failed:", err);
                        setResponses(prev => {
                            const newResponses = [...prev];
                            newResponses[currentSentenceIndexLocal] = {
                                ...newResponses[currentSentenceIndexLocal],
                                status: 'failed'
                            };
                            return newResponses;
                        });
                    } finally {
                        setIsTranscribing(false);
                    }
                };

                mediaRecorder.current.start();
                setIsRecording(true);
            } catch (err) {
                console.error("Recording error:", err);
            }
        } else {
            mediaRecorder.current.stop();
            setIsRecording(false);
        }
    };

    const nextSentence = () => {
        if (currentSentenceIndex < (quest.practice_sentences?.length || 5) - 1) {
            setCurrentSentenceIndex(prev => prev + 1);
        } else {
            submitPractice();
        }
    };

    const submitPractice = async () => {
        setIsLoading(true);
        try {
            // Final submission after all 5 sentences
            // We'll send the transcripts if we had them, but for now we'll send the collection
            // In a real high-fidelity app, we'd transcribe all 5 on the fly or at the end.
            
            const formData = new FormData();
            formData.append('module', 'language_patterns');
            formData.append('level', level);
            formData.append('quest_id', quest.template_id);
            formData.append('practice_results', JSON.stringify(responses.map(r => ({
                sentence: r.sentence,
                target_word: r.target_word
            }))));

            // Attach all 5 audio blobs if needed, but for "Vocab Range", transcripts suffice.
            // Simplified: Submit metadata and let backend grade the "set"
            const res = await axios.post(`${API_BASE_URL}/speaking/quest/submit`, {
                module: 'language_patterns',
                level,
                practice_results: responses.map(r => ({
                    sentence: r.sentence,
                    target_word: r.target_word
                }))
            });

            setGradingResult(res.data);
            setPhase('REVIEW');
        } catch (err) {
            console.error("Grading failed:", err);
        } finally {
            setIsLoading(false);
        }
    };

    if (!quest && isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="font-black text-slate-400 uppercase tracking-widest text-sm">Preparing Vocabulary Lab...</p>
                </div>
            </div>
        );
    }

    const currentSentence = quest?.practice_sentences?.[currentSentenceIndex];
    const progress = quest?.practice_sentences ? ((currentSentenceIndex + 1) / quest.practice_sentences.length) * 100 : 0;

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-indigo-100 pb-20">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/speaking/menu')} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                            <RotateCcw className="w-5 h-5 text-slate-500" />
                        </button>
                        <div className="h-6 w-[2px] bg-slate-100" />
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 block mb-0.5">Criterion C</span>
                            <h1 className="font-black text-slate-800 tracking-tight">Language Patterns Lab</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex items-center gap-3">
                            <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    className="h-full bg-indigo-600"
                                />
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                {currentSentenceIndex + 1} / {quest?.practice_sentences?.length || 5}
                            </span>
                        </div>
                        <div className="px-4 py-1.5 bg-slate-100 rounded-full text-xs font-black text-slate-500 uppercase tracking-wider">
                            Level {level}
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 pt-32">
                {phase === 'IDLE' && quest && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
                        <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-sm border border-slate-100 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
                                <Languages size={240} />
                            </div>
                            
                            <div className="relative z-10">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-2xl text-xs font-black uppercase tracking-widest mb-6">
                                    <Sparkles className="w-4 h-4" />
                                    Vocab Range Mission
                                </div>
                                <h2 className="text-4xl md:text-5xl font-black text-slate-800 leading-tight mb-6">
                                    {quest.scenario}
                                </h2>
                                <p className="text-lg text-slate-500 font-medium leading-relaxed mb-10">
                                    Read 5 curated sentences incorporating advanced vocabulary to master natural context and linguistic range.
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                        <h4 className="flex items-center gap-2 font-black text-slate-800 uppercase tracking-widest text-xs mb-3">
                                            <Brain className="w-4 h-4 text-indigo-600" />
                                            Success Goals
                                        </h4>
                                        <ul className="space-y-2">
                                            <li className="flex items-center gap-2 text-sm text-slate-600 font-medium tracking-tight">
                                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                                                Master 5 Power Words
                                            </li>
                                            <li className="flex items-center gap-2 text-sm text-slate-600 font-medium tracking-tight">
                                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                                                Understand Natural Content
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                        <h4 className="flex items-center gap-2 font-black text-slate-800 uppercase tracking-widest text-xs mb-3">
                                            <Info className="w-4 h-4 text-emerald-600" />
                                            Instructions
                                        </h4>
                                        <div className="text-sm text-slate-600 font-medium leading-relaxed">
                                            Listen to the guidance, then read each sentence aloud. We'll grade your range at the end.
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    onClick={startSession}
                                    className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-xl hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-100 flex items-center justify-center gap-3"
                                >
                                    Start Practice
                                    <ArrowRight className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {phase === 'PRACTICE' && currentSentence && (
                    <div className="max-w-4xl mx-auto space-y-8">
                        {/* Main Sentence Card */}
                        <motion.div 
                            key={currentSentenceIndex}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white rounded-[3rem] p-12 shadow-sm border border-slate-100 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-8">
                                <span className="text-6xl font-black text-slate-50 opacity-[0.05] tabular-nums">
                                    0{currentSentenceIndex + 1}
                                </span>
                            </div>

                            <div className="relative z-10 text-center">
                                <div className="mb-12">
                                    <h3 
                                        className="text-3xl md:text-4xl font-black text-slate-800 leading-[1.4] tracking-tight"
                                        dangerouslySetInnerHTML={{ 
                                            __html: currentSentence.text.replace(
                                                new RegExp(`\\*\\*(${currentSentence.target_word})\\*\\*`, 'gi'), 
                                                '<span class="text-indigo-600 underline decoration-4 underline-offset-8">$1</span>'
                                            ) 
                                        }}
                                    />
                                </div>

                                <div className="flex flex-col items-center gap-8">
                                    <div className="flex items-center gap-4">
                                        <button 
                                            onClick={() => readForMe(currentSentence.text)}
                                            disabled={isSynthesizing}
                                            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black transition-all ${isSynthesizing ? 'bg-indigo-50 text-indigo-400' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'}`}
                                        >
                                            {isSynthesizing ? (
                                                <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <Volume2 className="w-4 h-4" />
                                            )}
                                            {isSynthesizing ? 'Reading...' : 'Read for me'}
                                        </button>

                                        <button 
                                            onClick={toggleRecording}
                                            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-rose-500 scale-110 shadow-lg shadow-rose-200' : 'bg-slate-900 hover:scale-105 shadow-xl shadow-slate-200'}`}
                                        >
                                            {isRecording ? <MicOff className="w-8 h-8 text-white" strokeWidth={3} /> : <Mic className="w-8 h-8 text-white" strokeWidth={3} />}
                                        </button>
                                    </div>

                                    {isRecording && (
                                        <div className="flex gap-1.5 items-center">
                                            {[...Array(5)].map((_, i) => (
                                                <motion.div 
                                                    key={i}
                                                    animate={{ height: [8, 24, 8] }}
                                                    transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.1 }}
                                                    className="w-1.5 bg-rose-500 rounded-full"
                                                />
                                            ))}
                                            <span className="ml-3 text-[10px] font-black text-rose-500 uppercase tracking-widest">Recording Response</span>
                                        </div>
                                    )}

                                    {isTranscribing && (
                                        <div className="flex items-center gap-3 px-6 py-2 bg-indigo-50 rounded-2xl border border-indigo-100">
                                            <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Analyzing your speech...</span>
                                        </div>
                                    )}

                                    {responses[currentSentenceIndex] && !isRecording && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                            <button 
                                                onClick={nextSentence}
                                                className="px-10 py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center gap-3"
                                            >
                                                {currentSentenceIndex === (quest.practice_sentences.length - 1) ? 'Submit Final Practice' : 'Next Sentence'}
                                                <ArrowRight className="w-5 h-5" />
                                            </button>
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        </motion.div>

                        {/* Explanation Card */}
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-indigo-50 rounded-[2.5rem] p-8 border border-indigo-100"
                        >
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-white rounded-2xl shadow-sm">
                                    <BookOpen className="w-6 h-6 text-indigo-600" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h4 className="text-xl font-black text-indigo-900">{currentSentence.target_word}</h4>
                                        <span className="px-2 py-0.5 bg-white text-[10px] font-bold text-slate-400 rounded-md uppercase tracking-wider">
                                            Focus Word
                                        </span>
                                    </div>
                                    <p className="text-indigo-700/80 font-medium leading-relaxed">
                                        {currentSentence.explanation}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Final Review Overlay */}
                <AnimatePresence>
                    {phase === 'REVIEW' && gradingResult && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm p-6 flex items-center justify-center"
                        >
                            <div className="bg-white rounded-[3rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
                                <div className="p-8 md:p-12">
                                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
                                        <div className="flex-1 text-center md:text-left">
                                            <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                                                <div className="px-4 py-1.5 bg-indigo-600 text-white rounded-full text-xs font-black uppercase tracking-widest">Vocab Mastery Report</div>
                                                <div className="px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-black uppercase tracking-widest">Level {level}</div>
                                            </div>
                                            <h2 className="text-4xl font-black text-slate-800 leading-tight mb-4">Linguistic Performance</h2>
                                            <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-xl mx-auto md:mx-0">
                                                {gradingResult.feedback?.summary}
                                            </p>
                                        </div>
                                        <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 flex flex-col items-center justify-center min-w-[200px] shadow-inner">
                                            <div className="text-5xl font-black text-indigo-600 mb-2">{gradingResult.scores?.total || 0}</div>
                                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Final Marks / 28</div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                                        {[
                                            { label: 'Vocab Range', score: gradingResult.scores?.vocabulary || gradingResult.scores?.range || 0 },
                                            { label: 'Contextual Accuracy', score: gradingResult.scores?.grammar_range || gradingResult.scores?.accuracy || 0 },
                                            { label: 'Pronunciation', score: gradingResult.scores?.pronunciation || 0 },
                                            { label: 'Intonation', score: gradingResult.scores?.intonation || 0 }
                                        ].map((stat, i) => (
                                            <div key={i} className="bg-white border-2 border-slate-100 rounded-3xl p-5 flex flex-col items-center group hover:border-indigo-300 transition-all">
                                                <div className="text-2xl font-black text-slate-800 group-hover:text-indigo-600 transition-colors">{stat.score}/7</div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-[2.5rem] mb-12">
                                        <h4 className="flex items-center gap-2 font-black text-emerald-700 uppercase tracking-widest text-xs mb-4">
                                            <Sparkles className="w-4 h-4" />
                                            Mastered Vocabulary
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {quest.practice_sentences.map((ps, i) => (
                                                <span key={i} className="px-4 py-2 bg-white rounded-xl text-sm font-black text-emerald-600 shadow-sm border border-emerald-100">
                                                    {ps.target_word}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <button 
                                            onClick={() => window.location.reload()}
                                            className="flex-1 py-5 bg-slate-100 text-slate-600 rounded-2xl font-black text-lg hover:bg-slate-200 transition-all"
                                        >
                                            Restart Session
                                        </button>
                                        <button 
                                            onClick={() => navigate('/speaking/menu')}
                                            className="flex-1 py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3"
                                        >
                                            Return to Hub
                                            <ArrowRight className="w-6 h-6" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default SpeakingLanguageLab;
