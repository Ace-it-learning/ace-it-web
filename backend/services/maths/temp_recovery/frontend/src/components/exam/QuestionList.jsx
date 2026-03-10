import React from 'react';

const QuestionList = ({
    questions,
    answers,
    onAnswerChange,
    onSubmit,
    isSubmitting,
    activePart,
    readOnly = false,
    feedbackData = {},
    onQuestionSelect // New prop
}) => {

    if (questions.length === 0) {
        return (
            <div className="text-center py-20 text-gray-400">
                No questions found for this section.
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {questions.map((q, idx) => {
                const qType = q.type || 'unknown';
                const qText = q.question_text || q.question || "Question text missing";
                const qFeeedback = readOnly ? feedbackData[q.id] : null;
                const isCorrect = qFeeedback?.correct;

                // Review Mode Styles
                const cardBorder = readOnly
                    ? (isCorrect ? "border-green-200 bg-green-50/30" : "border-red-200 bg-red-50/30")
                    : "border-gray-200 hover:shadow-md";

                return (
                    <div key={q.id || idx} className={`bg-white p-6 rounded-2xl shadow-sm border transition-shadow ${cardBorder}`}>
                        <div className="flex gap-4">
                            <div className={`shrink-0 size-8 rounded-full flex items-center justify-center font-bold text-sm ${readOnly
                                ? (isCorrect ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")
                                : "bg-gray-100 text-gray-600"
                                }`}>
                                Q{q.order_index}
                            </div>
                            <div className="flex-1 space-y-4">
                                {/* Question Text */}
                                {qType !== 'summary_cloze' && (
                                    <p className="font-medium text-gray-900 text-lg">{qText}</p>
                                )}

                                {/* MC Questions */}
                                {(qType.includes('mc') || qType === 'multiple_choice') && q.options && (
                                    <div className="space-y-2">
                                        {q.options.map((opt, oIdx) => {
                                            const val = String.fromCharCode(65 + oIdx);
                                            const isSelected = answers[q.id] === val;

                                            // Review Logic
                                            let optionClass = "hover:bg-gray-50 border-gray-200"; // Default
                                            if (isSelected) optionClass = "bg-primary/5 border-primary ring-1 ring-primary";

                                            if (readOnly) {
                                                if (val === qFeeedback?.correctAnswer) {
                                                    optionClass = "bg-green-100 border-green-500 ring-1 ring-green-500"; // Correct Answer
                                                } else if (isSelected && !isCorrect) {
                                                    optionClass = "bg-red-100 border-red-500 ring-1 ring-red-500"; // User Wrong Answer
                                                } else {
                                                    optionClass = "opacity-50 border-gray-100"; // Irrelevant options
                                                }
                                            }

                                            return (
                                                <label key={oIdx} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${optionClass}`}>
                                                    <input
                                                        type="radio"
                                                        name={q.id}
                                                        value={val}
                                                        checked={isSelected}
                                                        onChange={() => !readOnly && onAnswerChange(q.id, val)}
                                                        disabled={readOnly}
                                                        className="mt-1"
                                                    />
                                                    <span className="text-gray-700">{opt}</span>
                                                </label>
                                            )
                                        })}
                                    </div>
                                )}

                                {/* Text Input Questions */}
                                {['short_answer', 'wh_question', 'reference', 'inference', 'vocabulary', 'compare_contrast', 'long_answer', 'matching'].some(t => qType === t) && (
                                    <div className="space-y-2">
                                        <textarea
                                            className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-y min-h-[100px] disabled:bg-gray-50 disabled:text-gray-500"
                                            placeholder="Type your answer here..."
                                            value={answers[q.id] || ''}
                                            onChange={(e) => onAnswerChange(q.id, e.target.value)}
                                            disabled={readOnly}
                                        />
                                        {readOnly && !isCorrect && (
                                            <div className="bg-green-50 p-3 rounded-lg border border-green-100 text-sm">
                                                <span className="font-bold text-green-700">Correct Answer:</span>
                                                <p className="text-green-800 mt-1">{qFeeedback?.correctAnswer}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Cloze Questions */}
                                {qType === 'summary_cloze' && (
                                    <div className="leading-loose font-medium text-gray-900">
                                        {qText.split(/_{2,}/).map((part, i, arr) => {
                                            const userVal = (Array.isArray(answers[q.id]) ? answers[q.id][i] : '') || '';
                                            return (
                                                <span key={i}>
                                                    {part}
                                                    {i < arr.length - 1 && (
                                                        <input
                                                            type="text"
                                                            className="border-b-2 border-gray-400 focus:border-blue-600 outline-none px-2 py-0 mx-1 w-32 text-center bg-transparent disabled:border-gray-200 disabled:text-gray-600"
                                                            placeholder={`(${i + 1})`}
                                                            value={userVal}
                                                            onChange={(e) => onAnswerChange(q.id, e.target.value, i)}
                                                            disabled={readOnly}
                                                        />
                                                    )}
                                                </span>
                                            )
                                        })}
                                        {readOnly && (
                                            <div className="mt-4 bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm">
                                                <span className="font-bold text-gray-700">Correct Answers:</span>
                                                <p className="text-gray-800 mt-1">{Array.isArray(qFeeedback?.correctAnswer) ? qFeeedback?.correctAnswer.join(', ') : qFeeedback?.correctAnswer}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* True/False & TFNG Questions */}
                                {['true_false', 'tf', 'true_false_not_given'].includes(qType) && (
                                    <div className="flex flex-wrap gap-4">
                                        {(() => {
                                            // Determine options: Use provided options or defaults based on type
                                            let opts = q.options && q.options.length > 0 ? q.options : null;
                                            if (!opts) {
                                                opts = qType === 'true_false_not_given' ? ['True', 'False', 'Not Given'] : ['True', 'False'];
                                            }
                                            return opts.map(opt => (
                                                <label key={opt} className={`flex items-center space-x-2 cursor-pointer p-3 rounded-lg border transition-all hover:bg-gray-50 ${answers[q.id] === opt ? "bg-blue-50 border-blue-300 ring-1 ring-blue-300" : "border-gray-200"
                                                    } ${readOnly && qFeeedback?.correctAnswer === opt ? "bg-green-100 border-green-500" : ""
                                                    } ${readOnly && answers[q.id] === opt && !isCorrect ? "bg-red-50 border-red-300" : ""
                                                    }`}>
                                                    <input
                                                        type="radio"
                                                        name={q.id}
                                                        checked={answers[q.id] === opt}
                                                        onChange={() => !readOnly && onAnswerChange(q.id, opt)}
                                                        className="size-4 text-blue-600 focus:ring-blue-500"
                                                        disabled={readOnly}
                                                    />
                                                    <span className="text-sm font-medium text-gray-700">{opt}</span>
                                                </label>
                                            ));
                                        })()}
                                    </div>
                                )}

                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{qType.replace(/_/g, ' ')}</span>
                                    <div className="flex items-center gap-2">
                                        {readOnly && q.segment_ref && (
                                            <button
                                                onClick={() => onQuestionSelect && onQuestionSelect(q.segment_ref)}
                                                className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 transition-colors flex items-center gap-1"
                                                title={`Go to ${q.segment_ref}`}
                                            >
                                                <span>🔍</span> Focus Text
                                            </button>
                                        )}
                                        <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">{q.marks} Marks</span>
                                    </div>
                                </div>

                                {/* Explanation Box (Review Only) */}
                                {readOnly && qFeeedback?.logic && (
                                    <div className="mt-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100 text-sm text-indigo-800">
                                        <div className="font-bold mb-1 flex items-center gap-2">
                                            <span>💡 Explanation</span>
                                        </div>
                                        {qFeeedback.logic}
                                    </div>
                                )}

                            </div>
                        </div>
                    </div>
                )
            })}

            {/* Section Complete / Submit Button (Only in Exam Mode) */}
            {!readOnly && onSubmit && (
                <div className="pt-8 pb-20 flex justify-center">
                    <button
                        onClick={onSubmit}
                        disabled={isSubmitting}
                        className="px-8 py-3 bg-gray-900 text-white rounded-xl shadow-lg hover:scale-105 transition-transform font-bold disabled:opacity-50"
                    >
                        {isSubmitting ? "Processing..." : (activePart === 'Part_A' ? "Complete Part A & Continue" : "Finish & Submit Exam")}
                    </button>
                </div>
            )}
        </div>
    );
};

export default QuestionList;
