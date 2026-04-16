import React, { useState, useEffect } from 'react';
import { Headphones, Timer, CheckCircle, AlertCircle, Send, Table as TableIcon, ListChecks, Zap, Clock, Play, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AudioWaveform from '../utils/AudioWaveform';

const DataSprintBoard = ({ questData, onComplete }) => {
    const { user } = useAuth();
    const [answers, setAnswers] = useState({});
    const [isPlaying, setIsPlaying] = useState(false);
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes (HKEAA Standard)
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentAudioSrc, setCurrentAudioSrc] = useState(null);
    const audioRef = React.useRef(null);

    const sprintTasks = questData?.sprint_data?.tasks || questData?.sprint_data?.interactive_tasks || [];

    // Cleanup audio on unmount
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    const handleCheat = () => {
        const cheatAnswers = {};
        sprintTasks.forEach(task => {
            if (task.type === 'TABLE') {
                (task.rows || []).forEach((row, idx) => { cheatAnswers[`${task.id}_${idx}`] = row.answer; });
            } else if (task.type === 'LIST') {
                (task.items || []).forEach((item, idx) => { cheatAnswers[`${task.id}_${idx}`] = item.answer; });
            } else if (task.type === 'MCQ_BATCH') {
                (task.questions || []).forEach((q, idx) => { cheatAnswers[`${task.id}_${idx}`] = q.answer; });
            } else {
                cheatAnswers[task.id] = task.answer;
            }
        });
        setAnswers(cheatAnswers);
        console.log("Admin Cheat Activated: Part A answers populated.");
    };

    useEffect(() => {
        let timer;
        if (isPlaying && timeLeft > 0) {
            timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        }
        return () => clearInterval(timer);
    }, [isPlaying, timeLeft]);

    const handleAnswer = (id, val) => {
        setAnswers(prev => ({ ...prev, [id]: val }));
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const totalFields = sprintTasks.reduce((acc, t) => {
        if (t.type === 'TABLE') return acc + (t.rows?.length || 0);
        if (t.type === 'LIST') return acc + (t.items?.length || 0);
        if (t.type === 'MCQ_BATCH') return acc + (t.questions?.length || 0);
        return acc + 1;
    }, 0);
    const completedCount = Object.values(answers).filter(v => v && String(v).trim()).length;
    const completionRate = totalFields > 0 ? Math.floor((completedCount / totalFields) * 100) : 0;

    const handleSubmit = async () => {
        // Stop audio immediately on finish
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
            setIsPlaying(false);
        }

        setIsSubmitting(true);
        try {
            console.log(`[DataSprint] Submitting Part A answers for evaluation...`);
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const res = await fetch(`${API_URL}/api/lab/evaluate_sprint`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    questId: questData.id,
                    answers: answers,
                    uid: user?.uid || 'anonymous'
                })
            });

            if (res.ok) {
                const evaluation = await res.json();
                onComplete(evaluation, currentAudioSrc); // Just pass whatever we have
            } else {
                onComplete({ score: 0, feedback: "Evaluation service failed." }, currentAudioSrc);
            }
        } catch (e) {
            console.error("Sprint Evaluation Error:", e);
            onComplete({ score: 0, feedback: "Evaluation service currently unavailable. Please retry later." }, currentAudioSrc);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePlayAudio = async () => {
        setIsPlaying(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/lab/tts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: questData?.sprint_data?.audio_transcript || questData?.audio_transcript || "Starting Part A exam recording.",
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

    const renderTask = (task, idx) => {
        const isCompleted = task.type === 'TABLE' 
            ? (task.rows || []).every((_, rIdx) => !!answers[`${task.id}_${rIdx}`])
            : task.type === 'LIST'
            ? (task.items || []).every((_, iIdx) => !!answers[`${task.id}_${iIdx}`])
            : !!answers[task.id];

        const cardStyle = isCompleted 
            ? 'bg-white border-indigo-100 shadow-md ring-1 ring-indigo-50' 
            : 'bg-white border-slate-100 shadow-sm opacity-90 hover:opacity-100 transition-opacity';

        switch (task.type) {
            case 'TABLE':
                return (
                    <div key={task.id} className={`${cardStyle} p-8 rounded-[2rem] border-2 transition-all duration-500`}>
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <span className={`w-10 h-10 rounded-xl flex items-center justify-center font-black transition-colors ${isCompleted ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                    {idx + 1}
                                </span>
                                <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">{task.label}</h3>
                            </div>
                            {isCompleted && <CheckCircle size={24} className="text-emerald-500 animate-in zoom-in duration-300" />}
                        </div>
                        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/30">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Section</th>
                                        <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Details</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(task.rows || []).map((row, rIdx) => (
                                        <tr key={rIdx} className="border-t border-slate-100/50 group">
                                            <td className="p-4 text-xs font-black text-slate-500 bg-slate-50/50 w-1/3 italic">{row.label}</td>
                                            <td className="p-3">
                                                <input 
                                                    type="text"
                                                    placeholder={row.placeholder}
                                                    className="w-full bg-white border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-300"
                                                    value={answers[`${task.id}_${rIdx}`] || ""}
                                                    onChange={(e) => handleAnswer(`${task.id}_${rIdx}`, e.target.value)}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'LIST':
                return (
                    <div key={task.id} className={`${cardStyle} p-8 rounded-[2rem] border-2 transition-all duration-500`}>
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <span className={`w-10 h-10 rounded-xl flex items-center justify-center font-black transition-colors ${isCompleted ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                    {idx + 1}
                                </span>
                                <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">{task.label}</h3>
                            </div>
                            {isCompleted && <CheckCircle size={24} className="text-emerald-500 animate-in zoom-in duration-300" />}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {(task.items || []).map((item, iIdx) => (
                                <div key={iIdx} className="relative group">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block group-focus-within:text-indigo-600 transition-colors">{item.label}</label>
                                    <input 
                                        type="text"
                                        placeholder={item.placeholder || "Enter details..."}
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-300"
                                        value={answers[`${task.id}_${iIdx}`] || ""}
                                        onChange={(e) => handleAnswer(`${task.id}_${iIdx}`, e.target.value)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'MCQ_BATCH':
                return (
                    <div key={task.id} className={`${cardStyle} p-8 rounded-[2rem] border-2 transition-all duration-500`}>
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-4">
                                <span className={`w-10 h-10 rounded-xl flex items-center justify-center font-black transition-colors ${isCompleted ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                    {idx + 1}
                                </span>
                                <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">{task.label}</h3>
                            </div>
                            {isCompleted && <CheckCircle size={24} className="text-emerald-500 animate-in zoom-in duration-300" />}
                        </div>
                        <div className="space-y-10">
                            {(task.questions || []).map((q, qIdx) => (
                                <div key={qIdx} className="space-y-5">
                                    <p className="font-extrabold text-slate-800 flex gap-3 leading-snug">
                                        <span className="text-indigo-400 shrink-0">Q{qIdx + 11}.</span> 
                                        {q.question}
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {(q.options || []).map((opt, oIdx) => (
                                            <button
                                                key={oIdx}
                                                onClick={() => handleAnswer(`${task.id}_${qIdx}`, opt[0])}
                                                className={`p-5 rounded-2xl border-2 text-left transition-all font-bold text-sm group
                                                    ${answers[`${task.id}_${qIdx}`] === opt[0]
                                                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-900/20' 
                                                        : 'bg-white border-slate-100 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50/30'}
                                                `}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black shadow-sm ${answers[`${task.id}_${qIdx}`] === opt[0] ? 'bg-white/20' : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600'}`}>
                                                        {opt[0]}
                                                    </span>
                                                    {opt.substring(3)}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            default:
                return (
                    <div key={task.id} className={`${cardStyle} p-8 rounded-[2rem] border-2 transition-all duration-500`}>
                        <div className="flex items-start gap-4 mb-8">
                            <span className={`flex-shrink-0 w-10 h-10 flex items-center justify-center font-black rounded-xl text-sm transition-colors ${isCompleted ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-white'}`}>
                                {idx + 1}
                            </span>
                            <h3 className="text-xl font-extrabold text-slate-800 leading-tight tracking-tight">{task.question}</h3>
                        </div>
                        <div className="ml-14">
                            <input
                                type="text"
                                placeholder="Capture details precisely..."
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 text-slate-900 font-bold text-lg focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-300"
                                value={answers[task.id] || ''}
                                onChange={(e) => handleAnswer(task.id, e.target.value)}
                            />
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="flex flex-col gap-8 animate-in fade-in duration-1000">
            {/* High-Fidelity Header / Waveform Section */}
            <div className="bg-white p-8 rounded-[3rem] shadow-2xl shadow-indigo-900/5 border border-slate-100 flex flex-col gap-8 relative overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-6 relative z-10">
                    <div className="flex items-center gap-6">
                        <div className={`p-5 rounded-2xl transition-all duration-500 shadow-lg ${isPlaying ? 'bg-indigo-600 text-white shadow-indigo-900/40 animate-pulse' : 'bg-slate-100 text-slate-400 shadow-slate-200'}`}>
                            <Headphones size={32} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md">Mission Alpha</span>
                                <h2 className="text-3xl font-black text-slate-900 tracking-tighter tabular-nums">Part A: The Data Sprint</h2>
                            </div>
                            <p className="text-sm text-slate-500 font-bold italic tracking-tight opacity-70">Focus: Dynamic Information Extraction (1.0x Speed)</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {user?.email === 'fungtam@gmail.com' && (
                            <button 
                                onClick={handleCheat}
                                className="flex items-center gap-2 px-6 py-4 bg-slate-900 text-amber-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all border border-amber-400/30 shadow-xl shadow-amber-900/20"
                            >
                                <Zap size={18} className="fill-current" /> Admin Cheat
                            </button>
                        )}
                        <button 
                            onClick={handlePlayAudio}
                            disabled={isPlaying}
                            className={`px-10 py-5 rounded-2xl font-black text-lg transition-all flex items-center gap-3 shadow-xl
                                ${isPlaying ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-500 hover:scale-105 active:scale-95 shadow-indigo-900/20'}
                            `}
                        >
                            {isPlaying ? (
                                <><Loader2 size={24} className="animate-spin" /> Recording Live...</>
                            ) : (
                                <><Play size={24} className="fill-current" /> Start Audio Briefing</>
                            )}
                        </button>
                    </div>
                </div>

                {/* Integrated Waveform Component */}
                <div className={`transition-all duration-700 overflow-hidden ${isPlaying ? 'max-h-[150px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="bg-slate-50 rounded-[2rem] p-6 border-2 border-indigo-50 border-dashed">
                        <AudioWaveform 
                            audioSrc={currentAudioSrc} 
                            isPlaying={isPlaying} 
                            height={80}
                            waveColor="#cbd5e1"
                            progressColor="#6366f1"
                        />
                    </div>
                </div>
            </div>

            {/* Task Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left: Question-Answer Book */}
                <div className="lg:col-span-8 flex flex-col gap-8">
                    {sprintTasks.map((task, idx) => renderTask(task, idx))}
                </div>

                {/* Right: Summary & Control Panel */}
                <div className="lg:col-span-4">
                    <div className="sticky top-28 flex flex-col gap-8 animate-in slide-in-from-right duration-500">
                        {/* Digital Examination Timer (Floating) */}
                        <div className="bg-slate-900 rounded-[2.5rem] p-10 shadow-2xl border-b-[8px] border-indigo-500 text-white relative overflow-hidden group">
                            <div className="flex items-center gap-3 mb-6 relative z-10">
                                <Clock size={22} className="text-indigo-400" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Exam Remaining</span>
                            </div>
                            <div className={`text-6xl font-black tabular-nums tracking-tighter mb-6 relative z-10 transition-colors duration-500 ${timeLeft < 60 ? 'text-rose-500 animate-pulse' : 'text-white'}`}>
                                {formatTime(timeLeft)}
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden relative z-10">
                                <div 
                                    className="h-full bg-indigo-500 transition-all duration-1000 shadow-[0_0_20px_rgba(99,102,241,0.5)]" 
                                    style={{ width: `${(timeLeft / 600) * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* High-Fidelity Progress Card */}
                        <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-100 overflow-hidden relative">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs mb-1">Audit Status</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Real-time Task Completion</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-3xl font-black text-indigo-600 leading-none">
                                        {completedCount}<span className="text-slate-200 text-sm mx-1">/</span>{totalFields}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden mb-10 p-1 shadow-inner">
                                <div 
                                    className="bg-indigo-600 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(79,70,229,0.3)] relative"
                                    style={{ width: `${completionRate}%` }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite]" />
                                </div>
                            </div>

                            <button 
                                onClick={handleSubmit}
                                disabled={isSubmitting || completionRate < 50}
                                className={`w-full py-6 rounded-[2rem] font-black text-xl transition-all flex items-center justify-center gap-3 shadow-2xl relative z-10
                                    ${completionRate >= 50 && !isSubmitting
                                        ? 'bg-slate-900 text-white hover:bg-black hover:scale-[1.02] active:scale-95 shadow-slate-300' 
                                        : 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none'}
                                `}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 size={24} className="animate-spin" />
                                        Analyzing Patterns...
                                    </>
                                ) : (
                                    <><Send size={20} /> Finish Part A</>
                                )}
                            </button>
                            
                            <p className="mt-6 text-[10px] text-slate-400 text-center uppercase tracking-[0.2em] font-black italic opacity-60">
                                Verify all fields before submission
                            </p>
                        </div>

                        {/* Examiner Insight Pill */}
                        <div className="bg-indigo-50/50 border-2 border-indigo-100 border-dashed rounded-[2.5rem] p-8">
                            <h4 className="font-extrabold text-indigo-900 text-sm mb-4 flex items-center gap-3">
                                <AlertCircle size={20} className="text-indigo-600" /> 
                                Examiner Intelligence
                            </h4>
                            <p className="text-xs text-indigo-800/70 font-bold leading-relaxed">
                                Most students lose marks on Part A due to **spelling inconsistencies**. Ensure your answers match the audio transcript accurately. 
                                <br/><br/>
                                <span className="text-indigo-600 uppercase tracking-widest text-[10px]">Tip: Watch out for plurals!</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DataSprintBoard;
