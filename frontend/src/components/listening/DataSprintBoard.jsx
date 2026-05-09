import React, { useState, useEffect, useMemo } from 'react';
import { Headphones, Timer, CheckCircle, AlertCircle, Send, Table as TableIcon, ListChecks, Zap, Clock, Play, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AudioWaveform from '../utils/AudioWaveform';
import { isCheatEnabled } from '../../utils/devAccess';

/** Rows per HKEAA-style table block when lab tasks are flat (GAP_FILL / MCQ / etc.). */
const PART_A_TABLE_BATCH = 4;

const truncLabel = (text, max = 140) => {
    const s = (text || '').replace(/\s+/g, ' ').trim();
    if (!s) return 'Item';
    return s.length <= max ? s : `${s.slice(0, max - 1)}…`;
};

/**
 * Firestore / weekly listening exports often use flat `interactive_tasks` (GAP_FILL, MCQ, …).
 * The classic Part A UI expects TABLE blocks with Section | Details. Bundle flat tasks into tables.
 */
const bundleFlatTasksIntoTables = (tasks) => {
    if (!Array.isArray(tasks) || tasks.length === 0) return tasks;
    if (tasks.some((t) => t.type === 'TABLE')) return tasks;
    if (tasks.some((t) => t.type === 'MCQ_BATCH' || t.type === 'LIST')) return tasks;

    const batches = [];
    for (let i = 0; i < tasks.length; i += PART_A_TABLE_BATCH) {
        batches.push(tasks.slice(i, i + PART_A_TABLE_BATCH));
    }

    return batches.map((batch, bi) => ({
        id: `part_a_block_${bi}`,
        type: 'TABLE',
        label: batches.length > 1 ? `Data capture — Block ${bi + 1}` : 'Part A: Data capture',
        rows: batch.map((t) => ({
            label: truncLabel(t.question || t.label || ''),
            placeholder:
                t.type === 'MCQ' || t.type === 'mc'
                    ? 'Choose A–D or type the letter'
                    : t.type === 'GAP_FILL'
                      ? 'Fill the gap…'
                      : 'Your answer',
            sourceTaskId: t.id,
            refTask: t,
            answer: t.answer ?? t.correct_answer,
        })),
    }));
};

const DataSprintBoard = ({ questData, onComplete, userNotes }) => {
    const { user, profile } = useAuth();
    const [answers, setAnswers] = useState({});
    const [isPlaying, setIsPlaying] = useState(false);
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes (HKEAA Standard)
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentAudioSrc, setCurrentAudioSrc] = useState(null);
    const audioRef = React.useRef(null);

    const rawSprintTasks =
        questData?.sprint_data?.tasks || questData?.sprint_data?.interactive_tasks || questData?.tasks || [];

    const sprintTasks = useMemo(
        () => bundleFlatTasksIntoTables(rawSprintTasks),
        [rawSprintTasks, questData?.id]
    );

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


    const handleCheat = () => {
        const cheatAnswers = {};
        sprintTasks.forEach(task => {
            if (task.type === 'TABLE') {
                (task.rows || []).forEach((row, idx) => {
                    if (row.sourceTaskId != null) {
                        const t = row.refTask;
                        cheatAnswers[row.sourceTaskId] =
                            t?.correct_answer ?? t?.answer ?? row.answer ?? '';
                    } else {
                        cheatAnswers[`${task.id}_${idx}`] = row.answer;
                    }
                });
            } else if (task.type === 'LIST') {
                (task.items || []).forEach((item, idx) => { cheatAnswers[`${task.id}_${idx}`] = item.answer; });
            } else if (task.type === 'MCQ_BATCH') {
                (task.questions || []).forEach((q, idx) => { cheatAnswers[`${task.id}_${idx}`] = q.answer; });
            } else if (task.type === 'FORM_FILLING') {
                (task.fields || []).forEach((field, fIdx) => { cheatAnswers[`${task.id}_${fIdx}`] = field.answer; });
            } else {
                cheatAnswers[task.id] = task.correct_answer || task.answer;
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

    const { totalFields, completedCount } = useMemo(() => {
        const filled = (v) => v != null && String(v).trim() !== '';
        let total = 0;
        let done = 0;

        sprintTasks.forEach((t) => {
            if (t.type === 'TABLE') {
                (t.rows || []).forEach((row, rIdx) => {
                    const rt = row.refTask;
                    if (rt?.type === 'FORM_FILLING' && (rt.fields || []).length) {
                        total += rt.fields.length;
                        (rt.fields || []).forEach((_, fIdx) => {
                            if (filled(answers[`${rt.id}_${fIdx}`])) done++;
                        });
                    } else {
                        total += 1;
                        const key = row.sourceTaskId != null ? row.sourceTaskId : `${t.id}_${rIdx}`;
                        if (filled(answers[key])) done++;
                    }
                });
            } else if (t.type === 'LIST') {
                total += t.items?.length || 0;
                (t.items || []).forEach((_, iIdx) => {
                    if (filled(answers[`${t.id}_${iIdx}`])) done++;
                });
            } else if (t.type === 'MCQ_BATCH') {
                total += t.questions?.length || 0;
                (t.questions || []).forEach((_, qIdx) => {
                    if (filled(answers[`${t.id}_${qIdx}`])) done++;
                });
            } else if (t.type === 'FORM_FILLING') {
                total += t.fields?.length || 0;
                (t.fields || []).forEach((_, fIdx) => {
                    if (filled(answers[`${t.id}_${fIdx}`])) done++;
                });
            } else {
                total += 1;
                if (filled(answers[t.id])) done++;
            }
        });

        return { totalFields: total, completedCount: done };
    }, [sprintTasks, answers]);

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

    // TTS Logic (Forced Browser TTS)
    const handlePlayAudio = () => {
        setIsPlaying(true);
        try {
            const text = questData?.sprint_data?.audio_transcript || questData?.audio_transcript || "Starting Part A exam recording.";
            
            if (window.speechSynthesis) window.speechSynthesis.cancel();
            
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

    const renderTask = (task, idx) => {
        const rowAnswerReady = (row, rIdx) => {
            if (row.sourceTaskId != null && row.refTask) {
                const rt = row.refTask;
                if ((rt.type === 'FORM_FILLING' || rt.type === 'form_filling') && (rt.fields || []).length) {
                    return (rt.fields || []).every((_, fIdx) => {
                        const v = answers[`${rt.id}_${fIdx}`];
                        return v != null && String(v).trim() !== '';
                    });
                }
                const key = row.sourceTaskId;
                const v = answers[key];
                return v != null && String(v).trim() !== '';
            }
            const v = answers[`${task.id}_${rIdx}`];
            return v != null && String(v).trim() !== '';
        };

        const isCompleted =
            task.type === 'TABLE'
                ? (task.rows || []).every((row, rIdx) => rowAnswerReady(row, rIdx))
                : task.type === 'LIST'
                  ? (task.items || []).every((_, iIdx) => !!answers[`${task.id}_${iIdx}`])
                  : !!answers[task.id];

        const cardStyle = isCompleted 
            ? 'bg-white border-indigo-100 shadow-md ring-1 ring-indigo-50' 
            : 'bg-white border-slate-100 shadow-sm opacity-90 hover:opacity-100 transition-opacity';

        const renderBundledTableCell = (row, task, rIdx) => {
            const rt = row.refTask;
            const fallbackKey = `${task.id}_${rIdx}`;
            const answerKey = row.sourceTaskId != null ? row.sourceTaskId : fallbackKey;

            if (rt && (rt.type === 'MCQ' || rt.type === 'mc')) {
                return (
                    <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {(rt.options || []).map((opt, oIdx) => {
                                const optionLabel =
                                    typeof opt === 'string'
                                        ? opt.includes(':')
                                            ? opt.split(':')[0].trim()
                                            : opt.includes('.') && opt.length < 5
                                              ? opt.split('.')[0].trim()
                                              : String.fromCharCode(65 + oIdx)
                                        : String.fromCharCode(65 + oIdx);
                                const optionText =
                                    typeof opt === 'string'
                                        ? opt.includes(':')
                                            ? opt.split(':')[1].trim()
                                            : opt.includes('.') && opt.length < 5
                                              ? opt.split('.').slice(1).join('.').trim()
                                              : opt
                                        : opt;
                                return (
                                    <button
                                        key={oIdx}
                                        type="button"
                                        onClick={() => handleAnswer(answerKey, optionLabel)}
                                        className={`p-3 rounded-xl border-2 text-left text-xs font-bold transition-all
                                            ${answers[answerKey] === optionLabel
                                                ? 'bg-indigo-600 border-indigo-600 text-white'
                                                : 'bg-white border-slate-100 text-slate-600 hover:border-indigo-200'}`}
                                    >
                                        <span className="font-black mr-2">{optionLabel}</span>
                                        {optionText}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );
            }

            if (rt && rt.type === 'FORM_FILLING' && (rt.fields || []).length) {
                return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {(rt.fields || []).map((field, fIdx) => (
                            <div key={fIdx} className="space-y-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{field.label}</label>
                                <input
                                    type="text"
                                    placeholder={field.placeholder || '...'}
                                    className="w-full bg-white border-2 border-slate-100 rounded-lg px-3 py-2 text-sm font-bold text-slate-900 focus:border-indigo-500 outline-none"
                                    value={answers[`${rt.id}_${fIdx}`] || ''}
                                    onChange={(e) => handleAnswer(`${rt.id}_${fIdx}`, e.target.value)}
                                />
                            </div>
                        ))}
                    </div>
                );
            }

            return (
                <input
                    type="text"
                    placeholder={row.placeholder || '...'}
                    className="w-full bg-white border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-300"
                    value={answers[answerKey] || ''}
                    onChange={(e) => handleAnswer(answerKey, e.target.value)}
                />
            );
        };

        switch (task.type) {
            case 'TABLE':
                return (
                    <div key={task.id} className={`${cardStyle} p-8 rounded-[2rem] border-2 transition-all duration-500`}>
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <span className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400 text-sm">
                                    {idx + 1}
                                </span>
                                <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">{task.label || "Table Completion"}</h3>
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
                                            <td className="p-4 text-xs font-black text-slate-500 bg-slate-50/50 w-1/3 align-top italic">{row.label}</td>
                                            <td className="p-3 align-top">
                                                {row.refTask
                                                    ? renderBundledTableCell(row, task, rIdx)
                                                    : (
                                                        <input 
                                                            type="text"
                                                            placeholder={row.placeholder || "..."}
                                                            className="w-full bg-white border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-300"
                                                            value={answers[`${task.id}_${rIdx}`] || ""}
                                                            onChange={(e) => handleAnswer(`${task.id}_${rIdx}`, e.target.value)}
                                                        />
                                                    )}
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
                                <span className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400 text-sm">
                                    {idx + 1}
                                </span>
                                <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">{task.label || "Key Point Extraction"}</h3>
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
            case 'FORM_FILLING':
                return (
                    <div key={task.id} className={`${cardStyle} p-8 rounded-[2rem] border-2 transition-all duration-500`}>
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <span className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400 text-sm">
                                    {idx + 1}
                                </span>
                                <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">{task.label || task.question || "Form Filing"}</h3>
                            </div>
                            {isCompleted && <CheckCircle size={24} className="text-emerald-500 animate-in zoom-in duration-300" />}
                        </div>
                        <div className="bg-slate-50 rounded-2xl p-8 border-2 border-slate-100/50">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                                {(task.fields || []).map((field, fIdx) => (
                                    <div key={fIdx} className="space-y-2 group">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block transition-colors group-focus-within:text-indigo-600">
                                            {field.label}
                                        </label>
                                        <input 
                                            type="text"
                                            placeholder={field.placeholder || "..."}
                                            className="w-full bg-white border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all placeholder:text-slate-200"
                                            value={answers[`${task.id}_${fIdx}`] || ""}
                                            onChange={(e) => handleAnswer(`${task.id}_${fIdx}`, e.target.value)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            case 'MCQ':
            case 'mc':
                return (
                    <div key={task.id} className={`${cardStyle} p-8 rounded-[3rem] border-2 transition-all duration-500 group`}>
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-5">
                                <span className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400">
                                    {idx + 1}
                                </span>
                                <h3 className="text-xl font-black text-slate-800 leading-tight tracking-tight max-w-xl group-hover:text-indigo-600 transition-colors">
                                    {task.question}
                                </h3>
                            </div>
                            {isCompleted && <CheckCircle size={28} className="text-emerald-500 shrink-0" />}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-0 sm:ml-16">
                            {(task.options || []).map((opt, oIdx) => {
                                const optionLabel = typeof opt === 'string' ? (opt.includes(':') ? opt.split(':')[0].trim() : (opt.includes('.') && opt.length < 5 ? opt.split('.')[0].trim() : String.fromCharCode(65 + oIdx))) : String.fromCharCode(65 + oIdx);
                                const optionText = typeof opt === 'string' ? (opt.includes(':') ? opt.split(':')[1].trim() : (opt.includes('.') && opt.length < 5 ? opt.split('.').slice(1).join('.').trim() : opt)) : opt;
                                
                                return (
                                    <button
                                        key={oIdx}
                                        onClick={() => handleAnswer(task.id, optionLabel)}
                                        className={`p-5 rounded-2xl border-2 text-left transition-all font-bold text-sm relative overflow-hidden group/btn
                                            ${answers[task.id] === optionLabel
                                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100 ring-4 ring-indigo-50' 
                                                : 'bg-white border-slate-100 text-slate-600 hover:border-indigo-200 hover:bg-white'}
                                        `}
                                    >
                                        <div className="flex items-center gap-4 relative z-10">
                                            <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black transition-colors ${answers[task.id] === optionLabel ? 'bg-white/20' : 'bg-slate-50 text-slate-400 group-hover/btn:bg-indigo-50 group-hover/btn:text-indigo-600'}`}>
                                                {optionLabel}
                                            </span>
                                            <span className="flex-1">{optionText}</span>
                                        </div>
                                        {answers[task.id] === optionLabel && (
                                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 animate-shimmer" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );
            case 'GAP_FILL':
            case 'SHORT_RESPONSE':
                return (
                    <div key={task.id} className={`${cardStyle} p-8 rounded-[3rem] border-2 transition-all duration-500`}>
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <div className="flex items-center gap-5 shrink-0">
                                <span className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg transition-all duration-500 shadow-xl ${isCompleted ? 'bg-indigo-600 text-white shadow-indigo-200' : 'bg-slate-50 text-slate-400'}`}>
                                    {idx + 1}
                                </span>
                            </div>
                            <div className="flex-1 space-y-4">
                                <h3 className="text-xl font-black text-slate-800 leading-tight tracking-tight">
                                    {task.question}
                                </h3>
                                <div className="relative group">
                                    <input
                                        type="text"
                                        placeholder={task.type === 'GAP_FILL' ? "Complete the sentence..." : "Provide precise answer..."}
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 text-slate-900 font-bold text-lg focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-8 focus:ring-indigo-500/5 transition-all placeholder:text-slate-200"
                                        value={answers[task.id] || ''}
                                        onChange={(e) => handleAnswer(task.id, e.target.value)}
                                    />
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 opacity-0 group-focus-within:opacity-100 transition-opacity">
                                        <Zap size={20} className="text-indigo-200 fill-indigo-200" />
                                    </div>
                                </div>
                            </div>
                            {isCompleted && <CheckCircle size={28} className="text-emerald-500 shrink-0 hidden md:block" />}
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
                                <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">{task.label || "Multiple Choice"}</h3>
                            </div>
                            {isCompleted && <CheckCircle size={24} className="text-emerald-500 animate-in zoom-in duration-300" />}
                        </div>
                        <div className="space-y-10">
                            {(task.questions || []).map((q, qIdx) => (
                                <div key={qIdx} className="space-y-5">
                                    <p className="font-extrabold text-slate-800 flex gap-3 leading-snug">
                                        <span className="text-indigo-400 shrink-0">Q{qIdx + 1}.</span> 
                                        {q.question}
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {(q.options || []).map((opt, oIdx) => {
                                            const label = opt[0];
                                            return (
                                                <button
                                                    key={oIdx}
                                                    onClick={() => handleAnswer(`${task.id}_${qIdx}`, label)}
                                                    className={`p-5 rounded-2xl border-2 text-left transition-all font-bold text-sm group
                                                        ${answers[`${task.id}_${qIdx}`] === label
                                                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-900/20' 
                                                            : 'bg-white border-slate-100 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50/30'}
                                                    `}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black shadow-sm ${answers[`${task.id}_${qIdx}`] === label ? 'bg-white/20' : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600'}`}>
                                                            {label}
                                                        </span>
                                                        {opt.substring(3)}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            default:
                return (
                    <div key={task.id} className={`${cardStyle} p-8 rounded-[3rem] border-2 transition-all duration-500`}>
                        <div className="flex items-start gap-5">
                            <span className={`flex-shrink-0 w-12 h-12 flex items-center justify-center font-black rounded-2xl text-xl transition-all duration-500 shadow-xl ${isCompleted ? 'bg-indigo-600 text-white shadow-indigo-200' : 'bg-slate-50 text-slate-400'}`}>
                                {idx + 1}
                            </span>
                            <div className="flex-1">
                                <h3 className="text-xl font-black text-slate-800 leading-tight tracking-tight mb-6">{task.question}</h3>
                                <input
                                    type="text"
                                    placeholder="Enter response..."
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 text-slate-900 font-bold text-lg focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-8 focus:ring-indigo-500/5 transition-all placeholder:text-slate-200"
                                    value={answers[task.id] || ''}
                                    onChange={(e) => handleAnswer(task.id, e.target.value)}
                                />
                            </div>
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
                        {isCheatEnabled(user, profile) && (
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


            </div>

            {/* Task Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left: Question-Answer Book */}
                <div className="lg:col-span-8 flex flex-col gap-8">
                    {sprintTasks.length === 0 ? (
                        <div className="rounded-[2rem] border-2 border-dashed border-slate-200 bg-slate-50/80 p-12 text-center">
                            <TableIcon className="mx-auto mb-4 h-12 w-12 text-slate-300" />
                            <p className="text-lg font-black text-slate-700">No Part A tasks loaded</p>
                            <p className="mt-2 text-sm font-bold text-slate-500">
                                This mission has no <code className="rounded bg-slate-200 px-1.5 py-0.5 text-xs">sprint_data.tasks</code> or{' '}
                                <code className="rounded bg-slate-200 px-1.5 py-0.5 text-xs">interactive_tasks</code> in the database. Refresh after the quest is
                                seeded, or open another listening mission from the roadmap.
                            </p>
                        </div>
                    ) : (
                        sprintTasks.map((task, idx) => renderTask(task, idx))
                    )}
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
                            <div className={`text-7xl font-black tabular-nums tracking-tighter mb-4 relative z-10 transition-colors duration-500 ${timeLeft < 60 ? 'text-rose-500 animate-pulse' : 'text-white'}`}>
                                {formatTime(timeLeft)}
                            </div>
                            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden relative z-10">
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
                                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Real-time Task Completion</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-4xl font-black text-indigo-600 leading-none flex items-center gap-2">
                                        {completedCount} <span className="text-slate-200 text-lg font-bold">/</span> <span className="text-slate-400 text-3xl font-black">{totalFields}</span>
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

                            {/* Rough Notes Display (From Step 2) */}
                            {userNotes && (
                                <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                    <div className="flex items-center gap-2 mb-3">
                                        <ListChecks size={14} className="text-indigo-600" />
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phase 1: Your Notes</h4>
                                    </div>
                                    <div className="bg-amber-50/50 border border-amber-100/50 rounded-2xl p-5 font-mono text-xs text-slate-600 leading-relaxed max-h-[300px] overflow-y-auto whitespace-pre-wrap shadow-inner">
                                        {userNotes}
                                    </div>
                                </div>
                            )}

                            <button 
                                onClick={handleSubmit}
                                disabled={isSubmitting || completionRate < 50}
                                className={`w-full py-6 rounded-[2.5rem] font-black text-xl transition-all flex items-center justify-center gap-3 shadow-2xl relative z-10
                                    ${completionRate >= 50 && !isSubmitting
                                        ? 'bg-indigo-600 text-white hover:bg-indigo-500 hover:scale-[1.02] active:scale-95 shadow-indigo-200' 
                                        : 'bg-slate-50 text-slate-200 cursor-not-allowed shadow-none border border-slate-100'}
                                `}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 size={24} className="animate-spin" />
                                        Analyzing Patterns...
                                    </>
                                ) : (
                                    <><Send size={20} className={completionRate >= 50 ? "fill-current" : ""} /> Finish Part A</>
                                )}
                            </button>
                            
                            <p className="mt-8 text-[9px] text-slate-300 text-center uppercase tracking-[0.2em] font-black opacity-60">
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
