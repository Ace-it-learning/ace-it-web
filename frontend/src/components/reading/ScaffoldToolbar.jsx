import React from 'react';
import { Scan, Map, Languages } from 'lucide-react';

/**
 * ScaffoldToolbar - Toggle controls for reading scaffold levels
 * Levels: 1=Vocab Hints, 2=Structure View, 3=Logic Flow
 */
const ScaffoldToolbar = ({ settings, onChange }) => {
    const toggles = [
        {
            key: 'vocab',
            label: 'Vocab Hints',
            icon: Languages,
            activeClasses: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700',
            dotActiveClass: 'bg-emerald-500'
        },
        {
            key: 'structure',
            label: 'X-Ray View',
            icon: Scan,
            activeClasses: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700',
            dotActiveClass: 'bg-blue-500'
        },
        {
            key: 'logic',
            label: 'Argument Map',
            icon: Map,
            activeClasses: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700',
            dotActiveClass: 'bg-purple-500'
        }
    ];

    const handleToggle = (key) => {
        onChange({ ...settings, [key]: !settings[key] });
    };

    return (
        <div className="flex flex-row items-center justify-center p-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 mb-6 w-fit mx-auto shadow-sm">
            <div className="flex flex-row items-center gap-2">
                {toggles.map(({ key, label, icon: Icon, activeClasses, dotActiveClass }) => (
                    <button
                        key={key}
                        onClick={() => handleToggle(key)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all border whitespace-nowrap ${settings[key]
                            ? activeClasses
                            : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-600 hover:border-slate-300'
                            }`}
                    >
                        <Icon className="w-4 h-4" />
                        <span>{label}</span>
                        <div className={`w-2 h-2 rounded-full ${settings[key] ? dotActiveClass : 'bg-slate-300'}`} />
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ScaffoldToolbar;
