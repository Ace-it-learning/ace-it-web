import React, { useState, useEffect } from 'react';
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Tooltip
} from 'recharts';
import { useLanguage } from '../../context/LanguageContext';

/**
 * MasteryRadar Component
 * Visualizes student performance across 47 micro-skills using a Radar Chart.
 * Supports comparing current mastery vs. historical/initial mastery.
 */
const MasteryRadar = ({ data, historicalData = null, rawSkills = {}, isOverview = false, theme = 'dark', color = '#00aeef' }) => {
    const { t } = useLanguage();
    const isLight = theme === 'light';
    const [tooltipTrigger, setTooltipTrigger] = useState('hover');

    useEffect(() => {
        const canHover = window.matchMedia('(hover: hover)').matches;
        setTooltipTrigger(canHover ? 'hover' : 'click');
    }, []);

    // Mapping for DSE Levels (1-7 mapped to labels)
    const levelLabels = [
        'N/A', '1', '2', '3', '4', '5', '5*', '5**'
    ];

    // Theme-based colors
    const colors = {
        grid: isLight ? '#e2e8f0' : '#334155',
        angleTick: isLight ? '#1e293b' : '#f1f5f9',
        radiusTick: isLight ? '#64748b' : '#94a3b8',
        radarStroke: color,
        radarFill: color,
        histStroke: isLight ? '#94a3b8' : '#475569',
        histFill: isLight ? '#cbd5e1' : '#475569',
        tooltipBg: isLight ? 'bg-white/95' : 'bg-slate-900/95',
        tooltipBorder: isLight ? 'border-slate-200' : 'border-slate-700',
        tooltipText: isLight ? 'text-slate-900' : 'text-slate-100',
        tooltipLabel: isLight ? 'text-slate-500' : 'text-slate-400',
        tooltipValue: color,
    };

    // Process data for Recharts
    const chartData = Object.entries(data).map(([name, value]) => ({
        subject: name,
        A: value,
        B: historicalData ? (historicalData[name] || 0) : 0,
        fullMark: isOverview ? 7 : 100,
    }));

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const valA = payload[0].value;
            const valB = historicalData ? payload[1]?.value : null;

            // Find history for this skill
            let history = [];
            if (!isOverview && rawSkills) {
                for (const [id, sData] of Object.entries(rawSkills)) {
                    if (sData && typeof sData === 'object' && sData.history) {
                        const skillLevel = sData.level || 0;
                        if (Math.abs((skillLevel * 14.28) - valA) < 0.1 || Math.abs(skillLevel - valA) < 0.1) {
                            history = sData.history || [];
                            if (history.length > 0) break;
                        }
                    }
                }
            }

            return (
                <div className={`${colors.tooltipBg} border ${colors.tooltipBorder} p-4 rounded-2xl shadow-2xl backdrop-blur-md min-w-[220px] animate-in zoom-in-95 duration-200`}>
                    <p className={`${colors.tooltipText} font-black text-sm mb-3 border-b ${isLight ? 'border-slate-100' : 'border-slate-800'} pb-2 tracking-tight`}>{label}</p>
                    
                    <div className="flex justify-between items-center mb-1">
                        <span className={`${colors.tooltipLabel} text-[10px] font-black uppercase tracking-wider`}>{t('mastery.current')}:</span>
                        <span className={`${colors.tooltipValue} font-black text-sm`}>
                            Level {levelLabels[isOverview ? Math.round(valA) : Math.round(valA / 14.28)] || '1'}
                        </span>
                    </div>

                    {!isOverview && history.length > 0 && (
                        <div className="mt-4">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 border-t pt-2 border-slate-100 italic">Evidence History</p>
                            <div className="space-y-1.5">
                                {history.slice(-3).reverse().map((h, i) => (
                                    <div key={i} className="flex justify-between items-center bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                                        <span className="text-[9px] font-bold text-slate-500 truncate max-w-[120px]">
                                            {h.activityType || h.type || 'Practice'}
                                        </span>
                                        <span className="text-[10px] font-black text-[#00aeef] ml-2">Lvl {h.grade || h.level}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {historicalData && valB !== null && (
                        <div className={`flex justify-between items-center gap-4 mt-3 border-t ${isLight ? 'border-slate-100' : 'border-slate-800'} pt-2`}>
                            <span className="text-slate-400 text-[10px] font-black uppercase tracking-wider">{t('mastery.baseline')}:</span>
                            <span className="text-slate-400 font-bold text-xs">
                                Level {levelLabels[isOverview ? Math.round(valB) : Math.round(valB / 14.28)] || '1'}
                            </span>
                        </div>
                    )}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full h-full flex items-center justify-center p-4">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="90%" data={chartData}>
                    <PolarGrid stroke={colors.grid} strokeDasharray="3 3" />
                    <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: colors.angleTick, fontSize: 11, fontWeight: 700 }}
                    />
                    <PolarRadiusAxis
                        angle={90}
                        domain={isOverview ? [0, 7] : [0, 100]}
                        tick={isOverview ? { fill: colors.radiusTick, fontSize: 9 } : false}
                        tickFormatter={(val) => isOverview ? levelLabels[val] : val}
                        axisLine={false}
                    />

                    {historicalData && (
                        <Radar
                            name={t('mastery.baseline')}
                            dataKey="B"
                            stroke={colors.histStroke}
                            fill={colors.histFill}
                            fillOpacity={isLight ? 0.3 : 0.2}
                            animationBegin={0}
                            animationDuration={1500}
                        />
                    )}

                    <Radar
                        name={t('mastery.current')}
                        dataKey="A"
                        stroke={colors.radarStroke}
                        fill={colors.radarFill}
                        fillOpacity={isLight ? 0.4 : 0.5}
                        animationBegin={200}
                        animationDuration={1500}
                    />

                    <Tooltip content={<CustomTooltip />} cursor={false} trigger={tooltipTrigger} />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default MasteryRadar;
