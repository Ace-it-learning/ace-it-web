import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, CheckCircle, Play, Map, Star, Clock, RefreshCcw, Crown } from 'lucide-react';
import { MICRO_SKILLS } from '../../constants/microSkills';

const RoadmapWidget = () => {
    const { user, profile } = useAuth();
    const navigate = useNavigate();
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);

    const tier = profile?.subscription_tier || 'free';

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

    // --- GATING LOGIC ---
    // Returns true if a task is locked for free users
    const isPremiumLocked = (task) => {
        if (tier !== 'free') return false;
        if (task.status === 'COMPLETED') return false; // Always allow repeats of done stuff
        
        // Find first of each type
        const displayTasks = plan.tasks.filter(t => t.type !== 'MOCK');
        const firstOfEachType = [];
        const seenTypes = new Set();
        displayTasks.forEach(t => {
            if (!seenTypes.has(t.type)) {
                seenTypes.add(t.type);
                firstOfEachType.push(t.id);
            }
        });

        // Lock if not the first of its type
        return !firstOfEachType.includes(task.id);
    };

    const handleTaskClick = (task) => {
        if (task.status === 'COMPLETED' || task.locked) return;

        // FREE TIER GATE
        if (isPremiumLocked(task)) {
            navigate('/subscription');
            return;
        }

        // 0. Specialized Challenge Check (Title Fallback)
        if (task.title?.includes('Eraser Challenge')) {
            navigate('/eraser-challenge', {
                state: {
                    topic: task.topic?.replace('Eraser Challenge: ', '') || 'General'
                }
            });
            return;
        }

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
            // REDIRECTION LOGIC FOR SPEAKING
            const topic = task.topic?.toLowerCase() || '';
            const skillId = task.id;
            const skillData = MICRO_SKILLS[skillId];
            const cluster = skillData?.cluster;

            if (topic.includes('speaking') || skillId.startsWith('speaking_')) {
                let targetRoute = '/lab'; // Fallback
                let moduleParam = '';

                if (cluster === 'delivery') {
                    targetRoute = '/speaking/quest/delivery';
                    moduleParam = 'delivery';
                } else if (cluster === 'flow' || skillId === 'speaking_individualResponse') {
                    targetRoute = '/speaking/quest/flow';
                    moduleParam = 'flow';
                } else if (cluster === 'interaction' || skillId === 'speaking_groupDiscussion') {
                    targetRoute = '/speaking/quest/interaction';
                    moduleParam = 'interaction';
                }

                if (targetRoute !== '/lab') {
                    navigate(`${targetRoute}?module=${moduleParam}&level=${plan.level_at_start + 1}&taskId=${task.id}`, {
                        state: {
                            topic: task.topic,
                            taskId: task.id,
                            taskTitle: task.title,
                            taskXp: task.xp
                        }
                    });
                    return;
                }
            }

            // REDIRECTION LOGIC FOR WRITING (Genre Factory)
            if (skillId.startsWith('writing_genre_')) {
                const genreName = skillData?.en?.name || 'General Writing';
                navigate(`/writing/briefing/${encodeURIComponent(genreName)}`, {
                    state: {
                        initialGenre: genreName,
                        taskId: task.id
                    }
                });
                return;
            }

            // Navigate to Lab with Topic Query Param to avoid dashboard redirect
            navigate(`/lab?topic=${encodeURIComponent(task.topic)}`, {
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
            // Navigate to Exam Library
            navigate('/mock-exam');
        } else if (task.type === 'CHALLENGE') {
            // Navigate to Eraser Challenge
            navigate('/eraser-challenge', {
                state: {
                    topic: task.topic?.replace('Eraser Challenge: ', '') || 'General'
                }
            });
        } else if (task.type === 'SPEAKING_CHALLENGE') {
            // Navigate to Speaking Interaction
            navigate('/speaking-interaction', {
                state: {
                    topic: task.topic || 'General Discussion',
                    taskId: task.id
                }
            });
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
                {plan.tasks.filter(t => t.type !== 'MOCK').map((task, idx) => {
                    const locked = isPremiumLocked(task);
                    return (
                        <div
                            key={task.id}
                            onClick={() => handleTaskClick(task)}
                            className={`
                                relative p-3 rounded-lg border transition-all duration-200 group
                                ${locked ? 'bg-slate-50 border-slate-200 opacity-60 grayscale cursor-not-allowed' : 
                                  task.status === 'COMPLETED'
                                    ? 'bg-amber-100 border-amber-500 shadow-[0_4px_12px_rgba(245,158,11,0.2)] ring-1 ring-amber-200'
                                    : task.category === 'SPECIAL' && task.type === 'CHALLENGE'
                                        ? 'bg-purple-50 border-purple-300 hover:border-purple-500 hover:shadow-lg cursor-pointer shadow-purple-100'
                                        : task.category === 'SPECIAL' && task.type === 'SPEAKING_CHALLENGE'
                                            ? 'bg-indigo-50 border-indigo-300 hover:border-indigo-500 hover:shadow-lg cursor-pointer shadow-indigo-100'
                                            : 'bg-white border-slate-200 hover:border-amber-300 hover:shadow-md cursor-pointer'
                                }
                            `}
                        >
                            <div className="flex items-start gap-3">
                                <div className={`
                                    mt-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                                    ${locked ? 'bg-slate-200 text-slate-400' :
                                      task.status === 'COMPLETED'
                                        ? 'bg-amber-100 text-amber-600'
                                        : task.category === 'SPECIAL' && task.type === 'CHALLENGE'
                                            ? 'bg-purple-100 text-purple-600'
                                            : task.category === 'SPECIAL' && task.type === 'SPEAKING_CHALLENGE'
                                                ? 'bg-indigo-100 text-indigo-600'
                                                : 'bg-slate-100 text-slate-500'}
                                `}>
                                    {locked ? <Lock className="w-3 h-3" /> : (task.status === 'COMPLETED' ? <CheckCircle className="w-4 h-4 fill-white" /> : idx + 1)}
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-semibold text-slate-800">
                                        {task.title}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        {locked ? (
                                            <span className="text-[10px] text-slate-400 font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1">
                                                <Crown className="w-2.5 h-2.5" />
                                                PREMIUM QUEST
                                            </span>
                                        ) : task.status === 'COMPLETED' ? (
                                            <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-100 flex items-center gap-1">
                                                <RefreshCcw className="w-2.5 h-2.5" />
                                                REPEAT QUEST
                                            </span>
                                        ) : task.category === 'SPECIAL' ? (
                                            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${task.type === 'CHALLENGE'
                                                ? 'bg-purple-600 text-white'
                                                : 'bg-indigo-600 text-white'
                                                }`}>
                                                {task.type === 'CHALLENGE' ? '⚡ SPECIAL CHALLENGE' : '🎙️ SPECIAL CHALLENGE'}
                                            </span>
                                        ) : (
                                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                                                AI Personalized
                                            </span>
                                        )}
                                        {!locked && (
                                            task.status === 'COMPLETED' ? (
                                                <span className="text-[10px] text-amber-600 font-bold">
                                                    Earned {task.xp} XP
                                                </span>
                                            ) : (
                                                <span className="text-xs text-amber-500 font-medium flex items-center gap-0.5">
                                                    <Star className="w-3 h-3 fill-current" /> +{task.xp} XP
                                                </span>
                                            )
                                        )}
                                    </div>
                                </div>
                                {!locked && (
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${task.status === 'COMPLETED' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-blue-50 text-blue-600'}`}>
                                            <Play className={`w-4 h-4 ml-0.5 ${task.status === 'COMPLETED' ? 'w-3.5 h-3.5' : ''}`} />
                                        </div>
                                    </div>
                                )}
                                {locked && (
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                                            <Lock className="w-4 h-4" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}

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
