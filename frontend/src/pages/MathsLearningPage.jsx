import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { getDifficultyTierDetails } from '../utils/masteryUtils';
import { ChevronLeft, ChevronDown, ArrowRight, Lightbulb, Target, BookOpen, AlertTriangle, Map, Sparkles, Loader2, CheckCircle, Maximize2, X, Languages } from 'lucide-react';
import { SafeInlineMath, SafeBlockMath } from '../components/maths/SafeMath';
import 'katex/dist/katex.min.css';
import { formatNumbers, sanitizeMath, prepareMathText, splitContentByDelimiters, looksLikeMath } from '../utils/mathFormattingUtils';
import GeometryRenderer from '../components/maths/GeometryRenderer';

const MathsLearningPage = () => {
    const { topicId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { language, toggleLanguage } = useLanguage();
    const isChinese = language === 'zh-HK' || language === 'zh';

    const [loading, setLoading] = useState(true);
    const [content, setContent] = useState(null);
    const [error, setError] = useState(null);
    const [enlargedImage, setEnlargedImage] = useState(null);

    const { taskId, isFactoryQuest } = location.state || {};
    const [selectedLevel, setSelectedLevel] = useState(location.state?.level || 3);
    const [currentXp, setCurrentXp] = useState(location.state?.xp || getDifficultyTierDetails(location.state?.level || 3, isChinese).xp);

    const handleLevelChange = (e) => {
        const newLevel = parseInt(e.target.value);
        setSelectedLevel(newLevel);
        setCurrentXp(getDifficultyTierDetails(newLevel, isChinese).xp);
    };

    useEffect(() => {
        const fetchContent = async () => {
            setLoading(true);
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                const langParam = isChinese ? 'zh' : 'en';
                const res = await fetch(`${API_URL}/api/maths/lab/learning-content/${topicId}?lang=${langParam}`);
                if (!res.ok) throw new Error("Failed to fetch learning content");
                const data = await res.json();
                // AI sometimes wraps responses in an array
                const finalData = Array.isArray(data) ? data[0] : data;
                setContent(finalData);
            } catch (err) {
                console.error("[MathsLearningPage] Error:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (topicId) fetchContent();
    }, [topicId, language]);

    const renderTex = (text) => {
        if (!text) return null;

        // Safety enforcement
        const safeText = typeof text === 'string' ? text : (typeof text === 'number' ? String(text) : (Array.isArray(text) ? text.join('\n') : String(text || '')));

        const cleanText = prepareMathText(safeText);
        const parts = splitContentByDelimiters(cleanText);

        return parts.map((part, i) => {
            if (!part) return null;

            const isBlock = (part.startsWith('\\[') && part.endsWith('\\]')) || (part.startsWith('$$') && part.endsWith('$$'));
            const isInline = (part.startsWith('\\(') && part.endsWith('\\)')) || (part.startsWith('$') && part.endsWith('$'));

            if (isBlock || isInline) {
                let math = '';
                if (part.startsWith('\\[') || part.startsWith('\\(')) math = part.slice(2, -2);
                else if (part.startsWith('$$')) math = part.slice(2, -2);
                else math = part.slice(1, -1);

                math = math
                    .replace(/\n/g, ' ')
                    .replace(/%/g, '\\%')
                    .replace(/___HKD___/g, '\\text{HK}\\$')
                    .replace(/___USD___/g, '\\$');

                const labeledMath = sanitizeMath(math);
                const finalMath = formatNumbers(labeledMath, true);

                if (isBlock) {
                    return (
                        <SafeBlockMath key={i} math={finalMath} className="my-2" />
                    );
                } else {
                    return (
                        <SafeInlineMath key={i} math={finalMath} className="mx-0.5" />
                    );
                }
            }

            return (
                <span key={i}>
                    {part.split(/(?:\r?\n|(?=\.Step\s*\d+\s*:?))/).map((line, lineIdx) => {
                        const trimmedLine = line.trim().replace(/^\./, '');
                        if (!trimmedLine && line.length > 0) return <br key={lineIdx} />;
                        if (!trimmedLine) return null;

                        const isMathLine = looksLikeMath(trimmedLine);
                        const isStepLine = line.trim().startsWith('Step') || line.trim().startsWith('.Step');

                        if (isMathLine) {
                            const mathReadyLine = trimmedLine
                                .replace(/%/g, '\\%')
                                .replace(/___HKD___/g, '\\text{HK}\\$')
                                .replace(/___USD___/g, '\\$');

                            const labeledMath = sanitizeMath(mathReadyLine);
                            const finalMath = formatNumbers(labeledMath, true);

                            return (
                                <React.Fragment key={lineIdx}>
                                    {(lineIdx > 0 || isStepLine) && <br />}
                                    <SafeInlineMath key={lineIdx} math={finalMath} className="mx-1" />
                                </React.Fragment>
                            );
                        } else {
                            const formattedLine = formatNumbers(trimmedLine);
                            const content = formattedLine
                                .replace(/___HKD___/g, 'HK$')
                                .replace(/___USD___/g, '$')
                                .replace(/\\,/g, ' ');

                            return (
                                <React.Fragment key={lineIdx}>
                                    {(lineIdx > 0 || isStepLine) && <br />}
                                    <span className="whitespace-pre-wrap">{content}</span>
                                </React.Fragment>
                            );
                        }
                    })}
                </span>
            );
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Preparing Learning Brief...</h2>
                <p className="text-slate-500">Retrieving latest DSE syllabus requirements</p>
            </div>
        );
    }

    if (error || !content) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
                <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
                <h2 className="text-xl font-bold">Failed to load content</h2>
                <p className="text-slate-500 max-w-sm mt-2">{error || "The AI tutor is temporarily unavailable. Please try again in a moment."}</p>
                <button onClick={() => navigate(-1)} className="mt-6 px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 transition-all hover:bg-indigo-700">
                    Go Back
                </button>
            </div>
        );
    }

    const localized = (isChinese ? content.content_zh : content.content_en) || {};
    const t = (key) => {
        const labels = {
            concept: isChinese ? '核心概念' : 'Core Concept',
            methodology: isChinese ? '解題步驟' : 'Methodology',
            tips: isChinese ? '專家提示' : 'Expert Tips',
            traps: isChinese ? '考試陷阱' : 'DSE Traps',
            roadmap: isChinese ? '進步路線' : 'Mastery Roadmap',
            start: isChinese ? '開始任務' : 'Start Quest',
            formula: isChinese ? '公式' : 'Formula',
            application: isChinese ? '應用' : 'Application',
            variables: isChinese ? '變量說明' : 'Variables',
            takeaway: isChinese ? '關鍵要點' : 'Key Takeaway'
        };
        return labels[key] || key;
    };

    // Modular Rendering Logic
    if (content.is_modular) {
        return (
            <div className="min-h-screen bg-slate-50 text-slate-800 pb-32">
                {/* Header */}
                <header className="fixed top-0 inset-x-0 h-20 bg-white/80 backdrop-blur-md shadow-sm z-50 px-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                            <ChevronLeft className="w-6 h-6 text-slate-600" />
                        </button>
                        <div>
                            <h1 className="text-xl font-black text-slate-900 tracking-tight">{isChinese ? content.name_zh : content.name}</h1>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">Learning Compass • {topicId}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleLanguage}
                            className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 transition-all flex items-center gap-2 group"
                        >
                            <Languages className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] font-black uppercase tracking-widest">{isChinese ? 'EN' : '中文'}</span>
                        </button>

                        <div className="relative flex items-center">
                            <select
                                value={selectedLevel}
                                onChange={handleLevelChange}
                                className={`pl-4 pr-8 py-1 rounded-full text-xs font-black uppercase tracking-tighter ${getDifficultyTierDetails(selectedLevel, isChinese).color} appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all`}
                            >
                                {[1, 2, 3, 4].map(lvl => (
                                    <option key={lvl} value={lvl} className="text-slate-800 bg-white">
                                        {getDifficultyTierDetails(lvl, isChinese).displayName}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-2.5 w-3.5 h-3.5 pointer-events-none opacity-60" />
                        </div>
                    </div>
                </header>

                <main className="pt-28 max-w-4xl mx-auto px-6 space-y-16">
                    {content.learning_modules.map((module) => (
                        <section key={module.module_id} className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
                                <div className="size-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-sm">
                                    {module.module_id}
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                                    {isChinese ? module.title_zh : module.title}
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 gap-8">
                                {module.concepts.map((concept) => (
                                    <div key={concept.concept_id} className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden group hover:border-indigo-200 transition-colors">
                                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
                                            <div className="flex-1 space-y-4">
                                                <div className="flex items-center gap-2">
                                                    <Sparkles className="w-4 h-4 text-indigo-500" />
                                                    <h3 className="text-lg font-black text-slate-800 tracking-tight uppercase">
                                                        {isChinese ? concept.name_zh : concept.name}
                                                    </h3>
                                                </div>

                                                <div className="p-6 bg-slate-900 rounded-2xl text-white shadow-inner overflow-x-auto text-xl font-medium">
                                                    {renderTex(concept.formula)}
                                                </div>

                                                {concept.variables && (
                                                    <div className="bg-slate-50 p-4 rounded-xl space-y-2">
                                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                            {isChinese ? '變量說明' : 'Variables'}
                                                        </h4>
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                            {Object.entries(concept.variables).map(([key, val]) => (
                                                                <div key={key} className="flex flex-col">
                                                                    <span className="text-indigo-600 font-bold">{key}</span>
                                                                    <span className="text-xs text-slate-600">
                                                                        {isChinese && concept.variables_zh && concept.variables_zh[key]
                                                                            ? concept.variables_zh[key]
                                                                            : val}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                                                    <div className="flex items-center gap-2 text-amber-700 mb-1">
                                                        <Lightbulb className="w-4 h-4" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest">{t('takeaway')}</span>
                                                    </div>
                                                    <p className="text-sm font-medium text-amber-900 leading-relaxed">
                                                        {isChinese ? concept.key_takeaway_zh : concept.key_takeaway}
                                                    </p>
                                                </div>
                                            </div>

                                            {(concept.visual_aid_type || concept.visual_aid || concept.diagram_json) && (
                                                <div className="md:w-64 shrink-0 rounded-2xl overflow-hidden border border-slate-100 shadow-sm bg-slate-100 flex flex-col p-4 gap-3">
                                                    {concept.diagram_json ? (
                                                        <div className="bg-white p-2 rounded-xl border border-slate-50 shadow-inner h-48 flex items-center justify-center overflow-hidden">
                                                            <GeometryRenderer data={concept.diagram_json} />
                                                        </div>
                                                    ) : (
                                                        <div className="relative group/img cursor-zoom-in" onClick={() => setEnlargedImage(concept.visual_aid || `/static/assets/${concept.visual_aid_type}.png`)}>
                                                            <img
                                                                src={concept.visual_aid || `/static/assets/${concept.visual_aid_type}.png`}
                                                                alt="Visual Aid"
                                                                className="w-full h-auto rounded-lg transition-transform duration-300 group-hover/img:scale-[1.02]"
                                                                onError={(e) => { e.target.src = 'https://placehold.co/400x300?text=Visual+Aid'; }}
                                                            />
                                                            <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/5 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-all">
                                                                <div className="bg-white/90 p-2 rounded-full shadow-lg">
                                                                    <Maximize2 className="w-4 h-4 text-slate-900" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {!concept.diagram_json && (
                                                        <button
                                                            onClick={() => setEnlargedImage(concept.visual_aid || `/static/assets/${concept.visual_aid_type}.png`)}
                                                            className="w-full py-2 bg-slate-200/50 hover:bg-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"
                                                        >
                                                            <Maximize2 className="w-3 h-3" /> Enlarge Visual
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {module.common_traps && module.common_traps.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {module.common_traps.map((trap, idx) => (
                                        <div key={idx} className="bg-rose-50 p-6 rounded-[2rem] border border-rose-100 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-4 text-rose-200/50 rotate-12">
                                                <AlertTriangle className="w-16 h-16" />
                                            </div>
                                            <div className="relative z-10 space-y-3">
                                                <h3 className="text-sm font-black text-rose-700 uppercase tracking-widest flex items-center gap-2">
                                                    {t('traps')}: {isChinese && trap.trap_zh ? trap.trap_zh : trap.trap}
                                                </h3>
                                                <p className="text-rose-900/80 font-medium">
                                                    {renderTex(isChinese ? trap.description_zh : trap.description)}
                                                </p>
                                                {trap.example && (
                                                    <div className="bg-white/60 p-4 rounded-xl text-sm italic text-rose-800">
                                                        {renderTex(isChinese ? trap.example_zh : trap.example)}
                                                    </div>
                                                )}
                                                {trap.fix && (
                                                    <div className="bg-emerald-500 text-white p-4 rounded-xl text-xs font-bold flex flex-col gap-2 shadow-sm">
                                                        <div className="flex items-center gap-2 opacity-90">
                                                            <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                                                            <span className="uppercase tracking-widest">
                                                                {isChinese ? '改善建議' : 'Correction'}
                                                            </span>
                                                        </div>
                                                        <div className="pl-5.5 leading-relaxed">
                                                            {renderTex(isChinese && trap.fix_zh ? trap.fix_zh : trap.fix)}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    ))}

                    {/* Roadmap */}
                    <section className="bg-slate-900 p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                        <h2 className="text-xs font-black text-indigo-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                            <Map className="w-4 h-4" /> {t('roadmap')}
                        </h2>
                        <p className="text-xl font-medium text-slate-200 leading-relaxed mb-8">
                            {isChinese ? content.roadmap_zh : content.roadmap}
                        </p>
                        <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/10">
                            <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center font-black">
                                {selectedLevel === 4 ? '5**' : selectedLevel === 3 ? '5' : selectedLevel === 2 ? '4' : '3'}
                            </div>
                            <div className="text-sm border-l border-white/20 pl-4">
                                <span className="text-indigo-300 font-bold">Goal:</span> {isChinese ? `掌握 ${getDifficultyTierDetails(selectedLevel, true).displayName} 程度。` : `Master ${getDifficultyTierDetails(selectedLevel, false).displayName} concepts.`}
                            </div>
                        </div>
                    </section>
                </main>

                {/* Sticky Start Button */}
                <div className="fixed bottom-0 inset-x-0 bg-white/90 backdrop-blur-md border-t border-slate-200 p-6 z-50">
                    <div className="max-w-4xl mx-auto flex items-center justify-between gap-6">
                        <div className="hidden md:block">
                            <p className="font-black text-slate-800 text-lg tracking-tight uppercase tracking-tighter">Ready for the challenge?</p>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Applying {isChinese ? content.name_zh : content.name} to exam context</p>
                        </div>
                        <button
                            onClick={() => {
                                const levelMap = { 1: 3, 2: 4, 3: 5, 4: 7 };
                                const mappedLevel = levelMap[selectedLevel] || 3;
                                navigate('/maths-lab', { state: { topic: topicId, level: mappedLevel, taskId, xp: currentXp, isFactoryQuest } });
                            }}
                            className="flex-1 md:flex-none md:w-80 h-16 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xl shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-3 group"
                        >
                            {t('start')} <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
                        </button>
                    </div>
                </div>

                {/* Lightbox / Enlarged Image Modal */}
                {enlargedImage && (
                    <div
                        className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-[100] flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300"
                        onClick={() => setEnlargedImage(null)}
                    >
                        <button
                            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white"
                            onClick={(e) => { e.stopPropagation(); setEnlargedImage(null); }}
                        >
                            <X className="w-8 h-8" />
                        </button>

                        <div
                            className="relative max-w-5xl w-full max-h-[85vh] bg-white rounded-[2.5rem] overflow-hidden shadow-2xl flex items-center justify-center p-4 md:p-8 animate-in zoom-in-95 duration-300"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img
                                src={enlargedImage}
                                alt="Enlarged Visual Aid"
                                className="max-w-full max-h-full object-contain rounded-xl"
                                onError={(e) => { e.target.src = 'https://placehold.co/800x600?text=Visual+Aid'; }}
                            />
                        </div>

                        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/60 text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                            Click anywhere to close
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 pb-32">
            {/* Header */}
            <header className="fixed top-0 inset-x-0 h-20 bg-white/80 backdrop-blur-md shadow-sm z-50 px-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                        <ChevronLeft className="w-6 h-6 text-slate-600" />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 tracking-tight">{isChinese ? content.name_zh : content.name}</h1>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">Learning Compass • {topicId}</p>
                    </div>
                </div>
                <div className="relative flex items-center">
                    <select
                        value={selectedLevel}
                        onChange={handleLevelChange}
                        className={`pl-4 pr-8 py-1 rounded-full text-xs font-black uppercase tracking-tighter ${getDifficultyTierDetails(selectedLevel, isChinese).color} appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all`}
                    >
                        {[1, 2, 3, 4].map(lvl => (
                            <option key={lvl} value={lvl} className="text-slate-800 bg-white">
                                {getDifficultyTierDetails(lvl, isChinese).displayName}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 w-3.5 h-3.5 pointer-events-none opacity-60" />
                </div>
            </header>

            <main className="pt-28 max-w-4xl mx-auto px-6 space-y-10">

                {/* 1. Concept Card */}
                <section className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 text-indigo-50/50 -rotate-12 translate-x-4 -translate-y-4">
                        <BookOpen className="w-32 h-32" />
                    </div>
                    <div className="relative z-10">
                        <h2 className="text-sm font-black text-indigo-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <Sparkles className="w-4 h-4" /> {t('concept')}
                        </h2>
                        <div className="text-lg font-medium leading-relaxed text-slate-700 whitespace-pre-line">
                            {renderTex(localized.concept)}
                        </div>
                    </div>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* 2. Methodology */}
                    <section className="bg-white p-8 rounded-[2rem] shadow-lg border border-slate-100">
                        <h2 className="text-sm font-black text-emerald-600 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Target className="w-4 h-4" /> {t('methodology')}
                        </h2>
                        <div className="space-y-4 text-slate-600 whitespace-pre-line">
                            {renderTex(localized.methodology)}
                        </div>
                    </section>

                    {/* 3. Tips & Traps */}
                    <div className="space-y-8">
                        <section className="bg-amber-50 p-8 rounded-[2rem] border border-amber-100">
                            <h2 className="text-sm font-black text-amber-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Lightbulb className="w-4 h-4" /> {t('tips')}
                            </h2>
                            <div className="text-amber-900/80 font-medium">
                                {renderTex(localized.tips)}
                            </div>
                        </section>

                        <section className="bg-rose-50 p-8 rounded-[2rem] border border-rose-100">
                            <h2 className="text-sm font-black text-rose-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" /> {t('traps')}
                            </h2>
                            <div className="text-rose-900/80 font-medium italic">
                                {renderTex(localized.traps)}
                            </div>
                        </section>
                    </div>
                </div>

                {/* 4. Roadmap */}
                <section className="bg-slate-900 p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <h2 className="text-xs font-black text-indigo-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                        <Map className="w-4 h-4" /> {t('roadmap')}
                    </h2>
                    <p className="text-xl font-medium text-slate-200 leading-relaxed mb-8">
                        {content.roadmap}
                    </p>
                    <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/10">
                        <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center font-black">
                            {selectedLevel === 4 ? '5**' : selectedLevel === 3 ? '5' : selectedLevel === 2 ? '4' : '3'}
                        </div>
                        <div className="text-sm border-l border-white/20 pl-4">
                            <span className="text-indigo-300 font-bold">Goal:</span> Master {selectedLevel === 4 ? 'Elite' : selectedLevel === 3 ? 'DSE Standard' : selectedLevel === 2 ? 'Medium' : 'Easy'} concepts.
                        </div>
                    </div>
                </section>

            </main>

            {/* Sticky Start Button */}
            <div className="fixed bottom-0 inset-x-0 bg-white/90 backdrop-blur-md border-t border-slate-200 p-6 z-50">
                <div className="max-w-4xl mx-auto flex items-center justify-between gap-6">
                    <div className="hidden md:block">
                        <p className="font-black text-slate-800 text-lg tracking-tight uppercase tracking-tighter">Ready for the challenge?</p>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Applying {content.name} to exam context</p>
                    </div>
                    <button
                        onClick={() => {
                            const levelMap = { 1: 3, 2: 4, 3: 5, 4: 7 };
                            const mappedLevel = levelMap[selectedLevel] || 3;
                            navigate('/maths-lab', { state: { topic: topicId, level: mappedLevel, taskId, xp: currentXp, isFactoryQuest } });
                        }}
                        className="flex-1 md:flex-none md:w-80 h-16 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xl shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-3 group"
                    >
                        {t('start')} <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MathsLearningPage;
