import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, AlertTriangle } from 'lucide-react';

const MockCountdownTimer = ({ initialSeconds, onTimeUp, isCritical = 300 }) => {
    const [seconds, setSeconds] = useState(initialSeconds);

    useEffect(() => {
        if (seconds <= 0) {
            onTimeUp?.();
            return;
        }

        const timer = setInterval(() => {
            setSeconds(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [seconds, onTimeUp]);

    const formatTime = (totalSeconds) => {
        const hrs = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;
        
        if (hrs > 0) {
            return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const isNearEnd = seconds <= isCritical;

    return (
        <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all ${
            isNearEnd 
            ? 'bg-rose-50 border-rose-200 text-rose-600 animate-pulse' 
            : 'bg-slate-900 border-slate-800 text-white'
        }`}>
            <Clock size={18} className={isNearEnd ? 'text-rose-500' : 'text-indigo-400'} />
            <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                    Remaining Time
                </span>
                <span className="text-xl font-mono font-black tabular-nums tracking-tight">
                    {formatTime(seconds)}
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
