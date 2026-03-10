import React from 'react';
import { RefreshCcw, ArrowRight, Star } from 'lucide-react';
import { MICRO_SKILLS, getSkillName } from '../../constants/microSkills';

const NextPathRecommendations = ({ level, topic, lessonMode, onRetry, onExit, onNextLevel, onCrossTrain, isWeeklyQuest }) => {

    // Helper to determine next level logic
    const getNextLevel = (current) => {
        const lvl = String(current);
        if (lvl === '3') return '4';
        if (lvl === '4') return '5';
        if (lvl === '5') return '6'; // Map Level 5 -> 5*
        if (lvl === '6' || lvl === '5*') return '7'; // Map Level 5* -> 5**
        return null;
    };
    const nextLvl = getNextLevel(level);

    // Sequence logic for next micro-skill
    const getNextSkill = (currentId) => {
        if (!currentId) return null;
        const prefix = currentId.split('_')[0]; // 'reading', 'writing', 'listening', 'speaking'
        const skillsInPaper = Object.keys(MICRO_SKILLS).filter(id => id.startsWith(prefix));
        const currentIndex = skillsInPaper.indexOf(currentId);

        if (currentIndex !== -1 && currentIndex < skillsInPaper.length - 1) {
            return skillsInPaper[currentIndex + 1];
        }
        return null;
    };
    const nextSkill = getNextSkill(topic);
    const nextSkillName = nextSkill ? getSkillName(nextSkill) : null;

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

        // Navigate to the next skill in the sequence if found
        let targetTopic = nextSkill;

        if (!targetTopic) {
            // Default Fallback Cross-Train Logic (Simple Round Robin based on common topics)
            if (topic && topic.startsWith('writing_')) {
                if (lessonMode === 'SENTENCE_BUILDER') targetTopic = 'writing_paragraphStructure';
                else if (lessonMode === 'PARAGRAPH_PLANNER') targetTopic = 'writing_development';
                else targetTopic = 'writing_sentenceVariety';
            }
            else if (topic === 'reading_comprehension') targetTopic = 'reading_inference';
            else if (topic === 'reading_inference') targetTopic = 'reading_vocabulary';
            else if (topic && topic.startsWith('reading_')) targetTopic = 'reading_comprehension';
            else if (topic && topic.startsWith('listening_')) targetTopic = 'speaking_pronunciation';
            else if (topic && topic.startsWith('speaking_')) targetTopic = 'listening_comprehension';
        }

        if (targetTopic) {
            window.location.href = `/lab?topic=${targetTopic}&level=${level}`;
        } else {
            window.location.href = `/dashboard`;
        }
    };

    const getCrossTrainLabel = () => {
        if (nextSkillName) return `Start next Quest - ${nextSkillName}`;
        if (topic && topic.startsWith('writing_')) return "Cross-Train Writing Mode";
        if (topic && topic.startsWith('reading_')) return "Try A Different Reading Skill";
        if (topic && topic.startsWith('listening_')) return "Switch to Speaking Practice";
        if (topic && topic.startsWith('speaking_')) return "Switch to Listening Practice";
        return "Cross-Train Skill";
    }

    const getCrossTrainSubtext = () => {
        if (nextSkillName) return `Continue with ${nextSkillName}`;
        return "Cross-Train Skill";
    }

    return (
        <div className="mt-16 animate-in slide-in-from-bottom-8 duration-700">
            {!isWeeklyQuest && (
                <>
                    <h3 className="text-center text-gray-400 font-bold uppercase tracking-widest text-sm mb-8">
                        Select Your Next Learning Path
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">

                        {/* Option 1: Retry / Strengthen */}
                        <button
                            onClick={onRetry}
                            className="group relative bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-2xl p-6 hover:border-gray-400 dark:hover:border-gray-500 transition-all text-left"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-black text-lg">Strengthen Basics</span>
                                <RefreshCcw size={20} className="text-gray-400 group-hover:rotate-180 transition-transform duration-500" />
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Retry with a new set of questions at Level {level}</p>
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

                        {/* Option 3: Related Skill / Mode - NEXT QUEST */}
                        <button
                            onClick={handleCrossTrain}
                            className="group relative bg-gray-900 dark:bg-white text-white dark:text-black rounded-2xl p-6 hover:scale-105 transition-all shadow-xl shadow-gray-200 dark:shadow-none text-left"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-black text-lg break-words leading-tight">{getCrossTrainLabel()}</span>
                                <ArrowRight size={20} className="text-gray-400 group-hover:text-white dark:group-hover:text-black group-hover:translate-x-1 transition-colors shrink-0 ml-2" />
                            </div>
                            <p className="text-sm text-gray-400 dark:text-gray-600 font-medium">{getCrossTrainSubtext()}</p>
                        </button>
                    </div>
                </>
            )}

            {/* Option 4: Exit - BRAND ORANGE */}
            <div className="flex justify-center max-w-4xl mx-auto">
                <button
                    onClick={onExit}
                    className="w-full py-6 px-12 rounded-full bg-primary hover:bg-primary/90 text-white font-black text-xl tracking-widest uppercase transition-all shadow-[0_10px_40px_rgba(255,106,0,0.3)] active:scale-95"
                >
                    Save Progress & Exit
                </button>
            </div>
        </div>
    );
};

export default NextPathRecommendations;
