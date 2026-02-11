import React from 'react';
import { Clock, Target } from 'lucide-react';

/**
 * Progress Header Component
 * Shows current progress, time remaining, and step indicator
 */
const ProgressHeader = ({
    title,
    subtitle,
    currentStep,
    totalSteps,
    timeRemaining,
    subjectColor = 'blue'
}) => {
    const progress = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;

    // Subject-specific colors
    const colorClasses = {
        blue: 'bg-blue-600',
        purple: 'bg-purple-600',
        green: 'bg-green-600'
    };

    const progressColor = colorClasses[subjectColor] || colorClasses.blue;

    return (
        <div className="mb-6">
            {/* Title and Subtitle */}
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                    {subtitle && (
                        <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
                    )}
                </div>

                {/* Time Remaining */}
                {timeRemaining && (
                    <div className="flex items-center gap-2 text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-medium">{timeRemaining}</span>
                    </div>
                )}
            </div>

            {/* Progress Bar */}
            {totalSteps > 0 && (
                <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                            <Target className="w-4 h-4" />
                            <span>Step {currentStep} of {totalSteps}</span>
                        </div>
                        <span className="text-gray-500">{Math.round(progress)}% Complete</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className={`${progressColor} h-2 rounded-full transition-all duration-300`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProgressHeader;
