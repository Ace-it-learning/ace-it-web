import React from 'react';

const GapAnalysisBar = ({ program, estimatedBest5, t, language }) => {
    const gap = (program.median || 0) - estimatedBest5;
    const isReachable = gap <= 0;
    const isStretch = gap > 0 && gap <= 4;
    const isAmbitious = gap > 4;

    // Static color classes (Tailwind doesn't support dynamic class names)
    const statusConfig = isReachable
        ? { colorClass: 'text-emerald-600', bgClass: 'bg-emerald-500', label: language === 'zh' ? '穩陣' : 'Reachable' }
        : isStretch
            ? { colorClass: 'text-amber-600', bgClass: 'bg-amber-500', label: language === 'zh' ? '搏一搏' : 'Stretch' }
            : { colorClass: 'text-rose-600', bgClass: 'bg-rose-500', label: language === 'zh' ? '進取' : 'Ambitious' };

    const progressWidth = Math.min(100, (estimatedBest5 / (program.median || 1)) * 100);

    return (
        <div className="mt-3">
            <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-400 font-black uppercase tracking-wider">
                    {t.targetScore}: {program.median}
                </span>
                <span className={`font-black uppercase tracking-wide ${statusConfig.colorClass}`}>
                    {gap <= 0 ? '✓ ' : `+${gap} `}{statusConfig.label}
                </span>
            </div>
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-500 ${statusConfig.bgClass}`}
                    style={{ width: `${progressWidth}%` }}
                />
            </div>
        </div>
    );
};

export default GapAnalysisBar;
