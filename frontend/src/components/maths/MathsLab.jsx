import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { SafeInlineMath, SafeBlockMath } from './SafeMath';
import MathsQuestionCard from './MathsQuestionCard';
import { Lightbulb, BookOpen } from 'lucide-react';
import { formatNumbers, sanitizeMath, prepareMathText, splitContentByDelimiters, looksLikeMath } from '../../utils/mathFormattingUtils';

/**
 * Maths Lab Component
 * Interactive practice session with concept explanations and worked examples
 */
const MathsLab = ({ topic, level, onComplete }) => {
    const { user } = useAuth();
    const [lesson, setLesson] = useState(null);
    const [answers, setAnswers] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Render text with robust LaTeX support
    const renderMathContent = (content) => {
        if (!content) return null;

        const cleanText = prepareMathText(content);
        const parts = splitContentByDelimiters(cleanText);

        return (
            <div className="math-content font-sans">
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

                    // Heuristic for standalone math lines
                    const trimmedLine = part.trim();
                    if (!trimmedLine) return null;

                    // Use the centralized looksLikeMath from mathFormattingUtils
                    const isMathLine = looksLikeMath(trimmedLine);

                    if (isMathLine) {
                        const labeledMath = sanitizeMath(trimmedLine.replace(/%/g, '\\%').replace(/___HKD___/g, '\\text{HK}\\$').replace(/___USD___/g, '\\$'));
                        const finalMath = formatNumbers(labeledMath, true);
                        return (
                            <SafeInlineMath key={idx} math={finalMath} className="mx-1" />
                        );
                    }

                    const formattedLine = formatNumbers(trimmedLine);
                    const html = formattedLine
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\*(.*?)\*/g, '<em>$1</em>')
                        .replace(/___HKD___/g, 'HK$')
                        .replace(/___USD___/g, '$')
                        .replace(/\\,/g, ' ');

                    return (
                        <span
                            key={idx}
                            className="whitespace-pre-wrap"
                            dangerouslySetInnerHTML={{ __html: html }}
                        />
                    );
                })}
            </div>
        );
    };

    useEffect(() => {
        fetchMathsLesson();
    }, [topic, level]);

    const fetchMathsLesson = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const response = await fetch(`${API_URL}/api/maths/lab/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic,
                    level: level || 3,
                    uid: user.uid
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            setLesson(data);
        } catch (error) {
            console.error('Failed to fetch Maths lesson:', error);
            alert('Failed to load Maths Lab. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAnswerChange = (questionId, value) => {
        setAnswers({ ...answers, [questionId]: value });
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

            // Calculate mastery score
            const totalQuestions = lesson.interactive_tasks?.length || 0;
            const correctAnswers = lesson.interactive_tasks?.filter(task => {
                const userAnswer = answers[task.id];
                const correctAnswer = task.correctAnswer || task.answer;
                return userAnswer === correctAnswer;
            }).length || 0;

            const masteryScore = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

            // Submit to backend
            await fetch(`${API_URL}/api/maths/lab/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    uid: user.uid,
                    topic,
                    results: answers,
                    masteryScore,
                    xp: masteryScore >= 70 ? 100 : 50
                })
            });

            if (onComplete) {
                onComplete({ masteryScore, answers });
            }
        } catch (error) {
            console.error('Failed to submit Maths lab:', error);
            alert('Failed to submit. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Matt Sir is preparing your lesson...</p>
                </div>
            </div>
        );
    }

    if (!lesson) {
        return <div className="text-center text-red-600">Failed to load lesson</div>;
    }

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-purple-900 mb-2">
                    {lesson.title || topic}
                </h1>
                <p className="text-gray-600">
                    {parseInt(level) === 0 ? 'Interleaved Practice (Mixed Levels)' : `Level ${level}`} • Guided by Matt Sir
                </p>
            </div>

            {/* Concept Explanation */}
            {lesson.conceptual_explanation && (
                <div className="bg-purple-50 p-6 rounded-xl border-2 border-purple-200">
                    <div className="flex items-center gap-2 mb-3">
                        <Lightbulb className="w-5 h-5 text-purple-600" />
                        <h3 className="text-xl font-bold text-purple-900">Concept</h3>
                    </div>
                    <div className="text-gray-700 leading-relaxed">{renderMathContent(lesson.conceptual_explanation)}</div>
                </div>
            )}

            {/* Key Formulas */}
            {lesson.key_formulas && lesson.key_formulas.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-3">
                        <BookOpen className="w-5 h-5 text-purple-600" />
                        <h3 className="text-xl font-bold text-gray-900">Key Formulas</h3>
                    </div>
                    {lesson.key_formulas.map((formula, i) => (
                        <div key={i} className="bg-white p-4 rounded-lg border-2 border-purple-200">
                            <div className="text-center mb-2">
                                <SafeBlockMath math={formatNumbers(sanitizeMath(typeof formula === 'string' ? formula : (formula.latex || formula.formula)), true)} />
                            </div>
                            {formula.description && (
                                <div className="text-sm text-gray-600 text-center">{renderMathContent(formula.description)}</div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Worked Examples */}
            {lesson.examples && lesson.examples.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900">Worked Examples</h3>
                    {lesson.examples.map((example, i) => (
                        <div key={i} className="bg-gradient-to-br from-blue-50 to-purple-50 p-5 rounded-xl border border-purple-200">
                            <h4 className="font-bold text-purple-900 mb-2">Example {i + 1}</h4>
                            <div className="text-gray-700 mb-3">{renderMathContent(example.text || example.problem)}</div>
                            <div className="bg-white p-4 rounded-lg">
                                <p className="text-sm text-gray-600 font-semibold mb-2">Solution:</p>
                                <div className="text-gray-800 whitespace-pre-line">{renderMathContent(example.solution)}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Practice Questions */}
            {lesson.interactive_tasks && lesson.interactive_tasks.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900">Practice Questions</h3>
                    <p className="text-sm text-gray-600 mb-4">
                        Try these questions to test your understanding. Matt Sir believes in you! 💪
                    </p>
                    {lesson.interactive_tasks.map((task, i) => (
                        <MathsQuestionCard
                            key={task.id}
                            question={task}
                            answer={answers[task.id]}
                            onChange={handleAnswerChange}
                            disabled={isSubmitting}
                            questionNumber={i + 1}
                        />
                    ))}
                </div>
            )}

            {/* Submit Button */}
            <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
                {isSubmitting ? 'Submitting...' : 'Submit Practice'}
            </button>
        </div>
    );
};

export default MathsLab;
