import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { ChevronLeft, CheckCircle, ArrowRight, Lightbulb, Target, BookOpen, AlertTriangle, Layers } from 'lucide-react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import MathsConcepts from '../data/MathsConcepts';

const MathsLearningPage = () => {
    const { topicId } = useParams();
    const navigate = useNavigate();
    const { language } = useLanguage(); // 'en' or 'zh'
    const langKey = language === 'zh-HK' ? 'zh' : 'en';

    const [conceptData, setConceptData] = useState(null);
    const [activeStep, setActiveStep] = useState(0);
    const [revealedExampleSteps, setRevealedExampleSteps] = useState([]);

    useEffect(() => {
        // Fallback to English if exact locale not found, or use the mapping
        const data = MathsConcepts[topicId]?.[langKey] || MathsConcepts[topicId]?.['en'];
        if (data) {
            setConceptData(data);
        } else {
            console.error(`Topic ${topicId} not found`);
        }
    }, [topicId, langKey]);

    if (!conceptData) {
        return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
    }

    const handleRevealStep = (index) => {
        if (!revealedExampleSteps.includes(index)) {
            setRevealedExampleSteps([...revealedExampleSteps, index]);
        }
    };

    const renderTex = (text) => {
        if (!text) return null;
        const parts = text.split(/(\$\$[\s\S]*?\$\$)/g);
        return parts.map((part, i) => {
            if (part.startsWith('$$') && part.endsWith('$$')) {
                return <BlockMath key={i} math={part.slice(2, -2)} />;
            }
            return <span key={i}>{part}</span>;
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
            {/* 1. Hero Header */}
            <header className="fixed top-0 inset-x-0 h-20 bg-white/90 backdrop-blur-md shadow-sm z-50 px-6 flex items-center justify-between transition-all">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                        <ChevronLeft className="w-6 h-6 text-slate-600" />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-slate-800 tracking-tight">{conceptData.title}</h1>
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                            <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded">{conceptData.difficulty}</span>
                            <span>•</span>
                            <span>{conceptData.time_estimate}</span>
                        </div>
                    </div>
                </div>
                <div className="hidden md:block w-1/3 bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full w-1/3 rounded-full"></div>
                    {/* Placeholder progress */}
                </div>
            </header>

            <main className="pt-28 pb-32 max-w-4xl mx-auto px-6 space-y-16">

                {/* 2. Concept Cards (Carousel-ish) */}
                <section>
                    <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <BookOpen className="w-4 h-4" /> Core Concepts
                    </h2>
                    <div className="flex gap-4 overflow-x-auto pb-4 snap-x pr-4">
                        {conceptData.concepts.map((card, idx) => (
                            <div key={idx} className="min-w-[280px] md:min-w-[320px] bg-white p-6 rounded-3xl shadow-lg border border-slate-100 snap-center flex flex-col justify-between">
                                <div>
                                    <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4 text-indigo-600">
                                        {card.type === 'formula' ? <Layers className="w-5 h-5" /> : card.icon === 'target' ? <Target className="w-5 h-5" /> : <Lightbulb className="w-5 h-5" />}
                                    </div>
                                    <h3 className="font-bold text-lg mb-2">{card.title}</h3>
                                    <div className={`text-slate-600 leading-relaxed ${card.type === 'formula' ? 'text-center py-4 bg-slate-50 rounded-xl my-2' : ''}`}>
                                        {renderTex(card.content)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 3. Methodology Stepper */}
                <section className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-indigo-600 p-8 text-white">
                        <h2 className="text-2xl font-black mb-2">How to Solve It</h2>
                        <p className="text-indigo-200">Follow these steps for every problem.</p>
                    </div>
                    <div className="p-0">
                        {conceptData.steps.map((step, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveStep(idx)}
                                className={`w-full text-left p-6 flex items-start gap-6 transition-all border-b border-slate-100 hover:bg-slate-50 ${activeStep === idx ? 'bg-indigo-50/50' : ''}`}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-colors ${activeStep === idx ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-200 text-slate-500'}`}>
                                    {idx + 1}
                                </div>
                                <div>
                                    <h3 className={`font-bold text-lg mb-1 ${activeStep === idx ? 'text-indigo-900' : 'text-slate-700'}`}>{step.title}</h3>
                                    <p className="text-slate-500 leading-relaxed max-w-xl">
                                        {renderTex(step.description)}
                                    </p>
                                </div>
                                {activeStep === idx && <div className="ml-auto self-center"><ArrowRight className="w-5 h-5 text-indigo-400" /></div>}
                            </button>
                        ))}
                    </div>
                </section>

                {/* 4. Interactive Example */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Question Side */}
                    <div className="space-y-6">
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 sticky top-24">
                            <span className="bg-amber-100 text-amber-700 font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider mb-4 inline-block">Worked Example</span>
                            <h3 className="text-xl font-bold mb-4">{renderTex(conceptData.example.question)}</h3>
                            {conceptData.example.imageURL && (
                                <img src={conceptData.example.imageURL} alt="Example Diagram" className="w-full rounded-xl border border-slate-100 mb-4" />
                            )}
                            <div className="text-sm text-slate-400 italic">Try to solve it yourself before revealing the steps!</div>
                        </div>
                    </div>

                    {/* Steps Side */}
                    <div className="space-y-4">
                        {conceptData.example.steps.map((stepText, idx) => (
                            <div key={idx} className="relative">
                                {!revealedExampleSteps.includes(idx) ? (
                                    <button
                                        onClick={() => handleRevealStep(idx)}
                                        className="w-full h-24 rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center gap-2 text-slate-400 font-bold hover:bg-white hover:border-indigo-300 hover:text-indigo-500 transition-all"
                                    >
                                        <Layers className="w-5 h-5" /> Reveal Step {idx + 1}
                                    </button>
                                ) : (
                                    <div className="bg-white p-6 rounded-2xl shadow-md border-l-4 border-indigo-500 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-xs font-black text-indigo-400 uppercase">Step {idx + 1}</span>
                                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                                        </div>
                                        <div className="text-slate-700 font-medium">
                                            {renderTex(stepText)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* 5. Exam Hacks / Pitfalls */}
                {conceptData.pitfalls && (
                    <section className="bg-red-50 p-6 rounded-3xl border border-red-100">
                        <h2 className="text-red-800 font-bold mb-4 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" /> Common Pitfalls
                        </h2>
                        <ul className="space-y-3">
                            {conceptData.pitfalls.map((pitfall, idx) => (
                                <li key={idx} className="flex gap-3 text-red-700/80">
                                    <span>•</span>
                                    <span>{renderTex(pitfall)}</span>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

            </main>

            {/* 6. Sticky CTA */}
            <div className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 p-4 md:p-6 z-50">
                <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
                    <div className="hidden md:block">
                        <p className="font-bold text-slate-700">Ready to practice?</p>
                        <p className="text-xs text-slate-400">Put your knowledge to the test.</p>
                    </div>
                    <button
                        onClick={() => navigate('/maths-lab', { state: { topic: topicId } })}
                        className="flex-1 md:flex-none md:w-64 bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-black text-lg shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 animate-pulse"
                    >
                        Start Quest <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MathsLearningPage;
