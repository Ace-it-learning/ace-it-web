import React from 'react';
import { RefreshCcw, ArrowRight, Star } from 'lucide-react';

const NextPathRecommendations = ({ level, topic, lessonMode, onRetry, onExit, onNextLevel, onCrossTrain }) => {

    // Helper to determine next level logic
    const getNextLevel = (current) => {
        if (current === '3') return '4';
        if (current === '4') return '5';
        if (current === '5') return '5*';
        if (current === '5*') return '5**';
        return null;
    };
    const nextLvl = getNextLevel(level);

    // Default handlers if not provided (can be overridden by parent)
    const handleNextLevel = () => {
        if (onNextLevel) return onNextLevel();

        if (nextLvl) {
            const params = new URLSearchParams(window.location.search);
            params.set('level', nextLvl);
            window.location.href = `${window.location.pathname}?${params.toString()}`;
        }
    };

    const handleCrossTrain = () => {
        if (onCrossTrain) return onCrossTrain();

        // Default Cross-Train Logic (Simple Round Robin based on common topics)
        let nextTopic = 'reading_skills'; // Fallback

        // Writing Logic
        if (topic && topic.startsWith('writing_')) {
            if (lessonMode === 'SENTENCE_BUILDER') nextTopic = 'writing_paragraphStructure';
            else if (lessonMode === 'PARAGRAPH_PLANNER') nextTopic = 'writing_development';
            else nextTopic = 'writing_sentenceVariety';
        }
        // Reading Logic
        else if (topic === 'reading_comprehension') nextTopic = 'reading_inference';
        else if (topic === 'reading_inference') nextTopic = 'reading_vocabulary';
        else if (topic && topic.startsWith('reading_')) nextTopic = 'reading_comprehension';

        // Listening Logic
        else if (topic && topic.startsWith('listening_')) nextTopic = 'speaking_pronunciation'; // Cross to Speaking

        // Speaking Logic
        else if (topic && topic.startsWith('speaking_')) nextTopic = 'listening_comprehension'; // Cross to Listening

        window.location.href = `/lab?topic=${nextTopic}&level=${level}`;
    };

    const getCrossTrainLabel = () => {
        if (topic && topic.startsWith('writing_')) return "Cross-Train Writing Mode";
        if (topic && topic.startsWith('reading_')) return "Try A Different Reading Skill";
        if (topic && topic.startsWith('listening_')) return "Switch to Speaking Practice";
        if (topic && topic.startsWith('speaking_')) return "Switch to Listening Practice";
        return "Cross-Train Skill";
    }

    return (
        <div className="mt-16 animate-in slide-in-from-bottom-8 duration-700">
            <h3 className="text-center text-gray-400 font-bold uppercase tracking-widest text-sm mb-8">
                Select Your Next Learning Path
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">

                {/* Option 1: Retry / Strengthen */}
                <button
                    onClick={onRetry}
                    className="group relative bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-2xl p-6 hover:border-gray-400 dark:hover:border-gray-500 transition-all text-left"
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="font-black text-lg">Strengthen Basics</span>
                        <RefreshCcw size={20} className="text-gray-400 group-hover:rotate-180 transition-transform duration-500" />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Retry with a new prompt at Level {level}</p>
                </button>

                {/* Option 2: Level Up (If applicable) */}
                {nextLvl ? (
                    <button
                        onClick={handleNextLevel}
                        className="group relative bg-gray-900 dark:bg-white text-white dark:text-black rounded-2xl p-6 hover:scale-105 transition-all shadow-xl shadow-gray-200 dark:shadow-none text-left"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-black text-lg">Level Up Challenge</span>
                            <ArrowRight size={20} className="text-gray-400 group-hover:text-white dark:group-hover:text-black group-hover:translate-x-1 transition-colors" />
                        </div>
                        <p className="text-sm text-gray-400 dark:text-gray-600 font-medium">Advance to Level {nextLvl}</p>
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Star size={64} />
                        </div>
                    </button>
                ) : (
                    // Fallback if max level: "Mastery Challenge" or similar
                    <div className="rounded-2xl p-6 border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col justify-center opacity-50">
                        <span className="font-black text-gray-400 uppercase tracking-widest text-xs mb-1">Max Level Reached</span>
                        <span className="font-bold text-gray-600 dark:text-gray-400">You are at the top! 🏆</span>
                    </div>
                )}

                {/* Option 3: Related Skill / Mode */}
                <button
                    onClick={handleCrossTrain}
                    className="group relative bg-gray-900 dark:bg-white text-white dark:text-black rounded-2xl p-6 hover:scale-105 transition-all shadow-xl shadow-gray-200 dark:shadow-none text-left"
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="font-black text-lg">Cross-Train</span>
                        <ArrowRight size={20} className="text-gray-400 group-hover:text-white dark:group-hover:text-black group-hover:translate-x-1 transition-colors" />
                    </div>
                    <p className="text-sm text-gray-400 dark:text-gray-600 font-medium">{getCrossTrainLabel()}</p>
                </button>

                {/* Option 4: Exit */}
                <button
                    onClick={onExit}
                    className="md:col-span-3 mt-4 py-4 px-8 rounded-full border-2 border-transparent text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 font-bold text-sm tracking-widest uppercase hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                    Save Progress & Exit
                </button>
            </div>
        </div>
    );
};

export default NextPathRecommendations;
