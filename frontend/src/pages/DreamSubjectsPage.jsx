import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    GraduationCap, Target, Sparkles, Info, ShieldCheck,
    BookOpen, TrendingUp, Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getJupasProgrammes, getJupasProgrammeDetails } from '../services/jupasService';
import ProgrammeSearchPanel from '../components/dream-subjects/ProgrammeSearchPanel';
import DreamListPanel from '../components/dream-subjects/DreamListPanel';

const DreamSubjectsPage = () => {
    const { user } = useAuth();
    const { language } = useLanguage();
    const navigate = useNavigate();

    // Core state
    const [dreamPrograms, setDreamPrograms] = useState([]);
    const [userTargets, setUserTargets] = useState(null);
    const [scoringScale, setScoringScale] = useState('standard');
    const [jupasPrograms, setJupasPrograms] = useState([]);
    const [programsLoading, setProgramsLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Detail fetch state: { [code]: detailsObj | 'loading' }
    const [detailState, setDetailState] = useState({});

    const translations = {
        en: {
            title: 'Dream Subjects',
            subtitle: 'Set your Top 20 dream programs. Ace Sir will track the gap to your target.',
            searchPlaceholder: 'Search Programs (Code or Name)...',
            allCategories: 'All Areas',
            allUniversities: 'All Universities',
            selectedCount: (count) => `Selected (${count}/20)`,
            noPrograms: 'Choose up to 20 dream subjects. Drag to reorder your preference.',
            save: 'Save Selection',
            saving: 'Saving...',
            loading: 'Loading...',
            add: 'Add',
            limitReached: 'You can select up to 20 dream subjects!',
            best5Label: 'Estimated Best 5',
            scoringScale: 'Scoring Scale',
            standardScale: 'Standard (DSE)',
            bonusScale: 'Institutional (Bonus)',
            reachable: 'Reachable',
            stretch: 'Stretch',
            ambitious: 'Ambitious',
            programDetail: 'Program Detail',
            back: 'Back to List',
            collecting: 'Official database is being updated...',
            tips: "Ace Sir's Strategy Tips",
            structure: 'Program Structure/Features',
            admission: 'Admission Criteria',
            career: 'Career Prospects',
            emptySearch: 'No matching programs found',
            clearFilters: 'Clear Filters',
            dreamListHeader: 'My Dream Programs',
            dragHint: 'Drag to reorder',
            targetScore: 'Target',
            gapStatus: (gap) => gap <= 0 ? 'Reachable' : `${gap} pts gap`,
            sourceHint: 'Source: Official JUPAS pages (2024/25 Academic Year)',
            cancel: 'Cancel',
            description: 'Set your Top 20 dream programs, Ace Sir will track the gap to your target',
            standardHint: "Using standard scoring (1-7)",
            bonusHint: "Using university bonus scale (5**=8.5, 5*=7, 5=5.5)",
            baselineHint: "Based on your Eng + Math data and self-reported electives",
            selectedStats: 'Selected',
            best5Stats: 'Est. Best 5',
            maxLimit: 'Max 20'
        },
        zh: {
            title: '我的夢想學科',
            subtitle: '設定你嘅 Top 20 心儀課程，Ace Sir 會幫你追蹤同目標嘅距離',
            searchPlaceholder: '搜尋課程 (編號或名稱)...',
            allCategories: '全部範疇',
            allUniversities: '全部大學',
            selectedCount: (count) => `已選擇 (${count}/20)`,
            noPrograms: '可選擇最多 20 個夢想學科。拖動以排列優先次序。',
            save: '儲存選擇',
            saving: '儲存中...',
            loading: '載入中...',
            add: '加入',
            limitReached: '最多可以選擇 20 個夢想學科！',
            best5Label: '預計 Best 5',
            scoringScale: '計分方式',
            standardScale: '標準 (DSE)',
            bonusScale: '院校加權 (Bonus)',
            reachable: '穩陣',
            stretch: '搏一搏',
            ambitious: '進取',
            programDetail: '學科詳情',
            back: '返回列表',
            collecting: '官方資料更新中...',
            tips: 'Ace Sir 戰略攻略',
            structure: '課程結構及特色',
            admission: '收生要求',
            career: '職業前景',
            emptySearch: '搵唔到相關課程',
            clearFilters: '清除篩選',
            dreamListHeader: '我嘅心儀課程',
            dragHint: '拖動調整優先次序',
            targetScore: '目標',
            gapStatus: (gap) => gap <= 0 ? '穩陣' : `差 ${gap} 分`,
            sourceHint: '數據來源：各大學官方 JUPAS 頁面（2024/25 學年）',
            cancel: '取消',
            description: '設定你嘅 Top 20 心儀課程，Ace Sir 會幫你追蹤同目標嘅距離',
            standardHint: "正在使用標準計分機制 (1-7)",
            bonusHint: "正在使用大學加分機制 (5**=8.5, 5*=7, 5=5.5)",
            baselineHint: "基於英文 + 數學數據，加埋你自報嘅其他科目",
            selectedStats: '已選擇',
            best5Stats: '預計 Best 5',
            maxLimit: '最多 20'
        }
    };

    const t = translations[language === 'zh' ? 'zh' : 'en'];

    // Fetch JUPAS programmes on mount
    useEffect(() => {
        const fetchProgrammes = async () => {
            setProgramsLoading(true);
            try {
                const programmes = await getJupasProgrammes();
                setJupasPrograms(programmes);
            } catch (err) {
                console.warn('[DreamSubjects] Failed to fetch programmes:', err);
            }
            setProgramsLoading(false);
        };
        fetchProgrammes();
    }, []);

    // Fetch user's dream programs on mount
    useEffect(() => {
        if (user?.uid) {
            const fetchDreamPrograms = async () => {
                setLoading(true);
                try {
                    const API_URL = import.meta.env.VITE_API_URL || '';
                    const response = await fetch(`${API_URL}/api/user/dream-programs?uid=${user.uid}`);
                    if (response.ok) {
                        const data = await response.json();
                        setDreamPrograms(data.programs || []);
                        setUserTargets(data.targets || null);
                    }
                } catch (err) {
                    console.warn('[DreamSubjects] Failed to fetch dream programs:', err);
                }
                setLoading(false);
            };
            fetchDreamPrograms();
        }
    }, [user?.uid]);

    // Calculate estimated Best 5
    const calculateBest5 = useCallback((targets, scale) => {
        if (!targets) return 24;

        const standardMap = {
            '5**': 7, '5*': 6, '5': 5, '4': 4, '3': 3, '2': 2, '1': 1, 'U': 0, '': 0
        };
        const bonusMap = {
            '5**': 8.5, '5*': 7, '5': 5.5, '4': 4, '3': 3, '2': 2, '1': 1, 'U': 0, '': 0
        };
        const activeMap = scale === 'bonus' ? bonusMap : standardMap;

        const scores = [
            activeMap[targets.eng] || 0,
            activeMap[targets.chi] || 0,
            activeMap[targets.math] || 0,
            ...(targets.electives || []).map(e => activeMap[e.targetGrade] || 0)
        ];

        return scores
            .sort((a, b) => b - a)
            .slice(0, 5)
            .reduce((sum, score) => sum + score, 0);
    }, []);

    const estimatedBest5 = calculateBest5(userTargets, scoringScale);

    // Handlers
    const handleAddProgram = (program) => {
        if (dreamPrograms.length >= 20) {
            alert(t.limitReached);
            return;
        }
        setDreamPrograms(prev => [...prev, program]);
    };

    const handleRemoveProgram = (programId) => {
        setDreamPrograms(prev => prev.filter(p => p.id !== programId));
    };

    const handleViewDetail = useCallback(async (program) => {
        if (!program?.code) return;
        // If already loaded, do nothing
        if (detailState[program.code] && detailState[program.code] !== 'loading') return;

        setDetailState(prev => ({ ...prev, [program.code]: 'loading' }));
        try {
            const result = await getJupasProgrammeDetails(program.code);
            setDetailState(prev => ({ ...prev, [program.code]: result.details || null }));
        } catch (err) {
            console.warn('[DreamSubjects] Failed to fetch details:', err);
            setDetailState(prev => ({ ...prev, [program.code]: null }));
        }
    }, [detailState]);

    const handleSave = async () => {
        if (!user?.uid) return;
        setSaving(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || '';
            const response = await fetch(`${API_URL}/api/user/dream-programs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid: user.uid, programs: dreamPrograms })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save');
            }

            // Show success feedback
            alert(language === 'zh' ? '儲存成功！' : 'Saved successfully!');
        } catch (err) {
            console.error('[DreamSubjects] Save failed:', err);
            alert(`${language === 'zh' ? '儲存失敗' : 'Save failed'}: ${err.message || (language === 'zh' ? '請再試一次' : 'Please try again')}`);
        }
        setSaving(false);
    };

    return (
        <div className="min-h-screen bg-slate-50 selection:bg-indigo-100 italic-none">
            {/* Header Area */}
            <div className="bg-white border-b border-slate-200 px-8 py-10">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <ShieldCheck className="text-indigo-600" size={18} />
                                <span className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em]">
                                    {language === 'zh' ? 'JUPAS 課程規劃' : 'JUPAS Programme Planner'}
                                </span>
                            </div>
                            <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight">
                                {t.title}
                            </h1>
                            <p className="text-slate-500 mt-2 font-medium text-lg">
                                {t.subtitle}
                            </p>
                        </div>
                    </div>

                    {/* Stats Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-start gap-4">
                            <div className="p-3 bg-white rounded-xl shadow-sm text-indigo-600">
                                <BookOpen size={20} />
                            </div>
                            <div>
                                <h3 className="text-base font-black text-indigo-900 uppercase">{t.selectedStats}</h3>
                                <p className="text-sm text-indigo-700 mt-1 font-medium">
                                    {dreamPrograms.length} / 20 {language === 'zh' ? '個課程' : 'programs'}
                                </p>
                            </div>
                        </div>
                        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-start gap-4">
                            <div className="p-3 bg-white rounded-xl shadow-sm text-emerald-600">
                                <Target size={20} />
                            </div>
                            <div>
                                <h3 className="text-base font-black text-emerald-900 uppercase">{t.best5Stats}</h3>
                                <p className="text-sm text-emerald-700 mt-1 font-medium">
                                    {estimatedBest5} {language === 'zh' ? '分' : 'pts'} ({scoringScale === 'bonus' ? 'Bonus' : 'Standard'})
                                </p>
                            </div>
                        </div>
                        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-start gap-4">
                            <div className="p-3 bg-white rounded-xl shadow-sm text-amber-600">
                                <Award size={20} />
                            </div>
                            <div>
                                <h3 className="text-base font-black text-amber-900 uppercase">{t.maxLimit}</h3>
                                <p className="text-sm text-amber-700 mt-1 font-medium">
                                    {language === 'zh' ? '可選擇最多 20 個心儀課程' : 'Up to 20 dream programmes'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="max-w-7xl mx-auto px-8 py-12">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-pulse space-y-4 text-center">
                            <div className="w-12 h-12 bg-slate-200 rounded-full mx-auto" />
                            <p className="text-sm text-slate-400 font-medium">{t.loading}</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left Column — Search & Programme List */}
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-indigo-100 rounded-xl">
                                    <GraduationCap className="w-5 h-5 text-indigo-600" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                                        {language === 'zh' ? '搜尋課程' : 'Search Programmes'}
                                    </h2>
                                    <p className="text-sm text-slate-400 font-medium">
                                        {language === 'zh' ? '瀏覽並加入心儀課程' : 'Browse and add your dream programmes'}
                                    </p>
                                </div>
                            </div>
                            <ProgrammeSearchPanel
                                programmes={jupasPrograms}
                                dreamPrograms={dreamPrograms}
                                onAddProgram={handleAddProgram}
                                onViewDetail={handleViewDetail}
                                detailState={detailState}
                                language={language}
                                t={t}
                                programsLoading={programsLoading}
                            />
                        </div>

                        {/* Right Column — Dream List */}
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-amber-100 rounded-xl">
                                    <Sparkles className="w-5 h-5 text-amber-600" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                                        {language === 'zh' ? '我的心儀課程' : 'My Dream List'}
                                    </h2>
                                    <p className="text-sm text-slate-400 font-medium">
                                        {language === 'zh' ? '拖動調整優先次序' : 'Drag to reorder priority'}
                                    </p>
                                </div>
                            </div>
                            <DreamListPanel
                                dreamPrograms={dreamPrograms}
                                onReorder={setDreamPrograms}
                                onRemoveProgram={handleRemoveProgram}
                                onViewDetail={handleViewDetail}
                                detailState={detailState}
                                estimatedBest5={estimatedBest5}
                                scoringScale={scoringScale}
                                onToggleScoringScale={setScoringScale}
                                language={language}
                                t={t}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Bar */}
            <div className="bg-white border-t border-slate-200 px-8 py-6">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                        <Info className="w-3 h-3" />
                        <span>{t.sourceHint}</span>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
                        >
                            {t.cancel}
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-black uppercase tracking-widest transition-all disabled:opacity-50 shadow-lg shadow-indigo-200"
                        >
                            {saving ? t.saving : t.save}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DreamSubjectsPage;
