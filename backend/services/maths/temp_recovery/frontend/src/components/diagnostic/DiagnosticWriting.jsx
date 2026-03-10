import React, { useState } from 'react';
import { Clock, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const DiagnosticWriting = ({ assets, onSubmit }) => {
    const { user } = useAuth();
    const [text, setText] = useState('');
    const [showCheat, setShowCheat] = useState(false);

    const isDeveloper = user?.email === 'fungtam@gmail.com';

    // Simple word count
    const wordCount = text.trim().split(/\s+/).filter(w => w.length > 0).length;

    const handleSubmit = () => {
        onSubmit({ text });
    };

    const generateWriting = async (level) => {
        try {
            setShowCheat(false);
            setText('⚡ Generating realistic essay...');

            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const response = await fetch(`${API_URL}/api/diagnostic/generate-answers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    uid: user.uid,
                    level,
                    type: 'writing',
                    topic: assets.topic
                })
            });

            const data = await response.json();

            if (data.text) {
                setText(data.text);
            }
        } catch (error) {
            console.error('Failed to generate essay:', error);
            alert('Failed to generate essay. Check console for details.');
            setText('');
        }
    };

    if (!assets) return <div>Loading Writing...</div>;

    return (
        <div className="max-w-3xl mx-auto relative">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Part 2: Writing</h2>
                <div className="flex items-center gap-2 text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">Estimated: 5 mins</span>
                </div>
            </div>

            <div className="bg-gray-50 p-8 rounded-xl border-2 border-gray-200 mb-6">
                <h3 className="text-gray-400 text-xs font-black uppercase tracking-[0.2em] mb-4">Topic</h3>
                <h4 className="text-2xl text-gray-900 font-bold mb-6">{assets.topic}</h4>

                {assets.prompt && (
                    <div className="mb-6 p-5 bg-white border border-gray-200 rounded-2xl shadow-sm text-gray-700 leading-relaxed relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                        <span className="font-bold block mb-2 text-[10px] text-blue-600 uppercase tracking-widest italic">Scenario & Context</span>
                        <p className="text-sm italic">"{assets.prompt}"</p>
                    </div>
                )}

                <div className="pt-4 border-t border-gray-100">
                    <p className="text-gray-500 text-sm font-medium">Target: ~100-150 words. Don't worry about being perfect, just write naturally.</p>
                </div>
            </div>

            <div className="relative">
                <textarea
                    className="w-full h-64 bg-white border-2 border-gray-300 rounded-xl p-6 text-lg text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none transition-colors"
                    placeholder="Start writing here..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />
                <div className="absolute bottom-4 right-4 text-xs font-mono text-gray-500 bg-white px-2 py-1 rounded">
                    {wordCount} words
                </div>
            </div>

            <button
                onClick={handleSubmit}
                disabled={wordCount < 10}
                className={`w-full mt-6 py-4 rounded-xl font-bold transition-all shadow-lg ${wordCount < 10
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-xl'
                    }`}
            >
                Submit Writing Sample
            </button>

            {/* Developer Cheat Button */}
            {isDeveloper && (
                <div className="fixed bottom-6 left-6 z-50">
                    {!showCheat ? (
                        <button
                            onClick={() => setShowCheat(true)}
                            className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all"
                            title="Developer: Auto-fill writing"
                        >
                            <Zap className="w-5 h-5" />
                        </button>
                    ) : (
                        <div className="bg-white border-2 border-purple-600 rounded-xl p-4 shadow-2xl">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-bold text-purple-600">Auto-fill Level</span>
                                <button onClick={() => setShowCheat(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                            </div>
                            <div className="flex flex-col gap-2">
                                {[3, 4, 5, '5*', '5**'].map(level => (
                                    <button
                                        key={level}
                                        onClick={() => generateWriting(level)}
                                        className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg font-medium transition-colors text-sm"
                                    >
                                        Level {level}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DiagnosticWriting;
