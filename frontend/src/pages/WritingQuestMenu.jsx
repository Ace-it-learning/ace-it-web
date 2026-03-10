import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, PenTool, Layout, MessageSquare, ChevronRight, Lock, Briefcase } from 'lucide-react';

const WritingQuestMenu = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [syllabus, setSyllabus] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedFormat, setSelectedFormat] = useState(null);
    const [factoryTopics, setFactoryTopics] = useState([]);
    const [loadingTopics, setLoadingTopics] = useState(false);

    useEffect(() => {
        const fetchSyllabus = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                const res = await fetch(`${API_URL}/api/writing/syllabus`);
                if (res.ok) {
                    const data = await res.json();
                    setSyllabus(data);

                    // Check if we have an initial genre from state
                    const initialGenre = location.state?.initialGenre;
                    if (initialGenre && data.genre_matrix) {
                        // Find category containing this genre
                        const cat = data.genre_matrix.find(c => c.formats.includes(initialGenre));
                        if (cat) {
                            setSelectedCategory(cat);
                            handleFormatSelect(initialGenre);
                            return;
                        }
                    }

                    // Default to first category
                    if (data.genre_matrix && data.genre_matrix.length > 0) {
                        setSelectedCategory(data.genre_matrix[0]);
                    }
                }
            } catch (err) {
                console.error("Failed to load layout", err);
            }
        };
        fetchSyllabus();
    }, [location.state]);

    const handleFormatSelect = async (format) => {
        setSelectedFormat(format);
        setLoadingTopics(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            // format is e.g. "Debate Speech"
            const res = await fetch(`${API_URL}/api/writing/format/${encodeURIComponent(format)}`);
            if (res.ok) {
                const topics = await res.json();
                setFactoryTopics(topics);
            } else {
                setFactoryTopics([]);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingTopics(false);
        }
    };

    const handleStartQuest = (topic) => {
        // Navigate to the quest page with state
        navigate('/writing/quest', {
            state: {
                topic: topic.prompt,
                format: selectedFormat,
                title: topic.title
            }
        });
    };

    const getIconForCategory = (id) => {
        switch (id) {
            case 'cat_argumentative': return <MessageSquare size={20} />;
            case 'cat_narrative': return <BookOpen size={20} />;
            case 'cat_transactional': return <Briefcase size={20} />;
            case 'cat_discursive': return <Layout size={20} />;
            default: return <PenTool size={20} />;
        }
    };

    if (!syllabus) return <div className="p-10 text-center text-gray-500">Loading Writer's Studio...</div>;

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans">
            <header className="mb-8">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                    <span className="bg-indigo-600 text-white p-2 rounded-lg"><PenTool size={24} /></span>
                    The Writer's Studio
                </h1>
                <p className="text-slate-500 mt-2 text-lg">Master the art of being a "Linguistic Chameleon" across {syllabus.genre_matrix?.reduce((acc, cat) => acc + cat.formats.length, 0) || 12} DSE genres.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left Column: Categories */}
                <div className="lg:col-span-3 space-y-3">
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wilder mb-4">Categories</h2>
                    {syllabus.genre_matrix?.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => { setSelectedCategory(cat); setSelectedFormat(null); setFactoryTopics([]); }}
                            className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 
                ${selectedCategory?.id === cat.id
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 transform scale-102'
                                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
                        >
                            {getIconForCategory(cat.id)}
                            <span className="font-semibold">{cat.type.split(' ')[0]}</span>
                        </button>
                    ))}
                </div>

                {/* Middle Column: Genres in Selected Category */}
                <div className="lg:col-span-4 space-y-4">
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wilder mb-4">Select Format</h2>
                    {selectedCategory ? (
                        <div className="space-y-3">
                            {selectedCategory.formats.map(fmt => (
                                <button
                                    key={fmt}
                                    onClick={() => handleFormatSelect(fmt)}
                                    className={`w-full text-left p-4 rounded-xl border-2 transition-all relative overflow-hidden group
                     ${selectedFormat === fmt
                                            ? 'border-indigo-600 bg-indigo-50'
                                            : 'border-white bg-white hover:border-indigo-200'}`}
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <span className={`font-bold text-lg ${selectedFormat === fmt ? 'text-indigo-900' : 'text-slate-800'}`}>
                                            {fmt}
                                        </span>
                                        {selectedFormat === fmt && <div className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse"></div>}
                                    </div>
                                    <p className="text-xs text-slate-500">
                                        Target: {selectedCategory.id === 'cat_argumentative' ? 'Persuade' :
                                            selectedCategory.id === 'cat_narrative' ? 'Entertain' :
                                                selectedCategory.id === 'cat_transactional' ? 'Inform' : 'Analyze'}
                                    </p>
                                    {/* Key Feature Tooltip Effect */}
                                    <div className="mt-2 text-xs text-indigo-600 font-medium py-1 px-2 bg-indigo-100 rounded inline-block">
                                        {selectedCategory.key_feature}
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="text-slate-400 text-sm italic">Select a category to view formats.</div>
                    )}
                </div>

                {/* Right Column: Factory Topics */}
                <div className="lg:col-span-5">
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wilder mb-4">Factory Topics</h2>
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm min-h-[500px] flex flex-col">

                        {selectedFormat ? (
                            <div className="p-4 flex-1 overflow-y-auto max-h-[600px]">
                                <div className="mb-4 pb-4 border-b border-slate-100">
                                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                        {selectedFormat}
                                        <span className="text-xs font-normal text-slate-400 bg-slate-100 px-2 py-1 rounded">Batch #2024-A</span>
                                    </h3>
                                    <p className="text-sm text-slate-500 mt-1">Select a topic to begin your guided writing session.</p>
                                </div>

                                {loadingTopics ? (
                                    <div className="space-y-3">
                                        {[1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />)}
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {factoryTopics.map(topic => (
                                            <button
                                                key={topic.id}
                                                onClick={() => handleStartQuest(topic)}
                                                className="w-full text-left p-4 rounded-xl border border-slate-100 hover:border-indigo-400 hover:shadow-md transition-all group bg-slate-50 hover:bg-white"
                                            >
                                                <div className="flex justify-between items-start">
                                                    <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-700 mb-1 block">
                                                        {topic.title}
                                                    </span>
                                                    <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-500 transform group-hover:translate-x-1 transition-transform" />
                                                </div>
                                                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                                    {topic.prompt}
                                                </p>
                                            </button>
                                        ))}
                                        {factoryTopics.length === 0 && (
                                            <div className="text-center py-10 text-slate-400">
                                                No topics found for this format yet.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center text-slate-400">
                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-300">
                                    <Layout size={32} />
                                </div>
                                <p>Select a format from the middle column to reveal the topic factory.</p>
                            </div>
                        )}

                        {/* Surprise Me Footer */}
                        <div className="p-4 bg-slate-50 border-t border-slate-100 rounded-b-xl">
                            <button
                                disabled={!selectedFormat}
                                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl shadow-lg shadow-orange-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-orange-300 transition-all flex items-center justify-center gap-2"
                            >
                                <span className="text-lg">🎲</span> Surprise Me (Custom Topic)
                            </button>
                            <p className="text-[10px] text-center text-slate-400 mt-2">Uses AI to generate a unique random topic based on current events.</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default WritingQuestMenu;
