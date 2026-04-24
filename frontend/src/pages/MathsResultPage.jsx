import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { CheckCircle, XCircle, Award, ArrowRight, RotateCcw, BarChart2 } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { SafeInlineMath, SafeBlockMath } from '../components/maths/SafeMath';
import 'katex/dist/katex.min.css';
import 'katex/dist/katex.min.css';
import { formatNumbers, sanitizeMath, looksLikeMath } from '../utils/mathFormattingUtils';

ChartJS.register(ArcElement, Tooltip, Legend);

const MathsResultPage = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { examId } = useParams();

    if (!state || !state.result) {
        return <div className="p-10 text-center">No result data found. <button onClick={() => navigate('/dashboard')} className="text-indigo-600 underline">Go Home</button></div>;
    }

    const { score, totalMarks, xpEarned, details } = state.result;
    const percentage = Math.round((score / totalMarks) * 100);

    // Prepare Chart Data
    const data = {
        labels: ['Correct', 'Incorrect'],
        datasets: [
            {
                data: [score, totalMarks - score],
                backgroundColor: ['#4F46E5', '#E5E7EB'],
                borderWidth: 0,
            },
        ],
    };

    const options = {
        cutout: '75%',
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
    };

    const renderMath = (text) => {
        if (!text) return null;

        // Safety enforcement
        const safeText = typeof text === 'string' ? text : (typeof text === 'number' ? String(text) : (Array.isArray(text) ? text.join('\n') : String(text || '')));

        return (
            <div className="space-y-1">
                {safeText.split(/(?:\r?\n|(?=\.Step\s*\d+\s*:?))/).map((line, i) => {
                    const trimmedLine = line.trim().replace(/^\./, '');
                    if (!trimmedLine) return null;

                    const isMath = looksLikeMath(trimmedLine);
                    return (
                        <div key={i} className="flex flex-wrap items-baseline gap-1">
                            {isMath ? (
                                <SafeInlineMath math={sanitizeMath(formatNumbers(trimmedLine, true))} />
                            ) : (
                                <span className="text-slate-700">{formatNumbers(trimmedLine)}</span>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4">
            <div className="max-w-2xl mx-auto space-y-8">

                {/* Score Card */}
                <div className="bg-white rounded-3xl shadow-xl p-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>

                    <h1 className="text-2xl font-bold text-slate-800 mb-2">Exam Completed!</h1>
                    <p className="text-slate-500 mb-8">Here is your performance summary for Mock Exam {examId}</p>

                    <div className="relative w-48 h-48 mx-auto mb-8">
                        <Doughnut data={data} options={options} />
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-black text-indigo-600">{percentage}%</span>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Score</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-8">
                        <div className="bg-indigo-50 p-4 rounded-xl">
                            <div className="text-2xl font-bold text-indigo-700">{score}/{totalMarks}</div>
                            <div className="text-xs font-bold text-indigo-400 uppercase">Marks</div>
                        </div>
                        <div className="bg-amber-50 p-4 rounded-xl">
                            <div className="text-2xl font-bold text-amber-600">+{xpEarned}</div>
                            <div className="text-xs font-bold text-amber-400 uppercase">XP Earned</div>
                        </div>
                        <div className="bg-emerald-50 p-4 rounded-xl">
                            <div className="text-2xl font-bold text-emerald-600">
                                {Object.values(details).filter(d => d.isCorrect).length}
                            </div>
                            <div className="text-xs font-bold text-emerald-400 uppercase">Correct</div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                        onClick={() => navigate('/dashboard', { 
                            state: { 
                                openRoadmap: 'MATHS',
                                mockCompleted: true,
                                type: 'Mathematics',
                                level: percentage >= 90 ? '5**' : (percentage >= 85 ? '5*' : (percentage >= 75 ? '5' : (percentage >= 65 ? '4' : (percentage >= 55 ? '3' : '2')))),
                                score: `${percentage}%`
                            } 
                        })}
                            className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                        >
                            <RotateCcw className="w-4 h-4" /> Back to Roadmap
                        </button>
                        <button
                            onClick={() => navigate(`/maths/exam/review/${examId}`, { state: { result: state.result } })}
                            className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
                        >
                            Review Answers <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Quick Breakdown */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                    <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                        <BarChart2 className="w-5 h-5 text-indigo-500" /> Question Breakdown
                    </h3>
                    <div className="space-y-3">
                        {Object.entries(details).map(([qId, detail]) => (
                            <div key={qId} className="flex justify-between items-center p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                                <div className="flex items-center gap-3">
                                    {detail.score === detail.maxScore ? (
                                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                                    ) : detail.score > 0 ? (
                                        <CheckCircle className="w-5 h-5 text-amber-500" />
                                    ) : (
                                        <XCircle className="w-5 h-5 text-red-500" />
                                    )}
                                    <div>
                                        <div className="font-bold text-slate-700 text-sm">Question {qId.split('_').pop()}</div>
                                        <div className="text-xs text-slate-400">
                                            {detail.score} / {detail.maxScore} Marks
                                        </div>
                                    </div>
                                </div>
                                {!detail.isCorrect && (
                                    <div className="text-xs text-indigo-500 font-medium bg-indigo-50 px-2 py-1 rounded">
                                        Your Answer: {renderMath(detail.userAnswer || '(Empty)')}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default MathsResultPage;
