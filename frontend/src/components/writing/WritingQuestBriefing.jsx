import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { BookOpen, CheckCircle, ArrowRight, Star, Lightbulb, PenTool, Globe, RefreshCw } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const WritingQuestBriefing = () => {
    const { genre } = useParams(); // e.g., "debate-speech" (slug) or "Debate Speech" (raw) - we might need to handle encoding
    const navigate = useNavigate();
    const location = useLocation();
    const { initialGenre, taskId } = location.state || {}; // Fallback from state
    const { t } = useLanguage();

    const [loading, setLoading] = useState(true);
    const [syllabus, setSyllabus] = useState(null);
    const [factoryTopics, setFactoryTopics] = useState([]);
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Resolved Genre Name
    const genreName = initialGenre || decodeURIComponent(genre);

    useEffect(() => {
        const loadPageData = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

                // 1. Fetch Syllabus
                const syllabusRes = await fetch(`${API_URL}/api/writing/syllabus`);
                if (syllabusRes.ok) {
                    const data = await syllabusRes.json();
                    setSyllabus(data);
                }

                // 2. Fetch Factory Topics for this genre
                const topicsRes = await fetch(`${API_URL}/api/writing/format/${genreName}`);
                if (topicsRes.ok) {
                    const topics = await topicsRes.json();
                    setFactoryTopics(topics);
                    if (topics.length > 0) {
                        // Pick a random topic or the first one
                        const randomTopic = topics[Math.floor(Math.random() * topics.length)];
                        setSelectedTopic(randomTopic);
                    }
                }
            } catch (e) {
                console.error("Failed to fetch data", e);
            } finally {
                setLoading(false);
            }
        };
        loadPageData();
    }, [genreName]);

    const handleRefresh = () => {
        if (factoryTopics.length > 1) {
            setIsRefreshing(true);
            // Artificial delay for feel
            setTimeout(() => {
                let nextTopic;
                do {
                    nextTopic = factoryTopics[Math.floor(Math.random() * factoryTopics.length)];
                } while (nextTopic.id === selectedTopic.id);

                setSelectedTopic(nextTopic);
                setIsRefreshing(false);
            }, 500);
        }
    };

    const handleStart = () => {
        navigate('/writing/quest', {
            state: {
                topic: selectedTopic?.prompt || genreName,
                title: selectedTopic?.title || `${genreName} Practice`,
                format: genreName,
                taskId: taskId,
                isFactoryMode: true
            }
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    // Terminology Update for Pillars
    const terminologyMap = {
        'content': '1. Spark Ideas',
        'language': '2. Draft & Polish',
        'organization': '3. Connect & Review'
    };

    const pillars = (syllabus?.learning_content || [
        { id: 'content', dse_objective: "Relevance & Development", british_tutor_hint: "Quality over quantity. Develop your ideas fully." },
        { id: 'language', dse_objective: "Vocabulary & Grammar", british_tutor_hint: "Use varied sentence structures and precise vocabulary." },
        { id: 'organization', dse_objective: "Cohesion & Flow", british_tutor_hint: "Ensure smooth transitions between paragraphs." }
    ]).map(p => ({
        ...p,
        displayTitle: terminologyMap[p.id] || p.id
    }));

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            {/* Header / Banner */}
            <div className="bg-indigo-900 text-white p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <PenTool size={200} />
                </div>

                <div className="max-w-4xl mx-auto relative z-10">
                    <button
                        onClick={() => navigate(-1)}
                        className="mb-6 text-indigo-200 hover:text-white flex items-center gap-2 transition-colors"
                    >
                        ← Back to Roadmap
                    </button>

                    <div className="flex items-center gap-4 mb-4">
                        <span className="px-3 py-1 bg-indigo-700 rounded-full text-xs font-bold tracking-wider uppercase border border-indigo-500">
                            Writing Quest
                        </span>
                        <span className="px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-xs font-bold tracking-wider uppercase border border-amber-500/30 flex items-center gap-1">
                            <Star size={12} className="fill-current" /> Level 5* Target
                        </span>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
                        {genreName}
                    </h1>
                    <p className="text-xl text-indigo-200 max-w-2xl">
                        Master the art of this genre. Secure those content points and organize your arguments like a pro.
                    </p>
                </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 max-w-[85%] mx-auto w-full p-6 -mt-8">
                <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden flex flex-col md:flex-row">

                    {/* Left: Learning Guide */}
                    <div className="flex-1 p-8">
                        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <BookOpen className="text-indigo-600" />
                            Mission Briefing
                        </h2>

                        <div className="space-y-6">
                            {selectedTopic && (
                                <div className="bg-amber-50 p-6 rounded-xl border border-amber-100 mb-6 relative group">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-amber-900 flex items-center gap-2">
                                            <PenTool size={18} />
                                            Target Topic: {selectedTopic.title}
                                        </h3>
                                        <button
                                            onClick={handleRefresh}
                                            disabled={isRefreshing || factoryTopics.length <= 1}
                                            className="p-2 bg-white rounded-lg border border-amber-200 text-amber-600 hover:bg-amber-100 hover:text-amber-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 text-xs font-bold shadow-sm"
                                            title="Try another topic"
                                        >
                                            <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
                                            Refresh
                                        </button>
                                    </div>
                                    <div className="space-y-1">
                                        {(() => {
                                            if (!selectedTopic?.prompt) return null;

                                            // Helper to render segmented prompt
                                            const text = selectedTopic.prompt;
                                            const blocks = text.split(/(\*\*Writing Situation:\*\*|\*\*Requirements \(Focus\):\*\*)/g);

                                            return blocks.map((block, idx) => {
                                                const trimmed = block.trim();
                                                if (!trimmed) return null;

                                                const isHeader = trimmed === '**Writing Situation:**' || trimmed === '**Requirements (Focus):**';

                                                if (isHeader) {
                                                    return (
                                                        <div key={idx} className="font-black text-amber-900 mt-4 mb-1 text-[10px] uppercase tracking-widest block">
                                                            {trimmed.replace(/\*\*/g, '')}
                                                        </div>
                                                    );
                                                }

                                                // Basic bolding for content within block
                                                const formattedText = trimmed.split(/(\*\*.*?\*\*)/g).map((part, pIdx) => {
                                                    if (part.startsWith('**') && part.endsWith('**')) {
                                                        return <b key={pIdx} className="font-black text-amber-950">{part.replace(/\*\*/g, '')}</b>;
                                                    }
                                                    return part;
                                                });

                                                return (
                                                    <p key={idx} className="text-amber-900 text-base leading-relaxed">
                                                        {formattedText}
                                                    </p>
                                                );
                                            });
                                        })()}
                                    </div>
                                </div>
                            )}

                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                                    <Globe size={18} />
                                    The Goal
                                </h3>
                                <p className="text-blue-800 text-sm leading-relaxed">
                                    You will write a <b>{genreName}</b> based on the prompt above.
                                    Our AI tutor, Miss Janie, will guide you through brainstorming,
                                    drafting, and finalizing your piece.
                                </p>
                            </div>

                            <div>
                                <h3 className="font-bold text-slate-700 mb-4 uppercase tracking-wider text-xs">
                                    Key Success Factors (Modern 3 Pillars)
                                </h3>
                                <div className="grid gap-4">
                                    {pillars.map((p, idx) => (
                                        <div key={idx} className="flex gap-4 items-start group">
                                            <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800">{p.displayTitle}</h4>
                                                <p className="text-slate-500 text-sm mb-1">{p.dse_objective || "Master the basics."}</p>
                                                <div className="text-xs text-indigo-500 italic flex items-center gap-1">
                                                    <Lightbulb size={12} />
                                                    "{p.british_tutor_hint}"
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Action Panel */}
                    <div className="w-full md:w-80 bg-slate-50 border-l border-slate-100 p-8 flex flex-col justify-center items-center text-center">
                        <div className="w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center mb-6 relative">
                            <PenTool size={32} className="text-indigo-600" />
                            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-4 border-slate-50">
                                <CheckCircle size={14} className="text-white" />
                            </div>
                        </div>

                        <h3 className="font-bold text-slate-800 text-lg mb-2">Ready to Write?</h3>
                        <p className="text-slate-500 text-sm mb-8">
                            Estimated time: 30-45 mins<br />
                            XP Reward: <b>350 XP</b>
                        </p>

                        <button
                            onClick={handleStart}
                            className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            Start Mission <ArrowRight size={18} />
                        </button>

                        <p className="mt-4 text-[10px] text-slate-400 uppercase tracking-wide">
                            AI-Powered Feedback Enabled
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WritingQuestBriefing;
