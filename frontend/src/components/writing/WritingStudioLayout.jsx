import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const WritingStudioLayout = ({ 
    header, 
    leftColumn, 
    centerColumn, 
    rightColumn, 
    isSidebarOpen = true,
    isLeftSidebarOpen = true,
    children // Added for modals/overlays
}) => {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans overflow-hidden relative">
            {/* Unified Header */}
            {header}

            {/* Three-Column Workspace */}
            <main className="flex-1 flex overflow-hidden">
                {/* ... existing columns ... */}
                {/* [Previous column code preserved exactly] */}
                <AnimatePresence>
                    {isLeftSidebarOpen && (
                        <motion.aside 
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: typeof window !== 'undefined' && window.innerWidth < 1024 ? 260 : 320, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="bg-white border-r border-slate-200 flex flex-col shrink-0 overflow-y-auto"
                        >
                            <div className="w-[260px] lg:w-[320px]">
                                {leftColumn}
                            </div>
                        </motion.aside>
                    )}
                </AnimatePresence>

                <section className="flex-1 bg-slate-50 flex flex-col overflow-hidden relative border-r border-slate-200">
                    <div className="flex-1 overflow-y-auto p-4 md:p-8">
                        <div className="max-w-4xl mx-auto h-full flex flex-col">
                            {centerColumn}
                        </div>
                    </div>
                </section>

                <AnimatePresence>
                    {isSidebarOpen && (
                        <motion.aside 
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: typeof window !== 'undefined' && window.innerWidth < 1024 ? 260 : 320, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="bg-white flex flex-col shrink-0 overflow-y-auto"
                        >
                            <div className="w-[260px] lg:w-[320px]">
                                {rightColumn}
                            </div>
                        </motion.aside>
                    )}
                </AnimatePresence>
            </main>

            {/* Render overlays/modals here */}
            {children}
        </div>
    );
};

export default WritingStudioLayout;
