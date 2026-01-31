import React from 'react';
import { ArrowRight, Sparkles, BookOpen } from 'lucide-react';

const LaunchCard = ({ payload, onLaunch }) => {
    // payload = { action: "LAUNCH_MODULE", module: "LEARNING_LAB", params: {...} }
    const { params } = payload;
    const isMock = payload.module === 'EXAM_ROUTER';

    // Dynamic Title/Icon based on module type
    const title = isMock ? `Mock Exam: ${params.type}` : `Deep Dive: ${params.topic?.replace(/_/g, ' ') || 'Topic'}`;
    const description = isMock
        ? "Enter the exam environment for a full simulation."
        : "Interactive practice and visual mastery.";

    return (
        <div className="mt-4 p-5 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/30 dark:to-black/20 border border-indigo-100 dark:border-indigo-500/30 rounded-2xl shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg text-indigo-600 dark:text-indigo-400">
                        {isMock ? <BookOpen size={20} /> : <Sparkles size={20} />}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white capitalize">{title}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Ace it! Learning Module</p>
                    </div>
                </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                {description}
            </p>

            <button
                onClick={() => onLaunch(payload)}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
            >
                {isMock ? "Start Exam Now" : "Launch Lab"}
                <ArrowRight size={16} />
            </button>
        </div>
    );
};

export default LaunchCard;
