import React from 'react';
import { Clock } from 'lucide-react';

/**
 * Diagnostic Layout Wrapper
 * Provides consistent structure for all diagnostic tests
 */
const DiagnosticLayout = ({
    title,
    estimatedTime,
    children,
    onSubmit,
    isSubmitting = false,
    subjectColor = 'blue', // 'blue' | 'purple' | 'green'
    submitButtonText = 'Submit'
}) => {
    // Subject-specific color classes
    const colorClasses = {
        blue: {
            badge: 'text-blue-700 bg-blue-100',
            button: 'bg-blue-600 hover:bg-blue-700'
        },
        purple: {
            badge: 'text-purple-700 bg-purple-100',
            button: 'bg-purple-600 hover:bg-purple-700'
        },
        green: {
            badge: 'text-green-700 bg-green-100',
            button: 'bg-green-600 hover:bg-green-700'
        }
    };

    const colors = colorClasses[subjectColor] || colorClasses.blue;

    return (
        <div className="h-full flex flex-col relative">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                {estimatedTime && (
                    <div className={`flex items-center gap-2 ${colors.badge} px-3 py-1 rounded-full`}>
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-medium">Estimated: {estimatedTime}</span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1">
                {children}
            </div>

            {/* Submit Button */}
            {onSubmit && (
                <button
                    onClick={onSubmit}
                    disabled={isSubmitting}
                    className={`w-full mt-6 py-4 ${colors.button} text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl disabled:bg-gray-400 disabled:cursor-not-allowed`}
                >
                    {isSubmitting ? 'Submitting...' : submitButtonText}
                </button>
            )}
        </div>
    );
};

export default DiagnosticLayout;
