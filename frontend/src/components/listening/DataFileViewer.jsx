import React, { useState, useEffect, useRef } from 'react';
import { Mail, Globe, FileText, Highlighter, Eraser, AlertTriangle, ChevronLeft, ChevronRight, Zap, Edit3, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DataFileViewer = ({ dataFiles, localDocs, setLocalDocs }) => {
    const [activeTab, setActiveTab] = useState(0);
    const [isHighlightMode, setIsHighlightMode] = useState(true);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [activeColor, setActiveColor] = useState('rgba(254, 240, 212, 0.6)');

    const colors = [
        { name: 'Yellow', value: 'rgba(254, 240, 212, 0.6)' },
        { name: 'Blue', value: 'rgba(219, 234, 254, 0.6)' },
        { name: 'Green', value: 'rgba(220, 252, 231, 0.6)' },
        { name: 'Red', value: 'rgba(254, 226, 226, 0.6)' },
    ];

    // Prevent copy-paste - REMOVED to align with General Quest behavior and resolve selection issues
    /* 
    useEffect(() => {
        const preventDefault = (e) => {
            e.preventDefault();
        };

        const container = document.getElementById('data-file-content');
        if (container) {
            container.addEventListener('copy', preventDefault);
            container.addEventListener('cut', preventDefault);
            container.addEventListener('dragstart', preventDefault);
        }

        return () => {
            if (container) {
                container.removeEventListener('copy', preventDefault);
                container.removeEventListener('cut', preventDefault);
                container.removeEventListener('dragstart', preventDefault);
            }
        };
    }, [activeTab]);
    */

    useEffect(() => {
        const handleGlobalMouseUp = (e) => {
            if (!isHighlightMode) return;
            
            const selection = window.getSelection();
            if (!selection || selection.isCollapsed || selection.rangeCount === 0) return;

            const range = selection.getRangeAt(0);
            
            // Search for the specific document content container
            // We use a more robust check by looking up the DOM tree from the selection's ancestor
            let container = range.commonAncestorContainer;
            if (container.nodeType === 3) container = container.parentNode;
            
            const targetId = `doc-content-${activeTab}`;
            const docContainer = document.getElementById(targetId);
            
            if (docContainer && docContainer.contains(container)) {
                try {
                    const selectedText = selection.toString().trim();
                    if (selectedText.length === 0) return;

                    // Create the highlight span
                    const span = document.createElement('span');
                    span.className = 'highlight-span transition-colors duration-200';
                    span.style.backgroundColor = activeColor;
                    span.dataset.color = activeColor;
                    
                    try {
                        // Attempt to wrap simple text
                        range.surroundContents(span);
                    } catch (surroundErr) {
                        // Fallback for complex selections (e.g. across paragraphs or strong tags)
                        const fragment = range.extractContents();
                        span.appendChild(fragment);
                        range.insertNode(span);
                    }

                    // CRITICAL: Sync DOM changes back to the shared localDocs state
                    setTimeout(() => {
                        const updatedHTML = docContainer.innerHTML;
                        setLocalDocs(prev => ({
                            ...prev,
                            [activeTab]: updatedHTML
                        }));
                        selection.removeAllRanges();
                    }, 20);
                    
                } catch (err) {
                    console.error("Highlighting process failed:", err);
                }
            }
        };

        document.addEventListener('mouseup', handleGlobalMouseUp);
        return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
    }, [isHighlightMode, activeTab, activeColor, localDocs]);

    const clearHighlights = () => {
        const container = document.getElementById(`doc-content-${activeTab}`);
        if (container) {
            // Remove all spans/fonts with the highlight class
            const highlights = container.querySelectorAll('.highlight-span');
            highlights.forEach(h => {
                const parent = h.parentNode;
                if (parent) {
                    while (h.firstChild) {
                        parent.insertBefore(h.firstChild, h);
                    }
                    parent.removeChild(h);
                }
            });

            // Fallback: Remove any inline styles for background color that might have missed the class
            const allSpans = container.querySelectorAll('span[style*="background-color"]');
            allSpans.forEach(s => {
                const parent = s.parentNode;
                if (parent) {
                    while (s.firstChild) {
                        parent.insertBefore(s.firstChild, s);
                    }
                    parent.removeChild(s);
                }
            });
            
            // PERSIST: Update state after clearing
            const cleanedHTML = container.innerHTML;
            setLocalDocs(prev => ({
                ...prev,
                [activeTab]: cleanedHTML
            }));
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
            {/* Toolbar */}
            <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between z-10 shadow-sm select-none">
                <div className="flex items-center gap-4">
                    <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100 shadow-inner items-center gap-2">
                        <button 
                            onClick={() => setIsHighlightMode(!isHighlightMode)}
                            className={`p-2.5 rounded-xl transition-all ${isHighlightMode ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white text-slate-400 hover:text-slate-600'}`}
                            title={isHighlightMode ? "Disable Highlighter" : "Enable Highlighter"}
                        >
                            {isHighlightMode ? <Zap size={16} fill="currentColor" /> : <Edit3 size={16} />}
                        </button>
                        
                        <div className="w-[1px] h-4 bg-slate-200 mx-1" />

                        <div className="flex items-center gap-1.5">
                            {colors.map(color => (
                                <button 
                                    key={color.name}
                                    onClick={() => {
                                        setActiveColor(color.value);
                                        setIsHighlightMode(true);
                                    }}
                                    className={`w-6 h-6 rounded-lg border-2 transition-all hover:scale-110 active:scale-95 ${activeColor === color.value ? 'border-indigo-500 ring-4 ring-indigo-50' : 'border-white shadow-sm'}`}
                                    style={{ backgroundColor: color.value }}
                                    title={color.name}
                                />
                            ))}
                        </div>

                        <div className="w-[1px] h-4 bg-slate-200 mx-1" />

                        <button 
                            onClick={clearHighlights}
                            className="p-2.5 bg-white text-slate-400 hover:bg-rose-50 hover:text-rose-500 rounded-xl transition-all"
                            title="Clear all highlights"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-lg text-amber-700 border border-amber-100">
                    <AlertTriangle size={14} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Copy-Paste Disabled</span>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Document Sidebar */}
                <motion.aside 
                    animate={{ width: isCollapsed ? 80 : 256 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                    className="bg-white border-r border-slate-200 flex flex-col shadow-inner overflow-hidden relative select-none"
                >
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                        {!isCollapsed && (
                            <div className="min-w-0">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Data File</p>
                                <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight truncate">Evidence Portfolio</h3>
                            </div>
                        )}
                        <button 
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className={`p-2 rounded-lg hover:bg-slate-200 text-slate-400 transition-all ${isCollapsed ? 'mx-auto' : ''}`}
                        >
                            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                        </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                        {dataFiles.map((df, i) => (
                            <button 
                                key={df.id || i}
                                onClick={() => setActiveTab(i)}
                                className={`w-full text-left rounded-xl transition-all flex items-center group relative overflow-hidden ${isCollapsed ? 'aspect-square justify-center p-0' : 'p-3 gap-3'} ${activeTab === i ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'hover:bg-slate-50 text-slate-500'}`}
                                title={df.title}
                            >
                                <div className={`shrink-0 flex items-center justify-center transition-colors ${isCollapsed ? 'w-10 h-10 rounded-full' : 'w-8 h-8 rounded-lg'} ${activeTab === i ? 'bg-white/20' : 'bg-slate-100 group-hover:bg-white text-slate-400 group-hover:text-indigo-500'}`}>
                                    {isCollapsed ? (
                                        <span className="text-[10px] font-black">{i + 1}</span>
                                    ) : (
                                        df.type === 'email' ? <Mail size={16} /> : df.type === 'webpage' ? <Globe size={16} /> : <FileText size={16} />
                                    )}
                                </div>
                                {!isCollapsed && (
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className={`text-[8px] font-black uppercase tracking-widest ${activeTab === i ? 'text-indigo-200' : 'text-slate-400'}`}>Doc {i + 1}</span>
                                        </div>
                                        <p className={`text-[10px] font-bold leading-tight line-clamp-1 ${activeTab === i ? 'text-white' : 'text-slate-700'}`}>
                                            {df.title || `Document ${i + 1}`}
                                        </p>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </motion.aside>

                {/* Document Content */}
                <div 
                    id="data-file-content"
                    className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50/50 select-text"
                >
                <AnimatePresence mode="wait">
                    <motion.div 
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="max-w-5xl mx-auto w-full"
                    >
                        <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
                            {/* Decorative Elements */}
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />
                            <div className="absolute top-8 right-8 text-[10px] font-black text-slate-200 uppercase tracking-[0.4em] rotate-90 origin-right">
                                HKEAA CONFIDENTIAL
                            </div>

                            <div className="mb-12 border-b-2 border-slate-100 pb-10">
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="px-3 py-1 bg-slate-900 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded">Doc {activeTab + 1}</span>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{dataFiles[activeTab]?.type}</span>
                                </div>
                                <h2 className="text-4xl font-black text-slate-900 leading-tight tracking-tight">
                                    {dataFiles[activeTab]?.title}
                                </h2>
                            </div>

                            <div 
                                id={`doc-content-${activeTab}`}
                                className={`prose prose-slate max-w-none text-slate-700 text-xl leading-relaxed select-text ${
                                    dataFiles[activeTab]?.visual_style === 'scrawled_handwriting' ? 'font-scrawled' :
                                    dataFiles[activeTab]?.type === 'handwritten_note' ? 'font-handwritten' : 'font-sans'
                                }`}
                                dangerouslySetInnerHTML={{ __html: localDocs[activeTab] || "" }}
                            />
                        </div>

                        {/* Footer Citation */}
                        <div className="mt-8 flex items-center justify-between px-8">
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Digital Examination Booklet v4.2</p>
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Page {activeTab + 1} of {dataFiles.length}</p>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
            
            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=Permanent+Marker&display=swap');
                
                .font-handwritten {
                    font-family: 'Caveat', cursive;
                    font-size: 1.8rem;
                    color: #1e3a8a;
                    transform: rotate(-1deg);
                }
                .font-scrawled {
                    font-family: 'Permanent Marker', cursive;
                    font-size: 1.5rem;
                    color: #0f172a;
                    transform: rotate(1deg);
                    line-height: 1.4;
                }
                .highlight-span {
                    border-radius: 4px;
                    padding: 0 2px;
                    cursor: default;
                }
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .select-text {
                    user-select: text !important;
                    -webkit-user-select: text !important;
                }
            ` }} />
        </div>
    );
};

export default DataFileViewer;
