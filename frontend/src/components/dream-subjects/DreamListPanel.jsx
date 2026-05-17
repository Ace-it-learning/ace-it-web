import React, { useState } from 'react';
import { Reorder } from 'framer-motion';
import { GraduationCap, GripVertical, Trash2, Info, Sparkles, Target, TrendingUp, ChevronUp, ChevronDown } from 'lucide-react';
import { getUniversityLabel } from '../../constants/jupasPrograms';
import GapAnalysisBar from './GapAnalysisBar';
import ProgrammeDetailView from './ProgrammeDetailView';

const DreamListPanel = ({
    dreamPrograms,
    onReorder,
    onRemoveProgram,
    onViewDetail,
    detailState,
    estimatedBest5,
    scoringScale,
    onToggleScoringScale,
    language,
    t
}) => {
    const [expandedProgram, setExpandedProgram] = useState(null);

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
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-slate-800 flex items-center gap-2 uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    {t.dreamListHeader} ({dreamPrograms.length}/20)
                </h3>
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    {t.dragHint}
                </span>
            </div>

            {/* Empty State */}
            {dreamPrograms.length === 0 && (
                <div className="p-10 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white">
                    <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <GraduationCap className="w-7 h-7 text-slate-300" />
                    </div>
                    <p className="text-base font-black text-slate-500">
                        {language === 'zh' ? '仲未有心儀課程' : 'No programs selected yet'}
                    </p>
                    <p className="text-sm text-slate-400 mt-1 font-medium">
                        {language === 'zh' ? '喺左邊搜尋並加入課程' : 'Search and add programs on the left'}
                    </p>
                </div>
            )}

            {/* Reorderable List */}
            {dreamPrograms.length > 0 && (
                <Reorder.Group
                    axis="y"
                    values={dreamPrograms}
                    onReorder={onReorder}
                    className="space-y-3"
                >
                    {dreamPrograms.map((program, index) => {
                        const isExpanded = expandedProgram === program.id;
                        const detailData = detailState[program.code];
                        const isDetailLoading = detailData === 'loading';

                        return (
                            <Reorder.Item
                                key={program.id}
                                value={program}
                                className={`bg-white border rounded-2xl p-4 group hover:border-indigo-300 hover:shadow-md transition-all cursor-grab active:cursor-grabbing shadow-sm ${
                                    isExpanded ? 'border-indigo-300 shadow-md shadow-indigo-100' : 'border-slate-200'
                                }`}
                            >
                                <div className="flex items-start gap-3">
                                    {/* Drag Handle + Rank */}
                                    <div className="flex flex-col items-center gap-1 pt-1 opacity-40 group-hover:opacity-100 transition-opacity">
                                        <GripVertical className="w-4 h-4 text-slate-400" />
                                        <span className="text-[10px] font-black text-indigo-600">#{index + 1}</span>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between">
                                            <div className="min-w-0 flex-1">
                                                <p className="text-base font-black text-slate-900 truncate">
                                                    {(language === 'zh' ? program.nameZh : program.nameEn) || program.name || program.nameEn || program.code}
                                                </p>
                                                <p className="text-sm text-slate-400 font-medium truncate">
                                                    {getUniversityLabel(program.university, language)}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
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
                                                    onClick={() => onRemoveProgram(program.id)}
                                                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Gap Analysis */}
                                        <GapAnalysisBar
                                            program={program}
                                            estimatedBest5={estimatedBest5}
                                            t={t}
                                            language={language}
                                        />

                                        {/* Expanded Detail View */}
                                        {isExpanded && (
                                            <div className="mt-4">
                                                <ProgrammeDetailView
                                                    details={isDetailLoading ? null : detailData}
                                                    language={language}
                                                    isLoading={isDetailLoading}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Reorder.Item>
                        );
                    })}
                </Reorder.Group>
            )}

            {/* Best 5 Summary Panel */}
            {dreamPrograms.length > 0 && (
                <div className="p-5 bg-indigo-50 border border-indigo-100 rounded-2xl">
                    <div className="flex items-center gap-2 mb-3">
                        <Target className="w-4 h-4 text-indigo-600" />
                        <span className="text-xs font-black text-indigo-900 uppercase tracking-widest">
                            {t.best5Label}
                        </span>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-black text-indigo-900">{estimatedBest5}</span>
                            <span className="text-base text-indigo-400 font-black">
                                {language === 'zh' ? '分' : 'pts'}
                            </span>
                        </div>
                        <div className="flex bg-white p-0.5 rounded-xl border border-indigo-100 shadow-sm">
                            <button
                                onClick={() => onToggleScoringScale('standard')}
                                className={`px-3 py-2 text-xs font-black rounded-lg transition-all uppercase tracking-wider ${
                                    scoringScale === 'standard'
                                        ? 'bg-indigo-600 text-white shadow-md'
                                        : 'text-indigo-400 hover:text-indigo-600'
                                }`}
                            >
                                {language === 'zh' ? '標準 (1-7)' : 'Standard (1-7)'}
                            </button>
                            <button
                                onClick={() => onToggleScoringScale('bonus')}
                                className={`px-3 py-2 text-xs font-black rounded-lg transition-all uppercase tracking-wider ${
                                    scoringScale === 'bonus'
                                        ? 'bg-indigo-600 text-white shadow-md'
                                        : 'text-indigo-400 hover:text-indigo-600'
                                }`}
                            >
                                {language === 'zh' ? '加分 (8.5)' : 'Bonus (8.5)'}
                            </button>
                        </div>
                    </div>
                    <p className="text-xs text-indigo-500 mt-1 flex items-center gap-1 font-medium">
                        <TrendingUp className="w-3 h-3" />
                        {scoringScale === 'bonus' ? t.bonusHint : t.standardHint}
                    </p>
                    <p className="text-xs text-indigo-400 mt-1 flex items-center gap-1 font-medium">
                        <Target className="w-3 h-3" />
                        {t.baselineHint}
                    </p>
                </div>
            )}
        </div>
    );
};

export default DreamListPanel;
