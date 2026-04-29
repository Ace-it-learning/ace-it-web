import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Rocket, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UpgradeModal = ({ isOpen, onClose, title, message }) => {
    const navigate = useNavigate();

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-8">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                    />
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="bg-white w-full max-w-md p-10 rounded-[3rem] shadow-2xl relative text-center"
                    >
                        <button 
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="size-20 bg-indigo-50 text-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-sm">
                            <Lock size={40} />
                        </div>

                        <h2 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tight">
                            {title || "Premium Feature"}
                        </h2>
                        <p className="text-slate-500 font-medium mb-10 leading-relaxed text-sm">
                            {message || "You've reached the limit of your current plan. Upgrade to unlock unlimited access and AI evaluation."}
                        </p>

                        <div className="space-y-3">
                            <button 
                                onClick={() => {
                                    onClose();
                                    navigate('/subscription');
                                }}
                                className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-900/10 active:scale-95 flex items-center justify-center gap-2"
                            >
                                <Rocket size={16} />
                                Upgrade Now
                            </button>
                            <button 
                                onClick={onClose}
                                className="w-full py-5 bg-slate-50 text-slate-400 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-100 transition-all active:scale-95"
                            >
                                Maybe Later
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default UpgradeModal;
