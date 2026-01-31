import React from 'react';
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
const MasteryRadar = ({ data, historicalData = null, isOverview = false }) => {
    const { t } = useLanguage();

    // Mapping for DSE Levels (1-7 mapped to labels)
    const levelLabels = [
        'N/A', '1', '2', '3', '4', '5', '5*', '5**'
    ];

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

            return (
                <div className="bg-slate-900/95 border border-slate-700 p-3 rounded-lg shadow-2xl backdrop-blur-md max-w-[200px]">
                    <p className="text-slate-100 font-bold text-sm mb-1">{label}</p>
                    <div className="flex justify-between items-center gap-4">
                        <span className="text-slate-400 text-xs">{t('mastery.current')}:</span>
                        <span className="text-cyan-400 font-mono text-sm font-bold">
                            {isOverview ? `Level ${levelLabels[Math.round(valA)] || valA}` : `${Math.round(valA)}%`}
                        </span>
                    </div>
                    {historicalData && valB !== null && (
                        <div className="flex justify-between items-center gap-4 mt-1 border-t border-slate-800 pt-1">
                            <span className="text-slate-500 text-xs">{t('mastery.baseline')}:</span>
                            <span className="text-slate-400 font-mono text-sm">
                                {isOverview ? `Level ${levelLabels[Math.round(valB)] || valB}` : `${Math.round(valB)}%`}
                            </span>
                        </div>
                    )}
                </div>
            );
        }
        return null;
    };

    if (chartData.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-slate-500 italic text-sm">
                No data available for this section yet.
            </div>
        );
    }

    return (
        <div className="w-full h-full flex items-center justify-center p-4">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="90%" data={chartData}>
                    <PolarGrid stroke="#334155" strokeDasharray="3 3" />
                    <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: '#f1f5f9', fontSize: 10, fontWeight: 700 }}
                    />
                    <PolarRadiusAxis
                        angle={90}
                        domain={isOverview ? [0, 7] : [0, 100]}
                        tick={isOverview ? { fill: '#94a3b8', fontSize: 8 } : false}
                        tickFormatter={(val) => isOverview ? levelLabels[val] : val}
                        axisLine={false}
                    />

                    {historicalData && (
                        <Radar
                            name={t('mastery.baseline')}
                            dataKey="B"
                            stroke="#475569"
                            fill="#475569"
                            fillOpacity={0.2}
                            animationBegin={0}
                            animationDuration={1500}
                        />
                    )}

                    <Radar
                        name={t('mastery.current')}
                        dataKey="A"
                        stroke="#22d3ee"
                        fill="#22d3ee"
                        fillOpacity={0.5}
                        animationBegin={200}
                        animationDuration={1500}
                    />

                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#0891b2', strokeWidth: 1 }} />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default MasteryRadar;
