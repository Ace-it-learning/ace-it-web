import React, { useState } from 'react';
import { Search, Plus, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { PROGRAM_CATEGORIES, UNIVERSITY_SHORT_NAMES, UNIVERSITY_NAMES_ZH } from '../../constants/jupasPrograms';
import ProgrammeDetailView from './ProgrammeDetailView';

const ProgrammeSearchPanel = ({
    programmes,
    dreamPrograms,
    onAddProgram,
    onViewDetail,
    detailState,
    language,
    t,
    programsLoading
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedUniversity, setSelectedUniversity] = useState('all');
    const [expandedProgram, setExpandedProgram] = useState(null);

    // Derive unique universities from programmes
    const universities = [...new Set(programmes.map(p => p.university).filter(Boolean))].sort();

    const filteredPrograms = programmes.filter(p => {
        if (dreamPrograms.some(dp => dp.id === p.id)) return false;
        if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
        if (selectedUniversity !== 'all' && p.university !== selectedUniversity) return false;
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        return (
            p.name?.toLowerCase().includes(query) ||
            p.university?.toLowerCase().includes(query) ||
            p.code?.toLowerCase().includes(query) ||
            p.faculty?.toLowerCase().includes(query) ||
            (UNIVERSITY_SHORT_NAMES[p.university] || '').toLowerCase().includes(query)
        );
    });

    const handleToggleDetail = (program) => {
        if (expandedProgram === program.id) {
            setExpandedProgram(null);
        } else {
            setExpandedProgram(program.id);
            onViewDetail(program);
        }
    };

    return (
        <div className="space-y-5">
            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.searchPlaceholder}
                    className="w-full pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all shadow-sm"
                />
            </div>

            {/* University Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                <button
                    onClick={() => setSelectedUniversity('all')}
                    className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all ${
                        selectedUniversity === 'all'
                            ? 'bg-slate-800 text-white shadow-md shadow-slate-200'
                            : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-400 hover:text-slate-800'
                    }`}
                >
                    {t.allUniversities}
                </button>
                {universities.map(uni => (
                    <button
                        key={uni}
                        onClick={() => setSelectedUniversity(uni)}
                        className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all ${
                            selectedUniversity === uni
                                ? 'bg-slate-800 text-white shadow-md shadow-slate-200'
                                : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-400 hover:text-slate-800'
                        }`}
                    >
                        {language === 'zh' ? (UNIVERSITY_NAMES_ZH[uni] || uni) : (UNIVERSITY_SHORT_NAMES[uni] || uni)}
                    </button>
                ))}
            </div>

            {/* Category Chips */}
            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all ${
                        selectedCategory === 'all'
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                            : 'bg-white text-slate-500 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                    }`}
                >
                    {t.allCategories}
                </button>
                {Object.entries(PROGRAM_CATEGORIES).map(([key, label]) => (
                    <button
                        key={key}
                        onClick={() => setSelectedCategory(key)}
                        className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all ${
                            selectedCategory === key
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                                : 'bg-white text-slate-500 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                        }`}
                    >
                        {language === 'zh' ? label : key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' ')}
                    </button>
                ))}
            </div>

            {/* Programme List */}
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {programsLoading && (
                    <div className="p-10 text-center">
                        <div className="animate-pulse space-y-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-20 bg-slate-100 rounded-2xl" />
                            ))}
                        </div>
                    </div>
                )}

                {!programsLoading && filteredPrograms.length === 0 && (
                    <div className="p-10 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white">
                        <p className="text-base text-slate-400 font-medium">{t.emptySearch}</p>
                        <button
                            onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                            className="text-sm text-indigo-600 hover:text-indigo-700 font-black uppercase tracking-wider mt-2"
                        >
                            {t.clearFilters}
                        </button>
                    </div>
                )}

                {filteredPrograms.map(program => {
                    const isExpanded = expandedProgram === program.id;
                    const detailData = detailState[program.code];
                    const isDetailLoading = detailData === 'loading';

                    return (
                        <div
                            key={program.id}
                            className={`bg-white border rounded-2xl p-5 transition-all shadow-sm ${
                                isExpanded
                                    ? 'border-indigo-300 shadow-md shadow-indigo-100'
                                    : 'border-slate-200 hover:border-indigo-300 hover:shadow-md'
                            }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-black text-slate-900 leading-tight">
                                        {(language === 'zh' ? program.nameZh : program.nameEn) || program.name || program.nameEn || program.code}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <span className="text-sm font-bold text-slate-500">
                                            {UNIVERSITY_SHORT_NAMES[program.university] || program.university}
                                        </span>
                                        <span className="text-xs px-2 py-0.5 bg-slate-100 rounded-md text-slate-500 font-black uppercase tracking-wider">
                                            {program.code}
                                        </span>
                                        {program.median && (
                                            <span className="text-xs px-2 py-0.5 bg-indigo-50 rounded-md text-indigo-600 font-black uppercase tracking-wider">
                                                Median: {program.median}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 ml-3 flex-shrink-0">
                                    {/* Prominent Detail Button */}
                                    <button
                                        onClick={() => handleToggleDetail(program)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                                            isExpanded
                                                ? 'bg-indigo-600 text-white shadow-md'
                                                : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-200'
                                        }`}
                                        title={t.programDetail}
                                    >
                                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <Info className="w-3.5 h-3.5" />}
                                        {isExpanded ? (language === 'zh' ? '收起' : 'Hide') : (language === 'zh' ? '詳情' : 'Details')}
                                    </button>
                                    <button
                                        onClick={() => onAddProgram(program)}
                                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                                        title={t.add}
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Expanded Detail View */}
                            {isExpanded && (
                                <ProgrammeDetailView
                                    details={isDetailLoading ? null : detailData}
                                    language={language}
                                    isLoading={isDetailLoading}
                                />
                            )}
                        </div>
                    );
                })}

                {filteredPrograms.length > 0 && (
                    <p className="text-xs text-center text-slate-400 py-2 font-medium">
                        {language === 'zh' ? `共 ${filteredPrograms.length} 個結果` : `${filteredPrograms.length} results found`}
                    </p>
                )}
            </div>
        </div>
    );
};

export default ProgrammeSearchPanel;
