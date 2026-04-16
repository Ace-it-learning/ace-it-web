import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book, Pi, Languages, Copy, Check, ChevronLeft, Sparkles, MessageSquare } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const PromptTipsPage = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [copiedId, setCopiedId] = useState(null);

    const categories = [
        {
            id: 'english',
            title: 'English',
            icon: <Book className="w-6 h-6 text-blue-400" />,
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/20',
            prompts: [
                { id: 'e1', text: "Analyze this essay for grammatical accuracy and cohesion." },
                { id: 'e2', text: "Suggest 5 advanced vocabulary words to replace common ones in this paragraph." },
                { id: 'e3', text: "Explain the tone of this reading passage and provide evidence from the text." },
                { id: 'e4', text: "Help me restructure this sentence to sound more formal for a DSE Writing task." }
            ]
        },
        {
            id: 'maths',
            title: 'Maths',
            icon: <Pi className="w-6 h-6 text-emerald-400" />,
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/20',
            prompts: [
                { id: 'm1', text: "Walk me through the step-by-step logic to solve this geometry problem." },
                { id: 'm2', text: "Provide a practice question similar to this HKDSE quadratic equation past paper." },
                { id: 'm3', text: "Check my logic for this calculus proof and point out any potential errors." },
                { id: 'm4', text: "Explain the concept of standard deviation using a real-world example." }
            ]
        },
        {
            id: 'chinese',
            title: 'Chinese',
            icon: <Languages className="w-6 h-6 text-amber-400" />,
            bg: 'bg-amber-500/10',
            border: 'border-amber-500/20',
            prompts: [
                { id: 'c1', text: "解釋這篇古文的重點及其運用的修辭手法。" },
                { id: 'c2', text: "如何改善這段描寫文的感官描寫，使其更有感染力？" },
                { id: 'c3', text: "提供 3 個關於『毅力』或『夢想』主題的寫作素材和金句。" },
                { id: 'c4', text: "分析這篇議論文的論證結構是否嚴謹。" }
            ]
        }
    ];

    const handleCopy = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);

        // Brief delay for visual feedback, then redirect to chat
        setTimeout(() => {
            navigate('/dashboard');
        }, 800);
    };

    return (
        <div className="min-h-screen bg-[#f8f7f5] dark:bg-[#23170f] pt-10 pb-20 px-6">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-12">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors font-bold uppercase tracking-wider text-xs"
                    >
                        <ChevronLeft className="w-4 h-4" /> Back
                    </button>
                    <div className="text-center flex-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest mb-3">
                            <Sparkles className="w-3 h-3" /> Master the AI
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 font-display italic">Prompt Tips</h1>
                        <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto leading-relaxed">
                            Use these proven prompt structures to get the highest quality feedback from your AI mentors. Click any prompt to copy and start chatting.
                        </p>
                    </div>
                    <div className="w-20" /> {/* Spacer */}
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {categories.map((cat) => (
                        <div key={cat.id} className="space-y-6">
                            {/* Category Header */}
                            <div className="flex items-center gap-4 px-2">
                                <div className={`p-3 rounded-2xl ${cat.bg} border ${cat.border} shadow-sm`}>
                                    {cat.icon}
                                </div>
                                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">{cat.title}</h2>
                            </div>

                            {/* Prompt Cards */}
                            <div className="space-y-4">
                                {cat.prompts.map((prompt) => (
                                    <div
                                        key={prompt.id}
                                        onClick={() => handleCopy(prompt.text, prompt.id)}
                                        className="group relative bg-white dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 p-5 rounded-3xl cursor-pointer hover:border-primary/40 transition-all hover:shadow-xl hover:shadow-primary/5 active:scale-[0.98]"
                                    >
                                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed pr-8">
                                            "{prompt.text}"
                                        </p>

                                        <div className="absolute top-5 right-5">
                                            {copiedId === prompt.id ? (
                                                <Check className="w-4 h-4 text-emerald-500 animate-in zoom-in duration-300" />
                                            ) : (
                                                <Copy className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors" />
                                            )}
                                        </div>

                                        {/* Hover Indicator */}
                                        <div className="mt-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Click to Copy</span>
                                            <MessageSquare className="w-3 h-3 text-primary" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Insight */}
                <div className="mt-20 text-center">
                    <div className="inline-block p-8 bg-white/50 dark:bg-white/5 backdrop-blur-md rounded-[3rem] border border-white dark:border-white/10 max-w-2xl">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">💡 Pro Tip for HKDSE</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                            "The more context you provide (e.g., attaching your essay or specifying the score you're aiming for), the more tailored the tutor's feedback will be. Don't be afraid to ask 'Why?' after they give you an answer."
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PromptTipsPage;
