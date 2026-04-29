import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Clock, PenTool, BarChart3, Info, Maximize2, Minimize2, CheckCircle } from 'lucide-react';
import MockCountdownTimer from '../utils/MockCountdownTimer';

const WritingStudioHeader = ({ 
    title, 
    status, 
    cloProgress,
    isSidebarOpen, 
    onToggleSidebar, 
    isLeftSidebarOpen,
    onToggleLeftSidebar,
    isCheatMode,
    onCheatInject,
    isMock = false,
    duration = 0,
    onTimeUp,
    onBack // Added for custom back behavior (e.g. Save & Quit modal)
}) => {
    const navigate = useNavigate();
    const [showCheatDropdown, setShowCheatDropdown] = React.useState(false);

    return (
        <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between z-50 sticky top-0 shadow-sm shrink-0">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => {
                        if (onBack) {
                            onBack();
                        } else {
                            navigate('/dashboard', { state: { openRoadmap: 'ENGLISH', roadmapFilter: 'WRITING' } });
                        }
                    }}
                    className="p-2.5 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
                    title="Back"
                >
                    <ArrowLeft size={22} />
                </button>
                
                <button
                    onClick={onToggleLeftSidebar}
                    className={`p-2 rounded-lg transition-all flex items-center gap-2 border ${
                        !isLeftSidebarOpen 
                            ? 'bg-amber-500 border-amber-500 text-white shadow-md' 
                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                    title={isLeftSidebarOpen ? "Hide Briefing" : "Show Briefing"}
                >
                    <PenTool size={16} />
                    <span className="text-xs font-black uppercase tracking-widest hidden lg:block">
                        Briefing
                    </span>
                </button>

                <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block" />

                <div>
                    <div className="flex items-center gap-2 mb-0.5">
                        <h1 className="font-black text-slate-900 tracking-tight text-base sm:text-lg truncate max-w-[120px] sm:max-w-none">{title || "Writing Studio"}</h1>
                        <span className={`px-2 py-0.5 rounded text-xs font-black uppercase tracking-widest flex-shrink-0 ${isMock ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-white'}`}>
                            {isMock ? 'MOCK EXAM' : 'PROCESS'}
                        </span>
                    </div>
                    <div className="text-xs font-black text-slate-400 uppercase tracking-[0.11em] items-center gap-2 hidden sm:flex">
                        HKDSE Paper 2
                        <span className="text-slate-200">|</span>
                        <span className={`flex items-center gap-1 ${status === 'Drafting' ? 'text-green-600' : 'text-slate-400'}`}>
                            <div className={`w-1 h-1 rounded-full ${status === 'Drafting' ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} />
                            {status.toUpperCase()}
                        </span>
                    </div>
                </div>
            </div>

            {/* Core Stats / Status Badges */}
            <div className="flex items-center gap-4">
                {isMock && duration > 0 && (
                    <div className="scale-90 origin-right">
                        <MockCountdownTimer seconds={duration} onTimeUp={onTimeUp} />
                    </div>
                )}

                {/* Admin Cheat Button - Hidden in Mock Mode */}
                {isCheatMode && (
                    <div className="relative">
                        <button
                            onClick={() => setShowCheatDropdown(!showCheatDropdown)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all shadow-lg"
                        >
                            <BarChart3 size={14} className="text-amber-400" />
                            <span className="text-xs font-black uppercase tracking-widest">Admin Intel</span>
                        </button>

                        <AnimatePresence>
                            {showCheatDropdown && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute top-full right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-[100]"
                                >
                                    <div className="p-3 bg-slate-50 border-b border-slate-100">
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Testing Tools: Injection</p>
                                    </div>
                                    <div className="p-1">
                                        {[
                                            { label: 'Inject 5** Excellence', level: '5**', color: 'bg-slate-900' },
                                            { label: 'Inject Level 5 Quality', level: '5', color: 'bg-indigo-600' },
                                            { label: 'Inject Level 4 Standard', level: '4', color: 'bg-emerald-600' },
                                            { label: 'Inject Level 2 Failure', level: '2', color: 'bg-rose-600' }
                                        ].map((option) => (
                                            <button
                                                key={option.level}
                                                onClick={() => {
                                                    onCheatInject(option.level);
                                                    setShowCheatDropdown(false);
                                                }}
                                                className="w-full text-left p-3 hover:bg-slate-50 rounded-xl transition-colors flex items-center gap-3 group"
                                            >
                                                <div className={`w-2 h-2 rounded-full ${option.color}`} />
                                                <span className="text-[10px] font-bold text-slate-700 group-hover:text-slate-900">{option.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                    <div className="p-3 border-t border-slate-100 bg-amber-50/50">
                                        <p className="text-xs font-bold text-amber-700 italic leading-tight">
                                            ⚠️ Warning: This will overwrite current draft content.
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}



                {/* Auto-save Marker (Relocated from Editor) */}
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
                     <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                     <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Auto-save Active</span>
                </div>

                <div className="w-px h-6 bg-slate-200 mx-1" />

                {/* Sidebar Toggle (Focus Mode) */}
                <button
                    onClick={onToggleSidebar}
                    className={`p-2.5 rounded-lg transition-all flex items-center justify-center border ${
                        !isSidebarOpen 
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                    title={isSidebarOpen ? "Enter Focus Mode" : "Exit Focus Mode"}
                >
                    {isSidebarOpen ? <Maximize2 size={16} /> : <Minimize2 size={16} />}

                </button>

            </div>

        </header>
    );
};

export default WritingStudioHeader;
