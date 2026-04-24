import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, AlertTriangle } from 'lucide-react';

const MockCountdownTimer = ({ seconds: initialSeconds, onTimeUp, isCritical = 300 }) => {
    const [timeLeft, setTimeLeft] = useState(initialSeconds);

    useEffect(() => {
        if (timeLeft <= 0) {
            onTimeUp?.();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, onTimeUp]);

    const formatTime = (totalSeconds) => {
        if (typeof totalSeconds !== 'number' || isNaN(totalSeconds)) return "00:00";
        const hrs = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;
        
        if (hrs > 0) {
            return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const isNearEnd = timeLeft <= isCritical;

    return (
        <div className={`flex items-center gap-4 px-6 py-3 rounded-2xl border transition-all shadow-xl ${
            isNearEnd 
            ? 'bg-rose-50 border-rose-200 text-rose-600 animate-pulse' 
            : 'bg-slate-900 border-slate-800 text-white shadow-slate-900/20'
        }`}>
            <Clock size={20} className={isNearEnd ? 'text-rose-500' : 'text-indigo-400'} />
            <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-widest opacity-60">
                    Remaining Time
                </span>
                <span className="text-xl font-mono font-black tabular-nums tracking-tight">
                    {formatTime(timeLeft)}
                </span>
            </div>
            {isNearEnd && (
                <div className="ml-2">
                    <AlertTriangle size={20} className="text-rose-500" />
                </div>
            )}
        </div>
    );
};

export default MockCountdownTimer;
