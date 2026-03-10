import React from 'react';
import { Trophy, Home, RotateCcw, BarChart3, Ear, PenTool, Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ResultsStep = ({ results, onRetry }) => {
    const navigate = useNavigate();

    // Mock scores if not provided
    const scores = results || {
        decoding: 4,
        capture: 3,
        synthesis: 5
    };

    return (
        <div className="max-w-4xl mx-auto text-center">
            <div className="mb-10">
                <div className="inline-block p-6 bg-yellow-100 rounded-full mb-6 relative">
                    <Trophy size={64} className="text-yellow-600" />
                    <div className="absolute top-0 right-0 w-8 h-8 bg-indigo-500 rounded-full animate-ping"></div>
                </div>
                <h2 className="text-4xl font-black text-slate-900 mb-2">Mission Complete</h2>
                <p className="text-xl text-slate-500">Here is your Auditory Profile.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {/* Decoding */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center justify-center gap-2 mb-4 text-rose-600">
                        <Ear size={24} /> <span className="font-bold uppercase tracking-wider text-xs">Decoding</span>
                    </div>
                    <div className="text-5xl font-black text-slate-800 mb-2">{scores.decoding}/5</div>
                    <p className="text-sm text-slate-500">Accent & Speed</p>
                </div>

                {/* Capture */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center justify-center gap-2 mb-4 text-blue-600">
                        <PenTool size={24} /> <span className="font-bold uppercase tracking-wider text-xs">Capture</span>
                    </div>
                    <div className="text-5xl font-black text-slate-800 mb-2">{scores.capture}/5</div>
                    <p className="text-sm text-slate-500">Notes & Details</p>
                </div>

                {/* Synthesis */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center justify-center gap-2 mb-4 text-indigo-600">
                        <Brain size={24} /> <span className="font-bold uppercase tracking-wider text-xs">Synthesis</span>
                    </div>
                    <div className="text-5xl font-black text-slate-800 mb-2">{scores.synthesis}/5</div>
                    <p className="text-sm text-slate-500">Integration & Tone</p>
                </div>
            </div>

            <div className="flex justify-center gap-4">
                <button
                    onClick={() => navigate('/listening/menu')}
                    className="px-6 py-3 rounded-xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors flex items-center gap-2"
                >
                    <Home size={20} /> Back to Menu
                </button>
                <button
                    onClick={onRetry}
                    className="px-6 py-3 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-lg hover:shadow-indigo-500/20"
                >
                    <RotateCcw size={20} /> Retry Mission
                </button>
            </div>
        </div>
    );
};

export default ResultsStep;
