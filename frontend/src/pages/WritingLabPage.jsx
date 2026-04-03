import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FileText, Search, Sparkles, BookOpen, 
    ArrowRight, ChevronRight, Hash, Award,
    Clock, Tag, Target, Mic, Mail, Newspaper, 
    Clipboard, Zap, Layers, Highlighter, 
    Lightbulb, CheckCircle2, Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ENGLISH_WRITING_GENRES } from '../constants/englishWritingSyllabus';

const WritingLabPage = () => {
    const navigate = useNavigate();
    const [selectedGenre, setSelectedGenre] = useState('all');
    const [exemplars, setExemplars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeExemplar, setActiveExemplar] = useState(null);

    // Filtered Content
    const filteredGenres = selectedGenre === 'all' 
        ? ENGLISH_WRITING_GENRES 
        : ENGLISH_WRITING_GENRES.filter(g => g.id === selectedGenre);

    useEffect(() => {
        fetchExemplars();
    }, [selectedGenre]);

    const fetchExemplars = async () => {
        try {
            setLoading(true);
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const res = await fetch(`${API_URL}/api/writing/exemplars${selectedGenre !== 'all' ? `?genre=${selectedGenre}` : ''}`);
            if (res.ok) {
                const data = await res.json();
                setExemplars(data);
            }
        } catch (error) {
            console.error("Failed to load exemplars", error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewExemplar = async (id) => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const res = await fetch(`${API_URL}/api/writing/exemplars/${id}`);
            if (res.ok) {
                const data = await res.json();
                setActiveExemplar(data);
            }
        } catch (error) {
            console.error("Error fetching detail", error);
        }
    };

    const getIcon = (iconName) => {
        const icons = { FileText, Target, Mic, Mail, Newspaper, Clipboard };
        const Component = icons[iconName] || FileText;
        return <Component className="w-5 h-5" />;
    };

    return (
        <div className="min-h-screen bg-slate-50 pt-20 pb-12 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <div className="flex items-center gap-2 mb-3 text-indigo-600 font-black uppercase tracking-widest text-xs">
                            <Sparkles className="w-4 h-4" /> Writing Masterclass
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none mb-4">
                            English Writing <span className="text-indigo-600">Lab.</span>
                        </h1>
                        <p className="text-slate-500 max-w-xl text-lg">
                            Study Elite (Level 5**) exemplars across all HKDSE genres. Master the structure, vocabulary, and logic of a top-tier essay.
                        </p>
                    </div>
                    
                    <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-200 w-full md:w-auto overflow-x-auto no-scrollbar">
                        {['all', ...ENGLISH_WRITING_GENRES.map(g => g.id)].map((genreId) => (
                            <button
                                key={genreId}
                                onClick={() => setSelectedGenre(genreId)}
                                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                                    selectedGenre === genreId 
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                                        : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                                }`}
                            >
                                {genreId === 'all' ? 'All Genres' : ENGLISH_WRITING_GENRES.find(g => g.id === genreId)?.name.split(' ')[0]}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content Grid */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24">
                        <div className="w-12 h-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin mb-4" />
                        <p className="text-slate-400 font-bold">Curating Masterpieces...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {exemplars.length > 0 ? exemplars.map((item, idx) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                onClick={() => handleViewExemplar(item.id)}
                                className="group bg-white rounded-3xl border border-slate-200 p-6 hover:border-indigo-300 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all cursor-pointer relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-all scale-150 transform rotate-12">
                                    {getIcon(ENGLISH_WRITING_GENRES.find(g => g.id === item.genre)?.icon)}
                                </div>
                                
                                <div className="flex items-center gap-2 mb-4">
                                    <div className={`p-2 rounded-xl bg-indigo-50 text-indigo-600`}>
                                        {getIcon(ENGLISH_WRITING_GENRES.find(g => g.id === item.genre)?.icon)}
                                    </div>
                                    <div className="px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-[10px] font-black uppercase">
                                        Level {item.level}
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-slate-800 mb-3 leading-tight group-hover:text-indigo-600 transition-colors">
                                    {item.title}
                                </h3>
                                
                                <div className="flex flex-wrap gap-2 mb-6">
                                    <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                        <Hash className="w-3 h-3" /> {ENGLISH_WRITING_GENRES.find(g => g.id === item.genre)?.name}
                                    </span>
                                    <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                        <BookOpen className="w-3 h-3" /> {item.word_count} Words
                                    </span>
                                </div>

                                <div className="flex items-center justify-between mt-auto">
                                    <span className="text-xs font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                        Study Analysis <ArrowRight className="w-3 h-3" />
                                    </span>
                                    <div className="flex -space-x-2">
                                        <div className="w-6 h-6 rounded-full border-2 border-white bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-600">V</div>
                                        <div className="w-6 h-6 rounded-full border-2 border-white bg-violet-100 flex items-center justify-center text-[10px] font-bold text-violet-600">S</div>
                                        <div className="w-6 h-6 rounded-full border-2 border-white bg-emerald-100 flex items-center justify-center text-[10px] font-bold text-emerald-600">C</div>
                                    </div>
                                </div>
                            </motion.div>
                        )) : (
                            <div className="col-span-full py-24 text-center">
                                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                                    <Search className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-700">No exemplars found in this genre yet.</h3>
                                <p className="text-slate-400 max-w-xs mx-auto mt-2">Our AI Masterminds are currently drafting new 5** masterpieces for this category.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Immersive Reader Modal */}
            <AnimatePresence>
                {activeExemplar && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setActiveExemplar(null)}
                            className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" 
                        />
                        
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white w-full max-w-6xl max-h-full flex flex-col md:flex-row relative z-10 rounded-[32px] overflow-hidden shadow-2xl"
                        >
                            {/* Left Side: The Essay Content */}
                            <div className="flex-1 p-6 md:p-12 overflow-y-auto custom-scrollbar bg-slate-50/30">
                                <div className="mb-8">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="px-3 py-1 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase shadow-lg shadow-indigo-200">
                                            {activeExemplar.level} Rating
                                        </div>
                                        <div className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                                            {ENGLISH_WRITING_GENRES.find(g => g.id === activeExemplar.genre)?.name}
                                        </div>
                                    </div>
                                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight mb-2">
                                        "{activeExemplar.title}"
                                    </h2>
                                    <p className="text-slate-500 italic text-sm">Theme: {activeExemplar.theme}</p>
                                </div>

                                <div className="p-8 md:p-12 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 mb-8 relative">
                                    <div className="absolute -left-3 top-10 w-1 h-32 bg-indigo-600 rounded-full" />
                                    <div className="prose prose-slate max-w-none prose-p:text-slate-700 prose-p:leading-relaxed prose-p:text-lg whitespace-pre-wrap font-serif">
                                        {activeExemplar.model_answer}
                                    </div>
                                </div>

                                <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
                                    <div className="flex items-center gap-2 mb-4 text-indigo-700 font-bold">
                                        <Target className="w-5 h-5" /> The Prompt
                                    </div>
                                    <p className="text-slate-600 text-sm leading-relaxed italic">
                                        {activeExemplar.prompt}
                                    </p>
                                </div>
                            </div>

                            {/* Right Side: Elite Analysis Panel */}
                            <div className="w-full md:w-[400px] border-l border-slate-100 flex flex-col h-full bg-white">
                                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                                    <h3 className="font-black text-slate-900 text-sm uppercase tracking-widest">Mastery Analysis</h3>
                                    <button onClick={() => setActiveExemplar(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                                        <ArrowRight className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-8">
                                    
                                    {/* Structural Analysis */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-4 text-slate-800 font-black text-xs uppercase tracking-wider">
                                            <Layers className="w-4 h-4 text-indigo-600" /> Structural Logic
                                        </div>
                                        <div className="space-y-4">
                                            {activeExemplar.structural_analysis?.map((item, i) => (
                                                <div key={i} className="group p-4 rounded-2xl bg-slate-50 hover:bg-white border border-transparent hover:border-slate-200 transition-all">
                                                    <div className="text-[10px] font-black text-indigo-600 uppercase mb-1">{item.part}</div>
                                                    <p className="text-xs text-slate-600 leading-relaxed mb-2">{item.logic}</p>
                                                    <div className="text-[10px] font-mono text-slate-400 bg-white p-2 rounded border border-slate-100">"{item.snippet}..."</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Vocabulary Bank */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-4 text-slate-800 font-black text-xs uppercase tracking-wider">
                                            <Highlighter className="w-4 h-4 text-violet-600" /> Elite Vocabulary
                                        </div>
                                        <div className="grid grid-cols-1 gap-3">
                                            {activeExemplar.vocabulary_bank?.map((v, i) => (
                                                <div key={i} className="p-3 rounded-xl border border-slate-100 hover:border-violet-200 transition-all">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="font-bold text-slate-900 text-sm">{v.word}</span>
                                                        <span className="text-[9px] text-slate-400 italic">{v.syllables}</span>
                                                    </div>
                                                    <p className="text-[10px] text-slate-500 mb-2 leading-tight">{v.meaning}</p>
                                                    <div className="text-[9px] bg-violet-50 text-violet-700 p-1.5 rounded-lg italic leading-tight">"{v.usage_example}"</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Connective Masterclass */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-4 text-slate-800 font-black text-xs uppercase tracking-wider">
                                            <Zap className="w-4 h-4 text-amber-500" /> Linkage Mastery
                                        </div>
                                        <div className="space-y-3">
                                            {activeExemplar.connective_masterclass?.map((c, i) => (
                                                <div key={i} className="p-4 rounded-xl bg-amber-50/30 border border-amber-100">
                                                    <div className="text-amber-700 font-black text-xs px-2 py-0.5 bg-white border border-amber-100 rounded inline-block mb-2">{c.phrase}</div>
                                                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter mb-1">Function: {c.function}</div>
                                                    <p className="text-[10px] text-slate-600 italic">"{c.why_elite}"</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                </div>

                                <div className="p-6 bg-slate-900 text-white">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Award className="w-5 h-5 text-amber-400" />
                                        <div className="text-xs font-black uppercase tracking-widest">Examiner's Final Word</div>
                                    </div>
                                    <p className="text-[10px] text-slate-400 leading-relaxed italic">
                                        Targeting 5** requires precise lexical choice, syntactic complexity, and a coherent rhetorical arc. Master these patterns and apply them to your own drafts.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default WritingLabPage;
