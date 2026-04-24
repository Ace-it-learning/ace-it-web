import React, { useState, useEffect } from 'react';
import { Mail, Globe, FileText, Highlighter, Eraser, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DataFileViewer = ({ dataFiles }) => {
    const [activeTab, setActiveTab] = useState(0);
    const [isHighlightMode, setIsHighlightMode] = useState(true);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [activeColor, setActiveColor] = useState('#fef08a');
    const [localDocs, setLocalDocs] = useState({}); // i -> html string

    const colors = [
        { name: 'Yellow', value: '#fef08a' },
        { name: 'Pink', value: '#fecdd3' },
        { name: 'Blue', value: '#bfdbfe' },
        { name: 'Green', value: '#bbf7d0' },
    ];

    // Initialize local docs with formatted content
    useEffect(() => {
        if (dataFiles) {
            const initial = {};
            dataFiles.forEach((df, i) => {
                // If it's a social media post or table, we handle it specially, 
                // but for standard docs, we want to persist the HTML
                initial[i] = df.content?.replace(/\n/g, '<br />') || '';
            });
            setLocalDocs(initial);
        }
    }, [dataFiles]);

    // Prevent copy-paste
    useEffect(() => {
        const preventDefault = (e) => {
            e.preventDefault();
            alert("Integrity Guard: Copy-pasting from the Data File is prohibited in this simulation. Please re-type your findings to ensure proper language processing.");
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

    const handleMouseUp = () => {
        if (!isHighlightMode) return;
        
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const text = range.toString().trim();
            
            if (text.length > 0) {
                const container = document.getElementById(`doc-content-${activeTab}`);
                if (container && container.contains(range.commonAncestorContainer)) {
                    const span = document.createElement('span');
                    span.style.backgroundColor = activeColor;
                    span.className = 'highlight-span transition-colors duration-200 cursor-default';
                    span.dataset.color = activeColor;
                    
                    try {
                        const content = range.extractContents();
                        span.appendChild(content);
                        range.insertNode(span);
                        
                        // PERSIST: Save the modified HTML back to state
                        setLocalDocs(prev => ({
                            ...prev,
                            [activeTab]: container.innerHTML
                        }));
                    } catch (e) {
                        console.warn("Highlight error:", e);
                    }
                    
                    selection.removeAllRanges();
                }
            }
        }
    };

    const clearHighlights = () => {
        const container = document.getElementById(`doc-content-${activeTab}`);
        if (container) {
            const highlights = container.querySelectorAll('.highlight-span');
            highlights.forEach(h => {
                const parent = h.parentNode;
                while (h.firstChild) parent.insertBefore(h.firstChild, h);
                parent.removeChild(h);
            });
            
            // PERSIST: Update state after clearing
            setLocalDocs(prev => ({
                ...prev,
                [activeTab]: container.innerHTML
            }));
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
            {/* Toolbar */}
            <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between z-10 shadow-sm select-none">
                <div className="flex items-center gap-4">
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button 
                            onClick={() => setIsHighlightMode(true)}
                            className={`p-2 rounded-lg flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${isHighlightMode ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <Highlighter size={14} /> Highlight
                        </button>
                        <button 
                            onClick={clearHighlights}
                            className="p-2 rounded-lg flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-500 transition-all"
                        >
                            <Eraser size={14} /> Clear
                        </button>
                    </div>

                    <div className="h-6 w-px bg-slate-200" />

                    <div className="flex gap-2">
                        {colors.map(color => (
                            <button 
                                key={color.name}
                                onClick={() => setActiveColor(color.value)}
                                className={`w-6 h-6 rounded-full border-2 transition-all ${activeColor === color.value ? 'border-indigo-500 scale-110 shadow-md' : 'border-transparent hover:scale-105'}`}
                                style={{ backgroundColor: color.value }}
                                title={color.name}
                            />
                        ))}
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
                    onMouseUp={handleMouseUp}
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
                                className={`text-slate-700 text-xl leading-relaxed max-w-none ${
                                    dataFiles[activeTab]?.type === 'handwritten_note' ? 'font-handwritten' : 'font-sans'
                                }`}
                            >
                                {dataFiles[activeTab]?.type === 'table' ? (
                                    <div className="overflow-x-auto my-8">
                                        <table className="w-full border-collapse border-2 border-slate-900 font-mono text-sm">
                                            <thead>
                                                <tr className="bg-slate-900 text-white">
                                                    {(dataFiles[activeTab]?.content || "").split('\n')[0]?.split('|').map((h, i) => (
                                                        <th key={i} className="p-4 border border-slate-700 text-left uppercase tracking-widest">{h.trim()}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(dataFiles[activeTab]?.content || "").split('\n').slice(2).map((row, ri) => (
                                                    <tr key={ri} className={ri % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                                                        {row.split('|').map((cell, ci) => (
                                                            <td key={ci} className={`p-4 border border-slate-200 ${cell.includes('Critical') || cell.includes('Over') ? 'text-rose-600 font-black' : ''}`}>
                                                                {cell.trim()}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : dataFiles[activeTab]?.type === 'social_media_post' ? (
                                    <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 relative">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-black text-xl">U</div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900">HK Workers Union</p>
                                                <p className="text-[10px] text-slate-400">@hk_union • 2h ago</p>
                                            </div>
                                            <div className="ml-auto px-4 py-2 bg-rose-500 text-white rounded-full text-[10px] font-black flex items-center gap-2 shadow-lg shadow-rose-200">
                                                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                                SHARED {dataFiles[activeTab]?.content?.match(/Shared ([\d,]+) times/)?.[1] || '4,500'} TIMES
                                            </div>
                                        </div>
                                        <div className="text-2xl font-bold text-slate-800 leading-snug">
                                            {(dataFiles[activeTab]?.content || "").replace(/Shared [\d,]+ times:\n/, '').trim()}
                                        </div>
                                    </div>
                                ) : (
                                    <div 
                                        className="prose prose-slate max-w-none text-inherit"
                                        dangerouslySetInnerHTML={{ __html: localDocs[activeTab] || "" }}
                                    />
                                )}
                            </div>
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
                @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&display=swap');
                
                .font-handwritten {
                    font-family: 'Caveat', cursive;
                    font-size: 1.8rem;
                    color: #1e3a8a;
                    transform: rotate(-1deg);
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
            ` }} />
        </div>
    );
};

export default DataFileViewer;
