import React from 'react';
import { motion } from 'framer-motion';
import { Network, Circle, ChevronRight } from 'lucide-react';

const IdeasMindMap = ({ data }) => {
    if (!data) return null;

    const { center_issue, branches = [] } = data;

    return (
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 overflow-hidden relative min-h-[400px]">
            <div className="absolute top-0 right-0 p-12 opacity-[0.02] -rotate-12 pointer-events-none">
                <Network size={200} />
            </div>

            <div className="relative z-10 flex flex-col items-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-10">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    Logic Map
                </div>

                {/* Center Node */}
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-emerald-600 text-white px-8 py-5 rounded-[2rem] font-black text-sm shadow-2xl shadow-emerald-200 mb-16 relative z-10 text-center max-w-[220px]"
                >
                    {center_issue || "Main Topic"}
                    <div className="absolute top-full left-1/2 -ml-[1px] w-[2px] h-12 bg-emerald-100" />
                </motion.div>

                {/* Branches Container */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full relative">
                    {/* Horizontal Connector Line */}
                    <div className="absolute top-0 left-[25%] right-[25%] h-[2px] bg-emerald-50" />

                    {(branches || []).map((branch, i) => (
                        <motion.div 
                            key={i}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 + (i * 0.1) }}
                            className="flex flex-col items-center"
                        >
                            {/* Branch Connector */}
                            <div className="w-[2px] h-4 bg-emerald-50" />
                            
                            {/* Branch Title */}
                            <div className="bg-slate-50 border border-slate-100 px-6 py-3 rounded-2xl w-full mb-4 text-center group hover:border-emerald-200 transition-colors">
                                <span className="text-[11px] font-black text-slate-800 uppercase tracking-tight flex items-center justify-center gap-2">
                                    <div className="w-1 h-1 rounded-full bg-emerald-400" />
                                    {branch.title}
                                </span>
                            </div>

                            {/* Subpoints */}
                            <div className="space-y-2 w-full">
                                {(branch.sub_points || []).map((point, j) => (
                                    <motion.div 
                                        key={j}
                                        whileHover={{ x: 4 }}
                                        className="bg-white border border-slate-100 p-3 rounded-xl text-[10px] font-bold text-slate-500 shadow-sm flex items-start gap-2 hover:shadow-md transition-all"
                                    >
                                        <ChevronRight className="w-3 h-3 text-emerald-300 shrink-0 mt-0.5" />
                                        <span className="leading-tight text-left">{point}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default IdeasMindMap;
