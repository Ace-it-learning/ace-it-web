import React from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '../../utils/cn';

/**
 * Standardized full-screen loading page (Dashboard style)
 * @param {string} title - The main heading to display
 * @param {string} subtext - Supporting description text
 * @param {string} className - Additional CSS classes
 */
const LoadingPage = ({ 
    title = "Preparing your Ace-it experience...", 
    subtext = "Syncing your progress and personalizing your dashboard.",
    className
}) => {
    return (
        <div className={cn(
            "fixed inset-0 flex flex-col items-center justify-center bg-slate-50 z-[9999] p-6 text-center",
            className
        )}>
            <div className="relative mb-8">
                {/* Outer spinning ring */}
                <div className="w-20 h-20 border-4 border-slate-200 border-t-orange-600 rounded-full animate-spin"></div>
                {/* Inner pulsing icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-orange-600/20 animate-pulse" />
                </div>
            </div>
            
            <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">
                {title.split('Ace-it').map((part, i, arr) => (
                    <React.Fragment key={i}>
                        {part}
                        {i < arr.length - 1 && <span className="text-orange-600">Ace-it</span>}
                    </React.Fragment>
                ))}
            </h2>
            {subtext && (
                <p className="text-slate-500 font-medium max-w-xs mx-auto leading-relaxed">
                    {subtext}
                </p>
            )}
        </div>
    );
};

export default LoadingPage;
