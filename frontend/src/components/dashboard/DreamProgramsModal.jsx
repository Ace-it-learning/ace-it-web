import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { GraduationCap, Search, X, Plus, GripVertical, Trash2, Target, TrendingUp, Info, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { JUPAS_PROGRAMS, PROGRAM_CATEGORIES, UNIVERSITY_SHORT_NAMES } from '../../constants/jupasPrograms';
import { JUPAS_PROGRAM_DETAILS } from '../../constants/jupasProgramDetails';
import { useLanguage } from '../../context/LanguageContext';

const DreamProgramsModal = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const { language } = useLanguage();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [dreamPrograms, setDreamPrograms] = useState([]);
    const [userTargets, setUserTargets] = useState(null);
    const [scoringScale, setScoringScale] = useState('standard'); // 'standard' or 'bonus'
    const [viewingDetail, setViewingDetail] = useState(null); // Program object being viewed
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Fetch user's dream programs on open
    useEffect(() => {
        if (isOpen && user?.uid) {
            const fetchDreamPrograms = async () => {
                setLoading(true);
                try {
                    const response = await fetch(`/api/user/dream-programs?uid=${user.uid}`);
                    if (response.ok) {
                        const data = await response.json();
                        setDreamPrograms(data.programs || []);
                        setUserTargets(data.targets || null);
                    }
                } catch (err) {
                    console.warn('[DreamPrograms] Failed to fetch:', err);
                }
                setLoading(false);
            };
            fetchDreamPrograms();
        }
    }, [isOpen, user?.uid]);

    // Filter programs based on search and category
    const filteredPrograms = JUPAS_PROGRAMS.filter(p => {
        // Filter by already selected
        if (dreamPrograms.some(dp => dp.id === p.id)) return false;

        // Filter by Category
        if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;

        // Filter by Search
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        return (
            p.name.toLowerCase().includes(query) ||
            p.university.toLowerCase().includes(query) ||
            p.code.toLowerCase().includes(query) ||
            p.faculty.toLowerCase().includes(query) ||
            (UNIVERSITY_SHORT_NAMES[p.university] || '').toLowerCase().includes(query)
        );
    });



    const handleAddProgram = (program) => {
        if (dreamPrograms.length >= 10) {
            alert('最多可以選擇 10 個夢想學科！');
            return;
        }
        setDreamPrograms(prev => [...prev, program]);
        setSearchQuery('');
    };

    const handleRemoveProgram = (programId) => {
        setDreamPrograms(prev => prev.filter(p => p.id !== programId));
    };

    const handleMoveProgram = (fromIndex, toIndex) => {
        if (toIndex < 0 || toIndex >= dreamPrograms.length) return;
        const updated = [...dreamPrograms];
        const [moved] = updated.splice(fromIndex, 1);
        updated.splice(toIndex, 0, moved);
        setDreamPrograms(updated);
    };

    const handleSave = async () => {
        if (!user?.uid) return;
        setSaving(true);
        try {
            const response = await fetch('/api/user/dream-programs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid: user.uid, programs: dreamPrograms })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save');
            }

            onClose();
        } catch (err) {
            console.error('[DreamPrograms] Save failed:', err);
            alert(`儲存失敗: ${err.message || '請再試一次'}`);
        }
        setSaving(false);
    };

    // Calculate estimated Best 5
    const calculateBest5 = (targets, scale) => {
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
    };

    const estimatedBest5 = calculateBest5(userTargets, scoringScale);

    return (
        <Dialog.Root open={isOpen} onOpenChange={onClose}>
            <Dialog.Portal>
                {/* ... overlay & content wrapper ... */}
                <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-[95vw] max-w-4xl translate-x-[-50%] translate-y-[-50%] outline-none animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                    <div className="bg-slate-900 border border-slate-800 text-slate-100 shadow-2xl p-6 rounded-3xl relative max-h-[85vh] overflow-y-auto">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            {/* ... existing header ... */}
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-br from-orange-500/20 to-amber-500/20 rounded-lg">
                                    <GraduationCap className="w-5 h-5 text-orange-400" />
                                </div>
                                <div>
                                    <Dialog.Title className="text-xl font-bold bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">
                                        夢想學科清單
                                    </Dialog.Title>
                                    <Dialog.Description className="text-slate-400 italic text-xs">
                                        設定你嘅 Top 5-10 心儀課程，Ace Sir 會幫你追蹤同目標嘅距離
                                    </Dialog.Description>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left Column - Search & Add */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="搜尋課程 (e.g. JS6070, 醫科, HKU)..."
                                            className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50"
                                        />
                                    </div>

                                    {/* Category Chips */}
                                    <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                                        <button
                                            onClick={() => setSelectedCategory('all')}
                                            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${selectedCategory === 'all'
                                                ? 'bg-orange-500 text-white'
                                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                                }`}
                                        >
                                            全部
                                        </button>
                                        {Object.entries(PROGRAM_CATEGORIES).map(([key, label]) => (
                                            <button
                                                key={key}
                                                onClick={() => setSelectedCategory(key)}
                                                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${selectedCategory === key
                                                    ? 'bg-orange-500 text-white'
                                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                                    }`}
                                            >
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {filteredPrograms.length === 0 && (
                                        <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl">
                                            <p className="text-sm text-slate-500">搵唔到相關課程</p>
                                            <button
                                                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                                                className="text-xs text-orange-400 hover:underline mt-2"
                                            >
                                                清除篩選
                                            </button>
                                        </div>
                                    )}
                                    {filteredPrograms.slice(0, 20).map(program => (
                                        <div
                                            key={program.id}
                                            className="w-full p-3 bg-slate-800/30 border border-slate-700/50 rounded-xl text-left hover:bg-slate-800/50 hover:border-orange-500/30 transition-all group"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1 cursor-pointer" onClick={() => handleAddProgram(program)}>
                                                    <p className="text-sm font-medium text-white group-hover:text-orange-400 transition-colors">
                                                        {program.name}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-xs text-slate-400 font-medium">
                                                            {UNIVERSITY_SHORT_NAMES[program.university] || program.university}
                                                        </span>
                                                        <span className="text-[10px] px-1.5 py-px bg-slate-700 rounded text-slate-300">
                                                            {program.code}
                                                        </span>
                                                    </div>
                                                    <p className="text-[10px] text-slate-600 mt-1">
                                                        Best 5 Median: <span className="text-slate-400">{program.median}</span>
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-1 mt-1">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setViewingDetail(program); }}
                                                        className="p-1.5 text-slate-500 hover:text-orange-400 hover:bg-orange-500/10 rounded-lg transition-colors"
                                                        title="View Details"
                                                    >
                                                        <Info className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleAddProgram(program); }}
                                                        className="p-1.5 text-slate-500 hover:text-orange-400 hover:bg-orange-500/10 rounded-lg transition-colors"
                                                        title="Add to Dream List"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {filteredPrograms.length > 20 && (
                                        <p className="text-[10px] text-center text-slate-600 italic py-2">
                                            顯示首 20 個結果...
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Right Column - Dream List & Gap Analysis */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-orange-400" />
                                        我嘅心儀課程 ({dreamPrograms.length}/10)
                                    </h3>
                                    <div className="text-xs text-slate-500">
                                        拖動調整優先次序
                                    </div>
                                </div>

                                {dreamPrograms.length === 0 ? (
                                    <div className="p-8 text-center border border-dashed border-slate-700 rounded-xl">
                                        <GraduationCap className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                                        <p className="text-sm text-slate-500">
                                            仲未有心儀課程
                                        </p>
                                        <p className="text-xs text-slate-600 mt-1">
                                            喺左邊搜尋並加入課程
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                        {dreamPrograms.map((program, index) => {
                                            const gap = program.median - estimatedBest5;
                                            const isReachable = gap <= 0;
                                            const isStretch = gap > 0 && gap <= 4;
                                            const isAmbitious = gap > 4;

                                            return (
                                                <div
                                                    key={program.id}
                                                    className="p-3 bg-slate-800/30 border border-slate-700/50 rounded-xl group hover:border-orange-500/30 transition-all"
                                                >
                                                    <div className="flex items-start gap-2">
                                                        <div className="flex flex-col items-center gap-1 pt-1">
                                                            <button
                                                                onClick={() => handleMoveProgram(index, index - 1)}
                                                                className="p-0.5 text-slate-600 hover:text-white transition-colors disabled:opacity-30"
                                                                disabled={index === 0}
                                                            >
                                                                <GripVertical className="w-3 h-3 rotate-90" />
                                                            </button>
                                                            <span className="text-[10px] font-bold text-orange-400">#{index + 1}</span>
                                                            <button
                                                                onClick={() => handleMoveProgram(index, index + 1)}
                                                                className="p-0.5 text-slate-600 hover:text-white transition-colors disabled:opacity-30"
                                                                disabled={index === dreamPrograms.length - 1}
                                                            >
                                                                <GripVertical className="w-3 h-3 rotate-90" />
                                                            </button>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-start justify-between">
                                                                <div>
                                                                    <p className="text-sm font-medium text-white truncate">
                                                                        {program.name}
                                                                    </p>
                                                                    <p className="text-xs text-slate-500 truncate">
                                                                        {program.university}
                                                                    </p>
                                                                </div>
                                                                <button
                                                                    onClick={() => setViewingDetail(program)}
                                                                    className="p-2 text-orange-400 hover:text-orange-300 bg-orange-500/10 hover:bg-orange-500/20 rounded-lg transition-all flex-shrink-0"
                                                                    title="View Details"
                                                                >
                                                                    <Info className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleRemoveProgram(program.id)}
                                                                    className="p-1 text-slate-600 hover:text-rose-400 transition-colors flex-shrink-0"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                            {/* Gap Analysis Bar */}
                                                            <div className="mt-2">
                                                                <div className="flex items-center justify-between text-[10px] mb-1">
                                                                    <span className="text-slate-500">目標: {program.median}分</span>
                                                                    <span className={`font-medium ${isReachable ? 'text-emerald-400' : isStretch ? 'text-amber-400' : 'text-rose-400'}`}>
                                                                        {isReachable ? '✓ 穩陣' : `差 ${gap} 分`}
                                                                    </span>
                                                                </div>
                                                                <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                                                    <div
                                                                        className={`h-full rounded-full transition-all ${isReachable ? 'bg-emerald-400' : isStretch ? 'bg-amber-400' : 'bg-rose-400'}`}
                                                                        style={{ width: `${Math.min(100, (estimatedBest5 / program.median) * 100)}%` }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {dreamPrograms.length > 0 && (
                                    <div className="p-4 bg-gradient-to-br from-orange-500/10 to-amber-500/10 rounded-xl border border-orange-500/20">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Target className="w-4 h-4 text-orange-400" />
                                            <span className="text-xs font-bold text-orange-100/80 uppercase tracking-widest">預計 Best 5</span>
                                        </div>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-4xl font-black text-white">{estimatedBest5}</span>
                                                <span className="text-sm text-slate-400">分</span>
                                            </div>
                                            <div className="flex bg-slate-800 p-0.5 rounded-lg border border-slate-700">
                                                <button
                                                    onClick={() => setScoringScale('standard')}
                                                    className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${scoringScale === 'standard' ? 'bg-orange-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                                >
                                                    標準 (1-7)
                                                </button>
                                                <button
                                                    onClick={() => setScoringScale('bonus')}
                                                    className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${scoringScale === 'bonus' ? 'bg-orange-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                                >
                                                    加分 (8.5)
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-orange-400/80 mt-1 flex items-center gap-1">
                                            <Info className="w-3 h-3" />
                                            {scoringScale === 'bonus'
                                                ? "正在使用大學加分機制 (5**=8.5, 5*=7, 5=5.5)"
                                                : "正在使用標準計分機制 (1-7)"}
                                        </p>
                                        <p className="text-[10px] text-orange-400/60 mt-1 flex items-center gap-1">
                                            <TrendingUp className="w-3 h-3" />
                                            基於英文 + 數學數據，加埋你自報嘅其他科目
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-6 flex justify-between items-center pt-4 border-t border-slate-800/50">
                            <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                <Info className="w-3 h-3" />
                                <span>數據來源：各大學官方 JUPAS 頁面（2024/25 學年）</span>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-medium transition-all"
                                >
                                    取消
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="px-6 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-lg text-sm font-bold transition-all disabled:opacity-50"
                                >
                                    {saving ? '儲存中...' : '儲存'}
                                </button>
                            </div>
                        </div>

                        <Dialog.Close asChild>
                            <button
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-200 transition-colors rounded-full p-1 hover:bg-white/5 outline-none"
                                aria-label="Close"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </Dialog.Close>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>

            {/* Program Detail Sub-Modal */}
            <Dialog.Root open={!!viewingDetail} onOpenChange={(open) => !open && setViewingDetail(null)}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm animate-in fade-in duration-300" />
                    <Dialog.Content className="fixed left-[50%] top-[50%] z-[70] w-[95vw] max-w-2xl translate-x-[-50%] translate-y-[-50%] outline-none animate-in fade-in zoom-in-95 duration-200">
                        <div className="bg-slate-900 border border-slate-800 text-slate-100 shadow-2xl p-8 rounded-3xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 bg-orange-500/20 rounded-2xl">
                                    <Sparkles className="w-6 h-6 text-orange-400" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 text-xs text-orange-400 font-bold uppercase tracking-widest mb-1">
                                        <span>Dream Subject Insight</span>
                                        <span className="px-1.5 py-0.5 bg-orange-500/10 rounded text-[10px]">{viewingDetail?.code}</span>
                                    </div>
                                    <Dialog.Title className="text-2xl font-bold text-white">
                                        {viewingDetail?.university} {viewingDetail?.name}
                                    </Dialog.Title>
                                </div>
                            </div>

                            {(() => {
                                const programDetails = viewingDetail ? JUPAS_PROGRAM_DETAILS[viewingDetail.code] : null;
                                const currentLang = language === 'en' ? 'en' : 'zh';
                                const details = programDetails?.content?.[currentLang];

                                if (!details || !details.sections) {
                                    return (
                                        <div className="py-12 text-center space-y-4">
                                            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto">
                                                <TrendingUp className="w-8 h-8 text-slate-600" />
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-bold text-slate-300">
                                                    {currentLang === 'en' ? 'Data Collecting...' : '數據收集中...'}
                                                </h4>
                                                <p className="text-sm text-slate-500 max-w-xs mx-auto">
                                                    {currentLang === 'en'
                                                        ? "Ace Sir is compiling detailed insights for this program. Stay tuned!"
                                                        : "Ace Sir 正在整理此學科的詳細資訊，請留意稍後更新！"}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                }

                                return (
                                    <div className="space-y-8 pb-4">
                                        {Object.entries(details.sections || {}).map(([key, section]) => (
                                            <div key={key} className={`p-6 rounded-2xl border transition-all ${key === 'tips' ? 'bg-orange-500/5 border-orange-500/20 shadow-lg shadow-orange-500/5' : 'bg-slate-800/30 border-slate-700/50'}`}>
                                                <h4 className={`text-sm font-black uppercase tracking-wider mb-4 flex items-center gap-2 ${key === 'tips' ? 'text-orange-400' : 'text-slate-300'}`}>
                                                    {key === 'admission' && <Target className="w-4 h-4" />}
                                                    {key === 'structure' && <GraduationCap className="w-4 h-4" />}
                                                    {key === 'career' && <TrendingUp className="w-4 h-4" />}
                                                    {key === 'tips' && <Sparkles className="w-4 h-4" />}
                                                    {section.title}
                                                </h4>
                                                <div className="space-y-3">
                                                    {section.content.map((line, i) => (
                                                        <p key={i} className={`text-sm leading-relaxed ${key === 'tips' ? 'text-orange-100/90' : 'text-slate-400'}`}>
                                                            {line.startsWith('- ') ? (
                                                                <span className="flex gap-2">
                                                                    <span className="text-orange-500 mt-1.5 flex-shrink-0 bg-orange-500 rounded-full w-1 h-1" />
                                                                    {line.substring(2)}
                                                                </span>
                                                            ) : line}
                                                        </p>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })()}

                            <Dialog.Close asChild>
                                <button className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </Dialog.Close>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </Dialog.Root>
    );
};

export default DreamProgramsModal;
