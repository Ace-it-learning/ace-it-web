import React, { useState } from 'react';
import 'katex/dist/katex.min.css';
import { SafeInlineMath, SafeBlockMath } from './SafeMath';
import { BookOpen, X } from 'lucide-react';
import { formatNumbers, sanitizeMath, prepareMathText, splitContentByDelimiters, looksLikeMath } from '../../utils/mathFormattingUtils';

const SYMBOL_CATEGORIES = {
    essentials: {
        label: 'Essential',
        symbols: [
            { label: '\\frac{a}{b}', insert: '\\frac{}{}', description: 'Fraction' },
            { label: '\\sqrt{x}', insert: '\\sqrt{}', description: 'Square root' },
            { label: 'x^2', insert: '^2', description: 'Square' },
            { label: 'x^n', insert: '^{}', description: 'Power' },
            { label: '\\pm', insert: '\\pm', description: 'Plus-minus' },
            { label: '\\approx', insert: '\\approx', description: 'Approximately equal' },
            { label: '\\neq', insert: '\\neq', description: 'Not equal' },
            { label: '\\cdot', insert: '\\cdot', description: 'Multiplication dot' },
            { label: 'x^\\circ', insert: '^\\circ', description: 'Degree' },
        ]
    },
    geometry: {
        label: 'Geometry',
        symbols: [
            { label: '\\triangle', insert: '\\triangle', description: 'Triangle' },
            { label: '\\angle', insert: '\\angle', description: 'Angle' },
            { label: '\\therefore', insert: '\\therefore', description: 'Therefore' },
            { label: '\\because', insert: '\\because', description: 'Because' },
            { label: '\\sim', insert: '\\sim', description: 'Similar to' },
            { label: '\\cong', insert: '\\cong', description: 'Congruent to' },
            { label: '\\parallel', insert: '\\parallel', description: 'Parallel' },
            { label: '\\perp', insert: '\\perp', description: 'Perpendicular' },
        ]
    },
    advanced: {
        label: 'Advanced',
        symbols: [
            { label: '\\propto', insert: '\\propto', description: 'Varies as (Proportional)' },
            { label: '\\equiv', insert: '\\equiv', description: 'Identically equal to' },
            { label: '\\infty', insert: '\\infty', description: 'Infinity' },
            { label: '\\pi', insert: '\\pi', description: 'Pi' },
            { label: '\\theta', insert: '\\theta', description: 'Theta' },
            { label: '\\alpha', insert: '\\alpha', description: 'Alpha' },
            { label: '\\beta', insert: '\\beta', description: 'Beta' },
            { label: '\\gamma', insert: '\\gamma', description: 'Gamma' },
            { label: '\\sigma', insert: '\\sigma', description: 'Sigma' },
        ]
    }
};

const COMMON_FORMULAS = [
    { name: 'Quadratic Formula', tex: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}' },
    { name: 'Sine Rule', tex: '\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C}' },
    { name: 'Cosine Rule', tex: 'c^2 = a^2 + b^2 - 2ab \\cos C' },
    { name: 'Area of Triangle', tex: '\\text{Area} = \\frac{1}{2} ab \\sin C' },
    { name: 'Pythagoras', tex: 'a^2 + b^2 = c^2' },
    { name: 'Cylinder Vol', tex: 'V = \\pi r^2 h' },
    { name: 'Sphere Vol', tex: 'V = \\frac{4}{3} \\pi r^3' },
];

