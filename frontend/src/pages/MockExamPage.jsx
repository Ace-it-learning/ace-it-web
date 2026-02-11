import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    BookOpen,
    PenTool,
    Headphones,
    Mic,
    Clock,
    Trophy,
    Star,
    Zap,
    Lock,
    ArrowRight,
    Filter,
    Sparkles,
    ArrowLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getUserMastery } from '../services/masteryService';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const MockExamPage = () => {
    const { user } = useAuth();
    const { t, language } = useLanguage();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('reading'); // reading, writing, listening, speaking
    const [mocks, setMocks] = useState([]);
    const [submissions, setSubmissions] = useState({}); // { examId: latestSubmission }
    const [loading, setLoading] = useState(true);
    const [userLevel, setUserLevel] = useState(3); // Default Level 3

    // Tab Configuration
    const TABS = [
        { id: 'reading', label: 'Reading', icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { id: 'writing', label: 'Writing', icon: PenTool, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        { id: 'listening', label: 'Listening', icon: Headphones, color: 'text-green-500', bg: 'bg-green-500/10' },
        { id: 'speaking', label: 'Speaking', icon: Mic, color: 'text-orange-500', bg: 'bg-orange-500/10' }
    ];

    // Helper: Level Calculation from Percentage (Sync with ResultPage)
    const calculateDSEGrade = (p) => {
        if (!p && p !== 0) return null;
        if (p >= 90) return "5**";
        if (p >= 85) return "5*";
        if (p >= 75) return "5";
        if (p >= 65) return "4";
        if (p >= 55) return "3";
        if (p >= 40) return "2";
        return "1";
    };

    // Fetch User Submissions (History)
    useEffect(() => {
        if (!user) return;
        const fetchSubmissions = async () => {
            try {
                const q = query(
                    collection(db, 'exam_submissions'),
                    where('uid', '==', user.uid)
                );
                const snap = await getDocs(q);
                const subMap = {};
                snap.docs.forEach(doc => {
                    const data = doc.data();
                    const examId = data.examId;
                    // Keep the one with highest percentage OR latest (for now latest)
                    if (!subMap[examId] || (data.timestamp?.toMillis() > subMap[examId].timestamp?.toMillis())) {
                        subMap[examId] = data;
                    }
                });
                setSubmissions(subMap);
            } catch (err) {
                console.error("Failed to fetch submissions", err);
            }
        };
        fetchSubmissions();
    }, [user]);

    // Fetch User Level on Mount
    useEffect(() => {
        if (!user) return;
        getUserMastery(user.uid).then(data => {
            if (data?.level) setUserLevel(Math.floor(data.level));
        });
    }, [user]);

    // Fetch Mocks when Tab Changes
    useEffect(() => {
        const fetchMocks = async () => {
            setLoading(true);
            try {
                if (activeTab === 'reading') {
                    // Fetch from Firestore for Reading
                    const q = query(collection(db, 'mock_exams'), where('is_published', '==', true));
                    const snap = await getDocs(q);
                    const docs = snap.docs.map(d => ({
                        id: d.id,
                        ...d.data(),
                        duration: d.data().duration || '1 hr 30 mins',
                        level: d.data().level || 3
                    }));
                    setMocks(docs);
                } else {
                    // Fetch from API for Writing, Listening, Speaking
                    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                    const res = await fetch(`${API_URL}/api/${activeTab}/exams`);
                    if (res.ok) {
                        const data = await res.json();
                        setMocks(Array.isArray(data) ? data.map(d => ({
                            ...d,
                            duration: d.duration || (activeTab === 'writing' ? '2 hours' : activeTab === 'listening' ? '2 hours' : '20 mins')
                        })) : []);
                    } else {
                        setMocks([]);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch mocks", err);
                setMocks([]);
            } finally {
                setLoading(false);
            }
        };

        fetchMocks();
    }, [activeTab]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 pt-8 pb-4 px-4 sm:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-500" />
                            </button>
                            <div>
                                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                                    Mock Exam Hall
                                </h1>
                                <p className="text-gray-500 dark:text-gray-400 mt-1">
                                    High-stakes DSE simulation. Standardized papers for accurate benchmarking.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg text-sm font-bold flex items-center gap-2">
                                <Trophy className="w-4 h-4" />
                                <span>Your Estimated Grade: {userLevel}</span>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex space-x-1 overflow-x-auto pb-2 scrollbar-hide">
                        {TABS.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                                        flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap
                                        ${isActive
                                            ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-lg scale-105'
                                            : 'bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}
                                    `}
                                >
                                    <Icon className={`w-4 h-4 ${isActive ? 'text-current' : tab.color}`} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">

                <div className="border-t border-gray-200 dark:border-gray-700" />

                {/* Filter Bar Removed - DSE is Standardized */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Papers
                    </h2>
                </div>

                {/* List */}
                <div className="grid grid-cols-1 gap-4">
                    {loading ? (
                        [1, 2, 3].map(i => (
                            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
                        ))
                    ) : mocks.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            No exams found.
                        </div>
                    ) : (
                        mocks.map((exam) => {
                            const submission = submissions[exam.id];
                            const isCompleted = !!submission;
                            const xpEarned = submission?.xpEarned || 0;
                            const grade = calculateDSEGrade(submission?.percentage);

                            return (
                                <div key={exam.id} className={`group bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all flex items-center justify-between ${isCompleted ? 'border-gray-100 dark:border-gray-800' : 'hover:border-indigo-300 dark:hover:border-indigo-700'}`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-opacity ${isCompleted ? 'opacity-40' : ''} ${activeTab === 'reading' ? 'bg-blue-50 text-blue-600' :
                                            activeTab === 'writing' ? 'bg-purple-50 text-purple-600' :
                                                activeTab === 'listening' ? 'bg-green-50 text-green-600' :
                                                    'bg-orange-50 text-orange-600'
                                            }`}>
                                            {activeTab === 'reading' && <BookOpen className="w-6 h-6" />}
                                            {activeTab === 'writing' && <PenTool className="w-6 h-6" />}
                                            {activeTab === 'listening' && <Headphones className="w-6 h-6" />}
                                            {activeTab === 'speaking' && <Mic className="w-6 h-6" />}
                                        </div>
                                        <div>
                                            <h3 className={`font-bold transition-all ${isCompleted ? 'text-gray-400 line-through' : 'text-gray-900 dark:text-white group-hover:text-indigo-600'}`}>
                                                {exam.title || exam.id.replace(/_/g, ' ')}
                                            </h3>
                                            <div className="flex items-center gap-3 mt-1.5">
                                                <span className="flex items-center gap-1 text-xs text-gray-500">
                                                    <Clock className="w-3 h-3" /> {exam.duration || 'N/A'}
                                                </span>

                                                {isCompleted ? (
                                                    <div className="flex items-center gap-2">
                                                        <span className="px-2 py-0.5 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-md text-[10px] font-bold border border-green-100 dark:border-green-800 flex items-center gap-1">
                                                            <Zap className="w-2.5 h-2.5" /> +{xpEarned} XP
                                                        </span>
                                                        <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-md text-[10px] font-bold border border-indigo-100 dark:border-indigo-800">
                                                            Level {grade}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="px-2 py-0.5 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-md text-[10px] font-bold border border-orange-100 dark:border-orange-800 flex items-center gap-1">
                                                        <Star className="w-2.5 h-2.5" /> Earn 500 XP
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {isCompleted && (
                                            <button
                                                onClick={() => navigate(`/result/${exam.id}`)}
                                                className="px-5 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-bold text-sm hover:bg-gray-50 transition-all flex items-center gap-2"
                                            >
                                                <span>Review</span>
                                                <ArrowRight className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => {
                                                if (activeTab === 'speaking') navigate(`/speaking-exam/${exam.id}`);
                                                else if (activeTab === 'writing') navigate(`/writing/exam/${exam.id}`);
                                                else if (activeTab === 'listening') navigate(`/listening/exam/${exam.id}`);
                                                else navigate(`/exam/${exam.id}`);
                                            }}
                                            className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${isCompleted
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed hidden group-hover:block'
                                                : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0'
                                                }`}
                                        >
                                            {isCompleted ? 'Retry' : 'Start'}
                                            {!isCompleted && <ArrowRight className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

            </div>
        </div>
    );
};

export default MockExamPage;
