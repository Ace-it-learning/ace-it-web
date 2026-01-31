import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, CheckCircle, Play, Map, Star, Clock } from 'lucide-react';

const RoadmapWidget = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.uid) fetchRoadmap();
    }, [user]);

    const fetchRoadmap = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const res = await fetch(`${API_URL}/api/roadmap?uid=${user.uid}`);
            if (res.ok) {
                const data = await res.json();
                setPlan(data);
            }
        } catch (error) {
            console.error("Failed to load roadmap", error);
        } finally {
            setLoading(false);
        }
    };

    const handleTaskClick = (task) => {
        if (task.status === 'COMPLETED' || task.locked) return;

        // Smart Navigation based on Task Type
        if (task.type === 'LEARN') {
            // Navigate to Chat with a prompt
            navigate('/', {
                state: {
                    startPrompt: `Help me master this topic: "${task.topic}". Explain the key concepts and give me examples (Level ${plan.level_at_start + 1}).`,
                    activeTaskId: task.id
                }
            });
        } else if (task.type === 'PRACTICE') {
            // Navigate to Lab
            navigate('/lab', {
                state: {
                    autoStart: {
                        topic: task.topic,
                        focus: ["grammar", "vocabulary"],
                        level: Number(plan.level_at_start) + 1
                    },
                    taskId: task.id,
                    taskXp: task.xp,
                    taskTitle: task.title
                }
            });
        } else if (task.type === 'MOCK') {
            // Navigate to Exam Menu
            navigate('/exam/selector'); // Assuming exam selector exists or just general exam page
        }
    };

    if (loading) return <div className="p-4 bg-white rounded-xl shadow-sm animate-pulse h-64"></div>;
    if (!plan) return null;

    const completedCount = plan.tasks.filter(t => t.status === 'COMPLETED' && t.type !== 'MOCK').length;
    const totalKeys = plan.tasks.filter(t => t.type !== 'MOCK').length;
    const bossTask = plan.tasks.find(t => t.type === 'MOCK');

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
            {/* Header */}
            <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Map className="w-4 h-4 text-blue-600" />
                        Personalised Quest
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                        Collect {totalKeys} Keys to unlock the Boss
                    </p>
                </div>
                <div className="text-right">
                    <div className="text-xs font-mono text-slate-400 flex items-center gap-1 justify-end">
                        <Clock className="w-3 h-3" /> 5d 12h left
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="px-4 pt-4">
                <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                    <span>Progress</span>
                    <span>{completedCount}/{totalKeys} Keys</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-blue-500 transition-all duration-500 ease-out"
                        style={{ width: `${(completedCount / totalKeys) * 100}%` }}
                    />
                </div>
            </div>

            {/* Task List */}
            <div className="p-4 flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                {plan.tasks.filter(t => t.type !== 'MOCK').map((task, idx) => (
                    <div
                        key={task.id}
                        onClick={() => handleTaskClick(task)}
                        className={`
                            relative p-3 rounded-lg border transition-all duration-200 group
                            ${task.status === 'COMPLETED'
                                ? 'bg-green-100 border-green-300 opacity-90'
                                : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-md cursor-pointer'
                            }
                        `}
                    >
                        <div className="flex items-start gap-3">
                            <div className={`
                                mt-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                                ${task.status === 'COMPLETED' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'}
                            `}>
                                {task.status === 'COMPLETED' ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                            </div>
                            <div className="flex-1">
                                <h4 className={`text-sm font-semibold ${task.status === 'COMPLETED' ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                                    {task.title}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                        {task.type}
                                    </span>
                                    {task.status === 'COMPLETED' ? (
                                        <span className="text-[10px] text-green-600 font-bold flex items-center gap-0.5">
                                            Earned {task.xp} XP
                                        </span>
                                    ) : (
                                        <span className="text-xs text-amber-500 font-medium flex items-center gap-0.5">
                                            <Star className="w-3 h-3 fill-current" /> +{task.xp} XP
                                        </span>
                                    )}
                                </div>
                            </div>
                            {task.status !== 'COMPLETED' && (
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                                        <Play className="w-4 h-4 ml-0.5" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {/* Boss Task */}
                {bossTask && (
                    <div className={`
                        mt-6 p-4 rounded-xl border-2 flex items-center gap-4 transition-all
                        ${bossTask.locked
                            ? 'border-slate-100 bg-slate-50 text-slate-400 grayscale'
                            : 'border-amber-400 bg-amber-50 text-amber-900 shadow-sm cursor-pointer hover:shadow-md'
                        }
                    `}>
                        <div className={`
                            w-12 h-12 rounded-full flex items-center justify-center shadow-inner
                            ${bossTask.locked ? 'bg-slate-200' : 'bg-amber-400 text-white'}
                        `}>
                            {bossTask.locked ? <Lock className="w-6 h-6" /> : <Star className="w-6 h-6 fill-current animate-pulse" />}
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-sm uppercase tracking-wide">Weekly Boss</h4>
                            <p className="text-sm font-medium leading-tight">{bossTask.title}</p>
                            {!bossTask.locked && (
                                <span className="inline-block mt-1 text-xs bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                                    UNLOCKED • +{bossTask.xp} XP
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RoadmapWidget;
