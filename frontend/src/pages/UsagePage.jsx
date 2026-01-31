import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Activity, CreditCard, Cpu, BarChart3, ArrowLeft, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UsagePage = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [summary, setSummary] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            try {
                const [summaryRes, statsRes] = await Promise.all([
                    fetch(`${API_URL}/api/usage/summary?uid=${user.uid}`),
                    fetch(`${API_URL}/api/usage/stats?uid=${user.uid}`)
                ]);

                const summaryData = await summaryRes.json();
                const statsData = await statsRes.json();

                setSummary(summaryData);
                setHistory(statsData);
            } catch (err) {
                console.error("Failed to fetch usage data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, API_URL]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="p-2 rounded-xl bg-white/50 hover:bg-white border border-black/5 shadow-sm transition-all"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-gray-800 tracking-tight tracking-tighter">AI Usage & Costing</h1>
                        <p className="text-gray-500 font-medium">Monitor your AI token consumption and estimated costs.</p>
                    </div>
                </div>

                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-xs font-bold border border-blue-100 italic">
                    <Info className="w-4 h-4" />
                    Powered by Gemini 2.0 Flash
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Cost Card */}
                <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-6 rounded-[2rem] text-white shadow-xl relative overflow-hidden group">
                    <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                        <CreditCard className="w-32 h-32" />
                    </div>
                    <p className="text-indigo-100 text-sm font-bold uppercase tracking-wider mb-1 opacity-70">Estimated Total Cost</p>
                    <h2 className="text-4xl font-black mb-4 tracking-tighter">${(summary?.total_cost_usd || 0).toFixed(4)} <span className="text-xl opacity-60">USD</span></h2>
                    <div className="flex items-center gap-2 text-xs font-medium bg-white/10 w-fit px-3 py-1 rounded-full backdrop-blur-sm">
                        <div className="size-1.5 bg-green-400 rounded-full animate-pulse"></div>
                        Live estimation based on token count
                    </div>
                </div>

                {/* Tokens Card */}
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl flex flex-col justify-between group hover:shadow-2xl transition-all duration-300">
                    <div>
                        <div className="flex items-center gap-2 text-gray-400 mb-1">
                            <Cpu className="w-4 h-4" />
                            <p className="text-[10px] font-bold uppercase tracking-widest">Total Tokens Consumed</p>
                        </div>
                        <h2 className="text-3xl font-black text-gray-800 tracking-tighter">
                            {((summary?.total_prompt_tokens || 0) + (summary?.total_completion_tokens || 0)).toLocaleString()}
                        </h2>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-end">
                        <div className="space-y-1">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Prompt / Completion</p>
                            <div className="flex items-center gap-2 text-sm font-black text-gray-700">
                                <span>{summary?.total_prompt_tokens?.toLocaleString() || 0}</span>
                                <span className="text-gray-300 font-light">|</span>
                                <span className="text-blue-500">{summary?.total_completion_tokens?.toLocaleString() || 0}</span>
                            </div>
                        </div>
                        <BarChart3 className="w-8 h-8 text-gray-100 group-hover:text-blue-50 transition-colors" />
                    </div>
                </div>

                {/* Model Rates Card */}
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl">
                    <div className="flex items-center gap-2 text-gray-400 mb-4">
                        <Activity className="w-4 h-4" />
                        <p className="text-[10px] font-bold uppercase tracking-widest">Model Rates (per 1M)</p>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100/50">
                            <span className="text-xs font-bold text-gray-500 uppercase">Input (Flash)</span>
                            <span className="text-sm font-black text-gray-800">$0.10</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100/50">
                            <span className="text-xs font-bold text-gray-500 uppercase">Output (Flash)</span>
                            <span className="text-sm font-black text-gray-800">$0.40</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-2xl overflow-hidden flex flex-col min-h-[400px]">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
                    <h3 className="font-black text-gray-800 text-xl tracking-tight">Recent AI Activities</h3>
                    <div className="px-3 py-1 bg-white border border-gray-200 rounded-full text-[10px] font-bold text-gray-400 uppercase tracking-widest shadow-sm">
                        Last 20 Operations
                    </div>
                </div>

                <div className="flex-1 overflow-x-auto custom-scrollbar">
                    {history.length === 0 ? (
                        <div className="h-[300px] flex flex-col items-center justify-center text-gray-400 space-y-2 opacity-50">
                            <Activity className="w-12 h-12" />
                            <p className="font-bold tracking-tight">No activity logged yet.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse min-w-[700px]">
                            <thead className="sticky top-0 bg-gray-50 z-10 text-[10px] uppercase font-black text-gray-400 tracking-widest border-b border-gray-100">
                                <tr>
                                    <th className="px-8 py-4">Task Type</th>
                                    <th className="px-6 py-4">Total Tokens</th>
                                    <th className="px-6 py-4">Est. Cost</th>
                                    <th className="px-8 py-4 text-right">Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {history.map((log) => (
                                    <tr key={log.id} className="hover:bg-blue-50/30 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-gray-800 group-hover:text-blue-700 transition-colors tracking-tight">
                                                    {log.task.replace(/_/g, ' ').toUpperCase()}
                                                </span>
                                                <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                                                    <div className="size-1 rounded-full bg-gray-300"></div>
                                                    {log.model || 'Gemini 2.0 Flash'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-black text-gray-700">{log.total_tokens.toLocaleString()}</span>
                                                <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                                                    <span className="text-gray-700">{log.prompt_tokens}</span>
                                                    <span>+</span>
                                                    <span className="text-blue-500">{log.completion_tokens}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-green-50 text-green-700 text-xs font-black border border-green-100">
                                                ${(log.estimated_cost_usd || 0).toFixed(6)}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <span className="text-xs font-bold text-gray-400">
                                                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            <p className="text-[10px] text-gray-300 font-medium">
                                                {new Date(log.timestamp).toLocaleDateString()}
                                            </p>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center gap-2 justify-center">
                    <p className="text-[10px] text-gray-400 font-medium italic">
                        Costs are based on current market rates and approximated for the Gemini model.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default UsagePage;
