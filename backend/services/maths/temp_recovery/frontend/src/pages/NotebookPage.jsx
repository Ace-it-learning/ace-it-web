import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getNotebookItems, deleteNotebookItem } from '../services/notebookService';
import NotebookCard from '../components/notebook/NotebookCard';
import { Search, Filter, BookOpen, BrainCircuit, XCircle, Lightbulb, LayoutTemplate, Loader2 } from 'lucide-react';

const NotebookPage = () => {
    const { user } = useAuth();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, vocabulary, mistake, golden_nugget, pattern
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (user) {
            loadItems();
        }
    }, [user]);

    const loadItems = async () => {
        try {
            const data = await getNotebookItems(user.uid);
            setItems(data);
        } catch (error) {
            console.error("Failed to load notebook", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (itemId) => {
        if (window.confirm("Remove this item from your notebook?")) {
            try {
                await deleteNotebookItem(user.uid, itemId);
                setItems(prev => prev.filter(i => i.id !== itemId));
            } catch (error) {
                alert("Failed to delete item");
            }
        }
    };

    const filteredItems = items.filter(item => {
        const matchesType = filter === 'all' || item.type === filter;
        const matchesSearch = item.term?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.note?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesType && matchesSearch;
    });

    const categories = [
        { id: 'all', label: 'All Items', icon: BookOpen },
        { id: 'vocabulary', label: 'Vocabulary', icon: BookOpen },
        { id: 'mistake', label: 'Mistakes', icon: XCircle },
        { id: 'golden_nugget', label: 'Golden Nuggets', icon: Lightbulb },
        { id: 'pattern', label: 'Patterns', icon: LayoutTemplate },
    ];

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-indigo-500" /></div>;

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-black/20 p-6 md:p-10 pb-32">
            <div className="max-w-7xl mx-auto space-y-10">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight mb-2">My Knowledge Base</h1>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">Your personal collection of vocabulary, mistakes, and key insights.</p>
                    </div>
                    {/* Search Bar */}
                    <div className="relative w-full md:w-96 group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                            <Search size={20} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search your notes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 rounded-2xl outline-none focus:border-indigo-500 transition-all font-bold text-gray-700 dark:text-gray-200 shadow-sm"
                        />
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3 pb-2 overflow-x-auto custom-scrollbar">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setFilter(cat.id)}
                            className={`px-5 py-2.5 rounded-xl border flex items-center gap-2 transition-all font-bold text-sm whitespace-nowrap ${filter === cat.id
                                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                                    : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                                }`}
                        >
                            <cat.icon size={16} />
                            {cat.label}
                            {cat.id !== 'all' && (
                                <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[10px] ${filter === cat.id ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                    {items.filter(i => i.type === cat.id).length}
                                </span>
                            )}
                        </button>
                    ))}

                    <button className="ml-auto px-6 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2 active:scale-95">
                        <BrainCircuit size={18} />
                        Quiz Me
                    </button>
                </div>

                {/* Grid */}
                {filteredItems.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredItems.map(item => (
                            <NotebookCard
                                key={item.id}
                                item={item}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-32 bg-white dark:bg-gray-900 rounded-[3rem] border-2 border-dashed border-gray-200 dark:border-gray-800">
                        <div className="size-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
                            <BookOpen size={40} />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">No items found</h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                            {filter === 'all'
                                ? "Your notebook is empty. Start adding vocabulary from labs or chats!"
                                : `You haven't added any ${categories.find(c => c.id === filter)?.label.toLowerCase()} yet.`}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotebookPage;
