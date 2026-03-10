import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, FileText, CheckCircle, AlertCircle, Loader } from 'lucide-react';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [secret, setSecret] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Generation State
    const [topic, setTopic] = useState('');
    const [paperType, setPaperType] = useState('Reading');
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState(null); // { type: 'success' | 'error', message: '' }

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    const handleLogin = (e) => {
        e.preventDefault();
        // Simple client-side check to unlock UI, real check is on server
        if (secret.length > 5) {
            setIsAuthenticated(true);
        }
    };

    const handleGenerate = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setStatus(null);

        try {
            const res = await fetch(`${API_URL}/api/admin/generate-mock`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-secret': secret
                },
                body: JSON.stringify({ topic, paperType })
            });

            const data = await res.json();

            if (res.ok) {
                setStatus({ type: 'success', message: data.message });
            } else {
                setStatus({ type: 'error', message: data.error || 'Generation failed.' });
            }
        } catch (err) {
            setStatus({ type: 'error', message: 'Network error or server timeout.' });
        } finally {
            setIsLoading(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white max-w-md w-full p-8 rounded-2xl shadow-xl border border-gray-100">
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                            <Lock className="w-8 h-8 text-gray-400" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">Restricted Area</h1>
                    <p className="text-center text-gray-500 mb-6 text-sm">Authorized personnel only.</p>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <input
                            type="password"
                            placeholder="Enter Admin Secret"
                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                            value={secret}
                            onChange={e => setSecret(e.target.value)}
                        />
                        <button
                            type="submit"
                            className="w-full py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-all"
                        >
                            Unlock Portal
                        </button>
                    </form>
                    <button onClick={() => navigate('/dashboard')} className="w-full mt-4 text-sm text-gray-400 hover:text-gray-600">
                        Top Secret - Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-12">
            <div className="max-w-4xl mx-auto">
                <header className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                            <ArrowLeft className="w-6 h-6 text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Admin Command Center</h1>
                            <p className="text-gray-500">Mock Exam Generator & System Controls</p>
                        </div>
                    </div>
                    <div className="bg-black text-white px-4 py-2 rounded-full text-xs font-bold tracking-wider uppercase">
                        ACE-IT-ADMIN
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Generator Panel */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                                <FileText className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">Generate Mock Exam</h2>
                        </div>

                        <form onSubmit={handleGenerate} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-500 mb-2">Topic / Theme</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Hong Kong Neon Signs, Future of AI"
                                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    value={topic}
                                    onChange={e => setTopic(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-500 mb-2">Paper Type</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {['Reading', 'Writing', 'Listening', 'Speaking'].map(type => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setPaperType(type)}
                                            className={`p-3 rounded-xl border text-sm font-bold transition-all ${paperType === type
                                                ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-105'
                                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                                }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg ${isLoading
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-blue-500/30 hover:scale-[1.02]'
                                    }`}
                            >
                                {isLoading ? (
                                    <><Loader className="w-5 h-5 animate-spin" /> Generating Assets...</>
                                ) : (
                                    'Launch AI Pipeline'
                                )}
                            </button>
                        </form>

                        {/* Status Feedback */}
                        {status && (
                            <div className={`mt-6 p-4 rounded-xl flex items-start gap-3 ${status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                }`}>
                                {status.type === 'success' ? <CheckCircle className="w-5 h-5 mt-0.5" /> : <AlertCircle className="w-5 h-5 mt-0.5" />}
                                <div>
                                    <p className="font-bold">{status.type === 'success' ? 'Success' : 'Error'}</p>
                                    <p className="text-sm opacity-90">{status.message}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Info / Usage Panel */}
                    <div className="space-y-6">
                        <div className="bg-gray-900 text-white p-8 rounded-3xl shadow-lg">
                            <h3 className="text-lg font-bold mb-4 opacity-90">System Status</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center border-b border-gray-700 pb-3">
                                    <span className="text-gray-400 text-sm">Backend Node</span>
                                    <span className="text-green-400 font-mono text-sm">ONLINE</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-gray-700 pb-3">
                                    <span className="text-gray-400 text-sm">Gemini API</span>
                                    <span className="text-green-400 font-mono text-sm">CONNECTED</span>
                                </div>
                                <div className="flex justify-between items-center pb-1">
                                    <span className="text-gray-400 text-sm">Output Dir</span>
                                    <span className="text-gray-300 font-mono text-xs">/backend/generated_mocks</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold mb-4 text-gray-800">Pipeline Instructions</h3>
                            <ul className="space-y-3 text-sm text-gray-600">
                                <li className="flex gap-2">
                                    <span className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-500">1</span>
                                    Select a clear, specific topic (e.g. "Space Tourism").
                                </li>
                                <li className="flex gap-2">
                                    <span className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-500">2</span>
                                    Choose the exam paper type.
                                </li>
                                <li className="flex gap-2">
                                    <span className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-500">3</span>
                                    Click Launch. The process takes ~30-60 seconds.
                                </li>
                                <li className="flex gap-2">
                                    <span className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-500">4</span>
                                    Check the backend logs or directory for the JSON.
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
