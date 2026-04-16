import { ArrowRight, Sparkles, BookOpen } from 'lucide-react';
import { useAvatar } from '../context/AvatarContext';

const LaunchCard = ({ payload, onLaunch }) => {
    const { activeAgent } = useAvatar();
    // payload = { action: "LAUNCH_MODULE", module: "LEARNING_LAB" | "MATHS_LAB" | "EXAM_ROUTER", params: {...} }
    const { params } = payload;
    const isMock = payload.module === 'EXAM_ROUTER';
    const isMathsLab = payload.module === 'MATHS_LAB';

    // Dynamic Title/Icon/Color based on module type
    const title = isMock
        ? `Mock Exam: ${params.type}`
        : `Deep Dive: ${params.topic?.replace(/_/g, ' ') || 'Topic'}`;

    const description = isMock
        ? "Enter the exam environment for a full simulation."
        : isMathsLab
            ? `Master concepts with ${activeAgent?.name || "Your tutor"}'s step-by-step guidance.`
            : "Interactive practice and visual mastery.";

    const bgGradient = isMathsLab
        ? "from-purple-50 to-white dark:from-purple-950/30 dark:to-black/20"
        : "from-indigo-50 to-white dark:from-indigo-950/30 dark:to-black/20";

    const borderColor = isMathsLab
        ? "border-purple-100 dark:border-purple-500/30"
        : "border-indigo-100 dark:border-indigo-500/30";

    const iconBg = isMathsLab
        ? "bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400"
        : "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400";

    const buttonColor = isMathsLab
        ? "bg-purple-600 hover:bg-purple-700"
        : "bg-indigo-600 hover:bg-indigo-700";

    return (
        <div className={`mt-4 p-5 bg-gradient-to-br ${bgGradient} border ${borderColor} rounded-2xl shadow-sm hover:shadow-md transition-all group`}>
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${iconBg}`}>
                        {isMock ? <BookOpen size={20} /> : <Sparkles size={20} />}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white capitalize">{title}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {isMathsLab ? `Maths Lab • ${activeAgent?.name || "Your tutor"}` : 'Ace it! Learning Module'}
                        </p>
                    </div>
                </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                {description}
            </p>

            <button
                onClick={() => onLaunch(payload)}
                className={`w-full py-2.5 ${buttonColor} text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors`}
            >
                {isMock ? "Start Exam Now" : "Launch Lab"}
                <ArrowRight size={16} />
            </button>
        </div>
    );
};

export default LaunchCard;
