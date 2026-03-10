import React, { useState } from 'react';
import { Brain, FileText, Send, Check } from 'lucide-react';

const IntegratedTaskStep = ({ notes, tasks, onComplete }) => {
    // For MVP, we'll assume tasks[3] is the integrated task
    const integratedTask = tasks && tasks.length > 3 ? tasks[3] : {
        question: "Based on your notes, write a brief email to the manager summarizing the key points.",
        instruction: "Write about 100 words."
    };

    const [response, setResponse] = useState("");

    return (
        <div className="flex gap-6 h-full">
            {/* Left: Source Material (Notes) */}
            <div className="w-1/3 flex flex-col h-full opacity-80 hover:opacity-100 transition-opacity">
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl flex flex-col h-full overflow-hidden shadow-sm">
                    <div className="bg-yellow-100/50 p-3 border-b border-yellow-200 font-bold text-yellow-800 text-sm flex items-center gap-2">
                        <FileText size={16} /> Data File (Your Notes)
                    </div>
                    <div className="p-4 font-mono text-sm text-slate-700 whitespace-pre-wrap overflow-y-auto flex-1">
                        {notes}
                    </div>
                </div>
            </div>

            {/* Right: Output Task */}
            <div className="flex-1 flex flex-col h-full bg-white rounded-2xl shadow-lg border border-indigo-100 overflow-hidden">
                <div className="bg-indigo-50 p-6 border-b border-indigo-100">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Pillar 3: Synthesis</span>
                    </div>
                    <h3 className="font-bold text-indigo-900 text-lg">{integratedTask.question}</h3>
                    <p className="text-indigo-600 text-sm mt-1">{integratedTask.instruction}</p>
                </div>

                <div className="flex-1 p-6">
                    <textarea
                        className="w-full h-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none font-serif text-lg leading-relaxed text-slate-800 placeholder:text-slate-400"
                        placeholder="Subject: Summary of meeting..."
                        value={response}
                        onChange={(e) => setResponse(e.target.value)}
                    />
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                    <button
                        onClick={() => onComplete(response)}
                        disabled={!response.trim()}
                        className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg disabled:opacity-50"
                    >
                        Submit Data File <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default IntegratedTaskStep;
