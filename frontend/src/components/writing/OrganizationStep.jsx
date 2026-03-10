import React, { useState } from 'react';
import { Link as LinkIcon, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';

const OrganizationStep = ({ content, onUpdate, onSubmit, isSubmitting, pillarData }) => {
    // Helper to intelligently split content into segments (grouping short lines like addresses/signatures)
    const segmentText = (text) => {
        if (!text) return [];

        // 1. Initial split by double newlines (hard paragraph breaks)
        const blocks = text.split(/\n\s*\n/).filter(b => b.trim().length > 0);
        const segments = [];

        blocks.forEach(block => {
            const lines = block.split('\n').map(l => l.trim()).filter(l => l.length > 0);

            // Heuristic: If all lines in this block are short (< 60 chars), keep them together
            // This captures Addresses, Signatures, Salutations perfectly.
            const isStructuralBlock = lines.length > 1 && lines.every(l => l.length < 60);

            if (isStructuralBlock) {
                segments.push(block.trim());
            } else {
                // If it's a large block with mixed content, we might still want to group 
                // but usually double-newlines already handle this.
                // Just keep it together as a single logical block for analysis.
                segments.push(block.trim());
            }
        });

        return segments;
    };

    const paragraphs = segmentText(content);
    const [transitions, setTransitions] = useState({}); // { index: { status: 'ok'|'weak', suggestion: '' } }
    const [structure, setStructure] = useState(null);
    const [isChecking, setIsChecking] = useState(false);

    const checkConnections = async () => {
        setIsChecking(true);
        const newTrans = {};
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

        try {
            // 1. Check transitions in parallel
            const transPromises = paragraphs.map(async (p, idx) => {
                if (idx > 0) {
                    const res = await fetch(`${API_URL}/api/writing/draft/connect`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            prevParagraph: paragraphs[idx - 1],
                            currentParagraph: p
                        })
                    });
                    if (res.ok) {
                        const data = await res.json();
                        newTrans[idx] = {
                            status: data.rating === 'weak' ? 'weak' : 'ok',
                            suggestion: data.comment + (data.suggested_transition ? ` Try: "${data.suggested_transition}"` : "")
                        };
                    }
                }
            });

            // 2. Check overall structure
            const structPromise = fetch(`${API_URL}/api/writing/draft/structure`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    paragraphs,
                    topic: pillarData?.topic || "Writing Task",
                    textType: pillarData?.textType || "Essay"
                })
            }).then(r => r.ok ? r.json() : null);

            const [_, structData] = await Promise.all([Promise.all(transPromises), structPromise]);

            setTransitions(newTrans);
            setStructure(structData);
        } catch (error) {
            console.error("Connection check failed", error);
        } finally {
            setIsChecking(false);
        }
    };


    return (
        <div className="flex gap-6 h-[600px] overflow-hidden">
            {/* Left: Paragraph Flow View */}
            <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-indigo-100 pb-20">
                <div className="bg-indigo-50 p-5 rounded-2xl border border-indigo-100 mb-2 shadow-sm">
                    <h3 className="font-extrabold text-indigo-900 flex items-center gap-2 mb-1">
                        <LinkIcon size={20} className="text-indigo-500" />
                        Logic Flow & Connections
                    </h3>
                    <p className="text-xs text-indigo-700 font-medium leading-relaxed">
                        HKDSE markers look for logical progression. Use "Check Connections" to verify if your ideas transition smoothly between paragraphs.
                    </p>
                </div>

                <div className="space-y-4">
                    {paragraphs.map((p, idx) => (
                        <React.Fragment key={idx}>
                            {/* Paragraph Card */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:border-indigo-200 transition-all group relative">
                                <div className="absolute -left-3 top-6 bg-gray-100 text-gray-500 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border border-white shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                    {idx + 1}
                                </div>
                                <p className="text-gray-800 font-serif leading-relaxed text-base whitespace-pre-wrap">{p}</p>
                            </div>

                            {/* Transition Zone (Between Paragraphs) */}
                            {idx < paragraphs.length - 1 && (
                                <div className="flex flex-col items-center py-2">
                                    <div className="w-px h-4 bg-gray-200" />
                                    <div className={`px-4 py-2 rounded-xl text-[11px] font-black border flex items-center gap-2 transition-all max-w-[80%] shadow-sm ${!transitions[idx + 1] ? 'bg-gray-50 text-gray-400 border-gray-200 border-dashed' :
                                        transitions[idx + 1].status === 'ok' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                            'bg-amber-50 text-amber-700 border-amber-200'
                                        }`}>
                                        <LinkIcon size={12} className={!transitions[idx + 1] ? 'opacity-30' : ''} />
                                        {transitions[idx + 1] ? (
                                            <span className="leading-tight">{transitions[idx + 1].suggestion}</span>
                                        ) : (
                                            <span>Waiting for analysis...</span>
                                        )}
                                    </div>
                                    <div className="w-px h-4 bg-gray-200" />
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* Right: Structural Analysis */}
            <div className="w-[400px] flex flex-col gap-4 overflow-hidden h-full">
                <div className={`flex-1 rounded-2xl border p-6 transition-all flex flex-col overflow-hidden shadow-md ${structure ? 'bg-white border-indigo-200' : 'bg-gray-50 border-gray-200 border-dashed items-center justify-center'}`}>
                    {!structure ? (
                        <div className="text-gray-400 text-center text-sm space-y-4">
                            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                                <LinkIcon size={32} className="opacity-20" />
                            </div>
                            <p className="font-bold uppercase tracking-widest text-xs">Structural Integrity</p>
                            <p className="font-medium text-gray-400">Click the button below to<br />map your essay's structure.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col h-full overflow-hidden animate-in zoom-in-95 duration-500">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-black text-indigo-900 text-lg uppercase tracking-tight">Essay Structure</h3>
                                <div className="bg-indigo-600 text-white w-10 h-10 rounded-xl flex flex-col items-center justify-center shadow-lg">
                                    <span className="text-[10px] font-bold leading-none">SCORE</span>
                                    <span className="text-lg font-black leading-none">{structure.structure_score}</span>
                                </div>
                            </div>

                            <div className="space-y-4 overflow-y-auto flex-1 pr-2 scrollbar-thin scrollbar-thumb-indigo-100">
                                {structure.sections?.map((section, sidx) => (
                                    <div key={sidx} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-black text-xs uppercase text-gray-500 tracking-wider">{section.name}</span>
                                            <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${section.status === 'present' ? 'bg-emerald-100 text-emerald-700' :
                                                section.status === 'weak' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {section.status}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-600 leading-relaxed font-medium">{section.advice}</p>
                                    </div>
                                ))}

                                <div className="mt-4 p-4 bg-indigo-900 text-white rounded-2xl shadow-xl shadow-indigo-100">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CheckCircle size={16} className="text-indigo-400" />
                                        <span className="font-black text-[10px] uppercase tracking-widest">Logic Flow</span>
                                        <span className="ml-auto text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded capitalize">{structure.flow_rating}</span>
                                    </div>
                                    <p className="text-[11px] leading-relaxed font-medium opacity-90">{structure.feedback}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-3 shrink-0">
                    <button
                        onClick={checkConnections}
                        disabled={isChecking}
                        className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black shadow-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2 group"
                    >
                        {isChecking ? <Loader2 className="animate-spin" /> : <LinkIcon size={18} className="group-hover:rotate-12 transition-transform" />}
                        Check Connections & Flow
                    </button>

                    <button
                        onClick={onSubmit}
                        disabled={isSubmitting || !structure}
                        className="w-full py-4 bg-gray-900 text-white rounded-xl font-black shadow-2xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
                    >
                        {isSubmitting ? (
                            <><Loader2 className="animate-spin" size={18} /> Finalizing Grade...</>
                        ) : (
                            <><CheckCircle size={18} className="text-emerald-400" /> Submit Final Piece</>
                        )}
                    </button>
                    {!structure && <p className="text-[10px] text-gray-400 text-center font-bold uppercase tracking-widest">Verify structure before submitting</p>}
                </div>
            </div>
        </div>
    );
};

export default OrganizationStep;
