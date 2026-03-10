import React from 'react';
import { SafeInlineMath, SafeBlockMath } from '../maths/SafeMath';
import 'katex/dist/katex.min.css';
import GeometryRenderer from '../maths/GeometryRenderer';
import { useLanguage } from '../../context/LanguageContext';
import { formatNumbers, sanitizeMath, prepareMathText, splitContentByDelimiters, looksLikeMath } from '../../utils/mathFormattingUtils';

/**
 * Polymorphic Question Card Component
 * Handles MCQ, SHORT_ANSWER, and FILL_IN_BLANK question types
 * Supports LaTeX rendering for Maths questions
 */
const QuestionCard = ({
    question,
    answer,
    onChange,
    disabled = false,
    renderMath = false,
    questionNumber,
    showChallengeBadge = true
}) => {
    const { language } = useLanguage();
    const { id, text, text_zh, type, options, options_zh, level } = question;

    // Select localized content
    const displayText = (language === 'zh' && text_zh) ? text_zh : text;
    const displayOptions = (language === 'zh' && options_zh) ? options_zh : options;

    // Determine border and badge colors based on question type
    const getBorderColor = () => {
        switch (type) {
            case 'mc':
                return 'border-green-400';
            case 'short_answer':
                return 'border-blue-400';
            case 'fill_blank':
                return 'border-amber-400';
            default:
                return 'border-gray-400';
        }
    };

    const getBadgeColor = () => {
        switch (type) {
            case 'mc':
                return 'bg-green-100 text-green-700';
            case 'short_answer':
                return 'bg-blue-100 text-blue-700';
            case 'fill_blank':
                return 'bg-amber-100 text-amber-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const getTypeLabel = () => {
        switch (type) {
            case 'mc':
                return 'Multiple Choice';
            case 'short_answer':
                return 'Short Answer';
            case 'fill_blank':
                return 'Fill in the Blank';
            default:
                return 'Question';
        }
    };

    // Render text with optional LaTeX support
    const renderText = (content, hideVisualDescription = false) => {
        if (!content) return '';

        // Safety: Ensure content is a string
        if (typeof content !== 'string') {
            if (typeof content === 'number') {
                content = String(content);
            } else if (Array.isArray(content)) {
                content = content.join('\n');
            } else {
                console.warn('[QuestionCard] Received non-string content:', content);
                try {
                    content = JSON.stringify(content);
                } catch (e) { content = String(content); }
            }
        }
        if (!renderMath) return content;

        // 1. Extract diagram/table description before stripping
        const diagramMatch = content.match(/\[DIAGRAM REQUIRED:([\s\S]*?)\]/);
        const tableMatch = content.match(/\[TABLE REQUIRED:([\s\S]*?)\]/);
        const description = (diagramMatch ? diagramMatch[1] : (tableMatch ? tableMatch[1] : '')).trim();

        const displaySubtext = content
            .replace(/\[DIAGRAM REQUIRED:[\s\S]*?\]/g, '')
            .replace(/\[TABLE REQUIRED:[\s\S]*?\]/g, '')
            .replace(/(Step\s*\d*\s*:?)\s*\n\s*/gi, '$1 ')
            .trim();

        const cleanText = prepareMathText(displaySubtext);
        const parts = splitContentByDelimiters(cleanText);

        return (
            <div className="math-container space-y-4">
                <div className="text-gray-800 leading-relaxed font-sans text-left">
                    {parts.map((part, idx) => {
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
                                    <SafeBlockMath key={idx} math={finalMath} className="my-2" />
                                );
                            } else {
                                return (
                                    <SafeInlineMath key={idx} math={finalMath} className="mx-0.5" />
                                );
                            }
                        }

                        return (
                            <span key={idx}>
                                {part.split(/(?:\r?\n|(?=\.Step\s*\d+\s*:?))/).map((line, lineIdx, arr) => {
                                    if (!line.trim() && arr.length > 1) {
                                        return <br key={lineIdx} />;
                                    }
                                    const trimmedLine = line.trim().replace(/^\./, '');
                                    if (!trimmedLine) return null;

                                    const isMathLine = looksLikeMath(trimmedLine);

                                    if (isMathLine) {
                                        const mathReadyLine = trimmedLine
                                            .replace(/%/g, '\\%')
                                            .replace(/___HKD___/g, '\\text{HK}\\$')
                                            .replace(/___USD___/g, '\\$');

                                        const labeledMath = sanitizeMath(mathReadyLine);
                                        const finalMath = formatNumbers(labeledMath, true);

                                        return (
                                            <SafeInlineMath key={lineIdx} math={finalMath} className="mx-1" />
                                        );
                                    } else {
                                        const formattedLine = formatNumbers(trimmedLine);
                                        const html = formattedLine
                                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                            .replace(/\*(.*?)\*/g, '<em>$1</em>')
                                            .replace(/\\text\{___HKD___\}/g, '___HKD___')
                                            .replace(/\\text\{___USD___\}/g, '___USD___')
                                            .replace(/___HKD___/g, 'HK$')
                                            .replace(/___USD___/g, '$')
                                            .replace(/\\,/g, ' ');

                                        return (
                                            <span
                                                key={lineIdx}
                                                className="whitespace-pre-wrap"
                                                dangerouslySetInnerHTML={{ __html: html }}
                                            />
                                        );
                                    }
                                })}
                            </span>
                        );
                    })}
                </div>

                {description && !hideVisualDescription && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center gap-2 text-center">
                        <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-400">
                            <i className={`fas ${tableMatch ? 'fa-table' : 'fa-chart-area'}`}></i>
                        </div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                            Technical {tableMatch ? 'Data' : 'Figure'} Preview
                        </p>
                        <p className="text-sm text-slate-600 italic font-medium">"{description}"</p>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className={`bg-white p-6 rounded-xl border-2 ${getBorderColor()} shadow-sm`}>
            {/* Header */}
            <div className="flex justify-between mb-3">
                <div className="flex items-center gap-2">
                    {questionNumber && (
                        <span className="text-xs font-bold text-gray-700 uppercase">
                            Question {questionNumber}
                        </span>
                    )}
                    <span className={`text-xs font-medium ${getBadgeColor()} px-2 py-0.5 rounded`}>
                        {getTypeLabel()}
                    </span>
                </div>
                {showChallengeBadge && level === 5 && (
                    <span className="text-xs font-bold text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
                        Challenge
                    </span>
                )}
            </div>

            {/* Question Text */}
            <div className="text-gray-900 mb-4 text-base font-medium leading-relaxed">
                {renderText(displayText, !!(question.diagram_json || question.diagram_svg))}
            </div>

            {/* Diagram Placeholder or SVG Figure */}
            {question.diagram_json ? (
                <div className="mb-6 flex justify-center transform scale-95 origin-top">
                    {/* Lazy load renderer to avoid cycle if possible, or just import at top */}
                    {/* Assuming GeometryRenderer is imported at top */}
                    <div className="bg-white p-2 rounded-xl border-2 border-slate-100 shadow-sm">
                        <GeometryRenderer data={question.diagram_json} />
                    </div>
                </div>
            ) : question.diagram_svg ? (
                <div
                    className="mb-6 p-4 bg-white border-2 border-slate-100 rounded-xl flex items-center justify-center overflow-x-auto"
                    dangerouslySetInnerHTML={{ __html: question.diagram_svg }}
                />
            ) : (question.imageURL === null && (displayText.includes('[DIAGRAM') || displayText.includes('[TABLE'))) && (
                <div className="mb-6 p-8 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-400">
                    <svg className="w-12 h-12 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm font-bold uppercase tracking-tight">Refer to scenario description</p>
                    <p className="text-xs">Visual illustration described in text above</p>
                </div>
            )}

            {/* Answer Input */}
            {type === 'mc' && displayOptions ? (
                // Multiple Choice - Radio buttons
                <div className="space-y-2">
                    {displayOptions.map((opt, optIdx) => {
                        const cleanOpt = typeof opt === 'string' ? opt.replace(/^[A-D]\s*[:.]\s*/i, '').trim() : opt;
                        return (
                            <label
                                key={optIdx}
                                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                            >
                                <input
                                    type="radio"
                                    name={id}
                                    value={opt}
                                    disabled={disabled}
                                    checked={answer === opt}
                                    onChange={(e) => onChange(id, e.target.value)}
                                    className="w-4 h-4 text-green-600 focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                                />
                                <span className="text-gray-800">{renderText(cleanOpt)}</span>
                            </label>
                        );
                    })}
                </div>
            ) : (
                // Short Answer / Fill in Blank - Textarea
                <textarea
                    className="w-full bg-gray-50 border-2 border-gray-300 rounded-lg p-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors disabled:opacity-50"
                    rows={type === 'fill_blank' ? 2 : 4}
                    disabled={disabled}
                    placeholder={type === 'fill_blank' ? 'Fill in the blank...' : 'Type your answer here...'}
                    value={answer || ''}
                    onChange={(e) => onChange(id, e.target.value)}
                />
            )}
        </div>
    );
};

export default QuestionCard;
