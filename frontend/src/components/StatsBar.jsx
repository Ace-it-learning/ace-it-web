import React, { useEffect, useState } from 'react';
import { Trophy, Clock } from 'lucide-react';

const StatsBar = () => {
    const [stats, setStats] = useState({ xp: 0, level: 1, learningTime: 0 });

    useEffect(() => {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        fetch(`${API_URL}/api/stats`)
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(err => console.error('Failed to fetch stats:', err));
    }, []);

    // Calculate XP percentage safely
    const xpPercentage = (stats.xp / 2000) * 100;

    return (
        <div className="w-full mt-auto">
            <div className="bg-black text-white p-6 rounded-full flex flex-col md:flex-row items-center justify-between gap-8 px-12 shadow-xl border border-white/10">
                <div className="flex items-center gap-6 flex-1 w-full max-w-md">
                    <span className="text-sm font-bold text-primary shrink-0">經驗值 EXP</span>
                    <div className="h-3 bg-white/10 rounded-full flex-1 overflow-hidden">
                        <div
                            className="h-full bg-primary rounded-full shadow-[0_0_15px_rgba(255,106,0,0.5)] transition-all duration-1000"
                            style={{ width: `${xpPercentage}%` }}
                        ></div>
                    </div>
                    <span className="text-xs font-medium text-white/60 shrink-0">{stats.xp} / 2,000</span>
                </div>

                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/40">
                        <Trophy className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Current Status</span>
                        <span className="text-lg font-bold">等級 {stats.level}</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                        <Clock className="w-5 h-5 text-white/60" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Learning Time</span>
                        <span className="text-lg font-bold">{stats.learningTime}小時</span>
                    </div>
                </div>

                <div className="hidden xl:block">
                    <button className="px-8 py-2 rounded-full border border-primary text-primary text-sm font-bold hover:bg-primary hover:text-white transition-all">
                        查看完整成就
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StatsBar;
