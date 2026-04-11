import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { MathNode } from './TipTapMathExtension';
import { BookOpen, X, Calculator, Bold, Italic, Type } from 'lucide-react';
import { SafeInlineMath } from './SafeMath';
import 'mathlive';
import 'katex/dist/katex.min.css';
import { isTipTapJSON, convertTipTapToElite, rescueMangledLatex } from '../../utils/mathFormattingUtils';

const COMMON_FORMULAS = [
    { name: 'Quadratic Formula', tex: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}' },
    { name: 'Sine Rule', tex: '\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C}' },
    { name: 'Cosine Rule', tex: 'c^2 = a^2 + b^2 - 2ab \\cos C' },
    { name: 'Area of Triangle', tex: '\\text{Area} = \\frac{1}{2} ab \\sin C' },
    { name: 'Pythagoras', tex: 'a^2 + b^2 = c^2' },
    { name: 'Cylinder Vol', tex: 'V = \\pi r^2 h' },
    { name: 'Sphere Vol', tex: 'V = \\frac{4}{3} \\pi r^3' },
];

const MathInput = ({ value, onChange, insertLatex = null, placeholder = "Type your explanation here. Click the Pi icon to insert math equations...", id = "math-input-area" }) => {
    const [showFormulas, setShowFormulas] = useState(false);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            MathNode,
            Placeholder.configure({
                placeholder: placeholder,
                emptyEditorClass: 'is-editor-empty',
            }),
        ],
        content: '', // Initial content set in useEffect to avoid hydration issues
        onUpdate: ({ editor }) => {
            const json = editor.getJSON();
            let textOutput = '';
            
            const processNode = (node) => {
                if (node.type === 'text') {
                    textOutput += node.text;
                } else if (node.type === 'math') {
                    // Use a placeholder for the backslash to prevent it from being escaped/eaten
                    // by intermediate string handlers if necessary, but here we just ensure
                    // it's a clean string.
                    textOutput += `$${node.attrs.latex}$`;
                } else if (node.type === 'paragraph') {
                    if (node.content) {
                        node.content.forEach(processNode);
                    }
                    textOutput += '\n';
                } else if (node.content) {
                    node.content.forEach(processNode);
                }
            };
            
            if (json.content) {
                json.content.forEach(processNode);
            }
            
            // Explicitly handle common escape sequences that might be mangled
            const finalOutput = textOutput.trim();
            onChange(finalOutput);
        },
    });

    // Helper to parse string content (with $ math $) into TipTap JSON
    const parseValueToContent = (val) => {
        if (!val) return [];
        
        // Split by newlines first to handle paragraphs
        const lines = val.split('\n');
        return lines.map(line => {
            const children = [];
            // Regex to find $...$ or $$...$$ or \[...\] or \(...\)
            // We use a non-capturing group for the delimiters to keep the content clean
            const parts = line.split(/(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\))/g);
            
            parts.forEach(part => {
                if (!part) return;
                
                let mathMatch = part.match(/^\$\$([\s\S]*)\$\$$/) || 
                                part.match(/^\$([\s\S]*)\$/) ||
                                part.match(/^\\\[([\s\S]*)\\\]$/) ||
                                part.match(/^\\\(([\s\S]*)\\\)$/);
                
                if (mathMatch) {
                    // CRITICAL: Preserve backslashes by ensuring we don't treat them as escape chars
                    // and apply the rescue logic for eaten backslashes.
                    const latex = rescueMangledLatex(mathMatch[1]);
                    children.push({
                        type: 'math',
                        attrs: { latex: latex }
                    });
                } else {
                    children.push({
                        type: 'text',
                        text: part
                    });
                }
            });

            return {
                type: 'paragraph',
                content: children.length > 0 ? children : undefined
            };
        });
    };

    // Initial content sync & handle external updates (e.g. Cheat button)
    useEffect(() => {
        if (!editor) return;

        // Simple check to avoid feedback loops: compare trimmed strings
        const currentJSON = editor.getJSON();
        let currentText = '';
        const flatten = (node) => {
            if (node.type === 'text') currentText += node.text;
            else if (node.type === 'math') {
                // When comparing, we must also apply rescue to current editor content
                // if it hasn't been rescued yet, but here we assume nodes are clean.
                currentText += `$${node.attrs.latex}$`;
            }
            else if (node.content) node.content.forEach(flatten);
            if (node.type === 'paragraph') currentText += '\n';
        };
        currentJSON.content?.forEach(flatten);

        if (value !== undefined && value.trim() !== currentText.trim()) {
            const newContent = parseValueToContent(value);
            editor.commands.setContent(newContent);
        }
    }, [editor, value]);

    const insertMath = (latex = '') => {
        if (editor) {
            editor.chain().focus().insertMath(latex).run();
        }
    };

    // Insert scaffold LaTeX from hint engine when parent triggers it
    useEffect(() => {
        if (insertLatex && editor) {
            // Split by \\newline to handle vertical scaffolds
            const parts = insertLatex.split(/\\newline|\\\\newline/);
            if (parts.length > 1) {
                const contentToInsert = [];
                parts.forEach((part, index) => {
                    const cleanPart = part.trim();
                    if (!cleanPart) return;
                    
                    contentToInsert.push({
                        type: 'math',
                        attrs: { latex: cleanPart }
                    });
                    
                    // Add a paragraph gap except after the last item
                    if (index < parts.length - 1) {
                        contentToInsert.push({ type: 'paragraph' });
                    }
                });
                editor.chain().focus().insertContent(contentToInsert).run();
            } else {
                // Standard single line insertion
                editor.chain().focus().insertMath(insertLatex).run();
            }
        }
    }, [insertLatex]);

    if (!editor) {
        return null;
    }

    return (
        <div className="flex flex-col gap-0 bg-white rounded-2xl relative border border-slate-200 shadow-xl overflow-hidden min-h-[450px]">
            {/* Header / Toolbar */}
            <div className="flex items-center justify-between p-3 bg-slate-50 border-b border-slate-100 flex-wrap gap-2">
                <div className="flex items-center gap-1 p-1 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <button
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        disabled={!editor.can().chain().focus().toggleBold().run()}
                        className={`p-2 rounded-lg transition-all ${editor.isActive('bold') ? 'bg-purple-100 text-purple-600' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
                        title="Bold"
                    >
                        <Bold className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        disabled={!editor.can().chain().focus().toggleItalic().run()}
                        className={`p-2 rounded-lg transition-all ${editor.isActive('italic') ? 'bg-purple-100 text-purple-600' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
                        title="Italic"
                    >
                        <Italic className="w-4 h-4" />
                    </button>
                    <div className="w-px h-4 bg-slate-200 mx-1" />
                    <button
                        onClick={() => insertMath()}
                        className="p-2 rounded-lg bg-purple-600 text-white shadow-md shadow-purple-200 hover:bg-purple-700 transition-all flex items-center gap-1"
                        title="Insert Equation"
                    >
                        <Calculator className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Equation</span>
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    {/* Formula Sheet Toggle */}
                    <button
                        onClick={() => setShowFormulas(!showFormulas)}
                        className={`px-4 py-2 rounded-xl flex items-center gap-2 text-[10px] font-black tracking-widest transition-all shadow-sm ${showFormulas ? 'bg-purple-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:border-purple-300 hover:bg-purple-50'
                            }`}
                    >
                        <BookOpen className="w-4 h-4" />
                        <span className="uppercase">Formula Library</span>
                    </button>
                </div>
            </div>

            {/* Formula Panel (Overlay) */}
            {showFormulas && (
                <div className="absolute top-16 right-4 z-20 w-80 bg-white border border-slate-200 shadow-2xl rounded-2xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Formula</span>
                        <button onClick={() => setShowFormulas(false)} className="text-slate-300 hover:text-slate-500 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="p-3 max-h-80 overflow-y-auto grid gap-2 scrollbar-hide">
                        {COMMON_FORMULAS.map((f, i) => (
                            <button
                                key={i}
                                onClick={() => {
                                    insertMath(f.tex);
                                    setShowFormulas(false);
                                }}
                                className="text-left p-3 hover:bg-purple-50 rounded-xl border border-transparent hover:border-purple-100 transition-all group"
                            >
                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter group-hover:text-purple-600 mb-1">{f.name}</div>
                                <div className="text-sm">
                                    <SafeInlineMath math={f.tex} />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* TipTap Editor Area */}
            <div className="flex-1 p-8 bg-white overflow-y-auto">
                <EditorContent 
                    editor={editor} 
                    className="prose prose-slate max-w-none min-h-[350px] outline-none text-slate-800 text-lg"
                />
            </div>

            {/* Footer Style Toggles / Hints */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-[9px] font-black text-slate-400 uppercase tracking-widest">
                <div className="flex items-center gap-6">
                    <span className="flex items-center gap-1.5">
                        <Type className="w-3 h-3 text-purple-400" />
                        Mixed Content Mode
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Calculator className="w-3 h-3 text-purple-400" />
                        Inline Math Nodes
                    </span>
                </div>
                <span className="flex items-center gap-1 opacity-60">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    AI-Ready Input
                </span>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .ProseMirror p.is-editor-empty:first-child::before {
                    content: attr(data-placeholder);
                    float: left;
                    color: #cbd5e1;
                    pointer-events: none;
                    height: 0;
                }
                .ProseMirror {
                    min-height: 350px;
                    outline: none !important;
                }
                .ProseMirror p {
                    margin-bottom: 0.5em;
                    line-height: 1.6;
                }
            `}} />
        </div>
    );
};

export default MathInput;
