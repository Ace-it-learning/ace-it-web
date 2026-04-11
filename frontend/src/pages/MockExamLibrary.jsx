import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    BookOpen, 
    PenTool, 
    Headphones, 
    MessageCircle, 
    Calculator, 
    ChevronRight, 
    Clock, 
    Target, 
    Award,
    ShieldCheck,
    AlertCircle,
    Info
} from 'lucide-react';

const MockExamLibrary = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('english'); // 'english' | 'maths'
    const [englishSubTab, setEnglishSubTab] = useState('reading'); // 'reading' | 'writing' | 'listening' | 'speaking'
    const [showBriefing, setShowBriefing] = useState(null); // Paper object if showing briefing
    const [englishPapers, setEnglishPapers] = useState({
        reading: [],
        writing: [],
        listening: [],
        speaking: []
    });
    const [isLoading, setIsLoading] = useState(false);

    // Fetch dynamic headers on tab change
    React.useEffect(() => {
        if (activeTab !== 'english') return;
        
        const fetchHeaders = async () => {
            setIsLoading(true);
            try {
                const paperCode = englishSubTab === 'reading' ? 'p1' : 
                                 englishSubTab === 'writing' ? 'p2' : 
                                 englishSubTab === 'listening' ? 'p3' : 'p4';
                
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                const res = await fetch(`${API_URL}/api/english/mock/headers/${paperCode}`);
                if (res.ok) {
                    const data = await res.json();
                    setEnglishPapers(prev => ({
                        ...prev,
                        [englishSubTab]: data
                    }));
                }
            } catch (err) {
                console.error("Failed to fetch mock headers:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHeaders();
    }, [activeTab, englishSubTab]);


    const mathsPapers = Array.from({ length: 10 }, (_, i) => ({
        id: `math_mock_${i + 1}`,
        name: `Maths DSE Paper ${i + 1}`,
        description: `Full P1 + P2 Simulation (Integrated Batch ${i + 1})`,
        batchId: i + 1
    }));

    const handleStartMock = (paper) => {
        let route = '';
        let state = {
            isMock: true,
            paperId: paper.id,
            paperName: paper.name,
            duration: 0
        };

        if (activeTab === 'english') {
            switch (englishSubTab) {
                case 'reading': 
                    route = '/lab'; 
                    state.duration = 90 * 60;
                    break;
                case 'writing': 
                    route = '/writing/quest'; 
                    state.duration = 120 * 60;
                    break;
                case 'listening': 
                    route = '/listening/quest';
                    state.duration = 120 * 60;
                    break;
                case 'speaking': 
                    route = '/speaking/quest/interaction'; 
                    state.duration = 20 * 60;
                    break;
            }
        } else {
            // Maths Combined Session
            route = '/maths-lab';
            state.topic = 'integrated_challenge';
            state.batchId = paper.batchId;
            state.duration = (135 + 75) * 60; // P1 + P2 combined
        }

        navigate(route, { state });
    };

    const renderBriefing = () => (
        <AnimatePresence>
            {showBriefing && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-6"
                >
                    <motion.div 
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        className="max-w-xl w-full bg-white rounded-[3rem] overflow-hidden shadow-2xl"
                    >
                        <div className="bg-slate-900 p-8 text-white relative">
                            <div className="absolute top-0 right-0 p-8 text-white/5 pointer-events-none">
                                <ShieldCheck size={120} />
                            </div>
                            <h2 className="text-sm font-black text-indigo-400 uppercase tracking-[0.3em] mb-2">Exam Protocol</h2>
                            <h3 className="text-3xl font-black">{showBriefing.name}</h3>
                        </div>

                        <div className="p-10 space-y-8">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="p-4 bg-slate-50 rounded-2xl flex items-center gap-3">
                                    <Clock className="text-indigo-600" size={20} />
                                    <div>
                                        <p className="text-slate-400 font-bold uppercase text-[10px]">Duration</p>
                                        <p className="font-black text-slate-800">
                                            {activeTab === 'maths' ? '210 Minutes' : (
                                                englishSubTab === 'reading' ? '90 Mins' :
                                                englishSubTab === 'writing' ? '120 Mins' :
                                                englishSubTab === 'listening' ? '120 Mins' : '20 Mins'
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl flex items-center gap-3">
                                    <Target className="text-indigo-600" size={20} />
                                    <div>
                                        <p className="text-slate-400 font-bold uppercase text-[10px]">Format</p>
                                        <p className="font-black text-slate-800">Strict DSE Simulate</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex gap-4 items-start p-4 bg-amber-50 rounded-2xl border border-amber-100">
                                    <AlertCircle className="text-amber-600 shrink-0 mt-1" size={20} />
                                    <div>
                                        <h4 className="font-black text-amber-900 uppercase text-xs tracking-tighter">Mock Mode Constraints</h4>
                                        <ul className="text-xs text-amber-800 mt-2 space-y-2 font-medium">
                                            <li>• Hints and AI suggestions are disabled</li>
                                            <li>• Timer cannot be paused once started</li>
                                            <li>• Submission is final (no retries until completion)</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button 
                                    onClick={() => setShowBriefing(null)}
                                    className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-xs transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={() => handleStartMock(showBriefing)}
                                    className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2 group"
                                >
                                    Enter Studio <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    return (
        <div className="min-h-screen bg-slate-50 pb-32">
            {/* Header Area */}
            <div className="bg-white border-b border-slate-200 pt-12 pb-6 px-10">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-end justify-between mb-12">
                        <div>
                            <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-2 italic">Mock Studio.</h1>
                            <p className="text-slate-500 font-medium max-w-lg leading-relaxed">
                                Professional HKDSE simulation library. Choose a paper to begin your high-stakes practice session.
                            </p>
                        </div>
                        <div className="flex bg-slate-100 p-1.5 rounded-2xl shadow-inner">
                            {['english', 'maths'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-8 py-3 rounded-xl font-black uppercase text-xs tracking-[0.2em] transition-all ${
                                        activeTab === tab 
                                        ? 'bg-white text-indigo-600 shadow-md scale-[1.02]' 
                                        : 'text-slate-400 hover:text-slate-600'
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    {activeTab === 'english' && (
                        <div className="flex gap-4">
                            {[
                                { id: 'reading', label: 'Paper 1', icon: BookOpen },
                                { id: 'writing', label: 'Paper 2', icon: PenTool },
                                { id: 'listening', label: 'Paper 3', icon: Headphones },
                                { id: 'speaking', label: 'Paper 4', icon: MessageCircle }
                            ].map(sub => (
                                <button
                                    key={sub.id}
                                    onClick={() => setEnglishSubTab(sub.id)}
                                    className={`flex items-center gap-3 px-6 py-4 rounded-3xl border-2 transition-all group ${
                                        englishSubTab === sub.id
                                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100'
                                        : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300 hover:text-slate-600'
                                    }`}
                                >
                                    <sub.icon size={20} className={englishSubTab === sub.id ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600 transition-colors'} />
                                    <span className="font-black uppercase tracking-widest text-[10px]">{sub.label}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Library Grid */}
            <main className="max-w-6xl mx-auto px-10 pt-12">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="size-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Accessing Archives...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {(activeTab === 'english' ? englishPapers[englishSubTab] : mathsPapers).map((paper, idx) => (
                            <motion.button
                                key={paper.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                onClick={() => setShowBriefing(paper)}
                                className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50 text-left hover:border-indigo-300 transition-all group relative overflow-hidden flex flex-col justify-between h-[280px]"
                            >
                            <div className="absolute top-0 right-0 p-8 text-slate-50 group-hover:text-indigo-50/50 transition-colors pointer-events-none">
                                {activeTab === 'maths' ? <Calculator size={80} /> : (
                                    englishSubTab === 'reading' ? <BookOpen size={80} /> :
                                    englishSubTab === 'writing' ? <PenTool size={80} /> :
                                    englishSubTab === 'listening' ? <Headphones size={80} /> : <MessageCircle size={80} />
                                )}
                            </div>

                            <div className="relative z-10">
                                <div className="size-12 rounded-2xl bg-slate-50 group-hover:bg-indigo-50 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors mb-6">
                                    <Award size={24} />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 mb-2 leading-tight uppercase tracking-tight">{paper.name}</h3>
                                <p className="text-sm text-slate-500 font-medium">{paper.description}</p>
                            </div>

                            <div className="flex items-center justify-between pt-6 border-t border-slate-50 group-hover:border-indigo-50 relative z-10">
                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    <Clock size={12} /> 
                                    {activeTab === 'maths' ? '210 Mins' : (
                                        englishSubTab === 'reading' ? '90 Mins' :
                                        englishSubTab === 'writing' ? '120 Mins' :
                                        englishSubTab === 'listening' ? '120 Mins' : '20 Mins'
                                    )}
                                </div>
                                <div className="p-3 bg-slate-100 group-hover:bg-indigo-600 text-slate-400 group-hover:text-white rounded-2xl transition-all">
                                    <ChevronRight size={20} />
                                </div>
                            </div>
                        </motion.button>
                    ))}
                </div>
                )}

                {/* Info Card */}
                <div className="mt-16 bg-indigo-950 p-12 rounded-[4rem] text-white flex flex-col md:flex-row items-center gap-12 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
                    <div className="flex-1 space-y-6">
                        <h2 className="text-3xl font-black italic tracking-tight">The Mock Protocol.</h2>
                        <p className="text-indigo-200 font-medium leading-relaxed">
                            Ace It's Mock Studio is designed to push your limits. We strictly enforce HKEAA time limits and disable all support systems to simulate the psychological pressure of the real DSE arena.
                        </p>
                        <div className="flex gap-8">
                            <div className="space-y-1">
                                <p className="text-indigo-400 font-black uppercase text-[10px] tracking-widest">Pedagogy</p>
                                <p className="font-bold">Real-time Stress</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-indigo-400 font-black uppercase text-[10px] tracking-widest">Standards</p>
                                <p className="font-bold">HKEAA Compliant</p>
                            </div>
                        </div>
                    </div>
                    <div className="size-48 bg-white/10 backdrop-blur-md rounded-full border border-white/20 flex flex-col items-center justify-center text-center p-6 border-dashed">
                        <Award size={48} className="text-indigo-400 mb-2" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] leading-tight">Ready for 5**</span>
                    </div>
                </div>
            </main>

            {renderBriefing()}
        </div>
    );
};

export default MockExamLibrary;
