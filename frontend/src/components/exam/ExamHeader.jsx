import React from 'react';

const ExamHeader = ({
    title,
    timeLeft,
    onExit,
    onSubmit,
    isSubmitting = false,
    activePart,
    onPartChange,
    availableParts = []
}) => {

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return (
        <div className="bg-white shadow-sm border-b px-6 py-3 flex justify-between items-center z-10 sticky top-0">
            <div className="flex items-center gap-4">
                <button onClick={onExit} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <span className="sr-only">Exit</span>
                    ←
                </button>
                <h2 className="font-bold text-gray-800 truncate max-w-[200px] sm:max-w-md" title={title}>
                    {title}
                </h2>

                {/* Optional Part Tabs */}
                {availableParts.length > 0 && onPartChange && (
                    <div className="flex gap-1 bg-gray-100 p-1 rounded-lg ml-4">
                        {availableParts.map(part => (
                            <button
                                key={part}
                                onClick={() => onPartChange(part)}
                                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${activePart === part
                                    ? "bg-white text-primary shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"
                                    }`}
                            >
                                {part.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex items-center gap-4">
                {/* Timer */}
                <div className={`font-mono text-lg font-bold px-3 py-1 rounded-lg border ${timeLeft < 300 ? "text-red-500 border-red-200 bg-red-50 animate-pulse" : "text-gray-700 border-gray-200"
                    }`}>
                    {formatTime(timeLeft)}
                </div>

                {onSubmit && (
                    <button
                        onClick={onSubmit}
                        disabled={isSubmitting}
                        className="bg-primary text-white px-5 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                        {isSubmitting ? "Submitting..." : "Submit Exam"}
                    </button>
                )}
            </div>
        </div>
    );
};

export default ExamHeader;