const MathInput = ({ value, onChange, placeholder = "Type your steps here...", id = "math-input-area" }) => {
    const [showFormulas, setShowFormulas] = useState(false);
    const [activeCategory, setActiveCategory] = useState('essentials');

    const insertSymbol = (symbol) => {
        const textarea = document.getElementById(id);
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = value || '';

        // Add a space after the symbol to prevent LaTeX syntax errors if needed
        const symbolWithSpace = symbol + (symbol.endsWith('}') ? '' : ' ');
        const newValue = text.substring(0, start) + symbolWithSpace + text.substring(end);

        onChange(newValue);

        // Position cursor inside braces if it's a \frac or \sqrt
        let cursorOffset = symbolWithSpace.length;
        if (symbol.includes('{}')) {
            cursorOffset = symbol.indexOf('{') + 1;
        }

        const newPos = start + cursorOffset;

        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(newPos, newPos);
        }, 10);
    };

    // PROCESSOR: Convert plain text newlines (\n) to LaTeX line breaks (\\) for the preview
    // Added [1.2em] to give more vertical "breadth" between lines as requested.
    const getProcessedMath = (val) => {
        if (!val) return '';
        // Handle explicit newlines from textarea
        const lines = val.split('\n');
        // Join with LaTeX newline
        return lines.join(' \\\\[1.2em] ');
    };

    return (
        <div className="flex flex-col gap-4 bg-slate-50 rounded-lg relative border border-gray-200 shadow-sm">
            {/* Toolbar */}
            <div className="flex flex-col bg-white rounded-t-lg border-b border-gray-200 shadow-sm">
                <div className="flex items-center justify-between p-2 pb-0">
                    {/* Category Tabs */}
                    <div className="flex gap-1">
                        {Object.entries(SYMBOL_CATEGORIES).map(([id, cat]) => (
                            <button
                                key={id}
                                onClick={() => setActiveCategory(id)}
                                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${activeCategory === id
                                    ? 'border-purple-600 text-purple-600'
                                    : 'border-transparent text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    {/* Formula Sheet Toggle */}
                    <button
                        onClick={() => setShowFormulas(!showFormulas)}
                        className={`px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-bold transition-all shadow-sm ${showFormulas ? 'bg-purple-600 text-white' : 'bg-yellow-50 text-yellow-700 border border-yellow-200 hover:bg-yellow-100'
                            }`}
                    >
                        <BookOpen className="w-4 h-4" />
                        <span className="hidden sm:inline uppercase">Formula Sheet</span>
                    </button>
                </div>

                <div className="flex gap-2 flex-wrap p-3 items-center min-h-[56px]">
                    {/* Math Symbols for active category */}
                    {SYMBOL_CATEGORIES[activeCategory].symbols.map((s, i) => (
                        <button
                            key={i}
                            onClick={() => insertSymbol(s.insert)}
                            title={s.description}
                            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg hover:bg-purple-50 hover:border-purple-200 text-sm transition-all text-slate-700 min-w-[48px] flex items-center justify-center group"
                        >
                            <div className="transform group-active:scale-95 transition-transform">
                                <SafeInlineMath math={s.label} />
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Formula Panel (Overlay) */}
            {showFormulas && (
                <div className="absolute top-14 right-2 z-10 w-80 bg-white border border-gray-200 shadow-xl rounded-xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Reference Formulas</span>
                        <button onClick={() => setShowFormulas(false)} className="text-gray-400 hover:text-gray-600">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="p-2 max-h-60 overflow-y-auto grid gap-1">
                        {COMMON_FORMULAS.map((f, i) => (
                            <button
                                key={i}
                                onClick={() => {
                                    insertSymbol(f.tex);
                                    setShowFormulas(false);
                                }}
                                className="text-left p-2 hover:bg-purple-50 rounded border border-transparent hover:border-purple-100 group"
                            >
                                <div className="text-[10px] text-gray-400 group-hover:text-purple-600 mb-1">{f.name}</div>
                                <div className="text-sm">
                                    <SafeInlineMath math={f.tex} />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex flex-col md:flex-row gap-4 px-4 pb-4">
                {/* Input Area */}
                <div className="basis-1/2 min-w-0 flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Your Work (Scratchpad)</label>
                    <textarea
                        id={id}
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        className="w-full min-h-[300px] p-4 font-mono text-base bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none resize-y shadow-inner leading-relaxed"
                        spellCheck="false"
                    />
                </div>

                <div className="basis-1/2 min-w-0 flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Mathematical Preview</label>
                    <div className="min-h-[300px] p-6 bg-white border border-slate-200 rounded-xl shadow-sm overflow-x-auto text-gray-800 leading-relaxed">
                        {value ? (
                            <div>
                                {value.split('\n').map((line, i) => {
                                    if (!line.trim()) return <br key={i} />;

                                    // Check if line is mixed content (has $ delimiters)
                                    const hasDelimiters = line.includes('$');

                                    if (hasDelimiters || line.includes('\\[') || line.includes('\\(')) {
                                        // Mixed Mode: Split by standard delimiters and render
                                        const cleanLine = prepareMathText(line);
                                        const parts = splitContentByDelimiters(cleanLine);
                                        return (
                                            <div key={i} className="mb-2 flex flex-wrap items-baseline gap-x-1">
                                                {parts.map((part, j) => {
                                                    if (!part) return null;
                                                    const isBlock = (part.startsWith('\\[') && part.endsWith('\\]')) || (part.startsWith('$$') && part.endsWith('$$'));
                                                    const isInline = (part.startsWith('\\(') && part.endsWith('\\)')) || (part.startsWith('$') && part.endsWith('$'));

                                                    if (isBlock || isInline) {
                                                        const math = (part.startsWith('\\[') || part.startsWith('\\(')) ? part.slice(2, -2) : (part.startsWith('$$') ? part.slice(2, -2) : part.slice(1, -1));
                                                        const sanitized = formatNumbers(sanitizeMath(math), true);
                                                        if (isBlock) {
                                                            return <div key={j} className="my-2 w-full"><SafeBlockMath math={sanitized} /></div>;
                                                        }
                                                        return <SafeInlineMath key={j} math={sanitized} />;
                                                    } else {
                                                        return <span key={j}>{formatNumbers(part)}</span>;
                                                    }
                                                })}
                                            </div>
                                        );
                                    } else {
                                        // No explicit delimiters. 
                                        // Version 1.1.4: Use robust splitting for preview
                                        return line.split(/(?:\r?\n|(?=\.Step\s*\d+\s*:?))/).map((subLine, subIdx) => {
                                            const trimmedSub = subLine.trim().replace(/^\./, '');
                                            if (!trimmedSub) return <br key={subIdx} />;

                                            const isMathLine = looksLikeMath(trimmedSub);

                                            if (isMathLine) {
                                                const sanitized = formatNumbers(sanitizeMath(trimmedSub.replace(/%/g, '\\%').replace(/___HKD___/g, '\\text{HK}\\$').replace(/___USD___/g, '\\$')), true);
                                                return (
                                                    <div key={subIdx} className="mb-2">
                                                        <SafeInlineMath math={sanitized} />
                                                    </div>
                                                );
                                            } else {
                                                return <div key={subIdx} className="mb-2 whitespace-pre-wrap">{formatNumbers(trimmedSub).replace(/___HKD___/g, 'HK$').replace(/___USD___/g, '$').replace(/\\,/g, ' ')}</div>;
                                            }
                                        });
                                    }
                                })}
                            </div>
                        ) : (
                            <div className="text-slate-300 italic text-center mt-20 text-sm">
                                Use the Equation Sheet and Toolbar to show your steps clearly!
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MathInput;
