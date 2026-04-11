import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const WritingStudioLayout = ({ 
    header, 
    leftColumn, 
    centerColumn, 
    rightColumn, 
    isSidebarOpen = true,
    isLeftSidebarOpen = true
}) => {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans overflow-hidden">
            {/* Unified Header */}
            {header}

            {/* Three-Column Workspace */}
            <main className="flex-1 flex overflow-hidden">
                {/* Left Column: The Briefing - Collapsible for Tablets */}
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

                {/* Center Column: The Studio - Expanded Area */}
                <section className="flex-1 bg-slate-50 flex flex-col overflow-hidden relative border-r border-slate-200">
                    <div className="flex-1 overflow-y-auto p-4 md:p-8">
                        <div className="max-w-4xl mx-auto h-full flex flex-col">
                            {centerColumn}
                        </div>
                    </div>
                </section>

                {/* Right Column: The Control Panel (Dynamic Sidebar) - Reduced Width & Collapsible */}
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
        </div>
    );
};

export default WritingStudioLayout;
