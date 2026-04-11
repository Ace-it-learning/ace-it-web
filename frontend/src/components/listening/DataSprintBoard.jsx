import React, { useState, useEffect } from 'react';
import { Headphones, Timer, CheckCircle, AlertCircle, Send, Table as TableIcon, ListChecks, Zap, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const DataSprintBoard = ({ questData, onComplete }) => {
    const { user } = useAuth();
    const [answers, setAnswers] = useState({});
    const [isPlaying, setIsPlaying] = useState(false);
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes (HKEAA Standard)
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentAudioSrc, setCurrentAudioSrc] = useState(null);
    const audioRef = React.useRef(null);

    const sprintTasks = questData?.sprint_data?.tasks || [];

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
                task.rows.forEach((row, idx) => { cheatAnswers[`${task.id}_${idx}`] = row.answer; });
            } else if (task.type === 'LIST') {
                task.items.forEach((item, idx) => { cheatAnswers[`${task.id}_${idx}`] = item.answer; });
            } else if (task.type === 'MCQ_BATCH') {
                task.questions.forEach((q, idx) => { cheatAnswers[`${task.id}_${idx}`] = q.answer; });
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
                    text: questData?.sprint_data?.audio_transcript || "Starting Part A exam recording.",
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
        switch (task.type) {
            case 'TABLE':
                return (
                    <div key={task.id} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                        <div className="flex items-center gap-4 mb-6">
                            <span className="w-8 h-8 bg-amber-500 text-white rounded-lg flex items-center justify-center font-black">{idx + 1}</span>
                            <h3 className="text-xl font-bold text-slate-800">{task.label}</h3>
                        </div>
                        <div className="overflow-x-auto rounded-2xl border border-slate-100">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Section</th>
                                        <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Details</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {task.rows.map((row, rIdx) => (
                                        <tr key={rIdx} className="border-t border-slate-50">
                                            <td className="p-4 text-sm font-black text-slate-600 bg-slate-50/50">{row.label}</td>
                                            <td className="p-2">
                                                <input 
                                                    type="text"
                                                    placeholder={row.placeholder}
                                                    className="w-full bg-white border border-slate-100 rounded-xl p-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
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
                    <div key={task.id} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                        <div className="flex items-center gap-4 mb-6">
                            <span className="w-8 h-8 bg-amber-500 text-white rounded-lg flex items-center justify-center font-black">{idx + 1}</span>
                            <h3 className="text-xl font-bold text-slate-800">{task.label}</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {task.items.map((item, iIdx) => (
                                <div key={iIdx}>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">{item.label}</label>
                                    <input 
                                        type="text"
                                        placeholder={item.placeholder}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
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
                    <div key={task.id} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                        <div className="flex items-center gap-4 mb-8">
                            <span className="w-8 h-8 bg-amber-500 text-white rounded-lg flex items-center justify-center font-black">{idx + 1}</span>
                            <h3 className="text-xl font-bold text-slate-800">{task.label}</h3>
                        </div>
                        <div className="space-y-8">
                            {task.questions.map((q, qIdx) => (
                                <div key={qIdx} className="space-y-4">
                                    <p className="font-bold text-slate-800 flex gap-2">
                                        <span className="text-amber-500">Q{qIdx + 11}.</span> {q.question}
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {q.options.map((opt, oIdx) => (
                                            <button
                                                key={oIdx}
                                                onClick={() => handleAnswer(`${task.id}_${qIdx}`, opt[0])}
                                                className={`p-4 rounded-xl border-2 text-left transition-all font-bold text-sm
                                                    ${answers[`${task.id}_${qIdx}`] === opt[0]
                                                        ? 'bg-amber-50 border-amber-500 text-amber-700 shadow-sm' 
                                                        : 'bg-white border-slate-100 text-slate-600 hover:border-slate-300'}
                                                `}
                                            >
                                                {opt}
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
                    <div key={task.id} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                        <div className="flex items-start gap-4 mb-6">
                            <span className="flex-shrink-0 w-8 h-8 bg-slate-900 text-white flex items-center justify-center font-black rounded-lg text-sm">{idx + 1}</span>
                            <h3 className="text-lg font-bold text-slate-800 leading-snug">{task.question}</h3>
                        </div>
                        <div className="ml-12">
                            <input
                                type="text"
                                placeholder="Type answer exactly as heard..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500 outline-none transition-all placeholder:text-slate-400"
                                value={answers[task.id] || ''}
                                onChange={(e) => handleAnswer(task.id, e.target.value)}
                            />
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-700">
            {/* Header / Stats */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-xl ${isPlaying ? 'bg-amber-100 text-amber-600 animate-pulse' : 'bg-slate-100 text-slate-400'}`}>
                        <Headphones size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-800">Part A: The Data Sprint</h2>
                        <p className="text-sm text-slate-500 font-medium tracking-tight">Factual Extraction & Information Retrieval</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    {user?.email === 'fungtam@gmail.com' && (
                        <button 
                            onClick={handleCheat}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-amber-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all border border-amber-400/30 shadow-lg shadow-amber-900/20"
                        >
                            <Zap size={14} className="fill-current" /> Admin Cheat
                        </button>
                    )}
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 text-right">Mission Status</span>
                        <div className="text-xl font-black text-slate-800 text-right">
                             {isPlaying ? 'Assessment Active' : 'Waiting for Briefing'}
                        </div>
                    </div>
                    <button 
                        onClick={handlePlayAudio}
                        disabled={isPlaying}
                        className={`px-6 py-3 rounded-xl font-black transition-all flex items-center gap-2 shadow-sm
                            ${isPlaying ? 'bg-slate-100 text-slate-400' : 'bg-amber-500 text-white hover:bg-amber-600 hover:scale-105 active:scale-95 shadow-amber-100'}
                        `}
                    >
                        {isPlaying ? 'Audio Playing...' : 'Start Audio'}
                    </button>
                </div>
            </div>

            {/* Task Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: QA Book */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    {sprintTasks.map((task, idx) => renderTask(task, idx))}
                </div>

                {/* Right: Summary & Submission */}
                <div className="lg:col-span-4">
                    <div className="sticky top-24 flex flex-col gap-6">
                        {/* Floating Timer */}
                        <div className="bg-slate-900 rounded-3xl p-8 shadow-2xl border-b-4 border-amber-500 text-white">
                            <div className="flex items-center gap-3 mb-4 text-amber-500">
                                <Clock size={20} />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Time Remaining</span>
                            </div>
                            <div className={`text-5xl font-black tabular-nums tracking-tighter mb-4 ${timeLeft < 60 ? 'text-rose-500 animate-pulse' : 'text-white'}`}>
                                {formatTime(timeLeft)}
                            </div>
                            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-amber-500 transition-all duration-1000" 
                                    style={{ width: `${(timeLeft / 600) * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* Progress Tracker */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs">Mission Progress</h3>
                                <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                                    {completedCount} / {totalFields}
                                </span>
                            </div>
                            
                            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden mb-8">
                                <div 
                                    className="bg-indigo-600 h-full transition-all duration-700 ease-out shadow-[0_0_15px_rgba(79,70,229,0.4)]"
                                    style={{ width: `${completionRate}%` }}
                                />
                            </div>

                            <button 
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className={`w-full py-5 rounded-[1.5rem] font-black text-lg transition-all flex items-center justify-center gap-3 shadow-xl
                                    ${completionRate === 100 
                                        ? 'bg-slate-900 text-white hover:bg-black hover:scale-105 active:scale-95 shadow-slate-200' 
                                        : 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none'}
                                `}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        Analyzing...
                                    </>
                                ) : (
                                    <><CheckCircle size={20} /> Finish Part A</>
                                )}
                            </button>
                            
                            <p className="mt-4 text-[10px] text-slate-400 text-center uppercase tracking-widest font-black">
                                Manual Audit Submission
                            </p>
                        </div>

                        <div className="bg-amber-50 border border-amber-100 rounded-[2rem] p-6">
                            <h4 className="font-black text-amber-900 text-sm mb-3 flex items-center gap-2">
                                <AlertCircle size={16} /> Exam Pro-Tip
                            </h4>
                            <p className="text-xs text-amber-800/70 font-bold leading-relaxed">
                                HKDSE markers focus on capitalization for proper nouns (names, places). Use your 10 minutes wisely to proofread your spellings!
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DataSprintBoard;
