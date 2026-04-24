import React from 'react';
import { BrainCircuit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';

/**
 * Standardized full-screen AI grading/submission overlay
 * @param {boolean} isOpen - Whether the overlay is visible
 * @param {string} title - The main heading (e.g. "Evaluating Writing")
 * @param {string} status - The status subtext (e.g. "Miss Janie is reviewing...")
 * @param {number} progress - Progress percentage (0-100)
 */
const GradingOverlay = ({ 
    isOpen, 
    title = "Evaluating Writing", 
    status = "Miss Janie is reviewing your work...", 
    progress 
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-8">
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                    />
                    
                    {/* Content Card */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="bg-white rounded-[2.5rem] p-10 shadow-2xl relative max-w-sm w-full text-center"
                    >
                        <div className="size-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                            <BrainCircuit size={32} className="animate-pulse" />
                        </div>
                        
                        <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight">
                            {title}
                        </h3>
                        
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-8 leading-relaxed">
                            {status}
                        </p>
                        
                        {/* Progress Bar (if provided) */}
                        {typeof progress === 'number' && (
                            <div className="space-y-3">
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <motion.div 
                                        className="h-full bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.4)]"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        transition={{ duration: 0.5 }}
                                    />
                                </div>
                                <div className="flex justify-between items-center px-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        Processing
                                    </p>
                                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                                        {Math.round(progress)}%
                                    </p>
                                </div>
                            </div>
                        )}

                        {!progress && (
                            <div className="flex justify-center">
                                <div className="flex gap-1.5">
                                    <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce"></div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default GradingOverlay;
