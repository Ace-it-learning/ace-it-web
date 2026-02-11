import React, { useState } from 'react';
import { BookOpen, ChevronLeft, ChevronRight, Loader2, Lightbulb } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import VocabCard from './VocabCard';

const VocabularySidekick = ({ topic }) => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [vocabData, setVocabData] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const token = await user.getIdToken();
            const res = await fetch(`${API_URL}/api/tutor/vocabulary/chips`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    uid: user.uid,
                    topic: topic || "General English"
                })
            });
            const data = await res.json();
            setVocabData(data);
        } catch (err) {
            console.error("Vocab Generation Failed:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* TOGGLE BUTTON */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-white shadow-lg border-l border-y border-gray-200 p-2 rounded-l-xl transition-transform duration-300 ${isOpen ? 'translate-x-[-320px]' : 'translate-x-0'}`}
            >
                {isOpen ? <ChevronRight className="w-5 h-5 text-gray-500" /> : <BookOpen className="w-5 h-5 text-emerald-600" />}
            </button>

            {/* SIDEBAR PANEL */}
            <div className={`fixed right-0 top-0 h-full w-80 bg-white shadow-2xl border-l border-gray-200 z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-100 bg-emerald-50/50 flex justify-between items-center">
                        <h3 className="font-bold text-emerald-900 flex items-center gap-2">
                            <Lightbulb className="w-4 h-4 text-emerald-500" />
                            Vocab Sidekick
                        </h3>
                        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-800 leading-relaxed border border-blue-100">
                            <strong>Topic:</strong> {topic || "General"}
                            <br />
                            Need inspiration? Generate vocabulary chips to enhance your writing or understanding.
                        </div>

                        {!vocabData && !loading && (
                            <button
                                onClick={handleGenerate}
                                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                            >
                                <SparklesIcon /> Generate Chips
                            </button>
                        )}

                        {loading && (
                            <div className="py-10 flex flex-col items-center text-emerald-600">
                                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                                <span className="text-xs font-bold uppercase tracking-wider">Mining Words...</span>
                            </div>
                        )}

                        {vocabData && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                <VocabCard data={vocabData} />
                                <button
                                    onClick={handleGenerate}
                                    className="w-full mt-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-xs font-bold transition-colors"
                                >
                                    Refresh Words
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

const SparklesIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L14.4 7.2L20 9.6L14.4 12L12 17.2L9.6 12L4 9.6L9.6 7.2L12 2Z" fill="currentColor" opacity="0.5" />
        <path d="M18 16L19.2 18.4L22 19.6L19.2 20.8L18 23.2L16.8 20.8L14 19.6L16.8 18.4L18 16Z" fill="currentColor" />
    </svg>
);

export default VocabularySidekick;
